// Shared learning requirements. Text length is a completion check, not a language assessment.
export function normalizedText(text){return String(text||'').normalize('NFC').trim().replace(/\s+/gu,' ')}
export function writtenCount(text){return [...normalizedText(text)].length}
export function hasWriting(text,min=30){return writtenCount(text)>=min&&/\p{L}/u.test(String(text||''))}
export function quizPassed(state,questions){const draft=state?.draft||{},last=state?.last;if(!last||!questions.length||last.items?.length!==questions.length)return false;let correct=0;for(let i=0;i<questions.length;i++){if(!questions[i].options.includes(draft[i])||last.items[i].chosen!==draft[i])return false;if(draft[i]===questions[i].answer)correct++}return correct*2>=questions.length}
export function translationUrl(text){return 'https://translate.google.com/?sl=de&tl=pt&text='+encodeURIComponent(String(text||'').slice(0,10000))+'&op=translate'}
export function selectedWriting(text,start,end){const value=String(text||'');if(end>start)return value.slice(start,end).trim();const position=Math.max(0,Math.min(value.length,start||0));const re=/[\p{L}\p{M}]+(?:['’-][\p{L}\p{M}]+)*/gu;for(const match of value.matchAll(re))if(position>=match.index&&position<=match.index+match[0].length)return match[0];return ''}
