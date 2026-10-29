const path=require('node:path');
const fs=require('fs'),vm=require('vm'),assert=require('assert');
async function test(file,kind){
 const text=fs.readFileSync(file,'utf8');let start=text.indexOf("const VOICE_KEY="),end=text.indexOf(kind==='main'?'\nlet data=':'\nlet displayedAccount=',start);assert.ok(start>0&&end>start);
 const nodes={},node=id=>nodes[id]??={value:'',removeAttribute(){},load(){}};let calls=0,stored={},stopped=0,fail=false;
 const ctx={$:node,audio:node('audioPlayer'),current:null,token:0,stop:()=>stopped++,stopAudio:()=>stopped++,notice(){},localStorage:{getItem:k=>stored[k],setItem:(k,v)=>stored[k]=v},fetch:async()=>{calls++;return {ok:!fail,json:async()=>kind==='main'?{de:['female-de'],pt:['female-pt']}:{'audio/a.mp3':'female-de'}}}};
 vm.runInNewContext(text.slice(start,end)+`;globalThis.resolveVoice=${kind==='main'?'clipSource':'voiceSource'};`,ctx);
 const resolve=()=>kind==='main'?ctx.resolveVoice(1,0,'de'):ctx.resolveVoice('audio/a.mp3');
 assert.equal(await resolve(),kind==='main'?'audio/001-1-de.mp3':'audio/a.mp3');assert.equal(calls,0);
 const selector=node(kind==='main'?'voiceChoice':'#voiceChoice');selector.value='female';selector.onchange();assert.equal(stored['deutsch-voice-choice-v1'],'female');assert.equal(await resolve(),'female-de');assert.equal(await resolve(),'female-de');assert.equal(calls,1);
 if(kind==='main')assert.equal(await ctx.resolveVoice(1,0,'pt'),'female-pt');selector.value='male';selector.onchange();assert.equal(await resolve(),kind==='main'?'audio/001-1-de.mp3':'audio/a.mp3');assert.equal(stopped,2);
 console.log('PASS',kind,'voz original, feminina, cache, persistência e troca.');
}
(async()=>{await test(path.resolve(__dirname,'../app.js'),'main');await test(path.resolve(__dirname,'../gramatica/app.js'),'grammar')})().catch(e=>{console.error(e);process.exit(1)});
