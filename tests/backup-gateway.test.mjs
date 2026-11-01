import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import {normalizeRestore,imageUpload,cleanupInput,titleKey,RESTORE_BODY_LIMIT} from '../supabase/functions/recipes-api/backup-restore.mjs';
const actor='181b6d68-57d0-4969-9fa6-05220db9889c',family='936a916b-e153-45fb-8528-76e20d1d508d',operation='21111111-1111-4111-8111-111111111111',path='recipes/31111111-1111-4111-8111-111111111111.jpg';
const user={id:actor,email_confirmed_at:'2026-01-01',is_anonymous:false},snapshot='a'.repeat(32),context={actor,family};
const requestData=()=>({action:'backup-restore',operationId:operation,confirm:true,expectedActor:actor,expectedFamily:family,sourceActor:actor,sourceFamily:family,expectedSnapshot:snapshot,recipes:[{sourceId:7,title:'Ein Rezept',kcal:100}],notes:[{id:1,content:'Tomaten',author:'Test',is_done:false}]});
let state;
function initial(){state={user,session:true,diary:actor,member:{family_id:family,role:'owner'},caps:{blocked:false,maintenance:false},rights:[],snapshot,recipes:[],notes:[],rpcCalls:[],uploads:[],removals:[],claimed:[{path}],restoreError:null,restoreResult:{ok:true,counts:{recipes:1,notes:1},skipped:{recipes:0,notes:0},recipeMap:{7:13},snapshot:'b'.repeat(32)}};}
function chain(table){let read=true;const q={select(){return q;},order(){return q;},range(){return q;},not(){return q;},eq(){return q;},upsert(){read=false;return q;},insert(){read=false;return q;},update(){read=false;return q;},delete(){read=false;return q;},single(){return Promise.resolve(result(true));},maybeSingle(){return Promise.resolve(result(true));},then(resolve,reject){return Promise.resolve(result(false)).then(resolve,reject);}};function result(single){if(table==='rg_members')return{data:single?state.member:[state.member],error:null};return{data:read?(table==='Rezepte'?state.recipes:table==='Notizen'?state.notes:[]):single?{id:1}:[],error:null};}return q;}
const sdk={createClient(){return{auth:{getUser:async()=>({data:{user:state.user},error:null})},from:chain,rpc:async(name,args)=>{
 state.rpcCalls.push({name,args});
 if(name==='recipe_session_valid')return{data:state.session,error:null};if(name==='rg_app_capabilities')return{data:state.caps,error:null};if(name==='ab_current_diary')return{data:state.diary,error:null};if(name==='recipe_rights')return{data:state.rights,error:null};if(name==='recipe_variations')return{data:{},error:null};if(name==='recipe_backup_snapshot')return{data:state.snapshot,error:null};if(name==='recipe_restore_additive')return{data:state.restoreError?null:state.restoreResult,error:state.restoreError};if(name==='recipe_backup_upload_claim_cleanup')return{data:state.claimed,error:null};return{data:true,error:null};
 },storage:{from(){return{upload:async(...args)=>{state.uploads.push(args);return{data:{},error:null};},remove:async(paths)=>{state.removals.push(paths);return{data:paths,error:null};}};}}};}};
