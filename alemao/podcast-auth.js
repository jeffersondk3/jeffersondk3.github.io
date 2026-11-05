import {createClient} from './vendor/supabase.mjs';
import {createSessionStorage} from './session-storage.js?v=7';
import {SUPABASE_URL,SUPABASE_KEY} from './supabase-config.js';
const $=id=>document.getElementById(id),entry=createSessionStorage({local:localStorage,session:sessionStorage});
const client=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{storage:entry.adapter,persistSession:true,autoRefreshToken:true}});
let attempt=0,owner=null;
window.podcastAccess={allowed:false};

let profile='jefferson',records={},pending={},generation=0,saveTimer;
const clone=x=>JSON.parse(JSON.stringify(x));
const cacheKey=()=> 'deutsch-podcast-v1-'+owner+'-'+profile;
function persist(){try{localStorage.setItem(cacheKey(),JSON.stringify({records,pending}));return true}catch{$('podcastSaveStatus').textContent='Não foi possível salvar neste aparelho. Mantenha esta página aberta e sincronize.';return false}}
function notify(){window.dispatchEvent(new Event('podcast:progress'))}
function loadProfile(){generation++;records={};pending={};try{const saved=JSON.parse(localStorage.getItem(cacheKey())||'{}');records=saved.records||{};pending=saved.pending||{}}catch{}$('podcastProfile').value=profile;window.podcastAccess.profile=profile;window.dispatchEvent(new Event('podcast:profile'));notify();syncProgress()}
let syncing=false;
async function syncProgress(){if(syncing){clearTimeout(saveTimer);saveTimer=setTimeout(syncProgress,1000);return}syncing=true;try{await runSync()}finally{syncing=false}}
async function runSync(){
 if(!owner)return;const who=owner,p=profile,g=generation;let failed=false;
 try{
 for(const [id,value] of Object.entries({...pending})){
 const {error}=await client.from('study_progress').upsert({user_id:who,scope:p+'_materials',item_id:'podcast:'+id,value,updated_at:new Date().toISOString()});
 if(g!==generation)return;if(error)throw error;if(JSON.stringify(pending[id])===JSON.stringify(value))delete pending[id];persist();
 }
 const {data,error}=await client.from('study_progress').select('item_id,value').eq('user_id',who).eq('scope',p+'_materials').like('item_id','podcast:%');
 if(g!==generation)return;if(error)throw error;
 for(const row of data||[]){const id=row.item_id.slice(8);if(!pending[id])records[id]=row.value}
 persist();notify();$('podcastSaveStatus').textContent=Object.keys(pending).length?'Salvo neste aparelho · aguardando sincronização':'✓ Podcasts sincronizados · '+(p==='sofia'?'Sofia':'Jefferson');
 window.dispatchEvent(new Event('podcast:restored'));
 }catch{if(g!==generation)return;failed=true;$('podcastSaveStatus').textContent='Sem sincronização agora. Os registros salvos neste aparelho serão enviados quando a conexão voltar.'}
 if(g===generation&&(failed||Object.keys(pending).length)){clearTimeout(saveTimer);saveTimer=setTimeout(syncProgress,15000)}
}
window.podcastProgress={get profile(){return profile},get(id){return clone(records[id]||{})},save(id,value){if(!owner)return;records[id]={...records[id],...clone(value)};pending[id]=clone(records[id]);if(persist())$('podcastSaveStatus').textContent='Salvo neste aparelho · aguardando sincronização';notify();clearTimeout(saveTimer);saveTimer=setTimeout(syncProgress,500)}};
$('podcastProfile').onchange=()=>{if(!owner)return;persist();profile=$('podcastProfile').value==='sofia'?'sofia':'jefferson';try{localStorage.setItem('deutsch-profile-'+owner,profile)}catch{}loadProfile()};
$('podcastSync').onclick=syncProgress;
window.addEventListener('online',syncProgress);

function access(user){const previous=owner;owner=user?.id||null;window.podcastAccess={allowed:!!user,userId:owner};$('podcastLogin').hidden=!!user;$('podcastWorkspace').hidden=!user;$('podcastAccount').hidden=!user;$('podcastAccountEmail').textContent=user?.email||'';if(previous!==owner){generation++;clearTimeout(saveTimer);if(owner){try{profile=localStorage.getItem('deutsch-profile-'+owner)==='sofia'?'sofia':'jefferson'}catch{profile='jefferson'}loadProfile()}else{records={};pending={}}}if(previous!==owner||!user)window.dispatchEvent(new CustomEvent('podcast:access',{detail:{allowed:!!user,userId:owner}}));}
async function verify(session){const version=++attempt;if(!session?.user){access(null);$('podcastLoginStatus').textContent='Entre com o mesmo e-mail e a mesma senha do seu app de alemão.';return;}
 $('podcastLoginStatus').textContent='Verificando acesso…';
 try{const {data,error}=await client.auth.getUser();if(version!==attempt)return;if(error||!data.user)throw Error();const member=await client.from('course_members').select('approved').eq('user_id',data.user.id).maybeSingle();if(version!==attempt)return;if(member.error||member.data?.approved!==true)throw Error();access(data.user);$('podcastLoginStatus').textContent='';}
 catch{if(version===attempt){access(null);$('podcastLoginStatus').textContent='Não foi possível liberar o acesso. Confira sua conta, senha e conexão.';}}
}
$('podcastRemember').checked=entry.remember();
$('podcastLoginForm').onsubmit=async event=>{event.preventDefault();$('podcastLoginSubmit').disabled=true;$('podcastLoginStatus').textContent='Entrando…';try{entry.setRemember($('podcastRemember').checked);const {data,error}=await client.auth.signInWithPassword({email:$('podcastEmail').value.trim(),password:$('podcastPassword').value});$('podcastPassword').value='';if(error)throw error;await verify(data.session)}catch{access(null);$('podcastPassword').value='';$('podcastLoginStatus').textContent='Não foi possível entrar. Confira seu e-mail, senha e conexão.';}finally{$('podcastLoginSubmit').disabled=false}};
$('podcastLogout').onclick=async()=>{attempt++;access(null);const {error}=await client.auth.signOut({scope:'local'});$('podcastLoginStatus').textContent=error?'A tela foi bloqueada, mas não foi possível encerrar a sessão. Confira sua conexão e tente sair novamente.':'Você saiu. Entre novamente para acessar os podcasts.';};
client.auth.onAuthStateChange((_event,session)=>{setTimeout(()=>verify(session),0)});
async function restore(){try{const {data,error}=await client.auth.getSession();if(error)throw error;await verify(data.session)}catch{access(null);$('podcastLoginStatus').textContent='Confira sua conexão para acessar os podcasts.'}}
window.addEventListener('focus',restore);restore();
