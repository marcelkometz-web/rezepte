import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
import garden from './garden-config.json' with { type: 'json' };
import { selectDailyRecipes } from './daily-selection.mjs';

// Dedicated read-only endpoint. No recipe mutations, uploads or admin actions.
const family='936a916b-e153-45fb-8528-76e20d1d508d';
const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
Deno.serve(async request=>{
  const origin=request.headers.get('origin');
  const headers:Record<string,string>={'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin',
    'Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS'};
  if(origin==='https://marcelkometz-web.github.io')headers['Access-Control-Allow-Origin']=origin;
  const reply=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers});
  if(origin&&origin!=='https://marcelkometz-web.github.io')return reply(403,{error:'Herkunft nicht freigegeben.'});
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(request.method!=='POST')return reply(405,{error:'Methode nicht erlaubt.'});
  const authorization=request.headers.get('authorization');
  if(!authorization?.startsWith('Bearer '))return reply(401,{error:'Bitte anmelden.'});
  try{
    const caller=createClient(garden.url,garden.key,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:authorization}}});
    const identity=await caller.auth.getUser(authorization.slice(7)),user=identity.data?.user;
    if(identity.error||!user||!user.email_confirmed_at||user.is_anonymous)return reply(401,{error:'Bitte erneut anmelden.'});
    const session=await caller.rpc('recipe_session_valid');
    if(session.error||session.data!==true)return reply(401,{error:'Die Sitzung ist nicht mehr gültig.'});
    const caps=await caller.rpc('rg_app_capabilities');
    if(caps.error||!caps.data||caps.data.blocked||(caps.data.maintenance&&!caps.data.maintenance_access))return reply(403,{error:'Der Zugang ist nicht freigegeben.'});
    const member=await caller.from('rg_members').select('family_id').eq('user_id',user.id).maybeSingle();
    if(member.error||member.data?.family_id!==family)return reply(403,{error:'Familienfreigabe erforderlich.'});
    const raw=await request.text();if(raw.length>1000)return reply(413,{error:'Anfrage zu groß.'});
    let body;try{body=JSON.parse(raw);}catch{return reply(400,{error:'Ungültige Anfrage.'});}
    if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(key=>key!=='date'))return reply(400,{error:'Nur ein Datum ist erlaubt.'});
    const date=typeof body.date==='string'?body.date:new Date().toLocaleDateString('en-CA',{timeZone:'Europe/Berlin'});
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date)return reply(400,{error:'Ungültiges Datum.'});
    const rows=[];
    for(let i=0;i<10000;i+=500){const result=await db.from('Rezepte').select('id,title,emoji,kcal,prot,category').order('id').range(i,i+499);if(result.error)throw Error('database');rows.push(...result.data);if(result.data.length<500)break;}
    return reply(200,{date,recipes:selectDailyRecipes(rows,date)});
  }catch{return reply(503,{error:'Die Rezeptideen sind gerade nicht erreichbar.'});}
});
