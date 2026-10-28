// Usa o armazenamento persistente apenas quando a pessoa escolhe lembrar a entrada.
export function createSessionStorage({local,session,preferenceKey='deutsch-remember-entry'}){
 const known=new Set(),fallback=new Map();
 const remember=()=>{try{return local.getItem(preferenceKey)!=='false'}catch{return false}};
 const selected=()=>remember()?local:session;
 const adapter={getItem(key){known.add(key);try{return selected().getItem(key)}catch{return fallback.get(key)??null}},setItem(key,value){known.add(key);try{selected().setItem(key,value);(remember()?session:local).removeItem(key)}catch{fallback.set(key,value)}},removeItem(key){known.add(key);fallback.delete(key);for(const store of[local,session])try{store.removeItem(key)}catch{}}};
 function setRemember(value){const old=selected(),next=value?local:session;for(const key of known){const stored=old.getItem(key);if(stored!==null){next.setItem(key,stored);if(old!==next)old.removeItem(key)}}local.setItem(preferenceKey,String(!!value));}
 return{adapter,remember,setRemember};
}
