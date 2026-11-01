import test from 'node:test';import assert from 'node:assert/strict';
import{confirmedHarvests,recipeHarvestMatches,harvestStart,harvestBasis}from'../supabase/functions/recipes-daily/harvest-selection.mjs';
import{selectDailyRecipes}from'../supabase/functions/recipes-daily/daily-selection.mjs';
import{normalizeHarvestResponse}from'../src/harvest-daily.mjs';
const day='2026-11-01';
test('only explicit recent harvest entries count; planting, season, future and negations do not',()=>{
 const result=confirmedHarvests([
  {title:'Tomaten aus Beet 2',harvested_on:'2026-10-31'},
  {title:'Tomaten',harvested_on:'2026-10-29'},
  {title:'Basilikum',harvested_on:'2026-10-26'},
  {title:'Gurke',harvested_on:'2026-10-25'},
  {title:'Paprika',harvested_on:'2026-11-02'},
  {title:'Noch keine Zucchini',harvested_on:'2026-11-01'},
  {title:'Ernte geplant: Karotten',harvested_on:'2026-11-01'},
  {name:'Brokkoli',harvest:'November',status:'reif'}
 ],day);
 assert.deepEqual(result,[{ingredient:'Basilikum',harvested_on:'2026-10-26'},{ingredient:'Tomate',harvested_on:'2026-10-31'}]);
 assert.equal(harvestStart(day),'2026-10-26');assert.throws(()=>harvestStart('2026-02-30'));
});
test('ingredient matching respects whole food words and does not confuse powders or titles with actual ingredients',()=>{
 const items=confirmedHarvests([{title:'Paprika, Dill und Tomaten',harvested_on:day}],day);
 assert.deepEqual(recipeHarvestMatches({title:'Tomaten aus dem Garten',ingredients:'Paprikapulver, Tomatensauce, Dillgurken'},items),[]);
 assert.deepEqual(recipeHarvestMatches({ingredients:'paprika, dill',zutaten_liste:'200 g passierte Tomaten'},items).map(i=>i.ingredient),['Dill','Paprika','Tomate']);
 assert.deepEqual(recipeHarvestMatches({ingredients:'süße Kartoffel, Zierpflanze'},confirmedHarvests([{title:'Kartoffeln',harvested_on:day}],day)).map(i=>i.ingredient),[]);
});
test('recorded matching harvests are preferred within existing calorie-conscious main meal pool',()=>{
 const rows=[{id:1,title:'Suppe',category:'mittag,kalorienbewusst',ingredients:'Karotten'},{id:2,title:'Salat',category:'abend,kalorienbewusst',zutaten_liste:'Tomaten, Basilikum'},{id:3,title:'Pudding',category:'dessert',ingredients:'Basilikum'},{id:4,title:'Pfanne',category:'mittag,kalorienbewusst',ingredients:'Zucchini'}];
 const result=selectDailyRecipes(rows,day,{harvests:[{title:'Tomaten',harvested_on:day}]});assert.equal(result[0].id,2);assert.equal(result[0].harvestMatches[0].ingredient,'Tomate');assert.equal(result.length,2);assert.ok(result.every(i=>i.id!==3));assert.ok(result.every(i=>!Object.hasOwn(i,'ingredients')&&!Object.hasOwn(i,'zutaten_liste')));
 assert.deepEqual(selectDailyRecipes([...rows].reverse(),day,{harvests:[{title:'Tomaten',harvested_on:day}]}),result);
});
test('rotation works without harvest evidence and explicitly declines freshness/stock assumptions',()=>{
 const result=selectDailyRecipes([{id:1,title:'A'},{id:2,title:'B'}],day);assert.equal(result.length,2);assert.ok(result.every(i=>i.harvestMatches.length===0));
 assert.equal(harvestBasis([],day).type,'daily_rotation');assert.match(harvestBasis([],day).note,/schätzt keine Erntereife/);assert.match(harvestBasis([{ingredient:'Tomate',harvested_on:day}],day).note,/vorrätig und genießbar/);assert.match(harvestBasis([],day,false).note,/nicht geprüft/);
});
test('daily UI validates malformed evidence and accepts the previous endpoint during deployment',()=>{
 assert.deepEqual(normalizeHarvestResponse({recipes:[{id:1,title:'Ein Rezept'}]}),{recipes:[{id:'1',title:'Ein Rezept',harvestMatches:[]}],basis:null});
 for(const result of [{recipes:[{id:1,title:'A',harvestMatches:{map:'bad'}}]},{recipes:[{id:1,title:'A',harvestMatches:[{ingredient:'Tomate',harvested_on:'2026-02-30'}]}]},{recipes:[],basis:{type:'fake',asOf:day,harvestCount:0,note:'x'}},{recipes:[],basis:{type:'daily_rotation',asOf:day,harvestCount:0,note:{}}}])assert.throws(()=>normalizeHarvestResponse(result));
 const normalized=normalizeHarvestResponse({recipes:[{id:2,title:'Salat',harvestMatches:[{ingredient:'Tomate',harvested_on:day,privateId:'discard'}]}],basis:{type:'recorded_harvest',asOf:day,harvestCount:1,note:'Prüfe den Vorrat.',privateNote:'discard'}});assert.ok(!JSON.stringify(normalized).includes('discard'));
});
