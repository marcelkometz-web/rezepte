const fold=value=>String(value||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/ß/g,'ss').replace(/ae/g,'a').replace(/oe/g,'o').replace(/ue/g,'u');
// Deliberately conservative food names. No inference from catalog months,
// planting dates, free care text, recipe titles or ambiguous short substrings.
const FOODS=[
 ['Tomate',['tomate','tomaten']],['Zucchini',['zucchini']],['Gurke',['gurke','gurken']],['Paprika',['paprika','paprikaschote','paprikaschoten']],
 ['Brokkoli',['brokkoli','broccoli']],['Blumenkohl',['blumenkohl']],['Kohlrabi',['kohlrabi']],['Karotte',['karotte','karotten','mohre','mohren']],
 ['Spinat',['spinat','blattspinat','babyspinat']],['Mangold',['mangold']],['Zwiebel',['zwiebel','zwiebeln']],['Frühlingszwiebel',['fruhlingszwiebel','fruhlingszwiebeln','lauchzwiebel','lauchzwiebeln']],
 ['Knoblauch',['knoblauch','knoblauchzehe','knoblauchzehen']],['Lauch',['lauch','porree']],['Kürbis',['kurbis','hokkaido','butternut']],['Radieschen',['radieschen']],
 ['Rucola',['rucola','rauke']],['Feldsalat',['feldsalat']],['Kopfsalat',['kopfsalat']],['Pflücksalat',['pflucksalat']],['Rote Bete',['rote bete','rote beete']],
 ['Erbse',['erbse','erbsen']],['Grüne Bohne',['grune bohne','grune bohnen','brechbohne','brechbohnen']],['Kartoffel',['kartoffel','kartoffeln']],
 ['Basilikum',['basilikum']],['Petersilie',['petersilie']],['Schnittlauch',['schnittlauch']],['Dill',['dill']],['Minze',['minze','pfefferminze']],
 ['Thymian',['thymian']],['Rosmarin',['rosmarin']],['Oregano',['oregano']],['Erdbeere',['erdbeere','erdbeeren']],['Himbeere',['himbeere','himbeeren']],
 ['Brombeere',['brombeere','brombeeren']],['Heidelbeere',['heidelbeere','heidelbeeren','blaubeere','blaubeeren']],['Apfel',['apfel']],['Birne',['birne','birnen']],['Pflaume',['pflaume','pflaumen','zwetschge','zwetschgen']]
];
const includesPhrase=(source,alias)=>(' '+fold(source).replace(/[^a-z0-9]+/g,' ')+' ').includes(' '+fold(alias)+' ');
const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
export function harvestStart(date){if(!validDate(date))throw new Error('Ungültiges Datum.');const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-6);return d.toISOString().slice(0,10);}
export function confirmedHarvests(rows,date){
 const start=harvestStart(date),result=new Map();
 for(const row of Array.isArray(rows)?rows:[]){
  if(!validDate(row?.harvested_on)||row.harvested_on<start||row.harvested_on>date||typeof row.title!=='string'||row.title.length>150)continue;
  if(/\b(kein|keine|keinen|nicht|unreif|geplant|erwartet|giftig|zierpflanze|verdorben)\b/.test(fold(row.title)))continue;
  for(const[label,aliases]of FOODS)if(aliases.some(alias=>includesPhrase(row.title,alias))){const previous=result.get(label);if(!previous||previous.harvested_on<row.harvested_on)result.set(label,{ingredient:label,harvested_on:row.harvested_on});}
 }
 return [...result.values()].sort((a,b)=>a.ingredient.localeCompare(b.ingredient,'de'));
}
export function recipeHarvestMatches(recipe,harvests){
 const source=[recipe.ingredients,recipe.zutaten_liste].filter(value=>typeof value==='string').join('\n');
 return harvests.filter(item=>{const entry=FOODS.find(([label])=>label===item.ingredient),specific=item.ingredient==='Kartoffel'?fold(source).replace(/\bsuss(?:e|en|er)? kartoffel(?:n)?\b/g,''):source;return entry&&entry[1].some(alias=>includesPhrase(specific,alias));}).map(item=>({...item}));
}
export function harvestBasis(harvests,date,available=true,hasMatches=true){
 return{type:harvests.length&&hasMatches?'recorded_harvest':'daily_rotation',asOf:date,harvestCount:harvests.length,note:!available?'Die Ernteeinträge konnten gerade nicht geprüft werden. Diese Ideen stammen aus eurer Rezeptsammlung.':harvests.length?hasMatches?'Bevorzugt Zutaten, die ihr in den letzten sieben Tagen als geerntet eingetragen habt. Ob sie noch vorrätig und genießbar sind, bitte selbst prüfen.':'Eure Ernteeinträge wurden geprüft. In den ausgewählten Rezepten wurde keine eindeutige passende Zutat gefunden; dies sind die wechselnden Ideen aus eurer Rezeptsammlung.':'Keine passenden bestätigten Ernteeinträge der letzten sieben Tage vorhanden. Die App schätzt keine Erntereife aus Saison oder Pflanzdatum.'};
}
