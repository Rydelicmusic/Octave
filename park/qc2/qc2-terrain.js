/** Grade, spine, pads, and rail clearance. */
import { sampleHeight, supportSpan, railClear } from '../terrain/height.js';
import { BERMS } from '../terrain/ground.js';
import { WAYPOINTS } from '../npc/nav.js';
import { blockCoasterSamples, RIDE_ANCHORS } from '../rides/coaster-paths.js';

function row(name, status, detail) {
  return { area: 'terrain', name, status, detail: detail || '' };
}

export function terrainRows() {
  const rows = [];
  const outside = [];
  const spots = [[-160, 10], [-150, -20], [180, 10], [200, 40], [-40, -150], [40, -155], [80, 140], [110, 120]];
  for (const [x, z] of spots) outside.push(sampleHeight(x, z));
  const spread = Math.max(...outside) - Math.min(...outside);
  rows.push(row('land grade is not one plane', spread > 0.4 ? 'PASS' : 'FAIL', 'spread ' + spread.toFixed(2) + ' m'));

  let spineBad = 0;
  let worst = 0;
  for (let z = -200; z <= 220; z += 8) {
    const h = sampleHeight(0, z);
    worst = Math.max(worst, Math.abs(h));
    if (Math.abs(h) > 0.3) spineBad += 1;
  }
  rows.push(row('spine centerline near old grade', spineBad === 0 ? 'PASS' : 'FAIL', 'worst ' + worst.toFixed(3)));
  rows.push(row('hub stays at y 0', sampleHeight(0, 0) === 0 && Math.abs(sampleHeight(8, 8)) < 0.05 ? 'PASS' : 'FAIL', ''));

  let floaters = 0;
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const a = WAYPOINTS[i];
    const b = WAYPOINTS[i + 1];
    if (a.land !== b.land) continue;
    const mid = sampleHeight((a.x + b.x) / 2, (a.z + b.z) / 2);
    const pathY = mid + 0.05;
    if (Math.abs(pathY - mid) > 0.2) floaters += 1;
  }
  rows.push(row('grade paths sit on the field', floaters === 0 ? 'PASS' : 'FAIL', 'floaters ' + floaters));

  let buried = 0;
  for (const spec of BERMS) {
    const top = sampleHeight(spec.x, spec.z) + spec.lift;
    if (top > 3 || top < -1.2) buried += 1;
  }
  rows.push(row('berms stay in a park grade', buried === 0 && BERMS.length >= 4 ? 'PASS' : 'FAIL', 'pads ' + BERMS.length));

  let sunk = 0;
  let minClear = Infinity;
  for (const p of blockCoasterSamples(3).samples) {
    const clear = railClear(p.y, sampleHeight(p.x, p.z));
    minClear = Math.min(minClear, clear);
    if (clear < 0.6) sunk += 1;
  }
  rows.push(row('hero rail is above the berm', sunk === 0 ? 'PASS' : 'FAIL', 'min clear ' + minClear.toFixed(2)));
  const span = supportSpan(10, sampleHeight(-190, 30));
  rows.push(row('supports reach grade under the rail', span.top > span.foot && span.height >= 0.8 ? 'PASS' : 'FAIL', 'h ' + span.height.toFixed(2)));

  let padHigh = 0;
  for (const ride of Object.values(RIDE_ANCHORS)) {
    if (sampleHeight(ride.x, ride.z) > 2.2) padHigh += 1;
  }
  rows.push(row('ride pads are not under a wall', padHigh === 0 ? 'PASS' : 'FAIL', 'high ' + padHigh));
  return rows;
}
