import { Button } from "../components/ui";
import InterviewActions from "../components/common/InterviewActions";
import MessagesPanel from "../components/common/MessagesPanel";

import { useResource } from "../hooks/useResource";
import { notificationsAdapter } from "../services/adapters";
import { patch, post, perform } from "../services/api";
export default function NotificationsPage({ user,onNavigate }) {
  const [notifications,,reload]=useResource("/notifications/",notificationsAdapter);
  const [interviews,,reloadInterviews]=useResource("/entretiens/",v=>v);
  return <main className="min-h-screen bg-slate-50 p-6 sm:p-10"><Button onClick={()=>onNavigate(user.role+"-dashboard")} className="font-bold text-blue-600">Retour au tableau de bord</Button><div className="mx-auto mt-8 max-w-3xl"><MessagesPanel/><section className="my-8"><h2 className="text-xl font-black">Mes entretiens</h2>{interviews.map(i=><article key={i.id} className="mt-3 rounded-xl border bg-white p-4"><p className="font-bold">{i.offre_titre} — {i.statut_label}</p><p>{new Date(i.date).toLocaleString("fr-FR")} · {i.duree} min</p><p>{i.message}</p><p>{i.lieu}</p>{i.lien_visio&&<a className="text-blue-600" href={i.lien_visio} target="_blank" rel="noreferrer">Rejoindre la visioconférence</a>}{user.role==="recruiter"&&<InterviewActions interview={i} onSaved={reloadInterviews}/>}</article>)}</section><h1 className="text-2xl font-black text-slate-900">Mes notifications</h1><Button className="my-5 rounded-xl bg-blue-600 px-4 py-3 text-white" onClick={()=>perform(async()=>{await post("/notifications/read_all/",{});reload();})}>Tout marquer comme lu</Button>{notifications.length===0&&<p className="text-slate-500">Aucune notification.</p>}{notifications.map(n=><article key={n.id} className="mb-4 rounded-2xl border bg-white p-5"><h2 className="font-bold">{n.title}</h2><p className="mt-2 text-slate-600">{n.message}</p><p className="mt-2 text-xs text-slate-400">{n.date}</p><Button className="mt-4 font-bold text-blue-600" onClick={()=>perform(async()=>{await patch("/notifications/"+n.id+"/",{is_read:true});if(n.destination)onNavigate(n.destination,n.resource_id);else reload();})}>{n.is_read?"Consulter":"Lire et consulter"}</Button></article>)}</div></main>;
}
