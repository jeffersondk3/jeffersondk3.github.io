export const PHASES=['Situação','Descoberta','Gramática','Escuta','Sua escrita'];
export function conversationPrompt(lesson,phase,{profile='Jefferson',language='pt'}={}){
 const support=language==='en'?'Use English only when I ask for explanations.':language==='off'?'Use only German. If I struggle, simplify the German instead of translating.':'Explique em português somente quando eu pedir ou precisar de ajuda.';
 const content=[`Sou ${profile}. Quero praticar alemão ${lesson.level}, em uma conversa curta de cerca de 5 minutos.`,`Acabei de concluir a fase ${phase+1}, ${PHASES[phase]}, da lição ${lesson.title}.`,`Situação: ${lesson.scene}. Objetivo: ${lesson.goal}.`,`Fale devagar, com frases adequadas ao meu nível e um tom gentil. Faça uma pergunta por vez e espere minha resposta. ${support}`,'Treine somente o conteúdo de referência desta fase, sem introduzir gramática ou vocabulário de fases seguintes. Faça uma pequena simulação da situação da lição. Corrija meus erros com delicadeza, mostre a frase correta e peça que eu a repita. Ao final, indique duas coisas que fiz bem e uma para revisar. Não atribua certificado nem altere o progresso do meu app.'];
 if(phase===0||phase===3)content.push('Frases de referência:\n'+lesson.story.map(l=>l.de).join('\n'));
 else if(phase===1||phase===2)content.push('Foco da lição: '+lesson.rule+'\nVocabulário: '+lesson.vocab.map(v=>v.de).join('; '));
 else content.push('Tarefa para praticar oralmente: '+lesson.task);
 content.push('Vou ativar o modo de voz, se disponível. Comece cumprimentando-me em alemão e fazendo a primeira pergunta.');
 return content.join('\n\n');
}
export function conversationPanel({lesson,phase,unlocked,profile,language,escape}){
 const e=escape;
 if(!unlocked)return '<section class="panel ai-conversation"><h2>Conversar com o ChatGPT</h2><p>Conclua esta fase com as respostas e a escrita exigidas para liberar o roteiro de conversação.</p><button disabled>🔒 Praticar com o ChatGPT</button></section>';
 const prompt=conversationPrompt(lesson,phase,{profile,language});
 return `<section class="panel ai-conversation"><span class="badge">Fase concluída · ${e(profile)}</span><h2>Praticar com o ChatGPT</h2><p>Treine o conteúdo desta fase em uma conversa. Copie o roteiro abaixo e cole em uma nova conversa no ChatGPT.</p><label for="ai-conversation-prompt">Roteiro de ${e(profile)} · ${e(PHASES[phase])}</label><textarea id="ai-conversation-prompt" readonly rows="7" style="width:100%;box-sizing:border-box">${e(prompt)}</textarea><div class="row"><button class="primary" data-copy-ai>1 · Copiar roteiro</button><a class="button" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">2 · Abrir ChatGPT ↗</a></div><p class="status" id="ai-copy-status" role="status"></p><p class="muted">Use a sua conta ou a da Sofia no próprio ChatGPT. O perfil de estudo não troca essa conta. Depois de colar o roteiro, inicie a voz e ative a câmera se essa opção estiver disponível. A chamada acontece no ChatGPT; o resultado não é enviado automaticamente para este app.</p></section>`;
}
export async function copyConversation(document,navigator){
 const field=document.getElementById('ai-conversation-prompt'),status=document.getElementById('ai-copy-status');if(!field||!status)return;
 try{await navigator.clipboard.writeText(field.value);status.textContent='Roteiro copiado. Abra o ChatGPT e cole em uma nova conversa.';}
 catch{field.focus();field.select();field.setSelectionRange(0,field.value.length);status.textContent='Selecione Copiar no menu do aparelho. Depois abra o ChatGPT e cole o roteiro.';}
}
