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

  // Six requested relationship briefings, explicitly distinguishing historic
  // interventions, interstate hostilities, ceasefires and border operations.
  // Mirroring a briefing under both participating countries does NOT equate
  // governments, civilians and armed groups.
  const RELATIONSHIP_CASES=[{"id":"us-venezuela-2026","title":"U.S. military intervention in Venezuela and subsequent normalization","type":"Past military intervention and diplomatic aftermath","since":"January 3, 2026","actors":"United States armed forces; former Venezuelan President Nicolás Maduro; Venezuela's interim authorities","where":"Caracas and other Venezuelan sites were targeted in January 2026; the diplomatic aftermath affects U.S.–Venezuelan relations.","summary":"U.S. forces carried out strikes and captured Nicolás Maduro on January 3, 2026. Venezuela subsequently established an interim government, and Washington and Caracas restored diplomatic relations in March 2026. Their relationship has since included negotiations and oil cooperation. This entry documents a military intervention and its aftermath, NOT an ongoing U.S.–Venezuela war.","impact":"The operation raised questions about sovereignty and international law. Its political aftermath has reshaped Venezuelan governance and U.S.–Venezuelan economic ties.","situation":"Past military action; diplomatic and economic engagement afterward. Not classified as an ongoing interstate war.","participants":["United States","Venezuela"],"sources":[["UK House of Commons Library: Venezuela after January 2026","https://commonslibrary.parliament.uk/research-briefings/CBP-12211/"],["Reuters: U.S. and Venezuela re-establish diplomatic relations (March 2026)","https://www.reuters.com/world/americas/us-venezuela-agree-re-establish-diplomatic-consular-relations-2026-03-05/"]]},{"id":"us-iran-2026","title":"United States–Iran military confrontation","type":"Interstate armed confrontation","since":"February 28, 2026; intermittent attacks and diplomacy through November 2026","actors":"U.S. and Iranian armed forces","where":"Iran, U.S. forces and installations in the Gulf, and maritime routes in and around the Strait of Hormuz.","summary":"The United States and Israel began military strikes on Iran on February 28, 2026; Iran responded by attacking Israel and U.S.-associated sites in Gulf states. Later ceasefire arrangements were fragile. Reuters reported limited U.S. strikes against missile installations on Iran's Qeshm Island in early November while Qatar mediated talks.","impact":"Strikes have affected regional security and international shipping, with energy-market and humanitarian repercussions.","situation":"Direct interstate military hostilities with intermittent pauses and ongoing negotiations as of early November 2026.","participants":["United States","Iran"],"sources":[["Reuters: U.S.–Iran diplomacy and limited strikes (Nov. 3, 2026)","https://www.reuters.com/world/middle-east/irans-foreign-minister-says-talks-with-saudi-arabia-are-ongoing-yemen-fighting-2026-11-03/"],["Reuters: Iranian proposal through Qatar (Nov. 5, 2026)","https://www.reuters.com/world/middle-east/iran-sent-nuclear-proposal-us-via-qatar-senior-iranian-official-tells-reuters-2026-11-05/"]]},{"id":"israel-iran-2026","title":"Israel–Iran military confrontation","type":"Interstate armed confrontation","since":"2026 escalation following earlier regional confrontations; major U.S.–Israeli strikes began February 28, 2026","actors":"Israeli and Iranian armed forces, amid a broader regional war also involving the United States and Iran-aligned groups","where":"Israeli and Iranian territory and associated regional military targets.","summary":"Israel participated alongside the United States in strikes on Iran beginning February 28, 2026, followed by Iranian attacks on Israel and other regional targets. Exchanges and the risk of renewed escalation have remained part of the broader 2026 Iran war. This is distinct from the U.S.–Iran relationship even though the conflicts are linked.","impact":"Cross-border strikes and regional escalation affect civilians, military installations and regional diplomacy.","situation":"Direct interstate confrontation embedded in the wider 2026 Iran war; ceasefire and diplomatic efforts remain fragile.","participants":["Israel","Iran"],"sources":[["Reuters: Iran's nuclear proposal and background to the war (Nov. 5, 2026)","https://www.reuters.com/world/middle-east/iran-sent-nuclear-proposal-us-via-qatar-senior-iranian-official-tells-reuters-2026-11-05/"],["Reuters: international response to February 28 strikes","https://www.reuters.com/business/aerospace-defense/global-reaction-israeli-us-attacks-iran-2026-02-28/"]]},{"id":"israel-palestine-gaza","title":"Israel–Palestinian conflict: Gaza and the West Bank","type":"Fragile ceasefire with continued hostilities","since":"Long-standing conflict; Gaza war escalated after October 7, 2023; ceasefire agreement October 10, 2025","actors":"Israeli armed forces; Hamas and other Palestinian armed groups in Gaza; Palestinian civilians and authorities are not interchangeable with Hamas","where":"Gaza Strip and the occupied West Bank, including East Jerusalem.","summary":"After the Hamas-led attacks on Israel on October 7, 2023, Israel launched a major military campaign in Gaza. A ceasefire agreement began in October 2025, but the UN documented continued Israeli strikes, Palestinian deaths, civilian displacement and violence in the West Bank during 2026. The ceasefire does not mean the humanitarian crisis or armed incidents ended.","impact":"Severe civilian suffering, displacement, humanitarian-access restrictions and continuing insecurity for Israelis and Palestinians.","situation":"Fragile ceasefire and continuing violent incidents; should not be presented as uninterrupted full-scale fighting in all locations.","participants":["Israel","Palestine"],"sources":[["UN OCHA: humanitarian situation report, Oct. 29, 2026","https://www.ochaopt.org/content/humanitarian-situation-report-29-october-2026"],["UN Special Coordinator: ceasefire situation (Sept. 2026)","https://unsco.unmissions.org/en/news/security-council-briefing-28-september-2026-unscr-2334"],["CFR Israeli–Palestinian conflict background","https://www.cfr.org/global-conflict-tracker/conflict/israeli-palestinian-conflict"]]},{"id":"israel-syria-2026","title":"Israel–Syria military operations and border dispute","type":"Cross-border military operations","since":"Long-running Golan Heights dispute; Israeli military activity expanded after December 2024 and continued in 2026","actors":"Israeli armed forces; Syrian authorities and communities affected by incursions","where":"Southern Syria, especially Quneitra and Daraa, and the disengagement zone near the occupied Golan Heights.","summary":"UN Security Council reporting describes near-daily Israeli raids, ground incursions, arrests and artillery fire in southern Syria during October 2026. Israel describes its operations as security measures, while Syrian authorities reject the incursions and seek withdrawal and compliance with the 1974 disengagement agreement. U.S.-mediated talks have also occurred.","impact":"The situation raises sovereignty, civilian-protection and border-security concerns; it is not necessarily equivalent to full-scale interstate war.","situation":"Ongoing cross-border military operations and territorial-security dispute, with diplomatic engagement.","participants":["Israel","Syria"],"sources":[["Security Council Report: Syria November 2026","https://www.securitycouncilreport.org/monthly-forecast/2026-11/syria-97.php"],["Reuters: U.S.-mediated Israel–Syria talks (Aug. 2026)","https://www.investing.com/news/world-news/syria-israel-hold-usmediated-talks-to-ease-tensions-syria-news-agency-says-4872481"]]},{"id":"israel-lebanon-2026","title":"Israel–Hezbollah hostilities affecting Lebanon","type":"Fragile ceasefire with continued hostilities","since":"Cross-border escalation from October 2023; new major escalation in March 2026; ceasefire arrangements in June 2026","actors":"Israel Defense Forces and Hezbollah; Lebanese state institutions and civilians are distinct from Hezbollah","where":"Southern Lebanon, northern Israel and areas near the Blue Line; occasional strikes beyond the border region.","summary":"Following renewed Israel–Hezbollah hostilities in March 2026, ceasefire arrangements were announced in June. Nevertheless, UN peacekeepers and Reuters reported further Israeli strikes, Hezbollah attacks and ceasefire violations, including in September and October 2026. This is not the same as saying Israel is at war with the Lebanese population or government as a whole.","impact":"Civilian casualties, displacement, damaged infrastructure and risks of another broader escalation.","situation":"Ceasefire framework with repeated armed incidents and violations in 2026.","participants":["Israel","Lebanon"],"sources":[["UN Peacekeeping: visit to Lebanon (Oct. 29, 2026)","https://peacekeeping.un.org/en/news/un-peacekeeping-chief-visits-the-middle-east-reaffirming-the-uns-commitment-to"],["Reuters: strikes in southern Lebanon (Sept. 6, 2026)","https://www.reuters.com/world/middle-east/israeli-military-says-it-strikes-southern-lebanon-after-hezbollah-launched-2026-09-06/"],["UNIFIL: ceasefire concerns (Aug. 2026)","https://www.unognewsroom.org/story/en/3237/unifil-update-27aug2026/0"]]}];
  for(const event of RELATIONSHIP_CASES){
    for(const country of event.participants){
      (BRIEF.conflict[country] ||= []).push(event);
    }
  }
  // Expansion batch: CFR / ACLED / UN-backed descriptive reference entries.
  // A country association can reflect spillover, cooperation or historical
  // succession. It must not be read as an assertion of war between all members.
  const ADDITIONAL_CASES=[{"id":"yemen-war","title":"Yemen's fragmented civil conflict","type":"Civil war and insurgencies","since":"Since 2014–2015","participants":["Yemen"],"actors":"Houthi movement (Ansar Allah), Yemeni government and other armed factions","where":"Yemen","summary":"Yemen's conflict involves several armed and political factions. The Houthis hold significant territory while competing authorities and armed groups continue to contest control.","impact":"Conflict and economic collapse have worsened humanitarian needs.","situation":"Protracted conflict; front lines and alliances vary.","sources":[["Conflict background and monitoring","https://www.cfr.org/global-conflict-tracker/conflict/war-yemen"]]},{"id":"red-sea","title":"Houthi attacks and the Red Sea shipping crisis","type":"Cross-border military operations","since":"Major escalation from late 2023","participants":["Yemen"],"actors":"Houthi forces and foreign/naval forces responding to attacks","where":"Red Sea, Bab el-Mandeb, Gulf of Aden","summary":"Houthi missile and drone operations have threatened international shipping; foreign forces have responded with interception and strikes. Maritime operations must not be confused with a separate war between Yemen and each flag state.","impact":"Risk to seafarers, trade corridors and regional escalation.","situation":"Intermittent maritime and regional military activity; individual incidents are date-sensitive.","sources":[["Conflict background and monitoring","https://www.cfr.org/global-conflict-tracker/conflict/war-yemen"]]},{"id":"somalia-alshabaab","title":"Al-Shabaab insurgency in Somalia","type":"Insurgency","since":"Since the mid-2000s","participants":["Somalia"],"actors":"Somali government and allied forces versus al-Shabaab","where":"Southern and central Somalia, with regional spillover","summary":"Al-Shabaab continues to conduct attacks against the Somali state, civilians and international partners despite military operations. This is principally an internal insurgency, not a Somalia–United States war.","impact":"Persistent civilian harm and governance disruption.","situation":"Ongoing insurgency; areas affected change.","sources":[["Conflict background and monitoring","https://www.cfr.org/global-conflict-tracker/conflict/al-shabab-somalia"]]},{"id":"ethiopia-internal","title":"Conflicts and renewed armed instability in Ethiopia","type":"Civil war and insurgencies","since":"After the 2022 Pretoria peace agreement; renewed tensions through 2026","participants":["Ethiopia"],"actors":"Ethiopian forces and multiple armed groups, including Amhara and Oromo factions; northern tensions","where":"Amhara, Oromia, Tigray and other affected areas","summary":"Ethiopia has several distinct armed and political conflicts. The 2022 Tigray peace agreement did not resolve violence in other areas, and northern tensions rose again in 2026.","impact":"Risk to peace implementation and civilian safety.","situation":"Multiple separate conflicts; do not imply uniform countrywide fighting.","sources":[["Conflict background and monitoring","https://www.cfr.org/global-conflict-tracker/conflict/conflict-ethiopia"]]},{"id":"drc-m23","title":"M23 conflict and regional involvement in eastern Congo","type":"Insurgency","since":"M23 offensives intensified in 2022 and again in 2025–2026","participants":["Democratic Republic of the Congo","Rwanda"],"actors":"Congolese government forces, M23/AFC; Rwanda's role has been the subject of UN reporting","where":"North Kivu, South Kivu and adjacent border areas","summary":"M23 and Congolese forces contest territory in eastern DR Congo. Rwanda's involvement has contributed to the international dimension of the crisis; diplomatic agreements have not produced comprehensive peace.","impact":"Displacement, abuses and cross-border escalation risk.","situation":"Ongoing armed crisis despite mediation and ceasefire efforts.","sources":[["Conflict background and monitoring","https://www.cfr.org/global-conflict-tracker/conflict/violence-democratic-republic-congo"]]},{"id":"drc-adf","title":"ADF insurgent attacks in eastern Congo","type":"Insurgency","since":"Long-running, including attacks during 2026","participants":["Democratic Republic of the Congo","Uganda"],"actors":"Allied Democratic Forces, Congolese forces and Ugandan partners conducting joint operations","where":"Ituri and North Kivu","summary":"ADF violence and counterinsurgency operations constitute a separate armed conflict from the M23 rebellion. Uganda participates in joint operations with DR Congo against the ADF.","impact":"Civilian protection and regional security.","situation":"Continuing insurgent attacks and operations.","sources":[["Conflict background and monitoring","https://www.cfr.org/global-conflict-tracker/conflict/violence-democratic-republic-congo"]]},{"id":"south-sudan","title":"Renewed armed violence and instability in South Sudan","type":"Civil war and insurgencies","since":"Following the 2018 peace agreement; serious deterioration during 2026","participants":["South Sudan"],"actors":"South Sudanese political-military factions and local armed actors","where":"Several South Sudanese states; local hotspots vary","summary":"The 2018 revitalized peace agreement has not resolved rivalries or local violence. The UN documented heightened civilian harm and escalating armed clashes during 2026.","impact":"Displacement and threats to national elections and peace agreement.","situation":"Peace agreement under strain; localized and political violence continues.","sources":[["Conflict background and monitoring","https://www.cfr.org/global-conflict-tracker/conflict/civil-war-south-sudan"]]},{"id":"sahel-extremism","title":"Jihadist insurgencies across the central Sahel","type":"Insurgency","since":"2012 onward; regional spread","participants":["Mali","Burkina Faso","Niger"],"actors":"JNIM, Islamic State affiliates, state forces and local security groups","where":"Mali, Burkina Faso, Niger and border areas","summary":"Armed Islamist groups operate across borders and confront national militaries. The Sahel crisis is interconnected but should not be depicted as a war among Mali, Burkina Faso and Niger.","impact":"Civilian protection, displacement and weakened state authority.","situation":"Continuing cross-border insurgencies, with variation by country.","sources":[["Conflict background and monitoring","https://www.cfr.org/global-conflict-tracker/conflict/violent-extremism-sahel"]]},{"id":"lake-chad","title":"Boko Haram and ISWAP violence in the Lake Chad region","type":"Insurgency","since":"From 2009, with changing factions","participants":["Nigeria","Cameroon","Chad","Niger"],"actors":"Boko Haram, Islamic State West Africa Province and national security forces","where":"Northeastern Nigeria and neighboring Lake Chad border areas","summary":"Insurgent factions target security forces and civilians across the Lake Chad basin. Participating countries generally cooperate against militants; their shared highlighting does not indicate war between them.","impact":"Displacement and chronic insecurity around Lake Chad.","situation":"Insurgencies and security operations continue in parts of the basin.","sources":[["Conflict background and monitoring","https://acleddata.com/series/acled-conflict-index"]]},{"id":"central-africa-rebellion","title":"Armed-group conflict in the Central African Republic","type":"Civil war and insurgencies","since":"Following the 2013 political-military crisis","participants":["Central African Republic"],"actors":"Central African government and multiple armed groups","where":"Outside the capital and in contested local areas","summary":"Militia and rebel networks continue to threaten communities and state authority despite peace initiatives and foreign security support.","impact":"Civilian harm and weak territorial governance.","situation":"Localized fighting persists; varies by region.","sources":[["Conflict background and monitoring","https://www.cfr.org/global-conflict-tracker/conflict/violence-central-african-republic"]]},{"id":"cabo-delgado","title":"Cabo Delgado insurgency","type":"Insurgency","since":"Since 2017","participants":["Mozambique"],"actors":"Insurgents associated with Islamic State Mozambique, Mozambican forces and regional partners","where":"Cabo Delgado in northern Mozambique","summary":"Insurgents carry out attacks in northern Mozambique, while government and external forces conduct operations to restore security. Regional partner deployments are not an invasion of Mozambique.","impact":"Displacement and disruption to energy investment and communities.","situation":"Continuing low-intensity to episodic conflict; check reports for local conditions.","sources":[["Conflict background and monitoring","https://www.un.org/securitycouncil/ctc/news/cted-conducts-technical-consultations-mozambique-counter-terrorism"]]},{"id":"afghan-pak-border","title":"Afghanistan–Pakistan military confrontation","type":"Interstate armed confrontation","since":"Escalated in 2026","participants":["Afghanistan","Pakistan"],"actors":"Afghan Taliban authorities and Pakistani armed forces; separate from the TTP","where":"Afghanistan–Pakistan border areas","summary":"Border clashes and airstrikes intensified tensions between the two states in 2026. Pakistan also faces its own internal militancy; that is a related but distinct conflict.","impact":"Civilian casualties, displacement, diplomacy and border trade disruption.","situation":"Intermittent interstate fighting; ceasefire periods require dated descriptions.","sources":[["Conflict background and monitoring","https://www.cfr.org/global-conflict-tracker/conflict/war-afghanistan"]]},{"id":"pakistan-ttp","title":"Tehrik-i-Taliban Pakistan insurgency","type":"Insurgency","since":"Long-running; violence continued during 2026","participants":["Pakistan"],"actors":"Pakistani security forces and Tehrik-i-Taliban Pakistan","where":"Khyber Pakhtunkhwa and other affected areas","summary":"TTP militant attacks on Pakistani forces and civilians persist. Although border sanctuaries complicate the conflict, TTP is distinct from the Afghan Taliban state.","impact":"Civilian casualties, security and regional tensions.","situation":"Insurgent violence and counterterrorism operations.","sources":[["Conflict background and monitoring","https://www.cfr.org/global-conflict-tracker/conflict/war-afghanistan"]]},{"id":"haiti-gangs","title":"Gang coalition violence and international security response in Haiti","type":"Organized criminal violence","since":"Escalated after 2021; severe crisis in 2026","participants":["Haiti"],"actors":"Haitian police and government, Viv Ansanm, Gran Grif and other gangs; multinational support force","where":"Port-au-Prince and other affected departments","summary":"Armed groups contest neighborhoods, roads and public institutions. A UN-authorized international security force supports Haitian authorities, but that deployment is not a war between Haiti and participating states.","impact":"Civilian displacement, kidnappings and humanitarian disruption.","situation":"Ongoing organized violence and political instability.","sources":[["Conflict background and monitoring","https://www.cfr.org/global-conflict-tracker/conflict/instability-haiti"]]},{"id":"colombia-eln","title":"ELN armed conflict in Colombia","type":"Insurgency","since":"Decades-long, including violence in 2026","participants":["Colombia"],"actors":"National Liberation Army (ELN), Colombian security forces and competing armed groups","where":"Catatumbo and other contested areas","summary":"ELN maintains armed networks and competes with state forces and other groups. Violence persists despite repeated negotiations and localized ceasefire initiatives.","impact":"Displacement, attacks on civilians and conflict over illicit economies.","situation":"Ongoing, fragmented internal conflict.","sources":[["Conflict background and monitoring","https://acleddata.com/country/colombia"]]},{"id":"colombia-farc","title":"FARC dissident factions and territorial conflict","type":"Insurgency","since":"After the 2016 peace agreement","participants":["Colombia"],"actors":"Various FARC dissident factions, ELN, Gulf Clan and Colombian authorities","where":"Guaviare, Cauca and other regions","summary":"Not all FARC units demobilized under the 2016 agreement. Splinter factions clash with each other, state forces and rival armed groups over territory and trafficking corridors.","impact":"Civilian harm and threats to peace implementation.","situation":"Continuing splinter-group violence; distinguish factions.","sources":[["Conflict background and monitoring","https://acleddata.com/update/latin-america-and-caribbean-overview-june-2026"]]},{"id":"ecuador-gangs","title":"Organized criminal violence in Ecuador","type":"Organized criminal violence","since":"Major escalation since 2023","participants":["Ecuador"],"actors":"Ecuadorian police and military, Los Lobos, Los Choneros and other criminal networks","where":"Coastal provinces, prisons and major cities","summary":"Fragmented gang alliances compete over drug-trafficking routes, extortion and prisons; the government has militarized parts of its security response. This is not a conventional interstate war.","impact":"High homicide burden and threats to civic institutions.","situation":"Serious organized criminal violence during 2026.","sources":[["Conflict background and monitoring","https://acleddata.com/country/ecuador"]]},{"id":"libya-militias","title":"Libya's armed-faction instability","type":"Civil war and insurgencies","since":"Following the 2011 conflict; uneven ceasefire since 2020","participants":["Libya"],"actors":"Competing Libyan political and armed factions","where":"Tripoli and other local flashpoints","summary":"Large-scale civil war has paused, but rival armed groups and divided institutions continue to generate occasional clashes. Avoid treating all of Libya as an uninterrupted nationwide war.","impact":"Political fragmentation, public safety and disrupted governance.","situation":"Unstable political-security environment; localized clashes.","sources":[["Conflict background and monitoring","https://www.cfr.org/global-conflict-tracker/conflict/civil-war-libya"]]},{"id":"iraq-insurgency","title":"Residual Islamic State insurgency and Iraqi security operations","type":"Insurgency","since":"Following the defeat of ISIS territorial rule in 2017","participants":["Iraq"],"actors":"Islamic State cells and Iraqi security forces; regional actors","where":"Northern and western Iraq and other local areas","summary":"ISIS lost its territorial caliphate but cells and insecurity remain. Iraqi political and security crises are broader than this particular insurgency.","impact":"Civilian safety and continued counterterrorism costs.","situation":"Residual insurgent threat, not a return to 2014 territorial control.","sources":[["Conflict background and monitoring","https://www.cfr.org/global-conflict-tracker/conflict/political-instability-iraq"]]},{"id":"northern-triangle","title":"Gang-related insecurity across Central America's Northern Triangle","type":"Organized criminal violence","since":"Long-running; country-level conditions differ substantially","participants":["Guatemala","Honduras","El Salvador"],"actors":"Various criminal groups and national law-enforcement agencies","where":"Guatemala, Honduras and El Salvador","summary":"Transnational gangs and trafficking networks have driven violence, while policing and incarceration policies have altered homicide patterns differently in each country. This is NOT a unified war between the three governments.","impact":"Criminal violence, migration pressures and civil-rights concerns.","situation":"Uneven contemporary trends; do not generalize all three countries as experiencing equal violence.","sources":[["Conflict background and monitoring","https://www.cfr.org/global-conflict-tracker/conflict/violent-instability-northern-triangle"]]},{"id":"turkey-iraq-kurdish","title":"Turkish military operations against Kurdish armed groups in Iraq","type":"Cross-border military operations","since":"Long-running; changing ceasefire and disarmament initiatives","participants":["Turkey","Iraq"],"actors":"Turkish forces and PKK-related armed groups; Iraqi state is not necessarily an opposing belligerent","where":"Northern Iraq and the Turkish border region","summary":"Türkiye has conducted cross-border operations against PKK positions in northern Iraq. Talks and political developments have altered the situation, so past operations should not be described as constant open interstate warfare.","impact":"Sovereignty disputes, civilian effects and security dialogue.","situation":"Operations and peace processes require time-specific updates.","sources":[["Conflict background and monitoring","https://www.cfr.org/global-conflict-tracker/conflict/conflict-between-turkey-and-armed-kurdish-groups"]]},{"id":"turkey-syria","title":"Turkish military presence and operations in northern Syria","type":"Cross-border military operations","since":"From 2016, evolving deployments and security arrangements","participants":["Turkey","Syria"],"actors":"Turkish military and Syrian factions; Kurdish-led groups are not synonymous with the Syrian state","where":"Northern Syria","summary":"Türkiye has used military forces and allied groups in northern Syria over multiple years, principally citing border security. Force deployments and negotiations have changed with Syria's political transition.","impact":"Border sovereignty and regional population displacement.","situation":"Changing military footprint; not a permanent blanket Syria–Turkey war.","sources":[["Conflict background and monitoring","https://www.cfr.org/global-conflict-tracker/conflict/conflict-between-turkey-and-armed-kurdish-groups"]]},{"id":"india-pak-ceasefire","title":"India–Pakistan 2025 ceasefire and unresolved Kashmir tensions","type":"Ceasefire and unresolved security dispute","since":"Ceasefire following May 2025 strikes","participants":["India","Pakistan"],"actors":"Indian and Pakistani armed forces and governments","where":"Line of Control and areas affected by May 2025 strikes","summary":"A short direct military confrontation in May 2025 ended with a ceasefire. Kashmir and other sources of tension remain unresolved, but a ceasefire should not be portrayed as active full-scale warfare.","impact":"Deterrence and renewed-escalation risk.","situation":"Ceasefire generally maintained; underlying dispute remains.","sources":[["Conflict background and monitoring","https://www.cfr.org/global-conflict-tracker/conflict/conflict-between-india-and-pakistan"]]},{"id":"thai-cambodia-truce","title":"Thailand–Cambodia border ceasefire and territorial tensions","type":"Ceasefire and unresolved security dispute","since":"Fighting in 2025; subsequent ceasefire commitments","participants":["Thailand","Cambodia"],"actors":"Thai and Cambodian armed forces and governments","where":"Disputed border stretches near historical temple sites","summary":"Deadly 2025 clashes were followed by negotiated ceasefire measures. The territorial dispute remains, but the ceasefire is not an ongoing shooting war.","impact":"Border-community displacement and diplomatic pressures.","situation":"Ceasefire and talks; tensions remain.","sources":[["Conflict background and monitoring","https://www.csis.org/blogs/latest-southeast-asia/latest-southeast-asia-thailand-cambodia-disputes-ongoing-one-year-after"]]},{"id":"armenia-azerbaijan-peace","title":"Armenia–Azerbaijan peace process following previous wars","type":"Ceasefire and unresolved security dispute","since":"Peace declaration and talks progressed in 2025–2026","participants":["Armenia","Azerbaijan"],"actors":"Armenian and Azerbaijani governments","where":"South Caucasus; borders and transport arrangements","summary":"Past wars over Nagorno-Karabakh gave way to negotiations and major diplomatic progress. Label this as a peace process with outstanding questions, not an active interstate war.","impact":"Regional normalization and security guarantees.","situation":"Improved diplomatic conditions; implementation remains consequential.","sources":[["Conflict background and monitoring","https://www.cfr.org/global-conflict-tracker/conflict/nagorno-karabakh-conflict"]]},{"id":"korea-armistice","title":"Korean War armistice and unresolved security confrontation","type":"Ceasefire and unresolved security dispute","since":"1953 armistice","participants":["North Korea","South Korea"],"actors":"North and South Korean governments and armed forces","where":"Korean Demilitarized Zone and surrounding waters","summary":"The 1950–1953 Korean War ended in an armistice, not a comprehensive peace treaty. Militarized confrontations remain possible, but there is no continuing nationwide Korean War offensive.","impact":"Major escalation and nuclear-security risks.","situation":"Long-running armistice and high tensions, not continuous conventional war.","sources":[["Conflict background and monitoring","https://www.cfr.org/global-conflict-tracker/conflict/north-korea-crisis"]]},{"id":"hist-afghanistan-soviet","title":"Soviet invasion and war in Afghanistan","type":"Historical military intervention","since":"1979–1989","participants":["Afghanistan","Russia"],"actors":"Historical states and military forces (see the source for full participants)","where":"Afghanistan / Russia","summary":"The Soviet Union intervened militarily in Afghanistan in 1979 and withdrew in 1989; Russia is included as a successor state for historical discovery, not as the original USSR.","impact":"Historical conflict and consequences, not evidence of current fighting.","situation":"Concluded historical intervention; listed for timeline research.","sources":[["Historical background","https://history.state.gov/milestones/1977-1980/soviet-invasion-afghanistan"]]},{"id":"hist-afghanistan-us","title":"U.S.-led invasion of Afghanistan and subsequent war","type":"Historical military intervention","since":"2001–2021","participants":["Afghanistan","United States"],"actors":"Historical states and military forces (see the source for full participants)","where":"Afghanistan / United States","summary":"The United States and allies invaded Afghanistan in 2001. A prolonged war followed until international withdrawal in 2021.","impact":"Historical conflict and consequences, not evidence of current fighting.","situation":"Concluded historical intervention; listed for timeline research.","sources":[["Historical background","https://www.cfr.org/backgrounder/us-war-afghanistan"]]},{"id":"hist-iraq-2003","title":"U.S.-led invasion of Iraq","type":"Historical military intervention","since":"2003","participants":["Iraq","United States"],"actors":"Historical states and military forces (see the source for full participants)","where":"Iraq / United States","summary":"U.S.-led forces invaded Iraq in March 2003 and removed Saddam Hussein's government; prolonged insurgency and occupation followed.","impact":"Historical conflict and consequences, not evidence of current fighting.","situation":"Concluded historical intervention; listed for timeline research.","sources":[["Historical background","https://www.cfr.org/timeline/iraq-war"]]},{"id":"hist-libya-nato","title":"NATO military intervention in Libya","type":"Historical military intervention","since":"2011","participants":["Libya","United States","United Kingdom","France"],"actors":"Historical states and military forces (see the source for full participants)","where":"Libya / United States / United Kingdom / France","summary":"A NATO-led coalition implemented a UN-authorized civilian-protection operation and no-fly zone in Libya in 2011; listed participants are illustrative, not exhaustive.","impact":"Historical conflict and consequences, not evidence of current fighting.","situation":"Concluded historical intervention; listed for timeline research.","sources":[["Historical background","https://www.nato.int/cps/en/natohq/topics_71652.htm"]]},{"id":"hist-panama-us","title":"U.S. invasion of Panama","type":"Historical military intervention","since":"1989","participants":["Panama","United States"],"actors":"Historical states and military forces (see the source for full participants)","where":"Panama / United States","summary":"U.S. forces invaded Panama in December 1989 and ousted Manuel Noriega; relations and internal politics changed afterward.","impact":"Historical conflict and consequences, not evidence of current fighting.","situation":"Concluded historical intervention; listed for timeline research.","sources":[["Historical background","https://history.state.gov/milestones/1989-1992/central-america"]]},{"id":"hist-grenada-us","title":"U.S.-led invasion of Grenada","type":"Historical military intervention","since":"1983","participants":["Grenada","United States"],"actors":"Historical states and military forces (see the source for full participants)","where":"Grenada / United States","summary":"The United States and Caribbean partners invaded Grenada in October 1983 after internal turmoil. This is a historical intervention, not a present conflict.","impact":"Historical conflict and consequences, not evidence of current fighting.","situation":"Concluded historical intervention; listed for timeline research.","sources":[["Historical background","https://history.state.gov/countries/grenada"]]},{"id":"hist-hungary-soviet","title":"Soviet military suppression of the Hungarian uprising","type":"Historical military intervention","since":"1956","participants":["Hungary","Russia"],"actors":"Historical states and military forces (see the source for full participants)","where":"Hungary / Russia","summary":"Soviet forces suppressed the Hungarian revolution in 1956. Russia is indexed only as a present-day successor state of the USSR.","impact":"Historical conflict and consequences, not evidence of current fighting.","situation":"Concluded historical intervention; listed for timeline research.","sources":[["Historical background","https://www.britannica.com/event/Hungarian-Revolution-1956"]]},{"id":"hist-czechoslovakia-soviet","title":"Warsaw Pact invasion of Czechoslovakia","type":"Historical military intervention","since":"1968","participants":["Czechia","Slovakia","Russia"],"actors":"Historical states and military forces (see the source for full participants)","where":"Czechia / Slovakia / Russia","summary":"The Soviet-led Warsaw Pact invasion ended the Prague Spring. Modern Czechia and Slovakia are geographic successors to Czechoslovakia; today's Russia is not the Soviet Union.","impact":"Historical conflict and consequences, not evidence of current fighting.","situation":"Concluded historical intervention; listed for timeline research.","sources":[["Historical background","https://www.britannica.com/event/Prague-Spring"]]},{"id":"hist-kosovo-nato","title":"NATO Kosovo air campaign","type":"Historical military intervention","since":"1999","participants":["Serbia","United States","United Kingdom","France"],"actors":"Historical states and military forces (see the source for full participants)","where":"Serbia / United States / United Kingdom / France","summary":"NATO launched an air campaign against the Federal Republic of Yugoslavia during the Kosovo conflict. Listed NATO members are examples; Kosovo is not a separate country in this 195-country study set.","impact":"Historical conflict and consequences, not evidence of current fighting.","situation":"Concluded historical intervention; listed for timeline research.","sources":[["Historical background","https://www.nato.int/cps/en/natohq/topics_49602.htm"]]},{"id":"hist-east-timor-indonesia","title":"Indonesian invasion and occupation of East Timor","type":"Historical military intervention","since":"1975–1999","participants":["Indonesia","Timor-Leste"],"actors":"Historical states and military forces (see the source for full participants)","where":"Indonesia / Timor-Leste","summary":"Indonesia invaded East Timor in 1975 and occupied it for decades; Timor-Leste gained independence in 2002.","impact":"Historical conflict and consequences, not evidence of current fighting.","situation":"Concluded historical intervention; listed for timeline research.","sources":[["Historical background","https://www.britannica.com/place/East-Timor"]]}];
  for(const event of ADDITIONAL_CASES){
    for(const country of event.participants)(BRIEF.conflict[country] ||= []).push(event);
  }
  const caseCount=type=>Object.keys(BRIEF[type]).length;
  const briefItems=(d,type)=>BRIEF[type][d.country]||[];
  const conflictMatches=(item,selection)=>{
    if(selection==='all')return true;
    if(selection==='interstate')return item.type==='Interstate war'||item.type==='Interstate armed confrontation';
    if(selection==='civil')return /Civil war|insurgenc/i.test(item.type);
    if(selection==='criminal')return item.type==='Organized criminal violence';
    if(selection==='border')return item.type==='Cross-border military operations';
    if(selection==='ceasefire')return item.type==='Fragile ceasefire with continued hostilities'||item.type==='Ceasefire and unresolved security dispute';
    if(selection==='historical')return item.type==='Past military intervention and diplomatic aftermath'||item.type==='Historical military intervention';
    return false;
  };
  const filteredCases=(d,kind)=>{
    const records=briefItems(d,kind);
    return kind==='conflict'?records.filter(x=>conflictMatches(x,$('intelConflictFilter')?.value||'all')):records;
  };
  const briefColor={conflict:'#ee745c',sanctions:'#c89b5c',territory:'#9d8de7'};
  // War/confrontation, fragile ceasefire, and past intervention must not share
  // one red 'active war' color. A country can have multiple associated cases.
  const conflictShade=d=>{
    const cases=filteredCases(d,'conflict');
    if(!cases.length)return null;
    if(cases.some(c=>c.type==='Interstate war'||c.type==='Interstate armed confrontation'||/Civil war|insurgenc|Organized criminal/i.test(c.type)))return '#ee745c';
    if(cases.some(c=>c.type==='Cross-border military operations'))return '#e59150';
    if(cases.some(c=>c.type==='Fragile ceasefire with continued hostilities'||c.type==='Ceasefire and unresolved security dispute'))return '#d8b464';
    return '#6bbac8';
  };
    // One subject per tab; the two conflict datasets live together as a source choice.
  const MAP_SUBJECTS={
    conflicts:{title:'Conflicts & Security',options:[]},
    sanctions:{title:'Sanctions & Disputes',options:[['brief:sanctions','Sanctions & restrictions'],['brief:territory','Territorial disputes']]},
    alliances:{title:'Alliances',options:['nato','eu','brics','asean','g7'].map(k=>['org:'+k,S[k].name])},
    economics:{title:'Economics',options:['gdppc','growth','military','inequality','energy'].map(k=>['wb:'+k,WB[k].name])}
  };
  let mapSubject='conflicts',conflictSource='brief:conflict';
  // Interpretive maps prioritize patterns that are useful to compare. G20, AU,
  // total GDP/population and gross imports/exports stay in country profiles.
  const sourceLink = (url,title) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(title)} ↗</a>`;
  const iso3 = country => String(country?.iso3 || '').toUpperCase();
  const orgMember = (key,country) => key==='au' ? country.region==='Africa' : S[key].members.split(' ').includes(iso3(country));
  let currentSection='capitals',currentView='profile',currentLayer='plain',selected=null,layerToken=0,panelToken=0;
  let wbCache=new Map(),wbPending=new Map(),geoPaint=paint;
  let visibleWB=null;
  let conflict2025=null,conflictRequest=null;
  const side=document.querySelector('.side');
  const controls=document.createElement('section');controls.id='intelControls';controls.hidden=true;
  controls.innerHTML=`<div class="intel-kicker">GLOBAL INTELLIGENCE</div>
    <h2>World intelligence</h2><p class="intel-intro">Explore geopolitical relationships and economic indicators. Select a country or compare global patterns.</p>
    <div class="intel-view-switch" role="group" aria-label="Intelligence workspace">
      <button type="button" data-intel-view="profile" aria-pressed="true">Country profiles</button>
      <button type="button" data-intel-view="map" aria-pressed="false">Explore world maps</button>
    </div>
    <select id="intelView" hidden aria-label="Intelligence workspace"><option value="profile">Country profiles</option><option value="map">World maps</option></select>
    <div id="intelProfileSettings"><label class="intel-lbl" for="intelCountry">Select a country</label><select id="intelCountry"></select>
      <label class="intel-lbl" for="intelTopic">Profile topic</label><select id="intelTopic"><option value="overview">Overview</option><option value="politics">Geopolitics & relations</option><option value="economy">Economics & trade</option><option value="security">Security & conflicts</option></select></div>
    <div id="intelMapSettings" hidden>
      <p class="intel-subtitle">Select a subject</p>
      <div id="intelThemeNav" class="intel-theme-grid" role="group" aria-label="World map subjects">
        <button type="button" data-intel-subject="conflicts" aria-pressed="true">⚔ Conflicts & Security</button>
        <button type="button" data-intel-subject="sanctions" aria-pressed="false">⚖ Sanctions & Disputes</button>
        <button type="button" data-intel-subject="alliances" aria-pressed="false">◎ Alliances</button>
        <button type="button" data-intel-subject="economics" aria-pressed="false">▥ Economics</button>
      </div>
      <div id="intelLayerWrap" hidden>
        <label class="intel-lbl" id="intelLayerLabel" for="intelLayer">Focus</label><select id="intelLayer"></select>
      </div>
      <div id="intelConflictSourceWrap">
        <label class="intel-lbl">Information source</label>
        <div class="intel-source-switch" role="group" aria-label="Conflict information source">
          <button type="button" data-intel-source="brief:conflict" aria-pressed="true">Explained cases</button>
          <button type="button" data-intel-source="conflict:2025" aria-pressed="false">2025 event data</button>
        </div>
        <p class="intel-caveat" id="intelSourceHelp">Explained cases are curated country briefings, reviewed November 6, 2026. Not a live feed.</p>
      </div>
      <div id="intelConflictControls" hidden><label class="intel-lbl" for="intelConflictFilter">Conflict classification</label><select id="intelConflictFilter">
        <option value="all">All documented situations</option>
        <option value="interstate">Interstate wars</option>
        <option value="civil">Civil wars and insurgencies</option>
        <option value="criminal">Organized criminal violence</option>
        <option value="border">Cross-border military operations</option>
        <option value="ceasefire">Ceasefires & peace processes</option>
        <option value="historical">Historical interventions</option>
      </select><p class="intel-caveat">Classification describes the type of violence, not a universal severity ranking.</p></div>
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
  // Theme-specific options are created only when the relevant subject is
  // selected, rather than mixing metrics, organizations, disputes and wars.

  const panel=document.createElement('section');panel.id='intelPanel';panel.hidden=true;
  panel.innerHTML=`<div class="intel-panel-head"><div><small>COUNTRY INTELLIGENCE</small><h3 id="intelTitle">Select a country</h3></div><button type="button" id="intelClose" aria-label="Close intelligence panel">×</button></div><div id="intelPanelBody">Click a country on the globe, or choose one from the menu, to view its profile.</div>`;
  $('globeWrap').append(panel);
  const css=document.createElement('style');css.textContent=`
   #intelControls[hidden],#intelPanel[hidden],#intelMapSettings[hidden],#intelProfileSettings[hidden],#intelLayerWrap[hidden],#intelConflictSourceWrap[hidden],#intelConflictControls[hidden]{display:none!important}
   .intel-view-switch,.intel-source-switch{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:10px 0 16px}
   .intel-view-switch button,.intel-source-switch button{background:#10283f;color:#d1e4f0;border:1px solid #3d6278;border-radius:9px;padding:11px 7px;font-weight:800;font-size:12px;cursor:pointer}
   .intel-view-switch button[aria-pressed=true],.intel-source-switch button[aria-pressed=true]{background:#24665e;color:#effffb;border-color:#6ce3ca}
   .intel-theme-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:10px 0}
   .intel-theme-grid button{min-height:52px;padding:8px 6px;border:1px solid #3d6278;background:#0c263c;color:#c4dae9;border-radius:10px;font-size:11px;font-weight:800;text-align:center;cursor:pointer}
   .intel-theme-grid button[aria-pressed=true]{border-color:#6ce3ca;background:#1e5151;color:#e5fff8}
   .intel-subtitle{font-size:11px;color:#bce4e9;text-transform:uppercase;font-weight:850;letter-spacing:1.1px;margin:14px 0 0}
   #intelSourceHelp{font-size:11px;margin:3px 0 10px}
   .intel-view-switch button:focus-visible,.intel-theme-grid button:focus-visible,.intel-source-switch button:focus-visible{outline:2px solid #8ef7e2;outline-offset:2px}
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
      return kind==='conflict'?(conflictShade(d)||'#596574'):(filteredCases(d,kind).length?briefColor[kind]:'#596574');
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
      const note=type==='conflict'?'Includes direct wars, border operations, fragile ceasefires, organized crime and past interventions. Not all highlighted cases involve ongoing fighting; filter to distinguish them.':
        type==='sanctions'?'Includes country-focused restrictions and specific sanctioned actors; highlighting does NOT mean the entire country is embargoed.':
        'A highlighted country is associated with a claim; the whole national territory is not necessarily disputed.';
      const swatches=type==='conflict'?
        '<div class="intel-pair"><span class="intel-dot" style="background:#ee745c"></span>Armed war or direct confrontation</div>'+
        '<div class="intel-pair"><span class="intel-dot" style="background:#e59150"></span>Cross-border military operations</div>'+
        '<div class="intel-pair"><span class="intel-dot" style="background:#d8b464"></span>Ceasefires and unresolved disputes</div>'+
        '<div class="intel-pair"><span class="intel-dot" style="background:#6bbac8"></span>Historical interventions and aftermath</div>':
        '<div class="intel-pair"><span class="intel-dot" style="background:'+briefColor[type]+'"></span>Documented association</div>';
      el.innerHTML=`<b>${title}</b><div><b>${DATA.filter(d=>filteredCases(d,type).length).length}</b> countries represented by this selection</div>`+swatches+`<div class="intel-pair"><span class="intel-dot no"></span>Not covered by this curated layer</div><p>${note}</p><small>Research snapshot: ${INTEL_REVIEW_DATE}. Click highlighted countries for context and original sources. Not a live or exhaustive global database.</small>`;
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
      return type==='conflict'?(conflictShade(d)||'#344252'):(filteredCases(d,type).length?briefColor[type]:'#344252');
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
      const type=currentLayer.slice(6),items=filteredCases(d,type);
      return `<div style="padding:8px"><b>${name}</b><br>${items.length?esc(items[0].title||items[0].issuer||'Documented case'):'Not included in this selected briefing set'}<br>${items.length&&items[0].situation?esc(items[0].situation):''}<br><small>${INTEL_REVIEW_DATE}</small></div>`;
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
  async function changeLayer(layer=currentLayer){
    currentLayer=layer;visibleWB=null;layerToken++;panelToken++;const token=layerToken;
    $('intelConflictControls').hidden=currentLayer!=='brief:conflict';
    $('intelSourceHelp').textContent=currentLayer==='conflict:2025'
      ? '2025 event records from UCDP via Our World in Data. Historical observations, not a live conflict status or the same as the explained cases.'
      : 'Curated country briefings reviewed November 6, 2026. Coverage is selective and does not imply unhighlighted countries are peaceful.';
    if(currentLayer==='conflict:2025'){
      conflict2025=null;updateLegend();renderLayer();
      const data=await readConflict2025();
      if(token!==layerToken||currentSection!=='intelligence')return;
      conflict2025=data;
    }else if(currentLayer.startsWith('wb:')){
      updateLegend();renderLayer();
      const data=await readLayer(currentLayer.slice(3));
      if(token!==layerToken||currentSection!=='intelligence')return;
      visibleWB=data;
    }
    updateLegend();renderLayer();
    if(currentLayer==='conflict:2025'&&!panel.hidden&&selected)renderTopic();
  }
  function showPanel(d){
    if(!d)return;
    selected=d;panel.hidden=false;$('intelTitle').textContent=d.country;$('intelCountry').value=d.country;
    // Open the topic relevant to the selected map instead of always opening
    // the default overview or a previously selected unrelated topic.
    if(currentView==='map'){
      $('intelTopic').value=
        currentLayer==='brief:territory'||currentLayer==='brief:sanctions'||currentLayer.startsWith('org:')?'politics':
        currentLayer.startsWith('wb:')&&currentLayer!=='wb:military'?'economy':'security';
    }
    renderTopic();renderLayer();
  }
  const briefingLinks=items=>sourceBlock((items||[]).map(([name,url])=>[url,name]));
  function briefingSection(d,type){
    const items=type==='conflict'&&currentView==='map'&&currentLayer==='brief:conflict'
      ?filteredCases(d,type):briefItems(d,type);
    const heading={conflict:'Conflict briefings',sanctions:'Sanctions and restrictions',territory:'Territorial and maritime disputes'}[type];
    if(!items.length)return `<div class="intel-section"><h4>${heading}</h4><p>No curated briefing for this country yet. This does not mean there is no conflict, sanction or dispute.</p></div>`;
    return `<div class="intel-section"><h4>${heading}</h4><p class="intel-source">Research reviewed: ${INTEL_REVIEW_DATE}; not a live status feed. Multiple distinct conflicts may be linked to the same country.</p>${items.map(item=>
      `<article class="intel-brief"><h5>${esc(item.title||item.issuer)}</h5>
        ${item.type?`<span class="intel-brief-type">${esc(item.type)}</span>`:''}
        ${item.since?`<p><b>Since:</b> ${esc(item.since)}</p>`:''}
        ${item.actors?`<p><b>Main actors:</b> ${esc(item.actors)}</p>`:''}
        ${item.where?`<p><b>Geography:</b> ${esc(item.where)}</p>`:''}
        ${item.summary?`<p><b>What is happening:</b> ${esc(item.summary)}</p>`:''}
        ${item.impact?`<p><b>Why it matters:</b> ${esc(item.impact)}</p>`:''}
        ${item.situation?`<p><b>Situation at review:</b> ${esc(item.situation)}</p>`:''}
        ${item.scope?`<p><b>Scope:</b> ${esc(item.scope)}</p>`:''}
        ${item.why?`<p><b>Purpose:</b> ${esc(item.why)}</p>`:''}
        ${item.status?`<p><b>Dispute:</b> ${esc(item.status)}</p>`:''}
        ${briefingLinks(item.sources)}
      </article>`).join('')}</div>`;
  }
  function metricLinks(){return sourceBlock([[urls.trade,'UN Comtrade: top products & trading partners'],[urls.wits,'WITS: trade visualization']]);}
  function renderTopic(){
    if(!selected)return;const d=selected, t=$('intelTopic').value, token=++panelToken;
    const lead=`<p class="intel-country-lead"><span style="font-size:22px">${flagEmoji(d.iso2)}</span> ${esc(d.capital)} · ${esc(d.region)}</p>`;
    if(t==='overview'){
      $('intelPanelBody').innerHTML=lead+`<div class="intel-section"><h4>International organizations & alliances</h4>${orgTags(d)}<p>Verified organization snapshots, ${SOURCE_YEAR}. Membership does not imply identical positions on every policy.</p></div><div class="intel-section"><h4>Economic overview</h4><div id="intelMetricLoad">Loading World Bank indicators…</div></div>`;
      addMetrics(['gdp','gdppc','population','growth'],token);return;
    }
    if(t==='politics'){
      $('intelPanelBody').innerHTML=lead+`<div class="intel-section"><h4>International organizations & alliances</h4>${orgTags(d)}</div><div class="intel-section"><h4>Government & diplomacy</h4><p>Political systems, officeholders, and diplomatic relationships can change. Use these current directories rather than an unverified static classification.</p>${sourceBlock([[urls.leaders,'CIA World Leaders: cabinet and leaders'],['https://www.un.org/en/about-us/member-states','United Nations member-state directory']])}</div><div class="intel-section"><h4>Territorial disputes & sanctions</h4><p>Selected documented territorial claims and sanctions programs appear below. These do not imply blanket sanctions on every resident or that the entire country is disputed. No briefing does not mean no issue exists.</p>${briefingSection(d,'territory')}${briefingSection(d,'sanctions')}</div>`;
      return;
    }
    if(t==='economy'){
      $('intelPanelBody').innerHTML=lead+`<div class="intel-section"><h4>Economy & international trade</h4><div id="intelMetricLoad">Loading latest World Bank indicators…</div><p>Exports/imports here mean <b>goods and services in total</b>, not the largest individual products.</p>${metricLinks()}</div><div class="intel-section"><h4>Natural resources, energy & transport</h4><p>Resource reserves, production, energy import dependence, and major maritime routes should be interpreted from dated sector datasets.</p>${sourceBlock([[urls.resources,'USGS Mineral Commodity Summaries (2026)'],[urls.energy,'IEA energy statistics'],[urls.naval,'UNCTAD maritime trade & transport']])}</div>`;
      addMetrics(['gdp','gdppc','exports','imports','inequality','energy'],token);return;
    }
    const eventIndicator=currentView==='map'&&currentLayer==='conflict:2025'
      ?(conflict2025?.loadFailed?'<p class="intel-warning">2025 event data could not be loaded. Reopen the source to retry.</p>':
        !conflict2025?'<p>Loading the 2025 event dataset…</p>':
        Number.isFinite(conflict2025.get(iso3(d)))?
          `<p class="intel-warning"><b>2025 recorded event indicator:</b> ${conflict2025.get(iso3(d))>0?'At least one documented armed-conflict event':'No recorded armed-conflict event in this dataset'}.</p>`:
          '<p class="intel-warning">No event record available for this country in the 2025 source.</p>')
      :'';
    $('intelPanelBody').innerHTML=lead+`<div class="intel-section"><h4>Security & conflict research</h4>${eventIndicator}<p>Selected country briefings are based on documented reports, reviewed November 6, 2026. They are explanatory snapshots, not live front-line or sanctions databases. Countries without a briefing have not been assessed as peaceful or unsanctioned.</p>${briefingSection(d,'conflict')}${briefingSection(d,'sanctions')}${briefingSection(d,'territory')}</div><div class="intel-section"><h4>Defense expenditure</h4><div id="intelMetricLoad">Loading World Bank / SIPRI series…</div><p>Military expenditure is measured as a percentage of GDP, not the size of an arsenal.</p></div>`;
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
      if(token!==panelToken||currentSection!=='intelligence'||iso3(selected)!==iso)return;
      const slot=$('intel-obs-'+i);if(!slot)return;
      slot.outerHTML=observation?.loadFailed
       ? `<div class="intel-metric"><small>${esc(WB[key].name)}</small><strong>Temporarily unavailable</strong><em>Network issue — reopen this country to retry</em></div>`
       : wbMeta(key,observation);
    }));
  }
  function setMapSubject(subject){
    if(!MAP_SUBJECTS[subject])return;
    if(mapSubject!==subject&&currentView==='map'){panel.hidden=true;selected=null}
    mapSubject=subject;
    $('intelThemeNav').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.intelSubject===subject)));
    const isConflict=subject==='conflicts';
    $('intelConflictSourceWrap').hidden=!isConflict;
    $('intelLayerWrap').hidden=isConflict;
    $('intelConflictControls').hidden=!isConflict||conflictSource!=='brief:conflict';
    if(isConflict){
      document.querySelectorAll('[data-intel-source]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.intelSource===conflictSource)));
      changeLayer(conflictSource);
    }else{
      const obj=MAP_SUBJECTS[subject];
      $('intelLayerLabel').textContent=subject==='sanctions'?'Choose a focus':subject==='alliances'?'Organization':'Economic indicator';
      const select=$('intelLayer'),previous=select.value;
      select.replaceChildren(...obj.options.map(([value,label])=>{const el=document.createElement('option');el.value=value;el.textContent=label;return el}));
      select.value=obj.options.some(([value])=>value===previous)?previous:obj.options[0][0];
      changeLayer(select.value);
    }
  }
  function refreshView(){
    currentView=$('intelView').value;
    $('intelProfileSettings').hidden=currentView!=='profile';$('intelMapSettings').hidden=currentView!=='map';
    if(currentView==='profile'){$('intelLayer').value='plain';currentLayer='plain';visibleWB=null;updateLegend();renderLayer();if(selected)showPanel(selected);}
    else{panel.hidden=true;setMapSubject(mapSubject);}
  }
  document.querySelectorAll('[data-intel-view]').forEach(button=>button.addEventListener('click',()=>{
    const view=button.dataset.intelView;
    if($('intelView').value===view)return;
    $('intelView').value=view;
    document.querySelectorAll('[data-intel-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.intelView===view)));
    refreshView();
  }));
  $('intelThemeNav').addEventListener('click',e=>{
    const b=e.target.closest('button[data-intel-subject]');
    if(b)setMapSubject(b.dataset.intelSubject);
  });
  document.querySelectorAll('[data-intel-source]').forEach(button=>button.addEventListener('click',()=>{
    conflictSource=button.dataset.intelSource;
    document.querySelectorAll('[data-intel-source]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    $('intelConflictControls').hidden=conflictSource!=='brief:conflict';
    changeLayer(conflictSource);
  }));
  $('intelView').addEventListener('change',refreshView);
  $('intelTopic').addEventListener('change',renderTopic);
  $('intelCountry').addEventListener('change',()=>{const d=byName[$('intelCountry').value];if(!d)return;
    if(globe)globe.pointOfView({lat:d.lat,lng:d.lng,altitude:1.55},650);showPanel(d);
  });
  $('intelLayer').addEventListener('change',()=>changeLayer($('intelLayer').value));
  $('intelConflictFilter').addEventListener('change',()=>{if(currentLayer==='brief:conflict'){updateLegend();renderLayer()}});
  // Returning to the global map with conflict layer selected keeps its filter.

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
    if(!active){layerToken++;panelToken++;selected=null;visibleWB=null;currentLayer='plain';geoPaint();return;}
    $('qLabel').textContent='GLOBAL INTELLIGENCE';$('qTitle').textContent='Explore international relations and global trade';
    $('qSub').textContent='Click a country, or choose a map layer to explore global patterns.';
    currentView='profile';$('intelView').value='profile';$('intelTopic').value='overview';currentLayer='plain';
    document.querySelectorAll('[data-intel-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.intelView==='profile')));
    refreshView();
    // Selection in intelligence mode is never constrained by geography practice regions.
    states.region='All';if(globe)globe.pointOfView(places.All,450);
  });
  updateLegend();
})();
