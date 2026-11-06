import {hasWriting} from './learning-rules.js?v=14';
export function summarize(records={},grammar={}) {
 const values=Object.entries(records);
 const done=prefix=>values.filter(([k,v])=>prefix.test(k)&&v?.done===true).length;
 const podcasts=values.filter(([k])=>/^podcast:\d+$/.test(k)).map(([,v])=>v);
 const lessons=Object.values(grammar);
 return {dialogues:done(/^dialogues\/\d+$/),materials:done(/^material-\d+$/),written:values.filter(([k,v])=>k.startsWith('writing:')&&String(v?.text||'').trim()).length,podcasts:podcasts.filter(v=>v?.completed).length,heard:podcasts.filter(v=>v?.heard).length,prayer:new Set((records['prayer-vaterunser-v1']?.done||[]).filter(n=>Number.isInteger(n)&&n>=0&&n<11)).size,grammar:lessons.filter(s=>s?.context&&s.rule&&s.grammar?.best>=100&&s.listening?.best>=100&&s.practiced&&hasWriting(s.text)).length,started:lessons.filter(s=>s&&Object.keys(s).length).length};
}
