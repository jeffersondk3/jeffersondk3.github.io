export function createPhrasePlayer({audio,status,voice,speed,fetcher=fetch}){
 let manifest=null,request=null,version=0,timer,clip=null,remaining=0,ending=false;
 const load=()=>request??=(async()=>{try{const r=await fetcher('project90-audio/manifest.json?v=1');if(!r.ok)throw Error();const d=await r.json();if(Object.keys(d.clips||{}).length!==500)throw Error();return manifest=d}catch(e){request=null;throw e}})();
 function stop(){version++;clearTimeout(timer);audio.pause();audio.onended=null;audio.ontimeupdate=null;clip=null;remaining=0}
 async function play(id,repeats=1){stop();const token=version;status('Carregando áudio da frase…');try{const m=manifest||await load();if(token!==version)return;clip=m.clips[String(id)]?.[voice()];if(!clip)throw Error();remaining=repeats;audio.playbackRate=Number(speed())||.9;
 const start=()=>{if(token!==version||!clip)return;ending=false;audio.currentTime=clip.start;audio.play().then(()=>{if(token===version)status('Ouvindo a frase em alemão · '+(voice()==='female'?'voz feminina':'voz masculina')+(repeats>1?' · acompanhe a fala e repita':'') )}).catch(()=>{if(token===version)status('Toque em ▶ no player para iniciar o áudio. Confira também o volume do aparelho.')})};
 const finish=()=>{if(token!==version||!clip||ending)return;ending=true;audio.pause();if(--remaining>0)timer=setTimeout(start,1000);else{status('Áudio concluído. Repita em voz alta ou ouça novamente.');remaining=0}};
 audio.ontimeupdate=()=>{if(clip&&remaining>0&&audio.currentTime>=clip.end-.04)finish()};audio.onended=finish;audio.onplay=()=>{if(clip&&(audio.currentTime<clip.start||audio.currentTime>=clip.end)){remaining=Math.max(1,remaining);audio.currentTime=clip.start}};audio.onseeking=()=>{if(clip&&(audio.currentTime<clip.start-.1||audio.currentTime>clip.end+.1))audio.currentTime=clip.start};audio.onerror=()=>{if(token===version)status('Não foi possível carregar o arquivo. Confira sua conexão e toque em ouvir novamente.')};
 const url=new URL(clip.file,location.href).href;if(audio.src!==url){audio.onloadedmetadata=start;audio.src=url;audio.load()}else start();
 }catch{if(token===version)status('Áudio indisponível agora. Confira a conexão e tente novamente. As frases e os exercícios continuam disponíveis.')}}
 load().catch(()=>{});return {play,stop};
}
