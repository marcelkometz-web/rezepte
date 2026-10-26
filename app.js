// app.js
// Hauptlogik für Rezepte

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let searchTimeout = null;
let favorites = JSON.parse(localStorage.getItem('gartenMuttiFavs')) || [];
let currentSelectedPortions = 1; 
let sharedGeminiApiKey = "";

function lockScroll() { document.body.classList.add('modal-open'); }
function unlockScroll() { document.body.classList.remove('modal-open'); }

let secureAdminPin = null;

// Holt das Passwort unsichtbar im Hintergrund aus Supabase
async function fetchAdminPin() {
  if (secureAdminPin) return secureAdminPin; 
  try {
    const { data, error } = await supabaseClient
      .from('Notizen')
      .select('content')
      .eq('author', 'SYSTEM_ADMIN_PIN')
      .limit(1);
    if (!error && data && data.length > 0) {
      secureAdminPin = data[0].content.trim();
    }
  } catch (e) { console.error(e); }
  return secureAdminPin;
}

// Speichert den PIN aus den Einstellungen
async function saveAdminPin() {
  const realPin = await fetchAdminPin();
  const pin = document.getElementById('adminPinInput').value;
  localStorage.setItem('gartenAdminPin', pin);
  if (realPin && pin === realPin) {
    alert('✅ Passwort korrekt gespeichert! Du hast jetzt volle Admin-Rechte.');
  } else {
    alert('⚠️ Passwort gespeichert, es ist aber falsch!');
  }
}

// Prüft das Passwort (mit lokalem Speicher, damit du es nur einmal eingeben musst)
async function checkAdmin() {
  const realPin = await fetchAdminPin();
  if (!realPin) {
    alert('Systemfehler: Admin-PIN nicht in Datenbank gefunden! (Bitte als SYSTEM_ADMIN_PIN in Supabase anlegen)');
    return false;
  }

  const saved = localStorage.getItem('gartenAdminPin');
  if (saved === realPin) return true; // Du bist bereits eingeloggt!
  
  const input = prompt('🔒 Geschützter Bereich! Bitte Admin-Passwort eingeben:');
  if (input === realPin) {
    localStorage.setItem('gartenAdminPin', realPin); // Speichert es für dich ab
    return true;
  }
  alert('❌ Falsches Passwort! Zugriff verweigert.');
  return false;
}

// Bild-Komprimierung im Browser vor dem Upload
function compressImageAndConvertToBlob(dataURI) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataURI;
    img.onload = function() {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      const maxWidth = 800;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.8);
    };
  });
}

const SPECIAL_VARIATIONS = {
  "5 gesunde dips": {
    "aioli": { name: "🧄 Aioli", kcal: 180, prot: 0.5, kh: 1.0, sugar: 0.5, fat: 19.0, zutaten: "• 120 ml Mayonnaise\n• 2 Knoblauchzehen (gepresst)\n• 1 EL frischer Zitronensaft\n• Prise Salz & Pfeffer", prep: "Knoblauch pressen, mit Mayonnaise und Zitronensaft glatt rühren." },
    "honig_senf": { name: "🍯 Honig-Senf", kcal: 140, prot: 0.5, kh: 6.0, sugar: 5.5, fat: 12.0, zutaten: "• 120 ml Mayonnaise\n• 2 EL Dijon-Senf\n• 2 EL Honig\n• 1 TL Apfelessig", prep: "Alle Zutaten gründlich verrühren, bis sich der Honig komplett gelöst hat." },
    "salsa": { name: "🍅 Tomaten-Salsa", kcal: 35, prot: 1.0, kh: 6.0, sugar: 4.0, fat: 0.5, zutaten: "• 4 reife Tomaten\n• 1/2 rote Zwiebel\n• 1 Jalapeño (ohne Kerne)\n• Handvoll frischer Koriander\n• Saft von 1 Limette", prep: "Tomaten, Zwiebel und Jalapeño extrem fein würfeln. Koriander hacken. Mit Limettensaft vermengen. 30 Min ziehen lassen." },
    "teriyaki": { name: "🥢 Teriyaki Soße", kcal: 65, prot: 3.0, kh: 13.0, sugar: 11.0, fat: 0.1, zutaten: "• 120 ml Sojasauce\n• 2 EL brauner Zucker\n• 1 EL Honig\n• 1 EL Reisessig\n• 1 TL Ingwer (gerieben)\n• 1 Knoblauchzehe", prep: "Alle Zutaten aufkochen. Hitze reduzieren und ca. 5-10 Minuten einköcheln lassen, bis es leicht andickt." },
    "tzatziki": { name: "🥒 Tzatziki", kcal: 55, prot: 4.0, kh: 3.5, sugar: 3.0, fat: 2.5, zutaten: "• 240 ml Griechischer Joghurt\n• 1/2 Salatgurke\n• 2 EL frischer Dill\n• 1 EL Zitronensaft\n• 1 Knoblauchzehe", prep: "Gurke raspeln, salzen und Wasser auspressen. Knoblauch pressen. Mit Joghurt, Zitrone und Dill verrühren." }
  }
};

function getVariationsForRecipe(title) {
   if(!title) return null; const t = title.toLowerCase();
   for (const key in SPECIAL_VARIATIONS) { if (t.includes(key.toLowerCase())) return SPECIAL_VARIATIONS[key]; } return null;
}

const INGREDIENT_GROUPS = {
  'fleisch': { icon: '🥩', title: 'Fleisch & Fisch', items: ['Hähnchen', 'Rind', 'Hackfleisch', 'Schwein', 'Pute', 'Lachs', 'Garnelen', 'Thunfisch', 'Speck'] },
  'gemuese': { icon: '🥦', title: 'Gemüse & Grünzeug', items: ['Brokkoli', 'Wirsing', 'Zucchini', 'Blumenkohl', 'Spinat', 'Kohlrabi', 'Lauch', 'Möhren', 'Kartoffeln', 'Süßkartoffel', 'Paprika', 'Tomaten', 'Gurke', 'Pilze', 'Bohnen', 'Erbsen', 'Spitzkohl', 'Avocado', 'Kürbis', 'Aubergine'] },
  'milch': { icon: '🧀', title: 'Proteine & Milch', items: ['Eier', 'Quark', 'Feta', 'Mozzarella', 'Parmesan', 'Frischkäse', 'Sahne', 'Joghurt', 'Butter', 'Tofu'] },
  'basics': { icon: '🧄', title: 'Basics', items: ['Knoblauch', 'Zwiebel', 'Schalotte', 'Chili', 'Ingwer', 'Kräuter', 'Senf', 'Tomatenmark', 'Nüsse', 'Mandeln'] }
};

const GEMINI_MODELS = {
  'flash-lite': { 
    label: '3.5 Flash-Lite', 
    sub: 'Schnellste Antworten', 
    apiModels: ['gemini-3.8-flash'], 
    temp: 0.65 
  },
  'flash': { 
    label: '3.8 Flash', 
    sub: 'Vielseitige Unterstützung', 
    apiModels: ['gemini-3.8-flash'], 
    temp: 0.72 
  },
  'pro': { 
    label: '3.1 Pro', 
    sub: 'Logisches Schlussfolgern', 
    apiModels: ['gemini-3.8-flash'], 
    temp: 0.78 
  },
  'argon': { 
    label: '4 Argon', 
    sub: 'Komplexe Aufgaben', 
    apiModels: ['gemini-3.8-flash'], 
    temp: 0.82 
  }
};

