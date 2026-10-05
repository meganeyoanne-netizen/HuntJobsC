import { useCallback, useContext, useEffect, useId, useState, useRef } from "react";
import { api, report } from "../services/api";
import { ResourceTracking } from "../components/common/ResourceBoundary";
export const identity = (value) => value;
export function useResource(path, mapper = identity, initial = []) {
  const [data,setData]=useState(initial);const [loading,setLoading]=useState(true);const [error,setError]=useState(null);
  const mapperRef=useRef(mapper);mapperRef.current=mapper;
  const [version,setVersion]=useState(0);const reload=useCallback(()=>setVersion(v=>v+1),[]);
  const tracker=useContext(ResourceTracking);const update=tracker?.update,remove=tracker?.remove;const id=useId();
  useEffect(()=>{
    let active=true;setLoading(true);setError(null);update?.(id,{loading:true,reload});
    api(path).then(result=>{if(active){setData(mapperRef.current(result));update?.(id,{loading:false,reload});}})
    .catch(err=>{if(active){setError(err);report(err);update?.(id,{loading:false,error:err,reload});}})
    .finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;remove?.(id);};
  },[path,version,id,update,remove,reload]);
  return [data,setData,reload,loading,error];
}
