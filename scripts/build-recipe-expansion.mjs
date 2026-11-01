import{readFile,writeFile,mkdir}from'node:fs/promises';
import{createHash}from'node:crypto';
import{fileURLToPath}from'node:url';
import{resolve}from'node:path';
import{categories,nutritionIssues}from'../src/domain.mjs';
import{roundedNutrition,basisIngredientText,NUTRIENTS}from'../src/nutrition-calculation.mjs';

export const BATCH='recipe-expansion-20261101';
export const COURSE_COUNTS=Object.freeze({fruehstueck:40,mittag:50,abend:40,salate:35,dessert:35,eintoepfe:20});
export const DATA_URL=new URL('../data/recipe-expansion-20261101.json',import.meta.url);
const sha=value=>createHash('sha256').update(value).digest('hex');
const stripAdjectives='low[ -]*carb|high[ -]*protein|protein|cremig(?:e|er|es)?|leicht(?:e|er|es)?|knusprig(?:e|er|es)?|saftig(?:e|er|es)?|gesund(?:e|er|es)?|fitness|power';
export function titleKey(value){return String(value||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(new RegExp(stripAdjectives,'g'),'').replace(/[^a-z0-9]/g,'');}
const animal=new Set([13,18,19,26,32,42,45,47,51,56,60,61,67,74,77,79,80,90,94,95,100,103,109,111]);
const fish=new Set([18,32,45,77,90,95,109]),meat=new Set([26,74,79,80,94]);
const herbIndices=new Set([3,31,37,43,49,63,66,70,92,93,98,101,104,107,113,117,118]);
const allergenGroups=[['Milch',[42,47,51,56,60,61,67,100]],['Ei',[13,111]],['Fisch',[18,32,45,77,90,95,109]],['Krebstiere',[19]],['Soja',[12,57,62,96,101]],['glutenhaltiges Getreide',[69,81,82,97,114]],['Hafer – Glutenkennzeichnung prüfen',[24,25]],['Erdnuss',[16]],['Schalenfrüchte',[52,73,112]],['Sesam',[99,108]],['Sellerie',[38]],['Senf',[98]]];
const descriptiveMethod={cold:'Ein kalt angerichtetes Gericht mit frischen Komponenten',pan:'In der Pfanne zubereitet, mit dem gesamten angegebenen Gemüse',oven:'Im Ofen gegart und mit den angegebenen Beilagen als eine Portion serviert',simmer:'Sanft im Topf gegart; die Zutatenmengen gelten für eine Portion',frozen:'Ein gekühltes Dessert zum Vorbereiten; Gefrier- und Antauzeiten beachten'};
const clearStewTitles=new Set(['Möhren-Linsentopf mit körnigem Frischkäse','Tomaten-Graupentopf mit Putenwürfeln','Artischocken-Bohnen-Ragout mit Seitan','Erbsen-Kohlrabi-Topf mit Tofu und Miso']);
export function coreIngredientKey(blueprint){return blueprint.ingredients.map(([i])=>i).filter(i=>!herbIndices.has(i)).sort((a,b)=>a-b).join(',');}
function requireBlueprint(value,references){
 if(!value||!Object.hasOwn(COURSE_COUNTS,value.course)||typeof value.title!=='string'||!value.title.trim()||value.title.length>250)throw Error('Invalid recipe blueprint/title');
 if(!Object.hasOwn(descriptiveMethod,value.method)||!Number.isInteger(value.timeMinutes)||value.timeMinutes<5||value.timeMinutes>1500)throw Error('Invalid recipe method/time: '+value.title);
 if(!Array.isArray(value.prep)||value.prep.length<3||value.prep.length>8||value.prep.some(step=>typeof step!=='string'||step.length<20||step.length>1500))throw Error('Incomplete recipe: '+value.title);
 if(!Array.isArray(value.ingredients)||value.ingredients.length<3||value.ingredients.length>18)throw Error('Invalid ingredient list: '+value.title);
 const used=new Set();
 for(const pair of value.ingredients){if(!Array.isArray(pair)||pair.length!==2||!Number.isInteger(pair[0])||!references[pair[0]]||used.has(pair[0])||!Number.isFinite(pair[1])||pair[1]<=0||pair[1]>1000)throw Error('Invalid ingredient reference/weight: '+value.title);used.add(pair[0]);}
 const steps=value.prep.join(' ');
 if([26,74].some(i=>used.has(i))&&!/75\s*°C|70\s*°C\s*(?:für\s*)?2\s*Minuten/.test(steps))throw Error('Poultry cooking condition missing: '+value.title);
 if(used.has(20)&&!/10\s*Minuten/.test(steps))throw Error('Green beans require full boil: '+value.title);
 if([27,28].some(i=>used.has(i))&&!/2\s*Minuten.*(?:sprudelnd|kochen)|2\s*Minuten\s*sprudelnd/.test(steps))throw Error('Berry heating instruction missing: '+value.title);
 return value;
}
function recipeFromBlueprint(value,references,index){
 const blueprint=requireBlueprint(value,references),ingredients=blueprint.ingredients.map(([i,grams])=>({...structuredClone(references[i]),grams})),values=roundedNutrition(ingredients),used=new Set(blueprint.ingredients.map(([i])=>i));
 if(nutritionIssues(values).length)throw Error('Contradictory nutrition: '+value.title);
 const dessert=value.course==='dessert';
 if(values.kcal===null||values.prot===null||values.kcal<(dessert?100:250)||values.kcal>(dessert?300:650)||!dessert&&(values.prot<25||values.prot>50))throw Error('Portion outside curation range: '+value.title);
 const tags=value.course==='eintoepfe'?['mittag','abend','eintoepfe']:value.course==='salate'?['mittag','abend','salate']:[value.course];
 if(clearStewTitles.has(value.title)&&!tags.includes('eintoepfe'))tags.push('eintoepfe');
 tags.push('kalorienbewusst','ohne_haushaltszucker','zutatenberechnet');if(values.prot!==null&&values.prot>=25)tags.push('highprotein');if(values.kh!==null&&values.kh<=30)tags.push('lowcarb');
 if(![...used].some(i=>animal.has(i)))tags.push('pflanzlich');
 const basis={kind:'ingredient-nutrition-v1',portions:1,ingredients,extras:[],batch:BATCH,curation:{course:value.course,method:value.method,timeMinutes:value.timeMinutes,index:index+1}};
 basis.ingredientText=basisIngredientText(basis);
 const steps=blueprint.prep.map((step,i)=>`${i+1}. ${step.replace(/^\s*\d+\.\s*/, '').trim()}`).join('\n');
 const preparation=`Alle Mengen gelten für 1 vollständige Portion und den genannten Lebensmittelzustand. Konserven nach dem Abtropfen, Getreide trocken und Fleisch/Fisch roh abwiegen. Zeitbedarf ungefähr ${value.timeMinutes} Minuten, einschließlich angegebener Quell-, Gar- oder Gefrierzeiten.`;
 const allergens=allergenGroups.filter(([,ids])=>ids.some(i=>used.has(i))).map(([name])=>name);
 const sourceText='Berechnung aus abgewogenen Zutaten und den gespeicherten Referenzwerten (BLS 4.0/USDA). Durchschnittswerte, keine Laboranalyse des fertigen Gerichts. Produktunterschiede und Garverluste sind möglich. Natürlich vorkommender Zucker aus Obst, Gemüse und Milch wird mitgerechnet; kein zusätzlich eingestreuter Haushaltszucker, Honig oder Sirup vorgesehen. Fehlende Referenzwerte bleiben unbekannt.';
 const allergenText=allergens.length?'Enthält anhand der verwendeten Zutaten unter anderem: '+allergens.join(', ')+'. Alle konkreten Packungsangaben und mögliche Spuren selbst prüfen; keine Allergiefreiheitszusage.':'Alle konkreten Packungsangaben und mögliche Allergenspuren selbst prüfen; keine Allergiefreiheitszusage.';
 const coldSafety='Vorbereitete Speisen zügig abkühlen und gekühlt aufbewahren. Ein geplanter Folgetag ist keine Haltbarkeitszusage. Nur benötigte Mengen erneut vollständig erhitzen; unsichere Kühlung lässt sich dadurch nicht zuverlässig ausgleichen.';
 const generic=value.description?.startsWith('Ein eigenständig zusammengestelltes Gericht');
 const description=generic?descriptiveMethod[value.method]+'.':String(value.description||descriptiveMethod[value.method]+'.');
 return{title:value.title.trim(),emoji:value.emoji||'🍲',ingredients:ingredients.map(i=>i.label).join(', '),recipes:JSON.stringify(basis),zutaten_liste:basis.ingredientText,description,
  category:JSON.stringify(tags),...values,calories:Math.round(values.kcal),prep:preparation+(['cold','frozen'].includes(value.method)?'\n\n'+steps:''),stove_step:['pan','simmer'].includes(value.method)?steps:'',oven_step:value.method==='oven'?steps:'',airfryer_step:'',airfryer:false,has_side:false,score:null,image:null,image_url:null,
  doc_check:sourceText,tipps:allergenText+'\n\n'+coldSafety};
}
export function buildExpansion(references,blueprints,{existingTitles=[],existingTitleCheck=null}={}){
 if(!Array.isArray(references)||references.length!==121||references.some(ref=>typeof ref.label!=='string'||!ref.per100||!ref.source||!['bls-4.0','usda-fdc'].includes(ref.source.kind)&&!String(ref.source.kind).startsWith('usda')))throw Error('Expected the 121 supplied verified reference foods');
 const seen=new Set(),coreSeen=new Set(),existing=new Set(existingTitles.map(titleKey));
 const recipes=blueprints.map((blueprint,index)=>{const key=titleKey(blueprint.title),core=coreIngredientKey(blueprint);if(!key||seen.has(key)||existing.has(key))throw Error('Recipe title collision: '+blueprint.title);if(coreSeen.has(core))throw Error('Duplicate core ingredient set: '+blueprint.title);seen.add(key);coreSeen.add(core);return recipeFromBlueprint(blueprint,references,index);});
 const counts=Object.fromEntries(Object.keys(COURSE_COUNTS).map(course=>[course,blueprints.filter(row=>row.course===course).length]));
 if(recipes.length!==220||JSON.stringify(counts)!==JSON.stringify(COURSE_COUNTS))throw Error('Expected the complete 220-recipe course distribution');
 const audit={counts,total:recipes.length,highprotein:recipes.filter(r=>categories(r.category).includes('highprotein')).length,lowcarb:recipes.filter(r=>categories(r.category).includes('lowcarb')).length,stews:recipes.filter(r=>categories(r.category).includes('eintoepfe')).length,
  plantOnly:blueprints.filter(r=>!r.ingredients.some(([i])=>animal.has(i))).length,withoutMeatOrFish:blueprints.filter(r=>!r.ingredients.some(([i])=>meat.has(i)||fish.has(i)||i===19)).length,
  byCourse:Object.fromEntries(Object.keys(COURSE_COUNTS).map(course=>{const list=recipes.filter((_,i)=>blueprints[i].course===course);return[course,{count:list.length,kcal:[Math.min(...list.map(r=>r.kcal)),Math.max(...list.map(r=>r.kcal))],protein:[Math.min(...list.map(r=>r.prot)),Math.max(...list.map(r=>r.prot))],sugar:[Math.min(...list.map(r=>r.sugar)),Math.max(...list.map(r=>r.sugar))]}];})),
  unknownNutrients:Object.fromEntries(NUTRIENTS.map(key=>[key,recipes.filter(r=>r[key]===null).length])),methods:Object.fromEntries(Object.keys(descriptiveMethod).map(method=>[method,blueprints.filter(r=>r.method===method).length])),coreFoodSets:coreSeen.size};
 const titleCheck=existingTitles.length?{count:existingTitles.length,sha256:sha(JSON.stringify([...existing].sort())),collisionCount:0}:existingTitleCheck;
 return{format:'recipe-expansion-v1',batch:BATCH,createdAt:'2026-11-01T00:00:00.000Z',referenceAttribution:'MRI (2025), Bundeslebensmittelschlüssel 4.0, DOI 10.25826/Data20251217-134202-0, CC BY 4.0. Selected spice references: USDA FoodData Central SR Legacy (Public Domain). See NUTRITION.md and the original code/qualifiers per ingredient.',existingTitleCheck:titleCheck,referenceLibrary:structuredClone(references),blueprints:structuredClone(blueprints),audit,recipes};
}
const sqlQuote=value=>value===null?'null':"'"+String(value).replaceAll("'","''")+"'";
export function expansionSQL(expansion){
 const fields=['recipes','title','ingredients','prep','description','category','calories','image','emoji','airfryer','kcal','prot','kh','fat','stove_step','airfryer_step','oven_step','doc_check','zutaten_liste','tipps','sugar','sat_fat','fiber','salt','has_side','score','image_url'];
 const numeric=new Set(['kcal','prot','kh','fat','sugar','sat_fat','fiber','salt']),booleans=new Set(['airfryer','has_side']);
 const definition=fields.map(key=>'"'+key+'" '+(numeric.has(key)?'numeric':booleans.has(key)?'boolean':key==='calories'?'integer':'text')).join(',');
 const payload=JSON.stringify(expansion.recipes),delimiter='$recipe_expansion_20261101$';if(payload.includes(delimiter))throw Error('Unsafe SQL payload delimiter');
 let titleExpr="lower(coalesce(value,''))";for(const[from,to]of[['ä','ae'],['ö','oe'],['ü','ue'],['ß','ss'],...Array.from('áàâãåéèêëíìîïóòôõúùûçñ').map((c,i)=>[c,'aaaaaeeeeiiiioooouuucn'[i]])])titleExpr=`replace(${titleExpr},${sqlQuote(from)},${sqlQuote(to)})`;
 const canonical=`regexp_replace(regexp_replace(${titleExpr},${sqlQuote(stripAdjectives)},'','g'),'[^a-z0-9]','','g')`;
 return`-- ${BATCH}: append-only; no existing recipe is updated or deleted.\nbegin;\nset local lock_timeout='10s';\nlock table public."Rezepte" in share row exclusive mode;\ncreate or replace function pg_temp.recipe_title_key(value text)returns text language sql immutable set search_path='' as $key$select ${canonical}$key$;\nwith incoming as(select * from jsonb_to_recordset(${delimiter}${payload}${delimiter}::jsonb) as r(${definition})), inserted as(\n insert into public."Rezepte"(${fields.map(key=>'"'+key+'"').join(',')})\n select ${fields.map(key=>'n."'+key+'"').join(',')} from incoming n\n where not exists(select 1 from public."Rezepte" old where pg_temp.recipe_title_key(old.title)=pg_temp.recipe_title_key(n.title))\n on conflict do nothing returning id,title\n)select count(*)::integer as inserted,array_agg(id order by id) as inserted_ids from inserted;\ncommit;\n`;
}
export function originalTags(value){
 if(Array.isArray(value))return value.map(item=>String(item).trim()).filter(Boolean);
 let raw=String(value??'').trim();for(let i=0;i<3;i++){try{const v=JSON.parse(raw);if(Array.isArray(v))return originalTags(v);if(typeof v==='string'){raw=v.trim();continue;}}catch{}if(raw.includes('\\"')){raw=raw.replace(/\\"/g,'"');continue;}break;}
 return raw.replace(/[{}[\]"]/g,'').split(',').map(tag=>tag.trim()).filter(Boolean);
}
export function stewRetagSQL(rows){
 const data=rows.map(row=>{if(!Number.isSafeInteger(row.id)||row.id<1||typeof row.title!=='string'||typeof row.category!=='string')throw Error('Invalid curated legacy stew row');const tags=originalTags(row.category);if(categories(row.category).some(tag=>!categories(tags).includes(tag)))throw Error('Legacy categories could not be preserved');if(!categories(tags).includes('eintoepfe'))tags.push('eintoepfe');return{id:row.id,title:row.title,old:row.category,next:JSON.stringify(tags)};});
 const values=data.map(row=>`(${row.id},${sqlQuote(row.title)},${sqlQuote(row.old)},${sqlQuote(row.next)})`).join(',\n');
 return`-- Curated ${data.length} existing chunky stews/chili/goulash. No pureed cream soups.\n-- Only category may change; old title/category guards abort on unrelated edits.\nbegin;\ncreate temp table stew_retag_input(id bigint,title text,old_category text,new_category text)on commit drop;\ninsert into stew_retag_input values\n${values};\ndo $guard$begin\n if exists(select 1 from stew_retag_input i left join public."Rezepte" r on r.id=i.id where r.id is null or r.title is distinct from i.title or(r.category is distinct from i.old_category and r.category is distinct from i.new_category))then raise exception 'A curated recipe changed; review the stew retag again';end if;\nend$guard$;\nupdate public."Rezepte" r set category=i.new_category from stew_retag_input i where r.id=i.id and r.category is not distinct from i.old_category and r.category is distinct from i.new_category returning r.id,r.title;\ncommit;\n`;
}
async function main(){
 const args=process.argv.slice(2),get=flag=>{const i=args.indexOf(flag);return i<0?null:args[i+1];},check=args.includes('--check');let source;
 if(get('--references')&&get('--blueprints'))source={referenceLibrary:JSON.parse(await readFile(get('--references'),'utf8')),blueprints:JSON.parse(await readFile(get('--blueprints'),'utf8'))};else source=JSON.parse(await readFile(DATA_URL,'utf8'));
 const oldTitles=get('--existing-titles')?JSON.parse(await readFile(get('--existing-titles'),'utf8')):[],expansion=buildExpansion(source.referenceLibrary,source.blueprints,{existingTitles:oldTitles,existingTitleCheck:source.existingTitleCheck});
 if(check){if(JSON.stringify(expansion)!==JSON.stringify(source))throw Error('Dataset differs from its checked reproducible build');console.log('PASS reproducible 220-recipe dataset, nutrition and title/core uniqueness');return;}
 await mkdir(new URL('../data/',import.meta.url),{recursive:true});await writeFile(DATA_URL,JSON.stringify(expansion,null,2)+'\n');
 const sqlFile=get('--sql')||'/tmp/recipe-expansion-20261101.sql';await writeFile(sqlFile,expansionSQL(expansion));
 if(get('--legacy-stews'))await writeFile('/tmp/recipe-stew-backfill-20261101.sql',stewRetagSQL(JSON.parse(await readFile(get('--legacy-stews'),'utf8'))));
 console.log(JSON.stringify({batch:BATCH,...expansion.audit,sqlFile},null,2));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error.message);process.exitCode=1;});
