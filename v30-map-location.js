/* SegaMap v3.0 — map tap -> active search field */
(function(){
  'use strict';
  var activeInput=null, busy=false;
  function pickInput(){
    var o=document.getElementById('origin-input'), d=document.getElementById('dest-input');
    if(document.activeElement===o) return o;
    if(document.activeElement===d) return d;
    return activeInput||o;
  }
  function setValue(input,name,lat,lon){
    if(!input)return;
    input.value=name;
    input.dataset.lat=String(lat); input.dataset.lon=String(lon);
    input.dataset.selectedId='map:'+lat.toFixed(5)+':'+lon.toFixed(5);
    input.dispatchEvent(new Event('input',{bubbles:true}));
    var box=document.getElementById(input.id==='origin-input'?'origin-sugg':'dest-sugg');
    if(box){box.classList.remove('open');box.style.display='none';box.innerHTML='';}
    input.blur();
  }
  function reverse(lat,lon,input){
    if(busy)return; busy=true;
    fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&lat='+encodeURIComponent(lat)+'&lon='+encodeURIComponent(lon)+'&accept-language=fr,en',{headers:{Accept:'application/json'}})
      .then(function(r){return r.ok?r.json():null;})
      .then(function(x){
        var a=x&&x.address||{}, name=(x&&x.name)||a.road||a.pedestrian||a.neighbourhood||a.suburb||a.village||a.town||x&&x.display_name||('Position '+lat.toFixed(5)+', '+lon.toFixed(5));
        setValue(input,name,lat,lon);
      }).catch(function(){setValue(input,'Position sélectionnée',lat,lon);}).finally(function(){busy=false;});
  }
  function bind(){
    var o=document.getElementById('origin-input'),d=document.getElementById('dest-input');
    [o,d].forEach(function(x){if(x)x.addEventListener('focus',function(){activeInput=x;},true);});
    function attach(){
      if(typeof homeMap==='undefined'||!homeMap||typeof homeMap.on!=='function'){setTimeout(attach,500);return;}
      homeMap.on('click',function(e){
        var input=pickInput();
        if(!input||!e||!e.latlng)return;
        reverse(e.latlng.lat,e.latlng.lng,input);
      });
    }
    attach();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