let selectedGeminiModelKey = localStorage.getItem('gartenMuttiGeminiModel') || 'argon';
let selectedThinkingEffort = localStorage.getItem('gartenMuttiThinkingEffort') || 'mittel';

const sideOptions = {
  "keine": { name: "Ohne Extra-Beilage", kcal: 0, kh: 0, sugar: 0, fat: 0, prot: 0, insulin: "Optimal stabil" },
  "protein_nudeln": { name: "Protein-Nudeln (+100g)", kcal: 145, kh: 18, sugar: 1.5, fat: 1.8, prot: 14.0, insulin: "Stabil" },
  "zoodles": { name: "Zucchini-Nudeln (+150g)", kcal: 22, kh: 3.1, sugar: 2.2, fat: 0.4, prot: 1.8, insulin: "Ketogen" },
  "basmati_reis": { name: "Basmati-Reis (+100g)", kcal: 130, kh: 28, sugar: 0.1, fat: 0.3, prot: 2.7, insulin: "Mäßig" },
  "kartoffeln": { name: "Kartoffeln (+150g)", kcal: 110, kh: 23, sugar: 1.2, fat: 0.2, prot: 3.0, insulin: "Peak" }
};

const CATEGORY_NAMES = { 'fruehstueck': { label: 'Frühstück', icon: '🍳' }, 'mittag': { label: 'Mittagessen', icon: '🍲' }, 'abend': { label: 'Abendessen', icon: '🥩' }, 'snacks': { label: 'Snacks', icon: '🧁' } };

let recipes = []; let currentCategory = 'all'; let currentSubFilter = null; let capturedBase64Image = null;

function escapeHtml(text) { return String(text||'').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }

function openGartenApp() { window.open('https://marcelkometz-web.github.io/Mona/', '_blank'); }

function openReadmeModal() { document.getElementById('readmeBackdrop').classList.add('active'); lockScroll(); }
function closeReadmeModalForce() { document.getElementById('readmeBackdrop').classList.remove('active'); unlockScroll(); }

function openImpressumModal() { document.getElementById('impressumBackdrop').classList.add('active'); lockScroll(); }
function closeImpressumModalForce() { document.getElementById('impressumBackdrop').classList.remove('active'); unlockScroll(); }

function openEierModal() { document.getElementById('eierBackdrop').classList.add('active'); lockScroll(); }
function closeEierModalForce() { document.getElementById('eierBackdrop').classList.remove('active'); unlockScroll(); }

function openIngredientModal(groupKey) {
  const group = INGREDIENT_GROUPS[groupKey]; if (!group) return;
  document.getElementById('ingModalTitle').innerHTML = `${group.icon} ${group.title}`;
  const terms = document.getElementById('searchInput').value.toLowerCase().split(/[\s,]+/).filter(t => t.length > 0);
  document.getElementById('ingModalGrid').innerHTML = group.items.map(item => {
    const isActive = terms.includes(item.toLowerCase());
    return `<button class="chip-btn ${isActive ? 'active' : ''}" style="margin:4px; font-size:0.9rem; padding:8px 14px;" onclick="toggleModalIngredient('${item.toLowerCase()}', this)">${item}</button>`;
  }).join('');
  document.getElementById('ingredientBackdrop').classList.add('active'); lockScroll();
}

function toggleModalIngredient(item, btn) {
  btn.classList.toggle('active'); let input = document.getElementById('searchInput');
  let terms = input.value.toLowerCase().split(/[\s,]+/).filter(t => t.length > 0);
  if (btn.classList.contains('active')) { if (!terms.includes(item)) terms.push(item); } else { terms = terms.filter(t => t !== item); }
  input.value = terms.join(' '); document.getElementById('clearSearchBtn').style.display = input.value.trim().length > 0 ? 'block' : 'none';
  filterRecipes();
}

function closeIngredientModalForce() { document.getElementById('ingredientBackdrop').classList.remove('active'); unlockScroll(); }
function closeIngredientModal(e) { if (e.target.id === 'ingredientBackdrop') closeIngredientModalForce(); }
function openNavFilterModal() { document.getElementById('navFilterBackdrop').classList.add('active'); lockScroll(); }
function closeNavFilterModalForce() { document.getElementById('navFilterBackdrop').classList.remove('active'); unlockScroll(); }
function closeNavFilterModal(e) { if (e.target.id === 'navFilterBackdrop') closeNavFilterModalForce(); }
function clearSubFilter() { currentSubFilter = null; document.getElementById('subfilterBadge').style.display = 'none'; filterRecipes(); }

function initTheme() {
  const savedTheme = localStorage.getItem('gartenMuttiTheme') || 'warm-dark';
  document.getElementById('themeSelect').value = savedTheme; applyTheme(savedTheme);
}
function changeTheme(t) { localStorage.setItem('gartenMuttiTheme', t); applyTheme(t); }
function applyTheme(t) { if (t === 'warm-dark') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t); }

async function loadSharedGeminiKeyFromDB() {
  if (MASTER_GEMINI_API_KEY && MASTER_GEMINI_API_KEY.length > 15) { sharedGeminiApiKey = MASTER_GEMINI_API_KEY.trim(); return; }
  try {
    const { data, error } = await supabaseClient.from('Notizen').select('content').eq('author', 'SYSTEM_GEMINI_KEY').limit(1);
    if (!error && data && data.length > 0 && data[0].content) sharedGeminiApiKey = data[0].content.trim();
  } catch (e) {}
}

function toggleFavorite(id, event) {
  if (event) event.stopPropagation(); const idx = favorites.indexOf(String(id));
  if (idx === -1) favorites.push(String(id)); else favorites.splice(idx, 1);
  localStorage.setItem('gartenMuttiFavs', JSON.stringify(favorites)); filterRecipes();
  const modalBtn = document.getElementById('modalFavBtn');
  if (modalBtn) modalBtn.innerHTML = favorites.includes(String(id)) ? '❤️ Favorit' : '🤍 Merken';
}

function getMealType(r) {
  const t = (r.title || '').toLowerCase(); const c = Array.isArray(r.category) ? r.category.join(' ').toLowerCase() : '';
  if (t.includes('frühstück') || c.includes('fruehstueck')) return 'fruehstueck';
  if (t.includes('nachtisch') || c.includes('dessert') || c.includes('snacks')) return 'snacks';
  if (t.includes('brot') || c.includes('abend')) return 'abend'; return 'mittag';
}

function getScoreClass(score) {
  const s = String(score || 'A').toUpperCase();
  if (s === 'A') return 'var(--score-a)'; if (s === 'B') return 'var(--score-b)';
  if (s === 'C') return 'var(--score-c)'; if (s === 'D') return 'var(--score-d)'; return 'var(--score-e)';
}

