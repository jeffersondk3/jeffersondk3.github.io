import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pathProgress,selectUnit,splitBudget,makePlan} from '../alemao/daily-path-core.mjs';
import {checkpointQuestions,checkCheckpoint,checkpointPanel} from '../alemao/path-checkpoint.mjs';
import {levelProjection,estimatePanel} from '../alemao/level-projection.mjs';
const data=JSON.parse(await readFile(new URL('../alemao/daily-path-data.json',import.meta.url)));
const history={},checks={};assert.equal(pathProgress(history).index,0);
for(let i=0;i<36;i++){
 assert.equal(pathProgress(history,checks).index,i);
 const unit=selectUnit(data.courses,data.dialogues,data.episodes,i,'base');assert.equal(unit.lesson.id,data.courses[i].id);
 for(let n=0;n<3;n++)history['session-'+i+'-'+n]={...makePlan({minutes:30,route:'base'},unit,'2026-11-07'),done:{grammar:true}};
 const state=pathProgress(history,checks);
 if(i%12===11){assert.equal(state.index,i);assert.equal(state.checkpoint,true);assert(checkpointPanel(data.courses,state).includes('pathCheckpoint'));
 const q=checkpointQuestions(data.courses,unit.lesson.level),answers=q.map(q=>q.answer),skills={read:true,listen:true,write:true,speak:true},writing='Ich lerne jeden Tag Deutsch und möchte meine Kenntnisse verbessern.';
 assert.equal(checkCheckpoint(q,answers,writing,skills).passed,true);
 assert.equal(checkCheckpoint(q,['wrong','wrong','wrong','wrong'],writing,skills).passed,false);
 assert.equal(checkCheckpoint(q,answers,'zu kurz',skills).passed,false);
 assert.equal(checkCheckpoint(q,answers,writing,{...skills,speak:false}).passed,false);
 checks[unit.lesson.level]={passed:true};}
 if(i>=24){assert.equal(unit.lesson.level,'B1');assert.equal(unit.material,'material-03');assert.equal(unit.episodeRelated,false);assert(unit.lesson.story.every(s=>s.audio));}
}
assert.equal(pathProgress(history,checks).complete,true);
assert.equal(pathProgress(history,{}).index,11);
assert.equal(pathProgress({bad:{lessonId:'B1-99',done:{grammar:true}}}).index,0);
assert.equal(pathProgress({}).level,'A1');
for(const min of [15,30,60,90,150,180])for(const route of ['base','speak','listen','work','move']){const tasks=splitBudget(min,route);assert.equal(tasks.reduce((sum,t)=>sum+t.minutes,0),min);assert(tasks.some(t=>t.id==='grammar'));for(let i=24;i<36;i++)assert.equal(selectUnit(data.courses,data.dialogues,data.episodes,i,route).lesson.level,'B1')}
const b1=levelProjection(150,6).levels.find(l=>l.level==='B1');assert.equal(b1.min,262.5);assert.equal(b1.max,487.5);assert(estimatePanel(150,6).includes('<h4>B1</h4>'));
console.log('PASS: 36 units, A1/A2 transitions, B1 completion, failed reviews, required skills/writing, 5 routes, short budgets and B1 projections');
