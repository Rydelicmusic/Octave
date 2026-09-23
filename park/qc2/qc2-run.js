/** QC2 runner. Returns { pass, fail, skip, rows }. */
import { bootRows } from './qc2-boot.js';
import { terrainRows } from './qc2-terrain.js';
import { waterRows } from './qc2-water.js';
import { npcRows } from './qc2-npc.js';
import { rideRows } from './qc2-rides.js';
import { bootNpcs, stepNpcs, npcList, resetNpcs } from '../npc/npc.js';
import { sampleHeight } from '../terrain/height.js';

function row(name, status, detail) {
  return { area: 'soak', name, status, detail: detail || '' };
}

export function soakRows() {
  resetNpcs();
  bootNpcs();
  let nan = false;
  const t0 = Date.now();
  for (let t = 0; t < 30; t += 0.1) {
    stepNpcs(0.1);
    for (const npc of npcList()) {
      if (!Number.isFinite(npc.x) || !Number.isFinite(npc.z)) nan = true;
      const y = sampleHeight(npc.x, npc.z);
      if (!Number.isFinite(y)) nan = true;
    }
  }
  const ms = Date.now() - t0;
  return [
    row('30s soak has no NaN', nan ? 'FAIL' : 'PASS', ms + ' ms'),
    row('soak stays cheap', ms < 4000 ? 'PASS' : 'FAIL', ms + ' ms'),
  ];
}

export async function runQc2() {
  const rows = [];
  rows.push(...bootRows());
  rows.push(...terrainRows());
  rows.push(...waterRows());
  rows.push(...npcRows());
  rows.push(...rideRows());
  rows.push(...soakRows());
  const pass = rows.filter((r) => r.status === 'PASS').length;
  const fail = rows.filter((r) => r.status === 'FAIL').length;
  const skip = rows.filter((r) => r.status === 'SKIP').length;
  return { pass, fail, skip, rows };
}

const main = process.argv[1] && process.argv[1].endsWith('qc2-run.js');
if (main) {
  const result = await runQc2();
  for (const line of result.rows) {
    console.log(line.status.padEnd(4), line.area.padEnd(8), line.name, line.detail ? '— ' + line.detail : '');
  }
  console.log('pass ' + result.pass + '  fail ' + result.fail + '  skip ' + result.skip);
  process.exit(result.fail ? 1 : 0);
}
