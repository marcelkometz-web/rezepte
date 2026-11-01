import{mealPairings}from'./meal-pairings.mjs';
const element=(tag,value,className)=>{const node=document.createElement(tag);if(value!==undefined)node.textContent=value;if(className)node.className=className;return node;};
const number=value=>Number(value).toLocaleString('de-DE',{maximumFractionDigits:1});
export function createMealPairings({recipe,recipes,onOpen,isActive=()=>true,open=false,onToggle=()=>{}}){
 const result=mealPairings(recipe,recipes),root=element('details',undefined,'meal-pairings');root.open=open;
 root.append(element('summary','Dazu passt … 🥗 🍓'));
 root.append(element('p','Ideen aus eurer Rezeptsammlung – nach Kategorien, vorhandenen Rezeptwerten und gemeinsamen Zutaten geordnet. Ohne zusätzliche KI-Anfrage.','small muted'));
 for(const[course,title]of[['starter','Als Vorspeise'],['dessert','Als Nachtisch']]){
  const section=element('section',undefined,'meal-pairings-course');section.append(element('h4',title));
  if(!result[course].length)section.append(element('p',course==='starter'?'In eurer Sammlung ist derzeit keine eindeutig eingeordnete Vorspeise oder Salatidee verfügbar.':'In eurer Sammlung ist derzeit kein eindeutig als Nachtisch eingeordnetes Rezept verfügbar.','small muted'));
  for(const item of result[course]){
   const card=element('article',undefined,'meal-pairing-card'),button=element('button',(item.emoji?item.emoji+' ':'')+item.title,'text-button meal-pairing-title');button.type='button';button.addEventListener('click',()=>{if(isActive())onOpen?.(item.id);});
   const values=item.nutrition,parts=[values.kcal===null?'Energie unbekannt':number(values.kcal)+' kcal',values.sugar===null?'Zucker unbekannt':number(values.sugar)+' g Zucker'];
   card.append(button,element('p',parts.join(' · ')+' je Originalrezept-Portion.','small muted'));
   if(values.source==='ingredients')card.append(element('small','Aus dokumentierten Zutatenmengen berechnet; Produkt- und Garabweichungen sind möglich.','muted'));
   else card.append(element('small',values.source==='needs-review'?'Widersprüchliche Angaben bleiben unbekannt. Bitte die Nährwerte im Rezept prüfen.':'Gespeicherte Rezeptangaben sind Richtwerte.','muted'));
   card.append(element('p',item.reason,'small muted'));section.append(card);
  }
  root.append(section);
 }
 root.append(element('p','Wähle passende Portionsgrößen und prüfe Zutaten und Allergene selbst. Die Vorschläge bestätigen keine Allergieverträglichkeit. Ohne ausgewählte Mengen und vollständige Werte wird keine Menü-Gesamtsumme berechnet.','small muted'));
 root.addEventListener('toggle',()=>onToggle(root.open));return root;
}
