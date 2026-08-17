/* SegaMap v3.2 — single search controller, automatic Mauritius-wide search */
(function(){
  'use strict';
  var BBOX='57.28,-20.56,57.85,-19.94';
  var timers={},seq={},cache={};
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function label(p){
    var name=p.name||p.street||p.locality||p.city||'Lieu';
    var bits=[];
    if(p.housenumber&&p.street) bits.push(p.housenumber+' '+p.street);
    else if(p.street&&p.street!==name) bits.push(p.street);
    if(p.city) bits.push(p.city); else if(p.locality) bits.push(p.locality); else if(p.district) bits.push(p.district);
    return {name:name,area:bits.join(', ')||'Île Maurice'};
  }
  function searchOnline(q){
    var key=q.toLowerCase();
    if(cache[key]) return Promise.resolve(cache[key]);
    var url='https://photon.komoot.io/api/?q='+encodeURIComponent(q)+'&lang=fr&limit=12&bbox='+BBOX;
    return fetch(url,{headers:{Accept:'application/json'}}).then(function(r){return r.ok?r.json():{features:[]};}).then(function(data){
      var out=[],seen={};
      (data.features||[]).forEach(function(f,i){
        var c=f.geometry&&f.geometry.coordinates;if(!c||c.length<2)return;
        var lon=Number(c[0]),lat=Number(c[1]);if(!isFinite(lat)||!isFinite(lon))return;
        var l=label(f.properties||{}),dk=l.name.toLowerCase()+'|'+lat.toFixed(5)+'|'+lon.toFixed(5);if(seen[dk])return;seen[dk]=1;
        if(typeof addNode!=='function'||typeof nodes==='undefined')return;
        var id='search32:'+encodeURIComponent(key)+':'+i+':'+lat.toFixed(5)+':'+lon.toFixed(5);
        if(!nodes[id]){
          addNode(id,l.name,'poi',l.area,lat,lon);
          nodes[id].onlineSearch=true;
          nodes[id].displayAddress=l.area;
          if(typeof connectExtraNode==='function') connectExtraNode(id,lat,lon,1600);
          if(typeof allNodesList!=='undefined'&&allNodesList.indexOf(nodes[id])===-1) allNodesList.push(nodes[id]);
        }
        out.push(nodes[id]);
      });
      cache[key]=out;return out;
    }).catch(function(){return[];});
  }
  function local(q){
    try{return typeof searchNodes==='function'?(searchNodes(q)||[]):[];}catch(e){return[];}
  }
  function render(input,box,items,q){
    var merged=[],seen={};
    (items||[]).forEach(function(n){if(n&&!seen[n.id]){seen[n.id]=1;merged.push(n);}});
    if(!merged.length){box.innerHTML='<div class="sugg-item" style="cursor:default;color:#9AA3AD">Aucun résultat pour « '+esc(q)+' »</div>';box.classList.add('open');box.style.display='block';return;}
    box.innerHTML=merged.slice(0,12).map(function(n){return '<div class="sugg-item" data-search32-id="'+esc(n.id)+'"><span class="sugg-name">'+esc(n.name)+'</span><span class="sugg-meta">'+esc(n.area||n.displayAddress||'Île Maurice')+'</span></div>';}).join('');
    box.classList.add('open');box.style.display='block';
    function choose(item,ev){
      if(ev){ev.preventDefault();ev.stopPropagation();}
      var id=item.getAttribute('data-search32-id'),n=nodes[id];if(!n)return;
      input.value=n.name;input.dataset.selectedId=n.id;input.dataset.lat=String(n.lat);input.dataset.lon=String(n.lon);
      box.classList.remove('open');box.style.display='none';box.innerHTML='';
      if(typeof homeMap!=='undefined'&&homeMap&&isFinite(n.lat)&&isFinite(n.lon))homeMap.setView([n.lat,n.lon],16);
    }
    Array.prototype.forEach.call(box.querySelectorAll('[data-search32-id]'),function(item){
      item.addEventListener('pointerdown',function(e){choose(item,e);},{capture:true,passive:false});
      item.addEventListener('click',function(e){choose(item,e);},{capture:true});
      item.addEventListener('touchend',function(e){choose(item,e);},{capture:true,passive:false});
    });
  }
  function bind(inputId,boxId){
    var input=document.getElementById(inputId),box=document.getElementById(boxId);if(!input||!box)return;
    input.addEventListener('input',function(e){
      e.stopImmediatePropagation();
      input.dataset.selectedId='';
      var q=input.value.trim(),my=++seq[inputId];
      if(timers[inputId])clearTimeout(timers[inputId]);
      if(q.length<2){box.classList.remove('open');box.innerHTML='';return;}
      box.innerHTML='<div class="sugg-item" style="cursor:default;color:#9AA3AD">Recherche…</div>';box.classList.add('open');box.style.display='block';
      timers[inputId]=setTimeout(function(){
        searchOnline(q).then(function(remote){
          if(my!==seq[inputId]||input.value.trim()!==q)return;
          // Remote Mauritius places first; transit nodes are fallback only.
          render(input,box,(remote||[]).concat(local(q)),q);
        });
      },220);
    },true);
    input.addEventListener('keydown',function(e){
      // Enter is optional; it must never be required for suggestions.
      if(e.key==='Escape'){box.classList.remove('open');box.style.display='none';}
    },true);
    box.addEventListener('pointerdown',function(e){e.stopPropagation();},true);
    box.addEventListener('click',function(e){e.stopPropagation();},true);
  }
  function boot(){bind('origin-input','origin-sugg');bind('dest-input','dest-sugg');}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
