import { Button, Textarea } from "../ui";
import React, { useState } from "react";
import { post, perform, downloadText } from "../../services/api";
export default function AIResult({result,tool,context,onClose}) {
 const [conversation,setConversation]=useState([{role:"assistant",content:result}]);
 const [reply,setReply]=useState("");
 const [loading,setLoading]=useState(false);
 const send=()=>perform(async()=>{if(!reply.trim())return;setLoading(true);try{const next=[...conversation,{role:"user",content:reply}];const response=await post("/ia/"+tool+"/",{...context,texte:reply,historique:next});setConversation([...next,{role:"assistant",content:response.resultat}]);setReply("");}finally{setLoading(false);}});
 return <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"><section className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b p-5"><h2 className="font-black text-slate-900">Assistant JobConnect</h2><Button onClick={onClose} className="font-bold text-slate-500">Fermer</Button></div><div className="overflow-y-auto p-6">{conversation.map((m,i)=><div key={i} className={"mb-5 whitespace-pre-wrap rounded-2xl p-4 text-sm leading-7 "+(m.role==="user"?"bg-blue-50 text-blue-900":"bg-slate-50 text-slate-700")}>{m.content}</div>)}</div><div className="border-t p-5"><Button onClick={()=>downloadText(conversation.map(m=>m.content).join("\n\n"),"jobconnect-"+tool+".txt")} className="mb-4 text-sm font-bold text-blue-600">Télécharger</Button>{tool==="simulation-entretien"&&<div className="flex gap-3"><Textarea aria-label="Votre réponse" value={reply} onChange={e=>setReply(e.target.value)} className="flex-1 rounded-xl border p-3"/><Button disabled={loading} onClick={send} className="rounded-xl bg-blue-600 px-5 text-white">{loading?"En cours…":"Répondre"}</Button></div>}</div></section></div>;
}
