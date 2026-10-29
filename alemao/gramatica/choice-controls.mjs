export function enhanceChoices(select,choices){
 const group=document.createElement('div');group.className='choiceCards';group.setAttribute('role','group');group.setAttribute('aria-labelledby',select.getAttribute('aria-labelledby'));
 const buttons=choices.map(choice=>{const button=document.createElement('button');button.type='button';button.className='choiceCard';button.dataset.choice=choice.value;const icon=document.createElement('span');icon.className='choiceIcon';icon.setAttribute('aria-hidden','true');icon.textContent=choice.icon;const text=document.createElement('span');const title=document.createElement('strong');title.textContent=choice.title;const subtitle=document.createElement('small');subtitle.textContent=choice.subtitle;text.append(title,subtitle);const check=document.createElement('span');check.className='choiceCheck';check.setAttribute('aria-hidden','true');check.textContent='✓';button.append(icon,text,check);button.addEventListener('click',()=>{if(select.value===choice.value)return;select.value=choice.value;select.dispatchEvent(new Event('change',{bubbles:true}));sync()});group.append(button);return button});
 function sync(){for(const button of buttons)button.setAttribute('aria-pressed',String(select.value===button.dataset.choice));}
 select.after(group);select.parentElement.classList.add('enhanced-choice');select.addEventListener('change',sync);sync();return sync;
}
export function installStudyChoices(){
 const profile=enhanceChoices(document.getElementById('profile'),[{value:'Jefferson',icon:'J',title:'Jefferson',subtitle:'Meu progresso'},{value:'Sofia',icon:'S',title:'Sofia',subtitle:'Meu progresso'}]);
 const voice=enhanceChoices(document.getElementById('voiceChoice'),[{value:'male',icon:'♪',title:'Masculina',subtitle:'Voz original'},{value:'female',icon:'♫',title:'Feminina',subtitle:'Suave e tranquila'}]);
 return ()=>{profile();voice()};
}
