import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../exercises.js',import.meta.url),'utf8');const {compareSentence}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
assert.equal(compareSentence('  Hallo!  Wie heißt du?  ','Hallo! Wie heißt du?').correct,true);
assert.equal(compareSentence('Hallo Wie heißt du','Hallo! Wie heißt du?').correct,true);
assert.equal(compareSentence('hallo! Wie heißt du?','Hallo! Wie heißt du?').correct,false);
assert.equal(compareSentence('Ich heisse Anna.','Ich heiße Anna.').correct,false);
assert.equal(compareSentence('Ich mochte Kaffee.','Ich möchte Kaffee.').correct,false);
assert.equal(compareSentence('Gru\u0308ße','Grüße').correct,true);
assert.equal(compareSentence('...','Hallo').empty,true);
const missing=compareSentence('Ich aus Brasilien.','Ich komme aus Brasilien.');assert.deepEqual(missing.expectedMatches,[true,false,true,true]);
const extra=compareSentence('Ich komme wirklich aus Brasilien.','Ich komme aus Brasilien.');assert.equal(extra.correct,false);assert.equal(extra.actualMatches[2],false);
assert.equal(compareSentence('<script>alert(1)</script>','Hallo').correct,false);
const lessons=JSON.parse(await readFile(new URL('../data.json',import.meta.url)));assert.equal(lessons.length,100);for(const lesson of lessons){assert.equal(lesson.lines.length,4);for(const line of lesson.lines)assert.equal(compareSentence(line.de,line.de).correct,true)}
console.log('PASS: 400 frases originais; erros de palavra, letras e caixa; pontuação; Unicode; palavras ausentes e extras.');
