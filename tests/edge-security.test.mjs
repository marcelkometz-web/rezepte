import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
const uid='181b6d68-57d0-4969-9fa6-05220db9889c',family='936a916b-e153-45fb-8528-76e20d1d508d';
const user={id:uid,email_confirmed_at:'2026-01-01',is_anonymous:false};
let state;
function initial(){state={user,session:true,member:{family_id:family,role:'member'},caps:{blocked:false,maintenance:false,ai:true,models:{openai:['gpt-5.4-mini'],gemini:['gemini-3.8-flash']}},rights:[],key:'test-only-provider-key-not-a-real-secret',quota:true,queries:[],providerCalls:[]};}
function chain(table){let op='read';const filters=[];const q={
 select(){return q;},order(){return q;},range(){return q;},not(...v){filters.push(['not',...v]);return q;},eq(...v){filters.push(['eq',...v]);return q;},
 insert(v){op='insert';state.queries.push({table,op,value:v,filters});return q;},update(v){op='update';state.queries.push({table,op,value:v,filters});return q;},delete(){op='delete';state.queries.push({table,op,filters});return q;},upsert(v){op='upsert';state.queries.push({table,op,value:v,filters});return q;},
 single(){return Promise.resolve(result(true));},maybeSingle(){return Promise.resolve(result(true));},then(ok,bad){return Promise.resolve(result(false)).then(ok,bad);}
 };
 function result(single){if(table==='rg_members')return {data:single?state.member:[state.member],error:null};if(op==='read')return {data:[],error:null};if(table==='Rezepte'&&op==='update')return {data:null,error:null};return {data:single?{id:1}:[{id:1}],error:null};}return q;
}
const sdk={createClient(){return {auth:{getUser:async()=>({data:{user:state.user},error:null})},from:chain,rpc:async(name,args)=>{
 if(name==='recipe_session_valid')return {data:state.session,error:null};if(name==='rg_app_capabilities')return {data:state.caps,error:null};if(name==='recipe_rights')return {data:state.rights,error:null};if(name==='recipe_variations')return {data:{},error:null};if(name==='rg_get_ai_provider_key')return {data:state.key,error:null};if(name==='rg_claim_ai_request_v2')return {data:state.quota,error:null};return {data:true,error:null};
 },storage:{from(){return {download:async()=>({error:{}}),upload:async()=>({error:null})};}}};}};
async function handler(name){const tmp=await mkdtemp(join(tmpdir(),'recipes-edge-test-')),out=join(tmp,'handler.mjs');await build({entryPoints:[new URL(`../supabase/functions/${name}/index.ts`,import.meta.url).pathname],outfile:out,bundle:true,platform:'neutral',format:'esm',external:['npm:*'],logLevel:'silent'});let src=await readFile(out,'utf8');src=src.replace(/import\s*\{\s*createClient\s*\}\s*from\s*["']npm:[^"']+["'];/, 'const {createClient}=globalThis.__recipesTestSDK;');await writeFile(out,src);let serve;globalThis.__recipesTestSDK=sdk;globalThis.Deno={env:{get(name){return name==='SUPABASE_URL'?'https://test.example.invalid':name==='SUPABASE_SERVICE_ROLE_KEY'?'test-server-key':'test-public-key';}},serve(fn){serve=fn;}};await import(pathToFileURL(out));return serve;}
const dataHandler=await handler('recipes-api'),aiHandler=await handler('recipes-ai');
function req(body={},auth=true){return new Request('https://test.example.invalid',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://marcelkometz-web.github.io',...(auth?{Authorization:'Bearer test-jwt'}:{})},body:JSON.stringify(body)});}
async function call(fn,body,auth=true){const r=await fn(req(body,auth));return {status:r.status,body:await r.json()};}
test('data gate rejects absent, unconfirmed, revoked, blocked and other-family sessions before returning records',async()=>{
 initial();assert.equal((await call(dataHandler,{action:'boot'},false)).status,401);
 state.user=null;assert.equal((await call(dataHandler,{action:'boot'})).status,401);
 initial();state.user={...user,email_confirmed_at:null};assert.equal((await call(dataHandler,{action:'boot'})).status,401);
 initial();state.session=false;assert.equal((await call(dataHandler,{action:'boot'})).status,401);
 initial();state.caps.blocked=true;assert.equal((await call(dataHandler,{action:'boot'})).status,403);
 initial();state.member.family_id='another-family';assert.equal((await call(dataHandler,{action:'boot'})).status,403);assert.equal(state.queries.length,0);
});
test('readers cannot write recipes or grant themselves rights; SYSTEM notes cannot be inserted',async()=>{
 initial();assert.equal((await call(dataHandler,{action:'recipe-save',recipe:{title:'A'}})).status,403);
 assert.equal((await call(dataHandler,{action:'set-right',userId:uid,canEdit:true})).status,403);
 assert.equal((await call(dataHandler,{action:'note-add',author:'SYSTEM_GEMINI_KEY',content:'secret'})).status,400);assert.equal(state.queries.length,0);
});
test('writes require the stored revision and images cannot traverse paths',async()=>{
 initial();state.member.role='owner';const r=await call(dataHandler,{action:'recipe-save',id:1,revision:7,recipe:{title:'A'}});assert.equal(r.status,409);assert.ok(state.queries[0].filters.some(f=>f[0]==='eq'&&f[1]==='revision'&&f[2]===7));
 assert.equal((await call(dataHandler,{action:'image',path:'../other/private.jpg'})).status,400);
 assert.equal((await call(dataHandler,{action:'image-upload',image:'PHNjcmlwdD4='})).status,400);
});
test('AI rejects missing approval, disabled models, absent keys and exceeded limits without provider calls',async()=>{
 initial();let calls=0;globalThis.fetch=async()=>{calls++;throw Error('Unexpected provider call');};const q={mode:'chat',question:'Wie gare ich Brokkoli?',provider:'openai',model:'gpt-5.4-mini',consent:true};
 assert.equal((await call(aiHandler,q,false)).status,401);state.session=false;assert.equal((await call(aiHandler,q)).status,401);
 initial();assert.equal((await call(aiHandler,{...q,consent:false})).status,400);assert.equal((await call(aiHandler,{...q,model:'not-approved'})).status,403);
 state.key=null;assert.equal((await call(aiHandler,q)).status,503);state.key='test-only-provider-key-not-a-real-secret';state.quota=false;assert.equal((await call(aiHandler,q)).status,429);assert.equal(calls,0);
});
test('OpenAI requests stay server-side with store false; replies omit the key and provider error bodies',async()=>{
 initial();let payload;globalThis.fetch=async(url,options)=>{payload=JSON.parse(options.body);return new Response(JSON.stringify({status:'completed',output:[{type:'message',content:[{type:'output_text',text:'Kurz dünsten.'}]}]}),{headers:{'content-type':'application/json'}});};
 const q={mode:'chat',question:'Wie gare ich Brokkoli?',provider:'openai',model:'gpt-5.4-mini',consent:true};let r=await call(aiHandler,q);assert.equal(r.status,200);assert.equal(payload.store,false);assert.equal(payload.model,q.model);assert.equal(r.body.answer,'Kurz dünsten.');assert.ok(!JSON.stringify(r.body).includes(state.key));
 globalThis.fetch=async()=>new Response(JSON.stringify({error:{message:'PRIVATE_KEY_CANARY'}}),{status:403});r=await call(aiHandler,q);assert.equal(r.status,503);assert.ok(!JSON.stringify(r.body).includes('PRIVATE_KEY_CANARY'));assert.ok(!JSON.stringify(r.body).includes(state.key));
});
