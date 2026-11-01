import test from 'node:test';
import assert from 'node:assert/strict';
import {parseAmount,scaleIngredientLine,mealIngredients,ingredientSwapOptions,applyIngredientSwaps,preparationNutrition,batchPlan,recipePlanPayload} from '../src/meal-tools.mjs';
test('Quantities accept German decimals and fractions without evaluating input',()=>{
 for(const[input,expected]of [['1,5',1.5],['1.5',1.5],['1.000',1000],['1.000,5',1000.5],['½',.5],['1½',1.5],['1 1/2',1.5],['2 / 4',.5]])assert.equal(parseAmount(input),expected,input);
 for(const input of ['1/0','1/2/3','1+2','1,2,3','Infinity','<script>','-2'])assert.equal(parseAmount(input),null,input);
});
test('Scale only recognizable ingredient quantities; preserve uncertain lines and ranges',()=>{
 assert.deepEqual(scaleIngredientLine('• ½ TL Salz',3).quantity,1.5);
 assert.equal(scaleIngredientLine('1 1/2 EL Öl',2).display,'3 EL Öl');
 assert.equal(scaleIngredientLine('2 Eier',.5).display,'1 Eier');
 const range=scaleIngredientLine('ca. 1–2 EL Joghurt',3);assert.equal(range.display,'ca. 3–6 EL Joghurt');assert.equal(range.quantity,null);assert.deepEqual(range.range,[3,6]);
 for(const line of ['Salz nach Geschmack','2%-Joghurt','180 °C Umluft','2–1 g Salz','1/0 TL Salz','100 Proteinpulver','1 kg'])assert.equal(scaleIngredientLine(line,2).scalable,false,line);
 assert.throws(()=>scaleIngredientLine('2 Eier',0));
});
test('Recipe and side quantities are scaled once with variation support',()=>{
 const recipe={zutaten_liste:'100 g Zucchini\n½ Zwiebel\nPfeffer nach Geschmack',_variations:{a:{zutaten:'50 g Skyr natur'}}};
 const rows=mealIngredients(recipe,2,{side:'kartoffeln',variation:'a'});
 assert.equal(rows[0].quantity,100);assert.equal(rows[1].quantity,300);assert.equal(rows[0].name,'Skyr natur');
});
test('Swaps leave original data intact and invalidate all preparation nutrition',()=>{
 const rows=mealIngredients({zutaten_liste:'100 g Skyr natur\n1 Ei'},2),option=ingredientSwapOptions(rows)[0],selected={[option.index]:option.replacement},changed=applyIngredientSwaps(rows,selected);
 assert.equal(changed[0].name,'Magerquark natur');assert.equal(changed[0].quantity,200);assert.equal(rows[0].name,'Skyr natur');
 assert.deepEqual(preparationNutrition({kcal:123,prot:null},selected),{kcal:null,prot:null});
 assert.deepEqual(preparationNutrition({kcal:123,prot:null}),{kcal:123,prot:null});
 assert.throws(()=>applyIngredientSwaps(rows,{0:'unbelegtes Produkt'}));
});
test('Batch plan respects bounds and payload contains only explicit recipe data',()=>{
 assert.deepEqual(batchPlan(2,3),{portionsPerMeal:2,meals:3,totalPortions:6,extraPortions:4});
 for(const args of [[0,2],[2,8],[12,7],[1.5,2],['',2]])assert.throws(()=>batchPlan(...args));
 const recipe={id:9,title:'Quarkgericht',secret:'not passed'},rows=mealIngredients({zutaten_liste:'100 g Quark\nPfeffer nach Geschmack'},2),payload=recipePlanPayload(recipe,2,rows);
 assert.equal(payload.recipeId,'9');assert.equal(payload.ingredients[0].quantity,200);assert.equal(payload.ingredients[1].quantity,null);assert.equal(payload.secret,undefined);assert.equal(payload.nutrition,undefined);
 const range=recipePlanPayload(recipe,3,mealIngredients({zutaten_liste:'1–2 EL Joghurt'},3));assert.equal(range.ingredients[0].quantity,null);assert.match(range.ingredients[0].name,/3–6 EL/);
 assert.throws(()=>recipePlanPayload(recipe,31,rows));
});
