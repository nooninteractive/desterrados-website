const points = window.DESTERRADOS_MAP || [];
const zoneType = window.DESTERRADOS_ZONE_TYPE;
const types = {base:'CAMPAMENTO BASE',pvp:'ZONA MILITAR / PVP',rp:'BASE MILITAR / ROLEPLAY',trader:'SERVICIOS / TRADERS',medical:'SERVICIOS / MÉDICOS',market:'INTERCAMBIO / MERCADO NEGRO'};
for (const point of points) {
  const location = window.DESTERRADOS_CONFIG?.mapLocations?.[point.id];
  if (location && Number.isFinite(location.lat) && Number.isFinite(location.lng) && Math.abs(location.lat)<=85 && Math.abs(location.lng)<=180) {
    point.lat=location.lat;point.lng=location.lng;point.confirmed=location.confirmed===true;
  }
  if(location?.rp===true && point.military) point.rp=true;
  point.type=zoneType(point);
}
let selected='base-camp',filter='all',locationQuery='';
const list=document.querySelector('#point-list');
const mapElement=document.querySelector('#charnarus-map');
let map,pointLayer,resourceLayer,labelLayer;
const pointMarkers=new Map();
const located=point=>Number.isFinite(point.lat)&&Number.isFinite(point.lng);
function selectPoint(id,pan=true){
  const point=points.find(p=>p.id===id);if(!point)return;selected=id;
  document.querySelector('#detail-type').textContent=types[point.type]||'PUNTO DE INTERÉS';
  document.querySelector('#detail-name').textContent=point.name;
  document.querySelector('#detail-description').textContent=point.description||(point.type==='rp'?'Esta base está marcada como Base Militar (RP) y queda exceptuada de la regla general de combate PvP militar. Consulta las normas de roleplay antes de acceder.':'Instalación militar de Charnarus. Toda base militar que no esté marcada expresamente como Base Militar (RP) es una zona de PvP. Planifica la entrada y vigila los accesos.');
  document.querySelector('#detail-location').textContent=point.gamePosition?`COORDENADAS DAYZ · X ${point.gamePosition.x} · Z ${point.gamePosition.z}${Number.isFinite(point.gamePosition.y)?' · ALTURA Y '+point.gamePosition.y:''}`:located(point)?'POSICIÓN CARTOGRÁFICA VERIFICADA · '+(point.positionSource||'Ubicación del servidor'):'UBICACIÓN POR CONFIRMAR · SERVIDOR EN DESARROLLO';
  document.querySelector('#detail-icon').textContent=point.icon;
  document.querySelector('#detail-rule-title').textContent=point.rule||(point.type==='rp'?'Base Militar (RP)':'ZONA PVP');
  document.querySelector('#detail-rule-text').textContent=point.ruleText||(point.type==='rp'?'Excepción a la regla militar de PvP. Se aplica la normativa de roleplay.':'Combate PvP en las bases militares, salvo las identificadas como RP. El marcador indica una posición, no los límites de la zona.');
  document.querySelectorAll('.point-item').forEach(el=>{const active=el.dataset.id===id;el.classList.toggle('is-active',active);el.setAttribute('aria-pressed',String(active));});
  if(map&&located(point)&&pan){map.setView([point.lat,point.lng],Math.max(map.getZoom(),4));pointMarkers.get(id)?.openTooltip();}
}
function renderPoints(){
  const visible=points.filter(p=>(filter==='all'||p.type===filter)&&p.name.toLocaleLowerCase('es').includes(locationQuery));list.replaceChildren();pointLayer?.clearLayers();pointMarkers.clear();
  document.querySelector('#point-count').textContent=`${visible.length} PUNTOS`;
  for(const point of visible){
    const button=document.createElement('button');button.className='point-item';button.type='button';button.dataset.id=point.id;button.dataset.type=point.type;
    const icon=document.createElement('span');icon.textContent=point.icon;
    const body=document.createElement('div'),title=document.createElement('b'),subtitle=document.createElement('small');title.textContent=point.name;
    subtitle.textContent=located(point)?`${point.type==='base'?'CAMPAMENTO':point.type==='rp'?'RP':'PVP'} · POSICIÓN VERIFICADA`:'EN DESARROLLO · SIN UBICACIÓN';
    body.append(title,subtitle);button.append(icon,body);button.addEventListener('click',()=>selectPoint(point.id));list.append(button);
    if(map&&located(point)){
      const marker=L.marker([point.lat,point.lng],{icon:L.divIcon({className:`desterrados-pin ${point.type==='base'?'camp-pin':point.type==='rp'?'rp-pin':'pvp-pin'}`,html:point.type==='base'?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8M5 10v11h14V10M10 21v-7h4v7"/></svg>':point.type==='rp'?'RP':'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6"/><path d="M12 2v6m0 8v6M2 12h6m8 0h6"/><circle cx="12" cy="12" r="1"/></svg>',iconSize:[30,30],iconAnchor:[15,15]}),title:point.name,alt:point.name,zIndexOffset:point.type==='base'?2000:1000});
      const label=document.createElement('span');label.textContent=point.name+(point.type==='base'?'':point.type==='rp'?' · RP':' · PvP');marker.bindTooltip(label,{direction:'top',className:'base-tooltip',permanent:point.type==='base'});marker.on('click',()=>selectPoint(point.id,false));marker.addTo(pointLayer);pointMarkers.set(point.id,marker);
    }
  }
  if(!visible.some(p=>p.id===selected)&&visible.length)selected=visible[0].id;
  if(!visible.length){const empty=document.createElement('p');empty.textContent='No se encontraron ubicaciones.';empty.className='point-empty';list.append(empty);}
  selectPoint(selected,false);
}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(item=>{const active=item===button;item.classList.toggle('selected',active);item.setAttribute('aria-pressed',String(active));});renderPoints();}));
document.querySelector('#location-search')?.addEventListener('input',event=>{locationQuery=event.target.value.trim().toLocaleLowerCase('es');renderPoints();});
function overview(){const coords=points.filter(located).map(p=>[p.lat,p.lng]);if(coords.length)map.fitBounds(coords,{padding:[45,45],maxZoom:3});}
if(window.L){
  map=L.map(mapElement,{zoomControl:false,attributionControl:false,preferCanvas:true,minZoom:2,maxZoom:8,maxBounds:[[-85,-180],[85,180]],maxBoundsViscosity:.8}).setView([25,-60],3);
  const tiles=L.tileLayer('https://maps.izurvive.com/maps/ChernarusPlus-Top/1.29.0/tiles/{z}/{x}/{y}.webp',{noWrap:true,minZoom:1,maxZoom:8,maxNativeZoom:8,bounds:[[-85,-180],[85,180]],updateWhenIdle:true}).addTo(map);
  let tileFailures=0;tiles.on('tileerror',()=>{tileFailures++;if(tileFailures>3)document.querySelector('#map-source-status').textContent='No se han podido cargar algunas zonas. Puedes consultar el mapa en iZurvive.';});
  tiles.on('load',()=>{if(tileFailures===0)document.querySelector('#map-source-status').textContent='Cartografía de iZurvive · © Bohemia Interactive. Arrastra para explorar y usa la rueda o los controles de zoom.';});
  pointLayer=L.layerGroup().addTo(map);resourceLayer=L.layerGroup().addTo(map);labelLayer=L.layerGroup().addTo(map);overview();
  document.querySelector('#zoom-in').addEventListener('click',()=>map.zoomIn());document.querySelector('#zoom-out').addEventListener('click',()=>map.zoomOut());document.querySelector('#reset-map').addEventListener('click',overview);
  if(window.ResizeObserver){new ResizeObserver(()=>map.invalidateSize({pan:false})).observe(mapElement);}
  const zoomLevel=document.querySelector('#map-zoom-level');
  const updateZoom=()=>{if(zoomLevel)zoomLevel.textContent=`ZOOM ${map.getZoom()}`;document.querySelector('#zoom-out').disabled=map.getZoom()<=map.getMinZoom();document.querySelector('#zoom-in').disabled=map.getZoom()>=map.getMaxZoom();};map.on('zoomend',updateZoom);updateZoom();
  const fullscreenButton=document.querySelector('#fullscreen-map'),shell=document.querySelector('#map-shell');
  if(fullscreenButton&&shell){
    const expanded=()=>document.fullscreenElement===shell||shell.classList.contains('is-expanded');
    const updateExpanded=()=>{const active=expanded();fullscreenButton.setAttribute('aria-pressed',String(active));fullscreenButton.setAttribute('aria-label',active?'Cerrar mapa ampliado':'Ampliar mapa');fullscreenButton.textContent=active?'×':'⛶';setTimeout(()=>map.invalidateSize(),100);};
    fullscreenButton.addEventListener('click',async()=>{try{if(document.fullscreenElement===shell){await document.exitFullscreen();}else if(shell.classList.contains('is-expanded')){shell.classList.remove('is-expanded');}else if(shell.requestFullscreen){await shell.requestFullscreen();}else{shell.classList.add('is-expanded');}}catch{shell.classList.toggle('is-expanded');}updateExpanded();});
    document.addEventListener('fullscreenchange',updateExpanded);document.addEventListener('keydown',event=>{if(event.key==='Escape'&&shell.classList.contains('is-expanded')){shell.classList.remove('is-expanded');updateExpanded();}});
  }
  const categories={Military:{label:'Recursos militares',color:'#a52f26'},Medical:{label:'Suministros médicos',color:'#ee7886'},Urban:{label:'Recursos urbanos',color:'#deaf45'},Rural:{label:'Recursos rurales',color:'#629646'},Industrial:{label:'Recursos industriales',color:'#868887'},Coast:{label:'Recursos costeros',color:'#779fad'},Wreck:{label:'Vehículo abandonado',color:'#846d5b'},Landmark:{label:'Punto de referencia',color:'#976ba4'}};
  let resources=[],places=[];
  const resourceCache=new Map();
  function updateResources(){
    const zoom=map.getZoom(),bounds=map.getBounds().pad(.15);resourceLayer.clearLayers();labelLayer.clearLayers();
    for(let index=0;index<resources.length;index++){
      const resource=resources[index];if(!bounds.contains([resource.lat,resource.lng]))continue;
      const prominent=resource.category==='Medical'||resource.type==='WaterPump'||resource.type==='Fuelstation'||resource.category==='Military';
      if(zoom<3&&!prominent||zoom<4&&resource.type==='Generic')continue;
      let marker=resourceCache.get(index);
      if(!marker){const category=categories[resource.category]||{label:'Recurso',color:'#999'};const water=/WaterPump|WaterTrough/.test(resource.type);const label=document.createElement('span');label.textContent=water?'Agua':category.label;marker=L.circleMarker([resource.lat,resource.lng],{radius:water?4:3,color:'#202020',weight:.8,fillColor:water?'#42a5da':category.color,fillOpacity:.85}).bindTooltip(label,{direction:'top'});resourceCache.set(index,marker);}
      resourceLayer.addLayer(marker);
    }
    for(const place of places){if(place.minZoom>zoom||!bounds.contains([place.lat,place.lng]))continue;const label=document.createElement('span');label.textContent=place.name;L.marker([place.lat,place.lng],{interactive:false,icon:L.divIcon({className:'place-label',html:label.outerHTML,iconSize:[120,18],iconAnchor:[60,9]})}).addTo(labelLayer);}
  }
  Promise.all([fetch('assets/chernarus-resources.json').then(r=>{if(!r.ok)throw Error('resources');return r.json();}),fetch('assets/chernarus-places.json').then(r=>{if(!r.ok)throw Error('places');return r.json();})]).then(([r,p])=>{resources=r;places=p;updateResources();map.on('moveend zoomend',updateResources);}).catch(()=>{document.querySelector('#map-source-status').textContent='La capa de recursos no está disponible. Las bases militares siguen visibles.';});
}else{
  mapElement.textContent='No se pudo cargar el mapa interactivo. Consulta la cartografía en el enlace de iZurvive.';document.querySelectorAll('.map-toolbar button').forEach(button=>button.disabled=true);
}
renderPoints();
