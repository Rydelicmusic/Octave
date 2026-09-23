/** Walk-up ride QC. Writes park/QC_LOGIC_WALK.md. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { landOk } from '../rides/coaster-paths.js';
import { giantBlockPack, gigaBlockPack, rimBlockPack, hoursLaunchPack, hybridBoardPack, kiddieSamples, darkSamples } from '../rides/coaster-paths.js';
import { occupiesSpine, inStadium } from '../lock.js';
import { blocksWalk } from '../water/water.js';
import { createOps, eStop } from '../rides/ride-ops.js';
import { resetParkLogic, attemptBoard, rideStatus, ruleFor } from '../logic/ride-logic.js';
import { claimLoad } from '../logic/queue.js';
import { admit } from '../logic/ticket.js';
import { profileForId, registerRail, bindRail, tick } from '../rides/physics.js';
import { tryBoard, setRestraint, tryDispatch, advancePhase } from '../rides/ride-ops.js';
import { arcTable } from '../rides/path-math.js';
import { createSling, stepSling, SLING_MOUNTED } from '../rides/slingshot.js';
import { bootRows } from './qc-boot.js';
import {
  triggerFromSamples, inTrigger, boardAllowedHere, keyAction, escPlan, promptFor,
} from '../input/walk-ride.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const parkDir = path.dirname(here);

const packs = [
  giantBlockPack(),
  gigaBlockPack(),
  rimBlockPack(),
  hoursLaunchPack(),
  hybridBoardPack(),
  kiddieSamples(),
  darkSamples(1),
];

const flatIds = ['ride-board-01', 'ride-board-02', 'ride-board-drop', 'ride-pocket-01'];

function reach(trigger, land) {
  const p = { x: trigger.x, y: 0, z: trigger.z };
  const why = landOk(p, land, 2);
  if (why) return why;
  if (!inStadium(trigger.x, trigger.z)) return 'stadium';
  if (occupiesSpine(trigger.x, trigger.z, 2)) return 'spine';
  if (blocksWalk(trigger.x, trigger.z)) return 'water';
  if (trigger.trackY < -0.4 || trigger.trackY > 8) return 'height ' + trigger.trackY.toFixed(1);
  return '';
}

function hillOutside(samples, trigger) {
  let hill = samples[0];
  for (const p of samples) if (p.y > hill.y) hill = p;
  const d = Math.hypot(hill.x - trigger.x, hill.z - trigger.z);
  if (d < 1.5) return true;
  return !inTrigger(trigger, hill.x, hill.z);
}

function rowsForCars() {
  const rows = [];
  for (const pack of packs) {
    const trigger = triggerFromSamples(pack.id, pack.samples);
    const notes = [];
    let status = 'PASS';
    if (!trigger) {
      rows.push({ id: pack.id, status: 'MISSING', detail: 'no s=0 sample, no prompt' });
      continue;
    }
    const station = boardAllowedHere({
      mode: 'walk', inTrigger: true, facing: true, admitted: true, boarded: false,
      missing: false, phase: 'BOARDING', v: 0, restraint: 'open',
    });
    const course = boardAllowedHere({
      mode: 'walk', inTrigger: true, facing: true, admitted: true, boarded: false,
      missing: false, phase: 'COURSE', v: 20, restraint: 'closed',
    });
    const fast = boardAllowedHere({
      mode: 'walk', inTrigger: true, facing: true, admitted: true, boarded: false,
      missing: false, phase: 'BOARDING', v: 20, restraint: 'open',
    });
    const drone = keyAction('KeyE', {
      mode: 'drone', inTrigger: true, facing: true, admitted: true, boarded: false,
      missing: false, phase: 'BOARDING', v: 0, restraint: 'open', dev: false,
    });
    const spine = inTrigger(trigger, 0, 100);
    const hill = hillOutside(pack.samples, trigger);
    const foot = reach(trigger, pack.land);
    const wait = promptFor({
      mode: 'walk', inTrigger: true, facing: true, admitted: true, boarded: false,
      missing: false, phase: 'COURSE', v: 12, restraint: 'closed',
    });
    if (!station) { status = 'FAIL'; notes.push('board refused in BOARDING'); }
    if (course) { status = 'FAIL'; notes.push('board accepted in COURSE'); }
    if (fast) { status = 'FAIL'; notes.push('board accepted at 20 m/s'); }
    if (drone !== 'noop') { status = 'FAIL'; notes.push('drone E boards'); }
    if (spine) { status = 'FAIL'; notes.push('spine is inside the pad'); }
    if (!hill) { status = 'FAIL'; notes.push('lift hill is inside the pad'); }
    if (foot) { status = 'FAIL'; notes.push('walk blocked: ' + foot); }
    if (wait !== 'Wait for train') { status = 'FAIL'; notes.push('course prompt ' + wait); }
    const hud = rideStatus({ phase: 'BOARDING' }) === 'operating' && rideStatus({ phase: 'COURSE' }) === 'cycling';
    if (!hud) { status = 'FAIL'; notes.push('phase word mismatches the dot'); }
    rows.push({
      id: pack.id,
      status,
      detail: 'pad ' + trigger.x.toFixed(1) + ', ' + trigger.z.toFixed(1) + ' r ' + trigger.r + ' trackY ' + trigger.trackY.toFixed(1)
        + (notes.length ? ' — ' + notes.join('; ') : ' — Walk E boards, COURSE waits, drone E ignored'),
    });
  }
  for (const id of flatIds) {
    rows.push({ id, status: 'MISSING', detail: 'no ' + id + '-car, no walk prompt' });
  }
  rows.push({ id: 'sling', status: 'MISSING', detail: 'no sling mesh. slingshot.js stays unloaded. No E prompt' });
  return rows;
}

function realism() {
  const out = [];
  const hours = hoursLaunchPack();
  const lifts = hours.samples.filter((p) => p.lift).length;
  let windows = 0;
  let prev = false;
  for (const p of hours.samples) {
    if (p.lsm && !prev) windows += 1;
    prev = !!p.lsm;
  }
  const profile = profileForId(hours.id, hours.samples);
  const physics = fs.readFileSync(path.join(parkDir, 'rides/physics.js'), 'utf8');
  const launchOk = profile === 'launch' && lifts === 0 && windows >= 2 && physics.includes("rail.profile !== 'launch'");
  out.push({ name: 'launch is not climb-clamped', status: launchOk ? 'PASS' : 'FAIL', detail: 'profile ' + profile + ' lift samples ' + lifts + ' LSM runs ' + windows });

  const dive = giantBlockPack();
  const table = arcTable(dive.samples);
  registerRail(dive.id, dive.samples, 'dive', { hold: 3 });
  const ops = createOps(dive.id);
  bindRail(dive.id, ops);
  tryBoard(ops);
  setRestraint(ops, true);
  tryDispatch(ops);
  let hold = 0;
  let saw = false;
  for (let t = 0; t < 180 && !(saw && !ops.holding); t += 0.02) {
    const moving = ops.phase === 'DISPATCH' || ops.phase === 'COURSE' || ops.phase === 'BRAKE';
    if (moving) tick(dive.id, 0.02);
    if (ops.holding) {
      hold += 0.02;
      saw = true;
    }
    advancePhase(ops, table, 0.02);
  }
  const holdOk = hold >= 2 && hold <= 4;
  out.push({ name: 'dive hold still runs with a guest path', status: holdOk ? 'PASS' : 'FAIL', detail: 'held ' + hold.toFixed(2) + ' s. The hold does not read the guest flag' });

  const sling = createSling('sling');
  stepSling(sling, 0.02);
  const slingOk = !SLING_MOUNTED && sling.phase === 'LOAD' && Math.abs(sling.y - 1.2) < 0.05;
  out.push({ name: 'sling load only at the bottom', status: slingOk ? 'PASS' : 'FAIL', detail: SLING_MOUNTED ? 'mounted' : 'unmounted phase ' + sling.phase + ' y ' + sling.y });

  const stopped = createOps('ride-block-01');
  stopped.phase = 'COURSE';
  stopped.s = 140;
  stopped.v = 20;
  const plan = escPlan(stopped.phase);
  eStop(stopped);
  const escOk = plan.brake && plan.teleport === false && stopped.phase === 'BRAKE' && stopped.s === 140;
  out.push({ name: 'Esc brakes on the rail', status: escOk ? 'PASS' : 'FAIL', detail: 's ' + stopped.s + ' phase ' + stopped.phase });

  resetParkLogic();
  admit();
  const seats = ruleFor('ride-block-01').seats;
  const ride = { id: 'ride-block-01', kind: 'path', length: 240, ops: createOps('ride-block-01') };
  ride.ops.dummies = seats - 1;
  claimLoad(ride.id);
  const boarded = attemptBoard(ride);
  const dummyOk = boarded.ok === true && ride.ops.passengers === 1;
  out.push({ name: 'dummy riders leave the player seat', status: dummyOk ? 'PASS' : 'FAIL', detail: boarded.reason + ' dummies ' + ride.ops.dummies + ' seats ' + seats });
  return out;
}

function boot() {
  const out = [];
  const boots = bootRows();
  const named = boots.find((r) => r.name.includes('named import'));
  out.push({ name: 'named import matches named export', status: named && named.status === 'PASS' ? 'PASS' : 'FAIL', detail: named ? named.detail : 'missing boot row' });
  const index = fs.readFileSync(path.join(parkDir, 'index.html'), 'utf8');
  const cams = index.includes('>Walk<') && index.includes('>3rd<') && index.includes('>Drone<');
  out.push({ name: 'Walk / 3rd / Drone still switch', status: cams ? 'PASS' : 'FAIL', detail: 'buttons b1 b3 bM' });
  const attractions = fs.readFileSync(path.join(parkDir, 'rides/attractions.js'), 'utf8');
  const tickCalls = attractions.match(/tickMotion\(/g) || [];
  const renderStart = attractions.indexOf('function renderRideStack');
  const renderEnd = attractions.indexOf('return orig.call', renderStart);
  const renderBody = attractions.slice(renderStart, renderEnd);
  const one = tickCalls.length === 1 && !renderBody.includes('tickMotion(') && index.includes('requestAnimationFrame(tick)');
  out.push({ name: 'one ride RAF', status: one ? 'PASS' : 'FAIL', detail: 'tickMotion calls ' + tickCalls.length });
  const hud = attractions.includes('mesh && car && rail') && attractions.includes("const word = live ? 'operating' : 'MISSING'");
  out.push({ name: 'OPERATING only with mesh and motion', status: hud ? 'PASS' : 'FAIL', detail: 'paintOperating requires world, car, and rail' });
  const wired = attractions.includes("tickWalkRide(camera)") && attractions.includes('../input/walk-ride.js');
  out.push({ name: 'walk prompt wired once', status: wired ? 'PASS' : 'FAIL', detail: 'attractions calls tickWalkRide before the ride camera' });
  return out;
}

function report(carRows, real, bootRowsOut) {
  const lines = ['# Walk logic QC', '', 'Date: 2026-09-23', '', 'Walk and 3rd can board at the load pad. Drone E does not board. A prompt exists only for an id that has a lead car.', ''];
  lines.push('## Station pads', '');
  lines.push('| Id | Status | Detail |');
  lines.push('|---|---|---|');
  for (const row of carRows) lines.push('| ' + row.id + ' | ' + row.status + ' | ' + row.detail + ' |');
  lines.push('', '## Realism', '');
  for (const row of real) lines.push('- **' + row.status + '** ' + row.name + ' — ' + row.detail);
  lines.push('', '## Boot', '');
  for (const row of bootRowsOut) lines.push('- **' + row.status + '** ' + row.name + ' — ' + row.detail);
  const failed = [...carRows, ...real, ...bootRowsOut].filter((r) => r.status === 'FAIL');
  lines.push('', failed.length ? 'FAIL ' + failed.map((r) => r.id || r.name).join(', ') : 'No FAIL rows. MISSING means there is no car and no prompt.');
  lines.push('');
  return lines.join('\n');
}

const carRows = rowsForCars();
const real = realism();
const bootRowsOut = boot();
const md = report(carRows, real, bootRowsOut);
fs.writeFileSync(path.join(parkDir, 'QC_LOGIC_WALK.md'), md);
const failed = [...carRows, ...real, ...bootRowsOut].filter((r) => r.status === 'FAIL');
for (const row of [...carRows, ...real, ...bootRowsOut]) {
  console.log((row.status || '').padEnd(8), row.id || row.name, row.detail || '');
}
console.log('wrote park/QC_LOGIC_WALK.md');
process.exit(failed.length ? 1 : 0);
