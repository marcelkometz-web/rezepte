import test from'node:test';import assert from'node:assert/strict';
import{pairingCourse,pairingNutrition,mealPairings}from'../src/meal-pairings.mjs';
const main={id:1,title:'Tomatenpfanne',category:'mittag',zutaten_liste:'200 g Tomaten\nBasilikum'};
test('courses require explicit categories; title guesses and unclassified mains are excluded',()=>{
 for(const category of['vorspeise','Vorspeisen','salat','Salate','["salads","kalorienbewusst"]'])assert.equal(pairingCourse({category}),'starter');
 for(const category of['dessert','Desserts','Nachtisch','Süßspeise'])assert.equal(pairingCourse({category}),'dessert');
 assert.equal(pairingCourse({title:'Mousse',category:'mittag'}),null);assert.equal(pairingCourse({title:'Tomatensalat',category:''}),null);assert.equal(pairingCourse({category:['salate','dessert']}),'dessert');
});
test('missing and contradictory nutrients remain unknown rather than zero',()=>{
 const unknown=pairingNutrition({kcal:null,sugar:'',prot:' '});assert.equal(unknown.kcal,null);assert.equal(unknown.sugar,null);assert.equal(unknown.protein,null);
 const invalid=pairingNutrition({kcal:120,sugar:10,kh:3,prot:-2});assert.equal(invalid.kcal,120);assert.equal(invalid.sugar,null);assert.equal(invalid.protein,null);assert.equal(invalid.source,'needs-review');
 assert.equal(pairingNutrition({kcal:0,sugar:0}).kcal,0);
});
test('pairings exclude the current recipe, deduplicate IDs, cap courses and remain deterministic',()=>{
 const rows=[main,{id:2,title:'Gurkensalat',category:'salate',kcal:100,sugar:2},{id:'2',title:'Duplikat',category:'salate'},{id:3,title:'Tomatensalat',category:'salate',kcal:100,sugar:2,ingredients:'Tomaten, Basilikum'},{id:4,title:'Suppe',category:'vorspeise',kcal:150,sugar:3},{id:5,title:'Quark',category:'dessert',kcal:120,sugar:4},{id:6,title:'Mousse',category:'dessert',kcal:180,sugar:5},{id:7,title:'Unklar',category:'dessert'},{id:8,title:'Hauptgericht',category:'mittag'}];
 const result=mealPairings(main,rows);assert.equal(result.starter.length,2);assert.equal(result.dessert.length,2);assert.equal(new Set([...result.starter,...result.dessert].map(r=>r.id)).size,4);assert.ok(!result.starter.some(r=>r.id==='1'));assert.equal(result.starter[0].id,'3');assert.deepEqual(result.starter[0].sharedIngredients,['Basilikum','Tomate']);assert.equal(result.menuCalories,null);
 const unique=rows.filter((row,index)=>index!==2);assert.deepEqual(mealPairings(main,unique),mealPairings(main,[...unique].reverse()));assert.equal(mealPairings(main,rows,{limit:9}).starter.length,2);
});
test('known lighter recipes rank above missing values without claiming complete nutrition',()=>{
 const result=mealPairings(main,[{id:2,title:'Nachtisch mit offenen Angaben',category:'dessert'},{id:3,title:'Großer Nachtisch',category:'dessert',kcal:650,sugar:30},{id:4,title:'Beerenquark',category:'dessert',kcal:150,sugar:5}]);assert.equal(result.dessert[0].id,'4');assert.equal(result.dessert[1].id,'2');assert.equal(result.dessert[1].nutrition.kcal,null);assert.equal(result.dessert[1].nutrition.sugar,null);assert.equal(result.menuCalories,null);
});
test('only real ingredient words produce a shared-ingredient reason',()=>{
 const result=mealPairings(main,[{id:2,title:'Basilikum Tomaten Idee',category:'salate',ingredients:'Tomatensauce, Basilikumextrakt'},{id:3,title:'Salat',category:'salate',ingredients:'Tomaten, Basilikum'}]);assert.equal(result.starter[0].id,'3');assert.deepEqual(result.starter.find(r=>r.id==='2').sharedIngredients,[]);assert.match(result.starter.find(r=>r.id==='2').reason,/eingeordnet/);
});
test('legacy mixed dessert tags cannot reclassify savory meat, fish or tofu mains',()=>{
 for(const recipe of[{title:'Rinderpfanne',category:'{fleisch,lowcarb,fettverbrennung,dessert}',ingredients:'Rindfleisch, Paprika'},{title:'Lachs mit Gemüse',category:'dessert',ingredients:'Lachs, Brokkoli'},{title:'Tofu-Curry',category:'dessert',ingredients:'Naturtofu, Curry'},{title:'Suppe',category:'dessert'},{title:'Speck mit Schokomousse',category:'dessert',ingredients:'Bacon, Kakao'}])assert.equal(pairingCourse(recipe),null,recipe.title);
 assert.equal(pairingCourse({title:'Schoko-Mousse mit Seidentofu',category:['dessert','tofu'],ingredients:'Seidentofu, Kakao, Vanille'}),'dessert');
 assert.equal(pairingCourse({title:'Gemüsesuppe',category:'suppe'}),null);assert.equal(pairingCourse({title:'Gemüsesuppe',category:['suppe','vorspeise']}),'starter');
});
