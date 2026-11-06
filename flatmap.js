/* Atlas Quest V4.4 — proportionally projected flat map with inset study regions. */
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
  let currentSection = 'capitals', flat = false, zoom = 1, offsetX = 0, offsetY = 0;
  const css = document.createElement('style');
  css.textContent = `
    #flatMapShell{position:absolute;inset:0;display:none;z-index:1;background:linear-gradient(140deg,#11273e,#07192b);overflow:hidden}
    #globeWrap.flat-active #flatMapShell{display:block}
    #globeWrap.flat-active #globe{visibility:hidden;pointer-events:none}
    #globeWrap.flat-active #resetView{display:none!important}
    #flatMapMain{height:100%;width:100%;touch-action:pan-y;display:block;cursor:grab}
    #flatMapMain.dragging{cursor:grabbing}
    .flat-land{stroke:#91afc1;stroke-width:.7;vector-effect:non-scaling-stroke;transition:fill .12s;cursor:pointer}
    .flat-land:hover{stroke:#e9ffff;stroke-width:1.8;filter:brightness(1.25)}
    .flat-pin{fill:#ffcc73;stroke:#081c32;stroke-width:1;cursor:pointer}
    .flat-pin:hover{fill:#f8ffff;stroke:#ffe69b;stroke-width:2}
    .flat-inset{position:absolute;bottom:15px;width:min(30%,238px);height:176px;background:#0c243bbf;border:1px solid #7b9db8;border-radius:11px;overflow:hidden;box-shadow:0 8px 22px #0008}
    .flat-inset.caribbean{left:14px}.flat-inset.oceania{right:14px}
    .flat-inset h4{margin:0;padding:7px 9px;font-size:11px;letter-spacing:.35px;font-weight:800;color:#e3f2ff;background:#092038}
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
    @media(max-width:700px){.flat-inset{width:37%;height:123px;bottom:14px}.flat-inset h4{font-size:10px;padding:5px}.flat-inset svg{height:calc(100% - 24px)}#flatZoom{top:8px;right:8px;bottom:auto}#flatMapLabel{font-size:10px}}
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
    const d=byName[name];if(!d)return '#28374a';
    if(!selectable(d))return '#333b48';
    if(states.answered&&states.current?.country===name)return '#42ddae';
    if(states.answered&&states.selected===name)return '#ec896f';
    return '#2b7792';
  }
  function draw(svg,bounds,w,h,markerSize){
    svg.replaceChildren();
    // Insets receive their own fitted map, never an independently stretched image.
    const fit=frame(bounds,w,h,w<500?13:36);
    const base=make('rect');base.setAttribute('width',w);base.setAttribute('height',h);base.setAttribute('fill','#112b40');svg.appendChild(base);
    for(const f of BORDERS){
      const c=f.properties?.country,d=byName[c];if(!d)continue;
      const path=make('path'),str=shape(f.geometry,fit,w);if(!str)continue;
      path.setAttribute('d',str);path.setAttribute('class','flat-land');
      path.dataset.country=c;path.setAttribute('fill',color(c));
      path.addEventListener('click',ev=>{ev.stopPropagation();chooseCountry(c)});
      svg.appendChild(path);
    }
    for(const d of DATA.filter(x=>x.pin)){
      const [x,y]=project(d.lng,d.lat,fit);
      if(x<0||x>w||y<0||y>h)continue;
      // Wider transparent touch area but a restrained visible circular dot.
      // Mainland microstates receive a much tighter hit zone so clicking Spain
      // near Andorra is unlikely to register as Andorra.
      const dense=['Andorra','Monaco','Vatican City','San Marino','Liechtenstein','Luxembourg','Malta','Singapore'];
      const tight=dense.includes(d.country);
      const hit=make('circle');hit.setAttribute('cx',x.toFixed(1));hit.setAttribute('cy',y.toFixed(1));
      hit.setAttribute('r',tight?Math.min(markerSize+1,4.4):Math.max(markerSize+2,6.3));
      hit.setAttribute('fill','transparent');hit.style.cursor='pointer';hit.dataset.country=d.country;
      hit.addEventListener('click',ev=>{ev.stopPropagation();chooseCountry(d.country)});
      svg.appendChild(hit);
      const dot=make('circle');dot.setAttribute('cx',x.toFixed(1));dot.setAttribute('cy',y.toFixed(1));
      dot.setAttribute('r',tight?Math.min(markerSize,2.4):Math.min(markerSize,3.5));
      dot.classList.add('flat-pin');dot.dataset.country=d.country;
      dot.addEventListener('click',ev=>{ev.stopPropagation();chooseCountry(d.country)});
      svg.appendChild(dot);
    }
  }
  function inset(label,className,bounds){
    const box=document.createElement('div');box.className='flat-inset '+className;
    const title=document.createElement('h4');title.textContent=label;
    const svg=make('svg');svg.setAttribute('viewBox','0 0 400 245');
    svg.setAttribute('aria-label',label+' clickable inset');
    box.append(title,svg);shell.append(box);
    draw(svg,bounds,400,245,5.3);
    return box;
  }
  const regionLabel = {
    All:'World • Countries and capitals',
    Africa:'Africa',Asia:'Asia',Europe:'Europe',
    'North America':'North America', 'South America':'South America',Oceania:'Oceania'
  };
  function boundsToViewBox(){
    const w=1000/zoom,h=530/zoom;
    const x=(1000-w)/2+offsetX,y=(530-h)/2+offsetY;
    main.setAttribute('viewBox',`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`);
  }
  function updateMap(){
    const r=region(),b=ranges[r]||ranges.All;
    draw(main,b,1000,530,r==='All'?3.3:4);
    shell.querySelectorAll('.flat-inset').forEach(el=>el.remove());
    if(r==='All'||r==='North America')inset('Caribbean islands','caribbean',[-88,8,-58,28]);
    if(r==='All'||r==='Oceania')inset('Oceania / Pacific islands','oceania',[110,-44,211,21]);
    $('flatMapLabel').textContent=regionLabel[r]||r;
    zoom=1;offsetX=0;offsetY=0;boundsToViewBox();refreshColors();
  }
  function refreshColors(){
    shell.querySelectorAll('[data-country]').forEach(el=>{
      const name=el.dataset.country,d=byName[name];
      if(el.tagName.toLowerCase()==='path')el.setAttribute('fill',color(name));
      else {
        el.style.fill=!d||!selectable(d)?'#53616e':states.answered&&states.current?.country===name?'#50f5c0':'#fbc76d';
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
  $('flatZoomIn').addEventListener('click',()=>{zoom=Math.min(6,zoom*1.45);boundsToViewBox()});
  $('flatZoomOut').addEventListener('click',()=>{zoom=Math.max(1,zoom/1.45);if(zoom===1){offsetX=0;offsetY=0}boundsToViewBox()});
  main.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(1,Math.min(6,zoom*(e.deltaY<0?1.17:.85)));boundsToViewBox()},{passive:false});
  let pan=null;
  main.addEventListener('pointerdown',e=>{if(e.target.closest('path,circle'))return;pan={x:e.clientX,y:e.clientY,startX:offsetX,startY:offsetY};main.setPointerCapture(e.pointerId);main.classList.add('dragging')});
  main.addEventListener('pointermove',e=>{if(!pan)return;const rect=main.getBoundingClientRect();offsetX=pan.startX-(e.clientX-pan.x)*1000/(Math.max(rect.width,1)*zoom);offsetY=pan.startY-(e.clientY-pan.y)*530/(Math.max(rect.height,1)*zoom);boundsToViewBox()});
  main.addEventListener('pointerup',()=>{pan=null;main.classList.remove('dragging')});
  document.documentElement.dataset.atlasMap='flat-map-ready';
})();
