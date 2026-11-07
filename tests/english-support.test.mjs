import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {translateSupportText,paintSupportLanguage} from '../alemao/support-language.mjs';
import {studyEvent} from '../alemao/study-calendar.mjs';
const dictionary=JSON.parse(await readFile(new URL('../alemao/study-support-en.json',import.meta.url))),phrases=JSON.parse(await readFile(new URL('../alemao/project90-phrases.json',import.meta.url))).phrases;
assert.equal(phrases.length,500);
for(const p of phrases){assert(p.en?.trim());assert(dictionary[p.pt]);assert.notEqual(translateSupportText(p.pt,dictionary),p.pt);assert(p.de&&p.pt&&p.pronunciation)}
assert.equal(translateSupportText('Rotina salva de Jefferson. Horas planejadas; não representam horas efetivamente estudadas nem nível alcançado.',dictionary),'Saved routine for Jefferson. Planned hours; they do not represent actual study hours or a level achieved.');
assert.equal(translateSupportText('Frase 500 · Revisão',dictionary),'Sentence 500 · Review');
assert.equal(translateSupportText('2 meses e 10 dias',dictionary),'2 months and 10 days');
const parent=(excluded=false)=>({closest:()=>excluded?{}:null});
const title={data:'Meu progresso',parentElement:parent()},german={data:'Ich lerne Deutsch.',parentElement:parent(true)},answer={data:'Minha resposta pessoal',parentElement:parent(true)},status={data:'✓ Correto.',parentElement:parent()};
const root={nodes:[title,german,answer,status],querySelectorAll:()=>[],closest:()=>null,hasAttribute:()=>false},document={querySelectorAll:()=>[root],createTreeWalker:r=>{let i=0;return {nextNode:()=>r.nodes[i++]}}};
paintSupportLanguage(document,'en',dictionary);assert.equal(title.data,'My progress');assert.equal(german.data,'Ich lerne Deutsch.');assert.equal(answer.data,'Minha resposta pessoal');assert.equal(status.data,'✓ Correct.');
paintSupportLanguage(document,'pt',dictionary);assert.equal(title.data,'Meu progresso');assert.equal(status.data,'✓ Correto.');
status.data='Criar meu plano';paintSupportLanguage(document,'en',dictionary);assert.equal(status.data,'Create my plan');paintSupportLanguage(document,'off',dictionary);assert.equal(status.data,'Criar meu plano');
const input={profile:'sofia',start:'2026-11-08',time:'10:00',minutes:30,days:6,reminder:10,uid:'qa'},now=new Date('2026-11-07T00:00:00Z');
const en=studyEvent({...input,language:'en'},now),pt=studyEvent(input,now);assert(en.ics.includes('SUMMARY:Study German'));assert(pt.ics.includes('SUMMARY:Estudar alemão'));assert.equal(new URL(en.google).searchParams.get('text'),'Study German · Sofia');assert.equal(new URL(en.google).searchParams.get('dates'),new URL(pt.google).searchParams.get('dates'));
console.log('PASS: all 500 translations, mixed dynamic text, PT/EN/off restoration, German/answer preservation, and English calendar exports');
