import { Select, Form, Textarea, Button } from "../ui";
import React,{useState} from "react";
import {useResource} from "../../hooks/useResource";
import {post,perform} from "../../services/api";
export default function MessagesPanel(){
 const [apps]=useResource("/candidatures/",v=>v);
 const [messages,,reload]=useResource("/messages/",v=>v);
 const [selected,setSelected]=useState("");const [text,setText]=useState("");
 return <section className="mt-8 rounded-2xl border bg-white p-5"><h2 className="text-xl font-black">Messagerie des candidatures</h2><Select className="my-4 w-full rounded-xl border p-3" value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Choisir une candidature</option>{apps.map(a=><option key={a.id} value={a.id}>{a.offre_detail?.titre} — {a.candidat_detail?.first_name||"Ma candidature"} #{a.id}</option>)}</Select>{selected&&<><div className="max-h-80 overflow-auto">{messages.filter(m=>String(m.candidature)===selected).map(m=><article key={m.id} className="my-2 rounded-xl bg-slate-50 p-3"><p className="whitespace-pre-wrap">{m.contenu}</p><time className="text-xs text-slate-400">{new Date(m.created_at).toLocaleString("fr-FR")}</time>{m.lien_visio&&<a href={m.lien_visio} target="_blank" rel="noreferrer" className="block text-blue-600">Rejoindre la visioconférence</a>}</article>)}</div><Form onSubmit={e=>{e.preventDefault();perform(async()=>{await post("/messages/",{candidature:Number(selected),contenu:text});setText("");reload();});}}><Textarea required maxLength={10000} value={text} onChange={e=>setText(e.target.value)} className="mt-4 w-full rounded-xl border p-3" placeholder="Votre message"/><Button className="mt-2 rounded-xl bg-blue-600 px-4 py-3 text-white">Envoyer</Button></Form></>}</section>;
}
