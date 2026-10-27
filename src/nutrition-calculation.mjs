export const NUTRIENTS=['kcal','prot','kh','sugar','fat','sat_fat','fiber','salt'];
export function calculateIngredients(ingredients,portions=1) {
  if(!Array.isArray(ingredients)||!ingredients.length||!Number.isFinite(portions)||portions<=0)throw Error('Zutaten und Portionen fehlen.');
  const totals=Object.fromEntries(NUTRIENTS.map(key=>[key,0]));
  for(const item of ingredients){
    if(!item||!Number.isFinite(item.grams)||item.grams<=0||item.grams>10000)throw Error('Bitte alle Zutatenmengen in Gramm prüfen.');
    for(const key of NUTRIENTS){
      const value=item.per100?.[key];
      if(value===null||value===undefined){totals[key]=null;continue;}
      if(!Number.isFinite(value)||value<0)throw Error('Ungültiger Nährwert pro 100 g.');
      if(totals[key]!==null)totals[key]+=item.grams/100*value;
    }
  }
  return Object.fromEntries(NUTRIENTS.map(key=>[key,totals[key]===null?null:totals[key]/portions]));
}
export function roundedNutrition(ingredients,portions=1){
  const values=calculateIngredients(ingredients,portions);
  // Stabilize floating-point addition before decimal half-up rounding.
  const round=(value,digits)=>Number(Math.round(Number(value.toFixed(8)+'e'+digits))+'e-'+digits);
  return Object.fromEntries(NUTRIENTS.map(key=>[key,values[key]===null?null:round(values[key],key==='salt'?2:1)]));
}
export function readNutritionBasis(recipe){
  let basis;
  try{basis=typeof recipe.recipes==='string'?JSON.parse(recipe.recipes):recipe.recipes;}catch{return null;}
  if(basis?.kind!=='ingredient-nutrition-v1'||basis.portions!==1||!Array.isArray(basis.ingredients))return null;
  try{calculateIngredients(basis.ingredients);}catch{return null;}
  return basis;
}
export function basisMatchesRecipe(recipe,basis=readNutritionBasis(recipe)){
  if(!basis||recipe.zutaten_liste!==basis.ingredientText)return false;
  const calculated=roundedNutrition(basis.ingredients);
  return NUTRIENTS.every(key=>calculated[key]===null?recipe[key]==null:recipe[key]!=null&&Math.abs(Number(recipe[key])-calculated[key])<.011);
}
export function basisIngredientText(basis){
  const amount=n=>Number(n).toLocaleString('de-DE',{maximumFractionDigits:2});
  return [...basis.ingredients.map(item=>`• ${amount(item.grams)} g ${item.label}`),...(basis.extras||[]).map(line=>`• ${line}`)].join('\n');
}
