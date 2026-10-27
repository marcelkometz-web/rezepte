export const MEALS = { fruehstueck:'Frühstück', mittag:'Mittagessen', abend:'Abendessen', dessert:'Nachtisch', snacks:'Snacks' };
export const SIDES = {
  keine:{ name:'Ohne Extra-Beilage', kcal:0, prot:0, kh:0, sugar:0, fat:0, amount:'' },
  zoodles:{ name:'Zucchini-Nudeln · 150 g', kcal:22, prot:1.8, kh:3.1, sugar:2.2, fat:.4, amount:'150 g Zucchini-Nudeln' },
  protein_nudeln:{ name:'Protein-Nudeln · 100 g', kcal:145, prot:14, kh:18, sugar:1.5, fat:1.8, amount:'100 g gekochte Protein-Nudeln' },
  basmati_reis:{ name:'Basmati-Reis · 100 g', kcal:130, prot:2.7, kh:28, sugar:.1, fat:.3, amount:'100 g gekochter Basmati-Reis' },
  kartoffeln:{ name:'Kartoffeln · 150 g', kcal:110, prot:3, kh:23, sugar:1.2, fat:.2, amount:'150 g gekochte Kartoffeln' }
};
export const INGREDIENT_GROUPS = {
  'Fleisch & Fisch':['Hähnchen','Rind','Hackfleisch','Schwein','Pute','Lachs','Garnelen','Thunfisch','Speck'],
  'Gemüse':['Brokkoli','Wirsing','Zucchini','Blumenkohl','Spinat','Kohlrabi','Lauch','Möhren','Kartoffeln','Süßkartoffel','Paprika','Tomaten','Gurke','Pilze','Bohnen','Erbsen','Spitzkohl','Avocado','Kürbis','Aubergine'],
  'Proteine & Milch':['Eier','Quark','Feta','Mozzarella','Parmesan','Frischkäse','Sahne','Joghurt','Butter','Tofu'],
  'Basics & Gewürze':['Knoblauch','Zwiebel','Schalotte','Chili','Ingwer','Kräuter','Senf','Tomatenmark','Nüsse','Mandeln']
};
export const text = value => String(value ?? '').replace(/\\r\\n|\\n|\\r/g,'\n').replace(/\r\n?/g,'\n');
export const fold = value => text(value).toLocaleLowerCase('de').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
export function categories(value) {
  if(Array.isArray(value)) return value.map(x=>fold(text(x).trim())).filter(Boolean);
  let s=String(value??'').trim();
  // Some older rows contain JSON strings whose quote escapes were stored twice.
  for(let i=0;i<3;i++){
    try { const v=JSON.parse(s); if(Array.isArray(v)) return categories(v); if(typeof v==='string'){s=v.trim();continue;} } catch {}
    if(s.includes('\\"')){s=s.replace(/\\"/g,'"');continue;}break;
  }
  return s.replace(/[{}[\]"]/g,'').split(',').map(x=>fold(x.trim())).filter(Boolean);
}
export function isSalad(recipe) {
  const cats=categories(recipe.category);
  return cats.some(c=>['salat','salate','salad','salads'].includes(c)) || /(?:^|[\s-])[a-z]*salat(?:[\s-]|$)/.test(fold(recipe.title));
}
export function meals(recipe) {
  const cats=categories(recipe.category), explicit=Object.keys(MEALS).filter(c=>cats.includes(c));
  if(cats.some(c=>['nachtisch','suessspeise','desserts'].includes(c))&&!explicit.includes('dessert'))explicit.push('dessert');
  if(cats.includes('snacks')&&/dessert|nachtisch|kuchen|mousse|pudding|tiramisu|praline/.test(fold(recipe.title))&&!explicit.includes('dessert'))explicit.push('dessert');
  if(explicit.length) return explicit;
  const title=fold(recipe.title);
  if(/dessert|nachtisch|kuchen|mousse|pudding|tiramisu/.test(title)) return ['dessert'];
  if(/fruehstueck/.test(title)) return ['fruehstueck'];
  if(/brot/.test(title)) return ['abend'];
  return ['mittag'];
}
export function matches(recipe,query='',filter='all',favorites=[]) {
  const cats=categories(recipe.category);
  if(filter==='favorites'&&!favorites.map(String).includes(String(recipe.id))) return false;
  if(filter==='airfryer'&&!recipe.airfryer&&!recipe.airfryer_step) return false;
  if(filter==='highprotein'&&(!Number.isFinite(Number(recipe.prot))||Number(recipe.prot)<25)) return false;
  if(filter==='lowcarb'&&!cats.includes('lowcarb')) return false;
  if(filter==='salate'&&!isSalad(recipe)) return false;
  if(filter==='kalorienbewusst'&&!cats.includes('kalorienbewusst')) return false;
  if(filter in MEALS&&!meals(recipe).includes(filter)) return false;
  const haystack=fold([recipe.title,recipe.ingredients,recipe.zutaten_liste,recipe.prep,recipe.stove_step,recipe.oven_step,recipe.airfryer_step,recipe.description,recipe.tipps].join(' '));
  return fold(query).split(/[\s,]+/).filter(Boolean).every(term=>haystack.includes(term));
}
const fractions={'½':.5,'¼':.25,'¾':.75,'⅓':1/3,'⅔':2/3,'⅛':.125,'⅜':.375,'⅝':.625,'⅞':.875};
export function quantity(value) {
  const s=value.trim();
  if(s in fractions) return fractions[s];
  const compact=s.match(/^(\d+)([½¼¾⅓⅔⅛⅜⅝⅞])$/);
  if(compact) return Number(compact[1])+fractions[compact[2]];
  const mixed=s.match(/^(\d+)\s+(.+)$/);
  if(mixed) return Number(mixed[1])+quantity(mixed[2]);
  if(s.includes('/')) { const [a,b]=s.split('/').map(Number); return b>0?a/b:NaN; }
  return Number(s.replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(',','.'));
}
export const format = value => Number(value).toLocaleString('de-DE',{maximumFractionDigits:2});
export function scaleLine(line,multiplier=1) {
  const clean=text(line).replace(/^\s*[•*\-]\s*/, '').trim();
  const number='(?:\\d+\\s+(?:\\d+\\/\\d+|[½¼¾⅓⅔⅛⅜⅝⅞])|\\d+[½¼¾⅓⅔⅛⅜⅝⅞]|\\d+\\/\\d+|\\d+(?:[.,]\\d+)*|[½¼¾⅓⅔⅛⅜⅝⅞])';
  const re=new RegExp(`^((?:ca\\.\\s*|etwa\\s*|Saft von\\s*)?)(${number})(?:\\s*([–—-])\\s*(${number}))?`, 'i');
  return clean.replace(re,(_,prefix,a,dash,b)=>prefix+format(quantity(a)*multiplier)+(b?`–${format(quantity(b)*multiplier)}`:''));
}
export function ingredientLines(recipe,portions=1,side='keine',variation=null) {
  const v=variations(recipe)?.[variation], raw=v?.zutaten||recipe.zutaten_liste||recipe.ingredients||'';
  const lines=text(raw).split('\n').map(l=>scaleLine(l,portions)).filter(Boolean);
  if(SIDES[side]?.amount) lines.push(scaleLine(SIDES[side].amount,portions));
  return lines;
}
export function nutrition(recipe,portions=1,side='keine',variation=null) {
  const v=variations(recipe)?.[variation]||recipe, s=SIDES[side]||SIDES.keine;
  return Object.fromEntries(['kcal','prot','kh','sugar','fat','sat_fat','fiber','salt'].map(k=>[k, v[k]===null||v[k]===undefined ? null : Math.round((Number(v[k])+Number(s[k]||0))*portions*100)/100]));
}
export function cycleInfo(start,length=28,now=new Date()) {
  const n=Number(length);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||!Number.isInteger(n)||n<18||n>45) return null;
  const [y,m,d]=start.split('-').map(Number), from=Date.UTC(y,m-1,d), today=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate());
  const date=new Date(from);
  if(date.getUTCFullYear()!==y||date.getUTCMonth()!==m-1||date.getUTCDate()!==d) return null;
  const delta=Math.round((today-from)/86400000); if(delta<0) return null;
  const day=delta%n+1, ovulation=Math.max(8,n-14);
  if(day<=5) return {day,name:'Menstruation',hint:'Wärmende Mahlzeiten und eisenreiche Zutaten können jetzt gut passen.',query:'spinat',icon:'◒'};
  if(day<ovulation-1) return {day,name:'Follikelphase',hint:'Ideen mit frischem Gemüse und Proteinquellen.',query:'brokkoli',icon:'♧'};
  if(day<=ovulation+1) return {day,name:'Eisprung',hint:'Bunte, ausgewogene Mahlzeiten mit Gemüse und guten Fetten.',query:'avocado',icon:'☼'};
  return {day,name:'Lutealphase',hint:'Sättigende Mahlzeiten mit Eiweiß und Ballaststoffen.',query:'quark',icon:'◐'};
}
const FIELDS=['created_at','recipes','title','ingredients','prep','description','category','calories','image','emoji','airfryer','kcal','prot','kh','fat','stove_step','airfryer_step','oven_step','doc_check','zutaten_liste','tipps','sugar','sat_fat','fiber','salt','has_side','score','image_url'];
export function importRows(input) {
  const list=Array.isArray(input)?input:input?.recipes;
  if(!Array.isArray(list)||!list.length||list.length>1000) throw Error('Bitte ein Backup mit 1 bis 1.000 Rezepten auswählen.');
  const seen=new Set();
  return list.map(r=>{
    if(!r||typeof r!=='object'||typeof r.title!=='string') throw Error('Jedes Rezept benötigt einen gültigen Titel.');
    const title=r.title.trim();
    if(!title||title.length>300) throw Error('Jedes Rezept benötigt einen gültigen Titel.');
    if(seen.has(fold(title))) throw Error('Doppelte Rezepttitel im Backup.'); seen.add(fold(title));
    const row=Object.fromEntries(FIELDS.filter(k=>r[k]!==undefined).map(k=>[k,r[k]]));
    row.title=title;
    if(r.id!==undefined){ if(!Number.isSafeInteger(Number(r.id))||Number(r.id)<1) throw Error('Ungültige Rezept-ID.'); row.id=Number(r.id); }
    row.category=JSON.stringify(categories(r.category));
    for(const [a,b] of Object.entries({zutatenListe:'zutaten_liste',stoveStep:'stove_step',ovenStep:'oven_step',airfryerStep:'airfryer_step',docCheck:'doc_check'})) if(row[b]===undefined&&r[a]!==undefined) row[b]=r[a];
    for(const k of ['kcal','prot','kh','sugar','fat']) if(row[k]===undefined&&r.baseNutri?.[k]!==undefined) row[k]=r.baseNutri[k];
    for(const k of ['kcal','prot','kh','sugar','fat','sat_fat','fiber','salt']) if(row[k]!==undefined&&row[k]!==null&&(!Number.isFinite(Number(row[k]))||Number(row[k])<0)) throw Error('Ungültige Nährwerte im Backup.');
    for(const k of Object.keys(row)) if(typeof row[k]==='string'&&row[k].length>30000) throw Error('Ein Feld im Backup ist zu lang.');
    return row;
  });
}
export function variations(recipe) { return recipe._variations||null; }