const temp=await mkdtemp(join(tmpdir(),'recipe-backup-gateway-')),output=join(temp,'handler.mjs');
await build({entryPoints:[new URL('../supabase/functions/recipes-api/index.ts',import.meta.url).pathname],outfile:output,bundle:true,platform:'neutral',format:'esm',external:['npm:*'],logLevel:'silent'});
let source=await readFile(output,'utf8');source=source.replace(/import\s*\{\s*createClient\s*\}\s*from\s*["']npm:[^"']+["'];/,'const {createClient}=globalThis.__backupTestSDK;');await writeFile(output,source);
let handler;globalThis.__backupTestSDK=sdk;globalThis.Deno={env:{get(name){return name==='SUPABASE_URL'?'https://test.example.invalid':name==='SUPABASE_SERVICE_ROLE_KEY'?'test-only-key':'';}},serve(fn){handler=fn;}};await import(pathToFileURL(output));
async function call(body,authorization=true){const response=await handler(new Request('https://test.example.invalid',{method:'POST',headers:{Origin:'https://marcelkometz-web.github.io','Content-Type':'application/json',...(authorization?{Authorization:'Bearer fixture-only'}:{})},body:JSON.stringify(body)}));return{status:response.status,body:await response.json()};}
const writes=()=>state.rpcCalls.filter(call=>/restore_additive|upload_register|claim_cleanup|finish_cleanup/.test(call.name));
test('Restore metadata keeps provenance and preserves legitimate identical notes',()=>{
 const input=requestData();input.notes.push({...input.notes[0],id:2});const result=normalizeRestore(input,{...context,validateRecipe:value=>({title:value.title,kcal:value.kcal})});
 assert.equal(result.recipes[0].source_id,7);assert.equal(result.recipes[0].id,undefined);assert.equal(result.notes.length,2);assert.equal(result.notes[0].content,result.notes[1].content);assert.equal(titleKey('  Ein\n REZEPT  '),'ein rezept');
 for(const change of[{sourceActor:'another-user'},{sourceFamily:'another-family'},{expectedActor:'another-user'},{operationId:'not-a-uuid'},{confirm:false},{expectedSnapshot:'invalid'}])assert.throws(()=>normalizeRestore({...input,...change},{...context,validateRecipe:value=>({title:value.title})}));
 assert.throws(()=>normalizeRestore({...input,recipes:[input.recipes[0],{sourceId:8,title:' ein REZEPT '}]},{...context,validateRecipe:value=>({title:value.title})}));
 assert.throws(()=>normalizeRestore({...input,notes:[{id:1,content:'not exported',author:' SYSTEM_TEST',is_done:false}]},{...context,validateRecipe:value=>({title:value.title})}));
});
test('Backup export is available to both approved accounts; restore remains owner only',async()=>{
 initial();state.member.role='member';let result=await call({action:'boot',backup:true});assert.equal(result.status,200);assert.equal(result.body.backupSnapshot,snapshot);assert.equal(result.body.admin,false);
 result=await call(requestData());assert.equal(result.status,403);assert.equal(writes().length,0);
 initial();state.diary=null;assert.equal((await call({action:'boot',backup:true})).status,403);assert.equal(writes().length,0);
 initial();state.session=false;assert.equal((await call(requestData())).status,401);assert.equal(writes().length,0);
 initial();assert.equal((await call(requestData(),false)).status,401);assert.equal(writes().length,0);
});
test('Restore rejects actor/family changes and exposes only sanitized conflict messages',async()=>{
 initial();assert.equal((await call({...requestData(),expectedActor:'other'})).status,400);assert.equal(writes().length,0);
 initial();assert.equal((await call({...requestData(),sourceFamily:'other'})).status,400);assert.equal(writes().length,0);
 initial();state.restoreError={code:'40001',message:'PRIVATE_CONFLICT_CANARY'};const result=await call(requestData());assert.equal(result.status,409);assert.ok(!JSON.stringify(result.body).includes('PRIVATE_CONFLICT_CANARY'));
});
test('Restore sends one atomic RPC without inserting archive IDs or rewriting existing rows',async()=>{
 initial();const result=await call(requestData());assert.equal(result.status,200);assert.deepEqual(result.body.recipeMap,{7:13});const calls=writes();assert.equal(calls.length,1);assert.equal(calls[0].name,'recipe_restore_additive');assert.equal(calls[0].args.p_operation,operation);assert.equal(calls[0].args.p_recipes[0].source_id,7);assert.equal(calls[0].args.p_recipes[0].id,undefined);
});
test('Only explicit restore actions can exceed the normal two-megabyte request limit',async()=>{
 initial();assert.equal((await call({action:'boot',padding:'x'.repeat(2_000_001)})).status,400);
 initial();assert.equal((await call({...requestData(),padding:'x'.repeat(2_000_001)})).status,200);
 initial();assert.equal((await call({action:'import',confirm:true,recipes:[{title:'A'}],padding:'x'.repeat(2_000_001)})).status,200);
 initial();assert.equal(RESTORE_BODY_LIMIT,8*1024*1024);assert.equal((await call({...requestData(),padding:'x'.repeat(RESTORE_BODY_LIMIT+1)})).status,400);
});
test('Reserved SYSTEM notes are never included in a backup boot response',async()=>{
 initial();state.notes=[{id:1,author:' SYSTEM_LEGACY',content:'not-a-real-key'},{id:2,author:'Test',content:'Tomaten'}];const result=await call({action:'boot',backup:true});assert.equal(result.status,200);assert.deepEqual(result.body.notes.map(note=>note.id),[2]);
});
test('Backup image upload validates real image signatures and uses fresh paths',async()=>{
 const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5W2iAAAAAASUVORK5CYII=',input={operationId:operation,expectedActor:actor,expectedFamily:family,mime:'image/png',image:png};
 assert.equal(imageUpload(input,context).mime,'image/png');assert.throws(()=>imageUpload({...input,mime:'image/jpeg'},context));assert.throws(()=>imageUpload({...input,image:btoa('<script>alert(1)</script>')},context));
 initial();const result=await call({action:'backup-image-upload',...input});assert.equal(result.status,200);assert.match(result.body.path,/^recipes\/[0-9a-f-]{36}\.png$/);assert.equal(state.uploads.length,1);assert.equal(state.uploads[0][2].contentType,'image/png');assert.equal(state.uploads[0][2].upsert,false);assert.equal(writes()[0].name,'recipe_backup_upload_register');assert.match(writes()[0].args.p_sha256,/^[a-f0-9]{64}$/);
});
test('Cleanup cannot target arbitrary paths; only claimed, unreferenced staging objects are removed',async()=>{
 assert.throws(()=>cleanupInput({operationId:operation,expectedActor:actor,expectedFamily:family,paths:['../other.jpg']},context));
 initial();const kept='recipes/41111111-1111-4111-8111-111111111111.jpg',result=await call({action:'backup-image-cleanup',operationId:operation,expectedActor:actor,expectedFamily:family,paths:[path,kept]});assert.equal(result.status,200);assert.deepEqual(state.removals,[[path]]);assert.deepEqual(result.body.removedPaths,[path]);assert.deepEqual(result.body.keptPaths,[kept]);assert.equal(writes()[0].args.p_actor,actor);assert.equal(writes()[0].args.p_operation,operation);
});
