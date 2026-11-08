import test from 'node:test';
import assert from 'node:assert/strict';
import {SNACK_TYPES,categories,snackType,isSnack,setSnackType,meals,matches} from '../src/domain.mjs';
import {bakingInfo} from '../src/snack-baking.mjs';
import {roundedNutrition} from '../src/nutrition-calculation.mjs';

test('canonical snack subtypes work with every supported historical category encoding',()=>{
  for(const type of Object.keys(SNACK_TYPES))for(const category of [
    [' snacks ',type],JSON.stringify(['snacks',type]),`{snacks,${type}}`,JSON.stringify(JSON.stringify(['snacks',type])),`[\\"snacks\\",\\"${type}\\"]`
  ]){
    const recipe={title:'Familienrezept',category};
    assert.equal(snackType(recipe),type);assert.equal(isSnack(recipe),true);
    assert.equal(matches(recipe,'','snacks'),true);assert.equal(matches(recipe,'',type),true);
    assert.deepEqual(Object.keys(SNACK_TYPES).filter(filter=>matches(recipe,'',filter)),[type]);
  }
});

test('older cakes and cookies are found from compound, plural and German titles',()=>{
  for(const title of ['Käsekuchen','Tassenkuchen','Schoko-Mandel-Kuchen','Cheesecake','Lemon Cake','Zitronen-Tartelettes','Apfeltarte','Quarktorte','Kidneybohnen-Brownie','Blech-Brownies']){
    const recipe={title,category:'{lowcarb}'};
    assert.equal(snackType(recipe),'kuchen',title);assert.equal(matches(recipe,'','snacks'),true,title);assert.ok(meals(recipe).includes('dessert'));
  }
  for(const title of ['Vanille-Mandel-Plätzchen','Weihnachtsplaetzchen','Haferkekse','Ein Schokokeks','Protein-Cookies','Mandel-Cookie'])assert.equal(snackType({title}),'kekse',title);
});

test('ordinary desserts, pancakes and savory cake names do not become inferred snack cakes',()=>{
  for(const title of ['Kichererbsenpfannkuchen','Pfannkuchen','Protein-Pancakes','Hüttenkäse-Pancakes','Flammkuchen','Reibekuchen','Low-Carb Hackbällchen-Torte aus dem Ninja-Airfryer','Quarkmousse','Schokopudding']){
    assert.equal(snackType({title}),null,title);assert.equal(matches({title},'','kuchen'),false,title);
  }
  assert.equal(snackType({title:'Protein-Pancakes',category:'{fruehstueck,snacks}'}),'sonstiges');
  assert.deepEqual(meals({title:'Quarkmousse',category:'{dessert}'}),['dessert']);
});

test('assigned snack subtypes override titles and existing meal assignments survive',()=>{
  assert.equal(snackType({title:'Cookie-Kuchen',category:'{snacks,sonstiges}'}),'sonstiges');
  assert.equal(snackType({title:'Schokokuchen',category:'["snacks","kekse"]'}),'kekse');
  assert.equal(snackType({title:'Herzhafte Torte',category:'["cake"]'}),'kuchen');
  assert.equal(snackType({title:'Schokokuchen',category:'["snacks","cake","sonstiges"]'}),'sonstiges');
  assert.equal(snackType({title:'Schokokuchen',category:'["snacks","cake","kekse"]'}),'kekse');
  assert.deepEqual(meals({title:'Spinat-Muffins',category:'{fruehstueck,snacks}'}),['fruehstueck','snacks']);
  assert.deepEqual(meals({title:'Gemüse-Kuchen',category:'{mittag,abend}'}),['mittag','abend','snacks']);
  assert.deepEqual(meals({title:'Haferkekse',category:'{lowcarb}'}),['snacks']);
});

