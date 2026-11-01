import{categories,fold,nutritionIssues}from'./domain.mjs';
import{basisMatchesRecipe}from'./nutrition-calculation.mjs';

const starterTags=new Set(['vorspeise','vorspeisen','starter','appetizer','salat','salate','salad','salads']);
const dessertTags=new Set(['dessert','desserts','nachtisch','suessspeise','suessspeisen']);
const savoryTags=new Set(['fleisch','fisch','gefluegel','haehnchen','rind','schwein','meat','fish','tofu']);
const meatWords=/\b(?:haehnchen[a-z]*|huhn|huehner[a-z]*|rind(?:fleisch|erhack)?|schwein(?:efleisch)?|lachs|thunfisch|garnelen|speck|bacon|salami|schinken|hackfleisch|pute|putenbrust|forelle|fisch)\b/;
const savoryDish=/\b[a-z]*(?:pfanne|curry|eintopf|gulasch|braten|schnitzel|burger|lasagne|frikadellen|steak|pizza|suppe)\b/;
const dessertTitle=/\b(?:mousse|schokomousse|zitronenmousse|beerenmousse|pudding|schokopudding|vanillepudding|tiramisu|sorbet|eis|eiscreme|dessert|nachtisch|suessspeise|quarkcreme|joghurtcreme|skyrcreme|kaesekuchen|kuchen|cheesecake|crumble|pralinen|schokocreme|vanillecreme|panna cotta)\b/;
const sharedFoods=[
 ['Zitrone',['zitrone','zitronen','zitronensaft','zitronenabrieb']],['Limette',['limette','limetten','limettensaft']],
 ['Basilikum',['basilikum']],['Dill',['dill']],['Minze',['minze','pfefferminze']],['Petersilie',['petersilie']],
 ['Tomate',['tomate','tomaten']],['Gurke',['gurke','gurken']],['Paprika',['paprika','paprikaschote','paprikaschoten']],
 ['Zucchini',['zucchini']],['Spinat',['spinat','blattspinat']],['Kürbis',['kuerbis','hokkaido']],['Ingwer',['ingwer']],
 ['Apfel',['apfel','aepfel']],['Birne',['birne','birnen']],['Erdbeere',['erdbeere','erdbeeren']],['Himbeere',['himbeere','himbeeren']],
 ['Heidelbeere',['heidelbeere','heidelbeeren','blaubeere','blaubeeren']],['Vanille',['vanille','vanillemark']],['Zimt',['zimt']]
];
const identifier=value=>(typeof value==='number'&&Number.isFinite(value)||typeof value==='string')?String(value).trim().slice(0,120):'';
const known=value=>{if(typeof value!=='number'&&typeof value!=='string'||String(value).trim()==='')return null;const n=Number(value);return Number.isFinite(n)&&n>=0?n:null;};
const words=recipe=>' '+fold([recipe.ingredients,recipe.zutaten_liste].filter(value=>typeof value==='string').join(' ')).replace(/[^a-z0-9]+/g,' ')+' ';
function ingredients(recipe){const source=words(recipe);return sharedFoods.filter(([,aliases])=>aliases.some(alias=>source.includes(' '+alias+' '))).map(([name])=>name);}
export function pairingCourse(recipe){
 const tags=categories(recipe?.category);
 // Fruit salads explicitly marked as dessert stay in the dessert course.
 if(tags.some(tag=>dessertTags.has(tag))){
  const title=fold(recipe?.title).replace(/[^a-z0-9]+/g,' '),source=words(recipe||{}),hasDessertName=dessertTitle.test(title);
  // Older imports sometimes put a dessert tag on a savoury main. A tag alone
  // must not turn chicken, fish or a tofu curry into a dessert suggestion.
  if(meatWords.test(title)||meatWords.test(source))return null;
  if((tags.some(tag=>savoryTags.has(tag))||savoryDish.test(title)||/\b(?:tofu|naturtofu|seidentofu)\b/.test(source))&&!hasDessertName)return null;
  return'dessert';
 }
 if(tags.some(tag=>starterTags.has(tag)))return'starter';
 return null;
}
export function pairingNutrition(recipe){
 const invalid=new Set(nutritionIssues(recipe));
 const value=key=>invalid.has(key)?null:known(recipe[key]);
 return{kcal:value('kcal'),sugar:value('sugar'),protein:value('prot'),source:basisMatchesRecipe(recipe)?'ingredients':invalid.size?'needs-review':'stored'};
}
export function mealPairings(recipe,recipes,{limit=2}={}){
 const count=Number.isInteger(limit)?Math.max(1,Math.min(2,limit)):2,current=identifier(recipe?.id),baseFoods=new Set(ingredients(recipe||{})),seen=new Set(),groups={starter:[],dessert:[]};
 for(const candidate of Array.isArray(recipes)?recipes:[]){
  if(!candidate||typeof candidate!=='object')continue;
  const id=identifier(candidate.id),title=typeof candidate.title==='string'?candidate.title.trim().slice(0,300):'',course=pairingCourse(candidate);
  if(!id||id===current||!title||!course||seen.has(id))continue;seen.add(id);
  const tags=categories(candidate.category),values=pairingNutrition(candidate),shared=ingredients(candidate).filter(name=>baseFoods.has(name)).slice(0,2);
  // Sorting aids, not personal dietary targets or nutrient/health claims.
  // Unknown values contribute nothing; they are never treated as zero.
  let score=tags.includes('kalorienbewusst')?2:0;
  if(values.kcal!==null)score+=values.kcal<=200?3:values.kcal<=300?1:values.kcal>500?-3:0;
  if(values.sugar!==null)score+=values.sugar<=5?2:values.sugar<=10?1:values.sugar>20?-2:0;
  if(values.source==='ingredients')score+=1;
  if(values.source==='needs-review')score-=1;
  score+=shared.length*.25;
  const reason=shared.length?'Gemeinsame Zutat'+(shared.length>1?'en':'')+': '+shared.join(', ')+'.':course==='starter'?'In eurer Sammlung als Vorspeise oder Salat eingeordnet.':'In eurer Sammlung ausdrücklich als Nachtisch eingeordnet.';
  groups[course].push({id,title,emoji:typeof candidate.emoji==='string'?candidate.emoji.slice(0,12):'',nutrition:values,sharedIngredients:shared,reason,score});
 }
 const sort=(a,b)=>b.score-a.score||a.id.localeCompare(b.id,'en',{numeric:true})||a.title.localeCompare(b.title,'de');
 return{starter:groups.starter.sort(sort).slice(0,count).map(({score,...item})=>item),dessert:groups.dessert.sort(sort).slice(0,count).map(({score,...item})=>item),source:'Eure vorhandene Rezeptsammlung',method:'Kategorien, verfügbare Rezeptwerte und gemeinsame Zutaten',menuCalories:null};
}
