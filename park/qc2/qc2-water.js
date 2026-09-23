/** Allow-list water. Rings, hub, and the spine are failures. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASINS, pocketPools, blocksWalk, waterHitsHubOrSpine } from '../water/water.js';
import { legalWaypoints } from '../npc/nav.js';

const parkDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ALLOW = {
  'board-lagoon': 'Board basin',
  'plaza-fountain': 'one plaza fountain',
  'hours-canal': 'Hours canal inside the dark volume',
  'pocket-pool': 'single Pocket pool',
  'block-dive-splash': 'one dive skim basin under the Block dive',
};

function row(name, status, detail) {
  return { area: 'water', name, status, detail: detail || '' };
}

export function waterRows() {
  const rows = [];
  const hits = waterHitsHubOrSpine();
  rows.push(row('hub and spine stay dry', hits.length === 0 ? 'PASS' : 'FAIL', hits.join(', ') || '0 hits'));

  const pools = pocketPools();
  const rings = pools.length > 1 || pools.some((b) => b.rings) || BASINS.some((b) => Array.isArray(b.rings));
  rows.push(row('no Pocket multi-ring water', !rings && pools.length === 1 ? 'PASS' : 'FAIL', 'pools ' + pools.length));

  const unknown = BASINS.filter((b) => !ALLOW[b.id]);
  rows.push(row('every basin is on the allow list', unknown.length === 0 ? 'PASS' : 'FAIL', BASINS.map((b) => b.id + '=' + (ALLOW[b.id] || 'ILLEGAL')).join('; ')));

  const purpose = BASINS.every((b) => ALLOW[b.id] && b.rx > 0 && b.rz > 0 && !b.rings);
  rows.push(row('each basin has one purpose and one shape', purpose ? 'PASS' : 'FAIL', ''));

  const lagoon = blocksWalk(238, 72);
  const spine = blocksWalk(0, 120);
  const hub = blocksWalk(0, 0);
  rows.push(row('walk stops at water and not on the road', lagoon && !spine && !hub ? 'PASS' : 'FAIL', 'lagoon ' + lagoon + ' spine ' + spine));

  const wetNpc = legalWaypoints().filter((p) => blocksWalk(p.x, p.z));
  rows.push(row('waypoints are not in the water', wetNpc.length === 0 ? 'PASS' : 'FAIL', 'wet ' + wetNpc.length));

  const index = fs.readFileSync(path.join(parkDir, 'index.html'), 'utf8');
  const oldOff = index.includes('window.__PARK_DRY=true') && index.includes('if(!window.__PARK_DRY) LOCK.waters.forEach');
  rows.push(row('old concentric lakes stay gated', oldOff ? 'PASS' : 'FAIL', ''));
  return rows;
}
