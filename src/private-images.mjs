// URLs only live in this controller's memory and are revoked on every reset.
// Promise-based cache hits also let callers attach a newly rendered node first.
export function createPrivateImageCache({fetchBlob,createURL=blob=>URL.createObjectURL(blob),revokeURL=url=>URL.revokeObjectURL(url)}){
 const urls=new Map(),pending=new Map();let generation=0;
 function load(path){
  if(urls.has(path))return Promise.resolve(urls.get(path));
  if(pending.has(path))return pending.get(path);
  const current=generation;
  const request=Promise.resolve().then(()=>current===generation?fetchBlob(path):null).then(blob=>{
   if(current!==generation)return null;
   const url=createURL(blob);urls.set(path,url);return url;
  }).finally(()=>{if(pending.get(path)===request)pending.delete(path);});
  pending.set(path,request);return request;
 }
 function clear(){generation++;for(const url of urls.values())revokeURL(url);urls.clear();pending.clear();}
 return{load,clear};
}
