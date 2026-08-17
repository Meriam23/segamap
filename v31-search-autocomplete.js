/* SegaMap v3.1 search-as-you-type */
(function(){
  'use strict';
  var timers={};
  var cache={};
  var BOX='57.30,-20.55,57.90,-19.65';
  function esc(s){return String(s==null?'':s).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c];});}
  function label(p){var n=p.name||p.street||p.locality||p.city||'Lieu';var bits=[];if(p.street&&p.street!==n)bits.push(p.street);if(p.city)bits.push(p.city);else if(p.locality)bits.push(p.locality);return {name:n,meta:bits.join(', ')||'Île Maurice'};}
  function search(q){var key=q.toLowerCase();if(cache[key])return Promise.resolve(cache[key]);var url='https://photon.komoot.io/api/?q='+encodeURIComponent(q)+'&limit=10&lang=fr&bbox='+BOX;return fetch(url,{headers:{Accept:'application/json'}}).then(function(r){return r.ok?r.json():{features:[]};}).then(function(data){var out=[];var seen={};(data.features||[]).forEach(function(f,i){var c=f.geometry&&f.geometry.coordinates;if(!c||c.length<2)return;var p=f.properties||{},ll=label(p),id='ph31:'+encodeURIComponent(q.toLowerCase())+':'+i+':'+Number(c[1]).toFixed(5)+':'+Number(c[0]).toFixed(5);if(seen[ll.name+'|'+c[0]+'|'+c[1]])return;seen[ll.name+'|'+c[0]+'|'+c[1]]=1;if(typeof addNode!=='function')return;if(!nodes[id])addNode(id,ll.name,'poi',ll.meta,Number(c[1]),Number(c[0]));nodes[id].onlineSearch=true;nodes[id].displayAddress=ll.meta;nodes[id].photonLayer=p.osm_value||p.type||'';out.push(nodes[id]);});cache[key]=out;return out;}).catch(function(){return [];});}
  function render(box,items,q){if(!items.length){box.innerHTML='<div class="sugg-item" style="cursor:default;color:#8b949e">Aucun résultat pour « '+esc(q)+' »</div>';box.classList.add('open');box.style.display='block';return;}box.innerHTML=items.map(function(n){return '<div class="sugg-item" data-sega-v22-id="'+esc(n.id)+'"><span class="sugg-name">'+esc(n.name)+'</span><span class="sugg-meta">'+esc(n.displayAddress||'Île Maurice')+'</span></div>';}).join('');box.classList.add('open');box.style.display='block';}
  function bind(id,bid){var input=document.getElementById(id),box=document.getElementById(bid);if(!input||!box)return;input.addEventListener('input',function(){var q=input.value.trim();if(timers[id])clearTimeout(timers[id]);if(q.length<2){return;}box.innerHTML='<div class="sugg-item" style="cursor:default;color:#8b949e">Recherche…</div>';box.classList.add('open');box.style.display='block';timers[id]=setTimeout(function(){search(q).then(function(items){if(input.value.trim()!==q)return;render(box,items,q);});},280);});}
  function boot(){bind('origin-input','origin-sugg');bind('dest-input','dest-sugg');}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
