// Escrita pessoal por perfil, material e página. Usa a mesma fila de sincronização do progresso.
export function createWritingPractice({cloud,root=document}){
 const $=id=>root.getElementById(id),panel=$('writingPractice'),input=$('writingText'),limit=10000;
 let target=null,binding='';
 const identity=()=>cloud?.userId?cloud.userId+':'+cloud.profile:'';
 const key=()=>target?identity()+':'+target.id+':'+target.page:'';
 const count=()=>{$('writingCount').textContent=input.value.length.toLocaleString('pt-BR')+' / 10.000 caracteres';};
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
 hide();return{show,hide,refresh};
}
