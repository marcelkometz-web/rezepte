const endpoint='https://kzxzhpebugvzyqfjqedx.supabase.co/functions/v1/recipes-daily';
const apiKey='sb_publishable_8-MkCdXRxN-GagE0g4GYrQ_TY3I6RmD';
const element=(tag,value,className)=>{const node=document.createElement(tag);if(value!==undefined)node.textContent=value;if(className)node.className=className;return node;};
const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
export function normalizeHarvestResponse(result){
 const fail=()=>{throw new Error('Die Rezeptantwort konnte nicht geprüft werden.');};
 if(!result||!Array.isArray(result.recipes)||result.recipes.length>2)fail();
 const recipes=result.recipes.map(recipe=>{
  if(!/^\d{1,18}$/.test(String(recipe?.id))||typeof recipe.title!=='string'||!recipe.title.trim()||recipe.title.length>500)fail();
  const matches=recipe.harvestMatches??[];
  if(!Array.isArray(matches)||matches.length>50||matches.some(item=>typeof item?.ingredient!=='string'||!item.ingredient.trim()||item.ingredient.length>60||!validDate(item.harvested_on)))fail();
  return{id:String(recipe.id),title:recipe.title,harvestMatches:matches.map(item=>({ingredient:item.ingredient,harvested_on:item.harvested_on}))};
 });
 const basis=result.basis;
 if(basis!==undefined&&(!basis||!['recorded_harvest','daily_rotation'].includes(basis.type)||!validDate(basis.asOf)||!Number.isSafeInteger(basis.harvestCount)||basis.harvestCount<0||basis.harvestCount>500||typeof basis.note!=='string'||basis.note.length>1500))fail();
 return{recipes,basis:basis?{type:basis.type,asOf:basis.asOf,harvestCount:basis.harvestCount,note:basis.note}:null};
}
export function harvestDailyPanel({client,onRecipe,onError,isActive=()=>true}){
 const node=element('section',undefined,'card harvest-daily');node.setAttribute('aria-label','Rezeptideen aus eurer Ernte');
 let epoch=0,data=null,lastLoaded=0,pending=false,controller=null;
 const active=()=>isActive()&&!document.hidden&&globalThis.unserZuhauseHidden!==true;
 function render(error=''){
  node.replaceChildren(element('h2','🌱 Eure Ernte auf dem Teller'));
  if(error)node.append(element('p',error,'hint'));
  if(data){
   node.append(element('p',data.basis?.note||'Diese Rezeptideen stammen aus eurer Rezeptsammlung.','hint'));
   for(const recipe of data.recipes){
    const card=element('article',undefined,'card'),button=element('button',recipe.title,'button secondary');button.type='button';button.addEventListener('click',()=>{if(isActive())onRecipe?.(String(recipe.id));});card.append(button);
    if(recipe.harvestMatches?.length)card.append(element('p','Passt zu euren Einträgen: '+recipe.harvestMatches.map(item=>`${item.ingredient} (geerntet eingetragen am ${new Date(item.harvested_on+'T12:00:00').toLocaleDateString('de-DE')})`).join(', '),'hint'));
    node.append(card);
   }
   node.append(element('p','Geprüft am '+new Date(lastLoaded).toLocaleString('de-DE')+'. Es werden keine Vorratsmengen oder Haltbarkeit angenommen.','hint'));
  }else if(!error)node.append(element('p','Eure eingetragenen Ernten werden geprüft …','hint'));
  const refresh=element('button',pending?'Wird geprüft …':'Ernteideen aktualisieren','text-button');refresh.type='button';refresh.disabled=pending;refresh.addEventListener('click',()=>load({force:true}));node.append(refresh);
 }
 async function load({force=false}={}){
  if(!active()||pending)return;
  if(!force&&data&&Date.now()-lastLoaded<60000){render();return;}
  const revision=epoch;let loadError='';pending=true;controller=new AbortController();render();
  try{
   const source=typeof client==='function'?client():client,{data:{session},error}=await source.auth.getSession();
   if(error||!session?.access_token)throw new Error('Bitte melde dich erneut an.');
   if(revision!==epoch||!active())return;
   const date=new Date().toLocaleDateString('en-CA'),response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',apikey:apiKey,Authorization:'Bearer '+session.access_token},body:JSON.stringify({date}),cache:'no-store',signal:AbortSignal.any([controller.signal,AbortSignal.timeout(20000)])});
   if(!response.ok)throw new Error('Die Ernteideen sind gerade nicht erreichbar.');
   const result=normalizeHarvestResponse(await response.json());
   if(revision!==epoch||!active())return;
   data=result;lastLoaded=Date.now();
  }catch(error){if(revision===epoch&&active()){loadError=error.name==='AbortError'?'Die Ernteprüfung wurde unterbrochen.':error.message;onError?.(error);}}
  finally{if(revision===epoch){pending=false;controller=null;if(active())render(loadError);}}
 }
 function clear(){++epoch;controller?.abort();controller=null;pending=false;data=null;lastLoaded=0;node.replaceChildren();}
 render();return{node,load,clear};
}
