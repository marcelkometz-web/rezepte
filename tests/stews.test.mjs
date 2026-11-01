import test from 'node:test';
import assert from 'node:assert/strict';
import {isStew,matches,categories} from '../src/domain.mjs';
test('Eintöpfe preserves meal categories and supports existing category encodings',()=>{
 for(const category of ['["mittag","eintoepfe","highprotein"]','{abend,eintopf}','"[\\"mittag\\",\\"eintoepfe\\"]"']){
  const recipe={id:1,title:'Bohnen mit Gemüse',category};assert.equal(isStew(recipe),true);assert.equal(matches(recipe,'','eintoepfe'),true);assert.ok(categories(category).some(x=>['mittag','abend'].includes(x)));
 }
});
test('stew titles are recognized without misclassifying pure soups, pasta or spice blends',()=>{
 for(const title of ['Gemüseeintopf','Bohnen-Eintopf mit Pute','Herzhafte Eintöpfe'])assert.equal(isStew({title}),true);
 for(const title of ['Tomatencremesuppe','One-Pot-Nudeln','Eintopf-Gewürzpulver'])assert.equal(isStew({title}),false);
 assert.equal(matches({title:'Salat',category:'["salate"]'},'','eintoepfe'),false);
});
