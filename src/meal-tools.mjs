import {SIDES,text,variations} from './domain.mjs';

const fractionValues={'½':.5,'¼':.25,'¾':.75,'⅓':1/3,'⅔':2/3,'⅛':.125,'⅜':.375,'⅝':.625,'⅞':.875};
const fractionChars=Object.keys(fractionValues).join('');
const numericToken=`(?:\\d+\\s+(?:\\d+\\s*\\/\\s*\\d+|[${fractionChars}])|\\d+[${fractionChars}]|\\d+\\s*\\/\\s*\\d+|\\d+(?:[.,]\\d+)*|[${fractionChars}])`;
const leadingQuantity=new RegExp(`^((?:ca\\.\\s*|etwa\\s*|Saft von\\s*)?)(${numericToken})(?:\\s*[–—-]\\s*(${numericToken}))?\\s*(.*)$`,'i');
const units=/^(kg|mg|g|ml|cl|dl|l|EL|TL|Esslöffel|Teelöffel|Stück|Stk\.?|Tropfen|Zehen?|Dosen?|Becher|Päckchen|Packungen?|Prisen?|Bund|Scheiben?|Handvoll)\b\.?\s*/i;
const countable=/^(?:Ei(?:er)?|Zitronen?|Limetten?|Zwiebeln?|Schalotten?|Paprika|Tomaten?|Gurken?|Zucchini|Auberginen?|Möhren?|Karotten?|Äpfel|Apfel|Birnen?|Bananen?|Knoblauchzehen?|Kartoffeln?)\b/i;
const amount=value=>Number(value).toLocaleString('de-DE',{maximumFractionDigits:3});

export function parseAmount(value){
 const s=String(value??'').trim();
 if(Object.hasOwn(fractionValues,s))return fractionValues[s];
 const unicode=s.match(new RegExp(`^(\\d+)\\s*([${fractionChars}])$`));
 if(unicode)return Number(unicode[1])+fractionValues[unicode[2]];
 const mixed=s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
 if(mixed)return Number(mixed[3])>0?Number(mixed[1])+Number(mixed[2])/Number(mixed[3]):null;
 const fraction=s.match(/^(\d+)\s*\/\s*(\d+)$/);
 if(fraction)return Number(fraction[2])>0?Number(fraction[1])/Number(fraction[2]):null;
 if(!/^\d+(?:[.,]\d+)*$/.test(s))return null;
 // A German grouped integer is unambiguous; otherwise accept one decimal mark.
 const normalized=/^\d{1,3}(?:\.\d{3})+(?:,\d+)?$/.test(s)?s.replaceAll('.','').replace(',','.'):/^\d+(?:[.,]\d+)?$/.test(s)?s.replace(',','.'):'';
 const result=normalized?Number(normalized):NaN;return Number.isFinite(result)&&result>=0?result:null;
}

export function scaleIngredientLine(line,servings=1){
 if(!Number.isFinite(servings)||servings<.5||servings>30)throw Error('Bitte zwischen 0,5 und 30 Portionen wählen.');
 const original=text(line).replace(/^\s*[•*\-]\s*/,'').trim();
 const unknown=()=>({name:original,quantity:null,unit:'',display:original,scalable:false});
 const match=original.match(leadingQuantity);if(!match)return unknown();
 const[,prefix,start,end,remainder]=match,first=parseAmount(start),last=end?parseAmount(end):null;
 if(first===null||first<=0||(end&&(last===null||last<first))||!remainder||/^[%°/\d]/.test(remainder))return unknown();
 const unitMatch=remainder.match(units);if(!unitMatch&&!countable.test(remainder))return unknown();
 const unit=unitMatch?.[1]||'Stück',name=(unitMatch?remainder.slice(unitMatch[0].length):remainder).trim();
 if(!name)return unknown();
 const low=first*servings,high=end?last*servings:null;if(!Number.isFinite(low)||low>1000000||(high!==null&&(!Number.isFinite(high)||high>1000000)))return unknown();const quantityLabel=prefix+amount(low)+(high!==null?'–'+amount(high):'');
 const display=quantityLabel+(unitMatch?' '+unitMatch[1]:'')+' '+name;
 return{name,quantity:high===null?low:null,unit,display,scalable:true,quantityLabel,displayUnit:unitMatch?.[1]||'',range:high===null?null:[low,high]};
}

export function mealIngredients(recipe,servings=1,{side='keine',variation=null}={}){
 const raw=variations(recipe)?.[variation]?.zutaten||recipe.zutaten_liste||recipe.ingredients||'';
 const rows=text(raw).split('\n').map(line=>line.trim()).filter(Boolean).map(line=>scaleIngredientLine(line,servings));
 if(SIDES[side]?.amount)rows.push(scaleIngredientLine(SIDES[side].amount,servings));
 return rows;
}

