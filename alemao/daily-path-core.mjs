import {addDays,dateNumber,todayISO} from './project90-core.mjs?v=2';
export {todayISO};
export const ROUTES=[{id:'base',name:'Começar do básico',note:'Apresentação, perguntas e necessidades do dia a dia.'},{id:'speak',name:'Destravar a fala',note:'Mais diálogo, repetição e respostas próprias.'},{id:'listen',name:'Entender melhor o áudio',note:'Mais escuta com uma pergunta para responder.'},{id:'work',name:'Alemão para TI e trabalho',note:'Base do idioma aplicada à profissão e à tecnologia.'},{id:'move',name:'Viagem e mudança',note:'Moradia, compras, transporte e vida na Alemanha.'}];
const norm=s=>String(s).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
export function splitBudget(minutes,route='base'){
 const n=Math.max(10,Math.min(180,Math.round(Number(minutes)||30)));
 const types=n<45?['review','grammar','dialogue']:n<75?['review','grammar','dialogue','material']:['review','grammar','dialogue','podcast','material','speak','support'];
 const weights={review:20,grammar:30,dialogue:20,podcast:20,material:20,speak:30,support:10};
 if(route==='speak'){weights.dialogue+=10;weights.speak+=10}if(route==='listen')weights.podcast+=20;if(route==='work')weights.grammar+=10;if(route==='move')weights.material+=10;
 const sum=types.reduce((s,t)=>s+weights[t],0);let allocated=0;
 return types.map((type,i)=>{const time=i===types.length-1?n-allocated:Math.max(1,Math.floor(n*weights[type]/sum));allocated+=time;return {id:type,minutes:time}})
}
export function reviewBudget(minutes){return Math.max(3,Math.min(40,Math.floor(Number(minutes)*.27)))}
export function recentStats(config,history,today){let checked=0,missed=0;for(let offset=1;offset<=7;offset++){const date=addDays(today,-offset);if(date<config.created)continue;const weekday=new Date(date+'T12:00:00Z').getUTCDay();if(config.days===6&&weekday===0)continue;checked++;const record=history[date];const tasks=record?.tasks||[];const completed=tasks.filter(t=>record?.done?.[t.id]).length;if(!tasks.length||completed<Math.ceil(tasks.length/2))missed++}return {checked,missed,suggest:checked>=3&&missed>=3}}
export function pathProgress(history,checks={}){
 const counts={};for(const day of Object.values(history||{})){if(day?.done?.grammar===true&&/^(A1|A2|B1)-(0[1-9]|1[0-2])$/.test(day.lessonId||''))counts[day.lessonId]=(counts[day.lessonId]||0)+1}
 for(let i=0;i<36;i++){const level=['A1','A2','B1'][Math.floor(i/12)],id=level+'-'+String(i%12+1).padStart(2,'0'),sessions=counts[id]||0;if(sessions<3)return {index:i,level,unit:i%12+1,sessions:Math.min(3,sessions),checkpoint:false,complete:false};if(i%12===11&&checks[level]?.passed!==true)return {index:i,level,unit:12,sessions:3,checkpoint:true,complete:false}}
 return {index:35,level:'B1',unit:12,sessions:3,checkpoint:false,complete:true}
}
export function unitIndex(history,checks={}){return pathProgress(history,checks).index}
export function selectUnit(courses,dialogues,episodes,index,route){
 const list=courses.filter(l=>['A1','A2','B1'].includes(l.level));const lesson=list[Math.min(index,list.length-1)]||list[0];
 const suggested={work:'Tecnologia e TI',move:'Vida na Alemanha',speak:'Primeiras conversas',listen:'Pela cidade'}[route];
 const topics=['Primeiras conversas','Estudos','Primeiras conversas','Compras','Comer e beber','Primeiras conversas','Compras','Comer e beber','Pela cidade','Estudos','Pela cidade','Pela cidade','No trabalho','Pela cidade','Moradia e hotel','Estudos','Moradia e hotel','Tecnologia e TI','Saúde e atendimento','Compras','No trabalho','Compras','Estudos','Vida na Alemanha','Estudos','No trabalho','No trabalho','Primeiras conversas','Tecnologia e TI','Vida na Alemanha','No trabalho','Pela cidade','Vida na Alemanha','Estudos','Vida na Alemanha','Estudos']; const topic=index>=3&&route==='work'?(index%2?'No trabalho':'Tecnologia e TI'):index>=3&&route==='move'?(index%2?'Pela cidade':'Vida na Alemanha'):topics[index]||suggested||'Vida na Alemanha';
 const pool=dialogues.filter(d=>d.category===topic);const dialogue=pool[index%Math.max(1,pool.length)]||dialogues[0];
 const episodeMap=[1,57,3,47,65,68,36,9,13,54,73,61,72,82,19,45,91,20,80,58,63,12,115,69,54,72,63,68,20,119,45,118,122,115,117,69];
 const best=episodes.find(e=>e.number===episodeMap[index])||episodes[0];const score=0;
 return {lesson,dialogue,episode:best,material:({A1:'material-01',A2:'material-02',B1:'material-03'})[lesson.level],topic,episodeRelated:lesson.level!=='B1'}
}
export function makePlan(config,unit,today){return {version:1,date:today,route:config.route,budget:config.minutes,topic:unit.topic,lessonId:unit.lesson.id,dialogueId:unit.dialogue.id,episodeNumber:unit.episode.number,materialId:unit.material,episodeRelated:unit.episodeRelated,tasks:splitBudget(config.minutes,config.route),done:{}}}
