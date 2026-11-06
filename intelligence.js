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
  const INTEL_REVIEW_DATE='November 6, 2026';
  // Curated reference briefings, NOT a comprehensive database or a live feed.
  const BRIEF={"conflict":{"Russia":[{"id":"ru-uk","title":"Russia–Ukraine war","type":"Interstate war","since":"2014; full-scale Russian invasion from February 24, 2022","actors":"Russian and Ukrainian armed forces","where":"Fighting concentrated in Ukraine, with strikes and other attacks affecting both countries.","summary":"Russia launched a full-scale invasion of Ukraine in 2022 after conflict beginning in 2014. UN monitors continue to document civilian harm in Ukraine; ceasefire diplomacy has not ended the war.","impact":"The war has caused civilian deaths, displacement, infrastructure damage and international security repercussions.","sources":[["UN civilian protection report, September 2026","https://ukraine.un.org/en/324561-protection-civilians-armed-conflict-%E2%80%94-september-2026"],["UN conflict data","https://ucdp.uu.se/downloads/"]]}],"Ukraine":[{"id":"ru-uk","title":"Russia–Ukraine war","type":"Interstate war","since":"2014; full-scale invasion from February 24, 2022","actors":"Russian and Ukrainian armed forces","where":"Front lines and attacks across Ukraine; some cross-border strikes.","summary":"Russia's invasion violates Ukraine's territorial sovereignty. Fighting and strikes have continued during 2026 alongside international mediation efforts.","impact":"Civilian casualties, displacement and energy-infrastructure damage are documented by UN monitors.","sources":[["UN civilian protection report, September 2026","https://ukraine.un.org/en/324561-protection-civilians-armed-conflict-%E2%80%94-september-2026"],["UN Ukraine country reports","https://ukraine.un.org/"]]}],"Mexico":[{"id":"mx-organized","title":"Organized criminal and cartel-related violence","type":"Organized criminal violence","since":"Intensified security campaign from 2006; dynamics have changed repeatedly","actors":"Mexican authorities and multiple criminal groups, including factions associated with the Sinaloa Cartel and CJNG","where":"Unevenly distributed across Mexican states; not a single nationwide front line.","summary":"Cartel competition, trafficking networks, and government operations contribute to attacks, coercion, and insecurity. These events should not automatically be classified as interstate war or a single unified civil war.","impact":"Displacement, disappearances and violence against communities have been documented; conditions vary markedly by region.","sources":[["ACLED Mexico monitoring","https://acleddata.com/country/mexico"],["CFR conflict background","https://www.cfr.org/global-conflict-tracker/conflict/criminal-violence-mexico"],["Reuters, September 2026","https://www.reuters.com/world/americas/bomb-attacks-by-mexican-gangs-rise-officials-say-2026-09-01/"]]}],"Sudan":[{"id":"sudan-2023","title":"Sudan civil war","type":"Civil war","since":"April 15, 2023","actors":"Sudanese Armed Forces (SAF), Rapid Support Forces (RSF), and allied forces","where":"Multiple regions of Sudan, especially Darfur and Kordofan, with front lines shifting.","summary":"The SAF and RSF have fought for control since 2023. International investigations document severe abuses and an ongoing humanitarian emergency.","impact":"Large-scale displacement, food insecurity and grave harm to civilians.","sources":[["United Nations Sudan background","https://www.un.org/en/node/227412"],["UN country response, April 2026","https://sudan.un.org/en/313793-three-years-too-long-people-sudan-need-peace"],["CFR, November 2026","https://www.cfr.org/global-conflict-tracker/conflict/power-struggle-sudan"]]}],"Myanmar":[{"id":"myanmar-2021","title":"Myanmar post-coup armed conflict","type":"Civil war and insurgencies","since":"Escalated after the February 2021 military coup","actors":"Myanmar military and multiple ethnic armed organizations and anti-military resistance groups","where":"Fighting across several states and regions; changing territorial control.","summary":"Armed resistance and military operations continue following the 2021 coup. Numerous groups are involved; this is not a single two-party conflict.","impact":"Displacement, restrictions on humanitarian access and civilian harm.","sources":[["UN humanitarian update, July 2026","https://myanmar.un.org/en/319232-myanmar-humanitarian-update-no-52"],["ACLED assessment, 2026","https://acleddata.com/report/myanmar-outlook-fighting-set-intensify-center-country"]]}]},"sanctions":{"Russia":[{"issuer":"United States — OFAC","scope":"Financial, trade, sectoral and targeted restrictions under multiple Russia-related authorities.","why":"Responses to Russia's actions in Ukraine and other specified conduct.","sources":[["OFAC Russia-related programs","https://ofac.treasury.gov/sanctions-programs-and-country-information/russia-related-sanctions"]]},{"issuer":"European Union","scope":"Sectoral economic restrictions and listings of individuals and entities, with exemptions and licensing rules.","why":"Measures in response to Russia's invasion of Ukraine.","sources":[["EU sanctions overview","https://www.consilium.europa.eu/en/policies/sanctions-against-russia/timeline-packages-sanctions-since-february-2022/"]]}],"Iran":[{"issuer":"United States — OFAC","scope":"Multiple Iran sanctions authorities affect specified trade, finance, sectors, individuals and entities; permissions and exemptions vary.","why":"A range of U.S. foreign policy and security objectives.","sources":[["OFAC Iran sanctions","https://ofac.treasury.gov/sanctions-programs-and-country-information/iran-sanctions"]]}],"Sudan":[{"issuer":"United States — OFAC","scope":"Targeted Sudan/Darfur restrictions, including specified persons and networks; not a blanket ban on all dealings with Sudan.","why":"Responses to the conflict, abuses and destabilizing conduct.","sources":[["OFAC Sudan/Darfur sanctions","https://ofac.treasury.gov/sanctions-programs-and-country-information/sudan-and-darfur-sanctions"]]}],"Myanmar":[{"issuer":"United States — OFAC","scope":"Targeted designations and restrictions under Burma-related authorities; scope depends on the listed parties and applicable rules.","why":"Military rule, human-rights abuses, and related destabilizing actions.","sources":[["OFAC Burma-related sanctions","https://ofac.treasury.gov/sanctions-programs-and-country-information/burma"]]}],"Venezuela":[{"issuer":"United States — OFAC","scope":"Government-related and targeted sanctions; numerous general licenses authorize defined activities, including some energy-sector transactions.","why":"U.S. measures concerning the Venezuelan government and designated actors.","sources":[["OFAC Venezuela sanctions and licenses","https://ofac.treasury.gov/sanctions-programs-and-country-information/venezuela-related-sanctions"]]}],"Belarus":[{"issuer":"European Union","scope":"Targeted listings, financial and trade restrictions, and other measures affecting listed persons or sectors.","why":"EU responses to repression and Belarus's involvement in Russia's aggression against Ukraine.","sources":[["EU sanctions against Belarus","https://www.consilium.europa.eu/en/policies/sanctions-against-belarus/"]]}],"Mexico":[{"issuer":"United States — OFAC (targeted actors, not Mexico as a state)","scope":"Sanctions on named drug-trafficking organizations, individuals and networks. This is NOT a countrywide sanction on Mexico.","why":"Counter-narcotics and illicit-finance enforcement.","sources":[["OFAC counter-narcotics programs","https://ofac.treasury.gov/sanctions-programs-and-country-information/counter-narcotics-trafficking-sanctions"],["U.S. Treasury, September 2026","https://home.treasury.gov/news/press-releases/sb0636"]]}]},"territory":{"Ukraine":[{"title":"Crimea and other occupied Ukrainian territories","status":"Russia claims annexation of Crimea and other Ukrainian territories. These claims are not generally recognized internationally; the UN affirms Ukraine's territorial integrity.","where":"Within internationally recognized Ukrainian territory.","sources":[["UN civilian-monitoring reports","https://ukraine.un.org/en/324561-protection-civilians-armed-conflict-%E2%80%94-september-2026"],["UN General Assembly documents","https://www.un.org/en/ga/"]]}],"Russia":[{"title":"Territorial claims relating to Ukraine","status":"Russia claims sovereignty over Ukrainian territory including Crimea, a claim rejected by Ukraine and not generally recognized internationally.","where":"Crimea and other regions of Ukraine.","sources":[["UN Ukraine situation","https://ukraine.un.org/"]]}],"India":[{"title":"Kashmir dispute","status":"India and Pakistan administer different parts of Kashmir and contest its status. The Line of Control divides the principal administered areas.","where":"Kashmir in the Himalayan region.","sources":[["UNMOGIP mandate","https://unmogip.unmissions.org/en"]]}],"Pakistan":[{"title":"Kashmir dispute","status":"Pakistan and India contest Kashmir; administered portions are separated by the Line of Control.","where":"Kashmir in the Himalayan region.","sources":[["UNMOGIP mandate","https://unmogip.unmissions.org/en"]]}],"Morocco":[{"title":"Western Sahara","status":"Morocco administers most of Western Sahara and advocates autonomy under Moroccan sovereignty; the Polisario Front seeks self-determination. The territory's final status remains contested.","where":"Western Sahara on Africa's Atlantic coast.","sources":[["UN decolonization: Western Sahara","https://www.un.org/dppa/decolonization/en/nsgt/western-sahara"],["UN Western Sahara peace efforts","https://peacekeeping.un.org/en/news/western-sahara-un-stands-ready-to-keep-supporting-peace-efforts-as-minurso"]]}],"Philippines":[{"title":"South China Sea maritime disputes","status":"The Philippines and China have overlapping maritime claims. A 2016 arbitral tribunal issued an award under UNCLOS; China rejects the award.","where":"Parts of the South China Sea, including maritime features.","sources":[["Permanent Court of Arbitration case","https://pca-cpa.org/en/cases/7/"]]}],"China":[{"title":"South China Sea claims","status":"China's extensive maritime claims overlap those of several neighboring states; China rejects the 2016 Philippines v. China arbitral award.","where":"South China Sea.","sources":[["Permanent Court of Arbitration case","https://pca-cpa.org/en/cases/7/"]]}]}};
  const caseCount=type=>Object.keys(BRIEF[type]).length;
  const briefItems=(d,type)=>BRIEF[type][d.country]||[];
  const briefColor={conflict:'#ee745c',sanctions:'#c89b5c',territory:'#9d8de7'};
  const mapLayers = [['plain','No overlay'],['brief:conflict','Documented conflicts — country briefings'],['brief:sanctions','Selected sanctions programs & targets'],['brief:territory','Territorial disputes — involved countries'],['conflict:2025','Recorded armed conflict events (2025)'],...['nato','eu','brics','asean','g7'].map(k=>['org:'+k,'Alliance or group: '+S[k].name]),...['gdppc','growth','military','inequality','energy'].map(k=>['wb:'+k,WB[k].name])];
  // Interpretive maps prioritize patterns that are useful to compare. G20, AU,
  // total GDP/population and gross imports/exports stay in country profiles.
  const sourceLink = (url,title) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(title)} ↗</a>`;
  const iso3 = country => String(country?.iso3 || '').toUpperCase();
  const orgMember = (key,country) => key==='au' ? country.region==='Africa' : S[key].members.split(' ').includes(iso3(country));
  let currentSection='capitals',currentView='profile',currentLayer='plain',selected=null,pendingToken=0;
  let wbCache=new Map(),wbPending=new Map(),geoPaint=paint;
  let visibleWB=null;
  let conflict2025=null,conflictRequest=null;
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
  // Independent top-level workspaces. Geography retains its three inner tabs;
  // intelligence has its own sidebar rather than appearing as a fourth game mode.
  const quizNav=$('modeNav'),intelTab=$('tab-intelligence');
  let geoSection='capitals';
  const primary=document.createElement('div');primary.className='atlas-primary-nav';primary.setAttribute('aria-label','Main sections');
  primary.innerHTML='<button type="button" id="primaryGeography" aria-pressed="true">Geography Trainer</button><button type="button" id="primaryIntelligence" aria-pressed="false">Global Intelligence</button>';
  side.insertBefore(primary,quizNav);
  $('primaryGeography').addEventListener('click',()=>{const target=$('tab-'+geoSection)||$('tab-capitals');target.click()});
  $('primaryIntelligence').addEventListener('click',()=>intelTab.click());
  function setPrimary(section){
    const isIntel=section==='intelligence';
    if(!isIntel)geoSection=section;
    primary.querySelector('#primaryGeography').setAttribute('aria-pressed',String(!isIntel));
    primary.querySelector('#primaryIntelligence').setAttribute('aria-pressed',String(isIntel));
    quizNav.hidden=isIntel;
  }
  $('intelCountry').innerHTML='<option value="">Select a country…</option>'+DATA.map(d=>`<option value="${esc(d.country)}">${esc(d.country)}</option>`).join('');
  $('intelLayer').innerHTML=mapLayers.map(([id,name])=>`<option value="${esc(id)}">${esc(name)}</option>`).join('');
  const panel=document.createElement('section');panel.id='intelPanel';panel.hidden=true;
  panel.innerHTML=`<div class="intel-panel-head"><div><small>COUNTRY INTELLIGENCE</small><h3 id="intelTitle">Select a country</h3></div><button type="button" id="intelClose" aria-label="Close intelligence panel">×</button></div><div id="intelPanelBody">Click a country on the globe, or choose one from the menu, to view its profile.</div>`;
  $('globeWrap').append(panel);
  const css=document.createElement('style');css.textContent=`
   #intelControls[hidden],#intelPanel[hidden],#intelMapSettings[hidden],#intelProfileSettings[hidden]{display:none!important}
   #modeNav{grid-template-columns:repeat(3,minmax(0,1fr))}
   #modeNav[hidden],#modeNav #tab-intelligence{display:none!important}
   .atlas-primary-nav{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:4px 0 13px}
   .atlas-primary-nav button{background:#142d44;border:1px solid #476277;color:#d6e5f3;border-radius:11px;font-weight:800;font-size:12px;padding:13px 5px}
   .atlas-primary-nav button[aria-pressed=true]{background:#1d5559;border-color:#77e5d2;color:#e5fff8}
   .atlas-primary-nav button:hover{border-color:#70e7d4}
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
   .intel-swatches{height:12px;background:linear-gradient(90deg,#b54849,#d98b39,#d5c05b,#5cb8a9,#28856d);border-radius:5px;margin:10px 0 5px}
   .intel-legend-bins{display:grid;gap:4px;margin:10px 0}
   .intel-bin{display:flex;align-items:center;gap:8px;font-size:11px}
   .intel-bin i{width:13px;height:13px;border-radius:2px;flex:0 0 auto}
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
   .intel-brief{border:1px solid #38546c;border-left:3px solid #ed986b;background:#10273b;padding:11px;margin:10px 0;border-radius:8px}
   .intel-brief h5{font-size:13px;color:#e8fcff;margin:0 0 8px}
   .intel-brief p{margin:6px 0}
   .intel-brief-type{display:inline-block;background:#473244;border:1px solid #8c5d74;border-radius:20px;padding:3px 8px;font-size:10px;color:#ffe6e6}
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
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  async function requestJSON(url){
    let error;
    for(let attempt=0;attempt<3;attempt++){
      try{
        const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),attempt===0?9000:12500);
        try{
          const res=await fetch(url,{signal:controller.signal});
          if(!res.ok)throw new Error('Data service returned HTTP '+res.status);
          return await res.json();
        }finally{clearTimeout(timer)}
      }catch(e){error=e;if(attempt<2)await wait(450*(attempt+1))}
    }
    throw error||new Error('Data service temporarily unavailable');
  }
  // Cache the latest successful global series for each indicator. A country
  // profile then reuses these series rather than issuing 4–6 separate requests
  // every time a country is selected.
  async function readLayer(key){
    const ident='all|'+key;if(wbCache.has(ident))return wbCache.get(ident);
    if(wbPending.has(ident))return wbPending.get(ident);
    const url=`https://api.worldbank.org/v2/country/all/indicator/${WB[key].indicator}?format=json&mrnev=1&per_page=650`;
    const pending=(async()=>{
      const storedKey='atlasWB4:'+key;
      try{
        const cached=JSON.parse(localStorage.getItem(storedKey)||'null');
        if(cached&&Date.now()-cached.saved<86400000&&Array.isArray(cached.values)){
          const map=new Map(cached.values);wbCache.set(ident,map);return map;
        }
      }catch(e){}
      try{
        const json=await requestJSON(url);
        const map=new Map();
        for(const row of (json?.[1]||[])){
          if(typeof row.value==='number'&&row.countryiso3code&&(!map.has(row.countryiso3code)||+row.date>+map.get(row.countryiso3code).year))
            map.set(row.countryiso3code,{value:row.value,year:row.date});
        }
        if(!map.size)throw new Error('No valid series returned');
        wbCache.set(ident,map);
        try{localStorage.setItem(storedKey,JSON.stringify({saved:Date.now(),values:[...map]}))}catch(e){}
        return map;
      }catch(err){
        const failed=new Map();failed.loadFailed=true;return failed;
      }
    })().finally(()=>wbPending.delete(ident));
    wbPending.set(ident,pending);return pending;
  }
  async function readWB(iso,key){
    const series=await readLayer(key);
    if(series.has(iso))return series.get(iso);
    if(series.loadFailed)return {loadFailed:true};
    // A valid empty result is different from a failed network request.
    return null;
  }
  // OWID/UCDP records whether at least one armed conflict event occurred
  // in the country during 2025. This is NOT a live 'currently at war' status.
  async function readConflict2025(){
    if(conflict2025)return conflict2025;
    if(conflictRequest)return conflictRequest;
    const endpoint='https://ourworldindata.org/grapher/locations-of-ongoing-armed-conflicts.csv?v=1&csvType=filtered&tab=map&time=2025';
    const parseCSV=row=>{
      const cells=[];let cell='',quoted=false;
      for(let i=0;i<row.length;i++){const ch=row[i];if(ch==='"'){
        if(quoted&&row[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;
      }else if(ch===','&&!quoted){cells.push(cell);cell=''}else cell+=ch}
      cells.push(cell);return cells;
    };
    conflictRequest=(async()=>{
      try{
        const controller=new AbortController(),t=setTimeout(()=>controller.abort(),12000);
        let response;try{response=await fetch(endpoint,{signal:controller.signal});}finally{clearTimeout(t)}
        if(!response.ok)throw Error('Conflict dataset unavailable');
        const csv=await response.text(),lines=csv.trim().split(/\r?\n/),parsed=new Map();
        for(const line of lines.slice(1)){
          const row=parseCSV(line),code=row[1],year=+row[2],value=+row[row.length-1];
          if(code&&code.length===3&&year===2025&&Number.isFinite(value))parsed.set(code,value);
        }
        if(!parsed.size)throw Error('Unrecognized conflict dataset');
        conflict2025=parsed;return parsed;
      }catch(e){const failed=new Map();failed.loadFailed=true;return failed}
      finally{conflictRequest=null}
    })();
    return conflictRequest;
  }
  const COLORS=['#b54849','#d98b39','#d5c05b','#5cb8a9','#28856d'];
  function distribution(){
    if(!currentLayer.startsWith('wb:')||!visibleWB)return null;
    const numbers=DATA.map(d=>visibleWB.get(iso3(d))?.value).filter(Number.isFinite).sort((a,b)=>a-b);
    if(!numbers.length)return null;
    const at=q=>numbers[Math.min(numbers.length-1,Math.floor(q*(numbers.length-1)))];
    const bounds=[at(.2),at(.4),at(.6),at(.8)];
    return {numbers,bounds};
  }
  function categoryFor(n,stat){
    if(!stat||!Number.isFinite(n))return -1;
    return stat.bounds.findIndex(x=>n<=x)===-1?4:stat.bounds.findIndex(x=>n<=x);
  }
  function markerColor(d){
    if(currentLayer.startsWith('brief:')){
      const kind=currentLayer.slice(6);
      return briefItems(d,kind).length?briefColor[kind]:'#596574';
    }
    if(currentLayer==='conflict:2025'){const n=conflict2025?.get(iso3(d));return Number.isFinite(n)?(n>0?'#ef675b':'#3f876e'):'#66717b'}
    if(currentLayer.startsWith('org:'))return orgMember(currentLayer.slice(4),d)?'#49e3be':'#596370';
    if(currentLayer.startsWith('wb:')){
      const n=visibleWB?.get(iso3(d))?.value,idx=categoryFor(n,distribution());
      return idx<0?'#65707a':COLORS[idx];
    }
    return '#ffc76d';
  }
  function updateLegend(){
    const el=$('intelLegend');
    if(currentLayer.startsWith('brief:')){
      const type=currentLayer.slice(6);
      const title=type==='conflict'?'Documented conflict situations':type==='sanctions'?'Sanctions programs and targeted networks':'Territorial disputes and competing claims';
      const note=type==='conflict'?'Includes interstate war, civil wars, and organized criminal violence; these are not interchangeable classifications.':
        type==='sanctions'?'Includes country-focused restrictions and specific sanctioned actors; highlighting does NOT mean the entire country is embargoed.':
        'A highlighted country is associated with a claim; the whole national territory is not necessarily disputed.';
      el.innerHTML=`<b>${title}</b><div class="intel-pair"><span class="intel-dot" style="background:${briefColor[type]}"></span>${caseCount(type)} countries with verified briefings</div><div class="intel-pair"><span class="intel-dot no"></span>Not covered by this curated layer</div><p>${note}</p><small>Research snapshot: ${INTEL_REVIEW_DATE}. Click highlighted countries for context and original sources. Not a live or exhaustive global database.</small>`;
      return;
    }
    if(currentLayer==='plain'){el.innerHTML='Select a layer to compare countries on the globe.';return}
    if(currentLayer==='conflict:2025'){
      const url='https://ourworldindata.org/grapher/locations-of-ongoing-armed-conflicts';
      if(!conflict2025||conflict2025.loadFailed){
        el.innerHTML='<b>Armed conflict events, 2025</b><p>'+(conflict2025?.loadFailed?'Source temporarily unavailable. Re-select this layer to retry.':'Loading documented conflict locations…')+'</p>'+sourceLink(url,'UCDP / OWID source');return;
      }
      const count=DATA.filter(d=>conflict2025.get(iso3(d))>0).length;
      el.innerHTML=`<b>Recorded armed conflict events, 2025</b><div class="intel-pair"><span class="intel-dot" style="background:#ef675b"></span>${count} study-set countries with at least one recorded event</div><div class="intel-pair"><span class="intel-dot" style="background:#3f876e"></span>No recorded event (with data)</div><div class="intel-pair"><span class="intel-dot no"></span>No data</div><p>Historical 2025 indicator, NOT an assessment of active conflicts in 2026. UCDP counts documented events according to its own definitions.</p>${sourceLink(url,'Source and methodology')}`;return;
    }
    if(currentLayer.startsWith('org:')){
      const key=currentLayer.slice(4),o=S[key],count=DATA.filter(d=>orgMember(key,d)).length;
      el.innerHTML=`<b>${esc(o.name)}</b><div class="intel-pair"><span class="intel-dot"></span>${count} countries highlighted</div><div class="intel-pair"><span class="intel-dot no"></span>Other countries</div><small>${esc(o.detail)} · ${esc(SOURCE_YEAR)}</small><br>${sourceLink(o.source,'Official source')}`;
      return;
    }
    const key=currentLayer.slice(3),layer=WB[key],stat=distribution();
    if(!stat){
      el.innerHTML=`<b>${esc(layer.name)}</b><p>${visibleWB?.loadFailed?'The data provider did not respond. Switch layers and retry.':'Loading latest available data…'}</p>${sourceLink(layer.source,'World Bank data')}`;return;
    }
    const groups=[[stat.numbers[0],stat.bounds[0]],[stat.bounds[0],stat.bounds[1]],[stat.bounds[1],stat.bounds[2]],[stat.bounds[2],stat.bounds[3]],[stat.bounds[3],stat.numbers.at(-1)]];
    el.innerHTML=`<b>${esc(layer.desc)}</b><div class="intel-legend-bins">${groups.map(([a,b],i)=>`<div class="intel-bin"><i style="background:${COLORS[i]}"></i><span>${esc(layer.fmt(a))}–${esc(layer.fmt(b))}</span></div>`).join('')}</div><p>Five ranked groups (roughly 20% of reporting countries each). Hover over a country for its exact value, ranking and data year. Gray: no data.</p>${sourceLink(layer.source,'World Bank source')}`;
  }
  function layerColor(f){
    const d=byName[f.properties.country];if(!d)return '#303b47';
    if(currentLayer.startsWith('brief:')){
      const type=currentLayer.slice(6);
      return briefItems(d,type).length?briefColor[type]:'#344252';
    }
    if(currentLayer==='conflict:2025'){const n=conflict2025?.get(iso3(d));return Number.isFinite(n)?(n>0?'#ef675b':'#345a4c'):'#3e4a58'}
    if(currentLayer.startsWith('org:'))return orgMember(currentLayer.slice(4),d)?'#35cdae':'#344253';
    if(currentLayer.startsWith('wb:')){
      const n=visibleWB?.get(iso3(d))?.value,idx=categoryFor(n,distribution());
      return idx<0?'#3e4a58':COLORS[idx];
    }
    if(selected?.country===d.country)return '#4bcbb5';
    if(hovered===f)return '#528ea9';
    return 'rgba(37,87,125,.24)';
  }
  function polygonTooltip(f){
    const d=byName[f.properties.country];if(!d)return'';
    const name=esc(d.country);
    if(currentLayer.startsWith('brief:')){
      const type=currentLayer.slice(6),items=briefItems(d,type);
      return `<div style="padding:8px"><b>${name}</b><br>${items.length?esc(items[0].title||items[0].issuer||'Documented case'):'Not included in this selected briefing set'}<br><small>${INTEL_REVIEW_DATE}</small></div>`;
    }
    if(currentLayer==='conflict:2025'){
      const value=conflict2025?.get(iso3(d));
      return `<div style="padding:7px"><b>${name}</b><br>${Number.isFinite(value)?(value>0?'At least one recorded armed conflict event':'No recorded event'):'No data'} (2025)</div>`;
    }
    if(currentLayer.startsWith('wb:')){
      const key=currentLayer.slice(3),metric=visibleWB?.get(iso3(d)),stat=distribution();
      if(!metric)return`<div style="padding:7px">${name}<br>No reported data</div>`;
      const rank=stat?stat.numbers.filter(x=>x>metric.value).length+1:null;
      return`<div style="padding:7px"><b>${name}</b><br>${esc(WB[key].name)}: ${esc(WB[key].fmt(metric.value))}<br>Rank ${rank} of ${stat.numbers.length} · ${esc(metric.year)}</div>`;
    }
    if(currentLayer.startsWith('org:'))return`<div style="padding:7px"><b>${name}</b><br>${orgMember(currentLayer.slice(4),d)?'Member':'Not a member'}</div>`;
    return name;
  }
  function renderLayer(){
    if(!globe)return;
    globe.polygonCapColor(layerColor)
     .polygonLabel(polygonTooltip)
     .polygonStrokeColor(()=>'#91a6b9')
     .polygonSideColor(()=>'rgba(25,63,90,.15)')
     .polygonAltitude(()=>.007);
    // Microstates and small island pins use the same intelligence coloring
    // as large-country polygons; yellow is reserved for the plain layer.
    globe.pointsData(DATA.filter(d=>d.pin))
     .pointColor(markerColor)
     .pointLabel(d=>polygonTooltip({properties:{country:d.country}}))
     .pointRadius(d=>['Andorra','Monaco','Vatican City','San Marino','Liechtenstein'].includes(d.country)?.16:.27);
  }
  paint=function(){if(currentSection==='intelligence')renderLayer();else geoPaint();};
  async function changeLayer(){
    currentLayer=$('intelLayer').value;visibleWB=null;pendingToken++;const token=pendingToken;
    if(currentLayer==='conflict:2025'){
      conflict2025=null;updateLegend();renderLayer();
      const data=await readConflict2025();
      if(token!==pendingToken||currentSection!=='intelligence')return;
      conflict2025=data;
    }else if(currentLayer.startsWith('wb:')){
      updateLegend();renderLayer();
      const data=await readLayer(currentLayer.slice(3));
      if(token!==pendingToken||currentSection!=='intelligence')return;
      visibleWB=data;
    }
    updateLegend();renderLayer();
  }
  function showPanel(d){
    if(!d)return;
    selected=d;panel.hidden=false;$('intelTitle').textContent=d.country;$('intelCountry').value=d.country;
    renderTopic();renderLayer();
  }
  const briefingLinks=items=>sourceBlock((items||[]).map(([name,url])=>[url,name]));
  function briefingSection(d,type){
    const items=briefItems(d,type);
    const heading={conflict:'Conflict briefings',sanctions:'Sanctions and restrictions',territory:'Territorial and maritime disputes'}[type];
    if(!items.length)return `<div class="intel-section"><h4>${heading}</h4><p>No curated briefing for this country yet. This does not mean there is no conflict, sanction or dispute.</p></div>`;
    return `<div class="intel-section"><h4>${heading}</h4><p class="intel-source">Research reviewed: ${INTEL_REVIEW_DATE}; not a live status feed.</p>${items.map(item=>
      `<article class="intel-brief"><h5>${esc(item.title||item.issuer)}</h5>
        ${item.type?`<span class="intel-brief-type">${esc(item.type)}</span>`:''}
        ${item.since?`<p><b>Since:</b> ${esc(item.since)}</p>`:''}
        ${item.actors?`<p><b>Main actors:</b> ${esc(item.actors)}</p>`:''}
        ${item.where?`<p><b>Geography:</b> ${esc(item.where)}</p>`:''}
        ${item.summary?`<p><b>What is happening:</b> ${esc(item.summary)}</p>`:''}
        ${item.impact?`<p><b>Why it matters:</b> ${esc(item.impact)}</p>`:''}
        ${item.scope?`<p><b>Scope:</b> ${esc(item.scope)}</p>`:''}
        ${item.why?`<p><b>Purpose:</b> ${esc(item.why)}</p>`:''}
        ${item.status?`<p><b>Dispute:</b> ${esc(item.status)}</p>`:''}
        ${briefingLinks(item.sources)}
      </article>`).join('')}</div>`;
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
      $('intelPanelBody').innerHTML=lead+`<div class="intel-section"><h4>International organizations & alliances</h4>${orgTags(d)}</div><div class="intel-section"><h4>Government & diplomacy</h4><p>Political systems, officeholders, and diplomatic relationships can change. Use these current directories rather than an unverified static classification.</p>${sourceBlock([[urls.leaders,'CIA World Leaders: cabinet and leaders'],['https://www.un.org/en/about-us/member-states','United Nations member-state directory']])}</div><div class="intel-section"><h4>Territorial disputes & sanctions</h4><p>Territorial claims and sanctions involve different jurisdictions and legal interpretations. These links are sources, <b>not an assertion</b> that this country is under sanctions or is involved in a dispute.</p>${briefingSection(d,'territory')}${briefingSection(d,'sanctions')}</div>`;
      return;
    }
    if(t==='economy'){
      $('intelPanelBody').innerHTML=lead+`<div class="intel-section"><h4>Economy & international trade</h4><div id="intelMetricLoad">Loading latest World Bank indicators…</div><p>Exports/imports here mean <b>goods and services in total</b>, not the largest individual products.</p>${metricLinks()}</div><div class="intel-section"><h4>Natural resources, energy & transport</h4><p>Resource reserves, production, energy import dependence, and major maritime routes should be interpreted from dated sector datasets.</p>${sourceBlock([[urls.resources,'USGS Mineral Commodity Summaries (2026)'],[urls.energy,'IEA energy statistics'],[urls.naval,'UNCTAD maritime trade & transport']])}</div>`;
      addMetrics(['gdp','gdppc','exports','imports','inequality','energy'],token);return;
    }
    $('intelPanelBody').innerHTML=lead+`<div class="intel-section"><h4>Security & conflict research</h4><p>Atlas Quest does not presently maintain a verified live conflict or sanctions status for every country. The sources below provide dated, documented records; a missing marker is not proof of peace.</p>${briefingSection(d,'conflict')}${briefingSection(d,'sanctions')}${briefingSection(d,'territory')}</div><div class="intel-section"><h4>Defense expenditure</h4><div id="intelMetricLoad">Loading World Bank / SIPRI series…</div><p>Military expenditure is measured as a percentage of GDP, not the size of an arsenal.</p></div>`;
    addMetrics(['military'],token);
  }
  async function addMetrics(keys,token){
    // Update metric cards as the results arrive: slow indicators must not
    // hold every other economic fact in a perpetual loading state.
    const iso=iso3(selected),host=$('intelMetricLoad');if(!host)return;
    host.innerHTML='<div class="intel-metrics">'+keys.map((key,i)=>`<div class="intel-metric" id="intel-obs-${i}"><small>${esc(WB[key].name)}</small><strong>Loading…</strong></div>`).join('')+'</div><span class="intel-source">World Bank Open Data · each value displays its own reporting year. '+sourceLink(linkWorldBank(iso),'Country dataset')+'</span>';
    await Promise.all(keys.map(async(key,i)=>{
      let observation;
      try{observation=await readWB(iso,key)}catch(e){observation={loadFailed:true}}
      if(token!==pendingToken||currentSection!=='intelligence'||iso3(selected)!==iso)return;
      const slot=$('intel-obs-'+i);if(!slot)return;
      slot.outerHTML=observation?.loadFailed
       ? `<div class="intel-metric"><small>${esc(WB[key].name)}</small><strong>Temporarily unavailable</strong><em>Network issue — reopen this country to retry</em></div>`
       : wbMeta(key,observation);
    }));
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
    currentSection=e.detail.section;setPrimary(currentSection);
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
