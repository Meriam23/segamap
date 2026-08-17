/* SegaMap — route network reinforcement
   Cascavelle stop fix: the official NLTA timetable lists "Cascavelle"
   as the fare-stage/stop for route 57A. Do not require a fictional
   "Cascavelle Bus Terminal" node name.
   No timetable data is imported.
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

  // Official NLTA route 57A: Quatre Bornes -> La Louise -> Palma -> Beaux Songes -> Cascavelle.
  // Mauritius-Buses.com also lists Cascavelle as the route 57A endpoint.
  var cascavelleStop=[/Cascavelle$/i,/^Cascavelle$/i,/Cascavelle(?!.*Shopping)/i,/Cascavelle Village/i];

  addLine('57A',[/Quatre Bornes.*Traffic Centre/i,/Quatre Bornes.*Traffic/i],cascavelleStop,30);
  addLine('57',[/Quatre Bornes.*Traffic Centre/i,/Quatre Bornes.*Traffic/i],[/Wolmar Traffic Centre/i,/Flic en Flac Bus Terminus/i],45);
  addLine('69',[/Place Victoria Bus Terminal/i,/Port Louis Victoria/i,/Victoria Square/i],cascavelleStop,50);
  addLine('123',[/Place Victoria Bus Terminal/i,/Port Louis Victoria/i,/Victoria Square/i],[/Wolmar Traffic Centre/i,/Flic en Flac Bus Terminus/i],60);
  addLine('179',[/Curepipe.*Ian Palach North/i,/Curepipe/i],[/Wolmar Traffic Centre/i,/Flic en Flac Bus Terminus/i],70);
  addLine('189',[/Rose Hill.*Place/i,/Rose Hill/i],[/Wolmar Traffic Centre/i,/Flic en Flac Bus Terminus/i],60);
  addLine('52',[/Place Victoria Bus Terminal/i,/Port Louis.*Transportation/i,/Port Louis Victoria/i],[/Bambous Bus Terminal/i,/Bambous.*Royal/i],45);
  addLine('52B',[/Place Victoria Bus Terminal/i,/Port Louis.*Transportation/i,/Port Louis Victoria/i],[/Bambous Bus Terminal/i,/Bambous.*Royal/i],45);
  addLine('52C',[/Place Victoria Bus Terminal/i,/Port Louis.*Transportation/i,/Port Louis Victoria/i],[/Bambous Bus Terminal/i,/Bambous.*NHDC/i],48);
  addLine('229',[/Rose Hill.*Dar Es Salaam/i,/Rose Hill.*Place/i,/Rose Hill/i],[/Bambous Bus Terminal/i,/Bambous.*Royal/i],35);
  addLine('5',[/Quatre Bornes.*Traffic Centre/i,/Quatre Bornes.*Traffic/i],[/Baie du Cap/i],75);
})();
