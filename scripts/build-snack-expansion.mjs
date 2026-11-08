import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {roundedNutrition,basisIngredientText,NUTRIENTS,basisMatchesRecipe} from '../src/nutrition-calculation.mjs';
import {nutritionIssues} from '../src/domain.mjs';
import {titleKey} from './build-recipe-expansion.mjs';

export const BATCH='snacks-20261108';
export const TYPES=['kuchen','kekse','sonstiges'];
const sha=value=>createHash('sha256').update(value).digest('hex');
const sweeteners=new Set(['erythrit']);
const flavourAliases={vanille:'vanilla',schokolade:'chocolate',karamell:'caramel',kokos:'coconut',lemon_cheesecake:'lemon_cheesecake'};
const methodNames={oven:'Backofen',pan:'Pfanne',simmer:'Topf',cold:'Kalte Zubereitung',frozen:'Gefrieren'};
const format=n=>Number(n).toLocaleString('de-DE',{maximumFractionDigits:4});

function validateBlueprint(b,refs){
 if(!b||typeof b.title!=='string'||!b.title.trim()||b.title.length>250||!TYPES.includes(b.subtype))throw Error('Ungültiger Rezeptname oder Snacktyp.');
 if(!Number.isInteger(b.portions)||b.portions<1||b.portions>20||typeof b.portionLabel!=='string'||!b.portionLabel.trim())throw Error('Portionsangabe fehlt: '+b.title);
 if(!methodNames[b.method]||!Number.isFinite(b.timeMinutes)||b.timeMinutes<=0||b.timeMinutes>1800)throw Error('Zubereitungsmethode/Zeit fehlt: '+b.title);
 if(!Array.isArray(b.prep)||b.prep.length<3||b.prep.some(step=>typeof step!=='string'||step.length<15||step.length>2500))throw Error('Zubereitung unvollständig: '+b.title);
 if(!Array.isArray(b.ingredients)||b.ingredients.length<3||b.ingredients.length>22)throw Error('Zutaten unvollständig: '+b.title);
 for(const item of b.ingredients)if(!refs[String(item.ref)]||!Number.isFinite(item.grams)||item.grams<=0||item.grams>10000)throw Error('Zutatenreferenz/Menge ungültig: '+b.title+' / '+item.ref);
 if(b.yieldPieces!==undefined&&(!Number.isInteger(b.yieldPieces)||b.yieldPieces<1||b.yieldPieces>100))throw Error('Stückausbeute ungültig: '+b.title);
 const steps=b.prep.join(' ');
 if(b.method==='oven'&&!/\d+\s*°\s*C/.test(steps))throw Error('Backtemperatur fehlt: '+b.title);
 if(b.ingredients.some(i=>String(i.ref)==='111')&&['cold','frozen'].includes(b.method)&&!/hart kochen|vollständig.*(?:stocken|garen)|vollständig.*gekocht|70\s*°C|75\s*°C/.test(steps))throw Error('Rohei in kalter Zubereitung: '+b.title);
 if(b.flavourDrops&&(!Number.isInteger(b.flavourDrops.drops)||b.flavourDrops.drops<1||b.flavourDrops.drops>5||typeof b.flavourDrops.where!=='string'))throw Error('Tropfendosis ungültig: '+b.title);
 return b;
}

