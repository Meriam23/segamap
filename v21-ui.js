/* SegaMap v2.1 — destination wording + UI cleanup */
(function(){
  function isTransitNode(n){
    return n && (n.type === 'bus' || n.type === 'metro' || n.type === 'stop' || n.type === 'station');
  }
  function labelForNode(n){ return isTransitNode(n) ? 'l’arrêt' : 'la destination'; }
  function patchText(){
    document.querySelectorAll('.step-card').forEach(function(card){
      var route = card.querySelector('.step-route');
      var title = card.querySelector('.step-title');
      if(!route || !title) return;
      if(title.textContent.indexOf('Marcher jusqu’à') === 0 || title.textContent.indexOf("Marcher jusqu'à") === 0 || title.textContent.indexOf('Marcher jusqu') === 0){
        var m = route.textContent.match(/→\s*(.+)$/);
        if(!m) return;
        var name = m[1].trim();
        var id = Object.keys(window.nodes || {}).find(function(k){ return window.nodes[k] && window.nodes[k].name === name; });
        var n = id ? window.nodes[id] : null;
        title.textContent = 'Marcher jusqu’à ' + (n ? labelForNode(n) : 'la destination');
      }
    });
    var detailTitle = document.getElementById('detail-title');
    var detailSub = document.getElementById('detail-subtitle');
    if(detailTitle && detailTitle.textContent.indexOf('Marcher jusqu') === 0 && detailSub){
      var name = detailSub.textContent.split('→').pop().trim();
      var id = Object.keys(window.nodes || {}).find(function(k){ return window.nodes[k] && window.nodes[k].name === name; });
      var n = id ? window.nodes[id] : null;
      detailTitle.textContent = 'Marcher jusqu’à ' + (n ? labelForNode(n) : 'la destination');
    }
  }
  function addVersion(){
    document.querySelectorAll('body *').forEach(function(el){
      if(el.children.length===0 && /SegaMap v1\.8|SegaMap v2\.0/.test(el.textContent)) el.textContent=el.textContent.replace(/SegaMap v1\.8|SegaMap v2\.0/g,'SegaMap v2.1');
    });
  }
  function boot(){ patchText(); addVersion(); setInterval(patchText,700); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
