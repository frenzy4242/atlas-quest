/* Atlas Quest trade research — optional, source-backed HS2 merchandise data. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const host=$('intelPanelBody');if(!host)return;
 const esc=x=>String(x??'').replace(/[&<>\"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[ch]));
 const cache=new Map();
 let active=0;
 const source='<a href="https://comtradeplus.un.org/" target="_blank" rel="noopener noreferrer">UN Comtrade official source ↗</a>';
 const fmt=v=>Math.abs(v)>=1e9?'$'+(v/1e9).toFixed(2)+'B':Math.abs(v)>=1e6?'$'+(v/1e6).toFixed(1)+'M':'$'+Math.round(v).toLocaleString();
 const wait=ms=>new Promise(ok=>setTimeout(ok,ms));
 async function json(url){
   let error;for(let i=0;i<2;i++){
     const c=new AbortController(),timer=setTimeout(()=>c.abort(),12000);
     try{const r=await fetch(url,{signal:c.signal});if(!r.ok)throw Error('HTTP '+r.status);return await r.json()}
     catch(e){error=e;if(i===0)await wait(800)}finally{clearTimeout(timer)}
   }throw error;
 }
 async function flow(code,year,direction){
   const url='https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode='+code+'&period='+year+'&partnerCode=0&cmdCode=AG2&flowCode='+direction+'&maxRecords=200';
   const r=await json(url);
   return (r.data||r.dataset||[]).filter(x=>String(x.cmdCode||'').length===2&&Number(x.primaryValue)>0&&(x.partnerCode==null||Number(x.partnerCode)===0))
      .sort((a,b)=>Number(b.primaryValue)-Number(a.primaryValue)).slice(0,6);
 }
 async function bestFlow(code,direction){
   for(const year of [2025,2024,2023]){
     try{const rows=await flow(code,year,direction);if(rows.length)return{year,rows}}
     catch(e){/* Older reported years may still be available. */}
   }return null;
 }
 const table=(label,result)=>!result?'<p>Product-level observations not returned for this flow.</p>':
   '<h5 style="margin:13px 0 5px">'+label+' — '+result.year+'</h5><ol style="padding:0 0 0 21px;margin:0">'+result.rows.slice(0,5).map(d=>
     '<li style="margin:7px 0">'+esc(d.cmdDesc||('HS '+d.cmdCode))+' · <b>'+esc(fmt(Number(d.primaryValue)))+'</b></li>').join('')+'</ol>';
 async function run(selected,nonce){
   const out=$('atlasTradeResult');if(!out)return;
   out.textContent='Retrieving UN Comtrade trade categories…';
   try{
     let result=cache.get(selected);
     if(!result){
       const country=DATA.find(d=>d.country===selected);
       if(!country)throw Error('Country not found');
       const numericRow=await json('https://restcountries.com/v3.1/alpha/'+encodeURIComponent(country.iso2)+'?fields=ccn3');
       const code=String((Array.isArray(numericRow)?numericRow[0]:numericRow)?.ccn3||'');
       if(!/^\d{3}$/.test(code))throw Error('UN numeric code unavailable');
       const [exports,imports]=await Promise.all([bestFlow(code,'X'),bestFlow(code,'M')]);
       result={exports,imports};if(exports||imports)cache.set(selected,result);
     }
     if(nonce!==active||$('intelCountry').value!==selected||$('intelTopic').value!=='economy')return;
     out.innerHTML=table('Largest goods exports',result.exports)+table('Largest goods imports',result.imports)+
       '<p style="font-size:10px;color:#b2c7d8;margin:12px 0">Values reflect reported merchandise trade in broad HS 2-digit product groups. Reporting years can differ. Public previews are limited and may omit observations; figures are not substitutes for the full database.</p>'+source;
   }catch(e){
     if(nonce!==active)return;
     out.innerHTML='<p>Trade details are temporarily unavailable (the public API may be rate-limited). Try again later.</p>'+source;
   }
 }
 function addTrade(){
   if($('intelTopic')?.value!=='economy'||host.querySelector('#atlasTradeSection'))return;
   if(!host.querySelector('.intel-section'))return;
   active++;
   const section=document.createElement('section');section.className='intel-section';section.id='atlasTradeSection';
   section.innerHTML='<h4>Major imported and exported products</h4><p>See what a country trades, not just its total trade value. Data is retrieved only when requested.</p><button type="button" id="atlasTradeLoad" style="background:#144b56;border:1px solid #5e9d9b;color:white;border-radius:8px;padding:9px 12px;cursor:pointer">Load trade products</button><div id="atlasTradeResult"></div>';
   host.appendChild(section);
   section.querySelector('button').addEventListener('click',()=>{const country=$('intelCountry').value;if(!country)return;run(country,++active)});
 }
 new MutationObserver(addTrade).observe(host,{childList:true});
 addTrade();
})();