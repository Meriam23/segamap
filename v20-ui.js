// SegaMap v2.0 UI patch — injected inside the main app scope.
(function(){
  'use strict';
  if(typeof document==='undefined' || typeof trip==='undefined') return;

  function esc(v){ return typeof escapeHtml==='function' ? escapeHtml(String(v||'')) : String(v||''); }

  function busOptions(fromId,toId,currentLine){
    var out=[];
    (DATA.busLines||[]).forEach(function(e){
      if(!e || !e.line) return;
      var direct = (e.a===fromId && e.b===toId) || (e.a===toId && e.b===fromId);
      if(direct && out.indexOf(String(e.line))===-1) out.push(String(e.line));
    });
    if(currentLine && out.indexOf(String(currentLine))===-1) out.unshift(String(currentLine));
    return out;
  }

  function inlineDetail(l, legIdx, card){
    var old=card.querySelector('.v20-inline-detail');
    if(old){ old.remove(); card.classList.remove('expanded'); return; }
    var box=document.createElement('div');
    box.className='v20-inline-detail';
    var title='', text='', stats='', extra='';
    if(l.mode==='walk'){
      var distM=(l.rideMin*WALK_SPEED_M_MIN)/DETOUR_FACTOR;
      title='Détail de la marche';
      stats='<span>'+fmtMin(l.rideMin)+'</span><span>'+fmtDist(distM)+'</span>';
      text='Marchez depuis <strong>'+esc(nodes[l.from].name)+'</strong> jusqu’à <strong>'+esc(nodes[l.to].name)+'</strong>.';
      if(l.isFallback) text+=' Cet arrêt est le point connecté le plus proche de votre position.';
    } else if(l.mode==='bus'){
      var opts=busOptions(l.from,l.to,l.line);
      title='Détail du bus';
      stats='<span>~'+fmtMin(l.rideMin)+'</span><span>Attente ~'+Math.round(l.waitMin)+' min</span>';
      text='Prenez le <strong>bus '+esc(l.line)+'</strong> à <strong>'+esc(nodes[l.from].name)+'</strong> en direction de <strong>'+esc(nodes[l.to].name)+'</strong>.';
      if(opts.length>1){
        extra='<div class="v20-bus-alternatives"><strong>Plusieurs bus possibles</strong><div>'+opts.map(function(x){return '<span class="line-chip-badge">'+esc(x)+'</span>';}).join('')+'</div></div>';
      }
    } else {
      title='Détail du Metro Express';
      stats='<span>~'+fmtMin(l.rideMin)+'</span><span>Attente ~'+Math.round(l.waitMin)+' min</span><span>'+(l.stops>1?l.stops+' arrêts':'1 arrêt')+'</span>';
      text='Prenez le <strong>Metro Express</strong> à <strong>'+esc(nodes[l.from].name)+'</strong> en direction de <strong>'+esc(nodes[l.to].name)+'</strong>.';
    }
    box.innerHTML='<div class="v20-detail-title">'+title+'</div><div class="v20-detail-stats">'+stats+'</div><div class="v20-detail-text">'+text+'</div>'+extra;
    card.appendChild(box); card.classList.add('expanded');
  }

  function apply(){
    var style=document.createElement('style');
    style.textContent=''+
      '#screen-overview .steps-header,#screen-overview .steps-hint{display:none!important;}'+
      '.step-card.v20-expandable{display:block;position:relative;}'+
      '.step-card.v20-expandable>.step-body{display:block;}'+
      '.step-card.v20-expandable .step-chevron{transition:transform .18s ease;}'+
      '.step-card.v20-expandable.expanded .step-chevron{transform:rotate(90deg);}'+
      '.v20-inline-detail{margin:12px 0 2px;padding:12px 0 2px;border-top:1px solid var(--line);font-size:12px;line-height:1.5;}'+
      '.v20-detail-title{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;margin-bottom:7px;}'+
      '.v20-detail-stats{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:8px;}'+
      '.v20-detail-stats span{background:#F0F2F5;border-radius:8px;padding:5px 8px;font-family:"IBM Plex Mono",monospace;font-size:10.5px;}'+
      '.v20-detail-text{color:var(--ink-soft);}'+
      '.v20-bus-alternatives{margin-top:10px;padding-top:9px;border-top:1px solid #ECEEF1;}'+
      '.v20-bus-alternatives>div{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px;}';
    document.head.appendChild(style);

    var list=document.getElementById('steps-list');
    if(!list) return;
    Array.prototype.forEach.call(list.querySelectorAll('.step-card[data-leg]'),function(card){
      card.classList.add('v20-expandable');
      card.addEventListener('click',function(ev){
        // v2.0: expand/collapse in place instead of opening a separate detail screen.
        ev.preventDefault(); ev.stopImmediatePropagation();
        var idx=parseInt(card.dataset.leg,10);
        if(!isNaN(idx)) inlineDetail(trip.legs[idx],idx,card);
      },true);
    });
  }

  var originalRenderOverview=renderOverview;
  renderOverview=function(){
    originalRenderOverview();
    setTimeout(apply,0);
  };
  apply();
})();