async function loadRecipesFromSupabase() {
  const status = document.getElementById('syncStatus'); status.innerText = '⏳ Lade...';
  try {
    const { data, error } = await supabaseClient.from('Rezepte').select('*').order('id', { ascending: true });
    if (error) throw error;
    if (data && data.length > 0) {
      recipes = data.map(item => {
        let cat = Array.isArray(item.category) ? item.category : (item.category ? [item.category] : []);
        let ing = Array.isArray(item.ingredients) ? item.ingredients : (item.ingredients ? item.ingredients.split(',').map(s=>s.trim().toLowerCase()) : []);
        let score = item.score || 'A';
        let rec = {
          id: item.id, title: item.title || item.titel || 'Rezept', emoji: item.emoji || '🍲', category: cat,
          airfryer: item.airfryer === true || item.airfryer === 'true', score: score, scoreClass: getScoreClass(score),
          selectedSide: item.selectedSide || 'keine', ingredients: ing, zutatenListe: item.zutaten_liste || ing.join(', '),
          tipps: item.tipps || '', docCheck: item.doc_check || '', image_url: item.image_url || null,
          baseNutri: { kcal: item.kcal != null ? Number(item.kcal) : 300, kh: item.kh != null ? Number(item.kh) : 5, sugar: item.sugar != null ? Number(item.sugar) : 2.0, fat: item.fat != null ? Number(item.fat) : 10, prot: item.prot != null ? Number(item.prot) : 25 },
          prep: item.prep || 'Zutaten vorbereiten.', stoveStep: item.stove_step || '', ovenStep: item.oven_step || '', airfryerStep: item.airfryer_step || ''
        };
        rec.mealType = getMealType(rec); return rec;
      });
      status.innerText = `⚡ ${recipes.length} Rezepte synchronisiert`;
    }
  } catch (err) { status.innerText = '⚡ Offline-Modus aktiv'; }
  filterRecipes();
}

function calculateTotalNutri(recipe, tempSide = null, portions = 1, variationKey = null) {
  let baseKcal = Number(recipe.baseNutri.kcal); let baseKh = Number(recipe.baseNutri.kh);
  let baseSugar = Number(recipe.baseNutri.sugar || 2); let baseFat = Number(recipe.baseNutri.fat);
  let baseProt = Number(recipe.baseNutri.prot);

  const vars = getVariationsForRecipe(recipe.title);
  if (vars && variationKey && vars[variationKey]) {
    baseKcal = vars[variationKey].kcal; baseKh = vars[variationKey].kh;
    baseSugar = vars[variationKey].sugar; baseFat = vars[variationKey].fat; baseProt = vars[variationKey].prot;
  }

  const sideKey = tempSide !== null ? tempSide : (recipe.selectedSide || 'keine'); 
  const side = sideOptions[sideKey] || sideOptions['keine'];
  
  let totalKcal = baseKcal + Number(side.kcal); let totalKh = baseKh + Number(side.kh);
  let totalSugar = baseSugar + Number(side.sugar || 0); let totalFat = baseFat + Number(side.fat); let totalProt = baseProt + Number(side.prot);

  return { kcal: Math.round(totalKcal * portions), kh: (totalKh * portions).toFixed(1), sugar: (totalSugar * portions).toFixed(1), fat: (totalFat * portions).toFixed(1), prot: (totalProt * portions).toFixed(1), insulin: side.insulin || "Optimal stabil" };
}

function generateScaledIngredients(rawText, portions) {
  if (!rawText) return 'Keine Zutatenliste hinterlegt.';
  return rawText.split('\n').map(line => {
    let clean = line.replace(/•/g, '').trim(); if (!clean) return '';
    let scaled = clean.replace(/^([\d.,]+)\s*(g|ml|EL|TL|Stück|Dose|Prise|Scheiben|Kopf|Becher)?/i, (match, num, unit) => {
      let parsed = parseFloat(num.replace(',', '.'));
      if (!isNaN(parsed)) { let res = parsed * portions; return `${Number.isInteger(res) ? res : res.toFixed(1).replace('.', ',')} ${unit || ''}`; }
      return match;
    }); return `• ${scaled}`;
  }).join('\n');
}

function filterRecipes() {
  try {
    const searchVal = document.getElementById('searchInput').value.toLowerCase().trim();
    const terms = searchVal ? searchVal.split(/[\s,]+/).filter(t => t.length > 0) : [];

    const filtered = recipes.filter(r => {
      let matchesCat = true;
      if (currentCategory === 'favoriten') matchesCat = favorites.includes(String(r.id));
      else if (currentCategory === 'airfryer') matchesCat = r.airfryer === true;
      else if (currentCategory === 'highprotein') matchesCat = r.baseNutri.prot >= 25;
      else if (['fruehstueck', 'mittag', 'abend', 'snacks'].includes(currentCategory)) matchesCat = r.mealType === currentCategory;
      else if (currentCategory !== 'all') matchesCat = Array.isArray(r.category) ? r.category.some(c => String(c).toLowerCase().includes(currentCategory)) : false;

      let matchesSub = true;
      if (currentSubFilter) {
        try {
          const subRegex = new RegExp(`(^|[^a-zäöüß])${currentSubFilter}([^a-zäöüß]|$)`, 'i');
          matchesSub = subRegex.test(r.title) || (r.ingredients && r.ingredients.some(i => subRegex.test(i))) || subRegex.test(r.zutatenListe);
        } catch (e) { matchesSub = true; }
      }

      let matchesTerms = true;
      if (terms.length > 0) {
        matchesTerms = terms.every(term => {
          try {
            const regex = new RegExp(`(^|[^a-zäöüß])${term}`, 'i');
            return regex.test(r.title) || (r.ingredients && r.ingredients.some(i => regex.test(i))) || regex.test(r.zutatenListe);
          } catch (e) { return true; }
        });
      }
      return matchesCat && matchesSub && matchesTerms;
    });
    renderList(filtered);
  } catch (err) {
    console.error("Suchfehler abgefangen:", err);
  }
}

function onSearchManual() {
  const input = document.getElementById('searchInput'); document.getElementById('clearSearchBtn').style.display = input.value.trim().length > 0 ? 'block' : 'none';
  if (searchTimeout) clearTimeout(searchTimeout); searchTimeout = setTimeout(filterRecipes, 250);
}

