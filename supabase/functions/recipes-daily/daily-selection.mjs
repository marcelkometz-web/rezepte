import {confirmedHarvests,recipeHarvestMatches}from './harvest-selection.mjs';
export function selectDailyRecipes(recipes, date, {harvests=[]}={}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date + 'T12:00:00Z').toISOString().slice(0,10)!==date) throw new Error('Ungültiges Datum.');
  const valid = recipes.filter(row => row?.id != null && typeof row.title === 'string' && row.title.trim());
  const has = (row,tag) => (Array.isArray(row.category)?row.category:String(row.category||'').replace(/[{}[\]"\\]/g,'').split(',')).some(value=>String(value).trim().toLowerCase()===tag);
  const mindful = valid.filter(row=>has(row,'kalorienbewusst'));
  const pool = mindful.length>=2?mindful:valid;
  const mains = pool.filter(row=>has(row,'mittag')||has(row,'abend'));
  const list = (mains.length>=2?mains:pool).slice().sort((a,b)=>String(a.id).localeCompare(String(b.id),'en',{numeric:true}));
  const confirmed=confirmedHarvests(harvests,date),matches=row=>recipeHarvestMatches(row,confirmed);
  const decorate=row=>({id:row.id,title:row.title,emoji:row.emoji,kcal:row.kcal,prot:row.prot,category:row.category,harvestMatches:matches(row)});
  if (list.length < 2) return list.map(decorate);
  const start = ((Math.floor(Date.parse(date) / 86400000) % list.length) + list.length) % list.length;
  const rotated=[...list.slice(start),...list.slice(0,start)],ranked=rotated.map((row,index)=>({row,index,score:matches(row).length})).sort((a,b)=>b.score-a.score||a.index-b.index);
  // Keep the existing separated rotation when no recorded ingredient matches.
  const selected=ranked[0].score?ranked.slice(0,2).map(item=>item.row):[list[start],list[(start + Math.max(1,Math.floor(list.length / 2))) % list.length]];
  return selected.map(decorate);
}
