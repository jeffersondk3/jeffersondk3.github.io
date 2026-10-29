import {studyLanguage} from '../study-preferences.js?v=24';
import {hasWriting,writtenCount,selectedWriting,translationUrl} from '../learning-rules.js?v=14';
// Escrita pessoal por perfil, material e página. Usa a mesma fila de sincronização do progresso.
export function createWritingPractice({cloud,root=document,onChange=()=>{}}){
 const $=id=>root.getElementById(id),panel=$('writingPractice'),input=$('writingText'),limit=10000;
 let target=null,binding='';
 const identity=()=>cloud?.userId?cloud.userId+':'+cloud.profile:'';
 const key=()=>target?identity()+':'+target.id+':'+target.page:'';
 const count=()=>{const n=writtenCount(input.value);$('writingCount').textContent=n.toLocaleString('pt-BR')+' caracteres · mínimo 30 para avançar';$('writingRequirement').textContent=hasWriting(input.value)?'✓ Mínimo atingido. Próxima página liberada.':'Escreva mais '+Math.max(0,30-n)+' caracteres para liberar a próxima página.';translationOptions();onChange();};
 function valid(){return target&&binding===key()&&!!cloud?.userId;}
 function refresh(){if(!valid())return;const text=cloud.writing(target.id,target.page);if(root.activeElement!==input&&input.value!==text){input.value=text;count();}}
 function show(next){target=next;const nextBinding=key();if(!identity()){hide();return;}panel.hidden=false;input.disabled=false;
  $('writingContext').textContent=next.title+' · Página '+next.page+' · '+(cloud.profile==='sofia'?'Sofia':'Jefferson');
  if(binding!==nextBinding){binding=nextBinding;input.value=cloud.writing(next.id,next.page);$('writingStatus').textContent='Salvamento automático por lição e perfil.';count();}else refresh();
 }
 function hide(){target=null;binding='';input.value='';input.disabled=true;panel.hidden=true;count();}
 function save(){if(!valid())return;cloud.saveWriting(target.id,target.page,input.value);count();$('writingStatus').textContent='Texto salvo neste aparelho. Acompanhe a sincronização no topo do app.';}
 input.addEventListener('input',save);input.addEventListener('blur',refresh);
 $('germanCharacters').addEventListener('click',e=>{const character=e.target.closest('[data-character]')?.dataset.character;if(!character||!valid())return;const start=input.selectionStart??input.value.length,end=input.selectionEnd??start;if(input.value.length-(end-start)+character.length>limit)return;input.setRangeText(character,start,end,'end');input.focus();save();});

 function translationOptions(){const selected=selectedWriting(input.value,input.selectionStart,input.selectionEnd),all=input.value.trim();for(const [id,text]of [['translateSelection',selected],['translateWriting',all]]){const a=$(id);a.hidden=!text;if(text)a.href=translationUrl(text).replace('tl=pt','tl='+ (studyLanguage()==='en'?'en':'pt'));else a.removeAttribute('href')}const preview=$('translationSelection');preview.textContent=selected?'Selecionado: '+selected.slice(0,180):'Toque numa palavra ou selecione uma frase para traduzir.';}
 window.addEventListener('study:preferences',translationOptions);
 input.addEventListener('click',translationOptions);input.addEventListener('select',translationOptions);input.addEventListener('keyup',translationOptions);input.addEventListener('touchend',()=>setTimeout(translationOptions,0));
 function canAdvance(){return !!valid()&&hasWriting(input.value)}
 function requireWriting(){if(canAdvance())return true;panel.hidden=false;count();$('writingStatus').textContent='Escreva pelo menos 30 caracteres nesta página antes de continuar.';panel.scrollIntoView?.({behavior:'smooth',block:'center'});input.focus();return false;}

 hide();return{show,hide,refresh,canAdvance,requireWriting};
}

