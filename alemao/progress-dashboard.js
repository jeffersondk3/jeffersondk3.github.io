import './support-language.mjs?v=1';
import {pathProgress} from './daily-path-core.mjs?v=2';
import {estimatePanel} from './level-projection.mjs?v=2';
import {summarize} from './progress-model.mjs?v=43';
const panel=document.getElementById('progressPanel');
let generation=0;
const safeRead=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
async function draw(){
 const token=++generation,api=window.studyCloud,user=api?.userId,profile=api?.profile;
 panel.replaceChildren();
 const title=document.createElement('h1');title.textContent='Meu progresso';panel.append(title);
 const status=document.createElement('p');status.setAttribute('role','status');panel.append(status);
 if(!user||!['jefferson','sofia'].includes(profile)){status.textContent='Modo visitante · as práticas são temporárias e não ficam salvas no perfil.';const b=document.createElement('button');b.className='quiet';b.textContent='Entrar na minha conta';b.onclick=()=>document.getElementById('accountButton').click();panel.append(b);return}
 const chooser=document.createElement('div');chooser.className='progressProfiles';chooser.setAttribute('role','group');chooser.setAttribute('aria-label','Escolher perfil do progresso');
 const label=document.createElement('p');label.textContent='De quem você quer ver o progresso?';panel.append(label);
 for(const [value,name]of [['jefferson','Jefferson'],['sofia','Sofia']]){const button=document.createElement('button');button.type='button';button.className='quiet progressProfile '+value;button.textContent=name;button.setAttribute('aria-pressed',String(profile===value));const select=document.getElementById('studyProfile');button.disabled=!Array.from(select.options).some(o=>o.value===value);button.onclick=()=>{if(api.profile===value)return;select.value=value;select.dispatchEvent(new Event('change',{bubbles:true}));};chooser.append(button)}
 panel.append(chooser);
 status.textContent='Consultando o perfil '+(profile==='sofia'?'Sofia':'Jefferson')+'…';
 const name=profile==='sofia'?'Sofia':'Jefferson';let grammar={},failed=false;
 try{for(let offset=0;;offset+=1000){const {data,error}=await api.client.from('grammar_progress').select('item_key,value').eq('user_id',user).eq('profile',name).order('item_key').range(offset,offset+999);if(error)throw error;for(const row of data||[])if(row.item_key.startsWith('lessons/'))grammar[row.item_key.slice(8)]=row.value;if((data||[]).length<1000)break}}
 catch{failed=true}
 if(token!==generation||api.userId!==user||api.profile!==profile)return;
 const cached=safeRead('deutsch-grammar-cloud-v1-'+user);const entries=failed?cached?.entries:cached?.pending;
 for(const [key,payload] of entries||[]){const [owner,item]=key.split('\n');if(owner===name&&item?.startsWith('lessons/'))grammar[item.slice(8)]=failed?payload:(Object.hasOwn(payload||{},'value')?payload.value:payload)}
 const snapshot=api.progressSnapshot(),records={...snapshot.records,...api.materials()};
 const podcastCache=safeRead('deutsch-podcast-v1-'+user+'-'+profile);
 for(const [id,value]of Object.entries(podcastCache?.pending||{}))records['podcast:'+id]=value;
 const podcastPending=Object.keys(podcastCache?.pending||{}).length;
 const s=summarize(records,grammar),grammarPending=(cached?.pending||[]).filter(([key])=>key.startsWith(name+'\n')).length;
 status.textContent=(podcastPending?'Podcasts com alterações pendentes neste aparelho. ':'')+'Perfil '+name+' · '+document.getElementById('cloudStatus').textContent+(failed?' · Gramática: consulta indisponível; mostrando apenas o que está salvo neste aparelho.':grammarPending?' · Gramática com alterações pendentes neste aparelho.':' · Gramática consultada na nuvem.');
 const routine=document.createElement('section');routine.className='progressRoutine';const heading=document.createElement('h2');heading.textContent='Meu plano de alemão · horas e metas';routine.append(heading);
 const config=records['daily-path:config'],valid=config&&Number.isFinite(config.minutes)&&[6,7].includes(config.days);
 const intro=document.createElement('p');intro.textContent=valid?'Rotina salva de '+name+'. Horas planejadas; não representam horas efetivamente estudadas nem nível alcançado.':'Você ainda não criou uma rotina para '+name+'. Escolha o tempo diário para visualizar as estimativas.';routine.append(intro);
 if(valid){const history=Object.fromEntries(Object.entries(records).filter(([k])=>k.startsWith('daily-path:day:')).map(([k,v])=>[k.slice(15),v])),state=pathProgress(history,records['daily-path:checkpoints']||{}),stage=document.createElement('p');stage.textContent='Percurso A1 → A2 → B1 · '+state.level+' · unidade '+state.unit+'/12 · '+state.sessions+'/3 sessões.'+(state.checkpoint?' Revisão de passagem disponível em Meu plano de alemão.':state.complete?' Trilha introdutória percorrida; continue revisando.':'')+' O nível de estudo não é uma certificação de proficiência.';routine.append(stage);const projection=document.createElement('div');projection.innerHTML=estimatePanel(config.minutes,config.days);routine.append(projection)}
 const adjust=document.createElement('button');adjust.type='button';adjust.className='quiet';adjust.textContent=valid?'Ver ou ajustar minha rotina':'Criar meu plano';adjust.onclick=()=>window.dispatchEvent(new CustomEvent('study:today'));routine.append(adjust);
 if(valid){const agenda=document.createElement('button');agenda.type='button';agenda.className='quiet';agenda.textContent='Adicionar ao Google / Apple Agenda';agenda.onclick=()=>window.dispatchEvent(new CustomEvent('study:calendar'));routine.append(agenda)}
 panel.append(routine);
 const grid=document.createElement('div');grid.className='progressGrid';panel.append(grid);
 for(const [title,value,total,area,detail]of [['Diálogos',s.dialogues,100,'dialogues','Marcados como praticados'],['Gramática',failed&&!cached?'—':s.grammar,36,'grammar','Lições em 100% · '+s.started+' iniciadas'],['Meus materiais',s.materials,12,'materials',s.written+' páginas com escrita salva'],['Podcasts',s.podcasts,130,'podcasts',s.heard+' ouvidos · contador de desafios concluídos']]){const card=document.createElement('article');card.className='progressCard';const h=document.createElement('h2');h.textContent=title;const n=document.createElement('strong');n.textContent=value+' / '+total;const p=document.createElement('p');p.textContent=detail;const b=document.createElement('button');b.className='quiet';b.textContent='Continuar →';b.onclick=()=>window.dispatchEvent(new CustomEvent('study:navigate',{detail:area}));card.append(h,n,p,b);grid.append(card)}
 const refresh=document.createElement('button');refresh.className='quiet';refresh.textContent='Atualizar progresso';refresh.onclick=async()=>{refresh.disabled=true;await api.sync();await draw()};panel.append(refresh);
}
new MutationObserver(()=>{if(!panel.hidden)draw()}).observe(panel,{attributes:true,attributeFilter:['hidden']});
window.addEventListener('study:access',()=>{if(!panel.hidden)draw()});
window.addEventListener('study:progress',()=>{if(!panel.hidden)draw()});

for(const event of ['study:ready','study:materials'])window.addEventListener(event,()=>{if(!panel.hidden)draw()});

