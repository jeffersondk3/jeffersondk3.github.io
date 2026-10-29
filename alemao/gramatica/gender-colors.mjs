const lexicon={
 m:['Antrag','Apfel','Ausflug','Bruder','Bus','Deutschkurs','Eingang','Fehler','Fortschritt','Hunger','Kaffee','Kollege','Kurs','Käse','Mann','Mantel','Monatsbeitrag','Montag','Platz','Raum','Sohn','Termin','Tisch','Zug','Computer','Arzt','Student','Tourist','Präsident','Demonstrant','Vater','Lehrer','Tag','Bahnhof','Supermarkt'],
 f:['Abendkasse','Arbeit','Arztpraxis','Aufgabe','Ausbildung','Bestellung','Bibliothek','Bäckerei','Einladung','Feier','Frau','Freundschaft','Gartenstraße','Hauptverkehrszeit','Jacke','Kollegin','Küche','Lehrerin','Miete','Nacht','Person','Postfiliale','Rezeption','Schulstraße','Schwester','Sonne','Straße','Straßenbahn','Suppe','Tasche','Toilette','Uhr','Universität','Zahnarztpraxis','Übung','Gesundheit','Mutter','Schule','Wohnung'],
 n:['Brot','Buch','Essen','Fahrrad','Geschäft','Handy','Hotel','Kind','Paket','Schwimmbad','Team','Treffen','Wasser','Wetter','Ziel','Zimmer','Fahrzeug','Thema','Fräulein','Dokument','Ergebnis','Studium','Haus','Auto','Mädchen'],
 plural:['Bücher','Freunde','Leute','Nachbarn','Personen','Schuhe','Teilnehmenden','Übungen','Schwierigkeiten','Kinder','Frauen','Männer','Häuser','Autos','Tage','Wörter','Fragen','Antworten','Kollegen','Termine','Zimmern']
};
const genders=new Map(Object.entries(lexicon).flatMap(([gender,words])=>words.map(word=>[word,gender])));
const names={m:'masculino',f:'feminino',n:'neutro',plural:'plural'};
export function articleGender(article,nextWord='',standalone=false){const a=article.toLowerCase();if(!['der','die','das'].includes(a))return null;if(a==='die'&&['Fehler','Zimmer','Lehrer','Computer','Mädchen','Fenster'].includes(nextWord))return 'plural';if(genders.has(nextWord))return genders.get(nextWord);if(nextWord)return null;return standalone?({der:'m',die:'f',das:'n'}[a]):null}
export function colorGrammar(root){
 const doc=root.ownerDocument||document,walker=doc.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];let node;
 while((node=walker.nextNode())){if(!node.parentElement?.closest('script,style,textarea,input,select,[data-gender],[contenteditable=true]')&&/\b(?:der|die|das)\b/iu.test(node.data))nodes.push(node)}
 for(const textNode of nodes){const value=textNode.data,fragment=doc.createDocumentFragment();let end=0,changed=false;
  for(const match of value.matchAll(/\b(der|die|das)\b/giu)){const article=match[0],tail=value.slice(match.index+article.length),following=tail.match(/^\s+([\p{L}]+(?:[-’'][\p{L}]+)*)/u)?.[1];
   const wordButton=textNode.parentElement.closest('[data-lookup]');const nextButton=wordButton?.nextElementSibling;const next=following||(nextButton?.matches('[data-lookup]')?nextButton.textContent.trim():'');
   const standalone=value.trim().toLowerCase()===article.toLowerCase()||!tail.trim()||/^[\s,;/·—–()]+(?:der|die|das)?[\s,;/·—–()]*$/iu.test(tail);
   const gender=articleGender(article,next,standalone);if(!gender)continue;
   fragment.append(doc.createTextNode(value.slice(end,match.index)));const span=doc.createElement('span');span.className='gender-token gender-'+gender;span.dataset.gender=gender;span.title=names[gender];span.setAttribute('aria-label',article+' · '+names[gender]);span.textContent=article;fragment.append(span);end=match.index+article.length;changed=true;
  }
  if(changed){fragment.append(doc.createTextNode(value.slice(end)));textNode.replaceWith(fragment)}
 }
}
export function installGenderColors(root){let queued=false;const paint=()=>{queued=false;for(const field of root.querySelectorAll('textarea[lang="de"]')){let preview=field.nextElementSibling;if(!preview?.hasAttribute('data-writing-preview')){preview=document.createElement('div');preview.setAttribute('data-writing-preview','');preview.className='gender-writing-preview';preview.lang='de';field.after(preview)}if(preview.dataset.text!==field.value){preview.dataset.text=field.value;preview.textContent=field.value;preview.hidden=!field.value.trim();}}colorGrammar(root)};root.addEventListener('input',event=>{if(event.target.matches('textarea[lang="de"]'))paint()});const observer=new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(paint)}});observer.observe(root,{childList:true,subtree:true});paint();return()=>observer.disconnect()}
