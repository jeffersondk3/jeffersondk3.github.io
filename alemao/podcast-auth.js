import {createClient} from './vendor/supabase.mjs';
import {createSessionStorage} from './session-storage.js?v=7';
import {SUPABASE_URL,SUPABASE_KEY} from './supabase-config.js';
const $=id=>document.getElementById(id),entry=createSessionStorage({local:localStorage,session:sessionStorage});
const client=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{storage:entry.adapter,persistSession:true,autoRefreshToken:true}});
let attempt=0,owner=null;
window.podcastAccess={allowed:false};
function access(user){const previous=owner;owner=user?.id||null;window.podcastAccess={allowed:!!user,userId:owner};$('podcastLogin').hidden=!!user;$('podcastWorkspace').hidden=!user;$('podcastAccount').hidden=!user;$('podcastAccountEmail').textContent=user?.email||'';if(previous!==owner||!user)window.dispatchEvent(new CustomEvent('podcast:access',{detail:{allowed:!!user,userId:owner}}));}
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
