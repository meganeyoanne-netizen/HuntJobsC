import React,{useState,useEffect} from "react";
import { CheckCircle2,AlertCircle,X } from "lucide-react";
import { Button,PageSkeleton,ErrorState } from "../ui";
export default function ApiFeedback(){
 const [messages,setMessages]=useState([]);
 useEffect(()=>{const timers=new Set();const show=event=>{const message={...event.detail,id:crypto.randomUUID()};setMessages(current=>[...current,message].slice(-3));const timer=setTimeout(()=>{setMessages(current=>current.filter(item=>item.id!==message.id));timers.delete(timer);},message.error?12000:6000);timers.add(timer);};window.addEventListener("api-message",show);return()=>{window.removeEventListener("api-message",show);timers.forEach(clearTimeout);};},[]);
 return <div className="ui-toasts" aria-live="polite">{messages.map(message=><div key={message.id} role={message.error?"alert":"status"} className={"ui-toast "+(message.error?"is-error":"")}><span>{message.error?<AlertCircle size={21}/>:<CheckCircle2 size={21}/>}</span><p>{message.message}</p><Button aria-label="Fermer la notification" onClick={()=>setMessages(current=>current.filter(item=>item.id!==message.id))}><X size={18}/></Button></div>)}</div>;
}
export function LoadingPanel({error,reload}){return error?<ErrorState error={error} reload={reload}/>:<PageSkeleton/>;}
