/** Closed path, live motion, board rules, and a walkable spine. */
import fs from 'node:fs';
import { arcTable, pointAt } from '../rides/path-math.js';
import { blockCoasterSamples } from '../rides/coaster-paths.js';
import { dryRunRide, registerRide, stepRides, getRide } from '../rides/ride-runtime.js';
import { createOps } from '../rides/ride-ops.js';
import { resetParkLogic, attemptBoard, joinRide } from '../logic/ride-logic.js';
import { admit } from '../logic/ticket.js';
import { blocksWalk } from '../water/water.js';
import { sampleHeight } from '../terrain/height.js';

function row(name, status, detail) {
  return { area: 'rides', name, status, detail: detail || '' };
}

function seam(table) {
  const a = pointAt(table, 0);
  const b = pointAt(table, table.length);
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

export function rideRows() {
  const rows = [];
  const pack = blockCoasterSamples(3);
  const table = arcTable(pack.samples);
  const gap = seam(table);
  rows.push(row('hero path still closed', gap < 1.5 ? 'PASS' : 'FAIL', 'seam ' + gap.toFixed(3)));

  const dry = dryRunRide(table, pack.cars || 1, pack.carGap || 0, 0);
  let nan = false;
  for (const p of dry.seen || []) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.z)) nan = true;
  }
  rows.push(row('board dry-run has no NaN', dry.ok && !nan ? 'PASS' : 'FAIL', 'maxY ' + (dry.maxY || 0).toFixed(1)));

  const alive = fsExistsRide();
  if (!alive) {
    rows.push(row('coaster moves while open', 'SKIP', 'auto-ops missing'));
    rows.push(row('wheel still cycles', 'SKIP', 'auto-ops missing'));
  } else {
    resetParkLogic();
    registerRide({
      id: 'qc2-hero',
      kind: 'path',
      table,
      length: table.length,
      ops: createOps('ride-block-01'),
      phys: { drag: 0.004, liftV: 3.2, brake: 9, minLoop: 6 },
      layout() {},
    });
    registerRide({
      id: 'qc2-wheel',
      kind: 'wheel',
      ops: createOps('ride-board-01'),
      machine: { phase: 'BOARDING', omega: 0, angle: -Math.PI / 2, target: 0.28, turned: 0, count: 16 },
      layout() {},
    });
    for (let t = 0; t < 10; t += 0.05) stepRides(0.05);
    const hero = getRide('qc2-hero');
    const wheel = getRide('qc2-wheel');
    rows.push(row('coaster s changes within 10s', hero.ops.s > 1 && Number.isFinite(hero.ops.s) ? 'PASS' : 'FAIL', 's ' + hero.ops.s.toFixed(2) + ' ' + hero.ops.phase));
    rows.push(row('wheel still cycles', Math.abs(wheel.machine.omega) > 0.05 ? 'PASS' : 'FAIL', 'w ' + wheel.machine.omega));
  }

  const spineOpen = !blocksWalk(0, 150) && Math.abs(sampleHeight(0, 150)) < 0.3;
  rows.push(row('player can walk the spine', spineOpen ? 'PASS' : 'FAIL', 'h ' + sampleHeight(0, 150).toFixed(3)));

  resetParkLogic();
  admit();
  const ride = { id: 'ride-block-01', kind: 'coaster', ops: createOps('ride-block-01') };
  joinRide('ride-block-01');
  attemptBoard(ride);
  ride.ops.phase = 'COURSE';
  ride.ops.restraint = 'closed';
  const mid = attemptBoard(ride);
  rows.push(row('no board in COURSE', mid.ok === false && mid.reason === 'course' ? 'PASS' : 'FAIL', mid.reason));
  return rows;
}

function fsExistsRide() {
  return fs.existsSync(new URL('../alive/auto-ops.js', import.meta.url));
}
