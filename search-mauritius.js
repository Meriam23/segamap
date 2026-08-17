/* SegaMap — Mauritius street & place search v1.3 */
(function(){
  var cache = {};
  var timers = {};
  var seq = {};

  function esc(s){
    return String(s).replace(/[&<>\"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function kind(item){
    var a=(item.addresstype||item.type||'').toLowerCase(), cat=(item.category||'').toLowerCase();
    if(['road','street','pedestrian','residential','secondary','primary','tertiary','unclassified','service'].indexOf(a)>=0) return 'RUE';
    if(['village','town','city','suburb','neighbourhood','locality','municipality','island'].indexOf(a)>=0) return 'LIEU';
    if(['place','amenity','tourism','shop','leisure','building'].indexOf(cat)>=0) return 'LIEU';
    return 'LIEU';
  }
  function area(item){
    var ad=item.address||{};
    return ad.suburb||ad.neighbourhood||ad.village||ad.town||ad.city||ad.municipality||'Île Maurice';
  }
  function online(q){
    q=q.trim(); var key=q.toLowerCase();
    if(q.length<2) return Promise.resolve([]);
    if(cache[key]) return Promise.resolve(cache[key]);
    var url='https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&namedetails=1&limit=15&countrycodes=mu&accept-language=fr&q='+encodeURIComponent(q);
    return fetch(url,{headers:{'Accept':'application/json'}}).then(function(r){return r.ok?r.json():[];}).then(function(items){
      var out=[];
      items.forEach(function(item,i){
        var lat=Number(item.lat),lon=Number(item.lon); if(!isFinite(lat)||!isFinite(lon)) return;
        var display=item.display_name||q,id='geo:mauritius:'+key+':'+i;
        addNode(id,display,'poi',area(item),lat,lon);
        nodes[id].onlineSearch=true; nodes[id].searchKind=kind(item); nodes[id].osmType=item.type||'';
        out.push(nodes[id]); if(allNodesList.indexOf(nodes[id])===-1) allNodesList.push(nodes[id]);
      });
      cache[key]=out; return out;
    }).catch(function(){return [];});
  }
  function local(q){return typeof searchNodes==='function'?(searchNodes(q)||[]):[];}
  function merge(a,b){var seen={},out=[];a.concat(b).forEach(function(n){if(!n||seen[n.id])return;seen[n.id]=true;out.push(n);});return out.slice(0,15);}
  function render(input,box,results){
    if(!results.length){box.classList.remove('open');box.innerHTML='';return;}
    box.innerHTML=results.map(function(n){
      var label=n.searchKind||(n.type==='metro'?'METRO':n.type==='geo'?'POSITION':'LIEU');
      var cls=label==='RUE'?'tag-metro':(label==='METRO'||label==='POSITION'?'tag-metro':'tag-poi');
      return '<div class="sugg-item" data-sega-search-id="'+esc(n.id)+'"><span class="sugg-name"><span class="'+cls+'">'+label+'</span> '+esc(n.name)+'</span><span class="sugg-meta">'+esc(n.area||'Île Maurice')+'</span></div>';
    }).join('');
    box.classList.add('open');
    Array.prototype.forEach.call(box.querySelectorAll('[data-sega-search-id]'),function(el){el.addEventListener('click',function(){
      var id=el.getAttribute('data-sega-search-id'); if(!nodes[id])return;
      input.value=nodes[id].name; input.dataset.selectedId=id; box.classList.remove('open');
      if(typeof homeMap!=='undefined'&&nodes[id].lat&&nodes[id].lon)homeMap.setView([nodes[id].lat,nodes[id].lon],16);
    });});
  }
  function attach(inputId,boxId){
    var input=document.getElementById(inputId),box=document.getElementById(boxId);if(!input||!box)return;
    input.addEventListener('input',function(){
      var q=input.value.trim();if(timers[inputId])clearTimeout(timers[inputId]);
      var request=(seq[inputId]||0)+1;seq[inputId]=request;
      if(q.length<2){box.classList.remove('open');return;}
      timers[inputId]=setTimeout(function(){Promise.all([Promise.resolve(local(q)),online(q)]).then(function(parts){
        if(seq[inputId]!==request||input.value.trim()!==q)return;render(input,box,merge(parts[0],parts[1]));
      });},180);
    },true);
  }
  function boot(){attach('origin-input','origin-sugg');attach('dest-input','dest-sugg');}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
