// SegaMap Cascavelle routing correction v1.2.1
// Runs before the main routing engine and enriches the embedded transit dataset.
(function () {
  var el = document.getElementById('transit-data');
  if (!el) return;
  try {
    var data = JSON.parse(el.textContent);
    data.walkBB = data.walkBB || [];
    data.busLines = data.busLines || [];

    function addWalk(a, b, dist, min) {
      if (!data.walkBB.some(function (x) {
        return (x.a === a && x.b === b) || (x.a === b && x.b === a);
      })) {
        data.walkBB.push({ a: a, b: b, region: 'Ouest', dist_m: dist, walk_min: min });
      }
    }
    function addBus(a, b, line, ride) {
      if (!data.busLines.some(function (x) {
        return x.a === 'bus:' + a && x.b === 'bus:' + b && x.line === line;
      })) {
        data.busLines.push({ a: 'bus:' + a, b: 'bus:' + b, line: line, operator: 'IO/NTC', dist_m: Math.round(ride * 277), ride_min: ride, mountainous: false });
      }
    }

    // 57A reaches Cascavelle from Beaux Songes. The original dataset already
    // had the 57A segment to the multi-line Cascavelle stop; we add the terminal
    // as the same logical destination and connect the nearby stops by foot.
    addBus('Beaux Songes Bus Terminal', 'Cascavelle Bus Terminal', '57A', 8.0);
    addWalk('Cascavelle Bus Terminal', 'Bus stop Cascavelle (multi-lignes)', 110, 1.4);
    addWalk('Cascavelle Bus Terminal', 'Gare bus Cascavelle', 110, 1.4);
    addWalk('Gare bus Cascavelle', 'Bus stop Cascavelle (multi-lignes)', 179, 2.8);
    addWalk('Casela Bus Stop', 'Cascavelle Bus Terminal', 160, 2.5);
    addWalk('Casela Bus Stop', 'Bus stop Cascavelle (multi-lignes)', 210, 3.2);

    el.textContent = JSON.stringify(data);
  } catch (e) {
    console.warn('SegaMap Cascavelle fix skipped:', e);
  }
})();
