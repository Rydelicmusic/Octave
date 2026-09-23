/** Run every QC block. Returns { pass, fail, skip, rows }. */
import { bootRows } from './qc-boot.js';
import { layoutRows } from './qc-layout.js';
import { pathRows } from './qc-paths.js';
import { physicsRows } from './qc-physics.js';
import { logicRows } from './qc-logic.js';
import { rideRows } from './qc-ride.js';
import { perfRows } from './qc-perf.js';

export async function runQc() {
  const rows = [];
  rows.push(...bootRows());
  rows.push(...layoutRows());
  rows.push(...pathRows());
  rows.push(...await physicsRows());
  rows.push(...await logicRows());
  rows.push(...rideRows());
  rows.push(...perfRows());
  const pass = rows.filter((r) => r.status === 'PASS').length;
  const fail = rows.filter((r) => r.status === 'FAIL').length;
  const skip = rows.filter((r) => r.status === 'SKIP').length;
  return { pass, fail, skip, rows };
}

const main = process.argv[1] && process.argv[1].endsWith('qc-run.js');
if (main) {
  const result = await runQc();
  for (const row of result.rows) {
    console.log(row.status.padEnd(4), row.area.padEnd(8), row.name, row.detail ? '— ' + row.detail : '');
  }
  console.log('pass ' + result.pass + '  fail ' + result.fail + '  skip ' + result.skip);
  process.exit(result.fail ? 1 : 0);
}