function clearSearch() { document.getElementById('searchInput').value = ''; document.getElementById('clearSearchBtn').style.display = 'none'; document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active')); filterRecipes(); }

function buildCardHtml(r) {
  const total = calculateTotalNutri(r, 'keine', 1); const isFav = favorites.includes(String(r.id));
  const imageOrEmoji = r.image_url 
    ? `<div class="card-icon" style="background-image: url('${r.image_url}'); background-size: cover; background-position: center; border: 1px solid var(--border);"></div>`
    : `<div class="card-icon">${escapeHtml(r.emoji || '🍲')}</div>`;

  return `
    <div class="recipe-card" onclick="openDetails('${escapeHtml(r.id)}')">
      <button class="fav-btn-card ${isFav ? 'is-fav' : ''}" onclick="toggleFavorite('${escapeHtml(r.id)}', event)">${isFav ? '❤️' : '🤍'}</button>
      ${imageOrEmoji}
      <div class="card-meta">
        <h3>${escapeHtml(r.title)}</h3>
        <div class="card-badges"><span class="badge-ampel" style="background: ${r.scoreClass || 'var(--score-a)'}">Nutri ${escapeHtml(r.score || 'A')}</span>${r.airfryer ? '<span class="badge-airfryer">🌪️ Airfryer</span>' : ''}</div>
      </div>
      <div class="card-quick-macros"><span>🔥 ${total.kcal} kcal</span><span class="prot">💪 ${total.prot}g EW</span></div>
    </div>
  `;
}

function renderList(list) {
  const container = document.getElementById('recipeList'); if (!container) return; container.innerHTML = '';
  if (list.length === 0) { container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">Keine passenden Rezepte gefunden.</div>`; return; }
  if (currentCategory !== 'all') { container.innerHTML = list.map(r => buildCardHtml(r)).join(''); return; }
  const groups = { 'fruehstueck': [], 'mittag': [], 'abend': [], 'snacks': [] };
  list.forEach(r => { if (groups[r.mealType]) groups[r.mealType].push(r); else groups['mittag'].push(r); });
  let html = '';
  for (const [key, items] of Object.entries(groups)) {
    if (items.length > 0 && CATEGORY_NAMES[key]) {
      html += `<div class="category-divider">${CATEGORY_NAMES[key].icon} ${CATEGORY_NAMES[key].label} (${items.length})</div>`;
      html += items.map(r => buildCardHtml(r)).join('');
    }
  }
  container.innerHTML = html;
}

function updatePortionOrSide(recipeId, changePortion = 0) {
  let next = currentSelectedPortions + changePortion;
  if (next < 1) next = 1; if (next > 20) next = 20; currentSelectedPortions = next;
  const portEl = document.getElementById(`portionCount-${recipeId}`); if (portEl) portEl.innerText = currentSelectedPortions;

  const r = recipes.find(x => String(x.id) === String(recipeId)); if (!r) return;
  const sideSelect = document.getElementById(`sideSelect-${recipeId}`); const chosenSide = sideSelect ? sideSelect.value : 'keine'; r.selectedSide = chosenSide;

  const varSelect = document.getElementById(`variationSelect-${recipeId}`);
  const chosenVar = varSelect ? varSelect.value : null;

  const total = calculateTotalNutri(r, chosenSide, currentSelectedPortions, chosenVar);

  document.getElementById(`valKcal-${recipeId}`).innerText = total.kcal; document.getElementById(`valProt-${recipeId}`).innerText = `${total.prot} g`;
  document.getElementById(`valKh-${recipeId}`).innerText = `${total.kh} g`; document.getElementById(`valSugar-${recipeId}`).innerText = `${total.sugar} g`;
  document.getElementById(`valFat-${recipeId}`).innerText = `${total.fat} g`; document.getElementById(`valInsulin-${recipeId}`).innerText = total.insulin;
  
  let currentZutaten = r.zutatenListe; let currentPrep = r.prep; const vars = getVariationsForRecipe(r.title);

  if (vars && chosenVar && vars[chosenVar]) {
    currentZutaten = vars[chosenVar].zutaten; currentPrep = vars[chosenVar].prep;
    const prepEl = document.getElementById(`prepText-${recipeId}`); if(prepEl) prepEl.innerText = currentPrep;
  }
  document.getElementById(`ingredientsBox-${recipeId}`).innerText = generateScaledIngredients(currentZutaten, currentSelectedPortions);
}

function openDetails(recipeId) {
  const r = recipes.find(x => String(x.id) === String(recipeId)); if (!r) return;
  currentSelectedPortions = 1; const safeId = escapeHtml(r.id);
  const chosenSide = r.selectedSide || 'keine'; const total = calculateTotalNutri(r, chosenSide, currentSelectedPortions);
  const isFav = favorites.includes(String(r.id));
  let sideOptionsHtml = Object.entries(sideOptions).map(([k, v]) => `<option value="${k}" ${chosenSide === k ? 'selected' : ''}>${v.name}</option>`).join('');

  let variationHtml = ''; let initialVarKey = null; let displayZutaten = r.zutatenListe; let displayPrep = r.prep;
  const vars = getVariationsForRecipe(r.title);
  if (vars) {
    initialVarKey = Object.keys(vars)[0]; displayZutaten = vars[initialVarKey].zutaten; displayPrep = vars[initialVarKey].prep;
    let varOptions = Object.entries(vars).map(([k, v]) => `<option value="${k}">${v.name}</option>`).join('');
    variationHtml = `
      <div class="swap-row" style="border-color: #a371f7; background: rgba(163, 113, 247, 0.05); margin-bottom: 12px;">
        <label style="color: #a371f7; font-weight: 800;">🥣 Sorte wählen:</label>
        <select id="variationSelect-${safeId}" onchange="updatePortionOrSide('${safeId}', 0)" style="background: var(--bg); color: #a371f7; border: 1px solid #a371f7; border-radius: 6px; padding: 6px 10px; font-size: 0.85rem; font-weight: 700; outline: none; max-width: 60%;">${varOptions}</select>
      </div>
    `;
  }

  const imageOrEmojiHtml = r.image_url
    ? `<div style="text-align:center; margin-bottom: 15px;"><img src="${r.image_url}" style="width: 100%; max-height: 250px; object-fit: cover; border-radius: 14px; border: 1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.2);"></div>`
    : `<div style="font-size: 2.4rem; text-align:center;">${escapeHtml(r.emoji || '🍲')}</div>`;

  document.getElementById('sheetContent').innerHTML = `
    ${imageOrEmojiHtml}
    <h2 style="font-size: 1.35rem; margin: 10px 0; text-align:center;">${escapeHtml(r.title)}</h2>
    <div style="display:flex; justify-content:center; gap:8px; margin-bottom: 14px;">
      <button id="modalFavBtn" class="add-notes-btn" style="width: auto; margin:0; padding: 6px 14px;" onclick="toggleFavorite('${safeId}', event)">${isFav ? '❤️ Favorit' : '🤍 Merken'}</button>
      <span class="badge-ampel" style="background: ${r.scoreClass}; display:inline-flex; align-items:center; padding: 6px 10px; font-size:0.78rem;">Nutri-Score ${escapeHtml(r.score || 'A')}</span>
    </div>
    
    <div class="portion-row">
      <label>👥 Portionen:</label>
      <button class="portion-btn" onclick="updatePortionOrSide('${safeId}', -1)">-</button>
      <span class="portion-display" id="portionCount-${safeId}">${currentSelectedPortions}</span>
      <button class="portion-btn" onclick="updatePortionOrSide('${safeId}', 1)">+</button>
    </div>
    
    ${variationHtml}

    <div class="swap-row"><label>🔄 Beilagen-Tausch:</label><select id="sideSelect-${safeId}" onchange="updatePortionOrSide('${safeId}', 0)">${sideOptionsHtml}</select></div>
    <div class="nutri-carousel">
      <div class="nutri-pill"><span>Kcal</span><strong id="valKcal-${safeId}">${total.kcal}</strong></div>
      <div class="nutri-pill"><span style="color:#3fb950;">Eiweiß</span><strong id="valProt-${safeId}" style="color:#3fb950;">${total.prot} g</strong></div>
      <div class="nutri-pill"><span>Kohlenh.</span><strong id="valKh-${safeId}">${total.kh} g</strong></div>
      <div class="nutri-pill"><span>Zucker</span><strong id="valSugar-${safeId}">${total.sugar} g</strong></div>
      <div class="nutri-pill"><span>Fett</span><strong id="valFat-${safeId}">${total.fat} g</strong></div>
      <div class="nutri-pill"><span>Insulin</span><strong id="valInsulin-${safeId}" style="font-size:0.78rem;">${total.insulin}</strong></div>
    </div>
    ${r.docCheck ? `<div class="step-section" style="border-color:#3fb950; background:rgba(46,160,67,0.1);"><h4>🩺 Doc-Check & Gesundheit</h4><p style="color:var(--text);">${escapeHtml(r.docCheck)}</p></div>` : ''}
    <div class="section-title">🛒 Zutatenliste (${currentSelectedPortions} Port.):</div>
    <div class="ingredients-box" id="ingredientsBox-${safeId}">${escapeHtml(generateScaledIngredients(displayZutaten, currentSelectedPortions))}</div>
    <button class="whatsapp-btn" onclick="shareWhatsApp('${safeId}')">📲 Einkaufsliste per WhatsApp senden</button>
    <button class="add-notes-btn" onclick="addIngredientsToNotes('${safeId}')">📝 Auf unsere Notiz-Einkaufsliste setzen</button>
    <div class="section-title">👩‍🍳 Zubereitung:</div>
    <div class="step-section"><h4>🔪 Vorbereitung / Zubereitung</h4><p id="prepText-${safeId}">${escapeHtml(displayPrep)}</p></div>
    ${(!vars && r.stoveStep) ? `<div class="step-section"><h4>🍳 Herd</h4><p>${escapeHtml(r.stoveStep)}</p></div>` : ''}
    ${(!vars && r.ovenStep) ? `<div class="step-section"><h4>🔥 Backofen</h4><p>${escapeHtml(r.ovenStep)}</p></div>` : ''}
    ${(!vars && r.airfryerStep) ? `<div class="step-section"><h4>🌪️ Airfryer</h4><p>${escapeHtml(r.airfryerStep)}</p></div>` : ''}
    <div class="section-title">💡 Eigene Tipps & Notizen zum Rezept:</div>
    <textarea id="editTipps-${safeId}" class="editable-tipps" placeholder="Eigene Erfahrungen, Gewürze oder Anpassungen hier eintragen...">${escapeHtml(r.tipps || '')}</textarea>
    <div style="display:flex; justify-content:space-between; gap:10px; margin-top:6px;">
      <button class="btn-save-small" style="flex:1;" onclick="saveRecipeTipps('${safeId}')">💾 Tipps speichern</button>
      <button class="btn-save-small" style="background:#da3633;" onclick="deleteRecipeFromDB('${safeId}')">🗑️ Löschen</button>
    </div>
  `;
  document.getElementById('modalBackdrop').classList.add('active'); lockScroll();
}

async function saveRecipeTipps(recipeId) {
  if (!(await checkAdmin())) return;
  const newTipps = document.getElementById(`editTipps-${recipeId}`).value;
  const r = recipes.find(x => String(x.id) === String(recipeId)); if (r) r.tipps = newTipps;
  await supabaseClient.from('Rezepte').update({ tipps: newTipps }).eq('id', recipeId);
  alert('Tipps erfolgreich gespeichert!');
}

async function deleteRecipeFromDB(recipeId) {
  if (!(await checkAdmin())) return;
  if (!confirm('Möchtest du dieses Rezept wirklich dauerhaft löschen?')) return;
  await supabaseClient.from('Rezepte').delete().eq('id', recipeId);
  closeSheetForce(); triggerRefresh();
}

async function addIngredientsToNotes(recipeId) {
  const r = recipes.find(x => String(x.id) === String(recipeId)); if (!r) return;
  const zutatenText = document.getElementById(`ingredientsBox-${recipeId}`).innerText;
  const content = `🛒 Einkauf für ${r.title} (${currentSelectedPortions} Port.): ` + zutatenText.replace(/\n/g, ', ');
  await supabaseClient.from('Notizen').insert([{ author: 'Ramona', content: content, is_done: false }]);
  alert('Zutaten wurden in eure Notizliste eingetragen!');
}

function shareWhatsApp(recipeId) {
  const r = recipes.find(x => String(x.id) === String(recipeId)); if (!r) return;
  const zutatenText = document.getElementById(`ingredientsBox-${recipeId}`).innerText;
  let text = `🛒 *Einkaufsliste: ${r.title} (${currentSelectedPortions} Portionen)*\n\n` + zutatenText;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function closeSheetForce() { document.getElementById('modalBackdrop').classList.remove('active'); unlockScroll(); }
function closeSheet(e) { if (e.target.id === 'modalBackdrop') closeSheetForce(); }
function closeReadmeModal(e) { if (e.target.id === 'readmeBackdrop') closeReadmeModalForce(); }
function closeImpressumModal(e) { if (e.target.id === 'impressumBackdrop') closeImpressumModalForce(); }
function closeEierModal(e) { if (e.target.id === 'eierBackdrop') closeEierModalForce(); }

function hideAllViews() {
  document.getElementById('recipesSection').style.display = 'none'; document.getElementById('notesSection').style.display = 'none';
  document.getElementById('settingsSection').style.display = 'none'; document.getElementById('cycleSection').style.display = 'none';
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
}

function handleNavCategory(cat) {
  hideAllViews(); closeNavFilterModalForce(); document.getElementById('recipesSection').style.display = 'block';
  if(cat === 'all') { document.getElementById('nav-btn-home').classList.add('active'); } 
  else { document.getElementById('nav-btn-filter').classList.add('active'); }
  currentCategory = cat; filterRecipes();
}

function openNotesView() { hideAllViews(); document.getElementById('navBtnNotes').classList.add('active'); document.getElementById('notesSection').style.display = 'flex'; loadNotesFromSupabase(); }
function openSettingsView() { 
  hideAllViews(); document.getElementById('navBtnSettings').classList.add('active'); document.getElementById('settingsSection').style.display = 'flex'; 
  const savedPin = localStorage.getItem('gartenAdminPin'); if(savedPin) document.getElementById('adminPinInput').value = savedPin;
}
function openCycleView() { hideAllViews(); document.getElementById('navBtnCycle').classList.add('active'); document.getElementById('cycleSection').style.display = 'flex'; }

function toggleGeminiPopover(e) { if (e) e.stopPropagation(); document.getElementById('geminiModelPopover')?.classList.toggle('open'); }
function selectGeminiModel(key, e) {
  if (e) e.stopPropagation(); selectedGeminiModelKey = key; localStorage.setItem('gartenMuttiGeminiModel', key);
  document.getElementById('currentGeminiModelLabel').innerText = `✨ Gemini ${GEMINI_MODELS[key].label} ▾`;
  document.querySelectorAll('.gemini-model-opt').forEach(el => el.classList.toggle('selected', el.getAttribute('data-model') === key));
  document.getElementById('geminiModelPopover')?.classList.remove('open');
}
function changeThinkingEffort(val) { selectedThinkingEffort = val; localStorage.setItem('gartenMuttiThinkingEffort', val); }

function handleHomeImageCapture(event) {
  const file = event.target.files[0]; if (!file) return; const reader = new FileReader();
  reader.onload = function(e) {
    capturedBase64Image = e.target.result; openAddModal();
    setTimeout(() => { document.getElementById('imagePreview').src = capturedBase64Image; document.getElementById('imagePreviewContainer').style.display = 'block'; document.getElementById('kiPromptInput').value = "Erstelle ein Rezept aus diesem Foto."; generateWithGemini(); }, 300);
  };
  reader.readAsDataURL(file); event.target.value = '';
}

function handleImageCapture(event) {
  const file = event.target.files[0]; if (!file) return; const reader = new FileReader();
  reader.onload = function(e) { capturedBase64Image = e.target.result; document.getElementById('imagePreview').src = capturedBase64Image; document.getElementById('imagePreviewContainer').style.display = 'block'; };
  reader.readAsDataURL(file);
}
function clearCapturedImage() { capturedBase64Image = null; document.getElementById('imagePreviewContainer').style.display = 'none'; document.getElementById('recipeImageInput').value = ''; }

function openAddModal() {
  const mCfg = GEMINI_MODELS[selectedGeminiModelKey] || GEMINI_MODELS['argon'];
  let modelOptsHtml = Object.entries(GEMINI_MODELS).map(([k, v]) => `<div class="gemini-model-opt ${selectedGeminiModelKey === k ? 'selected' : ''}" data-model="${k}" onclick="selectGeminiModel('${k}', event)"><div><span class="m-title">${v.label}</span><span class="m-sub">${v.sub}</span></div><span class="m-check">✓</span></div>`).join('');

  document.getElementById('sheetContent').innerHTML = `
    <h2 style="font-size: 1.3rem; margin-bottom: 12px; text-align: center;">➕ Neues Rezept erstellen</h2>
    <div class="ki-box" onclick="document.getElementById('geminiModelPopover')?.classList.remove('open')">
      <div class="ki-header-row">
        <strong style="font-size: 0.9rem; color: #a371f7;">✨ Gemini Spitzenkoch-KI</strong>
        <button type="button" class="gemini-model-trigger" onclick="toggleGeminiPopover(event)"><span id="currentGeminiModelLabel">✨ Gemini ${mCfg.label} ▾</span></button>
      </div>
      <div class="gemini-popover" id="geminiModelPopover" onclick="event.stopPropagation()">
        ${modelOptsHtml}
        <div class="gemini-divider"></div>
        <div class="gemini-thinking-row">
          <span>Denkaufwand</span>
          <select class="gemini-thinking-select" onchange="changeThinkingEffort(this.value)">
            <option value="niedrig" ${selectedThinkingEffort === 'niedrig' ? 'selected' : ''}>⚡ Niedrig</option>
            <option value="mittel" ${selectedThinkingEffort === 'mittel' ? 'selected' : ''}>🧠 Mittel</option>
            <option value="hoch" ${selectedThinkingEffort === 'hoch' ? 'selected' : ''}>🔬 Hoch</option>
          </select>
        </div>
      </div>
      <p style="font-size: 0.78rem; color: var(--text-muted); margin: 4px 0 8px 0;">Text eingeben oder Foto scannen:</p>
      <textarea id="kiPromptInput" rows="2" style="width:100%; background:var(--card-sub); border:1px solid var(--border); border-radius:8px; color:var(--text); padding:8px; font-size:0.85rem; outline:none; margin-bottom: 8px;" placeholder="z. B. Lauch mit Fleisch oder Foto scannen..."></textarea>
      <div style="display:flex; gap:8px; margin-bottom: 8px;">
        <label class="ki-btn" style="flex:1; margin:0; text-align:center; cursor:pointer; background: rgba(163, 113, 247, 0.2); border: 1px dashed #a371f7; font-size:0.8rem; padding:8px;">📸 Foto aufnehmen / wählen<input type="file" id="recipeImageInput" accept="image/*" capture="environment" style="display:none;" onchange="handleImageCapture(event)"></label>
      </div>
      <div id="imagePreviewContainer" style="display:none; margin-bottom: 8px; text-align:center;">
        <img id="imagePreview" src="" alt="Vorschau" style="max-height: 90px; border-radius: 8px; border: 1px solid var(--border);">
        <button type="button" style="background:none; border:none; color:#ff4d4d; font-size:0.75rem; display:block; margin: 4px auto 0 auto; cursor:pointer;" onclick="clearCapturedImage()">Foto entfernen ✖</button>
      </div>
      <button type="button" class="ki-btn" id="kiGenBtn" onclick="generateWithGemini()">🪄 Mit Gemini automatisch ausfüllen</button>
    </div>
    <div class="form-row"><div class="form-group"><label>Rezept-Titel *</label><input type="text" id="newTitle"></div><div class="form-group"><label>Emoji & Score</label><div style="display:flex; gap:6px;"><input type="text" id="newEmoji" value="🍲" style="width: 50px; text-align:center;"><select id="newScore" style="flex:1;"><option value="A">Nutri A</option><option value="B">Nutri B</option><option value="C">Nutri C</option><option value="D">Nutri D</option><option value="E">Nutri E</option></select></div></div></div>
    <div class="form-row"><div class="form-group"><label>Mahlzeit</label><select id="newMealCat"><option value="mittag">🍲 Mittag</option><option value="fruehstueck">🍳 Frühstück</option><option value="abend">🥩 Abendessen</option><option value="snacks">🧁 Snacks & Süßes</option></select></div><div class="form-group"><label>Airfryer?</label><select id="newAirfryer"><option value="false">Nein</option><option value="true">🌪️ Ja</option></select></div></div>
    <label style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600; display:block; margin-bottom: 5px;">🔥 Nährwerte (pro 1 Portion)</label>
    <div class="form-row-3" style="margin-bottom: 8px;"><div class="form-group" style="margin:0;"><label>Kcal</label><input type="number" id="newKcal"></div><div class="form-group" style="margin:0;"><label>Eiweiß (g)</label><input type="number" step="0.1" id="newProt"></div><div class="form-group" style="margin:0;"><label>Kohlenh. (g)</label><input type="number" step="0.1" id="newKh"></div></div>
    <div class="form-row" style="margin-bottom: 12px;"><div class="form-group" style="margin:0;"><label>Zucker (g)</label><input type="number" step="0.1" id="newSugar"></div><div class="form-group" style="margin:0;"><label>Fett (g)</label><input type="number" step="0.1" id="newFat"></div></div>
    <div class="form-group"><label>🔍 Such-Schlagworte</label><input type="text" id="newIngredients"></div>
    <div class="form-group"><label>🛒 Zutatenliste (für 1 Port.)</label><textarea id="newZutaten" rows="5"></textarea></div>
    <div class="form-group"><label>🔪 Vorbereitung</label><textarea id="newPrep" rows="2"></textarea></div>
    <div class="form-group"><label>🍳 Herd</label><textarea id="newStove" rows="2"></textarea></div>
    <div class="form-row"><div class="form-group"><label>🔥 Backofen</label><textarea id="newOven" rows="2"></textarea></div><div class="form-group"><label>🌪️ Airfryer</label><textarea id="newAirfryerStep" rows="2"></textarea></div></div>
    <div class="form-group"><label>🩺 Doc-Check</label><input type="text" id="newDocCheck"></div>
    <div class="form-group"><label>💡 Tipps</label><input type="text" id="newTipps"></div>
    <button class="btn-save" onclick="saveNewRecipe()">💾 Rezept speichern</button>
  `;
  document.getElementById('modalBackdrop').classList.add('active'); lockScroll();
}

async function generateWithGemini() {
  const promptText = document.getElementById('kiPromptInput').value.trim();
  const btn = document.getElementById('kiGenBtn'); 
  const mCfg = GEMINI_MODELS[selectedGeminiModelKey] || GEMINI_MODELS['argon'];
  
  if (!promptText && !capturedBase64Image) { alert('Bitte Text oder Foto!'); return; }
  
  btn.innerText = `⏳ KI lädt...`; 
  btn.disabled = true;

  // Schlüssel laden, falls noch nicht im Speicher
  if (!sharedGeminiApiKey || sharedGeminiApiKey.length < 20) {
    await loadSharedGeminiKeyFromDB();
  }

  // Wenn der Schlüssel immer noch fehlt:
  if (!sharedGeminiApiKey || sharedGeminiApiKey.length < 20) {
    alert("Fehler: Kein gültiger API-Schlüssel in der Datenbank gefunden! (Suche nach Autor 'SYSTEM_GEMINI_KEY')");
    btn.innerText = '🪄 Mit Gemini ausfüllen'; 
    btn.disabled = false;
    return;
  }

  let sysPrompt = `Du bist Spitzenkoch für Low-Carb. Erstelle ein Rezept normiert auf EXAKT 1 PORTION. Antworte AUSSCHLIESSLICH als JSON: {"title": "Name", "emoji": "🍲", "score": "A", "mealCat": "fruehstueck|mittag|abend|snacks", "kcal": 385, "prot": 38, "kh": 7, "sugar": 2, "fat": 15, "airfryer": false, "ingredients": "zutat1, zutat2", "zutaten_liste": "• 160 g Zutat 1\\n• 150 g Zutat 2", "prep": "Prep...", "stove_step": "Herd...", "oven_step": "", "airfryer_step": "", "doc_check": "Doc Check...", "tipps": "Tipp..."}`;
  let contentParts = [{ text: sysPrompt + "\n\nRezeptwunsch: " + (promptText || 'Erstelle ein Rezept aus diesem Foto.') }];
  
  if (capturedBase64Image) {
    contentParts.push({ inline_data: { mime_type: capturedBase64Image.split(';')[0].split(':')[1] || 'image/jpeg', data: capturedBase64Image.split(',')[1] } });
  }
  
  const candidateModels = mCfg.apiModels;
  
  for (const modelName of candidateModels) {
    try {
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${sharedGeminiApiKey}`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          contents: [{ parts: contentParts }], 
          generationConfig: { temperature: mCfg.temp, responseMimeType: "application/json" } 
        })
      });
      
      if (response.ok) {
        const resData = await response.json(); 
        let rawJson = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        fillModalFields(JSON.parse(rawJson.replace(/```json/g, '').replace(/```/g, '').trim()));
        btn.innerText = `✅ Erfolgreich erstellt!`; 
        setTimeout(() => { btn.innerText = '🪄 Mit Gemini automatisch ausfüllen'; btn.disabled = false; }, 2200); 
        return; 
      } else {
        const errorData = await response.json();
        console.error("API Fehler:", errorData);
        alert(`Google API Fehler (${modelName}): ` + (errorData.error?.message || "Unbekannter Fehler"));
        btn.innerText = '🪄 Mit Gemini ausfüllen'; 
        btn.disabled = false;
        return; // Stoppt hier und zeigt den Fehler am Bildschirm!
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  }

  alert("Konnte keine Verbindung zur Gemini API herstellen.");
  btn.innerText = '🪄 Mit Gemini ausfüllen'; 
  btn.disabled = false;
}

function fillModalFields(data) {
  if (data.title) document.getElementById('newTitle').value = data.title;
  if (data.emoji) document.getElementById('newEmoji').value = data.emoji;
  if (data.score) document.getElementById('newScore').value = data.score;
  if (data.mealCat) document.getElementById('newMealCat').value = data.mealCat;
  if (data.kcal !== undefined) document.getElementById('newKcal').value = data.kcal;
  if (data.prot !== undefined) document.getElementById('newProt').value = data.prot;
  if (data.kh !== undefined) document.getElementById('newKh').value = data.kh;
  if (data.sugar !== undefined) document.getElementById('newSugar').value = data.sugar;
  if (data.fat !== undefined) document.getElementById('newFat').value = data.fat;
  if (data.airfryer !== undefined) document.getElementById('newAirfryer').value = String(data.airfryer);
  if (data.ingredients) document.getElementById('newIngredients').value = data.ingredients;
  if (data.zutaten_liste) document.getElementById('newZutaten').value = data.zutaten_liste;
  if (data.prep) document.getElementById('newPrep').value = data.prep;
  if (data.stove_step !== undefined) document.getElementById('newStove').value = data.stove_step;
  if (data.oven_step !== undefined) document.getElementById('newOven').value = data.oven_step;
  if (data.airfryer_step !== undefined) document.getElementById('newAirfryerStep').value = data.airfryer_step;
  if (data.doc_check !== undefined) document.getElementById('newDocCheck').value = data.doc_check;
  if (data.tipps !== undefined) document.getElementById('newTipps').value = data.tipps;
}

async function saveNewRecipe() {
  if (!(await checkAdmin())) return;
  const title = document.getElementById('newTitle').value.trim();
  if (!title) { alert('Titel fehlt!'); return; }
  const saveBtn = document.querySelector('.btn-save'); 
  
  let cat = document.getElementById('newMealCat').value; const categories = [cat, 'lowcarb'];
  if (document.getElementById('newAirfryer').value === 'true') categories.push('airfryer');

  let imageUrl = null;
  if (capturedBase64Image) {
    if (saveBtn) { saveBtn.innerText = '📸 Komprimiere & Lade Foto...'; saveBtn.disabled = true; }
    try {
      const blob = await compressImageAndConvertToBlob(capturedBase64Image);
      const fileName = 'rezept_' + Date.now() + '.jpg';
      const { error: uploadError } = await supabaseClient.storage.from('RezeptBilder').upload(fileName, blob, { contentType: 'image/jpeg' });
      if (!uploadError) {
        const { data: publicUrlData } = supabaseClient.storage.from('RezeptBilder').getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }
    } catch (e) { console.error("Komprimierungs- oder Upload-Fehler", e); }
  }

  if (saveBtn) saveBtn.innerText = '⏳ Speichere Rezept...';

  const { error } = await supabaseClient.from('Rezepte').insert([{
    title: title, emoji: document.getElementById('newEmoji').value || '🍲', score: document.getElementById('newScore').value || 'A',
    category: categories, airfryer: document.getElementById('newAirfryer').value === 'true',
    kcal: Number(document.getElementById('newKcal').value) || 0, prot: Number(document.getElementById('newProt').value) || 0,
    kh: Number(document.getElementById('newKh').value) || 0, sugar: Number(document.getElementById('newSugar').value) || 0,
    fat: Number(document.getElementById('newFat').value) || 0, ingredients: document.getElementById('newIngredients').value.trim(),
    zutaten_liste: document.getElementById('newZutaten').value.trim(), prep: document.getElementById('newPrep').value.trim(),
    stove_step: document.getElementById('newStove').value.trim(), oven_step: document.getElementById('newOven').value.trim(),
    airfryer_step: document.getElementById('newAirfryerStep').value.trim(), doc_check: document.getElementById('newDocCheck').value.trim(),
    tipps: document.getElementById('newTipps').value.trim(),
    image_url: imageUrl
  }]);

  if (!error) { if (saveBtn) saveBtn.innerText = '✅ Gespeichert!'; setTimeout(() => { closeSheetForce(); triggerRefresh(); clearCapturedImage(); }, 600); } 
  else { alert('Fehler: ' + error.message); if (saveBtn) { saveBtn.innerText = '💾 Rezept speichern'; saveBtn.disabled = false; } }
}

function exportBackupJson() {
  const dlAnchor = document.createElement('a'); dlAnchor.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(recipes, null, 2)));
  dlAnchor.setAttribute("download", `Backup_${new Date().toISOString().slice(0,10)}.json`); document.body.appendChild(dlAnchor); dlAnchor.click(); dlAnchor.remove();
}
async function importBackupJson(event) {
  const reader = new FileReader(); reader.onload = async (e) => { try { const imp = JSON.parse(e.target.result); if (Array.isArray(imp)) { recipes = imp; filterRecipes(); } } catch (err) { alert('Ungültig.'); } }; reader.readAsText(event.target.files[0]);
}

function calculateCycle() {
  const startInput = document.getElementById('cycleStartDate').value; const length = Number(document.getElementById('cycleLength').value) || 28;
  if (!startInput) return; localStorage.setItem('gartenMuttiCycleStart', startInput); localStorage.setItem('gartenMuttiCycleLen', length);
  const diffDays = Math.floor((new Date() - new Date(startInput)) / (1000 * 60 * 60 * 24)); const currentDay = ((diffDays % length) + length) % length + 1;
  const badge = document.getElementById('phaseBadge'); const text = document.getElementById('phaseText'); document.getElementById('currentPhaseInfo').style.display = 'block';
  if (currentDay <= 5) { badge.innerText = `🩸 Tag ${currentDay}: Menstruation`; badge.style.background = 'rgba(225, 29, 72, 0.2)'; badge.style.color = '#fb7185'; text.innerText = 'Eisenreich & wärmend.'; }
  else if (currentDay <= 13) { badge.innerText = `🌱 Tag ${currentDay}: Follikelphase`; badge.style.background = 'rgba(46, 160, 67, 0.2)'; badge.style.color = '#3fb950'; text.innerText = 'Leichte Proteine & frisches Gemüse.'; }
  else if (currentDay <= 16) { badge.innerText = `✨ Tag ${currentDay}: Eisprung`; badge.style.background = 'rgba(210, 153, 34, 0.2)'; badge.style.color = '#d29922'; text.innerText = 'Gesunde Fette & viel Eiweiß.'; }
  else { badge.innerText = `🍂 Tag ${currentDay}: Lutealphase`; badge.style.background = 'rgba(163, 113, 247, 0.2)'; badge.style.color = '#a371f7'; text.innerText = 'Blutzucker stabil halten.'; }
}
function filterRecipesForCycle() { handleNavCategory('fruehstueck'); }

function toggleCustomAuthorInput(val) { document.getElementById('noteAuthorCustom').style.display = val === 'custom' ? 'block' : 'none'; }
async function loadNotesFromSupabase() {
  const { data } = await supabaseClient.from('Notizen').select('*').order('id', { ascending: false });
  const visible = (data || []).filter(n => n.author !== 'SYSTEM_GEMINI_KEY' && n.author !== 'SYSTEM_ADMIN_PIN');
  document.getElementById('notesList').innerHTML = visible.length === 0 ? '<div style="text-align:center; padding:20px;">Keine Notizen.</div>' : visible.map(n => `
    <div class="note-card ${n.is_done ? 'done' : ''}"><div class="note-content" onclick="toggleNoteDone(${n.id}, ${n.is_done})" style="cursor:pointer;"><span class="note-author-badge note-author-${(n.author||'').toLowerCase()}">${escapeHtml(n.author)}</span><div class="note-text">${escapeHtml(n.content)}</div></div><div style="display:flex; gap:6px;"><button class="note-btn-action" onclick="toggleNoteDone(${n.id}, ${n.is_done})">${n.is_done ? '↩️' : '✅'}</button><button class="note-btn-action" onclick="deleteNote(${n.id})">🗑️</button></div></div>
  `).join('');
}
async function toggleNoteDone(id, currentStatus) { await supabaseClient.from('Notizen').update({ is_done: !currentStatus }).eq('id', id); loadNotesFromSupabase(); }
async function addNote() {
  const input = document.getElementById('noteInput'); if (!input.value.trim()) return;
  let author = document.getElementById('noteAuthor').value; if (author === 'custom') author = document.getElementById('noteAuthorCustom').value.trim() || 'Gast';
  await supabaseClient.from('Notizen').insert([{ author, content: input.value.trim(), is_done: false }]); input.value = ''; loadNotesFromSupabase();
}
async function deleteNote(id) { await supabaseClient.from('Notizen').delete().eq('id', id); loadNotesFromSupabase(); }
async function triggerRefresh() { await loadRecipesFromSupabase(); }

function setupRealtimeSync() {
  supabaseClient.channel('public:Notizen').on('postgres_changes', { event: '*', schema: 'public', table: 'Notizen' }, payload => {
    if (document.getElementById('notesSection').style.display === 'flex') loadNotesFromSupabase();
  }).subscribe();
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  if (localStorage.getItem('gartenMuttiCycleStart')) { document.getElementById('cycleStartDate').value = localStorage.getItem('gartenMuttiCycleStart'); document.getElementById('cycleLength').value = localStorage.getItem('gartenMuttiCycleLen') || 28; calculateCycle(); }
  loadSharedGeminiKeyFromDB(); loadRecipesFromSupabase(); setupRealtimeSync();
});
