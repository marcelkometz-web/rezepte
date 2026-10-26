export const SEASONS={spring:'Frühling',summer:'Sommer',autumn:'Herbst',winter:'Winter'};
export function currentSeason(date=new Date()){const m=date.getMonth()+1;return m>=3&&m<=5?'spring':m>=6&&m<=8?'summer':m>=9&&m<=11?'autumn':'winter';}
// 24 different sayings per season × 15 minutes = a six-hour cycle.
export function seasonalSaying(season,time=Date.now()){const list=SAYINGS[season]||SAYINGS[currentSeason()];return list[Math.floor(time/900000)%list.length];}
export function nextSaying(season,now,previous={}){
 if(!Object.hasOwn(SAYINGS,season))season=currentSeason(new Date(now));
 previous=previous&&typeof previous==='object'?previous:{};
 const known=id=>{if(typeof id!=='string'||!/^(?:spring|summer|autumn|winter):(?:0|[1-9]\d*)$/.test(id))return;const [s,n]=id.split(':');return SAYINGS[s][Number(n)];};
 const valid=item=>item&&typeof item==='object'&&known(item.id)&&Number.isFinite(item.at)&&item.at<=now;
 const history=(Array.isArray(previous.history)?previous.history:[]).filter(x=>valid(x)&&now-x.at<21600000).map(({id,at})=>({id,at}));
 const current=valid(previous.current)?{id:previous.current.id,at:previous.current.at}:null;
 if(current&&now-current.at<21600000&&!history.some(x=>x.id===current.id))history.push(current);
 if(current&&known(current.id)&&current.id.startsWith(season+':')&&now-current.at>=0&&now-current.at<900000)return {text:known(current.id),state:{current,history}};
 const used=new Set(history.map(x=>x.id)),offset=Math.floor(now/900000)%SAYINGS[season].length;
 for(let i=0;i<SAYINGS[season].length;i++){
  const id=season+':'+((offset+i)%SAYINGS[season].length);
  if(!used.has(id)){const item={id,at:now};return {text:known(id),state:{current:item,history:[...history,item]}};}
 }
 // After unusually many manual design changes, keep the current saying on
 // screen instead of reusing one from the protected history window.
 return {text:known(current?.id)||seasonalSaying(season,now),state:{current,history}};
}
export const SAYINGS={
spring:[
'Der Frühling schmeckt nach frischen Kräutern und neuen Lieblingsgerichten.',
'Ein bisschen Bärlauch macht aus einer einfachen Pfanne ein Frühlingsessen.',
'Knackiger Spargel, gute Gesellschaft: Mehr braucht ein schöner Abend selten.',
'Heute darf die Suppe grün sein – Spinat bringt Frische auf den Löffel.',
'Radieschen knacken am schönsten auf einem frisch belegten Brot.',
'Frische Kräuter machen aus Quark einen kleinen Garten auf dem Teller.',
'Eine leichte Gemüsepfanne passt zu den ersten langen Tagen.',
'Wenn Schnittlauch duftet, ist das Rührei schon halb ein Fest.',
'Junge Möhren bringen Farbe in den Ofen und Freude auf den Tisch.',
'Ein Salat mit Ei ist eine gute Einladung zur Mittagspause.',
'Frühlingsküche beginnt oft mit einer Handvoll Petersilie.',
'Ein Klecks Kräuterdip macht aus Rohkost etwas zum Teilen.',
'Bärlauchpesto verwandelt einen ruhigen Abend in einen würzigen.',
'Kohlrabi muss nicht kompliziert sein: kurz gebraten, fein gewürzt, fertig.',
'Für eine frische Bowl finden sich im Frühling viele gute Zutaten.',
'Spargel aus dem Ofen lässt Zeit für ein Gespräch am Küchentisch.',
'Ein Omelett und die ersten Kräuter verstehen sich ohne großes Rezept.',
'Heute wandern Erbsen und Zitrone gemeinsam in die Pfanne.',
'Ein warmer Gemüseauflauf passt auch zu einem kühlen Frühlingsabend.',
'Quark, Beeren und ein Löffel Nüsse: eine kleine Pause mit Biss.',
'Ein frisches Dressing macht selbst aus Resten einen schönen Salat.',
'Blumenkohl und Kräuter bringen den Frühling auf das Backblech.',
'Aus einer Handvoll Spinat wird ein guter Anfang fürs Abendessen.',
'Das schönste Frühlingsgericht ist das, das ihr zusammen genießt.'
],
summer:[
'Sommer auf dem Teller: Tomaten, Basilikum und ein bisschen Zeit füreinander.',
'Zucchini aus der Pfanne schmeckt nach einem unkomplizierten Feierabend.',
'Heute bleibt die Küche leicht und der Salat schön bunt.',
'Ein kalter Joghurt-Dip ist die beste Begleitung für warme Tage.',
'Frische Gurke macht aus einer kleinen Pause eine erfrischende.',
'Paprika vom Grill bringt den Sommer direkt an den Küchentisch.',
'Eine Handvoll Beeren findet immer noch Platz im Dessertglas.',
'Tomaten brauchen manchmal nur gutes Öl und eine Prise Salz.',
'Die besten Grillbeilagen lassen sich miteinander teilen.',
'Heute gibt es Kräuterquark und gute Laune zum Gemüse.',
'Ein schneller Sommersalat lässt mehr Zeit für draußen.',
'Aubergine aus dem Ofen kann auch ohne viele Zutaten glänzen.',
'Zoodles, Pesto, Parmesan – so schmeckt ein leichter Sommerabend.',
'Ein Teller Antipasti ist eine kleine Reise ohne Koffer.',
'Knuspriges Hähnchen und ein frischer Dip sind ein gutes Sommerteam.',
'Melone und Feta bringen süß und salzig an denselben Tisch.',
'Ein bisschen Minze macht aus Joghurt etwas besonders Frisches.',
'Gemüsespieße bringen Farbe auf den Grill und den Teller.',
'Mit frischen Tomaten wird die einfachste Pfanne zum Sommergericht.',
'Ein gekühltes Quarkdessert wartet geduldig auf den schönsten Moment.',
'Heute wird aus der Gartenernte ein gemeinsames Abendessen.',
'Lachs und Zitronenkräuter passen zu einem langen Sommerabend.',
'Der Kühlschrank hat oft schon die Zutaten für eine gute Bowl.',
'Ein sommerliches Essen darf einfach sein – Hauptsache, es schmeckt euch.'
],
autumn:[
'Draußen raschelt das Laub, drinnen duftet die Kürbissuppe.',
'Ein warmes Ofengericht macht einen grauen Tag ein bisschen goldener.',
'Pilze, Zwiebeln und eine Pfanne: Der Herbst kann so einfach schmecken.',
'Heute kommt die Gemütlichkeit mit Käse überbacken auf den Tisch.',
'Ein Auflauf wartet gern, bis alle am Küchentisch angekommen sind.',
'Kürbis aus dem Ofen braucht keine große Bühne.',
'Ein Löffel Zimt macht das Quarkdessert herbstlich gemütlich.',
'Wirsing und eine würzige Füllung passen gut zu kühleren Abenden.',
'Frische Walnüsse geben einem einfachen Salat einen schönen Biss.',
'Eine cremige Blumenkohlsuppe wärmt die Pause von innen.',
'Heute wird aus der Ernte ein Topf voller guter Ideen.',
'Röstgemüse bringt mit wenigen Handgriffen viel Geschmack ins Haus.',
'Ein Pilzomelett ist ein guter Grund für eine gemütliche Mittagspause.',
'Kohlrabi-Gratin macht auch einen regnerischen Abend freundlich.',
'Ein kleines Birnendessert passt wunderbar zu einer Tasse Tee.',
'Wenn der Ofen arbeitet, bleibt Zeit zum Durchatmen.',
'Ein würziger Eintopf schmeckt am gemeinsamen Tisch besonders gut.',
'Herbstliche Kräuterbutter macht das Gemüse zum Hauptdarsteller.',
'Rosenkohl darf knusprig sein – das Backblech weiß, wie es geht.',
'Ein bisschen Muskat lässt die Kürbiscreme noch runder schmecken.',
'Heute kommen Brokkoli und Käse gemeinsam unter die Ofenhaube.',
'Die besten Herbstpfannen beginnen mit dem, was noch im Kühlschrank liegt.',
'Eine warme Bowl bringt Erntefarben auf den Teller.',
'Der Herbst deckt den Tisch am liebsten mit etwas Herzhaftem.'
],
winter:[
'Ein Topf Suppe bringt Wärme an einen kalten Wintertag.',
'Heute darf das Abendessen gemütlich im Ofen goldbraun werden.',
'Grünkohl und gute Gewürze machen die Winterküche lebendig.',
'Ein dampfender Auflauf ist eine schöne Einladung zum Zusammenkommen.',
'Zimt und Quark passen zu einer ruhigen Winterpause.',
'Eine herzhafte Pfanne wärmt, während draußen die Fenster beschlagen.',
'Lauch und eine cremige Soße sind gute Begleiter für kalte Tage.',
'Ein Blech Wintergemüse nimmt euch einen Teil der Küchenarbeit ab.',
'Heute ist ein guter Tag für einen großen Topf zum Teilen.',
'Ein Ofenfeta macht selbst aus einem kurzen Abend etwas Gemütliches.',
'Rosenkohl und Nüsse bringen Abwechslung in den Winter.',
'Eine Suppe aus Blumenkohl ist wie eine kleine Pause zum Löffeln.',
'Mit Ingwer und Knoblauch wird die Gemüsepfanne schön würzig.',
'Ein warmes Frühstück lässt einen kalten Morgen freundlicher beginnen.',
'Heute zieht der Duft von überbackenem Käse durch die Küche.',
'Ein kleiner Schokoquark passt auch zu einem langen Winterabend.',
'Gefüllte Paprika bringt ein bisschen Farbe in die dunkle Jahreszeit.',
'Ein würziger Kohlauflauf lässt sich gut für morgen mitdenken.',
'Eine heiße Brühe und frische Kräuter machen ein einfaches Essen rund.',
'Wenn es draußen friert, darf drinnen die Pfanne zischen.',
'Ein warmer Dip und knuspriges Gemüse sind ein gutes Winterpaar.',
'Gemeinsam geschnippelt ist der Eintopf schon halb gekocht.',
'Ein Hauch Muskat passt wunderbar zu einer cremigen Winterbeilage.',
'Am besten wärmt ein Essen, bei dem alle gern noch sitzen bleiben.'
]};
