/* SegaMap v3.0 — reliable suggestion selection on iPad/touch */
(function(){
  'use strict';
  function selectResult(box,item){
    if(!item) return false;
    var id=item.getAttribute('data-sega-v22-id');
    if(!id || typeof nodes==='undefined' || !nodes[id]) return false;
    var n=nodes[id];
    var input=box && box.previousElementSibling;
    if(!input || !input.matches('input')) {
      input=box.parentElement && box.parentElement.querySelector('input');
    }
    if(!input) return false;
    input.value=n.name || n.displayAddress || '';
    input.dataset.selectedId=n.id;
    input.dispatchEvent(new Event('input',{bubbles:true}));
    input.dispatchEvent(new Event('change',{bubbles:true}));
    box.classList.remove('open');
    box.style.display='none';
    if(typeof homeMap!=='undefined' && homeMap && isFinite(n.lat) && isFinite(n.lon)) homeMap.setView([n.lat,n.lon],16);
    return true;
  }
  function bind(){
    document.querySelectorAll('#origin-sugg,#dest-sugg').forEach(function(box){
      if(box.dataset.v30Bound) return;
      box.dataset.v30Bound='1';
      function handle(e){
        var item=e.target && e.target.closest ? e.target.closest('[data-sega-v22-id]') : null;
        if(!item) return;
        e.preventDefault();
        e.stopPropagation();
        selectResult(box,item);
      }
      box.addEventListener('click',handle,true);
      box.addEventListener('touchend',handle,{capture:true,passive:false});
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind); else bind();
  setTimeout(bind,500);
})();
