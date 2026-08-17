/* SegaMap v1.8 — multiple route options
   Loaded after the main app. It uses the existing global graph without touching
   the map or the primary routing algorithm. */
(function(){
  'use strict';

  function uniq(arr){ return arr.filter(function(v,i){ return arr.indexOf(v)===i; }); }
  function routeSignature(r){
    if(!r || !r.chain) return '';
    return r.chain.map(function(s){
      var e=s.edge||{};
      return (e.mode||'')+'|'+(e.line||'')+'|'+(s.node||'');
    }).join('>');
  }
  function busLines(r){
    if(!r || !r.chain) return [];
    return uniq(r.chain.map(function(s){return s.edge||{};})
      .filter(function(e){return e.mode==='bus' && e.line;})
      .map(function(e){return String(e.line);}));
  }
  function withBannedLines(lines, fn){
    var backup={};
    Object.keys(window.adj||{}).forEach(function(id){
      backup[id]=window.adj[id];
      window.adj[id]=(window.adj[id]||[]).filter(function(e){
        return !(e && e.mode==='bus' && lines.indexOf(String(e.line))>=0);
      });
    });
    try { return fn(); } finally { Object.keys(backup).forEach(function(id){window.adj[id]=backup[id];}); }
  }
  function getAlternatives(oid,did,primary){
    var out=[primary], seen={};
    seen[routeSignature(primary)]=true;
    var lines=busLines(primary);
    lines.forEach(function(line){
      if(out.length>=4) return;
      var r=withBannedLines([line],function(){ return window.shortestPath(oid,did); });
      var sig=routeSignature(r);
      if(r && sig && !seen[sig]){seen[sig]=true;out.push(r);}
    });
    if(out.length<4 && lines.length>1){
      var r2=withBannedLines(lines,function(){return window.shortestPath(oid,did);});
      var sig2=routeSignature(r2);
      if(r2 && sig2 && !seen[sig2]) out.push(r2);
    }
    return out.slice(0,4);
  }
  function optionLines(r){
    var ls=busLines(r); return ls.length?ls.join(' + '):'À pied';
  }
  function optionMinutes(r){
    if(!r) return '';
    return r.total!=null ? Math.round(r.total)+' min' : '';
  }
  function install(){
    if(!window.shortestPath || !window.adj || !window.nodes) return;
    var go=document.getElementById('go-btn');
    if(!go || go.dataset.multiRoutesInstalled) return;
    go.dataset.multiRoutesInstalled='1';
    go.addEventListener('click',function(){
      setTimeout(function(){
        try{
          if(!window.trip) return;
          var routes=getAlternatives(window.trip.oid,window.trip.did,window.trip.routed.result);
          if(routes.length<2) return;
          var old=document.getElementById('multi-route-options');
          if(old) old.remove();
          var host=document.querySelector('#screen-overview .steps-scroll') || document.querySelector('.steps-scroll');
          if(!host) return;
          var box=document.createElement('div');
          box.id='multi-route-options';
          box.style.cssText='margin:10px 18px 12px;padding:12px;background:#fff;border:1px solid #E7E9EC;border-radius:14px;box-shadow:0 10px 28px -18px rgba(15,20,30,.25);';
          var h=document.createElement('div');
          h.textContent=routes.length+' itinéraires disponibles';
          h.style.cssText='font-size:13px;font-weight:800;margin-bottom:8px;';
          box.appendChild(h);
          routes.forEach(function(r,i){
            var b=document.createElement('button');
            b.type='button';
            b.style.cssText='display:block;width:100%;text-align:left;background:'+(i===0?'#F4F5F7':'#fff')+';border:1px solid #E7E9EC;border-radius:10px;padding:10px 11px;margin-top:7px;font:600 12px Inter,sans-serif;color:#15181D;cursor:pointer;';
            b.innerHTML='<strong>Option '+(i+1)+(i===0?' · recommandée':'')+'</strong><br><span style="font-weight:500;color:#5B6472">🚌 '+optionLines(r)+' · ~'+optionMinutes(r)+'</span>';
            b.addEventListener('click',function(){
              var routed={result:r,actualStart:window.trip.routed.actualStart,actualEnd:window.trip.routed.actualEnd,startWalk:window.trip.routed.startWalk,endWalk:window.trip.routed.endWalk};
              var legs=window.buildLegs(routed.actualStart,r);
              window.trip.routed=routed; window.trip.legs=legs;
              if(typeof window.renderOverview==='function') window.renderOverview();
            });
            box.appendChild(b);
          });
          host.insertBefore(box,host.firstChild);
        }catch(e){ console.warn('SegaMap multiple routes:',e); }
      },50);
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install); else install();
})();
