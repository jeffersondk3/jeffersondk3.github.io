export const DAY=86400000;
export function dateNumber(iso){if(!/^\d{4}-\d{2}-\d{2}$/.test(iso||''))return NaN;const n=Date.parse(iso+'T00:00:00Z');return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===iso?n/DAY:NaN}
export function addDays(iso,n){return new Date((dateNumber(iso)+n)*DAY).toISOString().slice(0,10)}
export function dayOf(start,today){return Math.floor(dateNumber(today)-dateNumber(start))+1}
export function isNewDay(day){return day>=1&&day<=90&&(day<=30?day<=24:day<=60?day<=54:day<=83)}
export function allowance(day){let n=0;for(let d=1;d<=Math.min(90,day);d++)if(isNewDay(d))n+=7;return n}
export function todayISO(now=new Date()){const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);const v=t=>p.find(x=>x.type===t).value;return v('year')+'-'+v('month')+'-'+v('day')}
export function normalize(s){return String(s||'').normalize('NFC').trim().toLocaleLowerCase('de-DE').replace(/[.!?,;:]/g,'').replace(/\s+/g,' ')}
export function blankFor(p){const words=[...p.de.matchAll(/\p{L}[\p{L}-]*/gu)];const w=words.filter(w=>w[0].length>=4).at(-1)||words.at(-1);return {answer:w[0],prompt:p.de.slice(0,w.index)+'____'+p.de.slice(w.index+w[0].length)}}
export function nextReview(old={},correct,today){const gaps=[1,2,4,7,16,30];const step=correct?Math.min((old.step||0)+1,6):0;return {...old,step,due:addDays(today,correct?gaps[Math.max(0,step-1)]:1),lastReviewed:today,attempts:(old.attempts||0)+1,errors:(old.errors||0)+(correct?0:1),lastCorrect:correct}}
export function queue(phrases,records,start,today){const day=dayOf(start,today),states=phrases.map(p=>({p,s:records[p.id]}));const reviews=states.filter(x=>x.s?.introduced&&x.s.due<=today).sort((a,b)=>a.s.due.localeCompare(b.s.due)).map(x=>x.p);const introducedToday=states.filter(x=>x.s?.introduced===today).length;const fresh=isNewDay(day)&&!reviews.length?states.filter(x=>!x.s?.introduced&&x.p.id<=allowance(day)).slice(0,Math.max(0,7-introducedToday)).map(x=>x.p):[];return {day,reviews,fresh,introducedToday}}
