const base = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
let refreshing;

export function tokenStorage() {
  return localStorage.getItem("access_token") ? localStorage : sessionStorage;
}

export function clearSession() {
  for (const storage of [localStorage, sessionStorage]) {
    for (const key of ["access_token", "refresh_token", "user"]) {
      storage.removeItem(key);
    }
  }
}

export function saveSession(response, remember = false) {
  clearSession();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem("access_token", response.tokens.access);
  storage.setItem("refresh_token", response.tokens.refresh);
  storage.setItem("user", JSON.stringify(response.user));
}

export function report(error) {
  window.dispatchEvent(
    new CustomEvent("api-message", {
      detail: { error: true, message: error.message || String(error) },
    })
  );
}

export function success(message) {
  window.dispatchEvent(new CustomEvent("api-message", { detail: { message } }));
}

export async function perform(action) {
  try {
    return await action();
  } catch (error) {
    report(error);
    return undefined;
  }
}

function errorMessage(data) {
  if (typeof data === "string") return data;
  return Object.entries(data || {})
    .map(
      ([key, val]) =>
        (key === "detail" || key === "non_field_errors" ? "" : key + " : ") +
        (Array.isArray(val)
          ? val.join(" ")
          : typeof val === "object"
          ? errorMessage(val)
          : String(val))
    )
    .join("\n");
}

async function refresh() {
  const storage = tokenStorage();
  const token = storage.getItem("refresh_token");
  if (!token) throw Error("Votre session a expiré. Reconnectez-vous.");
  const response = await fetch(base + "/users/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: token }),
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json();
  if (!response.ok) throw Error(errorMessage(data));
  storage.setItem("access_token", data.access);
  if (data.refresh) storage.setItem("refresh_token", data.refresh);
}

export async function api(path, options = {}, retry = true) {
  const { blob, ...config } = options;
  const token = tokenStorage().getItem("access_token");
  const lang =
    (typeof localStorage !== "undefined" &&
      localStorage.getItem("jobconnect_language")) ||
    (typeof document !== "undefined" ? document.documentElement.lang : "fr") ||
    "fr";

  const headers = {
    "Accept-Language": lang,
    ...config.headers,
  };

  if (token) headers.Authorization = "Bearer " + token;
  if (config.body && !(config.body instanceof FormData)) {
    if (typeof config.body === "object" && (config.body.nativeEvent || config.body.target || config.body.nodeType || config.body.stateNode)) {
      config.body = {};
    }
    headers["Content-Type"] = "application/json";
    config.body = JSON.stringify(config.body);
  }

  let response;
  try {
    response = await fetch(base + path, {
      ...config,
      headers,
      signal: AbortSignal.timeout(60000),
    });
  } catch {
    throw Error(
      "Impossible de joindre le serveur. Vérifiez que le backend est démarré."
    );
  }

  if (
    response.status === 401 &&
    token &&
    retry &&
    !path.includes("/users/login") &&
    !path.includes("/users/register")
  ) {
    try {
      refreshing ||= refresh().finally(() => {
        refreshing = null;
      });
      await refreshing;
      return api(path, options, false);
    } catch (error) {
      clearSession();
      window.dispatchEvent(new Event("session-expired"));
      throw error;
    }
  }

  if (!response.ok) {
    let data;
    try {
      data = await response.json();
    } catch {
      data = { detail: "Erreur du serveur (" + response.status + ")." };
    }
    if (data.code === "maintenance") {
      window.dispatchEvent(new Event("platform-settings-changed"));
    }
    throw Error(errorMessage(data));
  }

  if (blob) return response.blob();
  if (response.status === 204) return null;
  return response.json();
}

export const post = (path, body) => api(path, { method: "POST", body });
export const patch = (path, body) => api(path, { method: "PATCH", body });
export const remove = (path) => api(path, { method: "DELETE" });

export async function download(kind, id, name) {
  let path = kind.startsWith("/") ? kind : "/fichiers/" + kind + "/" + id + "/";
  if (path.startsWith("/api/")) path = path.slice(4);
  const blob = await api(path, { blob: true });
  downloadBlob(blob, name || (kind.startsWith("/") ? id : null) || "document");
}

export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function previewBlob(blob) {
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export async function preview(path) {
  const tab = window.open("", "_blank");
  if (tab) tab.opener = null;
  try {
    const blob = await api(path, { blob: true });
    const url = URL.createObjectURL(blob);
    if (tab) tab.location.href = url;
    else window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (error) {
    tab?.close();
    throw error;
  }
}

export function downloadText(text, name) {
  downloadBlob(
    new Blob([text], { type: "text/plain;charset=utf-8" }),
    name
  );
}
