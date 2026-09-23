/** Closed paths, seam, and sample count. Fleet rides are not rails. */
import { arcTable, pointAt, hasNaN } from '../rides/path-math.js';
import { allPaths, RIDE_ANCHORS } from '../rides/coaster-paths.js';

function row(name, status, detail) {
  return { area: 'paths', name, status, detail: detail || '' };
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

export function pathRows() {
  const rows = [];
  const seen = new Set();
  for (const pack of allPaths()) {
    const key = pack.id + ' v' + (pack.version || 1);
    seen.add(pack.id);
    const table = arcTable(pack.samples);
    const seam = dist(pointAt(table, 0), pointAt(table, table.length));
    const nan = hasNaN(pack.samples);
    const closed = seam < 1.5 && table.length > 8 && pack.samples.length > 8 && !nan;
    rows.push(row(
      key + ' closed',
      closed ? 'PASS' : 'FAIL',
      'n ' + pack.samples.length + ' len ' + table.length.toFixed(1) + ' seam ' + seam.toFixed(3),
    ));
  }
  for (const id of Object.keys(RIDE_ANCHORS)) {
    if (seen.has(id)) continue;
    const ride = RIDE_ANCHORS[id];
    rows.push(row(id + ' path', 'SKIP', ride.type + ' has no rail to close'));
  }
  return rows;
}
