import test from 'node:test';import assert from 'node:assert/strict';
import {calculateIngredients,roundedNutrition,readNutritionBasis,basisMatchesRecipe,basisIngredientText,NUTRIENTS} from '../src/nutrition-calculation.mjs';
const food=(label,grams,values)=>({label,grams,per100:Object.fromEntries(NUTRIENTS.map(key=>[key,values[key]??0]))});
test('ingredient quantities, oils, toppings and portions contribute without intermediate rounding',()=>{
 const ingredients=[food('Quark',180,{kcal:67,prot:12,sugar:4,kh:4,fat:.3}),food('Öl',3,{kcal:900,fat:100}),food('Mandeln',5,{kcal:600,prot:20,fat:50})];
 const total=calculateIngredients(ingredients);assert.ok(Math.abs(total.kcal-177.6)<1e-10);assert.ok(Math.abs(total.prot-22.6)<1e-10);assert.ok(Math.abs(calculateIngredients(ingredients,2).kcal-88.8)<1e-10);assert.equal(roundedNutrition(ingredients).kcal,177.6);
});
test('missing source nutrients stay unknown rather than being treated as zero',()=>{
 const a=food('A',100,{kcal:100,sugar:2}),b=food('B',50,{kcal:80});b.per100.sugar=null;
 assert.equal(calculateIngredients([a,b]).sugar,null);assert.equal(calculateIngredients([a,b]).kcal,140);
});
test('manually changed nutrition or ingredient text invalidates the source-calculation badge',()=>{
 const ingredients=[food('Testzutat',125,{kcal:100,prot:20})],basis={kind:'ingredient-nutrition-v1',portions:1,ingredients,extras:['Pfeffer nach Geschmack']};basis.ingredientText=basisIngredientText(basis);
 const row={recipes:JSON.stringify(basis),zutaten_liste:basis.ingredientText,...roundedNutrition(ingredients)};
 assert.ok(readNutritionBasis(row));assert.equal(basisMatchesRecipe(row),true);assert.equal(basisMatchesRecipe({...row,kcal:900}),false);assert.equal(basisMatchesRecipe({...row,zutaten_liste:'Andere Menge'}),false);assert.equal(readNutritionBasis({recipes:'legacy-text'}),null);
});
test('half-decimal nutrient values round consistently after adding multiple ingredients',()=>{
 const ingredients=[food('A',100,{kcal:100.1}),food('B',100,{kcal:100.1}),food('C',100,{kcal:31.05})];
 assert.equal(roundedNutrition(ingredients).kcal,231.3);
});
