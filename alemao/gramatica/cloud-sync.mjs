import {createClient} from '../vendor/supabase.mjs';
import {createSessionStorage} from '../session-storage.js?v=7';
import {SUPABASE_URL,SUPABASE_KEY} from '../supabase-config.js';
import {createSyncEngine} from './sync-core.mjs?v=15';
export function createGrammarCloud({apply,getData,onAccount=()=>{}}){
 const $=id=>document.getElementById(id),entry=createSessionStorage({local:localStorage,session:sessionStorage});
 const client=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{storage:entry.adapter,persistSession:true,autoRefreshToken:true}});
 let attempt=0,legacy=null,started=false;
 const transport={async load(userId){const rows=[];for(let offset=0;;offset+=1000){const {data,error}=await client.from('grammar_progress').select('profile,item_key,value').eq('user_id',userId).order('profile').order('item_key').range(offset,offset+999);if(error)throw error;rows.push(...data);if(data.length<1000)return rows;}},async save(userId,rows){const {error}=await client.from('grammar_progress').upsert(rows.map(row=>({...row,user_id:userId})),{onConflict:'user_id,profile,item_key'});if(error)throw error;}};
 const engine=createSyncEngine({transport,storage:localStorage,onApply:apply,onUser:user=>{
  $('grammarLogin').hidden=!!user;$('grammarWorkspace').hidden=!user;$('grammarAccountEmail').textContent=user?.email||'';
  if(!user){$('app').replaceChildren();onAccount(null)}else onAccount(user);
 },onStatus:(state,message)=>{for(const id of ['grammarSyncStatus','grammarLoginStatus']){const node=$(id);node.textContent=message;node.dataset.state=state}}});
 async function sessionChanged(session){const version=++attempt;if(!session?.user){engine.logout();return}if(engine.ready&&engine.user?.id===session.user.id)return;
  $('grammarLoginStatus').textContent='Carregando sua conta…';try{const {data,error}=await client.auth.getUser();if(version!==attempt)return;if(error||!data.user)throw error||Error('Sessão inválida');let owner=null;try{owner=localStorage.getItem('deutsch-grammar-legacy-owner-v1')}catch{}const seed=!owner||owner===data.user.id?(legacy||{profiles:{}}):{profiles:{}};await engine.login(data.user,seed);if(version!==attempt||!engine.ready||engine.user?.id!==data.user.id)return;try{localStorage.setItem('deutsch-grammar-legacy-owner-v1',data.user.id)}catch{}legacy=null}catch{if(version===attempt){$('grammarLogin').hidden=false;$('grammarWorkspace').hidden=true;$('grammarLoginStatus').textContent='Não foi possível entrar. Confira a conexão, o e-mail e a senha.';}}
 }
 $('grammarRemember').checked=entry.remember();
 $('grammarLoginForm').onsubmit=async event=>{event.preventDefault();$('grammarLoginSubmit').disabled=true;$('grammarLoginStatus').textContent='Entrando…';try{entry.setRemember($('grammarRemember').checked);const {data,error}=await client.auth.signInWithPassword({email:$('grammarEmail').value.trim(),password:$('grammarPassword').value});if(error)throw error;$('grammarPassword').value='';await sessionChanged(data.session)}catch{$('grammarLoginStatus').textContent='Não foi possível entrar. Confira seu e-mail, senha e conexão.'}finally{$('grammarLoginSubmit').disabled=false}};
 $('grammarLogout').onclick=async()=>{const {error}=await client.auth.signOut({scope:'local'});if(error){$('grammarSyncStatus').textContent='Não foi possível sair. Tente novamente.';return}attempt++;engine.logout()};
 $('grammarSyncNow').onclick=()=>engine.sync();
 async function start(seed){if(started)return;started=true;legacy=seed;client.auth.onAuthStateChange((_event,session)=>{setTimeout(()=>sessionChanged(session),0)});const {data,error}=await client.auth.getSession();if(error){$('grammarLoginStatus').textContent='Confira sua conexão para acessar a conta.';return;}await sessionChanged(data.session);}
 window.addEventListener('online',()=>engine.sync());window.addEventListener('focus',()=>engine.sync());document.addEventListener('visibilitychange',()=>{if(!document.hidden)engine.sync()});setInterval(()=>{if(!document.hidden)engine.sync()},30000);
 return{start,capture:root=>engine.capture(root),sync:()=>engine.sync(),get ready(){return engine.ready},get user(){return engine.user}};
}
