(() => {
  'use strict';
  /* 25/11/2026 [Claude] — Agenda riscritta su richiesta di Roberto: ogni punto è diviso nelle decisioni
     concrete da prendere, in parole semplici, ognuna con il proprio esito. Le risposte si salvano per
     singola decisione (es. T01.1). Gli esiti eventualmente registrati prima sul punto intero (es. T01)
     restano visibili nel punto e nel report. Aggiunti i collegamenti interni (data-ac-goto). */
  const WHEN={call:'Da chiudere in call',later:'Si può rinviare'};
  const STATUSES=['Da discutere','Decisione presa','Rinviato','Non applicabile'];
  /* 25/11/2026 [Claude] — Audit completo dell'agenda (richiesta di Roberto): 10 blocchi nell'ordine in cui si
     costruisce la pipeline. Ogni domanda ha «Serve a decidere» (cosa sblocca la risposta) e una proposta da
     confermare, cambiare o rinviare in call. Codici nuovi (1.1, 1.2…): le risposte salvate con i codici
     precedenti (T01, T01.1, A03…) restano visibili in cima all'agenda e nel report. */
  const agendaItems=[
    {id:'1',title:'Strumenti e versioni',summary:'Programmi e versioni uguali per tutti. Senza questo i file non si aprono o non funzionano nel gioco.',questions:[
      {id:'1.1',when:'call',q:'Usiamo FMOD per l’audio del gioco?',serve:['se i sound designer lavorano in FMOD o dentro Unreal','quali programmi e guide preparare','se si può impostare il resto della pipeline'],prop:'Sì. La prova tecnica è passata e ad Antonio è già stato detto che l’audio passerà da FMOD.'},
      {id:'1.2',when:'call',q:'Quali suoni passano da FMOD?',serve:['cosa gestisce il progetto FMOD e cosa resta in Unreal','chi si occupa di ogni parte'],prop:'Tutti: musica, ambienti, passi, combattimento, creature, menu e voci dei dialoghi. L’audio delle cutscene si decide dopo una prova di chi fa la parte Unreal.'},
      {id:'1.3',when:'call',q:'Quale versione di FMOD usiamo, e come si aggiorna?',serve:['la versione da installare per tutti','che il plugin nel gioco sia della stessa versione','come si gestiscono gli aggiornamenti'],prop:'FMOD 2.03.15 per tutti, la stessa del plugin già nel progetto del gioco. Si aggiorna solo tutti insieme, su decisione del custode FMOD.',warn:'Un progetto aperto con una versione più nuova viene convertito: chi ha la versione vecchia rischia di non riaprirlo.'},
      {id:'1.4',when:'call',q:'Ognuno può creare i suoni con il programma che preferisce?',serve:['se imporre un programma di lavoro o solo le regole di consegna','se servono licenze di programmi a pagamento'],prop:'Sì. Conta solo come si consegnano i file, secondo la Sound Bible (blocco 6).'},
      {id:'1.5',who:true,when:'later',q:'Chi registra il progetto per la licenza FMOD?',serve:['se usiamo FMOD gratis o a pagamento','chi tiene i rapporti con FMOD'],prop:'Roberto, prima della prima versione pubblica. La licenza Indie vale per budget sotto i 600.000 dollari: gratuita o 2.000 dollari a titolo, secondo le condizioni di FMOD.'}
    ]},
    {id:'2',title:'Persone e tempo',summary:'Su chi possiamo contare davvero. Qui si raccolgono informazioni, persona per persona.',questions:[
      {id:'2.1',info:true,when:'call',q:'Quante ore a settimana può dare ognuno, in quali giorni, ed entro quanto risponde a una richiesta?',serve:['quanto lavoro assegnare a ciascuno','scadenze realistiche','quando passare un lavoro a un sostituto'],prop:'Ognuno indica un minimo garantito, anche basso. Risposta alle richieste entro 3 giorni.'},
      {id:'2.2',info:true,when:'call',q:'Chi ha già lavorato con FMOD o collegato suoni al gioco in Unreal, su un progetto vero?',serve:['chi può fare il custode del progetto FMOD','chi può fare la parte Unreal','chi ha bisogno di formazione'],prop:'Chiedere esempi concreti: cosa avete fatto, in quale progetto, quali problemi avete risolto. Un «sì, lo conosco» non basta.'},
      {id:'2.3',info:true,when:'call',q:'Che computer usa ognuno, Windows o Mac?',serve:['quali programmi installare','quali guide scrivere','su quali computer fare la prova a due (blocco 7)'],prop:'Si chiede nel giro iniziale.'}
    ]},
    {id:'3',title:'Ruoli',summary:'Chi approva, chi cura il progetto FMOD, chi mette i suoni nel gioco, chi aiuta con il codice.',questions:[
      {id:'3.1',who:true,when:'call',q:'Chi ha l’ultima parola su un suono?',serve:['chi approva prima che un suono entri nel gioco','chi chiude i disaccordi','quante correzioni al massimo per consegna'],prop:'Approvano Roberto e Lorenzo. Per ogni area un referente fa il primo ascolto. Al massimo due giri di correzioni, poi decide la direzione.'},
      {id:'3.2',who:true,when:'call',q:'Chi è il custode del progetto FMOD, e chi lo sostituisce?',serve:['chi tocca le parti comuni: mixer, bank principale, informazioni condivise come zona e tensione','chi prepara le bank per il gioco','chi fa rispettare nomi e cartelle'],prop:'Il sound designer con più esperienza FMOD, più un sostituto. Le parti comuni le tocca solo lui.'},
      {id:'3.3',when:'call',q:'Ognuno lavora sulla sua area nel progetto FMOD?',serve:['come lavorare in parallelo senza conflitti','chi risponde di quali suoni','a chi vanno le task di ogni area'],prop:'Sì. Ogni area ha una sua cartella di eventi, una sua bank e un responsabile (blocco 4). Due persone non lavorano sullo stesso evento nello stesso momento.',goto:'ac-workflow',gotoLabel:'Vedi la proposta nel flusso operativo'},
      {id:'3.4',who:true,when:'call',q:'Chi mette i suoni nel gioco in Unreal, e chi lo sostituisce?',serve:['chi riceve le bank e collega i suoni alle azioni del gioco','se serve usare l’ultimo posto libero su Perforce'],prop:'Uno dei quattro che hanno già Perforce: Roberto, Lorenzo, Antonio o Giacomo. Così l’ultimo posto resta libero.'},
      {id:'3.5',when:'call',q:'Quali lavori audio servono ad Antonio, e come glieli chiediamo?',serve:['cosa fa il programmatore e cosa fa chi integra','come pianificare il suo tempo'],prop:'Ad Antonio le parti di sistema: mandare all’audio zona, tensione e stato del gioco; abbassare l’audio in dialoghi e pausa; voci dei dialoghi; audio giusto dopo un caricamento. Ogni richiesta con una task su Notion.'}
    ]},
    {id:'4',title:'Aree di lavoro',summary:'Per ogni area: chi crea i suoni e li prepara in FMOD. In «Chi se ne occupa» si spuntano i nomi. Regola generale proposta: chi crea i suoni di un’area li prepara anche in FMOD.',questions:[
      {id:'4.1',who:true,when:'call',q:'Musica: chi se ne occupa?',serve:['chi compone tema principale, musica dell’esplorazione e del combattimento','chi prepara la musica in FMOD','a chi vanno le task musicali'],prop:'I compositori, con Luca sul tema principale. In FMOD la prepara chi compone, se conosce FMOD; altrimenti il custode.'},
      {id:'4.2',who:true,when:'call',q:'Ambienti e natura: chi se ne occupa?',serve:['chi crea vento, acqua, fauna e i fondi di ogni zona','chi li prepara in FMOD']},
      {id:'4.3',who:true,when:'call',q:'Passi e movimenti di Rinaldo: chi se ne occupa?',serve:['chi registra i passi su ogni terreno e i movimenti','chi valuta se servono suoni a parte per la corsa (10.5)']},
      {id:'4.4',who:true,when:'call',q:'Combattimento: chi se ne occupa?',serve:['chi crea armi, colpi e danni','chi segue la musica e i suoni degli scontri insieme ai compositori']},
      {id:'4.5',who:true,when:'call',q:'Creature e nemici: chi se ne occupa?',serve:['chi crea versi, attacchi e morte di ogni nemico','chi segue i tre scontri importanti']},
      {id:'4.6',who:true,when:'call',q:'Interfaccia e menu: chi se ne occupa?',serve:['chi crea i suoni di menu, libro dei dialoghi e diario']},
      {id:'4.7',who:true,when:'call',q:'Voci dei dialoghi in FMOD: chi se ne occupa?',serve:['chi prepara in FMOD le voci registrate, una tabella per lingua','chi controlla i nomi dei file','quando Antonio riceve gli audio di prova'],prop:'Il custode FMOD. Nomi già concordati con Antonio: VO_<Personaggio>_<Argomento>_L01. Prima consegna di prova ad Antonio subito dopo la call.'}
    ]},
    {id:'5',title:'Il progetto FMOD',summary:'Come è organizzato il progetto, perché tutti trovino le cose e nessuno si pesti i piedi.',questions:[
      {id:'5.1',when:'call',q:'Come dividiamo eventi e bank?',serve:['in quali pacchetti il gioco carica i suoni','chi possiede ogni pacchetto','come evitare conflitti'],prop:'Una cartella e una bank per area: Musica, Ambienti, Passi, Combattimento, Creature, Interfaccia, Voci. La bank principale la cura solo il custode. Le voci hanno una bank per lingua.'},
      {id:'5.2',when:'later',q:'Come si chiamano eventi e file?',serve:['come si trova un suono nel progetto','come chi integra capisce cosa fa un evento','come evitare doppioni'],prop:'Inglese, senza spazi né accenti, con il prefisso dell’area: MUS, AMB, FOL, CMB, CRE, UI, VO. Esempio: FOL_Step_Leaves_Walk_01.'},
      {id:'5.3',when:'later',q:'Quali informazioni manda il gioco all’audio?',serve:['l’elenco delle informazioni condivise: zona, tensione, momento della storia, stato del gioco, terreno sotto i piedi','chi le crea in FMOD','chi le manda da Unreal'],prop:'Le crea e le modifica solo il custode. Le manda dal gioco chi integra, con Antonio per le parti di sistema.'},
      {id:'5.4',when:'later',q:'Come sono organizzati i volumi?',serve:['i gruppi di volume del gioco','i cursori del menu opzioni','cosa si abbassa in pausa e nei dialoghi','il livello di ascolto complessivo del gioco'],prop:'Gruppi Musica, Effetti (ambienti compresi), Voci e Interfaccia, collegati ai cursori già decisi: generale, musica, effetti, dialoghi. Il custode propone un livello di riferimento unico per tutto il gioco.'}
    ]},
    {id:'6',title:'Consegne dei file (Sound Bible)',summary:'Le regole tecniche uguali per tutti. Le risposte di questo blocco diventano la Sound Bible.',questions:[
      {id:'6.1',when:'call',q:'In che formato si consegnano i file?',serve:['che file accetta il custode','che qualità resta nel progetto','se i file si usano senza convertirli'],prop:'WAV, 48 kHz, 24 bit. Niente MP3 o altri formati compressi: la compressione la fa FMOD quando prepara le bank.'},
      {id:'6.2',when:'call',q:'Mono o stereo?',serve:['come si sentono i suoni nello spazio del gioco','quanto pesano i file'],prop:'Mono per i suoni con una posizione nel mondo: passi, porte, fuochi, nemici, armi. Stereo per musica, fondi ambientali e menu.'},
      {id:'6.3',when:'call',q:'A che volume si consegnano i file?',serve:['se i suoni arrivano già coerenti tra loro','quanto lavoro di volume resta in FMOD','come evitare distorsioni'],prop:'Picco massimo -1 dBFS, nessuna distorsione, nessun limitatore pesante sul file. Per ogni area il custode fissa un suono di riferimento; il volume finale si regola in FMOD.'},
      {id:'6.4',when:'later',q:'Come iniziano e finiscono i file, e come si fanno i loop?',serve:['se i suoni partono senza ritardo','se i loop si ripetono senza scatti','come si riconosce un loop dal nome'],prop:'Niente silenzio all’inizio, coda naturale alla fine. I loop chiudono senza click e hanno _LP nel nome.'},
      {id:'6.5',when:'later',q:'Quante varianti per i suoni che si ripetono?',serve:['quanto lavoro chiedere per passi, colpi e versi','quanto si sente la ripetizione'],prop:'Almeno 4 varianti per i passi su ogni terreno, come nella prova, e 3 per colpi e versi. FMOD le alterna da solo.'},
      {id:'6.6',when:'later',q:'Come si consegna la musica?',serve:['se la musica si può adattare al gioco','se servono le parti separate (stem)','come si agganciano i cambi al ritmo'],prop:'Brano completo più le parti separate quando servono; tempo e tonalità nella nota di consegna. I frammenti per l’esplorazione brevi e compatibili tra loro.'},
      {id:'6.7',when:'call',q:'Da dove arrivano i suoni, e con quale licenza?',serve:['se possiamo usare legalmente ogni suono in un gioco venduto','come si controllano le licenze','cosa scrivere nei crediti'],prop:'Solo registrazioni proprie o librerie con licenza per uso commerciale. Ogni consegna elenca fonti e licenze; il custode le controlla quando riceve i file.',warn:'Un suono senza licenza chiara va rifatto prima dell’uscita.'},
      {id:'6.8',when:'later',q:'Dove si consegna, e cosa si scrive nella consegna?',serve:['dove il custode trova i file','come si seguono le versioni','cosa deve sapere chi riceve'],prop:'Cartella Drive dell’area più richiesta nell’Hub, con elenco dei file, cosa sono, se sono loop, fonti e licenze. Le correzioni tengono lo stesso nome file.'},
      {id:'6.9',who:true,when:'call',q:'Chi scrive la Sound Bible, dove sta e chi la approva?',serve:['dove il team trova tutte le regole tecniche','chi le aggiorna','da quando valgono'],prop:'Un manuale di produzione come l’Artist Bible degli artisti. Prima bozza con gli esiti di questa call, revisione del custode FMOD, approvazione di Roberto e Lorenzo. Vale per tutte le task audio da quel momento.'}
    ]},
    {id:'7',title:'Archivio condiviso',summary:'Dove vive il progetto FMOD condiviso, con la storia delle modifiche. Il confronto spiegato è nella sezione «SVN o Git LFS».',questions:[
      {id:'7.1',info:true,when:'call',q:'Chi ha già usato SVN o Git?',serve:['quale sistema il team imparerà con meno fatica','quanta formazione serve'],goto:'ac-repo',gotoLabel:'Apri il confronto SVN / Git LFS'},
      {id:'7.2',when:'call',q:'Proviamo SVN, Git LFS o tutti e due?',serve:['quale archivio provare per primo','quando si potrà lavorare insieme sul progetto FMOD'],prop:'Prima SVN, perché si usa da dentro FMOD. Se gestirlo è troppo pesante, si prova Git LFS.'},
      {id:'7.3',who:true,when:'call',q:'Chi gestisce l’archivio e le copie di sicurezza?',serve:['chi installa e cura l’archivio','chi fa il backup, e ogni quanto'],prop:'Per SVN, chi gestisce già il server di Perforce. Backup settimanale, conservato fuori dal server.'},
      {id:'7.4',who:true,when:'call',q:'Chi fa la prova a due, e chi decide se è andata bene?',serve:['chi verifica che il metodo funzioni prima di usarlo sul gioco'],prop:'Il custode FMOD e un altro sound designer. Giudicano Roberto e il custode.'},
      {id:'7.5',when:'later',q:'Quali regole per lavorare sull’archivio?',serve:['come evitare conflitti e lavoro perso'],prop:'Aggiornare sempre prima di iniziare. Inviare a fine sessione con una frase su cosa è cambiato. Mai inviare lavoro rotto. Le parti comuni le tocca solo il custode.'}
    ]},
    {id:'8',title:'Flusso di lavoro e controlli',summary:'Come nasce un lavoro, ogni quanto arriva nel gioco, quando è finito davvero.',questions:[
      {id:'8.1',when:'call',q:'Come nasce un lavoro audio?',serve:['dove arrivano le richieste','cosa deve sapere un sound designer prima di iniziare'],prop:'Una task su Notion per ogni consegna, con: cosa serve, dove si sente nel gioco, riferimenti, durata, loop sì o no, area e scadenza.'},
      {id:'8.2',when:'call',q:'Ogni quanto i suoni nuovi arrivano nel gioco?',serve:['il ritmo di lavoro','quando chi integra riceve le novità','come evitare interruzioni continue'],prop:'Una volta a settimana, in un giorno fisso: il custode prepara le bank, chi integra le mette nel gioco.'},
      {id:'8.3',when:'call',q:'Quali controlli prima di dire che un suono è nel gioco?',serve:['quando una consegna è finita davvero','chi fa ogni controllo'],prop:'Tre passi. Suona bene in FMOD: lo controlla chi l’ha fatto. Funziona in Unreal premendo Play: chi integra. Funziona nel gioco esportato per PC: prova settimanale.'},
      {id:'8.4',who:true,when:'call',q:'Chi prova per primo il gioco esportato per PC con FMOD dentro?',serve:['se FMOD funziona anche fuori da Unreal','chi sistema l’avviso tecnico di FMOD ancora aperto'],prop:'Chi integra, nelle prime due settimane, con Antonio se serve.'},
      {id:'8.5',when:'later',q:'Quando una consegna audio conta come «Integrated» e dà i punti?',serve:['quando si accreditano i punti per l’audio','come non darli per prove o suoni non ancora nel gioco'],prop:'Quando il suono è nel gioco e ha passato i controlli. Lo spunta Roberto, come per le altre task. Ne decidono Roberto e Lorenzo dopo la call.'},
      {id:'8.6',when:'later',q:'Quanto può pesare l’audio, e quanti suoni insieme al massimo?',serve:['se il gioco rallenta quando partono molti suoni insieme','quanto spazio occupa l’audio'],prop:'Per ora nessun limite rigido. Il custode controlla con gli strumenti di FMOD quando il gioco cresce.'},
      {id:'8.7',when:'later',q:'Quando pensiamo alle console?',serve:['se servono licenze e kit di sviluppo','quando prepararli'],prop:'Dopo la prima accettazione su PC.'}
    ]},
    {id:'9',title:'Esplorazione: la prima prova',summary:'L’idea è decisa: l’ambiente in primo piano, la musica entra ogni tanto e poi sparisce. Qui si decide come provarla.',questions:[
      {id:'9.1',when:'call',q:'Dove facciamo la prima prova, e come capiamo se funziona?',serve:['il primo lavoro concreto del team','cosa produrre per primo','come giudicare il risultato'],prop:'Dall’uscita dal villaggio, attraverso la nebbia, fino al primo cippo. Funziona se la musica compare di rado e il silenzio sembra voluto, se non si sentono ripetizioni e se il cambio di zona non ha stacchi.'},
      {id:'9.2',who:true,when:'call',q:'Chi prepara la proposta tecnica per l’esplorazione?',serve:['come dividere ambiente e musica in FMOD','quali informazioni servono dal gioco','quanti suoni insieme al massimo'],prop:'Il custode FMOD, insieme a chi fa la musica e a chi fa gli ambienti.'},
      {id:'9.3',when:'call',q:'Cosa fa salire la tensione?',serve:['quando la musica si fa più presente','cosa deve mandare il gioco all’audio'],prop:'Momenti della storia e zone precise, decisi da chi fa il game design.',warn:'Se la tensione sale quando un mostro è vicino ma non ti ha ancora visto, la musica avvisa del pericolo: è stato escluso.'},
      {id:'9.4',when:'later',q:'La musica entra a caso o in un ordine preciso?',serve:['come scrivono i compositori','come si costruisce in FMOD'],prop:'A caso, entro regole precise: i compositori scrivono frammenti brevi che stanno bene in qualsiasi ordine.'},
      {id:'9.5',when:'later',q:'Quanto deve essere vuoto il suono?',serve:['quanta musica si sente in esplorazione','le pause tra un frammento e l’altro'],prop:'Mai più di un frammento di musica alla volta, con pause lunghe. I numeri li propone il custode; la scelta finale spetta alla direzione.'}
    ]},
    {id:'10',title:'Contenuti per la demo',summary:'Cosa serve nella demo (S11–S15) e in che ordine produrlo.',questions:[
      {id:'10.1',when:'call',q:'Cosa produciamo per primo?',serve:['le prime task da assegnare dopo la call','cosa serve alla prima prova (blocco 9)'],prop:'Passi sui terreni principali, fondo ambientale della prima zona, frammenti di musica dell’esplorazione, primi suoni dei menu.'},
      {id:'10.2',when:'later',q:'In quali momenti della demo c’è musica?',serve:['la prima lista dei brani','il lavoro dei compositori nei prossimi mesi'],prop:'Esplorazione nella nebbia (musica rada), visione di Beatrice, primo combattimento con tutorial, dialogo con l’eremita, primo avvistamento della Borda.'},
      {id:'10.3',when:'later',q:'Dove compare la ninna nanna nella demo?',serve:['quanto si usa il tema principale','quanto della storia rivela la demo'],prop:'Si decide con la storia, prima di rendere pubblica la demo.'},
      {id:'10.4',when:'later',q:'Nella demo l’audio è definitivo o può avere segnaposto?',serve:['quanta qualità serve entro la demo','cosa si può rimandare'],prop:'Definitivi i suoni della prima prova; il resto può restare segnaposto finché la demo non diventa pubblica.'},
      {id:'10.5',when:'later',q:'Servono suoni a parte per la corsa?',serve:['quanti passi registrare','su quali terreni'],prop:'Solo dove il suono cambia davvero, per esempio su foglie e acqua. Altrove bastano i passi della camminata, più ravvicinati.'}
    ]}
  ];
  const allQuestions=agendaItems.flatMap(item=>item.questions.map(question=>({...question,item})));
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
  /* 25/11/2026 [Claude] — «Chi se ne occupa» a scelta multipla: caselle da spuntare più «Tutto il team».
     Il valore si salva ancora come testo (nomi separati da virgola), quindi report ed esportazione non cambiano
     e le scelte singole già salvate restano valide. */
  const TEAM='Tutto il team';
  const knownOwners=[...audioOwners,...integratorOwners].map(person=>person.name);
  function splitOwners(value=''){return [...new Set(String(value).split(',').map(name=>name.trim()).filter(Boolean))]}
  function orderOwners(names){const extra=names.filter(name=>name!==TEAM&&!knownOwners.includes(name));return [...(names.includes(TEAM)?[TEAM]:[]),...knownOwners.filter(name=>names.includes(name)),...extra]}
  function ownerSummary(names){if(!names.length)return 'Da concordare';if(names.includes(TEAM))return TEAM;return orderOwners(names).join(', ')}
  function ownerPicker(value=''){
    const selected=splitOwners(value);
    const extra=selected.filter(name=>name!==TEAM&&!knownOwners.includes(name));
    const box=(name,label)=>`<label class="ac-owner-option"><input type="checkbox" data-owner="${esc(name)}" ${selected.includes(name)?'checked':''}><span>${label}</span></label>`;
    const group=(title,people)=>`<div class="ac-owner-group" role="group" aria-label="${esc(title)}"><span class="ac-owner-group-title">${esc(title)}</span>${people.map(person=>box(person.name,`${esc(person.name)}${person.role?` <small>${esc(person.role)}</small>`:''}`)).join('')}</div>`;
    return `<details class="ac-owner-picker"><summary><span class="ac-owner-summary">${esc(ownerSummary(selected))}</span>${icon('ac-i-chevron','ac-icon ac-owner-chev')}</summary><div class="ac-owner-menu">${box(TEAM,'<strong>Tutto il team</strong>')}${extra.length?group('Valore già salvato',extra.map(name=>({name,role:''}))):''}${group('Composer e sound designer attivi',audioOwners)}${group('Perforce Integrator attuali',integratorOwners)}<p class="ac-owner-hint">Puoi spuntare più nomi.</p></div></details>`;
  }
  function record(id){return data.answers[id]||{status:'Da discutere',decision:'',owner:'',notes:''};}
  function isClosed(status){return status==='Decisione presa'||status==='Non applicabile';}
  const currentIds=new Set(allQuestions.map(q=>q.id));
  /* 25/11/2026 [Claude] — Su richiesta di Roberto le risposte salvate con i codici delle versioni precedenti
     (erano prove) si cancellano all'apertura della pagina e dopo un'importazione. */
  const questionById=new Map(allQuestions.map(q=>[q.id,q]));
  /* 26/11/2026 [Claude] — «Chi se ne occupa» solo dove la risposta è una persona (who:true); tolto dalle
     decisioni di progetto e dalle domande di raccolta informazioni, su richiesta di Roberto. */
  function removeOldAnswers(){let changed=0;Object.keys(data.answers).forEach(id=>{const q=questionById.get(id);if(!q){delete data.answers[id];changed++}else if(!q.who&&data.answers[id]?.owner){data.answers[id]={...data.answers[id],owner:''};changed++}});return changed}
  /* 26/11/2026 [Claude] — «Confronta»: carica il file esportato da un’altra persona e mostra le sue risposte sotto
     ogni domanda, accanto alle proprie, senza modificarle. Il confronto resta salvato nel browser finché non si
     preme «Togli il confronto». */
  const plural=(n,one,many)=>`${n} ${n===1?one:many}`;
  const COMPARE_STORAGE='wtfd.audio.call.compare.v1';
  const COMPARE_TAG={none:'Nessuna risposta',only:'Solo nel suo file',same:'Uguale alla tua',diff:'Diversa dalla tua'};
  let compare=loadCompare();
  function loadCompare(){try{const raw=localStorage.getItem(COMPARE_STORAGE);const value=raw?JSON.parse(raw):null;return value&&value.answers&&typeof value.answers==='object'?value:null}catch(e){return null}}
  function saveCompare(){try{if(compare)localStorage.setItem(COMPARE_STORAGE,JSON.stringify(compare));else localStorage.removeItem(COMPARE_STORAGE)}catch(e){}}
  function hasContent(r){return !!r&&((r.status&&r.status!=='Da discutere')||r.decision||r.owner||r.notes)}
  function theirAnswer(qid){const r=compare?.answers[qid];if(!r)return r;return questionById.get(qid)?.who?r:{...r,owner:''}}
  function sameText(a,b){return String(a||'').trim().toLowerCase()===String(b||'').trim().toLowerCase()}
  function sameOwners(a,b){return orderOwners(splitOwners(a)).join(', ')===orderOwners(splitOwners(b)).join(', ')}
  function compareName(){return compare&&compare.name?compare.name:'Altra persona'}
  function compareState(qid){
    if(!compare)return null;
    const theirs=theirAnswer(qid);
    if(!hasContent(theirs))return {kind:'none'};
    const mine=data.answers[qid];
    if(!hasContent(mine))return {kind:'only',theirs};
    const same=sameText(mine.status,theirs.status)&&sameText(mine.decision,theirs.decision)&&(!questionById.get(qid)?.who||sameOwners(mine.owner,theirs.owner));
    return {kind:same?'same':'diff',theirs};
  }
  function answerLine(r){return [r.status||'Da discutere',r.decision?`«${r.decision}»`:'',r.owner?'Chi: '+r.owner:'',r.notes?'Nota: '+r.notes:''].filter(Boolean).join(' · ')}
  function compareRowHtml(qid){
    const state=compareState(qid);if(!state)return '';
    return `<div class="ac-compare-row is-${state.kind}"><div class="ac-compare-head"><strong>${esc(compareName())}</strong><span class="ac-compare-tag">${COMPARE_TAG[state.kind]}</span></div>${state.kind==='none'?'':`<p>${esc(answerLine(state.theirs))}</p>`}</div>`;
  }
  function compareBannerHtml(){
    if(!compare)return '';
    const answered=allQuestions.filter(q=>hasContent(theirAnswer(q.id))).length;
    const diff=allQuestions.filter(q=>compareState(q.id).kind==='diff').length;
    const old=Object.keys(compare.answers).filter(id=>!currentIds.has(id)&&hasContent(compare.answers[id])).sort();
    const when=compare.loaded?new Date(compare.loaded).toLocaleString('it-IT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'';
    return `<div class="ac-compare-banner"><div><p><strong>Confronto attivo</strong> con le risposte di <input id="ac-compare-name" value="${esc(compare.name||'')}" placeholder="scrivi il nome" aria-label="Nome della persona" size="13">${when?` · file caricato il ${esc(when)}`:''}</p><p>Nel suo file: ${plural(answered,'risposta','risposte')}, ${plural(diff,'diversa','diverse')} dalle tue. Le tue risposte non cambiano.</p></div><button type="button" class="ac-link" id="ac-compare-clear">Togli il confronto</button>${old.length?`<details class="ac-compare-old"><summary>${plural(old.length,'risposta','risposte')} con i codici della versione precedente della pagina</summary><ul>${old.map(id=>`<li>${esc(id)} · ${esc(answerLine(compare.answers[id]))}</li>`).join('')}</ul></details>`:''}</div>`;
  }
  function normalizeData(value){const normalized={...defaults,...value,answers:{...(value?.answers||{})}};Object.values(normalized.answers).forEach(answer=>{if(answer?.status==='Azione assegnata')answer.status='Decisione presa'});return normalized}
  function load(){try{const raw=localStorage.getItem(STORAGE);return raw?normalizeData(JSON.parse(raw)):{...defaults,answers:{}}}catch(e){return {...defaults,answers:{}}}}
  function resetGeneratedReport(){generatedReport='';const generate=$('#ac-generate-report');if(!generate)return;generate.querySelector('span').textContent='Genera report';$('#ac-report-state').hidden=false;$('#ac-report-text').hidden=true;$('#ac-report-text').textContent='';$('#ac-download-report').hidden=true;$('#ac-print-report').hidden=true}
  function save(){try{data.updated=new Date().toISOString();localStorage.setItem(STORAGE,JSON.stringify(data));$('#ac-save-state').textContent='Salvato alle '+new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});$('#ac-save-state').classList.remove('error');updateProgress();resetGeneratedReport()}catch(e){$('#ac-save-state').textContent='Salvataggio non disponibile: esporta i dati';$('#ac-save-state').classList.add('error')}}
  function toast(message,isError=false){const t=$('#ac-toast');t.textContent=message;t.classList.toggle('error',isError);t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2600)}
  function icon(id,cls='ac-icon'){return `<svg class="${cls}"><use href="#${id}"/></svg>`}
  function showView(id,instant=false){$$('.ac-view').forEach(v=>{v.hidden=v.id!==id;v.classList.remove('enter')});const current=$('#'+id);current.hidden=false;if(!instant)requestAnimationFrame(()=>current.classList.add('enter'));$$('.ac-nav button').forEach(b=>b.setAttribute('aria-current',b.dataset.acView===id?'page':'false'));if(innerWidth<=780)closeMobileNav();window.scrollTo({top:0,behavior:instant?'auto':'smooth'})}
  function closeMobileNav(){const rail=$('#ac-rail');rail.style.display='';rail.style.position='';rail.style.inset='';rail.style.width='';rail.style.height='';$('#ac-menu-button').setAttribute('aria-expanded','false')}
  function itemStatus(item){const done=item.questions.filter(q=>isClosed(record(q.id).status)).length;let text=`${done} di ${item.questions.length} decise`;if(compare){const diff=item.questions.filter(q=>compareState(q.id).kind==='diff').length;if(diff)text+=` · ${diff} ${diff===1?'diversa':'diverse'}`}return text}
  function questionHtml(question,index){
    const r=record(question.id);
    const tagClass=question.when==='call'?'open':'proposal';
    const link=question.goto?`<button type="button" class="ac-link" data-ac-goto="${question.goto}">${esc(question.gotoLabel)}</button>`:'';
    return `<li class="ac-subq${isClosed(r.status)?' is-closed':''}" data-qid="${question.id}">
      <div class="ac-subq-head"><span class="ac-subq-num">${index+1}</span><div><h4>${esc(question.q)}</h4><p class="ac-subq-serve"><strong>Serve a decidere:</strong> ${question.serve.map(esc).join('; ')}.</p>${question.prop?`<p class="ac-subq-prop"><strong>Proposta:</strong> ${esc(question.prop)}</p>`:''}${question.warn?`<p class="ac-subq-warn"><strong>Attenzione:</strong> ${esc(question.warn)}</p>`:''}${link?`<p class="ac-subq-more">${link}</p>`:''}</div><span class="ac-tag ${tagClass}">${WHEN[question.when]}</span></div>
      <div class="ac-form-grid">
        <label class="ac-field"><span>Esito</span><select data-field="status">${STATUSES.map(s=>`<option ${s===r.status?'selected':''}>${s}</option>`).join('')}</select></label>
        ${question.who?`<div class="ac-field"><span>Chi se ne occupa</span>${ownerPicker(r.owner)}</div>`:''}
        <label class="ac-field full"><span>${question.info?'Risposte raccolte':'Decisione in una riga'}</span><input data-field="decision" value="${esc(r.decision)}" placeholder="${question.info?'Chi ha risposto cosa, in breve':'«Proposta confermata» oppure cosa si è deciso al suo posto'}"></label>
        <label class="ac-field full"><span>Nota o prova richiesta</span><input data-field="notes" value="${esc(r.notes)}" placeholder="Informazione da recuperare, prova da fare, prossimo passo"></label>
      </div>
      ${compareRowHtml(question.id)}
    </li>`;
  }
  function renderAgenda(){
    const host=$('#ac-agenda');
    host.innerHTML=compareBannerHtml()+agendaItems.map(item=>`<article class="ac-agenda-item" data-id="${item.id}"><button class="ac-agenda-head" aria-expanded="false"><span class="ac-agenda-code">${item.id}</span><span class="ac-agenda-title"><strong>${esc(item.title)}</strong><span>${esc(item.summary)}</span></span><span class="ac-status">${itemStatus(item)}</span>${icon('ac-i-chevron','ac-icon ac-chev')}</button><div class="ac-agenda-body"><ol class="ac-subq-list">${item.questions.map(questionHtml).join('')}</ol></div></article>`).join('');
    agendaItems.forEach(item=>{
      const article=host.querySelector(`[data-id="${item.id}"]`);
      article.querySelector('.ac-agenda-head').onclick=()=>{article.classList.toggle('open');article.querySelector('.ac-agenda-head').setAttribute('aria-expanded',article.classList.contains('open'))};
      article.querySelector('.ac-agenda-body').addEventListener('input',e=>{
        const li=e.target.closest('[data-qid]');if(!li)return;
        const qid=li.dataset.qid;
        if(e.target.dataset.owner!==undefined){
          const picker=e.target.closest('.ac-owner-picker');
          const boxes=[...picker.querySelectorAll('input[data-owner]')];
          if(e.target.checked)boxes.forEach(box=>{if(box!==e.target&&(e.target.dataset.owner===TEAM||box.dataset.owner===TEAM))box.checked=false});
          const chosen=boxes.filter(box=>box.checked).map(box=>box.dataset.owner);
          data.answers[qid]={...record(qid),owner:orderOwners(chosen).join(', ')};
          picker.querySelector('.ac-owner-summary').textContent=ownerSummary(chosen);
          save();refreshCompare(li,article,item);
          return;
        }
        const field=e.target.dataset.field;if(!field)return;
        data.answers[qid]={...record(qid),[field]:e.target.value};
        li.classList.toggle('is-closed',isClosed(record(qid).status));
        article.querySelector('.ac-status').textContent=itemStatus(item);
        save();refreshCompare(li,article,item);
      });
    });
    $('#ac-compare-clear')?.addEventListener('click',()=>{compare=null;saveCompare();renderAgenda();resetGeneratedReport();toast('Confronto tolto')});
    $('#ac-compare-name')?.addEventListener('change',e=>{compare.name=e.target.value.trim();saveCompare();$$('.ac-compare-head strong').forEach(el=>el.textContent=compareName());resetGeneratedReport()});
    updateProgress();
  }
  function refreshCompare(li,article,item){if(!compare)return;const row=li.querySelector('.ac-compare-row');if(row)row.outerHTML=compareRowHtml(li.dataset.qid);article.querySelector('.ac-status').textContent=itemStatus(item);const banner=document.querySelector('.ac-compare-banner p+p');if(banner){const answered=allQuestions.filter(q=>hasContent(theirAnswer(q.id))).length,diff=allQuestions.filter(q=>compareState(q.id).kind==='diff').length;banner.textContent=`Nel suo file: ${plural(answered,'risposta','risposte')}, ${plural(diff,'diversa','diverse')} dalle tue. Le tue risposte non cambiano.`}}
  function openAgendaItem(id){const article=document.querySelector(`.ac-agenda-item[data-id="${id}"]`);if(!article)return;article.classList.add('open');article.querySelector('.ac-agenda-head').setAttribute('aria-expanded','true');setTimeout(()=>article.scrollIntoView({behavior:'smooth',block:'start'}),380)}
  function updateProgress(){const done=allQuestions.filter(q=>isClosed(record(q.id).status)).length,total=allQuestions.length,percent=total?done/total*100:0;$('#ac-done-count').textContent=done;$('#ac-total-count').textContent=total;$('#ac-call-progress').value=percent;$('#ac-side-progress').value=percent;$('#ac-side-count').textContent=`${done} di ${total} decisioni chiuse`}
  function makeReport(){
    const withOutcome=allQuestions.filter(q=>record(q.id).status!=='Da discutere');
    const open=allQuestions.filter(q=>record(q.id).status==='Da discutere');
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
      'ESPLORAZIONE (BLOCCO 9)',
      '• Ipotesi di lavoro: il gioco manda all’audio zona, tensione, momenti della storia e stato di gioco; FMOD regola di conseguenza ambiente e musica rada.',
      '• Da chiudere in call: dove fare la prima prova e come giudicarla, chi prepara la proposta tecnica, cosa fa salire la tensione.',
      '• Si può rinviare: se la musica entra a caso o in un ordine preciso, quanto deve essere vuoto il suono.',
      '',
      'MODELLO OPERATIVO DA CONCORDARE',
      '• Notion (remoto, team invitato): task, brief, responsabili, stato e riferimenti della consegna.',
      '• Hub (remoto, funzioni per ruolo): richieste, link, LOOKDEV e feedback. Drive conserva i file, accessibili solo alle persone autorizzate.',
      '• Archivio del progetto FMOD da scegliere: proposta una prova con SVN sul solo progetto FMOD; Git LFS resta l’alternativa. Il confronto in parole semplici è nella sezione «SVN o Git LFS» della pagina.',
      '• Con SVN si aggiorna e si invia da dentro FMOD; il blocco automatico di un evento non è garantito e va verificato con la prova a due.',
      '• Formazione prima dell’adozione: prova guidata, guida illustrata, esercizio sui conflitti e sul recupero; procedura separata per chi gestisce il server.',
      '• Perforce (remoto, utenti autorizzati): progetto Unreal condiviso. L’integratore lavora sulla copia locale e invia bank e modifiche tramite submit.',
      '• Consegna comune: autore → WAV/stem su Drive e LOOKDEV nell’Hub → responsabile FMOD.',
      '• Un responsabile: la stessa persona prepara FMOD e integra in Unreal; il passaggio delle bank è interno. Servono l’archivio audio concordato e Perforce.',
      '• Due responsabili: Persona A prepara FMOD con l’archivio audio concordato e consegna bank + versione + note tramite Hub/Drive; Persona B le integra in Unreal e usa Perforce.',
      '• Chi produce soltanto WAV/stem nella DAW può consegnare senza Unreal né accessi all’archivio audio o a Perforce.',
      '• Proposta per la call: ognuno lavora sulla sua area in FMOD (eventi e bank propri); un custode cura le parti comuni e prepara le bank; uno dei quattro che hanno già Perforce le mette nel gioco.',
      '• Le regole tecniche concordate (blocco 6) diventano la Sound Bible, sul modello dell’Artist Bible.',
      '',
      `ESITI DELLA CALL (${withOutcome.length} di ${allQuestions.length} decisioni con un esito)`,
      ''
    ];
    if(!withOutcome.length)out.push('Nessun esito ancora registrato.','');
    agendaItems.forEach(item=>{
      const answered=item.questions.filter(q=>record(q.id).status!=='Da discutere');
      if(!answered.length)return;
      out.push(`${item.id} — ${item.title}`);
      answered.forEach(q=>{const r=record(q.id);out.push(`  • ${q.id} ${q.q}`,...(q.prop?[`    Proposta: ${q.prop}`]:[]),`    Esito: ${r.status}`,`    ${q.info?'Risposte raccolte':'Decisione'}: ${r.decision||'Non scritta'}`,...(q.who?[`    Chi se ne occupa: ${r.owner||'Non assegnato'}`]:[]),`    Nota o prova: ${r.notes||'Nessuna'}`)});
      out.push('');
    });
    if(compare){
      const who=compareName(),kind=q=>compareState(q.id).kind;
      const diff=allQuestions.filter(q=>kind(q)==='diff'),only=allQuestions.filter(q=>kind(q)==='only'),same=allQuestions.filter(q=>kind(q)==='same');
      out.push(`CONFRONTO CON ${who.toUpperCase()}`,`File caricato: ${compare.loaded?new Date(compare.loaded).toLocaleString('it-IT'):'data non nota'}`,`Uguali: ${same.length} · Diverse: ${diff.length} · Solo nel suo file: ${only.length}`,'');
      if(diff.length){out.push('Risposte diverse:');diff.forEach(q=>out.push(`  • ${q.id} ${q.q}`,`    Tu: ${answerLine(record(q.id))}`,`    ${who}: ${answerLine(theirAnswer(q.id))}`));out.push('')}
      if(only.length){out.push(`Risposte solo nel file di ${who}:`);only.forEach(q=>out.push(`  • ${q.id} ${q.q}`,`    ${who}: ${answerLine(theirAnswer(q.id))}`));out.push('')}
    }
    out.push(`DECISIONI ANCORA APERTE (${open.length})`,'');
    agendaItems.forEach(item=>{
      const pending=item.questions.filter(q=>record(q.id).status==='Da discutere');
      if(!pending.length)return;
      out.push(`${item.id} — ${item.title}`);
      pending.forEach(q=>out.push(`  • ${q.id} ${q.q} [${WHEN[q.when]}]`,...(q.prop?[`    Proposta: ${q.prop}`]:[])));
      out.push('');
    });
    out.push('PARCHEGGIO IDEE',data.parking||'Nessuna nota.','','CONTROLLO PRIMA DI CONDIVIDERE','• Verificare gli esiti con le persone indicate.','• Trasformare gli esiti confermati in architettura, convenzioni, task e guida operativa.','• Questo report non modifica automaticamente Notion, Perforce, Unreal o il progetto FMOD.');
    return out.join('\n');
  }
  function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000)}
  $$('.ac-nav button').forEach(b=>b.onclick=()=>showView(b.dataset.acView));
  document.addEventListener('click',e=>{$$('.ac-owner-picker[open]').forEach(picker=>{if(!picker.contains(e.target))picker.removeAttribute('open')})});
  document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;const picker=e.target.closest?.('.ac-owner-picker[open]');if(!picker)return;picker.removeAttribute('open');picker.querySelector('summary').focus()});
  document.addEventListener('click',e=>{const link=e.target.closest('[data-ac-goto]');if(!link)return;e.preventDefault();showView(link.dataset.acGoto);if(link.dataset.acOpen)openAgendaItem(link.dataset.acOpen)});
  $('#ac-menu-button').setAttribute('aria-expanded','false');
  $('#ac-menu-button').onclick=()=>{const rail=$('#ac-rail'),open=rail.style.display==='flex';if(open){closeMobileNav()}else{rail.style.display='flex';rail.style.position='fixed';rail.style.inset='58px 0 0';rail.style.width='100%';rail.style.height='calc(100vh - 58px)';$('#ac-menu-button').setAttribute('aria-expanded','true')}};
  $('#ac-export').onclick=()=>download('call_audio_risposte_'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(data,null,2),'application/json;charset=utf-8');
  $('#ac-import').onclick=()=>$('#ac-import-file').click();
  $('#ac-import-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const incoming=JSON.parse(await file.text());if(incoming.version!==2||typeof incoming.answers!=='object')throw new Error('Formato non riconosciuto');data=normalizeData(incoming);removeOldAnswers();save();renderAgenda();$('#ac-parking').value=data.parking||'';toast('Risposte importate')}catch(err){toast('Importazione non riuscita: '+err.message,true)}finally{e.target.value=''}};
  $('#ac-compare').onclick=()=>$('#ac-compare-file').click();
  $('#ac-compare-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const incoming=JSON.parse(await file.text());if(incoming.version!==2||!incoming.answers||typeof incoming.answers!=='object')throw new Error('Formato non riconosciuto');compare={name:compare?.name||'',loaded:new Date().toISOString(),file:file.name,answers:incoming.answers};saveCompare();renderAgenda();resetGeneratedReport();showView('ac-call');toast(`Confronto caricato: ${allQuestions.filter(q=>hasContent(theirAnswer(q.id))).length} risposte`)}catch(err){toast('Confronto non riuscito: '+err.message,true)}finally{e.target.value=''}};
  $('#ac-parking').value=data.parking||'';$('#ac-parking').oninput=e=>{data.parking=e.target.value;save()};
  $('#ac-generate-report').onclick=()=>{generatedReport=makeReport();$('#ac-report-text').textContent=generatedReport;$('#ac-report-text').hidden=false;$('#ac-report-state').hidden=true;$('#ac-download-report').hidden=false;$('#ac-print-report').hidden=false;$('#ac-generate-report span').textContent='Aggiorna report';toast('Report generato con i dati correnti')};
  $('#ac-download-report').onclick=()=>{if(generatedReport)download('Report_call_audio_'+new Date().toISOString().slice(0,10)+'.txt',generatedReport,'text/plain;charset=utf-8')};
  $('#ac-print-report').onclick=()=>{if(!generatedReport)return;$('#ac-printout').textContent=generatedReport;window.print()};
  if(removeOldAnswers()){try{localStorage.setItem(STORAGE,JSON.stringify(data))}catch(e){}}
  renderAgenda();updateProgress();
  const initialView=location.hash.slice(1);
  if(initialView&&document.getElementById(initialView)?.classList.contains('ac-view'))showView(initialView,true);
})();
