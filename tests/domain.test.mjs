import test from 'node:test';
import assert from 'node:assert/strict';
import {categories,matches,scaleLine,ingredientLines,nutrition,cycleInfo,importRows,meals} from '../src/domain.mjs';
import {SAYINGS,seasonalSaying,currentSeason,nextSaying} from '../src/seasons.mjs';
test('historical category formats and several meal types remain searchable',()=>{
 for(const value of ['{mittag,abend,lowcarb}','["mittag","abend","lowcarb"]',['mittag','abend','lowcarb']]){
  assert.deepEqual(categories(value),['mittag','abend','lowcarb']);assert.deepEqual(meals({category:value}),['mittag','abend']);
 }
});
test('category whitespace in imported arrays does not hide meals or low-carb recipes',()=>{
 for(const category of [[' abend ',' lowcarb ',' '],'[" abend "," lowcarb "," "]']){
  const recipe={title:'Test',category};
  assert.deepEqual(categories(category),['abend','lowcarb']);assert.deepEqual(meals(recipe),['abend']);assert.ok(matches(recipe,'','lowcarb'));
 }
});
test('ingredient search combines all words and normalizes German spellings without regex injection',()=>{
 const r={id:1,title:'Hähnchen mit Gemüse',category:'{mittag,lowcarb}',ingredients:'brokkoli',prep:'Mit Kräutern und Möhren garen'};
 assert.ok(matches(r,'Haehnchen Brokkoli'));assert.ok(matches(r,'Kräuter Möhren'));assert.equal(matches(r,'Hähnchen Rind'),false);assert.equal(matches(r,'['),false);assert.ok(matches(r,'','abend')===false);
});
test('high-protein results require a known finite protein value above the threshold',()=>{
 for(const prot of [undefined,null,'unbekannt',Infinity,24.9])assert.equal(matches({title:'Test',prot},'','highprotein'),false);
 for(const prot of [25,'25',30])assert.equal(matches({title:'Test',prot},'','highprotein'),true);
});
test('portion conversion preserves fractions, decimal quantities, ranges and salt without a quantity',()=>{
 assert.equal(scaleLine('• 1/3 TL Kräuter',3),'1 TL Kräuter');assert.equal(scaleLine('½ Zwiebel',2),'1 Zwiebel');
 assert.equal(scaleLine('1 1/2 EL Öl',2),'3 EL Öl');assert.equal(scaleLine('350–400 g Gemüse',2),'700–800 g Gemüse');
 assert.equal(scaleLine('0,5 TL Salz',3),'1,5 TL Salz');assert.equal(scaleLine('Salz nach Geschmack',3),'Salz nach Geschmack');
 assert.equal(scaleLine('1.000 g Gemüse',2),'2.000 g Gemüse');
});
test('compact mixed fractions scale as a whole quantity, including ingredient ranges',()=>{
 assert.equal(scaleLine('1½ EL Öl',2),'3 EL Öl');assert.equal(scaleLine('2¼ TL Salz',2),'4,5 TL Salz');
 assert.equal(scaleLine('ca. 1½–2¼ EL Öl',2),'ca. 3–4,5 EL Öl');
});
test('escaped legacy newlines, selected side and chosen dip all use the same portion count',()=>{
 const r={zutaten_liste:'• 100 g A\\r\\n• 1/2 Ei',_variations:{dip:{kcal:50,prot:2,kh:0,sugar:0,fat:4,zutaten:'• 20 g Joghurt'}}};
 assert.deepEqual(ingredientLines(r,2),['200 g A','1 Ei']);assert.deepEqual(ingredientLines(r,2,'zoodles','dip'),['40 g Joghurt','300 g Zucchini-Nudeln']);
 assert.equal(nutrition(r,2,'keine','dip').kcal,100);assert.equal(nutrition(r,2,'keine','dip').sugar,0);assert.equal(nutrition(r,2,'keine','dip').fiber,null);
});
test('unknown nutrition stays unknown and zero sugar stays zero',()=>{
 assert.equal(nutrition({kcal:null,sugar:0},3).kcal,null);assert.equal(nutrition({kcal:0,sugar:0},3).sugar,0);
});
test('cycle phases depend on dates, support short cycles and reject future dates',()=>{
 const today=new Date(2026,9,26,12);assert.equal(cycleInfo('2026-10-26',28,today).name,'Menstruation');assert.equal(cycleInfo('2026-10-19',28,today).name,'Follikelphase');assert.equal(cycleInfo('2026-10-13',28,today).name,'Eisprung');assert.equal(cycleInfo('2026-10-05',28,today).name,'Lutealphase');assert.equal(cycleInfo('2026-11-01',28,today),null);
});
test('cycle dates reject impossible dates while accepting a real leap day',()=>{
 const now=new Date(2026,2,4,12);
 for(const date of ['2026-02-31','2025-02-29','2026-13-01','2026-01-00'])assert.equal(cycleInfo(date,28,now),null);
 assert.equal(cycleInfo('2024-02-29',28,new Date(2024,2,1,12)).day,2);
});
test('backup supports original rows and previous normalized exports, while excluding credentials and unknown fields',()=>{
 const [r]=importRows([{id:1,title:'Test',category:'{mittag}',baseNutri:{kcal:100,sugar:0},zutatenListe:'• 1 Ei',stoveStep:'Garen',api_key:'not-a-recipe-field',revision:100}]);
 assert.equal(r.kcal,100);assert.equal(r.sugar,0);assert.equal(r.zutaten_liste,'• 1 Ei');assert.equal(r.stove_step,'Garen');assert.equal(r.api_key,undefined);assert.equal(r.revision,undefined);
 assert.throws(()=>importRows([{title:'A',kcal:-1}]));assert.throws(()=>importRows([{title:'A'},{title:'A'}]));assert.throws(()=>importRows([]));
});
test('backup title normalization rejects duplicates that differ only in surrounding whitespace',()=>{
 assert.equal(importRows([{title:'  Gemüsepfanne  '}])[0].title,'Gemüsepfanne');
 assert.throws(()=>importRows([{title:'Test'},{title:' Test '}]),/Doppelte Rezepttitel/);
});
test('all four seasons have unique, meal-related sayings without repeats for six hours',()=>{
 const all=Object.values(SAYINGS).flat();assert.equal(new Set(all).size,all.length);
 for(const season of Object.keys(SAYINGS)){assert.equal(SAYINGS[season].length,24);const seen=Array.from({length:24},(_,i)=>seasonalSaying(season,i*900000));assert.equal(new Set(seen).size,24);assert.equal(seasonalSaying(season,0),seasonalSaying(season,24*900000));}
 assert.equal(currentSeason(new Date(2026,0,1)),'winter');assert.equal(currentSeason(new Date(2026,3,1)),'spring');assert.equal(currentSeason(new Date(2026,6,1)),'summer');assert.equal(currentSeason(new Date(2026,9,1)),'autumn');
});
test('saying history survives rerenders and avoids repeats after changing the design',()=>{
 let state={},seen=new Set();
 for(let i=0;i<24;i++){
  const first=nextSaying('autumn',i*900000,state);state=first.state;assert.ok(!seen.has(first.text));seen.add(first.text);
  const again=nextSaying('autumn',i*900000+100,state);assert.equal(again.text,first.text);
 }
 let a=nextSaying('spring',1,{}),b=nextSaying('summer',2,a.state),c=nextSaying('spring',3,b.state);assert.notEqual(a.text,c.text);
});
test('malformed saved saying preferences recover without repeating the last valid saying',()=>{
 for(const previous of [null,'invalid',{history:[null,{},false],current:{id:'autumn:0',at:'invalid'}}]){
  assert.ok(SAYINGS.autumn.includes(nextSaying('autumn',900001,previous).text));
 }
 const previous={history:[null,{id:'autumn:01',at:0},{id:'autumn:2',at:Infinity}],current:{id:'autumn:1',at:0}};
 const result=nextSaying('autumn',900001,previous);
 assert.notEqual(result.text,SAYINGS.autumn[1]);
 assert.ok(result.state.history.some(x=>x.id==='autumn:1'));
 assert.ok(result.state.history.every(x=>Number.isFinite(x.at)&&!x.id.includes(':01')));
});
