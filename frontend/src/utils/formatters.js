/**
 * Localization formatters for dates, numbers, and currency (FCFA / XAF)
 */

export function formatCurrency(amount, lang = "fr", currency = "FCFA") {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return "";
  }
  const numeric = Number(amount);
  const locale = lang === "en" ? "en-US" : "fr-FR";

  try {
    const formatted = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(numeric);

    return `${formatted} ${currency}`;
  } catch {
    return `${numeric} ${currency}`;
  }
}

export function formatNumber(number, lang = "fr") {
  if (number === undefined || number === null || isNaN(Number(number))) {
    return "0";
  }
  const locale = lang === "en" ? "en-US" : "fr-FR";
  return new Intl.NumberFormat(locale).format(Number(number));
}

export function formatDate(dateInput, lang = "fr", options = {}) {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" || typeof dateInput === "number" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return String(dateInput);

  const locale = lang === "en" ? "en-US" : "fr-FR";
  const defaultOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  };

  try {
    return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

export function formatRelativeTime(dateInput, lang = "fr") {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return lang === "en" ? "just now" : "à l'instant";
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return lang === "en" ? `${diffInMinutes}m ago` : `il y a ${diffInMinutes} min`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return lang === "en" ? `${diffInHours}h ago` : `il y a ${diffInHours} h`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return lang === "en" ? `${diffInDays}d ago` : `il y a ${diffInDays} j`;
  }
  return formatDate(date, lang);
}
