// SegaMap v1.8 — verified west-island route reinforcement.
// Sources checked: Mauritius-Buses route catalogue and route pages.
// This file contains route topology only; no timetable data is imported.
(function () {
  'use strict';
  var el = document.getElementById('transit-data');
  if (!el) return;
  try {
    var data = JSON.parse(el.textContent);
    data.walkBB = data.walkBB || [];
    data.busLines = data.busLines || [];

    function addWalk(a, b, dist, min) {
      if (!data.walkBB.some(function (x) {
        return (x.a === a && x.b === b) || (x.a === b && x.b === a);
      })) data.walkBB.push({ a:a, b:b, region:'Ouest', dist_m:dist, walk_min:min });
    }
    function addBus(a, b, line, ride, operator) {
      var A = 'bus:' + a, B = 'bus:' + b;
      if (!data.busLines.some(function (x) {
        return x.a === A && x.b === B && x.line === line;
      })) data.busLines.push({
        a:A, b:B, line:line, operator:operator || 'NTC/IO',
        dist_m:Math.round(ride * 277), ride_min:ride, mountainous:false
      });
    }

    // Existing Cascavelle links kept intact.
    addBus('Beaux Songes Bus Terminal', 'Cascavelle Bus Terminal', '57A', 8.0, 'IO');
    addWalk('Cascavelle Bus Terminal', 'Bus stop Cascavelle (multi-lignes)', 110, 1.4);
    addWalk('Gare bus Cascavelle', 'Bus stop Cascavelle (multi-lignes)', 179, 2.8);
    addWalk('Casela Bus Stop', 'Cascavelle Bus Terminal', 160, 2.5);
    addWalk('Casela Bus Stop', 'Bus stop Cascavelle (multi-lignes)', 210, 3.2);

    // Route 69: Mauritius-Buses lists Port Louis Victoria Square -> Cascavelle Village.
    // The embedded network had the line stopping at Beaux Songes, so complete the
    // west-side topology to the existing Cascavelle interchange.
    addBus('Quatre Bornes Bus Station', 'Beaux Songes Bus Terminal', '69', 22.0, 'IO');
    addBus('Beaux Songes Bus Terminal', 'Bus stop Cascavelle (multi-lignes)', '69', 8.0, 'IO');

    // Route 123: the catalogue lists Port Louis Transportation Centre -> Wolmar;
    // the island route descriptions place the western sequence through Bambous /
    // Cascavelle before Wolmar. Keep the existing Bambous -> Wolmar edge and add
    // the missing Cascavelle segment so searches for Cascavelle can use line 123.
    addBus('Immigration Square', 'Bambous Bus Terminal', '123', 56.4, 'NTC/IO');
    addBus('Bambous Bus Terminal', 'Bus stop Cascavelle (multi-lignes)', '123', 8.0, 'NTC/IO');
    addBus('Bus stop Cascavelle (multi-lignes)', 'Wolmar Traffic Centre', '123', 16.0, 'NTC/IO');

    // Preserve the known direct western lines.
    addBus('Quatre Bornes Bus Station', 'Beaux Songes Bus Terminal', '57', 22.0, 'IO');
    addBus('Beaux Songes Bus Terminal', 'Bambous Bus Terminal', '57', 9.2, 'IO');
    addBus('Bambous Bus Terminal', 'Flic en Flac Bus Terminus', '57', 24.2, 'IO');
    addBus('Flic en Flac Bus Terminus', 'Wolmar Traffic Centre', '57', 0.1, 'IO');

    el.textContent = JSON.stringify(data);
  } catch (e) {
    console.warn('SegaMap v1.8 route reinforcement skipped:', e);
  }
})();
