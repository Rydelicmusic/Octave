/** One dry period per id. Path rides lap. Fleet rides step their own machine. */
import { arcTable } from '../rides/path-math.js';
import { allPaths, RIDE_ANCHORS, blockCoasterSamples, launchCoasterSamples, boardFamilySamples, kiddieSamples, darkSamples } from '../rides/coaster-paths.js';
import { dryRunRide } from '../rides/ride-runtime.js';
import { carName } from '../rides/track-build.js';
import { createOps } from '../rides/ride-ops.js';
import { stepWheel, stepSwings, stepDropRide, stepSpin } from '../rides/physics.js';
import { resetParkLogic, joinRide, attemptBoard } from '../logic/ride-logic.js';
import { admit } from '../logic/ticket.js';

function row(name, status, detail) {
  return { area: 'ride', name, status, detail: detail || '' };
}

function lapPack(pack) {
  const table = arcTable(pack.samples);
  const run = dryRunRide(table, pack.cars || 1, pack.carGap || 0, pack.stationHold || 0);
  let nan = false;
  for (const p of run.seen) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.z)) nan = true;
  }
  return { ok: run.ok && !nan, elapsed: run.elapsed, maxY: run.maxY, nan };
}

export function rideRows() {
  const rows = [];
  rows.push(row('lead car name', carName('ride-block-01', 0) === 'ride-block-01-car' ? 'PASS' : 'FAIL', carName('ride-block-01', 0)));

  const packs = [
    blockCoasterSamples(3),
    launchCoasterSamples(2),
    boardFamilySamples(),
    kiddieSamples(),
    darkSamples(1),
    darkSamples(2),
  ];
  for (const pack of packs) {
    const lap = lapPack(pack);
    const hero = pack.id === 'ride-block-01';
    const ok = lap.ok && (!hero || lap.maxY > 28);
    rows.push(row(pack.id + ' dry lap', ok ? 'PASS' : 'FAIL', 'elapsed ' + (lap.elapsed || 0).toFixed(1) + ' maxY ' + (lap.maxY || 0).toFixed(1)));
  }

  const fleet = {
    'ride-board-01': 'gondolas on the wheel, not a rail car',
    'ride-board-02': 'swing seats, not a rail car',
    'ride-board-drop': 'drop cabin, not a rail car',
    'ride-pocket-01': 'bumper cars orbit the deck, not a rail car',
  };
  for (const [id, why] of Object.entries(fleet)) {
    if (!RIDE_ANCHORS[id]) rows.push(row(id + ' vehicle', 'FAIL', 'missing anchor'));
    else rows.push(row(id + ' vehicle', 'SKIP', why));
  }

  const wheel = { phase: 'DISPATCH', omega: 0, angle: -Math.PI / 2, target: 0.28, turned: 0 };
  for (let t = 0; t < 30 && wheel.phase !== 'UNLOAD'; t += 0.05) stepWheel(wheel, 0.05);
  rows.push(row('wheel period', wheel.phase === 'UNLOAD' && Number.isFinite(wheel.angle) ? 'PASS' : 'FAIL', wheel.phase));

  const swings = { phase: 'DISPATCH', omega: 0, omegaMax: 0.8, ramp: 0.4, holdTime: 0.4, radius: 8, angle: 0, kick: 0, mode: 'REST' };
  for (let t = 0; t < 20 && swings.phase !== 'UNLOAD'; t += 0.05) stepSwings(swings, 0.05);
  rows.push(row('swings period', swings.phase === 'UNLOAD' && swings.kick >= 0 && Number.isFinite(swings.angle) ? 'PASS' : 'FAIL', swings.phase));

  const drop = { phase: 'DISPATCH', mode: 'HOIST', y: 2.2, vy: 0, hoistV: 2.4, top: 26, catchY: 6, bottom: 2.2, hangTime: 0.3, peak: 2.2, hoistDy: 0, eStop: false };
  let peak = 2.2;
  for (let t = 0; t < 40 && drop.phase !== 'UNLOAD'; t += 0.02) {
    stepDropRide(drop, 0.02);
    if (drop.y > peak) peak = drop.y;
  }
  rows.push(row('drop period', peak > 20 && Number.isFinite(drop.y) ? 'PASS' : 'FAIL', 'peak ' + peak.toFixed(1) + ' ' + drop.phase));

  const spin = { phase: 'DISPATCH', omega: 0, omegaMax: 0.7, ramp: 0.5, holdTime: 0.3, radius: 6, angle: 0, lean: 0, mode: 'REST' };
  for (let t = 0; t < 20 && spin.phase !== 'UNLOAD'; t += 0.05) stepSpin(spin, 0.05);
  rows.push(row('spin period', spin.phase === 'UNLOAD' && Number.isFinite(spin.angle) ? 'PASS' : 'FAIL', spin.phase));

  resetParkLogic();
  admit();
  const station = { id: 'ride-block-01', kind: 'coaster', ops: createOps('ride-block-01') };
  joinRide('ride-block-01');
  const allowed = attemptBoard(station);
  station.ops.phase = 'COURSE';
  const rejected = attemptBoard(station);
  rows.push(row('board in BOARDING', allowed.ok ? 'PASS' : 'FAIL', allowed.reason));
  rows.push(row('board rejected in COURSE', rejected.ok === false ? 'PASS' : 'FAIL', rejected.reason));
  resetParkLogic();

  const ids = new Set(allPaths().map((pack) => pack.id));
  rows.push(row('known path ids covered', ids.has('ride-block-01') && ids.has('ride-board-family') ? 'PASS' : 'FAIL', [...ids].join(', ')));
  return rows;
}
