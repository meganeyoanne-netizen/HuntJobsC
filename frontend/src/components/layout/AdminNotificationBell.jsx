import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Check, RefreshCw } from "lucide-react";
import { api, patch, post } from "../../services/api";
import { Button, IconButton } from "../ui";
import FloatingPanel from "../common/FloatingPanel";

export default function AdminNotificationBell({ onNavigate }) {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try { setNotifications(await api("/notifications/")); setError(""); }
    catch (error) { setError(error.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    window.addEventListener("notifications-changed", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); window.removeEventListener("notifications-changed", refresh); };
  }, [refresh]);
  const unread = notifications.filter(item => !item.is_read);
  const readAll = async () => {
    await post("/notifications/read_all/", {});
    await refresh();
    window.dispatchEvent(new Event("notifications-changed"));
  };
  const visit = async item => {
    await patch("/notifications/" + item.id + "/", { is_read: true });
    setNotifications(items => items.map(value => value.id === item.id ? { ...value, is_read: true } : value));
    window.dispatchEvent(new Event("notifications-changed"));
    setOpen(false);
    onNavigate(item.destination || "admin-notifications", item.resource_id);
  };
  return <div ref={anchorRef}>
    <IconButton label={unread.length + " nouvelles notifications administrateur"} aria-expanded={open} className="shell-notification" onClick={() => { setOpen(value => !value); refresh(); }}>
      <Bell size={21} />
      {unread.length > 0 && <span className="absolute -right-2 -top-2 flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">{unread.length}</span>}
    </IconButton>
    {open && <FloatingPanel anchorRef={anchorRef} onClose={() => setOpen(false)} label="Nouvelles notifications administrateur" width={400}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-3"><h2 className="font-bold text-slate-900">Nouvelles notifications ({unread.length})</h2><IconButton label="Actualiser" onClick={refresh}><RefreshCw size={16} /></IconButton></div>
      {error ? <p role="alert" className="p-3 text-sm text-red-600">{error}</p> : loading ? <p className="p-4 text-sm">Chargement…</p> : unread.length === 0 ? <p className="p-4 text-sm text-slate-500">Vous êtes à jour, aucune nouvelle notification.</p> : <div className="max-h-[55dvh] overflow-y-auto overscroll-contain">
        {unread.map(item => <Button key={item.id} onClick={() => visit(item)} className="block w-full border-b border-slate-100 p-3 text-left hover:bg-blue-50"><strong className="block text-sm text-slate-900">{item.titre}</strong><span className="mt-1 block text-sm text-slate-600">{item.message}</span><time className="mt-2 block text-xs text-slate-400">{new Date(item.created_at).toLocaleString("fr-FR")}</time></Button>)}
      </div>}
      <div className="flex flex-wrap justify-between gap-2 p-3">{unread.length > 0 && <Button onClick={readAll} className="text-xs text-blue-600"><Check size={14} /> Tout marquer comme lu</Button>}<Button onClick={() => { setOpen(false); onNavigate("admin-notifications"); }} className="text-xs font-semibold text-blue-600">Voir toutes les notifications</Button></div>
    </FloatingPanel>}
  </div>;
}
