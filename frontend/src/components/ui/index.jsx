import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { LoaderCircle, Inbox, AlertCircle } from "lucide-react";
import { report } from "../../services/api";
export { default as FormField } from "./FormField";
const FormState = createContext(false);
export function Button({children, onClick, loading=false, disabled=false, className="", type="button", variant, ...props}) {
  const [pending,setPending]=useState(false); const busy=useRef(false); const formPending=useContext(FormState);
  const active=loading||pending||formPending;
  async function click(event) {
    if(busy.current||disabled||active){event.preventDefault();return;}
    if(!onClick)return;
    busy.current=true;
    try {const result=onClick(event); if(result && typeof result.then==="function"){setPending(true);await result;}}
    catch(error){report(error);}finally{busy.current=false;setPending(false);}
  }
  return <button {...props} type={type} className={"ui-button "+(variant?"ui-button-"+variant+" ":"")+className} disabled={disabled||active} aria-busy={active||undefined} onClick={click}>{active && <LoaderCircle className="ui-spinner" size={18} aria-hidden="true"/>}{children}</button>;
}
export function Form({onSubmit,children,...props}) {
  const [pending,setPending]=useState(false);const busy=useRef(false);
  async function submit(event){event.preventDefault();if(busy.current)return;busy.current=true;setPending(true);try{await onSubmit?.(event);}catch(error){report(error);}finally{busy.current=false;setPending(false);}}
  return <FormState.Provider value={pending}><form {...props} onSubmit={submit} aria-busy={pending||undefined}>{children}</form></FormState.Provider>;
}
export function Card({children,className="",...props}){return <section {...props} className={"ui-card "+className}>{children}</section>;}
export function Badge({children,tone="blue",className="",...props}){return <span {...props} className={"ui-badge ui-tone-"+tone+" "+className}>{children}</span>;}
export function StatusBadge({status,children}) {
 const text=String(status||children||"Brouillon");
 const key=text.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
 const tone=/rejete|refuse|suspendu|annule/.test(key)?"red":/attente|pending|expire/.test(key)?"amber":/entretien|interview/.test(key)?"violet":/brouillon|draft|inactif|archive/.test(key)?"slate":/publie|selectionne|accepte|valide|actif|active/.test(key)?"emerald":"blue";
 return <Badge tone={tone}>{text}</Badge>;
}
export function ProgressBar({value=0,max=100,label="Progression",className=""}) {
 const safeMax=Number.isFinite(Number(max))&&Number(max)>0?Number(max):100;
 const safeValue=Math.min(safeMax,Math.max(0,Number(value)||0));
 return <div className={"ui-progress-track "+className} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={safeMax} aria-valuenow={safeValue}><div style={{width:`${safeValue/safeMax*100}%`}} /></div>;
}
export function PageHeader({title,description,eyebrow,children}) {
 return <header className="ui-page-header"><div>{eyebrow&&<p className="ui-eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description&&<p>{description}</p>}</div>{children&&<div className="ui-header-actions">{children}</div>}</header>;
}
export function SectionHeader({title,description,children,action,onClick,eyebrow="JobConnect"}) {
 return <div className="ui-section-header"><div>{eyebrow&&<p className="ui-eyebrow">{eyebrow}</p>}<h2>{title}</h2>{description&&<p>{description}</p>}</div>{children|| (action&&<Button onClick={onClick} className="text-sm font-semibold text-blue-600 hover:text-blue-700">{action}</Button>)}</div>;
}
export function Avatar({name="",size=40,src}){const [failedSrc,setFailedSrc]=useState(null);if(src && failedSrc!==src)return <img src={src} alt={name} className="ui-avatar" style={{width:size,height:size,objectFit:"cover"}} onError={()=>setFailedSrc(src)}/>;return <span className="ui-avatar" style={{width:size,height:size}} aria-label={name}>{name.trim().split(/\s+/).map(p=>p[0]).slice(0,2).join("").toUpperCase()||"HJ"}</span>;}
export function EmptyState({title="Aucun résultat",description="Vos éléments apparaîtront ici dès qu’ils seront disponibles.",children,icon:Icon=Inbox}){return <div className="ui-empty"><span className="ui-empty-icon"><Icon size={28} aria-hidden="true"/></span><h3>{title}</h3><p>{description}</p>{children}</div>;}
export function Skeleton({className="",style}){return <div className={"ui-skeleton "+className} style={style} aria-hidden="true"/>;}
export function PageSkeleton(){return <div className="ui-page-skeleton" role="status" aria-label="Chargement des données"><Skeleton className="ui-skeleton-heading"/><Skeleton className="ui-skeleton-subtitle"/><div className="ui-skeleton-stats">{[0,1,2,3].map(i=><Skeleton key={i} className="ui-skeleton-stat"/>)}</div><Skeleton className="ui-skeleton-body"/><span className="sr-only">Chargement en cours…</span></div>;}
export function ErrorState({error,reload}){return <EmptyState icon={AlertCircle} title="Impossible de charger les données" description={error?.message||"Veuillez réessayer dans quelques instants."}><Button onClick={reload} className="bg-blue-600 text-white px-5 py-3 rounded-xl">Réessayer</Button></EmptyState>;}
export function ModalFrame({children,onClose,className="",...props}){
 const ref=useRef(null),closeRef=useRef(onClose);const[label,setLabel]=useState(props["aria-label"]||"Fenêtre de dialogue");
 useEffect(()=>{closeRef.current=onClose;},[onClose]);
 useEffect(()=>{
  const previous=document.activeElement,oldOverflow=document.body.style.overflow;document.body.style.overflow="hidden";
  const heading=ref.current?.querySelector("h1,h2,h3");if(!props["aria-label"]&&heading?.textContent)setLabel(heading.textContent);
  const isolated=[];for(let ancestor=ref.current;ancestor&&ancestor!==document.body;ancestor=ancestor.parentElement){for(const sibling of ancestor.parentElement?.children||[]){if(sibling!==ancestor){isolated.push([sibling,sibling.inert]);sibling.inert=true;}}}
  const focusables=()=>Array.from(ref.current?.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')||[]).filter(el=>el.getClientRects().length);
  (ref.current?.querySelector('.shell-close,[data-autofocus]')||focusables().find(el=>el.getAttribute("aria-label")==="Fermer")||focusables()[0]||ref.current)?.focus();
  const key=event=>{if(event.key==="Escape"){event.preventDefault();closeRef.current?.();}if(event.key==="Tab"){const list=focusables();if(!list.length){event.preventDefault();return;}const first=list[0],last=list[list.length-1];if(event.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}};
  document.addEventListener("keydown",key);return()=>{isolated.forEach(([element,inert])=>{element.inert=inert;});document.body.style.overflow=oldOverflow;document.removeEventListener("keydown",key);previous?.focus();};
 },[]);
 return <div {...props} ref={ref} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} className={"ui-modal-frame "+className}>{children}</div>;
}
export function IconButton({label,children,...props}){return <Button {...props} aria-label={label} title={label}>{children}</Button>;}
export function Input(props){return <input {...props} className={"ui-input "+(props.className||"")}/>;}
export function Textarea(props){return <textarea {...props} className={"ui-input "+(props.className||"")}/>;}
export function Select(props){return <select {...props} className={"ui-input "+(props.className||"")}/>;}
export function StatCard({label,title,value,icon:Icon,description,detail,helper,tone,color,onClick,gradient,iconClass}){
 const intent=tone||color||(gradient?.includes("violet")?"violet":gradient?.includes("emerald")?"emerald":"blue");
 const icon=React.isValidElement(Icon)?Icon:Icon?React.createElement(Icon,{size:22,"aria-hidden":true}):null;
 const content=<><div className={"ui-stat-icon ui-tone-"+(intent==="orange"?"amber":intent)}>{icon}</div><p>{label||title}</p><strong>{value}</strong>{(description||detail||helper)&&<small>{description||detail||helper}</small>}</>;
 return onClick?<Button onClick={onClick} className="ui-card ui-stat ui-stat-action">{content}</Button>:<Card className="ui-stat">{content}</Card>;
}
export function Tabs({items,value,onChange,label="Onglets"}){return <div className="ui-tabs" role="tablist" aria-label={label}>{items.map(item=><Button key={item.value} role="tab" aria-selected={value===item.value} onClick={()=>onChange(item.value)} className={value===item.value?"ui-tab-active":""}>{item.label}</Button>)}</div>;}
