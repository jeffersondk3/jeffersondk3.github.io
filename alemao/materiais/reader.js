import * as pdfjsLib from './vendor/pdf.mjs';
const workerResponse=await fetch(new URL('./vendor/pdf.worker.mjs.gz.bin',import.meta.url));if(!workerResponse.ok)throw Error('Não foi possível carregar o leitor');const workerText=await new Response(workerResponse.body.pipeThrough(new DecompressionStream('gzip'))).text();pdfjsLib.GlobalWorkerOptions.workerSrc=URL.createObjectURL(new Blob([workerText],{type:'text/javascript'}));
const $=id=>document.getElementById(id),escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let catalog=[],current=null,pdf=null,task=null,abort=null,renderTask=null,generation=0,renderGeneration=0,zoom=1,page=1,queue=Promise.resolve();
const cloud=window.parent.studyCloud;let owner=null;
let progress={last:'material-01',items:{}};
function save(){if(!current||!cloud?.userId)return;cloud.saveMaterial(current.id,progress.items[current.id]);cloud.saveMaterial('_last',{id:current.id});}
function item(id){return progress.items[id]||{page:1,done:false};}
function drawCatalog(){
 const groups=[...new Set(catalog.map(d=>d.group))];$('catalog').innerHTML=groups.map(g=>`<details open><summary>${escape(g)}<span>6 materiais</span></summary>${catalog.filter(d=>d.group===g).map(d=>`<button data-material="${d.id}" class="${d.id===current?.id?'active':''}" ${d.id===current?.id?'aria-current="true"':''}><span class="docIcon">▤</span><div>${d.group==='Bônus'?escape(d.label)+' — ':''}${escape(d.title)}<small>${d.pages} páginas${item(d.id).page>1?' · página '+item(d.id).page:''}</small></div>${item(d.id).done?'<span class="check">✓</span>':''}</button>`).join('')}</details>`).join('');
 const done=catalog.filter(d=>item(d.id).done).length;$('completed').textContent=done;$('progress').style.width=(done/12*100)+'%';
}
function menu(open){$('sidebar').classList.toggle('open',open);$('drawerBackdrop').hidden=!open;$('menuToggle').setAttribute('aria-expanded',open);}
function buttons(ready){for(const id of ['page','done','zoomOut','zoomIn'])$(id).disabled=!ready;$('prev').disabled=$('bottomPrev').disabled=!ready||page<=1;$('next').disabled=$('bottomNext').disabled=!ready||page>=pdf.numPages;if(ready){$('zoomOut').disabled=zoom<=.5;$('zoomIn').disabled=zoom>=2;}$('done').textContent=item(current?.id).done?'✓ Concluído · desfazer':'✓ Marcar como concluído';$('done').setAttribute('aria-pressed',!!item(current?.id).done);}
function pageRender(){
 const doc=pdf,t=generation,r=++renderGeneration;if(!doc)return;
 if(renderTask)renderTask.cancel();
 queue=queue.catch(()=>{}).then(async()=>{
  if(t!==generation||r!==renderGeneration)return;
  const target=page,p=await doc.getPage(target);if(t!==generation||r!==renderGeneration)return;
  const natural=p.getViewport({scale:1});const fit=Math.max(220,$('readerStage').clientWidth-(innerWidth<=760?22:46));const scale=fit/natural.width*zoom;
  const viewport=p.getViewport({scale});let ratio=Math.min(devicePixelRatio||1,2);ratio=Math.min(ratio,Math.sqrt(8000000/(viewport.width*viewport.height)));
  const canvas=$('canvas');canvas.width=Math.floor(viewport.width*ratio);canvas.height=Math.floor(viewport.height*ratio);canvas.style.width=Math.floor(viewport.width)+'px';canvas.style.height=Math.floor(viewport.height)+'px';canvas.setAttribute('aria-label',`${current.title}, página ${target} de ${doc.numPages}`);
  renderTask=p.render({canvasContext:canvas.getContext('2d'),viewport,transform:ratio===1?null:[ratio,0,0,ratio,0,0]});
  try{await renderTask.promise;}catch(e){if(e.name==='RenderingCancelledException')return;throw e;}
  if(t!==generation||r!==renderGeneration)return;renderTask=null;$('loading').hidden=true;$('paper').hidden=false;$('readerStage').scrollTop=0;$('readerStage').scrollLeft=0;
  $('page').value=target;$('page').max=doc.numPages;$('total').textContent='/ '+doc.numPages;$('zoomValue').textContent=Math.round(zoom*100)+'%';buttons(true);
  progress.last=current.id;progress.items[current.id]={...item(current.id),page:target};save();drawCatalog();$('savedStatus').textContent=`Página ${target} de ${doc.numPages} · posição salva na sua conta`;
 }).catch(e=>{if(t===generation){$('loading').hidden=true;$('errorBox').hidden=false;$('errorText').textContent='Não foi possível exibir esta página. Tente abrir o material novamente.';buttons(false);}});
}
async function openMaterial(id){
 const entry=catalog.find(d=>d.id===id);if(!entry)return;
 const t=++generation;++renderGeneration;if(abort)abort.abort();abort=new AbortController();if(renderTask)renderTask.cancel();if(task){try{await task.destroy();}catch{}task=null;}pdf=null;current=entry;zoom=1;
 $('paper').hidden=true;$('loading').hidden=false;$('errorBox').hidden=true;$('loadingText').textContent='Abrindo '+entry.label+'…';$('materialLabel').textContent=entry.group+' · '+entry.label;$('materialTitle').textContent=entry.title;$('materialMeta').textContent=entry.pages+' páginas · material original do curso';$('savedStatus').textContent='Carregando o material…';buttons(false);drawCatalog();menu(false);
 try{
  const parts=new Array(entry.parts.length);let completed=0,nextPart=0;
  await Promise.all(Array.from({length:4},async()=>{while(nextPart<entry.parts.length){const i=nextPart++,part=entry.parts[i];const response=await fetch(part.path,{signal:abort.signal,credentials:'same-origin'});if(!response.ok)throw Error('HTTP '+response.status);const bytes=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:Uint8Array.from(atob(part.iv),c=>c.charCodeAt(0)),additionalData:new TextEncoder().encode(part.aad)},cloud.key,await response.arrayBuffer()));if(t!==generation)return;parts[i]=bytes;completed+=bytes.length;$('loadingText').textContent=`Abrindo ${entry.label} · ${Math.min(100,Math.round(completed/entry.bytes*100))}%`;}}));
  if(t!==generation)return;const bytes=new Uint8Array(completed);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}parts.length=0;
  if(completed!==entry.bytes)throw Error('Arquivo incompleto');
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(b=>b.toString(16).padStart(2,'0')).join('');if(hash!==entry.sha256)throw Error('Falha de integridade');
  task=pdfjsLib.getDocument({data:bytes,cMapUrl:new URL('./vendor/cmaps/',import.meta.url).href,cMapPacked:true,standardFontDataUrl:new URL('./vendor/standard_fonts/',import.meta.url).href,isEvalSupported:false});
  const loaded=await task.promise;if(t!==generation){await loaded.destroy();return;}pdf=loaded;page=Math.max(1,Math.min(pdf.numPages,Number(item(id).page)||1));pageRender();
 }catch(e){if(t!==generation||e.name==='AbortError')return;$('loading').hidden=true;$('errorBox').hidden=false;$('errorText').textContent='Confira sua conexão. Se a sessão tiver expirado, entre novamente com a conta autorizada e abra este material.';$('savedStatus').textContent='O progresso anterior foi preservado.';buttons(false);}
}
function go(delta){if(!pdf)return;const next=page+delta;if(next<1||next>pdf.numPages)return;page=next;buttons(true);pageRender();}
$('catalog').onclick=e=>{const b=e.target.closest('[data-material]');if(b)openMaterial(b.dataset.material);};$('menuToggle').onclick=()=>menu(!$('sidebar').classList.contains('open'));$('drawerBackdrop').onclick=()=>menu(false);
$('prev').onclick=$('bottomPrev').onclick=()=>go(-1);$('next').onclick=$('bottomNext').onclick=()=>go(1);
$('page').onchange=()=>{if(!pdf)return;page=Math.max(1,Math.min(pdf.numPages,Number($('page').value)||1));pageRender();};$('page').onkeydown=e=>{if(e.key==='Enter'){$('page').blur();}};
$('zoomOut').onclick=()=>{zoom=Math.max(.5,zoom-.25);pageRender();};$('zoomIn').onclick=()=>{zoom=Math.min(2,zoom+.25);pageRender();};
$('done').onclick=()=>{if(!current)return;progress.items[current.id]={...item(current.id),page,done:!item(current.id).done};save();drawCatalog();buttons(!!pdf);};$('retry').onclick=()=>{if(current)openMaterial(current.id);};
let resize;window.addEventListener('resize',()=>{clearTimeout(resize);resize=setTimeout(()=>{if(pdf)pageRender();},250);});window.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowRight')go(1);if(e.key==='ArrowLeft')go(-1);if(e.key==='Escape')menu(false);});
function loadProgress(){const values=cloud?.materials()||{};progress={last:values._last?.id||'material-01',items:Object.fromEntries(Object.entries(values).filter(([id])=>id!=='_last'))};}
async function sessionState(){const changed=owner!==cloud?.userId+':'+cloud?.profile;if(changed){owner=cloud?.userId+':'+cloud?.profile;generation++;abort?.abort();renderTask?.cancel();if(task){try{await task.destroy();}catch{}task=null;}pdf=null;current=null;}
 const ready=!!cloud?.userId&&!!cloud.key;$('locked').hidden=ready;$('readerWorkspace').hidden=!ready;$('enterAccount').hidden=!!cloud?.userId;$('unlockForm').hidden=!cloud?.userId;$('lockHint').textContent=cloud?.userId?'Perfil '+(cloud.profile==='sofia'?'Sofia':'Jefferson')+' · '+cloud.email+'. Desbloqueie os materiais para continuar.':'Entre na sua conta para estudar e sincronizar seu progresso.';
 if(!ready)return;loadProgress();drawCatalog();if(!current&&catalog.length)openMaterial(catalog.some(x=>x.id===progress.last)?progress.last:catalog[0].id);
}
$('enterAccount').onclick=()=>window.parent.document.getElementById('accountButton').click();$('unlockForm').onsubmit=async e=>{e.preventDefault();const button=$('unlockForm').querySelector('button');button.disabled=true;$('unlockStatus').textContent='Desbloqueando…';try{await cloud.unlock($('vaultPassword').value);$('vaultPassword').value='';$('unlockStatus').textContent='';await sessionState()}catch(e){$('unlockStatus').textContent=e.message||'Não foi possível desbloquear. Confira sua senha e conexão.'}finally{button.disabled=false}};
if(window.parent===window){location.replace('../?materials=1')}else{window.parent.addEventListener('study:materials',sessionState);window.parent.addEventListener('study:unlocked',sessionState);fetch('catalog.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>{catalog=d;sessionState()}).catch(()=>{$('unlockStatus').textContent='Não foi possível carregar os materiais. Confira a conexão e tente novamente.'});sessionState();}
