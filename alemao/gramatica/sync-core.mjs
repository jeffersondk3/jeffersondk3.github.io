export const PROFILES=['Jefferson','Sofia'];
const copy=x=>JSON.parse(JSON.stringify(x));
const safe=k=>!['__proto__','prototype','constructor'].includes(k);
export const stable=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
export function flatten(root){
 const result=new Map();
 for(const profile of PROFILES){const data=root?.profiles?.[profile]||{};
  const add=(key,value)=>result.set(profile+'\n'+key,copy(value));
  for(const group of ['lessons','cards','errorEvents'])for(const [key,value]of Object.entries(data[group]||{}))if(safe(key)&&value!==undefined&&(!(value&&typeof value==='object')||Object.keys(value).length))add(group+'/'+key,value);
  for(const [level,sections]of Object.entries(data.exams||{}))for(const [section,value]of Object.entries(sections||{}))if(safe(level)&&safe(section)&&Object.keys(value||{}).length)add('exams/'+level+'/'+section,value);
  for(const day of data.days||[])add('days/'+day,true);
  add('meta',Object.fromEntries(Object.entries(data).filter(([k])=>safe(k)&&!['lessons','exams','cards','errorEvents','days'].includes(k))));
 }
 return result;
}
export function inflate(entries,selected='Jefferson'){
 const root={selected:PROFILES.includes(selected)?selected:'Jefferson',profiles:{}};
 for(const name of PROFILES)root.profiles[name]={lessons:{},exams:{},cards:{},errorEvents:{},days:[]};
 for(const [id,value]of entries){if(value===null)continue;const at=id.indexOf('\n'),profile=id.slice(0,at),key=id.slice(at+1),data=root.profiles[profile];if(!data)continue;
  if(key==='meta'){for(const [k,v]of Object.entries(value||{}))if(safe(k)&&!['lessons','exams','cards','errorEvents','days'].includes(k))data[k]=copy(v);continue;}
  const slash=key.indexOf('/'),group=key.slice(0,slash),item=key.slice(slash+1);if(!safe(item))continue;
  if(group==='days'){if(/^\d{4}-\d{2}-\d{2}$/.test(item)&&value)data.days.push(item)}
  else if(group==='exams'){const s=item.indexOf('/'),l=item.slice(0,s),k=item.slice(s+1);if(s>0&&safe(l)&&safe(k)){data.exams[l]??={};data.exams[l][k]=copy(value)}}
  else if(['lessons','cards','errorEvents'].includes(group))data[group][item]=copy(value);
 }
 for(const p of Object.values(root.profiles))p.days.sort();return root;
}
export function createSyncEngine({transport,storage,onApply=()=>{},onStatus=()=>{},onUser=()=>{},revision=()=>crypto.randomUUID(),now=()=>Date.now()}){
 let user=null,ready=false,epoch=0,current=new Map(),pending=new Map(),selected='Jefferson',busy=null,timer;
 const cacheKey=()=>user?'deutsch-grammar-cloud-v1-'+user.id:'';
 function cache(){if(!user)return;try{storage.setItem(cacheKey(),JSON.stringify({entries:[...current],pending:[...pending],selected}))}catch{onStatus('warning','Sem espaço local. Mantenha a conexão até confirmar a sincronização.')}}
 function schedule(){clearTimeout(timer);timer=setTimeout(()=>sync(),700)}
 function capture(root){if(!ready||!user)return;selected=PROFILES.includes(root.selected)?root.selected:selected;const next=flatten(root);
  for(const [id,value]of next)if(stable(current.get(id))!==stable(value)){pending.set(id,{value,revision:revision()});current.set(id,value)}
  for(const id of [...current.keys()])if(!next.has(id)&&current.get(id)!==null){current.set(id,null);pending.set(id,{value:null,revision:revision()})}
  cache();if(pending.size){onStatus('saving','Salvo neste aparelho · sincronizando…');schedule()}
 }
 async function sync(){if(!ready||!user)return;if(busy)return busy;clearTimeout(timer);const version=epoch,who=user.id;
  const work=(async()=>{try{
   onStatus('saving','Sincronizando…');const batch=[...pending];
   for(let i=0;i<batch.length;i+=100){const slice=batch.slice(i,i+100);await transport.save(who,slice.map(([id,p])=>{const at=id.indexOf('\n');return{profile:id.slice(0,at),item_key:id.slice(at+1),value:p.value,updated_at:new Date(now()).toISOString()}}));if(version!==epoch)return;for(const [id,p]of slice)if(pending.get(id)?.revision===p.revision)pending.delete(id)}
   const rows=await transport.load(who);if(version!==epoch)return;const merged=new Map(rows.map(r=>[r.profile+'\n'+r.item_key,r.value]));for(const [id,p]of pending)merged.set(id,p.value);
   const changed=stable([...merged].sort())!==stable([...current].sort());current=merged;cache();if(changed)onApply(inflate(current,selected));onStatus(pending.size?'saving':'synced',pending.size?'Há alterações para sincronizar.':'✓ Progresso sincronizado · disponível nos seus dispositivos.');
  }catch(error){if(version===epoch){cache();onStatus('offline','Sem conexão agora · estudo salvo neste aparelho e aguardando sincronização.')}}finally{if(version===epoch){busy=null;if(pending.size)timer=setTimeout(()=>sync(),15000)}}})();busy=work;return work;
 }
 async function login(nextUser,legacy={profiles:{}}){if(user?.id===nextUser.id&&ready)return;const version=++epoch;clearTimeout(timer);user=nextUser;ready=false;busy=null;current=new Map();pending=new Map();selected=PROFILES.includes(legacy?.selected)?legacy.selected:'Jefferson';let cached=false;
  try{const c=JSON.parse(storage.getItem(cacheKey())||'null');if(c){current=new Map(c.entries||[]);pending=new Map(c.pending||[]);selected=c.selected||selected;cached=true}}catch{}
  let remote;try{remote=await transport.load(user.id)}catch(error){if(version!==epoch)return;if(!cached){user=null;onStatus('error','Não foi possível carregar sua conta. Confira a conexão e tente novamente.');throw error}ready=true;onApply(inflate(current,selected));onUser(nextUser);onStatus('offline','Sem conexão agora · exibindo o estudo salvo neste aparelho.');schedule();return;}
  if(version!==epoch)return;
  const merged=new Map(remote.map(r=>[r.profile+'\n'+r.item_key,r.value]));
  // One-time, non-destructive migration: existing server records always win.
  for(const [id,value]of [...current,...(!cached?flatten(legacy):[])])if(!merged.has(id)){merged.set(id,value);if(!pending.has(id))pending.set(id,{value,revision:revision()})}
  for(const [id,p]of pending)merged.set(id,p.value);current=merged;ready=true;cache();onApply(inflate(current,selected));onUser(nextUser);await sync();
 }
 function logout(){cache();epoch++;clearTimeout(timer);ready=false;user=null;busy=null;current=new Map();pending=new Map();onUser(null)}
 return{login,logout,capture,sync,get ready(){return ready},get user(){return user},get pendingCount(){return pending.size}};
}
