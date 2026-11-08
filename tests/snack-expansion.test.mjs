import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildSnacks,snackSQL} from '../scripts/build-snack-expansion.mjs';
import {basisMatchesRecipe,roundedNutrition,NUTRIENTS} from '../src/nutrition-calculation.mjs';
import {bakingInfo} from '../src/snack-baking.mjs';

const additionalReferences=JSON.parse(await readFile(new URL('../data/snack-nutrition-references.json',import.meta.url),'utf8'));
const flavours=JSON.parse(await readFile(new URL('../data/snack-flavour-references.json',import.meta.url),'utf8'));
const reference=(label,values)=>({label,per100:{kcal:0,prot:0,kh:0,sugar:0,fat:0,sat_fat:0,fiber:0,salt:0,...values},source:{kind:'test-reference',name:'Synthetic test values'}});
const references=[reference('Mehl Test',{kcal:400,prot:10,kh:80,sugar:2,fat:1,sat_fat:.2,fiber:3,salt:.1}),reference('Quark Test',{kcal:100,prot:15,kh:5,sugar:4,fat:2,sat_fat:1,fiber:0,salt:.1})];
const make=(subtype,title)=>({title,subtype,portions:4,portionLabel:subtype==='kekse'?'3 Kekse':'1 Stück',yieldPieces:subtype==='kekse'?12:4,ingredients:[{ref:0,grams:100},{ref:1,grams:200},{ref:'erythrit',grams:40}],prep:['Die Zutaten zu einer gleichmäßigen Masse verrühren.','In der passenden Form bei 170 °C etwa 25 Minuten vollständig backen.','Vor dem Portionieren vollständig abkühlen lassen.'],method:'oven',timeMinutes:40,coolingMinutes:30,notes:'Die berechneten Mengen gelten für das ganze Standardrezept.'});
const build=(blueprints,options={})=>buildSnacks({blueprints,references,additionalReferences,flavours,expectedPerType:null,...options});

test('whole-batch recipes store one-portion amounts, declared erythrit carbs and zero erythrit energy',()=>{
 const [row]=build([make('kuchen','Beispielkuchen')]).recipes,basis=JSON.parse(row.recipes);
 assert.deepEqual(basis.ingredients.map(i=>i.grams),[25,50,10]);
 assert.equal(row.kcal,150);assert.equal(row.kh,32.5);assert.equal(row.sugar,2.5);assert.equal(row.prot,10);
 assert.equal(basisMatchesRecipe(row),true);assert.equal(bakingInfo(row).defaultPortions,4);
 assert.match(row.description,/1 Portion/);assert.match(row.doc_check,/mehrwertiger Alkohol/);assert.doesNotMatch(row.category,/zuckerfrei/);
});
test('cold flavour doses retain manufacturer rounding and original energy instead of fabricated mass',()=>{
 const input=make('kekse','Beispielkekse mit kalter Glasur');input.flavourDrops={flavour:'schokolade',drops:1,where:'kalte Quarkcreme'};input.prep.push('Den Tropfen erst in die kalte Creme geben und die vollständig abgekühlten Kekse damit bestreichen.');
 const row=build([input]).recipes[0],basis=JSON.parse(row.recipes),drops=basis.flavourDrops;
 assert.equal(drops.dropsPerBatch,1);assert.equal(drops.dropsPerPortion,.25);assert.equal(drops.per100ml.kcal,7);assert.equal(drops.per5Drops.kcal,0);
 assert.equal(basis.ingredients.length,3);assert.match(basis.extras[0],/0,25 Tropfen/);assert.match(row.tipps,/nicht mitbacken/);assert.match(row.doc_check,/Hersteller-Rundung/);
 assert.equal(row.kcal,150);assert.equal('grams' in drops,false);assert.equal('per100' in drops,false);
 const hot=structuredClone(input);hot.flavourDrops.where='warmer Teig';assert.throws(()=>build([hot]),/kalten Komponente/);
 const unverified=structuredClone(input);unverified.flavourDrops.flavour='invented';assert.throws(()=>build([unverified]),/Ungeprüfte/);
});
test('existing and internal duplicate titles fail before any content can be inserted',()=>{
 const row=make('kuchen','Beispielkuchen');assert.throws(()=>build([row],{existingTitles:['Low-Carb Beispielkuchen']}),/Doppelter/);
 assert.throws(()=>build([row,make('kuchen','Saftiger Beispielkuchen')]),/Doppelter/);
});
test('unsafe or incomplete batches and unexpected category distribution are rejected',()=>{
 const row=make('kuchen','Beispielkuchen');
 for(const change of [{portions:0},{portions:21},{ingredients:[{ref:'unknown',grams:100},{ref:1,grams:200},{ref:'erythrit',grams:40}]},{prep:['Nur backen.']}])assert.throws(()=>build([{...row,...change}]));
 assert.throws(()=>build([row],{expectedPerType:25}),/Erwartet 25/);
 const excessive={...row,ingredients:[{ref:0,grams:100},{ref:1,grams:100},{ref:'erythrit',grams:150}]};assert.throws(()=>build([excessive]),/Erythritmenge/);
});
test('SQL content updates append recipes without changing existing records or permissions',()=>{
 const rows=build([make('kuchen','Beispielkuchen')]).recipes,sql=snackSQL(rows);
 assert.match(sql,/insert into public\."Rezepte"/);assert.match(sql,/where not exists/);assert.match(sql,/returning id,title/);
 assert.doesNotMatch(sql,/\b(?:update|delete|grant|revoke|create|drop)\b/i);assert.doesNotMatch(sql,/insert into public\."Rezepte"\("id"/);
 assert.throws(()=>snackSQL([]));assert.throws(()=>snackSQL(Array(26).fill(rows[0])));
});
test('new product references have traceable complete declarations with legitimate erythrit polyols',()=>{
 for(const [key,ref] of Object.entries(additionalReferences)){assert.ok(ref.source.url.startsWith('https://'),key);for(const n of NUTRIENTS)assert.ok(Number.isFinite(ref.per100[n])&&ref.per100[n]>=0,key+':'+n);assert.ok(ref.per100.sugar<=ref.per100.kh);assert.ok(ref.per100.sat_fat<=ref.per100.fat);}
 assert.equal(additionalReferences.erythrit.per100.kcal,0);assert.equal(additionalReferences.erythrit.per100.kh,100);assert.equal(additionalReferences.erythrit.per100.sugar,0);
 assert.ok(additionalReferences.baking_powder.per100.salt>10);
 for(const ref of Object.values(flavours)){assert.ok(ref.source.url.startsWith('https://www.ironmaxx.de/'));assert.equal(ref.per5Drops.kcal,0);assert.ok(ref.per100ml.kcal>0);assert.equal(ref.calculationPolicy.densityNotPublished,true);}
});
