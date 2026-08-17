/* SegaMap — Mauritius places & streets search v1.5
   Island-wide OpenStreetMap/Nominatim lookup. UI intentionally shows
   only the result name and area — no LIEU/POSITION/category badges.
*/
(function(){
  'use strict';
  var cache = {}, timers = {}, seq = {}, lastOnlineAt = 0, MIN_INTERVAL = 1000;
  function esc(s){return String(s).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c];});}
  function area(item){var a=item.address||{};return a.suburb||a.neighbourhood||a.village||a.town||a.city||a.municipality||a.county||'Île Maurice';}
  function online(q){
    q=q.trim(); var key=q.toLowerCase(); if(q.length<2)return Promise.resolve([]); if(cache[key])return Promise.resolve(cache[key]);
    var wait=Math.max(0,MIN_INTERVAL-(Date.now()-lastOnlineAt));
    return new Promise(function(resolve){setTimeout(resolve,wait);}).then(function(){
      lastOnlineAt=Date.now();
      var url='https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&namedetails=1&limit=10&countrycodes=mu&bounded=1&viewbox=57.30,-19.65,57.90,-20.55&accept-language=fr&q='+encodeURIComponent(q);
      return fetch(url,{headers:{'Accept':'application/json'}}).then(function(r){return r.ok?r.json():[];});
    }).then(function(items){
      var out=[];
      items.forEach(function(item,i){
        var lat=Number(item.lat),lon=Number(item.lon);if(!isFinite(lat)||!isFinite(lon))return;
        var display=item.display_name||q;
        var name=(item.namedetails&&(item.namedetails.name||item.namedetails['name:fr']))||item.name||display.split(',')[0]||q;
        var id='geo:mauritius:'+key+':'+i;
        addNode(id,name,'poi',area(item),lat,lon);
        nodes[id].onlineSearch=true;nodes[id].osmType=item.type||'';nodes[id].displayAddress=display;
        out.push(nodes[id]);if(allNodesList.indexOf(nodes[id])===-1)allNodesList.push(nodes[id]);
      });
      cache[key]=out;return out;
    }).catch(function(){return [];});
  }
  function local(q){return typeof searchNodes==='function'?(searchNodes(q)||[]):[];}
  function merge(a,b){var seen={},out=[];a.concat(b).forEach(function(n){if(!n||seen[n.id])return;seen[n.id]=true;out.push(n);});return out.slice(0,10);}
  function render(input,box,results){
    if(!results.length){box.classList.remove('open');box.innerHTML='';return;}
    box.innerHTML=results.map(function(n){return '<div class="sugg-item" data-sega-search-id="'+esc(n.id)+'"><span class="sugg-name">'+esc(n.name)+'</span><span class="sugg-meta">'+esc(n.area||'Île Maurice')+'</span></div>';}).join('');
    box.classList.add('open');
    Array.prototype.forEach.call(box.querySelectorAll('[data-sega-search-id]'),function(el){el.addEventListener('click',function(){
      var id=el.getAttribute('data-sega-search-id');if(!nodes[id])return;input.value=nodes[id].name;input.dataset.selectedId=id;box.classList.remove('open');
      if(typeof homeMap!=='undefined'&&nodes[id].lat&&nodes[id].lon)homeMap.setView([nodes[id].lat,nodes[id].lon],16);
    });});
  }
  function attach(inputId,boxId){
    var input=document.getElementById(inputId),box=document.getElementById(boxId);if(!input||!box)return;
    input.addEventListener('input',function(){
      var q=input.value.trim();if(timers[inputId])clearTimeout(timers[inputId]);var request=(seq[inputId]||0)+1;seq[inputId]=request;
      if(q.length<2){box.classList.remove('open');box.innerHTML='';return;}
      timers[inputId]=setTimeout(function(){Promise.all([Promise.resolve(local(q)),online(q)]).then(function(parts){if(seq[inputId]!==request||input.value.trim()!==q)return;render(input,box,merge(parts[0],parts[1]));});},350);
    },true);
  }
  function boot(){attach('origin-input','origin-sugg');attach('dest-input','dest-sugg');}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
