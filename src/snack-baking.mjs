import {readNutritionBasis,basisMatchesRecipe} from './nutrition-calculation.mjs';

// Baking is a display convenience; the documented recipe and all calculations
// continue to describe one portion. Ignore stale or malformed metadata.
export function bakingInfo(recipe) {
  const basis=readNutritionBasis(recipe),baking=basis?.baking;
  if(!basis||typeof basis.ingredientText!=='string'||!basis.ingredientText.trim()||!basisMatchesRecipe(recipe,basis)||!baking||typeof baking!=='object'||Array.isArray(baking)||!Number.isInteger(baking.defaultPortions)||baking.defaultPortions<1||baking.defaultPortions>20)return null;
  const shortText=(value,max)=>typeof value==='string'&&value.trim().length<=max?value.trim():'';
  return {
    defaultPortions:baking.defaultPortions,
    yieldPieces:Number.isInteger(baking.yieldPieces)&&baking.yieldPieces>0&&baking.yieldPieces<=200?baking.yieldPieces:null,
    portionLabel:shortText(baking.portionLabel,120),
    form:shortText(baking.form,200)
  };
}
