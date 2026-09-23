/** Spine, hub, canopy, and the dry-park water guard. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCK, occupiesSpine } from '../lock.js';
import { allPaths, landOk, RIDE_ANCHORS } from '../rides/coaster-paths.js';

const parkDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function row(name, status, detail) {
  return { area: 'layout', name, status, detail: detail || '' };
}

const LANDS = ['The Block', 'After Hours', 'The Board', 'The Pocket'];

export function layoutRows() {
  const rows = [];
  const names = Object.keys(LOCK.canopies || {});
  const landsOk = LANDS.every((land) => names.includes(land));
  rows.push(row('four land names', landsOk ? 'PASS' : 'FAIL', names.join(', ')));

  const index = fs.readFileSync(path.join(parkDir, 'index.html'), 'utf8');
  const dry = index.includes('window.__PARK_DRY=true');
  const guarded = index.includes('if(!window.__PARK_DRY) LOCK.waters.forEach');
  rows.push(row('water meshes stay off', dry && guarded ? 'PASS' : 'FAIL', dry ? 'PARK_DRY guards water()' : 'dry flag missing'));

  let bad = 0;
  let spine = 0;
  let hub = 0;
  const examples = [];
  for (const pack of allPaths()) {
    for (const sample of pack.samples) {
      const why = landOk(sample, pack.land, 2);
      if (why) {
        bad += 1;
        if (examples.length < 4) examples.push(pack.id + ' ' + why);
      }
      if (occupiesSpine(sample.x, sample.z, 2)) spine += 1;
      if (Math.hypot(sample.x, sample.z) < LOCK.hubOuter + 2) hub += 1;
    }
  }
  rows.push(row('path samples stay in canopy', bad === 0 ? 'PASS' : 'FAIL', bad ? examples.join('; ') : 'violations 0'));
  rows.push(row('no ride sample on the spine', spine === 0 ? 'PASS' : 'FAIL', 'spine hits ' + spine));
  rows.push(row('no ride sample inside hubOuter', hub === 0 ? 'PASS' : 'FAIL', 'hub hits ' + hub));

  const anchorLands = new Set(Object.values(RIDE_ANCHORS).map((ride) => ride.land));
  const anchorOk = LANDS.every((land) => anchorLands.has(land));
  rows.push(row('anchors use the four lands', anchorOk ? 'PASS' : 'FAIL', [...anchorLands].join(', ')));
  return rows;
}
