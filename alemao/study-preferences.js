const THEME='deutsch-theme-v1',STUDY='deutsch-study-language-v1';
let theme='light',language='pt',captions=null,captionRequest=null,queued=false;
try{theme=localStorage.getItem(THEME)==='dark'?'dark':'light';language=['pt','en','off'].includes(localStorage.getItem(STUDY))?localStorage.getItem(STUDY):'pt'}catch{}
export const studyLanguage=()=>language;
export const appearanceTheme=()=>theme;
const strict='.pt,.translation,.exerciseItem>p,[data-caption-pt]';
const targets=strict+',.question .option span';
function paintCaptions(){
 queued=false;if(!document?.body||(language==='en'&&!captions))return;
 for(const el of document.querySelectorAll(targets)){
  const original=el.dataset.captionPt??el.textContent.trim();
  if(captions&&Object.hasOwn(captions,original)){
   el.dataset.captionPt=original;el.classList.remove('caption-unavailable');const desired=language==='en'?captions[original]:original;
   if(el.textContent!==desired)el.textContent=desired;el.lang=language==='en'?'en':'pt';
  }else if(el.matches(strict)){el.classList.toggle('caption-unavailable',language==='en');}
 }
 for(const a of document.querySelectorAll('#translateSelection,#translateWriting'))if(a.hasAttribute('href')){const url=new URL(a.href);url.searchParams.set('tl',language==='en'?'en':'pt');a.href=url.href;}
 const help=document.querySelector('.writingTranslation p:last-child');if(help){const message=language==='en'?'Abre o Google Tradutor em inglês. O texto só é enviado ao abrir a tradução.':'Abre o Google Tradutor em português. O texto só é enviado ao abrir a tradução.';if(help.textContent!==message)help.textContent=message;}
}
async function loadCaptions(){if(captions)return;if(!captionRequest)captionRequest=fetch(new URL('./caption-en.json?v=16',import.meta.url)).then(r=>{if(!r.ok)throw Error('captions');return r.json()}).then(data=>{captions=data;if(!document?.documentElement)return;document.documentElement.dataset.captionsReady='true';paintCaptions()}).catch(()=>{captionRequest=null;if(!document?.documentElement)return;const hint=document.getElementById('studyPreferencesHint');if(hint)hint.textContent='Não foi possível carregar o inglês. Confira a conexão e selecione o idioma novamente.';});await captionRequest;}
export function setStudyPreferences(next={}){
 if(next.theme)theme=next.theme==='dark'?'dark':'light';if(next.language)language=['pt','en','off'].includes(next.language)?next.language:'pt';
 document.documentElement.dataset.theme=theme;document.documentElement.dataset.study=language;document.documentElement.dataset.captionsReady=String(!!captions||language!=='en');
 try{localStorage.setItem(THEME,theme);localStorage.setItem(STUDY,language)}catch{}
 const themeControl=document.getElementById('themeSelect'),studyControl=document.getElementById('studyLanguage');if(themeControl)themeControl.value=theme;if(studyControl)studyControl.value=language;
 const hint=document.getElementById('studyPreferencesHint');if(hint)hint.textContent=language==='en'?'Áudio em alemão · legendas de apoio em inglês.':language==='off'?'Sem legendas nas falas. Os enunciados e exercícios continuam disponíveis.':'Alemão com legendas de apoio em português.';
 if(language==='en')loadCaptions();else paintCaptions();window.dispatchEvent(new CustomEvent('study:preferences',{detail:{theme,language}}));
}
function boot(){
 document.getElementById('themeSelect')?.addEventListener('change',event=>setStudyPreferences({theme:event.target.value}));
 document.getElementById('studyLanguage')?.addEventListener('change',event=>setStudyPreferences({language:event.target.value}));
 const observer=new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(paintCaptions)}});observer.observe(document.body,{childList:true,subtree:true});setStudyPreferences();
 window.addEventListener('storage',event=>{if(event.key===THEME||event.key===STUDY){let values={};try{values={theme:localStorage.getItem(THEME),language:localStorage.getItem(STUDY)}}catch{}setStudyPreferences(values)}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
