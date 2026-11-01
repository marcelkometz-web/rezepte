import test from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';
import{buildExpansion,titleKey,coreIngredientKey,COURSE_COUNTS,DATA_URL,expansionSQL,originalTags,stewRetagSQL}from'../scripts/build-recipe-expansion.mjs';
import{NUTRIENTS,roundedNutrition,basisMatchesRecipe,basisIngredientText}from'../src/nutrition-calculation.mjs';
import{categories,nutritionIssues}from'../src/domain.mjs';
const data=JSON.parse(await readFile(DATA_URL,'utf8'));
test('220 complete recipes reproduce from the supplied reference foods and explicit blueprints',()=>{
 const built=buildExpansion(data.referenceLibrary,data.blueprints,{existingTitleCheck:data.existingTitleCheck});assert.deepEqual(built,data);assert.equal(data.recipes.length,220);assert.deepEqual(data.audit.counts,COURSE_COUNTS);assert.equal(data.referenceLibrary.length,121);assert.equal(data.existingTitleCheck.count,384);assert.equal(data.existingTitleCheck.collisionCount,0);assert.match(data.existingTitleCheck.sha256,/^[a-f0-9]{64}$/);
});
test('every recipe has exact reference-preserving per-ingredient arithmetic and consistent text',()=>{
 for(const[rowIndex,row]of data.recipes.entries()){
  const blueprint=data.blueprints[rowIndex],basis=JSON.parse(row.recipes);assert.equal(basis.kind,'ingredient-nutrition-v1');assert.equal(basis.portions,1);assert.equal(basisMatchesRecipe(row),true,row.title);assert.equal(basis.ingredientText,basisIngredientText(basis));assert.equal(row.zutaten_liste,basis.ingredientText);assert.deepEqual(nutritionIssues(row),[]);
  assert.deepEqual(roundedNutrition(basis.ingredients),Object.fromEntries(NUTRIENTS.map(key=>[key,row[key]])),row.title);
  for(const[i,ingredient]of basis.ingredients.entries()){const[reference,grams]=blueprint.ingredients[i];assert.equal(ingredient.grams,grams);assert.deepEqual(ingredient.per100,data.referenceLibrary[reference].per100);assert.deepEqual(ingredient.source,data.referenceLibrary[reference].source);assert.equal(ingredient.label,data.referenceLibrary[reference].label);}
 }
 assert.equal(data.audit.unknownNutrients.fiber,15);assert.ok(data.recipes.some(row=>row.fiber===null));
});
test('category thresholds and portion ranges never promote unknown data to low-carb or high-protein',()=>{
 for(const[rowIndex,row]of data.recipes.entries()){
  const tags=categories(row.category),course=data.blueprints[rowIndex].course,dessert=course==='dessert';assert.equal(tags.includes('highprotein'),row.prot!==null&&row.prot>=25,row.title);assert.equal(tags.includes('lowcarb'),row.kh!==null&&row.kh<=30,row.title);
  assert.ok(row.kcal>=(dessert?100:250)&&row.kcal<=(dessert?300:650),row.title);if(!dessert)assert.ok(row.prot>=25&&row.prot<=50,row.title);
  assert.ok(tags.includes('ohne_haushaltszucker'));assert.ok(!tags.includes('zuckerfrei'));assert.ok(!tags.includes('fettverbrennung'));assert.ok(!tags.includes('stoffwechsel'));
  if(course==='eintoepfe')assert.ok(tags.includes('eintoepfe')&&tags.includes('mittag')&&tags.includes('abend'));
 }
 assert.equal(data.audit.highprotein,185);assert.equal(data.audit.lowcarb,132);assert.equal(data.audit.stews,24);
});
test('all names and core ingredient sets are distinct; supplied existing title collisions fail the build',()=>{
 assert.equal(new Set(data.recipes.map(row=>titleKey(row.title))).size,220);assert.equal(new Set(data.blueprints.map(coreIngredientKey)).size,220);
 assert.equal(titleKey('Low-Carb – Saftige Hähnchenpfanne'),titleKey('Hähnchenpfanne'));
 assert.throws(()=>buildExpansion(data.referenceLibrary,data.blueprints,{existingTitles:[data.recipes[0].title]}),/collision/);
 const duplicate=structuredClone(data.blueprints);duplicate[1]={...duplicate[0],title:'Eine andere Überschrift'};assert.throws(()=>buildExpansion(data.referenceLibrary,duplicate),/core ingredient/);
});
test('preparation methods and food safety are concrete and no false airfryer instructions are emitted',()=>{
 const methods=new Set(data.blueprints.map(row=>row.method));assert.deepEqual(methods,new Set(['cold','simmer','oven','pan','frozen']));
 for(const[index,row]of data.recipes.entries()){
  const blueprint=data.blueprints[index],steps=blueprint.prep.join(' ');assert.ok(blueprint.prep.length>=3);assert.equal(row.has_side,false);assert.equal(row.airfryer,false);assert.equal(row.airfryer_step,'');
  if(blueprint.method==='oven'){assert.ok(row.oven_step.includes('°C'),row.title);assert.equal(row.stove_step,'');}else assert.equal(row.oven_step,'');
  if(blueprint.ingredients.some(([i])=>i===26||i===74))assert.match(steps,/75\s*°C|70\s*°C\s*(?:für\s*)?2\s*Minuten/,row.title);
  if(blueprint.ingredients.some(([i])=>i===20))assert.match(steps,/10\s*Minuten/,row.title);
  if(blueprint.ingredients.some(([i])=>i===27||i===28))assert.match(steps,/2\s*Minuten.*(?:sprudelnd|kochen)|2\s*Minuten\s*sprudelnd/,row.title);
  if(blueprint.method==='cold'&&blueprint.ingredients.some(([i])=>i===111))assert.match(steps,/hart kochen/,row.title);
  assert.match(row.doc_check,/keine Laboranalyse/);assert.match(row.tipps,/Allergiefreiheitszusage/);
 }
});
test('SQL import is append-only, guards canonical duplicates and lets the database generate IDs',()=>{
 const sql=expansionSQL(data);assert.match(sql,/insert into public\."Rezepte"/);assert.match(sql,/not exists\(select 1 from public\."Rezepte" old/);assert.match(sql,/on conflict do nothing/);assert.doesNotMatch(sql,/\b(?:update|delete from) public\."Rezepte"/i);assert.doesNotMatch(sql,/insert into public\."Rezepte"\("id"/);assert.match(sql,/commit;/);
});
test('legacy stew retagging preserves original tags, handles escaped formats, and guards the exact old row',()=>{
 for(const value of['{Fleisch,lowcarb}',JSON.stringify(['mittag','highprotein']),JSON.stringify(JSON.stringify(['abend','salate'])),'[\\"mittag\\",\\"highprotein\\"]'])assert.deepEqual(categories(originalTags(value)),categories(value));
 const old='{Fleisch,lowcarb}',sql=stewRetagSQL([{id:24,title:"Omas Eintopf's",category:old}]);assert.match(sql,/Omas Eintopf''s/);assert.match(sql,/\["Fleisch","lowcarb","eintoepfe"\]/);assert.match(sql,/r\.category is distinct from i\.old_category/);assert.match(sql,/set category=i\.new_category/);assert.doesNotMatch(sql,/set (?:kcal|prot|recipes|zutaten_liste)/);assert.match(sql,/raise exception/);
});
