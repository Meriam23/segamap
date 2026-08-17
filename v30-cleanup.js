/* SegaMap v3.0 — remove internal/debug status labels and position helper */
(function(){
  'use strict';
  function clean(root){
    if(!root || !root.querySelectorAll) return;
    var exact = /^(Réseau mauricien\s*[·•-]\s*160 arrêts & stations chargés|455\+ arrêts issus du catalogue officiel NLTA|Utiliser)$/i;
    root.querySelectorAll('body *').forEach(function(el){
      if(el.children.length) return;
      var t=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(t && exact.test(t)) el.remove();
    });
    /* Also remove legacy v1.x release markers, including the injected fixed badge. */
    root.querySelectorAll('#segamap-version').forEach(function(el){el.remove();});
    root.querySelectorAll('body *').forEach(function(el){
      if(el.children.length) return;
      var t=(el.textContent||'').trim();
      if(/^SegaMap v1\.[0-9]+$/.test(t)) el.remove();
    });
  }
  function boot(){
    clean(document);
    new MutationObserver(function(){clean(document);}).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