test('snack subtypes partition the full collection and searches do not change saved data',()=>{
  const recipes=[
    ...Array.from({length:30},(_,id)=>({id,title:`Apfelkuchen ${id}`,category:'{dessert}',kcal:140,ingredients:'Apfel Quark'})),
    {id:31,title:'Haferkekse',category:'{snacks}',ingredients:'Hafer Mandel'},
    {id:32,title:'Gemüsesticks',category:'{snacks}',ingredients:'Möhre Quark'},
    {id:33,title:'Mousse',category:'{dessert}',ingredients:'Quark'}
  ],before=structuredClone(recipes);
  const snacks=recipes.filter(recipe=>matches(recipe,'','snacks'));
  assert.equal(snacks.length,32);assert.equal(recipes.filter(recipe=>matches(recipe,'','kuchen')).length,30);
  assert.equal(Object.keys(SNACK_TYPES).reduce((sum,type)=>sum+recipes.filter(recipe=>matches(recipe,'',type)).length,0),snacks.length);
  assert.equal(recipes.filter(recipe=>matches(recipe,'Mandel','kekse')).length,1);
  assert.equal(recipes.filter(recipe=>matches(recipe,'Quark','kekse')).length,0);
  assert.equal(matches(recipes[30],'Hafer','favorites',['31']),true);
  assert.equal(matches(recipes[30],'Hafer','favorites',['32']),false);
  assert.deepEqual(recipes,before);
});

test('editor subtype assignments canonicalize snack tags while preserving unrelated categories',()=>{
  assert.deepEqual(setSnackType('{dessert,cookies,lowcarb,snack}','kuchen'),['dessert','lowcarb','snacks','kuchen']);
  assert.deepEqual(setSnackType('["fruehstueck","snacks","kuchen","highprotein"]','kekse'),['fruehstueck','highprotein','snacks','kekse']);
  assert.deepEqual(setSnackType(['snacks','kekse','lowcarb'],''),['lowcarb']);
  assert.deepEqual(categories(JSON.stringify(setSnackType('{mittag}','sonstiges'))),['mittag','snacks','sonstiges']);
  assert.throws(()=>setSnackType('{mittag}','unbekannt'),/Unterkategorie/);
});

function bakingRecipe(baking){
  const ingredients=[{label:'Mehl',grams:25,per100:{kcal:300,prot:10,kh:60,sugar:2,fat:1,sat_fat:.2,fiber:4,salt:.01}}];
  const basis={kind:'ingredient-nutrition-v1',portions:1,ingredients,ingredientText:'• 25 g Mehl',baking};
  return {title:'Kuchen',zutaten_liste:basis.ingredientText,...roundedNutrition(ingredients),recipes:JSON.stringify(basis)};
}

test('verified baking metadata defaults to the whole batch without changing one-portion nutrition',()=>{
  const recipe=bakingRecipe({defaultPortions:8,yieldPieces:24,portionLabel:'3 Kekse',form:'1 Backblech'}),before=structuredClone(recipe);
  assert.deepEqual(bakingInfo(recipe),{defaultPortions:8,yieldPieces:24,portionLabel:'3 Kekse',form:'1 Backblech'});
  assert.equal(recipe.kcal,75);assert.deepEqual(recipe,before);
  assert.equal(bakingInfo({...recipe,kcal:800}),null);
  assert.equal(bakingInfo({...recipe,zutaten_liste:'• 100 g Mehl'}),null);
  const incomplete=structuredClone(recipe),basis=JSON.parse(incomplete.recipes);delete basis.ingredientText;delete incomplete.zutaten_liste;incomplete.recipes=JSON.stringify(basis);
  assert.equal(bakingInfo(incomplete),null);
  assert.equal(bakingInfo({recipes:'old data'}),null);
});

test('invalid or stale baking defaults cannot change the detail portion count',()=>{
  for(const defaultPortions of [0,-1,21,1.5,'8',null,Infinity])assert.equal(bakingInfo(bakingRecipe({defaultPortions})),null);
  assert.equal(bakingInfo(bakingRecipe(null)),null);
  assert.deepEqual(bakingInfo(bakingRecipe({defaultPortions:8,yieldPieces:0,portionLabel:[],form:'x'.repeat(201)})),{defaultPortions:8,yieldPieces:null,portionLabel:'',form:''});
});
