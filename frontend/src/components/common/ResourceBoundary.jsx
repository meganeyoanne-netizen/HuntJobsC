import React,{createContext,useCallback,useContext,useState} from "react";
import { ErrorState } from "../ui";
import PageLoading from "../ui/PageLoading";
export const ResourceTracking=createContext(null);
export default function ResourceBoundary({children,page}){
 const [requests,setRequests]=useState({});
 const update=useCallback((id,state)=>setRequests(previous=>({...previous,[id]:state})),[]);
 const remove=useCallback(id=>setRequests(previous=>{const next={...previous};delete next[id];return next;}),[]);
 const entries=Object.values(requests);const loading=entries.some(entry=>entry.loading);const failed=entries.find(entry=>entry.error);
 return <ResourceTracking.Provider value={{update,remove}}>{loading?<PageLoading page={page}/>:failed?<ErrorState error={failed.error} reload={failed.reload}/>:null}<div style={{display:loading||failed?"none":undefined}} aria-hidden={loading||failed?true:undefined}>{children}</div></ResourceTracking.Provider>;
}
