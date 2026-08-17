/* SegaMap — route network reinforcement
   Uses route/terminus information verified against Mauritius-Buses.com.
   This is deliberately a small, safe patch layered over the existing graph.
*/
(function(){
  'use strict';
  if(typeof nodes==='undefined' || typeof adj==='undefined' || typeof addEdge!=='function') return;

  function find(patterns){
    var ids=Object.keys(nodes);
    for(var i=0;i<patterns.length;i++){
      var re=patterns[i];
      for(var j=0;j<ids.length;j++){
        var n=nodes[ids[j]];
        if(n && re.test((n.name||'')+' '+(n.area||''))) return n;
      }
    }
    return null;
  }
  function addLine(line, fromPatterns, toPatterns, minutes){
    var a=find(fromPatterns), b=find(toPatterns);
    if(!a || !b || a.id===b.id) return false;
    adj[a.id]=adj[a.id]||[]; adj[b.id]=adj[b.id]||[];
    var exists=(adj[a.id]||[]).some(function(e){return e.to===b.id && e.mode==='bus' && e.line===line;});
    if(!exists) addEdge(a.id,b.id,'bus',line,minutes);
    return true;
  }

  /* Verified route endpoints from the public Mauritius-Buses catalogue:
     57: Quatre Bornes -> Wolmar
     57A: Cascavelle -> Quatre Bornes
     69: Port Louis -> Cascavelle Village
     123: Port Louis -> Wolmar
     179: Curepipe -> Wolmar
     189: Rose Hill -> Wolmar
     These connections are used only to restore missing direct-line choices;
     the existing detailed graph remains in place for intermediate routing.
  */
  addLine('57A',[/Quatre Bornes.*Traffic Centre/i,/Quatre Bornes.*Traffic/i],[/Cascavelle Bus Terminal/i,/Gare bus Cascavelle/i,/Cascavelle.*multi-lignes/i],30);
  addLine('57',[/Quatre Bornes.*Traffic Centre/i,/Quatre Bornes.*Traffic/i],[/Wolmar Traffic Centre/i,/Flic en Flac Bus Terminus/i],45);
  addLine('69',[/Place Victoria Bus Terminal/i,/Port Louis Victoria/i,/Victoria Square/i],[/Cascavelle Bus Terminal/i,/Gare bus Cascavelle/i,/Cascavelle.*multi-lignes/i],50);
  addLine('123',[/Place Victoria Bus Terminal/i,/Port Louis Victoria/i,/Victoria Square/i],[/Wolmar Traffic Centre/i,/Flic en Flac Bus Terminus/i],60);
  addLine('179',[/Curepipe.*Ian Palach North/i,/Curepipe/i],[/Wolmar Traffic Centre/i,/Flic en Flac Bus Terminus/i],70);
  addLine('189',[/Rose Hill.*Place/i,/Rose Hill/i],[/Wolmar Traffic Centre/i,/Flic en Flac Bus Terminus/i],60);
})();
