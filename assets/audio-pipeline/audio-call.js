(() => {
  'use strict';
  const agendaItems=[
    {id:'T01',title:'Confermare se FMOD è lo standard di produzione',summary:'Quale valore concreto ci serve rispetto all’audio nativo Unreal e quali sistemi restano nel gioco?'},
    {id:'T02',title:'Assegnare la responsabilità FMOD',summary:'Chi mantiene il progetto ufficiale nel repository audio da scegliere e trasforma gli audio approvati in eventi, parametri, mix e bank?'},
    {id:'T03',title:'Assegnare la responsabilità Unreal',summary:'La stessa persona copre anche Unreal oppure chi inserisce le bank e collega gli stati del gioco?'},
    {id:'T04',title:'Definire il supporto tecnico di programmazione',summary:'Quando serve Antonio per segnali di gioco, Blueprint, codice, prestazioni o build?'},
    {id:'T05',title:'Verificare capacità e disponibilità reali',summary:'Nessuna stima settimanale è confermata: chiedere tempo, tempi di risposta e limiti.'},
    {id:'T06',title:'Assegnare l’ultimo accesso Perforce',summary:'Solo a chi deve davvero intervenire nel progetto Unreal. Candidati attuali: Roberto, Lorenzo, Antonio.'},
    {id:'T07',title:'Scegliere il repository del progetto FMOD',summary:'SVN proposto per la prova; Git con LFS come alternativa. Concordare accessi, conflitti, backup, recupero e formazione prima dell’adozione.'},
    {id:'T08',title:'Definire il passaggio Hub → FMOD → Unreal',summary:'LOOKDEV dei WAV, build delle bank, versione consegnata, reload e gestione delle correzioni.'},
    {id:'T09',title:'Definire il gate tecnico della pipeline',summary:'Quali verifiche in editor, Play e build PC rendono una consegna realmente integrata?'},
    {id:'T10',title:'Pianificare il percorso console',summary:'PC prima; quando e con quali criteri si aprono configurazione e test console?'},
    {id:'A01',title:'Definire il ruolo musicale nella Demo L2.5',summary:'Il percorso è S11–S15; il primo combattimento con tutorial avviene subito dopo il primo cippo, prima dell’avvistamento della Borda.'},
    {id:'A02',title:'Confermare dove servono registrazioni specifiche per la corsa',summary:'Usarle solo se il materiale cambia davvero; decisione da prendere con il team audio.'},
    {id:'A03',title:'Validare la Sparse Adaptive Ambience dell’esplorazione',summary:'Confermare struttura degli eventi, parametri, strumenti FMOD, limiti di sovrapposizione e perimetro del primo prototipo.'}
  ];
  const audioOwners=[
    {name:'Alex Sipahioglu',role:'Sound FX'},
    {name:'Filippo Pellizzon',role:'Sound FX / Composer'},
    {name:'Luca Gentilforti',role:'Composer'},
    {name:'Marco Amarelli',role:'Sound FX / Composer'},
    {name:'Marco Martini',role:'Sound Designer / Composer'}
  ];
  const integratorOwners=[
    {name:'Antonio Coppola',role:'Programmer · Perforce Integrator'},
    {name:'Giacomo Gaiotto',role:'Tech Artist · Perforce Integrator'},
    {name:'Lorenzo Bove',role:'Founder · Perforce Integrator'},
    {name:'Roberto Tolomei',role:'Founder · Perforce Integrator'}
  ];
  const STORAGE='wtfd.audio.call.v2';
  const defaults={version:2,updated:'',parking:'',answers:{}};
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  let data=load(),generatedReport='';
  function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function ownerOptions(selected=''){
    const known=[...audioOwners,...integratorOwners];
    const saved=selected&&!known.some(person=>person.name===selected)
      ? `<optgroup label="Valore già salvato"><option value="${esc(selected)}" selected>${esc(selected)}</option></optgroup>`
      : '';
    const group=(label,people)=>`<optgroup label="${label}">${people.map(person=>`<option value="${esc(person.name)}" ${person.name===selected?'selected':''}>${esc(person.name)} — ${esc(person.role)}</option>`).join('')}</optgroup>`;
    return `<option value="" ${selected?'':'selected'}>Da concordare</option>${saved}${group('Composer e sound designer attivi',audioOwners)}${group('Perforce Integrator attuali',integratorOwners)}`;
  }
  function record(id){return data.answers[id]||{status:'Da discutere',decision:'',owner:'',notes:''};}
  function normalizeData(value){const normalized={...defaults,...value,answers:{...(value?.answers||{})}};Object.values(normalized.answers).forEach(answer=>{if(answer?.status==='Azione assegnata')answer.status='Decisione presa'});return normalized}
  function load(){try{const raw=localStorage.getItem(STORAGE);return raw?normalizeData(JSON.parse(raw)):{...defaults,answers:{}}}catch(e){return {...defaults,answers:{}}}}
  function resetGeneratedReport(){generatedReport='';const generate=$('#ac-generate-report');if(!generate)return;generate.querySelector('span').textContent='Genera report';$('#ac-report-state').hidden=false;$('#ac-report-text').hidden=true;$('#ac-report-text').textContent='';$('#ac-download-report').hidden=true;$('#ac-print-report').hidden=true}
  function save(){try{data.updated=new Date().toISOString();localStorage.setItem(STORAGE,JSON.stringify(data));$('#ac-save-state').textContent='Salvato alle '+new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});$('#ac-save-state').classList.remove('error');updateProgress();resetGeneratedReport()}catch(e){$('#ac-save-state').textContent='Salvataggio non disponibile: esporta i dati';$('#ac-save-state').classList.add('error')}}
  function toast(message,isError=false){const t=$('#ac-toast');t.textContent=message;t.classList.toggle('error',isError);t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2600)}
  function icon(id,cls='ac-icon'){return `<svg class="${cls}"><use href="#${id}"/></svg>`}
  function showView(id,instant=false){$$('.ac-view').forEach(v=>{v.hidden=v.id!==id;v.classList.remove('enter')});const current=$('#'+id);current.hidden=false;if(!instant)requestAnimationFrame(()=>current.classList.add('enter'));$$('.ac-nav button').forEach(b=>b.setAttribute('aria-current',b.dataset.acView===id?'page':'false'));if(innerWidth<=780)closeMobileNav();window.scrollTo({top:0,behavior:instant?'auto':'smooth'})}
  function closeMobileNav(){const rail=$('#ac-rail');rail.style.display='';rail.style.position='';rail.style.inset='';rail.style.width='';rail.style.height='';$('#ac-menu-button').setAttribute('aria-expanded','false')}
  function renderAgenda(){const host=$('#ac-agenda');host.innerHTML=agendaItems.map(item=>{const r=record(item.id);return `<article class="ac-agenda-item" data-id="${item.id}"><button class="ac-agenda-head" aria-expanded="false"><span class="ac-agenda-code">${item.id}</span><span class="ac-agenda-title"><strong>${esc(item.title)}</strong><span>${esc(item.summary)}</span></span><span class="ac-status">${esc(r.status)}</span>${icon('ac-i-chevron','ac-icon ac-chev')}</button><div class="ac-agenda-body"><div class="ac-form-grid"><label class="ac-field"><span>Esito</span><select data-field="status"><option>Da discutere</option><option>Decisione presa</option><option>Rinviato</option><option>Non applicabile</option></select></label><label class="ac-field"><span>Responsabile</span><small class="ac-field-help">Profili audio e Perforce Integrator attivi nell’Hub.</small><select data-field="owner">${ownerOptions(r.owner)}</select></label><label class="ac-field full"><span>Decisione in una riga</span><textarea data-field="decision" placeholder="Che cosa è stato deciso, senza interpretazioni">${esc(r.decision)}</textarea></label><label class="ac-field full"><span>Nota o prova richiesta</span><input data-field="notes" value="${esc(r.notes)}" placeholder="Informazione da recuperare"></label></div></div></article>`}).join('');
    agendaItems.forEach(item=>{const article=host.querySelector(`[data-id="${item.id}"]`),r=record(item.id);article.querySelector('select').value=r.status;article.querySelector('.ac-agenda-head').onclick=()=>{article.classList.toggle('open');article.querySelector('.ac-agenda-head').setAttribute('aria-expanded',article.classList.contains('open'))};article.querySelector('.ac-agenda-body').oninput=e=>{const field=e.target.dataset.field;if(!field)return;data.answers[item.id]={...record(item.id),[field]:e.target.value};article.querySelector('.ac-status').textContent=record(item.id).status;save()}});updateProgress();
  }
  function updateProgress(){const done=agendaItems.filter(i=>['Decisione presa','Non applicabile'].includes(record(i.id).status)).length,total=agendaItems.length,percent=total?done/total*100:0;$('#ac-done-count').textContent=done;$('#ac-total-count').textContent=total;$('#ac-call-progress').value=percent;$('#ac-side-progress').value=percent;$('#ac-side-count').textContent=`${done} di ${total} decisioni della call chiuse`}
  function makeReport(){
    const closed=agendaItems.filter(i=>record(i.id).status!=='Da discutere');
    const open=agendaItems.filter(i=>record(i.id).status==='Da discutere');
    const out=[
      'WHERE THE FOG DIES — REPORT CALL AUDIO',
      'Generato: '+new Date().toLocaleString('it-IT'),
      '',
      'DIREZIONE ATTUALE PRIMA DELLA CALL',
      '• Esplorazione guidata dal paesaggio sonoro: vento, acqua, fauna, scricchiolii e presenze lontane restano in primo piano.',
      '• La musica accompagna tutta l’avventura senza essere continua: archi isolati, droni, note sostenute e frammenti brevi emergono, scompaiono e condividono un linguaggio tematico coerente. Il silenzio musicale è parte della composizione.',
      '• Allerta → combattimento → conclusione → ripristino della zona; agguato possibile senza allerta.',
      '• Tre scontri importanti con tema, introduzione e conclusione dedicati.',
      '• Dialoghi e cutscene fermano il gioco; mix e ripresa seguono le regole raccolte nel brief.',
      '• Demo L2.5: percorso S11–S15. Il primo combattimento con tutorial avviene subito dopo il primo cippo/checkpoint, prima dell’avvistamento della Borda. Prima accettazione completa su PC; distribuzione pubblica ancora da decidere.',
      '',
      'ARCHITETTURA AUDIO DA VALIDARE',
      '• Ipotesi Sparse Adaptive Ambience: Unreal rileva zona, tensione, eventi narrativi e stato di gioco; i parametri FMOD governano Environmental Soundscape e Sparse Musical Layers.',
      '• La call deve scegliere struttura degli eventi, parametri locali o globali, Scatterer/Multi Instrument/timeline/transizioni, limiti di sovrapposizione e perimetro del prototipo.',
      '',
      'MODELLO OPERATIVO DA CONCORDARE',
      '• Notion (remoto, team invitato): task, brief, responsabili, stato e riferimenti della consegna.',
      '• Hub (remoto, funzioni per ruolo): richieste, link, LOOKDEV e feedback. Drive conserva i file, accessibili solo alle persone autorizzate.',
      '• Repository audio da scegliere: SVN proposto per una prova del solo progetto FMOD; Git con LFS resta un’alternativa. Copie locali sincronizzate; hosting, backup e accessi da concordare.',
      '• SVN integrato in FMOD facilita aggiornamento, invio e gestione dei conflitti. Il blocco automatico di un evento non è garantito: avvisi e lock vanno verificati con due copie indipendenti.',
      '• Formazione prima dell’adozione: prova guidata, guida illustrata, esercizio sui conflitti e sul recupero; procedura separata per chi gestisce il server.',
      '• Perforce (remoto, utenti autorizzati): progetto Unreal condiviso. L’integratore lavora sulla copia locale e invia bank e modifiche tramite submit.',
      '• Consegna comune: autore → WAV/stem su Drive e LOOKDEV nell’Hub → responsabile FMOD.',
      '• Un responsabile: la stessa persona prepara FMOD e integra in Unreal; il passaggio delle bank è interno. Servono il repository audio concordato e Perforce.',
      '• Due responsabili: Persona A prepara FMOD con il repository audio concordato e consegna bank + versione + note tramite Hub/Drive; Persona B le integra in Unreal e usa Perforce.',
      '• Chi produce soltanto WAV/stem nella DAW può consegnare senza Unreal né accessi al repository audio o a Perforce.',
      '',
      `ESITI DELLA CALL (${closed.length}/${agendaItems.length})`,
      ''
    ];
    if(!closed.length)out.push('Nessun esito ancora registrato.','');
    closed.forEach(i=>{
      const r=record(i.id);
      out.push(`${i.id} — ${i.title}`,`Stato: ${r.status}`,`Decisione: ${r.decision||'Non scritta'}`,`Responsabile: ${r.owner||'Non assegnato'}`,`Nota/prova: ${r.notes||'Nessuna'}`,'');
    });
    out.push(`PUNTI ANCORA APERTI (${open.length})`,'');
    open.forEach(i=>out.push(`${i.id} — ${i.title}`));
    out.push('','PARCHEGGIO IDEE',data.parking||'Nessuna nota.','','CONTROLLO PRIMA DI CONDIVIDERE','• Verificare gli esiti con le persone indicate.','• Trasformare gli esiti confermati in architettura, convenzioni, task e guida operativa.','• Questo report non modifica automaticamente Notion, Perforce, Unreal o il progetto FMOD.');
    return out.join('\n');
  }
  function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000)}
  $$('.ac-nav button').forEach(b=>b.onclick=()=>showView(b.dataset.acView));
  $('#ac-menu-button').setAttribute('aria-expanded','false');
  $('#ac-menu-button').onclick=()=>{const rail=$('#ac-rail'),open=rail.style.display==='flex';if(open){closeMobileNav()}else{rail.style.display='flex';rail.style.position='fixed';rail.style.inset='58px 0 0';rail.style.width='100%';rail.style.height='calc(100vh - 58px)';$('#ac-menu-button').setAttribute('aria-expanded','true')}};
  $('#ac-export').onclick=()=>download('call_audio_risposte_'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(data,null,2),'application/json;charset=utf-8');
  $('#ac-import').onclick=()=>$('#ac-import-file').click();
  $('#ac-import-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const incoming=JSON.parse(await file.text());if(incoming.version!==2||typeof incoming.answers!=='object')throw new Error('Formato non riconosciuto');data=normalizeData(incoming);save();renderAgenda();$('#ac-parking').value=data.parking||'';toast('Risposte importate')}catch(err){toast('Importazione non riuscita: '+err.message,true)}finally{e.target.value=''}};
  $('#ac-parking').value=data.parking||'';$('#ac-parking').oninput=e=>{data.parking=e.target.value;save()};
  $('#ac-generate-report').onclick=()=>{generatedReport=makeReport();$('#ac-report-text').textContent=generatedReport;$('#ac-report-text').hidden=false;$('#ac-report-state').hidden=true;$('#ac-download-report').hidden=false;$('#ac-print-report').hidden=false;$('#ac-generate-report span').textContent='Aggiorna report';toast('Report generato con i dati correnti')};
  $('#ac-download-report').onclick=()=>{if(generatedReport)download('Report_call_audio_'+new Date().toISOString().slice(0,10)+'.txt',generatedReport,'text/plain;charset=utf-8')};
  $('#ac-print-report').onclick=()=>{if(!generatedReport)return;$('#ac-printout').textContent=generatedReport;window.print()};
  renderAgenda();updateProgress();
  const initialView=location.hash.slice(1);
  if(initialView&&document.getElementById(initialView)?.classList.contains('ac-view'))showView(initialView,true);
})();