export function buildSnacks({blueprints,references,additionalReferences,flavours,existingTitles=[],expectedPerType=25}){
 const refs={...Object.fromEntries(references.map((r,i)=>[String(i),r])),...additionalReferences};
 const existing=new Set(existingTitles.map(titleKey)),seen=new Set(),counts=Object.fromEntries(TYPES.map(type=>[type,0]));
 const rows=blueprints.map(input=>{
  const b=validateBlueprint(input,refs),name=b.title.trim(),key=titleKey(name);
  if(!key||existing.has(key)||seen.has(key))throw Error('Doppelter Rezepttitel: '+name);
  seen.add(key);counts[b.subtype]++;
  const weights=new Map();for(const i of b.ingredients)weights.set(String(i.ref),(weights.get(String(i.ref))||0)+i.grams);
  const ingredients=[...weights].map(([ref,grams])=>({...structuredClone(refs[ref]),grams:grams/b.portions}));
  const nutrients=roundedNutrition(ingredients);
  if(nutritionIssues(nutrients).length||nutrients.kcal===null||nutrients.prot===null)throw Error('Nährwertberechnung unvollständig: '+name);
  if(nutrients.kcal<70||nutrients.kcal>330)throw Error('Snackportion außerhalb des Prüfbereichs: '+name+' / '+nutrients.kcal+' kcal');
  const totalWeight=b.ingredients.reduce((n,i)=>n+i.grams,0),erythrit=b.ingredients.filter(i=>sweeteners.has(String(i.ref))).reduce((n,i)=>n+i.grams,0);
  if(erythrit/totalWeight>.25||erythrit/b.portions>25)throw Error('Erythritmenge überprüfen: '+name);
  const extras=[],flavour=b.flavourDrops;
  let flavourBasis=null;
  if(flavour){
   const reference=flavours[flavour.flavour]||flavours[flavourAliases[flavour.flavour]];if(!reference)throw Error('Ungeprüfte Flavour-Drops-Sorte: '+name+' / '+flavour.flavour);
   if(!/kalt|abgekühlt|abgekuehlt/i.test(flavour.where))throw Error('Flavour Drops nur in einer kalten Komponente verwenden: '+name);
   if(!/abkühl|abkuehl|auskühl|auskuehl|kalt/i.test(b.prep.join(' ')))throw Error('Kalte Drops-Zugabe fehlt: '+name);
   const dose=flavour.drops/b.portions;
   extras.push(`${format(dose)} Tropfen ${reference.label||('IRONMAXX Flavour Drops '+flavour.flavour)}; erst in die vollständig abgekühlte ${flavour.where}`);
   flavourBasis={...structuredClone(reference),flavour:flavour.flavour,dropsPerPortion:dose,dropsPerBatch:flavour.drops,defaultBatchPortions:b.portions,where:flavour.where,calculation:'Die verwendete Kleinstdosis wird mit den laut Hersteller gerundeten 0 kcal pro 5 Tropfen berücksichtigt. Das ist keine Behauptung von exakt 0 kcal pro 100 ml. Es wird keine ungesicherte Tropfenmasse oder Dichte verwendet.'};
  }
  const baking={defaultPortions:b.portions,portionLabel:b.portionLabel,...b.yieldPieces?{yieldPieces:b.yieldPieces}:{},...b.form?{form:b.form}:{}};
  const basis={kind:'ingredient-nutrition-v1',portions:1,ingredients,extras,batch:BATCH,baking,...flavourBasis?{flavourDrops:flavourBasis}:{},curation:{subtype:b.subtype,method:b.method,timeMinutes:b.timeMinutes,coolingMinutes:b.coolingMinutes||0}};
  basis.ingredientText=basisIngredientText(basis);
  const tags=['snacks',b.subtype,'ohne_haushaltszucker','kalorienbewusst','zutatenberechnet'];
  if(b.subtype==='kuchen')tags.push('dessert');
  if(nutrients.prot>=25)tags.push('highprotein');
  const fullBatch=`Standardrezept: ${b.portions} Portionen${b.yieldPieces?` mit insgesamt ${b.yieldPieces} Stück`:''}${b.form?`; ${b.form}`:''}. Eine Portion entspricht ${b.portionLabel}. Zutatenliste und hinterlegte Nährwerte sind auf 1 Portion bezogen. Für die vollständige Rezeptmenge ${b.portions} Portionen einstellen.`;
  const preparation=b.prep.map((step,i)=>`${i+1}. ${step.replace(/^\s*\d+[.)]\s*/,'').trim()}`).join('\n');
  const dropNote=flavour?`\n\nFür die vollständige Standardmenge zunächst nur ${flavour.drops} Tropfen der angegebenen IRONMAXX-Sorte in ${flavour.where} verwenden. Erst nach vollständigem Abkühlen zugeben, nicht mitbacken und die fertige Glasur/Füllung nicht erneut erhitzen. Bei kleineren Mengen Tropfen vorher in etwas Wasser verdünnen und anteilig dosieren; nicht pro Keks nachdosieren. Die Sorte und Pipette können die Intensität verändern. Herstelleretikett beachten.`:'';
  const nutritionNote='Aus den abgewogenen Zutaten und gespeicherten BLS-/USDA- beziehungsweise ausgewiesenen Hersteller-Referenzen berechnet. Durchschnittswerte, keine Laboranalyse des fertigen Gebäcks. Natürlicher Zucker aus Obst und Milch ist mitgerechnet. Erythrit wird laut Etikett als Kohlenhydrat/mehrwertiger Alkohol mit 0 kcal und 0 g Zucker geführt; diese Kohlenhydrate sind daher nicht vollständig als Stärke oder Zucker zu verstehen. Keine Zugabe von Haushaltszucker, Honig oder Sirup.'+(flavour?' Die verwendete Tropfendosis entspricht nach Hersteller-Rundung 0 zusätzlichen kcal; die Referenz pro 100 ml bleibt in der Berechnungsbasis dokumentiert.':'');
  const row={title:name,category:JSON.stringify(tags),emoji:b.subtype==='kuchen'?'🍰':b.subtype==='kekse'?'🍪':'🥨',...nutrients,calories:Math.round(nutrients.kcal),recipes:JSON.stringify(basis),zutaten_liste:basis.ingredientText,ingredients:[...ingredients.map(i=>i.label),...flavour?['IRONMAXX Flavour Drops '+flavour.flavour]:[]].join(', '),description:`${fullBatch} Zubereitung: ${methodNames[b.method]}, ungefähr ${b.timeMinutes} Minuten${b.coolingMinutes?`; zusätzlich etwa ${b.coolingMinutes} Minuten Kühl-/Ruhezeit`:''}. Ohne zugesetzten Haushaltszucker.`,prep:fullBatch+(['cold','frozen'].includes(b.method)?'\n\n'+preparation:''),oven_step:b.method==='oven'?preparation:'',stove_step:['pan','simmer'].includes(b.method)?preparation:'',airfryer_step:'',airfryer:false,has_side:false,score:null,image:null,image_url:null,doc_check:nutritionNote,tipps:(b.notes||'')+dropNote+'\n\nZutaten mit Milch, Ei, Getreide, Nüssen oder Sesam nach persönlicher Verträglichkeit auswählen; konkrete Packungs- und Allergenangaben prüfen. Keine pauschale Allergiefreiheitszusage.'};
  if(row.recipes.length>30000||!basisMatchesRecipe(row))throw Error('Berechnungsbasis passt nicht zum Rezept: '+name);
  return row;
 });
 if(expectedPerType!==null&&TYPES.some(type=>counts[type]!==expectedPerType))throw Error('Erwartet '+expectedPerType+' neue Rezepte je Unterkategorie; erhalten '+JSON.stringify(counts));
 const audit={total:rows.length,counts,existingTitlesChecked:existingTitles.length,existingTitlesHash:sha(JSON.stringify(existingTitles.map(titleKey).sort())),titleCollisions:0,flavourRecipes:rows.filter(r=>JSON.parse(r.recipes).flavourDrops).length,byType:Object.fromEntries(TYPES.map(type=>{const subset=rows.filter(r=>JSON.parse(r.recipes).curation.subtype===type);return[type,{count:subset.length,kcal:subset.length?[Math.min(...subset.map(r=>r.kcal)),Math.max(...subset.map(r=>r.kcal))]:[],sugar:subset.length?[Math.min(...subset.map(r=>r.sugar)),Math.max(...subset.map(r=>r.sugar))]:[]}];})),unknownNutrients:Object.fromEntries(NUTRIENTS.map(key=>[key,rows.filter(r=>r[key]===null).length]))};
 return{format:'snack-expansion-v1',batch:BATCH,audit,recipes:rows};
}

