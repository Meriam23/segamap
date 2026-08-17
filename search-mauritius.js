/* SegaMap — Mauritius places, restaurants and streets search v1.6 */
(function(){
  'use strict';
  var cache={}, timers={}, seq={}, lastOnlineAt=0, MIN_INTERVAL=1000;
  function esc(s){return String(s).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c];});}
  function area(item){var a=item.address||{};return a.suburb||a.neighbourhood||a.village||a.town||a.city||a.municipality||a.county||'Île Maurice';}
  function shortName(item,q){
    var nd=item.namedetails||{};
    return nd.name||nd['name:fr']||item.name||(item.display_name||q).split(',')[0]||q;
  }
  function add(items,out,q){
    items.forEach(function(item,i){
      var lat=Number(item.lat),lon=Number(item.lon);if(!isFinite(lat)||!isFinite(lon))return;
      var name=shortName(item,q), display=item.display_name||name;
      var id='geo:mu:'+q.toLowerCase()+':'+i+':'+lat.toFixed(5)+':'+lon.toFixed(5);
      if(nodes[id]) return;
      addNode(id,name,'poi',area(item),lat,lon);
      nodes[id].onlineSearch=true;nodes[id].osmType=item.type||'';nodes[id].displayAddress=display;
      out.push(nodes[id]);if(allNodesList.indexOf(nodes[id])===-1)allNodesList.push(nodes[id]);
    });
  }
  function online(q){
    q=q.trim();var key=q.toLowerCase();if(q.length<2)return Promise.resolve([]);if(cache[key])return Promise.resolve(cache[key]);
    var wait=Math.max(0,MIN_INTERVAL-(Date.now()-lastOnlineAt));
    return new Promise(function(r){setTimeout(r,wait);}).then(function(){
      lastOnlineAt=Date.now();
      var url='https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&namedetails=1&limit=20&countrycodes=mu&bounded=1&viewbox=57.30,-19.65,57.90,-20.55&accept-language=fr&q='+encodeURIComponent(q);
      return fetch(url,{headers:{Accept:'application/json'}}).then(function(r){return r.ok?r.json():[];});
    }).then(function(items){
      var out=[];add(items,out,q);
      /* A second, more natural POI query helps with searches such as "restaurants Flic en Flac". */
      var lower=q.toLowerCase(), poi=/restaurant|restaurants|resto|caf[eé]|cafe|bar|supermarch[ée]|shop|magasin|h[oô]tel|hotel|pharmacie|station|carrefour|jumbo|winner|mall|centre commercial|beach|plage/.test(lower);
      if(!out.length && poi){
        var q2=q+' Mauritius';
        return new Promise(function(r){setTimeout(r,1000);}).then(function(){
          lastOnlineAt=Date.now();
          return fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&namedetails=1&limit=20&countrycodes=mu&bounded=1&viewbox=57.30,-19.65,57.90,-20.55&accept-language=fr&q='+encodeURIComponent(q2),{headers:{Accept:'application/json'}}).then(function(r){return r.ok?r.json():[];});
        }).then(function(more){add(more,out,q);cache[key]=out.slice(0,20);return cache[key];});
      }
      cache[key]=out.slice(0,20);return cache[key];
    }).catch(function(){return [];});
  }
  function local(q){return typeof searchNodes==='function'?(searchNodes(q)||[]):[];}
  function merge(a,b){var seen={},out=[];a.concat(b).forEach(function(n){if(!n||seen[n.id])return;seen[n.id]=1;out.push(n);});return out.slice(0,20);}
  function render(input,box,results){
    if(!results.length){box.classList.remove('open');box.innerHTML='';return;}
    box.innerHTML=results.map(function(n){return '<div class="sugg-item" data-sega-search-id="'+esc(n.id)+'"><span class="sugg-name">'+esc(n.name)+'</span><span class="sugg-meta">'+esc(n.area||'Île Maurice')+'</span></div>';}).join('');
    box.classList.add('open');
    box.querySelectorAll('[data-sega-search-id]').forEach(function(el){el.addEventListener('click',function(){
      var id=el.getAttribute('data-sega-search-id');if(!nodes[id])return;input.value=nodes[id].name;input.dataset.selectedId=id;box.classList.remove('open');
      if(typeof homeMap!=='undefined'&&isFinite(nodes[id].lat)&&isFinite(nodes[id].lon))homeMap.setView([nodes[id].lat,nodes[id].lon],16);
    });});
  }
  function attach(inputId,boxId){
    var input=document.getElementById(inputId),box=document.getElementById(boxId);if(!input||!box)return;
    input.addEventListener('input',function(){
      var q=input.value.trim();if(timers[inputId])clearTimeout(timers[inputId]);var request=(seq[inputId]||0)+1;seq[inputId]=request;
      if(q.length<2){box.classList.remove('open');box.innerHTML='';return;}
      timers[inputId]=setTimeout(function(){Promise.all([Promise.resolve(local(q)),online(q)]).then(function(p){if(seq[inputId]!==request||input.value.trim()!==q)return;render(input,box,merge(p[0],p[1]));});},300);
    },true);
  }
  function boot(){attach('origin-input','origin-sugg');attach('dest-input','dest-sugg');}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
