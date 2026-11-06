/* Atlas Quest Global Intelligence — a separately navigable, source-attributed workspace.
 * Political organization lists are snapshots, not a live foreign-policy assessment.
 * World Bank economic indicators are fetched live and labeled by their reporting years.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number = new Intl.NumberFormat('en-US',{maximumFractionDigits:0});
  const money = v => v == null ? 'Unavailable' : Math.abs(v)>=1e12?'$'+(v/1e12).toFixed(2)+'T':Math.abs(v)>=1e9?'$'+(v/1e9).toFixed(2)+'B':Math.abs(v)>=1e6?'$'+(v/1e6).toFixed(1)+'M':'$'+number.format(v);
  const abbreviate = v => v == null ? 'No data' : Math.abs(v)>=1e12?(v/1e12).toFixed(1)+'T':Math.abs(v)>=1e9?(v/1e9).toFixed(1)+'B':Math.abs(v)>=1e6?(v/1e6).toFixed(1)+'M':number.format(v);
  const SOURCE_YEAR = 'November 2026';
  const S = {
    nato:{name:'NATO',source:'https://www.nato.int/en/about-us/organization/nato-member-countries',detail:'32 member states',members:'ALB BEL BGR CAN HRV CZE DNK EST FIN FRA DEU GRC HUN ISL ITA LVA LTU LUX MNE NLD MKD NOR POL PRT ROU SVK SVN ESP SWE TUR GBR USA'},
    eu:{name:'European Union',source:'https://european-union.europa.eu/principles-countries-history/eu-countries_en',detail:'27 member states',members:'AUT BEL BGR HRV CYP CZE DNK EST FIN FRA DEU GRC HUN IRL ITA LVA LTU LUX MLT NLD POL PRT ROU SVK SVN ESP SWE'},
    asean:{name:'ASEAN',source:'https://asean.org/member-states/',detail:'11 member states, including Timor-Leste',members:'BRN KHM IDN LAO MYS MMR PHL SGP THA VNM TLS'},
    g7:{name:'G7',source:'https://www.g7germany.de/g7-en',detail:'7 member countries',members:'CAN FRA DEU ITA JPN GBR USA'},
    g20:{name:'G20',source:'https://www.g20.org/',detail:'19 country members; EU and African Union are also members',members:'ARG AUS BRA CAN CHN FRA DEU IND IDN ITA JPN MEX RUS SAU ZAF KOR TUR GBR USA'},
    brics:{name:'BRICS',source:'https://brics.br/en/about-the-brics',detail:'11 countries in the BRICS presidency list; membership classifications can differ by source',members:'BRA RUS IND CHN ZAF EGY ETH IDN IRN SAU ARE'},
    au:{name:'African Union',source:'https://au.int/en/member_states/countryprofiles2',detail:'African Union has 55 members, including Western Sahara/SADR; only 54 are within this game’s 195-country dataset',members:''}
  };
  const WB = {
    gdp:{name:'GDP',indicator:'NY.GDP.MKTP.CD',fmt:money,desc:'GDP, current US dollars',source:'https://data.worldbank.org/indicator/NY.GDP.MKTP.CD'},
    gdppc:{name:'GDP per capita',indicator:'NY.GDP.PCAP.CD',fmt:money,desc:'GDP per person, current US dollars',source:'https://data.worldbank.org/indicator/NY.GDP.PCAP.CD'},
    growth:{name:'GDP growth',indicator:'NY.GDP.MKTP.KD.ZG',fmt:v=>v==null?'No data':v.toFixed(1)+'%',desc:'Annual GDP growth (%)',source:'https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG'},
    population:{name:'Population',indicator:'SP.POP.TOTL',fmt:v=>v==null?'No data':number.format(v),desc:'Total population',source:'https://data.worldbank.org/indicator/SP.POP.TOTL'},
    exports:{name:'Exports',indicator:'NE.EXP.GNFS.CD',fmt:money,desc:'Exports of goods and services, current US dollars',source:'https://data.worldbank.org/indicator/NE.EXP.GNFS.CD'},
    imports:{name:'Imports',indicator:'NE.IMP.GNFS.CD',fmt:money,desc:'Imports of goods and services, current US dollars',source:'https://data.worldbank.org/indicator/NE.IMP.GNFS.CD'},
    military:{name:'Military expenditure',indicator:'MS.MIL.XPND.GD.ZS',fmt:v=>v==null?'No data':v.toFixed(2)+'%',desc:'Military expenditure (% of GDP)',source:'https://data.worldbank.org/indicator/MS.MIL.XPND.GD.ZS'},
    inequality:{name:'Gini index',indicator:'SI.POV.GINI',fmt:v=>v==null?'No data':v.toFixed(1),desc:'Gini index, higher means greater income inequality',source:'https://data.worldbank.org/indicator/SI.POV.GINI'},
    energy:{name:'Net energy imports',indicator:'EG.IMP.CONS.ZS',fmt:v=>v==null?'No data':v.toFixed(1)+'%',desc:'Net energy imports (% of energy use); negative means net exporter',source:'https://data.worldbank.org/indicator/EG.IMP.CONS.ZS'}
  };
  const mapLayers = [['plain','Countries — no overlay'],...Object.keys(S).map(k=>['org:'+k,'Organization: '+S[k].name]),...Object.keys(WB).map(k=>['wb:'+k,WB[k].name])];
  const sourceLink = (url,title) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(title)} ↗</a>`;
  const iso3 = country => String(country?.iso3 || '').toUpperCase();
  const orgMember = (key,country) => key==='au' ? country.region==='Africa' : S[key].members.split(' ').includes(iso3(country));
  let currentSection='capitals',currentView='profile',currentLayer='plain',selected=null,pendingToken=0;
  let wbCache=new Map(),wbPending=new Map(),geoPaint=paint;
  let visibleWB=null;
  const side=document.querySelector('.side');
  const controls=document.createElement('section');controls.id='intelControls';controls.hidden=true;
  controls.innerHTML=`<div class="intel-kicker">GLOBAL INTELLIGENCE</div>
    <h2>World intelligence</h2><p class="intel-intro">Explore geopolitical relationships and economic indicators. Select a country or compare global patterns.</p>
    <label class="intel-lbl" for="intelView">View</label><select id="intelView"><option value="profile">Country view</option><option value="map">Global map view</option></select>
    <div id="intelProfileSettings"><label class="intel-lbl" for="intelCountry">Select a country</label><select id="intelCountry"></select>
      <label class="intel-lbl" for="intelTopic">Profile topic</label><select id="intelTopic"><option value="overview">Overview</option><option value="politics">Geopolitics & relations</option><option value="economy">Economics & trade</option><option value="security">Security & conflicts</option></select></div>
    <div id="intelMapSettings" hidden><label class="intel-lbl" for="intelLayer">Map layer</label><select id="intelLayer"></select>
      <div id="intelLegend" class="intel-legend">Choose a layer to color the countries on the globe.</div></div>
    <p class="intel-caveat">Data includes different reporting years. Live indicators may be unavailable for some countries; blank areas do not mean zero. Sources are shown with each statistic.</p>`;
  side.insertBefore(controls,$('setupControls'));
  $('intelCountry').innerHTML='<option value="">Select a country…</option>'+DATA.map(d=>`<option value="${esc(d.country)}">${esc(d.country)}</option>`).join('');
  $('intelLayer').innerHTML=mapLayers.map(([id,name])=>`<option value="${esc(id)}">${esc(name)}</option>`).join('');
  const panel=document.createElement('section');panel.id='intelPanel';panel.hidden=true;
  panel.innerHTML=`<div class="intel-panel-head"><div><small>COUNTRY INTELLIGENCE</small><h3 id="intelTitle">Select a country</h3></div><button type="button" id="intelClose" aria-label="Close intelligence panel">×</button></div><div id="intelPanelBody">Click a country on the globe, or choose one from the menu, to view its profile.</div>`;
  $('globeWrap').append(panel);
  const css=document.createElement('style');css.textContent=`
   #intelControls[hidden],#intelPanel[hidden],#intelMapSettings[hidden],#intelProfileSettings[hidden]{display:none!important}
   .side[data-section="intelligence"] .sub,.side[data-section="intelligence"] .progress-section,.side[data-section="intelligence"] .divider,.side[data-section="intelligence"] .about,.side[data-section="intelligence"] #settingsToggle,.side[data-section="intelligence"] .quiz{display:none!important}
   .side[data-section="intelligence"] h1{display:none}
   .side[data-section="intelligence"] #intelControls{display:block}
   .intel-kicker{color:#71ebd5;letter-spacing:1.5px;font-size:10px;font-weight:850;margin:15px 0 8px}
   #intelControls h2{font-size:24px;margin:0 0 10px;color:#f4faff;line-height:1.2}
   .intel-intro,.intel-caveat{font-size:12px;color:#afc7db;line-height:1.55;margin:0 0 18px}
   .intel-lbl{display:block;margin:14px 0 7px;letter-spacing:1.3px;font-size:10px;color:#bce4e9;font-weight:800;text-transform:uppercase}
   #intelControls select{width:100%;background:#071425;color:#eaf4ff;border:1px solid #395777;border-radius:9px;padding:11px;font-size:12px}
   #intelControls select:focus-visible{outline:2px solid #66e5c9}
   .intel-legend{border:1px solid #2e4963;background:#0b243c;padding:12px;border-radius:11px;margin:15px 0 18px;font-size:11px;color:#c0d6ea;line-height:1.6}
   .intel-swatches{height:12px;background:linear-gradient(90deg,#1d3957,#327c8f,#57dcc2);border-radius:5px;margin:10px 0 5px}
   .intel-pair{display:flex;align-items:center;gap:8px;margin:6px 0}.intel-dot{height:11px;width:11px;border-radius:3px;background:#52cfb8;display:inline-block}.intel-dot.no{background:#253342}
   #intelPanel{position:absolute;z-index:7;top:14px;right:17px;bottom:15px;width:min(350px,48%);border:1px solid #35536d;background:rgba(8,22,39,.97);border-radius:14px;box-shadow:0 12px 38px #0007;overflow:auto;padding:18px 17px;color:#e9f5ff}
   .intel-panel-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px;border-bottom:1px solid #2f4c62;padding-bottom:14px}
   .intel-panel-head h3{font-size:22px;margin:3px 0;line-height:1.2}.intel-panel-head small{font-size:10px;letter-spacing:1.4px;color:#74ead4;font-weight:800}
   #intelClose{background:transparent;border:1px solid #43647f;color:#c7e0ea;border-radius:9px;font-size:21px;min-width:31px;height:30px}
   #intelPanelBody{font-size:12px;line-height:1.6}#intelPanelBody a{color:#8deee0}
   .intel-country-lead{margin:2px 0 14px;color:#b0c9e2}
   .intel-section{border-top:1px solid #25465e;padding:13px 0 3px}.intel-section h4{font-size:12px;letter-spacing:.3px;color:#dffaf9;margin:0 0 8px}
   .intel-metrics{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:9px 0}
   .intel-metric{border:1px solid #2e5067;background:#0c2942;padding:9px;border-radius:9px;min-width:0}
   .intel-metric small{display:block;font-size:10px;color:#b0c7de}.intel-metric strong{font-size:15px;display:block;margin-top:3px;overflow-wrap:anywhere}
   .intel-metric em{font-size:10px;color:#b2c2d2;font-style:normal}
   .intel-links{display:grid;gap:6px;margin:9px 0}.intel-links a{display:block;padding:6px 8px;background:#102b43;border:1px solid #2c4c60;border-radius:7px}
   .intel-chip{display:inline-block;padding:3px 7px;margin:3px;border:1px solid #45716a;border-radius:20px;background:#173e43;color:#beffef;font-size:11px}
   .intel-warning{border-left:3px solid #d4b271;background:#2b2a2a;padding:9px;margin:10px 0;color:#e1d9c5;font-size:11px}
   .intel-source{display:block;font-size:10px;color:#acc2d9;margin-top:9px}
   .stage.intel-active .stage-overlay,.stage.intel-active #resetView,.stage.intel-active #toast,.stage.intel-active #exploreCard{display:none!important}
   @media(max-width:800px){#intelPanel{top:auto;left:10px;right:10px;bottom:13px;width:auto;max-height:51%;border-radius:12px}.side[data-section="intelligence"]{padding-bottom:10px}.stage.intel-active{min-height:560px}}
   @media(max-width:460px){#intelPanel{max-height:52%;padding:13px}.intel-panel-head h3{font-size:18px}.intel-metric strong{font-size:13px}}
  `;document.head.append(css);
  const linkWorldBank = code => 'https://data.worldbank.org/country/'+encodeURIComponent(code);
  const linkComtrade = 'https://comtradeplus.un.org/';
  const orgTags = d => Object.entries(S).filter(([key])=>orgMember(key,d)).map(([,item])=>`<span class="intel-chip">${esc(item.name)}</span>`).join('') || 'No membership in these selected organizations';
  const urls = {
    leaders:'https://www.cia.gov/resources/world-leaders/',
    ucdp:'https://ucdp.uu.se/downloads/',
    sanctions:'https://ofac.treasury.gov/sanctions-programs-and-country-information',
    euSanctions:'https://www.consilium.europa.eu/en/policies/sanctions/',
    disputes:'https://www.icj-cij.org/cases',
    trade:'https://comtradeplus.un.org/',
    wits:'https://wits.worldbank.org/trade-visualization.aspx',
    energy:'https://www.iea.org/data-and-statistics',
    resources:'https://pubs.usgs.gov/periodicals/mcs2026/mcs2026.pdf',
    naval:'https://unctad.org/topic/transport-and-trade-logistics',
    partners:'https://comtradeplus.un.org/'
  };
  function sourceBlock(items){return `<div class="intel-links">${items.map(([url,name])=>sourceLink(url,name)).join('')}</div>`}
  const wbMeta = (key,row) => `<div class="intel-metric"><small>${esc(WB[key].name)}</small><strong>${esc(WB[key].fmt(row?.value))}</strong><em>${row?.year?'Year '+row.year:'Data unavailable'}</em></div>`;
  const wbCacheKey=(country,metric)=>country+'|'+metric;
  async function requestJSON(url){
    const res=await fetch(url,{signal:AbortSignal.timeout?AbortSignal.timeout(11500):undefined});
    if(!res.ok)throw Error('Data source unavailable');return res.json();
  }
  async function readWB(iso, key){
    const ident=wbCacheKey(iso,key);if(wbCache.has(ident))return wbCache.get(ident);
    if(wbPending.has(ident))return wbPending.get(ident);
    const url=`https://api.worldbank.org/v2/country/${encodeURIComponent(iso)}/indicator/${WB[key].indicator}?format=json&mrnev=1&per_page=2`;
    const pending=requestJSON(url).then(json=>{
      const item=Array.isArray(json?.[1])?json[1].find(x=>typeof x.value==='number'):undefined;
      const result=item?{value:item.value,year:item.date}:null;wbCache.set(ident,result);return result;
    }).catch(()=>null).finally(()=>wbPending.delete(ident));wbPending.set(ident,pending);return pending;
  }
  async function readLayer(key){
    const ident='all|'+key;if(wbCache.has(ident))return wbCache.get(ident);
    if(wbPending.has(ident))return wbPending.get(ident);
    const url=`https://api.worldbank.org/v2/country/all/indicator/${WB[key].indicator}?format=json&mrnev=1&per_page=500`;
    const pending=requestJSON(url).then(json=>{
      const map=new Map();for(const row of json?.[1]||[]){
        if(typeof row.value==='number'&&row.countryiso3code&&(!map.has(row.countryiso3code)||+row.date>+map.get(row.countryiso3code).year))
          map.set(row.countryiso3code,{value:row.value,year:row.date});
      }
      wbCache.set(ident,map);return map;
    }).catch(()=>new Map()).finally(()=>wbPending.delete(ident));wbPending.set(ident,pending);return pending;
  }
  function updateLegend(){
    const el=$('intelLegend');if(currentLayer==='plain'){el.innerHTML='No data layer selected. All countries are available to explore.';return}
    if(currentLayer.startsWith('org:')){
      const key=currentLayer.slice(4),o=S[key];const count=DATA.filter(d=>orgMember(key,d)).length;
      el.innerHTML=`<b>${esc(o.name)}</b><div class="intel-pair"><span class="intel-dot"></span>${count} study-set countries highlighted</div><div class="intel-pair"><span class="intel-dot no"></span>Not highlighted</div><small>${esc(o.detail)} · Reference: ${esc(SOURCE_YEAR)}</small><br>${sourceLink(o.source,'Official source')}`;
      return;
    }
    const key=currentLayer.slice(3);const layer=WB[key];
    const rows=visibleWB?Array.from(visibleWB.values()).map(x=>x.value).filter(Number.isFinite):[];
    if(!rows.length){el.innerHTML=`<b>${esc(layer.name)}</b><p>Loading data… or no data available.</p>${sourceLink(layer.source,'World Bank series')}`;return}
    const min=Math.min(...rows),max=Math.max(...rows);
    el.innerHTML=`<b>${esc(layer.desc)}</b><div class="intel-swatches"></div><div style="display:flex;justify-content:space-between"><span>${esc(layer.fmt(min))}</span><span>${esc(layer.fmt(max))}</span></div><p>Data is the latest reported year per country, which may differ between countries. Gray means no data.</p>${sourceLink(layer.source,'World Bank series')}`;
  }
  function layerColor(f){
    const d=byName[f.properties.country];if(!d)return 'rgba(30,39,55,.84)';
    if(currentLayer.startsWith('org:'))return orgMember(currentLayer.slice(4),d)?'rgba(56,205,173,.72)':'rgba(29,44,61,.85)';
    if(currentLayer.startsWith('wb:')){
      const val=visibleWB?.get(iso3(d))?.value;if(!Number.isFinite(val))return 'rgba(29,41,55,.83)';
      const all=Array.from(visibleWB.values()).map(r=>r.value).filter(Number.isFinite);if(!all.length)return 'rgba(29,41,55,.83)';
      let min=Math.min(...all),max=Math.max(...all);
      // Logarithmic shading helps make wide-ranging GDP/population totals legible.
      let v=val;if(min>=0&&max/min>100){v=Math.log1p(v);min=Math.log1p(min);max=Math.log1p(max)}
      const t=max===min?.5:Math.max(0,Math.min(1,(v-min)/(max-min)));
      const r=Math.round(29+t*62),g=Math.round(57+t*158),b=Math.round(85+t*115);
      return `rgba(${r},${g},${b},.83)`;
    }
    if(selected?.country===d.country)return 'rgba(75,203,181,.65)';
    if(hovered===f)return 'rgba(89,159,191,.43)';
    return 'rgba(37,87,125,.24)';
  }
  function renderLayer(){
    if(!globe)return;
    globe.polygonCapColor(layerColor)
     .polygonStrokeColor(()=>currentLayer==='plain'?'#92b7ce':'#7c9aab')
     .polygonSideColor(()=>'rgba(25,63,90,.15)')
     .polygonAltitude(()=>.007);
  }
  paint=function(){if(currentSection==='intelligence')renderLayer();else geoPaint();};
  async function changeLayer(){
    currentLayer=$('intelLayer').value;visibleWB=null;pendingToken++;const token=pendingToken;
    if(currentLayer.startsWith('wb:')){
      updateLegend();renderLayer();
      visibleWB=await readLayer(currentLayer.slice(3));
      if(token!==pendingToken||currentSection!=='intelligence')return;
    }
    updateLegend();renderLayer();
  }
  function showPanel(d){
    if(!d)return;
    selected=d;panel.hidden=false;$('intelTitle').textContent=d.country;$('intelCountry').value=d.country;
    renderTopic();renderLayer();
  }
  function metricLinks(){return sourceBlock([[urls.trade,'UN Comtrade: top products & trading partners'],[urls.wits,'WITS: trade visualization']]);}
  function renderTopic(){
    if(!selected)return;const d=selected, t=$('intelTopic').value, token=++pendingToken;
    const lead=`<p class="intel-country-lead"><span style="font-size:22px">${flagEmoji(d.iso2)}</span> ${esc(d.capital)} · ${esc(d.region)}</p>`;
    if(t==='overview'){
      $('intelPanelBody').innerHTML=lead+`<div class="intel-section"><h4>International organizations & alliances</h4>${orgTags(d)}<p>Verified organization snapshots, ${SOURCE_YEAR}. Membership does not imply identical positions on every policy.</p></div><div class="intel-section"><h4>Economic overview</h4><div id="intelMetricLoad">Loading World Bank indicators…</div></div>`;
      addMetrics(['gdp','gdppc','population','growth'],token);return;
    }
    if(t==='politics'){
      $('intelPanelBody').innerHTML=lead+`<div class="intel-section"><h4>International organizations & alliances</h4>${orgTags(d)}</div><div class="intel-section"><h4>Government & diplomacy</h4><p>Political systems, officeholders, and diplomatic relationships can change. Use these current directories rather than an unverified static classification.</p>${sourceBlock([[urls.leaders,'CIA World Leaders: cabinet and leaders'],['https://www.un.org/en/about-us/member-states','United Nations member-state directory']])}</div><div class="intel-section"><h4>Territorial disputes & sanctions</h4><p>Territorial claims and sanctions involve different jurisdictions and legal interpretations. These links are sources, <b>not an assertion</b> that this country is under sanctions or is involved in a dispute.</p>${sourceBlock([[urls.disputes,'International Court of Justice cases'],[urls.sanctions,'U.S. Treasury OFAC sanctions programs'],[urls.euSanctions,'EU sanctions and restrictive measures']])}</div>`;
      return;
    }
    if(t==='economy'){
      $('intelPanelBody').innerHTML=lead+`<div class="intel-section"><h4>Economy & international trade</h4><div id="intelMetricLoad">Loading latest World Bank indicators…</div><p>Exports/imports here mean <b>goods and services in total</b>, not the largest individual products.</p>${metricLinks()}</div><div class="intel-section"><h4>Natural resources, energy & transport</h4><p>Resource reserves, production, energy import dependence, and major maritime routes should be interpreted from dated sector datasets.</p>${sourceBlock([[urls.resources,'USGS Mineral Commodity Summaries (2026)'],[urls.energy,'IEA energy statistics'],[urls.naval,'UNCTAD maritime trade & transport']])}</div>`;
      addMetrics(['gdp','gdppc','exports','imports','inequality','energy'],token);return;
    }
    $('intelPanelBody').innerHTML=lead+`<div class="intel-section"><h4>Security & conflict research</h4><p>Atlas Quest does not presently maintain a verified live conflict or sanctions status for every country. The sources below provide dated, documented records; a missing marker is not proof of peace.</p>${sourceBlock([[urls.ucdp,'UCDP armed conflict data'],[urls.sanctions,'OFAC sanctions programs'],[urls.euSanctions,'European Union sanctions'],[urls.disputes,'International Court of Justice']])}</div><div class="intel-section"><h4>Defense expenditure</h4><div id="intelMetricLoad">Loading World Bank / SIPRI series…</div><p>Military expenditure is measured as a percentage of GDP, not the size of an arsenal.</p></div>`;
    addMetrics(['military'],token);
  }
  async function addMetrics(keys,token){
    const iso=iso3(selected);const result=await Promise.all(keys.map(k=>readWB(iso,k)));
    if(token!==pendingToken||currentSection!=='intelligence')return;
    const el=$('intelMetricLoad');if(!el)return;
    el.innerHTML=`<div class="intel-metrics">${keys.map((k,i)=>wbMeta(k,result[i])).join('')}</div><span class="intel-source">World Bank Open Data, latest available observation per indicator (see years above). ${sourceLink(linkWorldBank(iso),'Country dataset')}</span>`;
  }
  function refreshView(){
    currentView=$('intelView').value;
    $('intelProfileSettings').hidden=currentView!=='profile';$('intelMapSettings').hidden=currentView!=='map';
    if(currentView==='profile'){$('intelLayer').value='plain';currentLayer='plain';visibleWB=null;updateLegend();renderLayer();if(selected)showPanel(selected);}
    else{panel.hidden=true;changeLayer();}
  }
  $('intelView').addEventListener('change',refreshView);
  $('intelTopic').addEventListener('change',renderTopic);
  $('intelCountry').addEventListener('change',()=>{const d=byName[$('intelCountry').value];if(!d)return;
    if(globe)globe.pointOfView({lat:d.lat,lng:d.lng,altitude:1.55},650);showPanel(d);
  });
  $('intelLayer').addEventListener('change',changeLayer);
  $('intelClose').addEventListener('click',()=>{selected=null;panel.hidden=true;renderLayer()});
  const priorShowCountry=showCountry;
  showCountry=function(country){
    if(currentSection!=='intelligence')return priorShowCountry(country);
    const d=byName[country];if(!d)return;
    showPanel(d);
  };
  window.addEventListener('atlas:section',e=>{
    currentSection=e.detail.section;
    const active=currentSection==='intelligence';controls.hidden=!active;panel.hidden=true;
    document.querySelector('.stage').classList.toggle('intel-active',active);
    if(!active){pendingToken++;selected=null;visibleWB=null;currentLayer='plain';geoPaint();return;}
    $('qLabel').textContent='GLOBAL INTELLIGENCE';$('qTitle').textContent='Explore international relations and global trade';
    $('qSub').textContent='Click a country, or choose a map layer to explore global patterns.';
    currentView='profile';$('intelView').value='profile';$('intelTopic').value='overview';currentLayer='plain';$('intelLayer').value='plain';
    refreshView();
    // Selection in intelligence mode is never constrained by geography practice regions.
    states.region='All';if(globe)globe.pointOfView(places.All,450);
  });
  updateLegend();
})();
