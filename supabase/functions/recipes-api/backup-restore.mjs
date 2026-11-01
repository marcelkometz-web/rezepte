// Restore metadata is validated independently of encryption and never authorizes
// a write. The gateway still verifies the current Garden session and owner role.
export const RESTORE_BODY_LIMIT=8*1024*1024;
export const IMAGE_BYTE_LIMIT=1_048_576;
const uuid=value=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const plain=value=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.getPrototypeOf(value)===Object.prototype;
const fail=()=>{throw Error('input');};
export const titleKey=value=>String(value??'').trim().replace(/\s+/g,' ').toLocaleLowerCase('de-DE');
function sourceId(value){const id=typeof value==='string'&&/^\d{1,16}$/.test(value)?Number(value):value;if(!Number.isSafeInteger(id)||id<1)fail();return id;}
export function backupContext(input,{actor,family}){
 if(!plain(input)||!uuid(actor)||!uuid(family)||input.expectedActor!==actor||input.expectedFamily!==family||!uuid(input.operationId))fail();
 return{actor,family,operationId:input.operationId};
}
export function normalizeRestore(input,{actor,family,validateRecipe}){
 const context=backupContext(input,{actor,family});
 if(input.confirm!==true||input.sourceActor!==actor||input.sourceFamily!==family||!/^[a-f0-9]{32}$/.test(input.expectedSnapshot||''))fail();
 if(!Array.isArray(input.recipes)||input.recipes.length>1000||!Array.isArray(input.notes)||input.notes.length>10000)fail();
 const recipeIds=new Set(),titles=new Set(),noteIds=new Set();
 const recipes=input.recipes.map(value=>{
  if(!plain(value))fail();const id=sourceId(value.sourceId),recipe=validateRecipe(value),key=titleKey(recipe.title);
  if(!key||recipeIds.has(id)||titles.has(key))fail();recipeIds.add(id);titles.add(key);
  if(value.created_at!=null){if(typeof value.created_at!=='string'||!Number.isFinite(Date.parse(value.created_at)))fail();recipe.created_at=value.created_at;}
  return{...recipe,source_id:id};
 });
 const notes=input.notes.map(value=>{
  if(!plain(value))fail();const id=sourceId(value.id);
  if(noteIds.has(id)||typeof value.content!=='string'||!value.content.trim()||value.content.length>30000||typeof value.author!=='string'||!value.author.trim()||value.author.length>80||/^SYSTEM/i.test(value.author.trim())||typeof value.is_done!=='boolean')fail();
  noteIds.add(id);return{source_id:id,content:value.content,author:value.author,is_done:value.is_done};
 });
 return{...context,sourceActor:input.sourceActor,sourceFamily:input.sourceFamily,expectedSnapshot:input.expectedSnapshot,recipes,notes};
}
export function imageUpload(input,context){
 const data=backupContext(input,context);
 if(typeof input.image!=='string'||input.image.length>Math.ceil(IMAGE_BYTE_LIMIT/3)*4||!(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/).test(input.image))fail();
 let binary;try{binary=atob(input.image);}catch{fail();}
 const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));if(bytes.length<12||bytes.length>IMAGE_BYTE_LIMIT)fail();
 let mime,extension;
 if(bytes[0]===255&&bytes[1]===216&&bytes.at(-2)===255&&bytes.at(-1)===217){mime='image/jpeg';extension='jpg';}
 else if([137,80,78,71,13,10,26,10].every((value,index)=>bytes[index]===value)&&bytes.length>=33&&String.fromCharCode(...bytes.slice(12,16))==='IHDR'){
  const view=new DataView(bytes.buffer),width=view.getUint32(16),height=view.getUint32(20);if(!width||!height||width>16384||height>16384||width*height>40_000_000)fail();mime='image/png';extension='png';
 }else if(String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP'&&new DataView(bytes.buffer).getUint32(4,true)===bytes.length-8&&['VP8 ','VP8L','VP8X'].includes(String.fromCharCode(...bytes.slice(12,16)))){mime='image/webp';extension='webp';}
 else fail();
 if(input.mime!==undefined&&input.mime!==mime)fail();return{...data,bytes,mime,extension};
}
export function cleanupInput(input,context){
 const data=backupContext(input,context);
 if(input.paths!==undefined&&(!Array.isArray(input.paths)||input.paths.length>100||input.paths.some(path=>typeof path!=='string'||!/^recipes\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:jpg|png|webp)$/i.test(path))))fail();
 return{...data,paths:input.paths===undefined?null:[...new Set(input.paths)]};
}
