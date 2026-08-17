/* SegaMap search UI cleanup */
(function(){
  'use strict';
  function clean(root){
    if(!root || !root.querySelectorAll) return;
    root.querySelectorAll('.tag-metro,.tag-poi').forEach(function(el){ el.remove(); });
    root.querySelectorAll('.sugg-name').forEach(function(el){
      el.style.display='block';
      el.style.minWidth='0';
      el.style.overflow='hidden';
      el.style.textOverflow='ellipsis';
      el.style.whiteSpace='nowrap';
    });
    root.querySelectorAll('.sugg-item').forEach(function(el){
      el.style.display='block';
      el.style.minWidth='0';
    });
  }
  function removeHelperText(root){
    if(!root || !root.querySelectorAll) return;
    var bad = /arr[êe]t le plus proche|cet arr[êe]t n['’]a pas de correspondance|pas de correspondance pour cet arr[êe]t/i;
    root.querySelectorAll('body *').forEach(function(el){
      if(el.children.length) return;
      var t=(el.textContent||'').trim();
      if(t && bad.test(t)) el.remove();
    });
  }
  function boot(){
    clean(document);
    removeHelperText(document);
    var style=document.createElement('style');
    style.textContent='.suggestions .tag-metro,.suggestions .tag-poi{display:none!important}.suggestions{max-height:min(42vh,360px);overflow-y:auto;overscroll-behavior:contain}.sugg-item{min-width:0}.sugg-name{display:block!important;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sugg-meta{display:block;max-width:42%;overflow:hidden;text-overflow:ellipsis;}';
    document.head.appendChild(style);
    new MutationObserver(function(){clean(document);removeHelperText(document);}).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
