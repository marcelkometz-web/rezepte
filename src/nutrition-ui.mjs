import {NUTRIENTS,roundedNutrition,readNutritionBasis,basisIngredientText} from './nutrition-calculation.mjs';
const labels={kcal:'Energie (kcal)',prot:'Eiweiß (g)',kh:'Kohlenhydrate (g)',sugar:'davon Zucker (g)',fat:'Fett (g)',sat_fat:'davon gesättigt (g)',fiber:'Ballaststoffe (g)',salt:'Salz (g)'};
const el=(tag,value,attrs={})=>{const n=document.createElement(tag);if(value!==undefined)n.textContent=value;for(const [k,v]of Object.entries(attrs)){if(k==='class')n.className=v;else n.setAttribute(k,v);}return n;};
export function nutritionEditor(recipe,{editable,onSave,onClose}){
  const original=readNutritionBasis(recipe);if(!original)throw Error('Für dieses Rezept ist keine Zutatenberechnung hinterlegt.');
  const basis=structuredClone(original),form=el('form',undefined,{class:'nutrition-calculator'}),controls=[];
  form.append(el('p','Alle Mengen gelten für eine Portion und den in der Zutatenbezeichnung genannten Zustand (z. B. roh oder abgetropft). Für konkrete Marken die Werte der Packung pro 100 g eintragen. Leer gelassene Nährwerte werden als unbekannt behandelt.'),el('p','Die Rechnung ist nachvollziehbar; natürliche Lebensmittelschwankungen und Garverluste werden dadurch nicht zu Laborwerten.',{class:'muted small'}));
  for(const ingredient of basis.ingredients){
    const row=el('section',undefined,{class:'nutrition-ingredient'}),name=el('strong',ingredient.label),grams=el('input',undefined,{type:'number',step:'0.1',min:'0.1',max:'10000',value:String(ingredient.grams),required:''}),amount=el('label','Menge in g');amount.append(grams);
    const details=el('details'),source=ingredient.source||{},summary=el('summary','Nährwerte pro 100 g und Quelle');
    details.append(summary,el('p',[source.name,source.code,source.food].filter(Boolean).join(' · '),{class:'muted small'}));
    if(/^https:\/\/(?:www\.blsdb\.de\/|fdc\.nal\.usda\.gov\/)/.test(source.url||''))details.append(el('a','Originalquelle öffnen',{href:source.url,target:'_blank',rel:'noopener noreferrer'}));
    const product=el('input',undefined,{type:'text',maxlength:'200',placeholder:'z. B. genauer Skyr-Produktname'}),productLabel=el('label','Bei anderen Werten: Produkt / Quelle');productLabel.append(product);details.append(productLabel);
    const inputs={},grid=el('div',undefined,{class:'nutri-form'});
    for(const key of NUTRIENTS){const input=el('input',undefined,{type:'number',step:'any',min:'0',max:'100000',value:ingredient.per100[key]==null?'':String(ingredient.per100[key])}),label=el('label',labels[key]);label.append(input);inputs[key]=input;grid.append(label);}
    details.append(grid);row.append(name,amount,details);form.append(row);controls.push({ingredient,grams,inputs,product});
  }
  const output=el('div',undefined,{class:'panel nutrition-result','aria-live':'polite'}),error=el('p','',{class:'form-error',role:'status'});
  function collect(){
    const copy=structuredClone(basis);
    copy.ingredients=controls.map(({ingredient,grams,inputs,product})=>{
      const item=structuredClone(ingredient);item.grams=Number(grams.value);
      item.per100=Object.fromEntries(NUTRIENTS.map(key=>[key,inputs[key].value.trim()===''?null:Number(inputs[key].value)]));
      const changed=NUTRIENTS.some(key=>item.per100[key]!==ingredient.per100[key]);
      if(changed){if(!product.value.trim())throw Error(`Bitte Produkt oder Quelle für die geänderten Werte von „${ingredient.label}“ angeben.`);item.label=product.value.trim();item.source={name:'Eigene Packungsangaben',kind:'manufacturer-entered',food:product.value.trim(),updatedAt:new Date().toISOString()};}
      return item;
    });
    copy.ingredientText=basisIngredientText(copy);return copy;
  }
  const display=()=>{try{const totals=roundedNutrition(collect().ingredients);output.replaceChildren(el('h3','Berechnete Werte für 1 Portion'),...NUTRIENTS.map(key=>el('p',`${labels[key]}: ${totals[key]===null?'unbekannt':Number(totals[key]).toLocaleString('de-DE',{maximumFractionDigits:2})}`)));error.textContent='';}catch(e){error.textContent=e.message;}};
  form.addEventListener('input',display);form.append(output,error);
  if(editable){const submit=el('button','Zutatenmengen und berechnete Nährwerte speichern',{type:'submit',class:'button'});form.append(submit);form.addEventListener('submit',async event=>{event.preventDefault();submit.disabled=true;try{const updated=collect(),values=roundedNutrition(updated.ingredients);await onSave({...recipe,...values,recipes:JSON.stringify(updated),zutaten_liste:updated.ingredientText});onClose();}catch(e){error.textContent=e.message;}finally{submit.disabled=false;}});}
  else{for(const input of form.querySelectorAll('input'))input.disabled=true;form.append(el('p','Zum Speichern sind die bestehenden Rezept-Bearbeitungsrechte erforderlich.',{class:'muted small'}));}
  form.append(el('p','Standarddaten: Max Rubner-Institut (2025), Bundeslebensmittelschlüssel Version 4.0, CC BY 4.0, DOI 10.25826/Data20251217-134202-0. Mengen und Darstellung wurden für die Rezeptberechnung aufbereitet. Einzelne Gewürze: USDA FoodData Central, SR Legacy (Public Domain); verfügbare Kohlenhydrate dort angenähert als Gesamt-Kohlenhydrate minus Ballaststoffe. Quelle, Originalcode und gegebenenfalls Nachweisgrenzen stehen je Zutat in der Berechnungsbasis.'));
  const link=el('a','BLS-Daten und Quellenangabe',{href:'https://www.blsdb.de/download',target:'_blank',rel:'noopener noreferrer'});form.append(link);display();return form;
}
