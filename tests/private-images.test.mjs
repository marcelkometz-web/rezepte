import test from 'node:test';
import assert from 'node:assert/strict';
import {createPrivateImageCache} from '../src/private-images.mjs';
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};
test('concurrent cards share a single fetch and cached pictures render after node attachment',async()=>{
 let calls=0,created=0;const cache=createPrivateImageCache({fetchBlob:async()=>{calls++;return new Blob(['photo']);},createURL:()=>`blob:${++created}`});
 assert.deepEqual(await Promise.all([cache.load('photo.jpg'),cache.load('photo.jpg')]),['blob:1','blob:1']);assert.equal(calls,1);assert.equal(created,1);
 let connected=false,rendered=false;const render=async()=>{const url=await cache.load('photo.jpg');if(connected&&url)rendered=true;};
 const drawing=render();connected=true;await drawing;assert.equal(rendered,true);assert.equal(calls,1);
});
test('logout revokes resolved images and prevents late images from refilling the cache',async()=>{
 const delayed=deferred(),revoked=[];let calls=0,created=0;
 const cache=createPrivateImageCache({fetchBlob:()=>++calls===1?Promise.resolve(new Blob(['old'])):delayed.promise,createURL:()=>`blob:${++created}`,revokeURL:url=>revoked.push(url)});
 await cache.load('ready.jpg');const old=cache.load('pending.jpg');await Promise.resolve();cache.clear();delayed.resolve(new Blob(['late']));
 assert.equal(await old,null);assert.equal(created,1);assert.deepEqual(revoked,['blob:1']);
});
test('an old request finishing cannot discard the new login request for the same path',async()=>{
 const before=deferred(),after=deferred();let calls=0;const cache=createPrivateImageCache({fetchBlob:()=>++calls===1?before.promise:after.promise,createURL:()=> 'blob:new'});
 const old=cache.load('same.jpg');await Promise.resolve();cache.clear();const current=cache.load('same.jpg');await Promise.resolve();
 before.resolve(new Blob(['old']));assert.equal(await old,null);assert.equal(cache.load('same.jpg'),current);after.resolve(new Blob(['new']));assert.equal(await current,'blob:new');assert.equal(calls,2);
});
test('failed picture downloads can be retried',async()=>{
 let calls=0;const cache=createPrivateImageCache({fetchBlob:async()=>{if(++calls===1)throw Error('offline');return new Blob(['retry']);},createURL:()=> 'blob:retry'});
 await assert.rejects(cache.load('image.jpg'),/offline/);assert.equal(await cache.load('image.jpg'),'blob:retry');assert.equal(calls,2);
});
test('a reset before dispatch never requests a photo under the next login',async()=>{
 let calls=0;const cache=createPrivateImageCache({fetchBlob:async()=>{calls++;return new Blob(['never']);},createURL:()=> 'blob:never'});
 const request=cache.load('image.jpg');cache.clear();assert.equal(await request,null);assert.equal(calls,0);
});
