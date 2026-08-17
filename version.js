/* SegaMap release marker */
(function(){
  function show(){
    if(document.getElementById('segamap-version')) return;
    var el=document.createElement('div');
    el.id='segamap-version';
    el.textContent='SegaMap v1.4';
    el.style.cssText='position:fixed;right:10px;bottom:8px;z-index:99999;padding:4px 8px;border:1px solid #E7E9EC;border-radius:999px;background:rgba(255,255,255,.92);box-shadow:0 2px 8px rgba(15,20,30,.08);font:600 9px Inter,system-ui,sans-serif;color:#5B6472;pointer-events:none;backdrop-filter:blur(4px);';
    document.body.appendChild(el);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',show); else show();
})();
