/* SegaMap — mobile search UX */
(function(){
  function fit(){
    var app=document.querySelector('.app'), sheet=document.querySelector('#screen-home .sheet');
    if(!app || !sheet) return;
    var vv=window.visualViewport;
    var keyboard=vv ? Math.max(0, window.innerHeight-vv.height) : 0;
    sheet.style.maxHeight = 'calc(100% - 70px)';
    if(keyboard > 80){
      sheet.style.bottom = keyboard + 'px';
      sheet.style.maxHeight = 'calc(100% - '+(keyboard+12)+'px)';
    } else {
      sheet.style.bottom='0px';
    }
  }
  function improve(){
    var style=document.createElement('style');
    style.textContent=''+
      '#screen-home .sheet{z-index:2000;overflow:visible;}'+
      '#screen-home .fields-wrap{position:relative;z-index:2050;}'+
      '#screen-home .field-row{z-index:1;}'+
      '#screen-home .suggestions{z-index:2100;max-height:min(42vh,360px);overflow-y:auto;-webkit-overflow-scrolling:touch;}'+
      '#screen-home .suggestions.open{display:block;}'+
      '#screen-home .sugg-item{min-height:48px;align-items:center;}'+
      '@media(max-width:600px){#screen-home .sheet{padding-bottom:max(20px,env(safe-area-inset-bottom));}}';
    document.head.appendChild(style);
    fit();
  }
  function bind(){
    improve();
    ['origin-input','dest-input'].forEach(function(id){
      var el=document.getElementById(id);
      if(!el) return;
      ['focus','input','click'].forEach(function(ev){el.addEventListener(ev,fit,{passive:true});});
    });
    document.addEventListener('click',function(){setTimeout(fit,30);});
    window.addEventListener('resize',fit);
    if(window.visualViewport){window.visualViewport.addEventListener('resize',fit);window.visualViewport.addEventListener('scroll',fit);}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind); else bind();
})();
