/* Atlas Quest V4.5 — fixed Seterra-style geography maps and nearest-dot selection. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const N = 'http://www.w3.org/2000/svg';
  const ranges = {
    All:[-180,-58,180,85],
    Africa:[-21,-37,53,40],
    Asia:[24,-13,181,79],
    Europe:[-16,32,48,73],
    'North America':[-170,5,-48,75],
    'South America':[-85,-58,-32,15],
    Oceania:[108,-51,211,12]
  };
  const region = () => $('region').value;
  const wrap = $('globeWrap');
  let currentSection = 'capitals', flat = false, zoom = 1;
  const css = document.createElement('style');
  css.textContent = `
    #flatMapShell{position:absolute;inset:0;display:none;z-index:1;background:linear-gradient(140deg,#11273e,#07192b);overflow:hidden}
    #globeWrap.flat-active #flatMapShell{display:block}
    #globeWrap.flat-active #globe{visibility:hidden;pointer-events:none}
    #globeWrap.flat-active #resetView{display:none!important}
    #flatMapMain{height:100%;width:100%;touch-action:pan-y;display:block;cursor:default}
     .flat-land{stroke:#a6c8bc;stroke-width:.7;vector-effect:non-scaling-stroke;transition:fill .12s;cursor:pointer}
    /* One hover target at a time: the nearest island dot OR a country polygon. */
    .flat-land.active{stroke:#fff;stroke-width:1.8;fill:#35ad65!important;filter:brightness(1.2)}
    .flat-pin.near{fill:#fff!important;stroke:#f6aa33!important;stroke-width:1.6}
    .flat-pin{fill:#fff3bd;stroke:#24443b;stroke-width:.7;pointer-events:none}
    .flat-land{cursor:pointer}
     .flat-inset{position:absolute;bottom:15px;width:min(38%,340px);height:190px;background:#a9d3dd;border:1px solid #7b9db8;border-radius:11px;overflow:hidden;box-shadow:0 8px 22px #0008}
    .flat-inset.caribbean{left:14px}.flat-inset.oceania{right:14px}
     .flat-inset h4{margin:0;padding:7px 9px;font-size:11px;letter-spacing:.35px;font-weight:800;color:#eefbf6;background:#2b6c64}
    .flat-inset svg{width:100%;height:calc(100% - 29px);display:block}
    #flatMapLabel{position:absolute;top:8px;left:13px;font-size:11px;color:#c0d7e9;background:#091b30bb;border:1px solid #45667b;border-radius:7px;padding:5px 9px;pointer-events:none}
    #flatZoom{position:absolute;right:15px;top:12px;bottom:auto;display:flex;gap:5px}
    #flatZoom button{background:#132d44;border:1px solid #58758d;color:#ecf7ff;border-radius:8px;font-weight:800;padding:8px 12px}
    .flat-map-switch{border:1px solid #476980;background:#092238;border-radius:10px;padding:10px 10px 11px;margin:3px 0 12px}
    .flat-map-switch label{color:#c6e1ea;font-size:11px;letter-spacing:1px;font-weight:800;text-transform:uppercase;display:block;margin-bottom:7px}
    .flat-map-switch .flat-buttons{display:grid;grid-template-columns:1fr 1fr;gap:5px}
    .flat-map-switch button{border:1px solid #54718b;background:#102b44;color:#d2e7f2;padding:8px;border-radius:7px;font-size:12px;font-weight:750}
    .flat-map-switch button[aria-pressed=true]{background:#48c8b6;color:#032625;border-color:#48c8b6}
    .side[data-section=intelligence] .flat-map-switch{display:none}
    #globeWrap.flat-active #loading{display:none!important}
    @media(max-width:700px){.flat-inset{width:42%;height:136px;bottom:14px}.flat-inset h4{font-size:10px;padding:5px}.flat-inset svg{height:calc(100% - 24px)}#flatZoom{top:8px;right:8px;bottom:auto}#flatMapLabel{font-size:10px}}
  `;document.head.appendChild(css);
  const menu = document.createElement('div');menu.className='flat-map-switch';
  menu.innerHTML='<label>Geography map view</label><div class="flat-buttons"><button type="button" data-view="globe" aria-pressed="true">3D Globe</button><button type="button" data-view="flat" aria-pressed="false">2D Flat Map</button></div>';
  document.querySelector('.side').insertBefore(menu, $('setupControls'));
  const shell=document.createElement('div');shell.id='flatMapShell';
  shell.innerHTML='<svg id="flatMapMain" viewBox="0 0 1000 530" aria-label="Interactive flat map of countries" role="img"></svg><div id="flatMapLabel"></div><div id="flatZoom"><button type="button" id="flatZoomOut" aria-label="Zoom out">−</button><button type="button" id="flatZoomIn" aria-label="Zoom in">+</button></div>';
  wrap.appendChild(shell);
  const main=$('flatMapMain');
  const make=(type)=>document.createElementNS(N,type);
  // Keep one coordinate scale in BOTH axes. The previous code mapped longitude
  // and latitude independently onto the full rectangle and stretched Africa.
  // A Mercator y-coordinate with equal x/y scaling preserves local angles,
  // while each region is FIT inside the canvas with generous edge padding.
  const mercator = lat => {
    const phi=Math.max(-79,Math.min(84,lat))*Math.PI/180;
    return Math.log(Math.tan(Math.PI/4+phi/2))*180/Math.PI;
  };
  function frame(bounds,w,h,pad=25){
    const minY=mercator(bounds[1]),maxY=mercator(bounds[3]);
    const spanX=bounds[2]-bounds[0],spanY=maxY-minY;
    const scale=Math.min((w-pad*2)/spanX,(h-pad*2)/spanY);
    return {minX:bounds[0],maxX:bounds[2],maxY,scale,
      xoff:(w-spanX*scale)/2,yoff:(h-spanY*scale)/2,
      wrap:bounds[2]>180};
  }
  function project(lon,lat,fit){
    if(fit.wrap&&lon<0)lon+=360;
    return [fit.xoff+(lon-fit.minX)*fit.scale,
            fit.yoff+(fit.maxY-mercator(lat))*fit.scale];
  }
  function shape(geometry,fit,w){
    if(!geometry)return '';
    const polygons=geometry.type==='Polygon'?[geometry.coordinates]:geometry.coordinates||[];
    let result='';
    for(const poly of polygons)for(const ring of poly){
      let previous=null,part='';
      for(const c of ring){
        if(!c||!Number.isFinite(c[0])||!Number.isFinite(c[1]))continue;
        const [x,y]=project(c[0],c[1],fit);
        if(previous&&Math.abs(x-previous[0])>w*.58){result+=part;part='';previous=null}
        part+=(previous?'L':'M')+x.toFixed(1)+' '+y.toFixed(1);
        previous=[x,y];
      }
      result+=part+'Z';
    }
    return result;
  }
  function selectable(d){return region()==='All'||d.region===region()}
  function color(name){
    const d=byName[name];if(!d)return '#36525b';
    if(!selectable(d))return '#727e80';
    if(states.answered&&states.current?.country===name)return '#50d58e';
    if(states.answered&&states.selected===name)return '#df856f';
    return '#22814b';
  }
  const areaMarkers=new WeakMap();
  // Every microstate and small island remains in the study set. Countries
  // already represented by polygons are normally selected by their shapes.
  const hasPolygon=new Set(BORDERS.map(f=>f.properties?.country));
  const insetRegion={'caribbean':'North America','oceania':'Oceania'};
  function draw(svg,bounds,w,h,insetType=''){
    svg.replaceChildren();
    const fit=frame(bounds,w,h,w<500?13:36);
    const base=make('rect');base.setAttribute('width',w);base.setAttribute('height',h);base.setAttribute('fill','#a6cedc');svg.appendChild(base);
    const viewRegion=region(),hasInsetCaribbean=(viewRegion==='All'||viewRegion==='North America');
    const hasInsetOceania=(viewRegion==='All'||viewRegion==='Oceania');
    const regionForInset=insetRegion[insetType];
    for(const f of BORDERS){
      const c=f.properties?.country,d=byName[c];if(!d)continue;
      const str=shape(f.geometry,fit,w);if(!str)continue;
      const path=make('path');path.setAttribute('d',str);path.setAttribute('class','flat-land');
      path.dataset.country=c;path.setAttribute('fill',color(c));svg.appendChild(path);
    }
    const pins=[];
    for(const d of DATA){
      if(!d.pin || (insetType&&d.region!==regionForInset))continue;
      if(!insetType){
        // Seterra-style world layout: Caribbean and Pacific microstates are
        // identified in their enlarged inset, not duplicated on the world map.
        if(hasInsetCaribbean&&d.region==='North America')continue;
        if(hasInsetOceania&&d.region==='Oceania')continue;
        // With regional zoom, existing country polygons are easier to use.
        // Keep pin only if the source data has no polygon in that region.
        if(viewRegion!=='All'&&hasPolygon.has(d.country))continue;
      }
      const [x,y]=project(d.lng,d.lat,fit);
      if(x<0||x>w||y<0||y>h)continue;
      // Markers are the same visually small size everywhere. No overlapping
      // giant hit circles: hit-testing is based on nearest coordinates.
      const dot=make('circle');dot.setAttribute('cx',x.toFixed(1));dot.setAttribute('cy',y.toFixed(1));
      dot.setAttribute('r',insetType?4.4:2.8);dot.classList.add('flat-pin');dot.dataset.country=d.country;
      svg.appendChild(dot);pins.push({country:d.country,x,y,dot});
    }
    areaMarkers.set(svg,{pins,fit,w,h,inset:!!insetType});
    const resolveTarget=ev=>{
      const record=areaMarkers.get(svg);
      const polygon=ev.target.closest?.('path[data-country]')||null;
      const nearest=nearMarker(svg,ev);
      const cutoff=polygon?(record?.inset?7:4.2):(record?.inset?17:11);
      // A dot wins only when it is close enough; otherwise any underlying
      // land polygon wins. Never allow both to appear selected.
      if(nearest&&nearest.screenDistance<=cutoff)return {type:'dot',country:nearest.country};
      return polygon?{type:'polygon',country:polygon.dataset.country}:null;
    };
    const hoverTarget=target=>{
      for(const path of svg.querySelectorAll('path[data-country]')){
        path.classList.toggle('active',target?.type==='polygon'&&target.country===path.dataset.country);
      }
      for(const dot of svg.querySelectorAll('circle.flat-pin')){
        dot.classList.toggle('near',target?.type==='dot'&&target.country===dot.dataset.country);
      }
      svg.style.cursor=target?'pointer':'default';
    };
    if(!svg.dataset.hitTesting){
      svg.dataset.hitTesting='1';
      svg.addEventListener('click',ev=>{
        const target=resolveTarget(ev);
        if(target)chooseCountry(target.country);
      });
      svg.addEventListener('pointermove',ev=>hoverTarget(resolveTarget(ev)));
      svg.addEventListener('pointerleave',()=>hoverTarget(null));
    }
  }

  function nearMarker(svg,ev){
    const r=areaMarkers.get(svg);if(!r?.pins.length)return null;
    const ctm=svg.getScreenCTM?.();
    if(!ctm)return null;
    // getScreenCTM accounts for actual viewport size, insets, SVG aspect ratio
    // and the world-map's optional 1.4x zoom.
    const x=ev.clientX-ctm.e,y=ev.clientY-ctm.f;
    const determinant=ctm.a*ctm.d-ctm.b*ctm.c;
    if(Math.abs(determinant)<1e-9)return null;
    const px=(ctm.d*x-ctm.c*y)/determinant,py=(-ctm.b*x+ctm.a*y)/determinant;
    let nearest=null,distance=Infinity;
    for(const item of r.pins){
      const dx=item.x-px,dy=item.y-py;
      // Real screen-pixel distance: nearest-target rules stay consistent even
      // when the inset has a different size than the main map.
      const sx=ctm.a*dx+ctm.c*dy,sy=ctm.b*dx+ctm.d*dy;
      const d=Math.hypot(sx,sy);
      if(d<distance){distance=d;nearest=item}
    }
    return nearest?{...nearest,screenDistance:distance}:null;
  }
  function inset(label,className,bounds){
    const box=document.createElement('div');box.className='flat-inset '+className;
    const title=document.createElement('h4');title.textContent=label;
    const svg=make('svg');svg.setAttribute('viewBox','0 0 400 245');
    svg.setAttribute('aria-label',label+' clickable inset');
    box.append(title,svg);shell.append(box);
    draw(svg,bounds,400,245,className);
    return box;
  }
  const regionLabel = {
    All:'World • Countries and capitals',
    Africa:'Africa',Asia:'Asia',Europe:'Europe',
    'North America':'North America', 'South America':'South America',Oceania:'Oceania'
  };
  // The world remains fixed like Seterra. Limited 1–1.4x zoom is available,
  // but free panning is intentionally disabled.
  function boundsToViewBox(){
    zoom=Math.max(1,Math.min(1.4,zoom));
    const w=1000/zoom,h=530/zoom;
    main.setAttribute('viewBox',`${((1000-w)/2).toFixed(2)} ${((530-h)/2).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`);
  }
  function updateMap(){
    const r=region(),b=ranges[r]||ranges.All;
    draw(main,b,1000,530);
    shell.querySelectorAll('.flat-inset').forEach(el=>el.remove());
    if(r==='All'||r==='North America')inset('Caribbean islands','caribbean',[-88,8,-58,28]);
    if(r==='All'||r==='Oceania')inset('Oceania / Pacific islands','oceania',[110,-44,211,21]);
    $('flatMapLabel').textContent=regionLabel[r]||r;
    zoom=1;boundsToViewBox();refreshColors();
  }
  function refreshColors(){
    shell.querySelectorAll('[data-country]').forEach(el=>{
      const name=el.dataset.country,d=byName[name];
      if(el.tagName.toLowerCase()==='path')el.setAttribute('fill',color(name));
      else {
        el.setAttribute('fill',!d||!selectable(d)?'#53616e':states.answered&&states.current?.country===name?'#50f5c0':'#fbc76d');
        el.style.opacity=d&&selectable(d)?'1':'.4';
      }
      if(currentSection==='explore')el.setAttribute('aria-label',name);
      else el.setAttribute('aria-label','Select country');
    });
  }
  function visibility(){
    const show=flat&&currentSection!=='intelligence';
    wrap.classList.toggle('flat-active',show);
    menu.hidden=currentSection==='intelligence';
    if(show){updateMap();requestAnimationFrame(()=>{if(globe)globe.controls().enabled=false})}
    else if(globe)globe.controls().enabled=true;
  }
  menu.addEventListener('click',ev=>{
    const button=ev.target.closest('button[data-view]');if(!button)return;
    flat=button.dataset.view==='flat';
    menu.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    visibility();
  });
  $('region').addEventListener('change',()=>{
    if(currentSection==='countries'||currentSection==='capitals'){
      if(globe)globe.pointOfView({...places[region()]},500);
    }
    if(flat)updateMap();
  });
  window.addEventListener('atlas:section',e=>{currentSection=e.detail.section;visibility()});
  const priorPaint=paint;
  paint=function(){priorPaint();if(flat)refreshColors()};
  $('flatZoomIn').addEventListener('click',()=>{zoom=Math.min(1.4,zoom+.2);boundsToViewBox()});
  $('flatZoomOut').addEventListener('click',()=>{zoom=Math.max(1,zoom-.2);boundsToViewBox()});
  main.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(1,Math.min(1.4,zoom+(e.deltaY<0?.1:-.1)));boundsToViewBox()},{passive:false});
  // Deliberately no pointer drag handler: 2D navigation stays stable.
  document.documentElement.dataset.atlasMap='seterra-quiz-map-v4.5';
})();
