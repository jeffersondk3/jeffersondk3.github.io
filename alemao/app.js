import {createDialoguePractice} from './exercises.js?v=11';
'use strict';
const $=id=>document.getElementById(id);
const audio=$('audioPlayer');
let data=[],current=null,category='',favoriteOnly=false,doneOnly=false,token=0,playing=false,index=-1,waiting=false;
let saved={done:[],favorites:[],last:1};try{saved={...saved,...JSON.parse(localStorage.getItem('deutsch-alltag-v1')||'{}')};for(const k of ['done','favorites'])if(!Array.isArray(saved[k]))saved[k]=[]}catch{}
const persist=()=>{try{localStorage.setItem(window.studyCloud?.userId?'deutsch-alltag-user-'+window.studyCloud.userId+'-'+window.studyCloud.profile:'deutsch-alltag-v1',JSON.stringify(saved));window.studyCloud?.saveDialogues(saved)}catch{}};
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dialoguePractice=createDialoguePractice({getCloud:()=>window.studyCloud,storage:localStorage,listen:n=>playSentence(n,'de')});
window.addEventListener('study:exercises',()=>dialoguePractice.refresh());
function draw(){
 $('doneCount').textContent=saved.done.length;$('progressBar').style.width=saved.done.length+'%';
 const cats=[...new Set(data.map(d=>d.category))];$('categories').innerHTML=[['','◉','Todas as conversas'],...cats.map(c=>[c,data.find(d=>d.category===c).icon,c])].map(([c,icon,name])=>`<button data-category="${c}" class="${category===c?'active':''}"><span>${icon}</span>${name}<span>${c?'10':'100'}</span></button>`).join('');
 const query=$('search').value.trim().toLocaleLowerCase();const filtered=data.filter(d=>(!category||d.category===category)&&(!favoriteOnly||saved.favorites.includes(d.id))&&(!doneOnly||saved.done.includes(d.id))&&(!query||[d.title,d.category,...d.lines.flatMap(l=>[l.de,l.pt])].join(' ').toLocaleLowerCase().includes(query)));
 $('listTitle').innerHTML=`${escapeHTML(category||'Todas as conversas')} <span>${filtered.length}</span>`;
 $('cards').innerHTML=filtered.map(d=>`<article class="card"><div class="icon">${d.icon}</div><button class="heart" data-favorite="${d.id}" aria-label="${saved.favorites.includes(d.id)?'Remover dos favoritos':'Favoritar'} ${escapeHTML(d.title)}" aria-pressed="${saved.favorites.includes(d.id)}">${saved.favorites.includes(d.id)?'♥':'♡'}</button>${saved.done.includes(d.id)?'<span class="done">✓ praticado</span>':''}<div class="tag">${String(d.id).padStart(2,'0')} · ${d.level} · 4 falas</div><h3>${escapeHTML(d.title)}</h3><p>${escapeHTML(d.lines[0].de)}</p><button class="open" data-open="${d.id}" aria-label="Praticar: ${escapeHTML(d.title)}">Praticar conversa</button></article>`).join('');$('empty').hidden=filtered.length>0;
}
function favorite(id){saved.favorites=saved.favorites.includes(id)?saved.favorites.filter(x=>x!==id):[...saved.favorites,id];persist();draw();if(current)lessonButtons()}
function lessonButtons(){$('favorite').textContent=saved.favorites.includes(current.id)?'♥':'♡';$('favorite').setAttribute('aria-pressed',saved.favorites.includes(current.id));$('markDone').textContent=saved.done.includes(current.id)?'✓ Praticado · desfazer':'✓ Marcar como praticado';$('previous').disabled=current.id===1;$('next').disabled=current.id===100}
function showLines(){if(!current)return;$('lines').innerHTML=current.lines.map((l,i)=>`<div class="line ${index===i?'active':''} ${waiting&&index===i?'yourTurn':''}" id="line-${i}"><span class="avatar ${l.role==='B'?'b':''}">${l.role}</span><div class="words">${waiting&&index===i?'<div class="turnLabel">SUA VEZ · fale em voz alta</div>':''}<div class="de" lang="de">${escapeHTML(l.de)}</div><div class="pronunciation" aria-label="Pronúncia aproximada" ${$('showPron').checked?'':'hidden'}>${escapeHTML(l.pronunciation||'')}</div><div class="pt" ${$('showPt').checked?'':'hidden'}>${escapeHTML(l.pt)}</div></div><div class="sentenceAudio"><button data-sentence="${i}" data-lang="de" aria-label="Ouvir frase ${i+1} em alemão">DE ♪</button><button data-sentence="${i}" data-lang="pt" aria-label="Ouvir frase ${i+1} em português">PT ♪</button></div></div>`).join('')}
function stop(){token++;audio.onended=null;audio.onerror=null;audio.pause();try{audio.currentTime=0}catch{}playing=false;waiting=false;index=-1;$('nextTurn').hidden=true;$('play').textContent='▶ Ouvir conversa';$('playStatus').textContent='Pronto para começar';showLines()}
function openLesson(id){stop();current=data.find(d=>d.id===id);if(!current)return;saved.last=id;persist();$('lessonMeta').textContent=`${current.icon} ${current.category} · Diálogo ${String(id).padStart(2,'0')} · ${current.level}`;$('lessonTitle').textContent=current.title;lessonButtons();showLines();dialoguePractice.open(current);if(!$('lesson').open)$('lesson').showModal();$('lesson').scrollTop=0;notice('');audio.src=`audio/${String(current.id).padStart(3,'0')}-1-${$('audioLanguage').value==='pt'?'pt':'de'}.mp3`;audio.preload='metadata'}
function notice(text){$('audioNotice').textContent=text;$('audioNotice').hidden=!text}
function playClip(lang,onend){
 const t=token;
 audio.onended=()=>{if(t===token)onend()};
 audio.onerror=()=>{if(t!==token)return;playing=false;$('play').textContent='↻ Tentar novamente';notice('Não foi possível carregar o áudio. Confira a conexão e tente novamente.');};
 audio.src=`audio/${String(current.id).padStart(3,'0')}-${index+1}-${lang}.mp3`;
 audio.playbackRate=Number($('speed').value);audio.defaultPlaybackRate=Number($('speed').value);
 audio.play().then(()=>{if(t===token){notice('');$('playStatus').textContent=`${lang==='de'?'Alemão':'Português'} · frase ${index+1} de 4`;}}).catch(e=>{if(t!==token||e.name==='AbortError')return;notice('O navegador não iniciou o áudio. Toque no botão ▶ do player abaixo. Se continuar sem som, confira o volume de mídia e abra o app no Safari.');$('playStatus').textContent='Toque em ▶ no player para ouvir.';});
}
function speakLine(t,finished){
 const mode=$('audioLanguage').value;
 const langs=mode==='both'?['de','pt']:[mode];let part=0;
 function next(){if(t!==token)return;if(part>=langs.length){finished();return}playClip(langs[part++],next)}next();
}
function step(t){if(t!==token||!current)return;if(index>=current.lines.length){playing=false;waiting=false;index=-1;$('play').textContent='↻ Ouvir novamente';$('playStatus').textContent='Muito bem! Repita ou marque como praticado.';$('nextTurn').hidden=true;showLines();return}
 const line=current.lines[index];waiting=$('role').value===line.role;showLines();$('nextTurn').hidden=!waiting;$('playStatus').textContent=waiting?`Sua vez: pessoa ${line.role}. Fale e toque em “Já falei”.`:`Ouvindo pessoa ${line.role} · frase ${index+1} de 4`;
 if(waiting)return;speakLine(t,()=>{if(t===token){index++;step(t)}});
}
$('play').onclick=()=>{if(playing){stop();return}stop();playing=true;index=0;$('play').textContent='■ Encerrar conversa';step(token)};
$('stop').onclick=stop;$('nextTurn').onclick=()=>{if(!waiting)return;waiting=false;index++;step(token)};
$('role').onchange=stop;$('speed').onchange=stop;$('audioLanguage').onchange=stop;$('showPt').onchange=showLines;$('showPron').onchange=showLines;
function playSentence(n,lang){stop();index=n;showLines();const t=token;$('playStatus').textContent=`Ouvindo frase ${index+1} de 4`;playClip(lang,()=>{if(t===token){index=-1;showLines();$('playStatus').textContent='Agora repita em voz alta.'}})}
$('lines').onclick=e=>{const b=e.target.closest('[data-sentence]');if(b)playSentence(Number(b.dataset.sentence),b.dataset.lang)};
$('categories').onclick=e=>{const b=e.target.closest('[data-category]');if(b){category=b.dataset.category;draw()}};
$('cards').onclick=e=>{const f=e.target.closest('[data-favorite]'),o=e.target.closest('[data-open]');if(f)favorite(Number(f.dataset.favorite));if(o)openLesson(Number(o.dataset.open))};
$('search').oninput=draw;$('favFilter').onclick=()=>{favoriteOnly=!favoriteOnly;$('favFilter').setAttribute('aria-pressed',favoriteOnly);draw()};$('doneFilter').onclick=()=>{doneOnly=!doneOnly;$('doneFilter').setAttribute('aria-pressed',doneOnly);draw()};
$('favorite').onclick=()=>favorite(current.id);$('markDone').onclick=()=>{const id=current.id;saved.done=saved.done.includes(id)?saved.done.filter(x=>x!==id):[...saved.done,id];persist();draw();lessonButtons()};
$('closeLesson').onclick=()=>$('lesson').close();$('lesson').addEventListener('close',stop);$('lesson').addEventListener('cancel',stop);$('previous').onclick=()=>openLesson(current.id-1);$('next').onclick=()=>openLesson(current.id+1);$('continue').onclick=()=>openLesson(saved.last||1);
$('install').onclick=()=>$('installHelp').showModal();$('closeInstall').onclick=()=>$('installHelp').close();
window.addEventListener('pagehide',stop);
fetch('data.json').then(r=>{if(!r.ok)throw new Error();return r.json()}).then(d=>{data=d;draw()}).catch(()=>{$('cards').textContent='Não foi possível carregar os diálogos. Confira sua conexão e recarregue a página.';$('continue').disabled=true});

let displayedProfile='guest';window.addEventListener('study:dialogues',e=>{const active=window.studyCloud?.userId?window.studyCloud.userId+':'+window.studyCloud.profile:'guest';if(active!==displayedProfile){stop();if($('lesson').open)$('lesson').close();displayedProfile=active}saved=e.detail;draw();if(current&&$('lesson').open)lessonButtons()});
