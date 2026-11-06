/* Atlas Quest V4 – additive enhancements to V3. Existing globe, questions and country data remain intact. */
(() => {
  'use strict';
  const VERSION = '4.0.0-preview';
  const DAY = 86400000;
  const original = { start, ask, finish, complete, store, switchMode, updateStats, showCountry, tinyMarkers };
  const safe = (value) => escapeHTML(String(value ?? ''));
  const category = (mode) => mode === 'locate' ? 'countries' : 'capitals';
  const memoryKey = (mode, country) => `${category(mode)}::${country}`;
  let timerStart = 0, elapsedBefore = 0, timerInterval = null;
  let toastTimer = null, studyRequest = 0;
  let repeatCount = {};
  let expanded = true;
  const atlasDataCache = new Map();

  // Keep the existing v3 browser storage, so prior scores and missed answers survive the upgrade.
  record.mastery = record.mastery && typeof record.mastery === 'object' ? record.mastery : {};
  record.personalBests = record.personalBests && typeof record.personalBests === 'object' ? record.personalBests : {};
  record.settings = record.settings && typeof record.settings === 'object' ? record.settings : {adaptive: true};
  if (typeof record.settings.adaptive !== 'boolean') record.settings.adaptive = true;

  const css = document.createElement('style');
  css.textContent = `
    .tag[hidden]{display:none!important}
    .side{display:flex;flex-direction:column;gap:0}
    #settingsToggle{width:100%;display:flex;justify-content:space-between;align-items:center;margin:4px 0 9px;padding:10px 12px;border-radius:10px;border:1px solid #375872;background:#132740;color:#dbf5ff;font-weight:700;font-size:12px}
    #settingsToggle:hover,#settingsToggle:focus-visible{border-color:var(--mint);outline:none}
    .config-wrap{overflow:visible}
    .side.is-playing .config-wrap{display:none}
    .side.is-playing .sub{display:none}
    .side.is-playing h1{font-size:23px;margin-bottom:10px}
    .side.is-playing .about{display:none}
    .side.is-playing .divider{margin:17px 0 13px}
    .side.is-playing .progress-section{font-size:12px}
    .side.is-playing .quiz{margin:10px 0 3px}
    .side.is-playing #settingsToggle{margin-bottom:5px}
    .v4-help{font-size:11px;line-height:1.5;color:#aac8df;margin:7px 0 13px}
    .v4-progress{flex:none;height:4px;background:#10263c;overflow:hidden}
    .v4-progress>span{display:block;width:0;height:100%;background:var(--mint);transition:width .2s ease}
    #toast{position:absolute;z-index:8;right:18px;top:16px;max-width:min(380px,calc(100% - 40px));padding:10px 14px;border-radius:10px;border:1px solid #37637c;background:#0e273de8;color:#eaf4ff;box-shadow:0 10px 30px #0005;line-height:1.45;font-size:12px;font-weight:650;pointer-events:none;opacity:0;transform:translateY(-5px);transition:opacity .12s,transform .12s}
    #toast.show{opacity:1;transform:translateY(0)}
    #toast.correct{border-color:#3b947c;color:#adf7da}
    #toast.typo{border-color:#a68b49;color:#ffe9a5}
    #toast.wrong{border-color:#9f5b62;color:#ffd6d3}
    #resetView{position:absolute;z-index:5;bottom:65px;right:18px;background:#0c2037ed;border:1px solid #456480;border-radius:10px;padding:10px 13px;color:#eaf4ff;font-size:12px;font-weight:700}
    #resetView:hover{border-color:var(--mint)}
    .stats{flex-wrap:wrap;gap:12px}
    #timeValue{font-variant-numeric:tabular-nums}
    #recordSummary{font-size:11px;line-height:1.6;color:#b4d5e2;padding-top:5px}
    .v4-mastery{margin-top:9px;display:grid;grid-template-columns:repeat(3,1fr);gap:5px}
    .v4-mastery>div{background:#112840;border:1px solid #2c4765;border-radius:8px;padding:7px 5px;text-align:center;font-size:10px;color:#b9cfe2}
    .v4-mastery b{display:block;color:#effffb;font-size:17px}
    .card{max-width:min(350px,calc(100% - 30px));width:330px;max-height:75%;overflow-y:auto}
    #cardBody p{line-height:1.45}
    .fact-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:9px}
    .fact-grid>div{border:1px solid #294964;border-radius:8px;background:#0b2036;padding:8px}
    .fact-grid small{display:block;color:#94b8d1;font-size:10px;margin-bottom:4px}
    .fact-grid b{font-size:12px}
    .fact-source{font-size:10px!important;color:#9cb9d2;margin-top:11px}
    .fact-source a{color:#91f0dc}
    .result .record-line{margin-top:8px;color:#a7f5e3;font-size:12px;font-weight:700}
    .quiz .feedback{display:none!important}
    @media(max-width:800px){.side.is-playing{padding-bottom:12px}.stage{height:70dvh;min-height:460px}#toast{right:10px;top:12px;font-size:11px}#resetView{right:10px;bottom:57px}.card{bottom:55px}}
    @media(max-width:460px){.stats{gap:9px}#recordSummary{font-size:10px}.v4-mastery{grid-template-columns:repeat(3,1fr)}.card{max-height:60%}}
    @media(prefers-reduced-motion:reduce){#toast,.v4-progress>span{transition:none}}
  `;
  document.head.appendChild(css);
  $('progressBadge')?.remove();
  const badge = document.querySelector('.top .tag');
  badge.id = 'progressBadge';
  badge.setAttribute('aria-live', 'polite');
  badge.title = 'Progress toward mastery in the selected region';

  // Settings remain discoverable; they simply collapse when a session begins.
  const side = document.querySelector('.side');
  const settingsBtn = document.createElement('button');
  settingsBtn.type = 'button';settingsBtn.id = 'settingsToggle';
  settingsBtn.setAttribute('aria-expanded', 'true');
  side.insertBefore(settingsBtn,side.querySelector('.fields'));
  const config = document.createElement('div');config.id = 'setupControls';config.className = 'config-wrap';
  side.insertBefore(config,side.querySelector('.fields'));
  ['.fields','#reviewTypeWrap','#missedSummary','#flagToggleWrap','#speedToggleWrap','#start'].forEach(sel => {
    const el = side.querySelector(sel); if(el) config.appendChild(el);
  });
  const adaptive = document.createElement('label');
  adaptive.className = 'toggle';adaptive.id = 'adaptiveToggleWrap';
  adaptive.innerHTML = `<span>Adaptive review<small>Revisit missed capitals later in a non-speedrun session.</small></span><input type="checkbox" id="adaptiveToggle" aria-label="Repeat missed capitals during practice">`;
  config.insertBefore(adaptive,$('start'));
  $('adaptiveToggle').checked = !!record.settings.adaptive;
  $('adaptiveToggle').addEventListener('change', () => {record.settings.adaptive=$('adaptiveToggle').checked;store();});
  const help = document.createElement('p');help.id='adaptiveHelp';help.className='v4-help';help.textContent='Adaptive practice revisits a missed capital after several other questions. Speedruns keep one question per country.';
  config.insertBefore(help,$('start'));
  const dueOption = document.createElement('option');dueOption.value='adaptive';dueOption.textContent='Adaptive Capital Practice';$('mode').insertBefore(dueOption,$('mode').querySelector('[value="review"]'));
  MODE_DESCRIPTIONS.adaptive='Prioritizes capitals that are due for review, often missed, or not yet learned.';
  const track = document.createElement('div');track.className='v4-progress';track.setAttribute('aria-hidden','true');track.innerHTML='<span id="trackFill"></span>';
  $('challengeStrip').insertAdjacentElement('afterend',track);
  const toast = document.createElement('div');toast.id='toast';toast.setAttribute('role','status');$('globeWrap').appendChild(toast);
  const resetView = document.createElement('button');resetView.id='resetView';resetView.textContent='Reset globe view';resetView.title='Return to the default globe orientation and zoom';$('globeWrap').appendChild(resetView);
  resetView.addEventListener('click',()=>{if(globe)globe.pointOfView(places[states.region]||places.All,600)});
  const stats = document.querySelector('.stats');
  const timeStat = document.createElement('div');timeStat.innerHTML='<span class="lbl">Time</span><strong class="val" id="timeValue">0:00</strong>';
  stats.appendChild(timeStat);
  const masterySummary = document.createElement('div');masterySummary.id='masterySummary';masterySummary.className='v4-mastery';
  $('progress').insertAdjacentElement('afterend',masterySummary);
  const recordsSummary = document.createElement('div');recordsSummary.id='recordSummary';
  masterySummary.insertAdjacentElement('afterend',recordsSummary);
  const formatTime = (ms) => {const n=Math.max(0,Math.floor(ms/1000));return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}${ms<60000?'.'+String(Math.floor(ms%1000/100)):''}`;};
  const modeMastery = (mode, d) => record.mastery[memoryKey(mode,d.country)] || null;
  const isMastered = entry => !!entry && entry.correct >= 3 && entry.streak >= 2 && entry.correct / Math.max(entry.attempts,1) >= 0.75;
  const isDue = entry => !entry || !entry.due || entry.due <= Date.now();
  const getRegion = () => $('region').value;
  const eligibleData = () => DATA.filter(d => getRegion()==='All'||d.region===getRegion());

  function badgeUpdate(){
    const selected=$('mode').value, r=$('region').value, count=eligibleData().length;
    if(selected==='explore'){badge.hidden=true;return}
    badge.hidden=false;
    if(selected==='review'){
      const m=$('reviewType').value, total=record.missed[m].filter(c=>r==='All'||byName[c]?.region===r).length;
      badge.textContent=`${total} ${m==='locate'?'country':'capital'} answers to review`;return;
    }
    const m=selected==='locate'?'locate':'name';
    const mastered=eligibleData().filter(d=>isMastered(modeMastery(m,d))).length;
    badge.textContent=`${mastered}/${count} ${m==='locate'?'countries':'capitals'} mastered`;
  }
  function updateMasterySummary(){
    const subset=eligibleData();
    const entries=subset.map(d=>modeMastery('name',d));
    const mastered=entries.filter(isMastered).length;
    const learning=entries.filter(x=>x?.attempts && !isMastered(x)).length;
    const due=entries.filter(x=>x?.attempts && isDue(x)).length;
    masterySummary.innerHTML=`<div><b>${mastered}</b>Capitals mastered</div><div><b>${learning}</b>Learning</div><div><b>${due}</b>Due for review</div>`;
    const selected = $('mode').value==='adaptive'?'name':$('mode').value==='review' ? $('reviewType').value: $('mode').value;
    const key=`${selected}|${getRegion()}`;
    const pb=record.personalBests[key];
    recordsSummary.textContent=pb?`Personal best (${selected}, ${getRegion()}): ${formatTime(pb.fastest)} · perfect: ${pb.perfect?formatTime(pb.perfect):'not yet'} · best accuracy: ${pb.accuracy}%`:'Speedrun records will appear here after you complete a timed challenge.';
  }
  function updateVisualProgress(){
    const s=states;const length=s.round.length;
    $('trackFill').style.width=length?`${Math.min(100,Math.max(0,100*(s.index+(s.answered?1:0))/length))}%`:'0%';
    badgeUpdate();
  }
  function setExpanded(value){
    expanded=!!value;side.classList.toggle('is-playing',!expanded);
    settingsBtn.setAttribute('aria-expanded',String(expanded));
    settingsBtn.innerHTML=expanded?'Hide settings <span aria-hidden="true">⌃</span>':'Change mode or settings <span aria-hidden="true">⌄</span>';
    window.setTimeout(()=>{if(globe)globe.width($('globe').clientWidth).height($('globe').clientHeight)},40);
  }
  settingsBtn.addEventListener('click',()=>setExpanded(!expanded));setExpanded(true);
  function hideToast(){toast.className='';toast.textContent='';if(toastTimer){clearTimeout(toastTimer);toastTimer=null}}
  function showToast(message,kind,delay){hideToast();toast.textContent=message;toast.className=`show ${kind}`;toastTimer=setTimeout(hideToast,Math.max(800,delay+250));}
  const elapsed = () => elapsedBefore+(timerStart?performance.now()-timerStart:0);
  function stopClock(){if(timerStart){elapsedBefore=elapsed();timerStart=0}if(timerInterval!==null){clearInterval(timerInterval);timerInterval=null}$('timeValue').textContent=formatTime(elapsedBefore)}
  function startClock(){elapsedBefore=0;timerStart=performance.now();if(timerInterval!==null)clearInterval(timerInterval);timerInterval=setInterval(()=>{$('timeValue').textContent=formatTime(elapsed())},100)}

  function recordAnswer(correct){
    const s=states, key=memoryKey(s.mode,s.current.country), now=Date.now();
    const prev=record.mastery[key]||{attempts:0,correct:0,streak:0};
    const row={...prev, attempts:prev.attempts+1, correct:prev.correct+(correct?1:0), streak:correct?(prev.streak||0)+1:0, last:now};
    const stages=[1,3,7,14,30,60];
    row.due=correct?now+stages[Math.min(Math.max(0,row.streak-1),stages.length-1)]*DAY:now;
    record.mastery[key]=row;
  }
  function adaptivePriority(d){
    const m=modeMastery('name',d), overdue=m&&m.due&&m.due<=Date.now();
    const miss=record.missed.name.includes(d.country);
    return (miss?300:0)+(overdue?180:0)+(!m?80:0)+ (m?Math.max(0,90-15*m.streak):0) + Math.random()*20;
  }
  function repeatMiss(s){
    if(!['name','find','locate'].includes(s.mode)||s.review||!record.settings.adaptive||$('speedToggle').checked)return;
    const key=s.current.country;
    if((repeatCount[key]||0)>=1)return;
    repeatCount[key]=(repeatCount[key]||0)+1;
    const at=Math.min(s.round.length,s.index+4);
    s.round.splice(at,0,s.current);
  }

  // Wrapping V3's event logic preserves its scoring, feedback, country selection and maps.
  store = function(){original.store();badgeUpdate();updateMasterySummary()};
  switchMode = function(){original.switchMode();$('flagToggleWrap').classList.toggle('hidden',$('mode').value!=='find'&&!( $('mode').value==='review'&&$('reviewType').value==='find'));badgeUpdate();updateMasterySummary()};
  updateStats = function(){original.updateStats();updateVisualProgress()};
  ask = function(){hideToast();original.ask();updateVisualProgress()};
  start = function(){
    stopClock();hideToast();repeatCount={};
    const adaptiveMode=$('mode').value==='adaptive';
    if(adaptiveMode){
      $('mode').value='name'; original.start(); $('mode').value='adaptive';
      const s=states;
      if(s.round.length){s.round=s.round.filter(d=>isDue(modeMastery('name',d)) || !isMastered(modeMastery('name',d)));s.round.sort((a,b)=>adaptivePriority(b)-adaptivePriority(a));s.index=0;if(s.round.length){ask();$('qLabel').textContent=`Adaptive Capital Practice · ${s.region==='All'?'World':s.region}`}else{$('qLabel').textContent='Adaptive Capital Practice';$('qTitle').textContent='All caught up';$('qSub').textContent='Your learned capitals are not due for review yet.';s.finished=true;$('quiz').classList.add('hidden')}}
    }else original.start();
    if(states.mode==='explore'&&globe){const dense=new Set(['Andorra','Monaco','Vatican City','San Marino','Liechtenstein','Luxembourg','Singapore']);globe.pointRadius(d=>dense.has(d.country)?.13:(d.region==='Oceania'?.34:.25))}
    if(!states.finished&&states.round.length){startClock();setExpanded(false)}
    else {setExpanded(true);$('timeValue').textContent='0:00'}
    badgeUpdate();updateMasterySummary();updateVisualProgress();
  };
  finish = function(correct,message,selected=null,opts={}){
    if(states.answered||states.finished||!states.current)return;
    const s=states;
    if(!correct)repeatMiss(s);
    recordAnswer(correct);
    original.finish(correct,message,selected,opts);
    // V3 keeps a fuller description above the globe. A compact notification replaces sidebar feedback.
    const kind=opts.typo?'typo':correct?'correct':'wrong';
    const delay=opts.typo?1500:correct?300:2000;
    showToast(message,kind,delay);
    if($('speedToggle').checked){updateNextControls(delay)}
    store();updateVisualProgress();
  };
  complete = function(){
    stopClock();original.complete();
    const s=states;if(!$('speedToggle').checked){badgeUpdate();return}
    const key=`${s.mode}|${s.region}`;const old=record.personalBests[key]||{};
    const percent=Math.round(s.correct/s.round.length*100);const ms=Math.round(elapsedBefore);
    const pb={...old,fastest:Math.min(old.fastest||Infinity,ms),perfect:percent===100?Math.min(old.perfect||Infinity,ms):(old.perfect||null),accuracy:Math.max(old.accuracy||0,percent)};
    record.personalBests[key]=pb;store();
    $('result').innerHTML+=`<div class="record-line">Time: ${formatTime(ms)} · Fastest: ${formatTime(pb.fastest)}${percent===100?' · Perfect run!':''}</div>`;
  };
  tinyMarkers = function(){original.tinyMarkers();if(!globe)return;
    const crowded=new Set(['Andorra','Monaco','Vatican City','San Marino','Liechtenstein','Luxembourg','Singapore']);
    globe.pointRadius(d=>crowded.has(d.country)?.13:(d.region==='Oceania'?.34:.25));
  };
  showCountry = function(country){
    original.showCountry(country);
    const d=byName[country];if(!d)return;
    const id=++studyRequest;
    $('cardBody').innerHTML=`<p><span style="font-size:25px">${flagEmoji(d.iso2)}</span> <b>Capital:</b> ${safe(d.capital)}</p><p><b>Region:</b> ${safe(d.region)}</p>${d.note?`<p>${safe(d.note)}</p>`:''}<p class="fact-source">Loading additional country facts…</p>`;
    const factResult = (item) => {
      if(id!==studyRequest || states.mode!=='explore')return;
      const pop=typeof item.population==='number'?new Intl.NumberFormat('en-US').format(item.population):'Unavailable';
      const area=typeof item.area==='number'?`${new Intl.NumberFormat('en-US').format(item.area)} km²`:'Unavailable';
      const languages=item.languages?Object.values(item.languages).slice(0,5).join(', '):'Unavailable';
      const currencies=item.currencies?Object.values(item.currencies).map(x=>x.name).slice(0,3).join(', '):'Unavailable';
      $('cardBody').innerHTML=`<p><span style="font-size:25px">${flagEmoji(d.iso2)}</span> <b>Capital:</b> ${safe(d.capital)}</p><p><b>Region:</b> ${safe(d.region)}</p>${d.note?`<p>${safe(d.note)}</p>`:''}<div class="fact-grid"><div><small>Population (estimate)</small><b>${safe(pop)}</b></div><div><small>Area</small><b>${safe(area)}</b></div><div><small>Languages</small><b>${safe(languages)}</b></div><div><small>Currencies</small><b>${safe(currencies)}</b></div></div><p class="fact-source">Supplementary data: <a href="https://restcountries.com" target="_blank" rel="noopener noreferrer">REST Countries</a>; retrieved ${new Date().toLocaleDateString('en-US')}. Figures may not reflect the latest census.</p>`;
    };
    if(atlasDataCache.has(d.iso2)){factResult(atlasDataCache.get(d.iso2));return}
    fetch(`https://restcountries.com/v3.1/alpha/${encodeURIComponent(d.iso2)}?fields=population,area,languages,currencies`,{signal:AbortSignal.timeout?AbortSignal.timeout(7000):undefined})
      .then(r=>{if(!r.ok)throw new Error('Facts unavailable');return r.json()})
      .then(data=>{const item=Array.isArray(data)?data[0]:data;atlasDataCache.set(d.iso2,item);factResult(item)})
      .catch(()=>{if(id===studyRequest&&states.mode==='explore')$('cardBody').querySelector('.fact-source').textContent='Supplementary facts are currently unavailable. Capital and region information remain accessible offline.'});
  };

  $('mode').addEventListener('change',()=>{badgeUpdate();updateMasterySummary()});
  $('region').addEventListener('change',()=>{badgeUpdate();updateMasterySummary()});
  $('reviewType').addEventListener('change',()=>{badgeUpdate();updateMasterySummary()});
  $('speedToggle').addEventListener('change',()=>{if(states.answered&&!states.finished){updateNextControls(300)}store()});
  $('reset').onclick = () => {
    if(confirm('Clear scores, missed answers, country mastery, review schedules, and personal records stored in this browser?')){
      record={correct:0,best:0,completed:0,missed:{name:[],find:[],locate:[]},speedrun:$('speedToggle').checked,mastery:{},personalBests:{},settings:{adaptive:$('adaptiveToggle').checked}};
      store();
    }
  };
  $('start').onclick=start;
  // The original submit/next/reveal handlers call global function declarations, now wrapped above.
  $('submit').onclick=checkName;
  $('next').onclick=next;
  $('mobileNext').onclick=next;
  $('closeCard').addEventListener('click',()=>{studyRequest++});
  // A hard reset of the orientation is available, but no automatic re-centering between questions.
  $('challengeStrip').title='Quiz prompts remain visible while the globe keeps your chosen orientation.';
  switchMode();store();updateVisualProgress();
  document.documentElement.dataset.atlasVersion=VERSION;
})();