const swaps=[
 {pattern:/\bskyr\b/i,replacement:'Magerquark natur',note:'Konsistenz und Geschmack unterscheiden sich. Bei Bedarf mit wenig Wasser glattrühren. Beide enthalten Milch; ein Tausch macht das Gericht nicht milchfrei.'},
 {pattern:/\bmagerquark\b/i,replacement:'Skyr natur',note:'Naturprodukt ohne zugesetzten Zucker wählen und Packungswerte prüfen. Beide enthalten Milch; die Konsistenz kann abweichen.'},
 {pattern:/\bh[aä]hnchen(?:brust|filet)?\b/i,replacement:'fester Naturtofu',note:'Pflanzliche Kochvariante; Tofu enthält meist Soja. Andere Garzeiten und eine sichere Zubereitung beachten. Eiweiß und Energie sind nicht identisch.'},
 {pattern:/\bhackfleisch\b/i,replacement:'zerbröselter fester Naturtofu',note:'Für Pfannen und Saucen geeignet; Bindung, Würzung und Garzeit neu prüfen. Soja beachten. Nährwerte sind nicht gleich.'},
 {pattern:/\b(?:basmati[ -]?)?reis\b/i,replacement:'Blumenkohlreis',note:'Gemüsealternative, keine ernährungsphysiologisch gleiche Beilage. Zubereitungszeit anpassen; die Mahlzeit sollte weiterhin ausreichend sättigen.'},
 {pattern:/\b(?:spaghetti|nudeln)\b/i,replacement:'Zucchini-Nudeln',note:'Gemüsealternative mit anderer Konsistenz und Sättigung. Proteinquelle und Mahlzeit als Ganzes berücksichtigen; deutlich kürzer garen.'}
];
export function ingredientSwapOptions(rows){return rows.flatMap((row,index)=>{const rule=swaps.find(item=>item.pattern.test(row.name));return rule?[{index,original:row.name,replacement:rule.replacement,note:rule.note}]:[];});}
export function applyIngredientSwaps(rows,selection={}){return rows.map((row,index)=>{
 const replacement=selection[index];if(!replacement)return{...row};
 const allowed=ingredientSwapOptions([row])[0];if(!allowed||replacement!==allowed.replacement)throw Error('Dieser Zutatentausch ist nicht freigegeben.');
 return{...row,name:replacement,display:row.scalable?`${row.quantityLabel}${row.displayUnit?' '+row.displayUnit:''} ${replacement}`:replacement,changed:true};
});}
export function preparationNutrition(values,selection={}){return Object.keys(selection).length?Object.fromEntries(Object.keys(values).map(key=>[key,null])):{...values};}
export function batchPlan(portionsPerMeal,mealsCount){
 const people=Number(portionsPerMeal),meals=Number(mealsCount);
 if(!Number.isInteger(people)||people<1||people>12||!Number.isInteger(meals)||meals<1||meals>7||people*meals>30)throw Error('Plane 1–12 Portionen je Mahlzeit und 1–7 Mahlzeiten, insgesamt höchstens 30 Portionen.');
 return{portionsPerMeal:people,meals:meals,totalPortions:people*meals,extraPortions:people*(meals-1)};
}
export function recipePlanPayload(recipe,servings,rows,selection={}){
 if(!recipe?.id||!String(recipe.title||'').trim()||!Number.isFinite(servings)||servings<.5||servings>30)throw Error('Das Rezept oder die Portionszahl ist nicht gültig.');
 if(!Array.isArray(rows)||rows.length>100)throw Error('Für den Wochenplan bitte höchstens 100 Zutaten übernehmen.');
 return{recipeId:String(recipe.id),title:String(recipe.title).slice(0,280)+(Object.keys(selection).length?' (angepasst)':''),servings,ingredients:rows.map(row=>({name:(row.range?String(row.name)+' (Rezeptangabe: '+row.quantityLabel+(row.displayUnit?' '+row.displayUnit:'')+'; Menge beim Ändern prüfen)':String(row.name)).slice(0,160),quantity:Number.isFinite(row.quantity)?row.quantity:null,unit:String(row.unit||'').slice(0,40)}))};
}

export const LEFTOVER_SAFETY=[
 'Nur einwandfreie Lebensmittel verwenden. Hinweise auf der Packung, Verbrauchsdatum und bereits unterbrochene Kühlung beachten.',
 'Gekochtes zügig in kleine, flache Behälter portionieren und rasch kühlen. Nicht stundenlang bei Raumtemperatur stehen lassen. Reis und Nudeln besonders sorgfältig kühlen.',
 'Geschlossene Behälter mit Gericht und Zubereitungsdatum beschriften. Kühlschranktemperatur kontrollieren; rohe und verzehrfertige Lebensmittel getrennt halten.',
 'Portionen für später rechtzeitig einfrieren, wenn sie dafür geeignet sind. Im Kühlschrank auftauen und nur die benötigte Portion vollständig durcherhitzen.',
 'Ein geplanter Folgetag ist keine Haltbarkeitszusage. Unbekannte Lagerdauer oder unsichere Kühlung lässt sich durch Aufwärmen nicht zuverlässig beheben; im Zweifel entsorgen. Auffälliger Geruch ist ein Warnzeichen, unauffälliger Geruch allein kein Sicherheitsnachweis.'
];
