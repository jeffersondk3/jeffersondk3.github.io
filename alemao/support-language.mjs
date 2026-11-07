// Translate display text only. Never change form values, German text or saved answers.
const originals=new WeakMap(),attributes=new WeakMap();let lastDictionary=null,pattern=null,dictionary=null;
export const supportText=text=>dictionary?translateSupportText(text,dictionary):String(text);
function dictionaryPattern(dictionary){if(dictionary===lastDictionary)return pattern;lastDictionary=dictionary;const keys=Object.keys(dictionary).filter(Boolean).sort((a,b)=>b.length-a.length).map(s=>(/^[\p{L}\p{N}]/u.test(s)?'(?<![\\p{L}\\p{N}])':'')+s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+(/[\p{L}\p{N}]$/u.test(s)?'(?![\\p{L}\\p{N}])':''));pattern=new RegExp(keys.join('|'),'gu');return pattern}
export function translateSupportText(source,dictionary){const text=String(source),trimmed=text.trim();if(Object.hasOwn(dictionary,trimmed))return text.replace(trimmed,dictionary[trimmed]);return text.replace(dictionaryPattern(dictionary),key=>dictionary[key])}
export function paintSupportLanguage(document,language,dictionary){
 if(!dictionary)return;
 for(const root of document.querySelectorAll('#project90,#dailyPath,#progressPanel,#tabToday,#tabProgress')){
  const walker=document.createTreeWalker(root,4);let node;
  while((node=walker.nextNode())){
   const parent=node.parentElement;if(!parent||parent.closest('script,style,textarea,input,[lang="de"],[data-caption-pt],.pronunciation,[data-no-translate]'))continue;
   const cached=originals.get(node),source=cached&&node.data===cached.output?cached.source:node.data;
   const output=language==='en'?translateSupportText(source,dictionary):source;
   originals.set(node,{source,output});if(node.data!==output)node.data=output;
  }
  for(const element of [root,...root.querySelectorAll('[aria-label],[title],[placeholder]')]){
   if(element.closest('[lang="de"],[data-no-translate]'))continue;
   const state=attributes.get(element)||{};
   for(const name of ['aria-label','title','placeholder']){if(!element.hasAttribute(name))continue;const current=element.getAttribute(name),old=state[name],source=old&&current===old.output?old.source:current,output=language==='en'?translateSupportText(source,dictionary):source;state[name]={source,output};if(current!==output)element.setAttribute(name,output)}
   attributes.set(element,state);
  }
 }
}
function bootSupportLanguage(){
 let queued=false;const paint=()=>{queued=false;paintSupportLanguage(document,document.documentElement.dataset.study||'pt',dictionary)};
 const schedule=()=>{if(!queued){queued=true;queueMicrotask(paint)}};
 const style=document.createElement('style');style.textContent=':root[data-study=off] #project90 .p90Support{display:none!important}';document.head.append(style);
 window.addEventListener('study:preferences',schedule);
 new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});
 fetch(new URL('./study-support-en.json?v=1',import.meta.url)).then(r=>{if(!r.ok)throw Error('English support');return r.json()}).then(data=>{dictionary=data;schedule()}).catch(()=>{const hint=document.getElementById('studyPreferencesHint');if(hint&&document.documentElement.dataset.study==='en')hint.textContent='Não foi possível carregar o apoio em inglês destas áreas. O português permanece disponível; confira a conexão e reabra o app.'});
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootSupportLanguage,{once:true});else bootSupportLanguage()}
