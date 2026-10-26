import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
import garden from './garden-config.json' with { type: 'json' };
const FAMILY='936a916b-e153-45fb-8528-76e20d1d508d';
let key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
try{key=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default||key;}catch{}
const db=createClient(Deno.env.get('SUPABASE_URL')!,key,{auth:{persistSession:false,autoRefreshToken:false}});
const base={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'};
const fields=['recipes','title','ingredients','prep','description','category','calories','image','emoji','airfryer','kcal','prot','kh','fat','stove_step','airfryer_step','oven_step','doc_check','zutaten_liste','tipps','sugar','sat_fat','fiber','salt','has_side','score','image_url'];
const numbers=new Set(['kcal','prot','kh','fat','sugar','sat_fat','fiber','salt','calories']);
const booleans=new Set(['airfryer','has_side']);
const imagePath=(s:unknown)=>typeof s==='string'&&s.length<160&&/^[a-zA-Z0-9_/-]+\.(?:jpg|jpeg|png|webp)$/.test(s)&&!s.includes('..');
function validate(value:any){
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('input');
 const out:Record<string,unknown>={};
 for(const f of fields){if(value[f]===undefined)continue;const v=value[f];
 if(v===null){out[f]=null;continue;}
 if(numbers.has(f)){if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>100000)throw Error('input');}
 else if(booleans.has(f)){if(typeof v!=='boolean')throw Error('input');}
 else if(typeof v!=='string'||v.length>(f==='title'?300:30000))throw Error('input');
 out[f]=v;}
 if(typeof out.title!=='string'||!out.title.trim())throw Error('input');
 if(out.image_url&&!imagePath(out.image_url))throw Error('input');
 return out;
}
async function limited(req:Request){
 if(Number(req.headers.get('content-length'))>2_000_000)throw Error('input');
 const reader=req.body?.getReader();if(!reader)throw Error('input');const chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>2_000_000){await reader.cancel();throw Error('input');}chunks.push(value);}}finally{reader.releaseLock();}
 const b=new Uint8Array(size);let p=0;for(const c of chunks){b.set(c,p);p+=c.length;}return JSON.parse(new TextDecoder().decode(b));
}
async function all(table:string){let out:any[]=[];for(let i=0;i<10000;i+=500){let q=db.from(table).select('*').order('id').range(i,i+499);if(table==='Notizen')q=q.not('author','ilike','SYSTEM%');const r=await q;if(r.error)throw Error('database');out.push(...r.data);if(r.data.length<500)return out;}throw Error('limit');}
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'';
 const headers={...base,...(origin==='https://marcelkometz-web.github.io'?{'Access-Control-Allow-Origin':origin}:{})};
 const reply=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers});
 if(origin&&origin!=='https://marcelkometz-web.github.io')return reply(403,{error:'Herkunft nicht freigegeben.'});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return reply(405,{error:'Methode nicht erlaubt.'});
 const authorization=req.headers.get('authorization');if(!authorization?.startsWith('Bearer '))return reply(401,{error:'Bitte anmelden.'});
 const client=createClient(garden.url,garden.key,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:authorization}}});
 try{
 const {data:{user},error:authError}=await client.auth.getUser(authorization.slice(7));
 if(authError||!user||!user.email_confirmed_at||user.is_anonymous)return reply(401,{error:'Bitte erneut anmelden.'});
 const {data:activeSession,error:sessionError}=await client.rpc('recipe_session_valid');if(sessionError||activeSession!==true)return reply(401,{error:'Die Sitzung ist nicht mehr gültig. Bitte erneut anmelden.'});
 const {data:caps,error:capsError}=await client.rpc('rg_app_capabilities');
 if(capsError||!caps||caps.blocked||(caps.maintenance&&!caps.maintenance_access))return reply(403,{error:'Der Zugang ist gesperrt oder vorübergehend nicht freigegeben.'});
 const {data:member,error:memberError}=await client.from('rg_members').select('family_id,role').eq('user_id',user.id).maybeSingle();
 if(memberError||member?.family_id!==FAMILY)return reply(403,{error:'Dein Konto muss zuerst für eure Familie freigeschaltet werden.'});
 const input=await limited(req);if(!input||typeof input.action!=='string')throw Error('input');
 const {data:rights,error:rightsError}=await db.rpc('recipe_rights');if(rightsError)throw Error('database');
 const admin=member.role==='owner',canEdit=admin||(rights||[]).some((r:any)=>r.user_id===user.id&&r.can_edit);
 const success=async(body:unknown)=>{await client.from('recipe_sync_events').upsert({family_id:FAMILY,changed_at:new Date().toISOString()});return reply(200,body);};
 if(input.action==='boot'){const v=await db.rpc('recipe_variations');if(v.error)throw Error('database');const recipes=(await all('Rezepte')).map(r=>{const name=Object.keys(v.data||{}).find(k=>String(r.title||'').toLowerCase().includes(k));return name?{...r,_variations:v.data[name]}:r;});return reply(200,{recipes,notes:await all('Notizen'),canEdit,admin,rights:admin?rights:[]});}
 if(input.action==='image'){
 if(!imagePath(input.path))throw Error('input');
 const r=await db.storage.from('RezeptBilder').download(input.path);if(r.error)throw Error('database');
 return new Response(r.data,{headers:{...headers,'Content-Type':r.data.type||'image/jpeg'}});
 }
 if(input.action==='note-add'){
 const content=String(input.content||'').trim(),author=String(input.author||'Familie').trim();
 if(!content||content.length>30000||!author||author.length>80||/^SYSTEM/i.test(author))throw Error('input');
 const r=await db.from('Notizen').insert({content,author,is_done:false}).select('id').single();if(r.error)throw Error('database');return await success({ok:true});
 }
 if(input.action==='note-toggle'||input.action==='note-delete'){
 if(!Number.isSafeInteger(input.id)||input.id<1)throw Error('input');
 let q=input.action==='note-delete'?db.from('Notizen').delete():db.from('Notizen').update({is_done:input.done===true});
 const r=await q.eq('id',input.id).not('author','ilike','SYSTEM%').select('id');if(r.error)throw Error('database');if(!r.data?.length)return reply(409,{error:'Diese Notiz wurde inzwischen geändert oder gelöscht.'});return await success({ok:true});
 }
 if(input.action==='set-right'){
 if(!admin)return reply(403,{error:'Nur die Verwaltung kann Rechte ändern.'});
 if(typeof input.userId!=='string'||typeof input.canEdit!=='boolean')throw Error('input');
 const r=await client.from('rg_members').select('user_id').eq('family_id',FAMILY).eq('user_id',input.userId).maybeSingle();if(r.error||!r.data)throw Error('input');
 const saved=await db.rpc('recipe_set_right',{target_user:input.userId,edit_allowed:input.canEdit});if(saved.error)throw Error('database');return await success({ok:true});
 }
 if(!canEdit)return reply(403,{error:'Für Rezeptänderungen benötigst du die Bearbeitungsfreigabe.'});
 if(input.action==='recipe-save'){
 const row=validate(input.recipe);let q;
 if(input.id!==undefined){if(!Number.isSafeInteger(input.id)||!Number.isSafeInteger(input.revision))throw Error('input');q=db.from('Rezepte').update(row).eq('id',input.id).eq('revision',input.revision);}
 else q=db.from('Rezepte').insert(row);
 const r=await q.select().maybeSingle();if(r.error){if(r.error.code==='23505')return reply(409,{error:'Ein Rezept mit diesem Titel existiert bereits.'});throw Error('database');}
 if(!r.data)return reply(409,{error:'Das Rezept wurde inzwischen geändert. Bitte aktualisieren, bevor du erneut speicherst.'});return await success({recipe:r.data});
 }
 if(input.action==='recipe-delete'){
 if(!Number.isSafeInteger(input.id)||!Number.isSafeInteger(input.revision))throw Error('input');
 const r=await db.from('Rezepte').delete().eq('id',input.id).eq('revision',input.revision).select('id');if(r.error)throw Error('database');if(!r.data?.length)return reply(409,{error:'Das Rezept hat sich inzwischen geändert. Bitte neu öffnen.'});return await success({ok:true});
 }
 if(input.action==='image-upload'){
 if(typeof input.image!=='string'||input.image.length>360000||!/^[A-Za-z0-9+/]*={0,2}$/.test(input.image))throw Error('input');
 const bytes=Uint8Array.from(atob(input.image),c=>c.charCodeAt(0));if(bytes.length>262144||bytes[0]!==255||bytes[1]!==216)throw Error('input');
 const path=`recipes/${crypto.randomUUID()}.jpg`;const r=await db.storage.from('RezeptBilder').upload(path,bytes,{contentType:'image/jpeg',upsert:false});if(r.error)throw Error('database');return reply(200,{path});
 }
 if(input.action==='import'){
 if(!admin)return reply(403,{error:'Nur die Verwaltung kann eine Sicherung wiederherstellen.'});
 if(!Array.isArray(input.recipes)||input.recipes.length<1||input.recipes.length>1000||input.confirm!==true)throw Error('input');
 const rows=input.recipes.map((r:any)=>{const v:any=validate(r);if(r.created_at!==undefined){if(typeof r.created_at!=='string'||!Number.isFinite(Date.parse(r.created_at)))throw Error('input');v.created_at=r.created_at;}if(r.id!==undefined){if(!Number.isSafeInteger(r.id)||r.id<1)throw Error('input');v.id=r.id;}return v;});
 const ids=rows.map((r:any)=>r.id).filter(Boolean);if(ids.length!==new Set(ids).size)throw Error('input');
 const r=await db.rpc('recipe_restore',{backup:rows});if(r.error)return reply(400,{error:'Die Sicherung passt nicht zum Datenbestand. Es wurde nichts importiert. Bitte Titel und IDs prüfen.'});return await success({ok:true,count:rows.length});
 }
 return reply(400,{error:'Unbekannte Aktion.'});
 }catch(e){return reply(e instanceof Error&&e.message==='input'?400:503,{error:e instanceof Error&&e.message==='input'?'Bitte die Angaben prüfen.':'Die Anfrage konnte nicht abgeschlossen werden. Bitte später erneut versuchen.'});}
});
