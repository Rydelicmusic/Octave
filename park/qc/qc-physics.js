/** Energy and e-stop. SKIP the block only when physics.js is absent. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { arcTable } from '../rides/path-math.js';
import { blockCoasterSamples } from '../rides/coaster-paths.js';

const physicsFile = path.join(path.dirname(path.dirname(fileURLToPath(import.meta.url))), 'rides/physics.js');

function row(name, status, detail) {
  return { area: 'physics', name, status, detail: detail || '' };
}

export async function physicsRows() {
  if (!fs.existsSync(physicsFile)) {
    return [row('physics.js', 'SKIP', 'file not built')];
  }
  const physics = await import('../rides/physics.js');
  const opsMod = await import('../rides/ride-ops.js');
  const rows = [];
  const table = arcTable(blockCoasterSamples(3).samples);
  const sim = physics.simulateEnergy(table, 420, { drag: 0.004, liftV: 3.2, brake: 9, minLoop: 6 });
  const station = sim.state.s < 1.5 && sim.state.v < 0.2;
  rows.push(row('station v ~ 0 after a lap', station && !sim.nan ? 'PASS' : 'FAIL', 's ' + sim.state.s.toFixed(2) + ' v ' + sim.state.v.toFixed(2)));
  const dropped = sim.vAfterDrop != null && sim.vAtLift != null && sim.vAfterDrop > sim.vAtLift + 1;
  rows.push(row('first drop increases v', dropped ? 'PASS' : 'FAIL', 'lift ' + sim.vAtLift + ' drop ' + sim.vAfterDrop));

  const ops = opsMod.createOps('ride-block-01');
  ops.phase = 'COURSE';
  ops.s = 180;
  ops.v = 12;
  opsMod.eStop(ops);
  const at = ops.s;
  for (let t = 0; t < 1; t += 0.05) physics.stepEnergy(ops, table, 0.05, { drag: 0.004, liftV: 3.2, brake: 9, minLoop: 6 });
  const stayed = ops.phase === 'BRAKE' && ops.s > 100 && Math.abs(ops.s - at) < 40;
  rows.push(row('e-stop brakes on the rail', stayed ? 'PASS' : 'FAIL', 'phase ' + ops.phase + ' s ' + ops.s.toFixed(1) + ' from ' + at.toFixed(1)));
  return rows;
}
