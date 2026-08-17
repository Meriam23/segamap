// SegaMap v1.8 — multi-route chooser. Injected inside the main app scope by Pages workflow.
(function(){
  'use strict';
  if(typeof document==='undefined' || typeof shortestPath!=='function' || typeof routeWithFallback!=='function') return;

  function routeSignature(result){
    return (result.chain||[]).map(function(s){
      var e=s.edge||{};
      return (e.mode||'')+':'+(e.line||'walk');
    }).join('>');
  }

  function lineNames(result){
    var out=[];
    (result.chain||[]).forEach(function(s){
      var e=s.edge||{};
      if(e.mode==='bus' && e.line && out.indexOf(String(e.line))<0) out.push(String(e.line));
      if(e.mode==='metro' && out.indexOf('Metro Express')<0) out.push('Metro Express');
    });
    return out;
  }

  function totalMinutes(result){
    return Math.round(Number(result.cost||0));
  }

  function withLinesBlocked(lines, fn){
    var saved={};
    Object.keys(adj).forEach(function(id){
      saved[id]=adj[id];
      adj[id]=(adj[id]||[]).filter(function(e){
        return !(e && e.mode==='bus' && lines.indexOf(String(e.line))>=0);
      });
    });
    try{return fn();} finally { Object.keys(saved).forEach(function(id){adj[id]=saved[id];}); }
  }

  function collectAlternatives(oid,did,base){
    var found=[];
    var seen={};
    function add(r){
      if(!r) return false;
      var sig=routeSignature(r);
      if(!sig || seen[sig]) return false;
      seen[sig]=true; found.push(r); return true;
    }
    add(base);
    var queue=[base];
    while(queue.length && found.length<4){
      var current=queue.shift();
      var lines=lineNames(current);
      lines.forEach(function(line){
        if(found.length>=4) return;
        var alt=withLinesBlocked([line],function(){ return shortestPath(oid,did); });
        if(add(alt)) queue.push(alt);
      });
    }
    found.sort(function(a,b){return totalMinutes(a)-totalMinutes(b);});
    return found.slice(0,4);
  }

  function makeTrip(oid,did,result){
    var legs=buildLegs(oid,result);
    return {oid:oid,did:did,routed:{result:result,actualStart:oid,actualEnd:did,startWalk:0,endWalk:0},legs:legs,displaySteps:legs.slice()};
  }

  function showOptions(oid,did,results){
    var old=document.getElementById('route-options-overlay');
    if(old) old.remove();
    var origin=nodes[oid], dest=nodes[did];
    var overlay=document.createElement('div');
    overlay.id='route-options-overlay';
    overlay.style.cssText='position:fixed;inset:0;background:rgba(15,20,30,.42);z-index:99999;display:flex;align-items:flex-end;justify-content:center;padding:0;';
    var panel=document.createElement('div');
    panel.style.cssText='width:min(460px,100%);max-height:82vh;overflow:auto;background:#fff;border-radius:22px 22px 0 0;padding:20px 18px 26px;box-shadow:0 -12px 40px rgba(0,0,0,.2);font-family:Inter,system-ui,sans-serif;';
    var title=document.createElement('div');
    title.innerHTML='<div style="font-size:19px;font-weight:800;margin-bottom:4px">'+escapeHtml(origin.name)+' → '+escapeHtml(dest.name)+'</div><div style="font-size:12.5px;color:#5B6472;margin-bottom:16px">'+results.length+' itinéraires disponibles</div>';
    panel.appendChild(title);
    results.forEach(function(r,i){
      var lines=lineNames(r);
      var card=document.createElement('button');
      card.type='button';
      card.style.cssText='display:block;width:100%;text-align:left;border:1px solid #E7E9EC;background:#F9FAFB;border-radius:14px;padding:14px;margin:0 0 10px;cursor:pointer;';
      var transfers=Math.max(0,lines.length-1);
      var label=i===0?'Option recommandée':'Option '+(i+1);
      card.innerHTML='<div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><strong style="font-size:14px">'+label+'</strong><span style="font:600 11px monospace;color:#5B6472">~'+totalMinutes(r)+' min</span></div>'+
        '<div style="margin-top:6px;font-size:13px;font-weight:700">🚌 '+escapeHtml(lines.join(' → ')||'Transport public')+'</div>'+
        '<div style="margin-top:4px;font-size:11.5px;color:#5B6472">'+(transfers===0?'Direct':' '+transfers+' correspondance'+(transfers>1?'s':''))+'</div>';
      card.addEventListener('click',function(){
        overlay.remove();
        trip=makeTrip(oid,did,r);
        renderOverview();
        showScreen('overview');
      });
      panel.appendChild(card);
    });
    var cancel=document.createElement('button');
    cancel.type='button'; cancel.textContent='Annuler';
    cancel.style.cssText='width:100%;border:0;background:#F4F5F7;border-radius:12px;padding:13px;font-weight:700;font-size:14px;';
    cancel.addEventListener('click',function(){overlay.remove();});
    panel.appendChild(cancel);
    overlay.appendChild(panel); document.body.appendChild(overlay);
  }

  var go=document.getElementById('go-btn');
  if(!go) return;
  go.addEventListener('click',function(ev){
    var oid=originInput.dataset.selectedId;
    var did=destInput.dataset.selectedId;
    if(!oid){var m=allNodesList.find(function(n){return n.name.toLowerCase()===originInput.value.trim().toLowerCase();});if(m)oid=m.id;}
    if(!did){var m2=allNodesList.find(function(n){return n.name.toLowerCase()===destInput.value.trim().toLowerCase();});if(m2)did=m2.id;}
    if(!oid||!did||oid===did)return;
    var base=shortestPath(oid,did);
    if(!base)return;
    var results=collectAlternatives(oid,did,base);
    if(results.length>1){
      ev.preventDefault(); ev.stopImmediatePropagation();
      showOptions(oid,did,results);
    }
  },true);
})();