export function snackSQL(rows){
 if(!Array.isArray(rows)||!rows.length||rows.length>25)throw Error('SQL-Mengen auf 1–25 geprüfte Rezepte begrenzen.');
 const fields=['recipes','title','ingredients','prep','description','category','calories','image','emoji','airfryer','kcal','prot','kh','fat','stove_step','airfryer_step','oven_step','doc_check','zutaten_liste','tipps','sugar','sat_fat','fiber','salt','has_side','score','image_url'];
 const numeric=new Set(NUTRIENTS),booleans=new Set(['airfryer','has_side']);
 const definition=fields.map(key=>'"'+key+'" '+(numeric.has(key)?'numeric':booleans.has(key)?'boolean':key==='calories'?'integer':'text')).join(',');
 const payload=JSON.stringify(rows),delimiter='$snacks_20261108$';if(payload.includes(delimiter))throw Error('Ungültiges SQL-Trennzeichen.');
 return `with incoming as(select * from jsonb_to_recordset(${delimiter}${payload}${delimiter}::jsonb) as r(${definition})), inserted as(insert into public."Rezepte"(${fields.map(f=>'"'+f+'"').join(',')}) select ${fields.map(f=>'n."'+f+'"').join(',')} from incoming n where not exists(select 1 from public."Rezepte" old where lower(btrim(old.title))=lower(btrim(n.title))) returning id,title) select count(*) as inserted_count,array_agg(id order by id) as inserted_ids from inserted;`;
}

async function main(){
 const args=process.argv.slice(2),get=key=>{const i=args.indexOf(key);return i<0?null:args[i+1];};
 if(!get('--input')||!get('--output')||!get('--existing'))throw Error('Erforderlich: --input PRIVATE_BLUEPRINTS.json --existing PRIVATE_INVENTORY.json --output PRIVATE_RESULT.json');
 const refs=JSON.parse(await readFile(new URL('../data/recipe-expansion-20261101.json',import.meta.url),'utf8')).referenceLibrary;
 const additionalReferences=JSON.parse(await readFile(new URL('../data/snack-nutrition-references.json',import.meta.url),'utf8'));
 const flavours=JSON.parse(await readFile(new URL('../data/snack-flavour-references.json',import.meta.url),'utf8'));
 const inventory=JSON.parse(await readFile(get('--existing'),'utf8')),existingTitles=inventory.map(x=>typeof x==='string'?x:x.title);
 const blueprints=JSON.parse(await readFile(get('--input'),'utf8'));
 const result=buildSnacks({blueprints,references:refs,additionalReferences,flavours,existingTitles});
 await writeFile(get('--output'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result.audit,null,2));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e.message);process.exitCode=1;});
