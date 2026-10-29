import assert from 'node:assert/strict';
import {createSyncEngine,flatten,inflate} from '../gramatica/sync-core.mjs';
import {articleGender} from '../gramatica/gender-colors.mjs';
const clone=x=>JSON.parse(JSON.stringify(x)),db=new Map();let offline=false,number=0;
const transport={async load(user){if(offline)throw Error('offline');return [...db].filter(([k])=>k.startsWith(user+'\t')).map(([,v])=>clone(v))},async save(user,rows){if(offline)throw Error('offline');for(const row of rows)db.set(user+'\t'+row.profile+'\n'+row.item_key,clone(row))}};
const mem=()=>{const m=new Map();return{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)}};
const make=storage=>{let data;const states=[];const engine=createSyncEngine({transport,storage,revision:()=>String(++number),onApply:x=>data=x,onStatus:(s)=>states.push(s)});return{engine,states,get data(){return data}}};
const seed={selected:'Sofia',profiles:{Jefferson:{lessons:{'A1-01':{text:'Ich lerne heute Deutsch mit Sofia.'}},days:['2026-10-28']},Sofia:{lessons:{'A1-01':{text:'Ich bin Sofia und ich lerne Deutsch.'}}}}};
const a=make(mem()),b=make(mem()),c=make(mem());
try{
 await a.engine.login({id:'user1',email:'test@example.test'},seed);
 assert.equal(a.data.profiles.Sofia.lessons['A1-01'].text,seed.profiles.Sofia.lessons['A1-01'].text);
 await b.engine.login({id:'user1'});assert.equal(b.data.profiles.Jefferson.lessons['A1-01'].text,seed.profiles.Jefferson.lessons['A1-01'].text);
 a.data.profiles.Jefferson.lessons['A1-01'].text='Ich schreibe einen neuen Satz auf Deutsch.';a.engine.capture(a.data);await a.engine.sync();await b.engine.sync();assert.equal(b.data.profiles.Jefferson.lessons['A1-01'].text,a.data.profiles.Jefferson.lessons['A1-01'].text);
 assert.equal(b.data.profiles.Sofia.lessons['A1-01'].text,seed.profiles.Sofia.lessons['A1-01'].text);
 await c.engine.login({id:'user2'});assert.equal(c.data.profiles.Jefferson.lessons['A1-01'],undefined);
 offline=true;a.data.profiles.Jefferson.lessons['A1-02']={text:'Meine zweite Lektion bleibt gespeichert.'};a.engine.capture(a.data);await a.engine.sync();assert.ok(a.engine.pendingCount);assert.equal(a.states.at(-1),'offline');offline=false;await a.engine.sync();await b.engine.sync();assert.equal(b.data.profiles.Jefferson.lessons['A1-02'].text,'Meine zweite Lektion bleibt gespeichert.');
 delete a.data.profiles.Jefferson.lessons['A1-02'];a.engine.capture(a.data);await a.engine.sync();await b.engine.sync();assert.equal(b.data.profiles.Jefferson.lessons['A1-02'],undefined);
 const remoteText=b.data.profiles.Jefferson.lessons['A1-01'].text;const d=make(mem());await d.engine.login({id:'user1'},seed);assert.equal(d.data.profiles.Jefferson.lessons['A1-01'].text,remoteText);d.engine.logout();
 assert.equal(articleGender('der','Mann'),'m');assert.equal(articleGender('die','Frau'),'f');assert.equal(articleGender('das','Kind'),'n');assert.equal(articleGender('die','Bücher'),'plural');assert.equal(articleGender('der','Frau'),'f');assert.equal(articleGender('die','Deutsch'),null);assert.equal(articleGender('das','',true),'n');
 console.log('PASS: two-device sync; two profiles; user isolation; offline queue; deletion; non-destructive migration; masculine/feminine/neuter/plural and feminine dative.');
}finally{a.engine.logout();b.engine.logout();c.engine.logout()}
