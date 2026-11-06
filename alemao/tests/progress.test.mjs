import assert from 'node:assert/strict';
import {summarize} from '../progress-model.mjs';
const complete={context:true,rule:true,grammar:{best:100},listening:{best:100},practiced:true,text:'Ich lerne heute Deutsch zu Hause.'};
assert.deepEqual(summarize(),{dialogues:0,materials:0,written:0,podcasts:0,heard:0,prayer:0,grammar:0,started:0});
const s=summarize({'dialogues/1':{done:true},'dialogues/exercise:1':{done:true},'material-01':{done:true},'podcast:1':{heard:true},'podcast:2':{completed:true},'prayer-vaterunser-v1':{done:[0,0,1,99]},'writing:material-01:2':{text:'Hallo'}},{'A1-01':complete,'A1-02':{...complete,text:'x'}});
assert.equal(s.dialogues,1);assert.equal(s.materials,1);assert.equal(s.heard,1);assert.equal(s.podcasts,1);assert.equal(s.prayer,2);assert.equal(s.grammar,1);assert.equal(s.written,1);
console.log('PASS: independent counts, real completion rules, duplicate/invalid steps and empty state');
