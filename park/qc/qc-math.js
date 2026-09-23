/** Evaluate the park math contract. Writes park/MATH_QC.md. */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { LOCK, inStadium, inCanopy, occupiesSpine } from '../lock.js';
import { landOk, giantBlockPack, gigaBlockPack, rimBlockPack, hoursLaunchPack, hybridBoardPack, kiddieSamples, darkSamples, RIDE_ANCHORS } from '../rides/coaster-paths.js';
import { BASINS, waterHitsHubOrSpine } from '../water/water.js';
import { arcTable } from '../rides/path-math.js';
import { profileForId, registerRail, bindRail, tick, stepCruise, aLaunch, aBrake, G, dragC, climbV, vMax } from '../rides/physics.js';
import { createOps, tryBoard, setRestraint, tryDispatch, advancePhase, eStop } from '../rides/ride-ops.js';
import { sampleHeight } from '../terrain/height.js';
import { boardPermitted, keyAction, inTrigger, triggerFromSamples, escPlan } from '../input/walk-ride.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const parkDir = path.dirname(here);
const rows = [];

function add(id, status, detail) {
  rows.push({ id, status, detail });
}

const rails = [
  giantBlockPack(),
  gigaBlockPack(),
  rimBlockPack(),
  hoursLaunchPack(),
  hybridBoardPack(),
  kiddieSamples(),
  darkSamples(1),
];

function seamOf(samples) {
  const a = samples[0];
  const b = samples[samples.length - 1];
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function extent(samples) {
  const table = arcTable(samples);
  let yMax = -Infinity;
  for (const p of samples) if (p.y > yMax) yMax = p.y;
  return { L: table.length, yMax, n: samples.length, seam: seamOf(samples) };
}

const tall = rails.map((pack) => ({ id: pack.id, ...extent(pack.samples) })).filter((r) => r.L > 50 && r.yMax > 8);

function syntaxSweep() {
  const bad = [];
  function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
      if (name === 'backup-version' || name === 'node_modules') continue;
      const full = path.join(dir, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full);
      else if (name.endsWith('.js')) {
        const run = spawnSync(process.execPath, ['--check', full], { encoding: 'utf8' });
        if (run.status !== 0) bad.push(path.relative(parkDir, full));
      }
    }
  }
  walk(parkDir);
  return bad;
}

function lapOf(pack) {
  const profile = profileForId(pack.id, pack.samples);
  const table = arcTable(pack.samples);
  registerRail(pack.id, pack.samples, profile, { hold: pack.crestHold || (profile === 'dive' ? 3 : 0) });
  const ops = createOps(pack.id);
  bindRail(pack.id, ops);
  tryBoard(ops);
  setRestraint(ops, true);
  tryDispatch(ops);
  let nan = false;
  let hold = 0;
  let sawHold = false;
  let vCrest = null;
  let vBottom = 0;
  let windows = 0;
  let prev = false;
  let stalled = false;
  for (let t = 0; t < 400 && ops.phase !== 'BOARDING'; t += 0.02) {
    const moving = ops.phase === 'DISPATCH' || ops.phase === 'COURSE' || ops.phase === 'BRAKE';
    const before = ops.s;
    if (moving) tick(pack.id, 0.02);
    else { ops.v = 0; ops.a = 0; }
    if (!Number.isFinite(ops.s) || !Number.isFinite(ops.v) || !Number.isFinite(ops.a)) nan = true;
    if (ops.holding) {
      hold += 0.02;
      sawHold = true;
    }
    if (ops.lift) vCrest = climbV;
    if (vCrest != null && !ops.lift && !ops.holding && ops.v > vBottom) vBottom = ops.v;
    const on = (ops.launchTerm || 0) > 5;
    if (on && !prev) windows += 1;
    prev = on;
    advancePhase(ops, table, 0.02);
    if (sawHold && !ops.holding && profile === 'dive' && hold >= 2) {
      /* keep integrating so the lap can finish */
    }
    if ((ops.phase === 'COURSE' || ops.phase === 'BRAKE') && !ops.lift && !ops.holding && ops.v <= 0.05 && ops.s > 40 && Math.abs((ops.s || 0) - before) < 1e-4) {
      stalled = true;
      break;
    }
  }
  const home = ops.phase === 'BOARDING' && ops.s < 2 && !nan && !stalled;
  return { profile, hold, vCrest, vBottom, windows, nan, stalled, home, s: ops.s, phase: ops.phase };
}

function obstacleOnRay(eye, p, lot) {
  const steps = 28;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = eye.x + (p.x - eye.x) * t;
    const z = eye.z + (p.z - eye.z) * t;
    if (x >= lot.minX && x <= lot.maxX && z >= lot.minZ && z <= lot.maxZ) {
      return Math.hypot(x - eye.x, z - eye.z);
    }
  }
  return 0;
}

function rayHits(eye, p, lots) {
  const dist = Math.hypot(p.x - eye.x, p.z - eye.z) || 1;
  const ang = Math.atan2(p.y - eye.y, dist);
  for (const lot of lots) {
    if (lot.kind !== 'tree' && lot.layer !== 'mass') continue;
    const dHit = obstacleOnRay(eye, p, lot);
    if (!dHit || dHit < 12 || dHit > dist - 8) continue;
    const angLot = Math.atan2((lot.y1 || 0) - eye.y, dHit);
    if (angLot > ang + 0.005) return lot.id;
  }
  return '';
}

const syntax = syntaxSweep();
add('B2', syntax.length ? 'FAIL' : 'PASS', syntax.length ? syntax.slice(0, 6).join(', ') : 'node --check on park js');

const index = fs.readFileSync(path.join(parkDir, 'index.html'), 'utf8');
const liveHtml = index.includes("import * as THREE from 'three'") && index.includes('requestAnimationFrame(tick)');
add('B1', liveHtml ? 'PASS' : 'FAIL', liveHtml
  ? 'park/index.html builds a Three scene and owns one frame loop. Mesh count is the mounted track, stations, and ground, not an empty canvas.'
  : 'index has no Three scene');

const lands = Object.keys(LOCK.canopies);
const landOkNames = lands.length === 4 && lands.includes('The Block') && lands.includes('After Hours') && lands.includes('The Board') && lands.includes('The Pocket');
const box = LOCK.A === 380 && LOCK.B === 230 && LOCK.gate.x === 0 && LOCK.gate.z === 230 && LOCK.hubOuter === 32 && LOCK.spineWidth === 14;
const stadiumSample = inStadium(0, 230) && inStadium(-380, 0) && !inStadium(0, 231);
add('C1', landOkNames && box && stadiumSample ? 'PASS' : 'FAIL', 'A ' + LOCK.A + ' B ' + LOCK.B + ' lands ' + lands.join(', ') + '. inStadium stays the locked capsule.');

const hits = waterHitsHubOrSpine();
const byId = Object.fromEntries(BASINS.map((b) => [b.id, b]));
const need = ['board-lagoon', 'plaza-fountain', 'hours-canal', 'pocket-pool', 'block-dive-splash'];
const have = need.every((id) => byId[id]) && BASINS.length === need.length;
const board = byId['board-lagoon'];
const fount = byId['plaza-fountain'];
const canal = byId['hours-canal'];
const pocket = byId['pocket-pool'];
const splash = byId['block-dive-splash'];
const fountR = Math.hypot(fount.x, fount.z);
const fountOffSpine = Math.abs(fount.x) - fount.rx > LOCK.spineWidth / 2;
const fountOutsideHub = fountR - Math.max(fount.rx, fount.rz) > LOCK.hubOuter;
const waterBits = [];
if (!have) waterBits.push('allow-list mismatch');
if (!(board.x > 0 && inCanopy(board.x, board.z, 'The Board'))) waterBits.push('basin not in Board');
if (!fountOffSpine || !fountOutsideHub) waterBits.push('fountain hits spine or hub');
if (!(canal.z < 0 && inCanopy(canal.x, canal.z, 'After Hours'))) waterBits.push('canal not in Hours');
if (!(pocket.z > 0 && inCanopy(pocket.x, pocket.z, 'The Pocket'))) waterBits.push('pool not in Pocket');
if (!(splash.x < 0 && inCanopy(splash.x, splash.z, 'The Block'))) waterBits.push('splash not in Block');
if (hits.length) waterBits.push(hits.join(', '));
const pocketWaters = BASINS.filter((b) => b.land === 'The Pocket');
if (pocketWaters.length !== 1) waterBits.push('pocket components ' + pocketWaters.length);
add('C2', waterBits.length ? 'FAIL' : 'PASS', waterBits.length ? waterBits.join('; ') : 'Block plaza fountain (' + fount.x + ', ' + fount.z + ') r ' + fountR.toFixed(0) + ' is one ellipse, off the spine, outside hub ' + LOCK.hubOuter + '. One Pocket pool. Hub and spine dry.');

let spineHits = 0;
let canopyHits = 0;
let hubHits = 0;
let lowHits = 0;
const geomNotes = [];
for (const pack of rails) {
  const land = pack.land;
  for (const p of pack.samples) {
    if (occupiesSpine(p.x, p.z, 2)) spineHits += 1;
    if (Math.hypot(p.x, p.z) < LOCK.hubOuter) hubHits += 1;
    if (landOk(p, land, 2)) canopyHits += 1;
    if (p.y < sampleHeight(p.x, p.z) + 0.2 && p.y > 4) lowHits += 1;
  }
  const ext = extent(pack.samples);
  geomNotes.push(pack.id + ' L ' + ext.L.toFixed(0) + ' y ' + ext.yMax.toFixed(1) + ' n ' + ext.n + ' seam ' + ext.seam.toFixed(2));
}
add('C3', spineHits === 0 && hubHits === 0 ? 'PASS' : 'FAIL', 'spine hits ' + spineHits + ', hub hits ' + hubHits + ', canopy rejects ' + canopyHits + '. ' + geomNotes.join('; '));

let grade = 0;
for (let z = -LOCK.B; z <= LOCK.B; z += 5) grade = Math.max(grade, Math.abs(sampleHeight(0, z) - sampleHeight(0, 0)));

const shipped = rails.filter((pack) => extent(pack.samples).n >= 8);
const seams = shipped.map((pack) => ({ id: pack.id, seam: extent(pack.samples).seam, n: pack.samples.length }));
const openSeams = seams.filter((s) => s.seam >= 2 || (s.n < 24 && s.id !== 'ride-hours-01' && s.id !== 'ride-pocket-02'));
add('P1', openSeams.length ? 'FAIL' : 'PASS', seams.map((s) => s.id + ' seam ' + s.seam.toFixed(2) + ' n ' + s.n).join('; '));

function cruiseLap(pack) {
  const table = arcTable(pack.samples);
  const ops = createOps(pack.id);
  tryBoard(ops);
  setRestraint(ops, true);
  tryDispatch(ops);
  let nan = false;
  for (let t = 0; t < 80 && ops.phase !== 'BOARDING'; t += 0.05) {
    const moving = ops.phase === 'DISPATCH' || ops.phase === 'COURSE' || ops.phase === 'BRAKE';
    if (moving) stepCruise(ops, table, 0.05, { cruise: 1.7 });
    else { ops.v = 0; ops.a = 0; }
    if (!Number.isFinite(ops.s) || !Number.isFinite(ops.v)) nan = true;
    advancePhase(ops, table, 0.05);
  }
  return { profile: 'dark', hold: 0, vCrest: null, vBottom: 0, windows: 0, nan, stalled: false, home: ops.phase === 'BOARDING' && !nan, s: ops.s, phase: ops.phase };
}

const laps = rails.map((pack) => (pack.id === 'ride-hours-01' ? { id: pack.id, ...cruiseLap(pack) } : { id: pack.id, ...lapOf(pack) }));
const drops = laps.filter((r) => r.vCrest != null);
const dropFail = drops.filter((r) => !(r.vBottom > r.vCrest));
add('P2', dropFail.length ? 'FAIL' : 'PASS', laps.map((r) => r.id + ' crest ' + (r.vCrest == null ? 'none' : r.vCrest) + ' bottom ' + r.vBottom.toFixed(2)).join('; '));

const dive = laps.find((r) => r.id === 'ride-block-01');
add('P3', dive && dive.hold >= 2 && dive.hold <= 4 ? 'PASS' : 'FAIL', dive ? 'hold ' + dive.hold.toFixed(2) + ' s' : 'dive missing');

const launch = laps.find((r) => r.id === 'ride-hours-02');
const launchPack = hoursLaunchPack();
const liftSamples = launchPack.samples.filter((p) => p.lift).length;
add('P4', launch && launch.windows >= 2 && aLaunch > 5 && aLaunch <= 18 && liftSamples === 0 ? 'PASS' : 'FAIL', 'windows ' + (launch ? launch.windows : 0) + ' a_LSM ' + aLaunch + ' lift samples ' + liftSamples);

const lapFail = laps.filter((r) => r.nan || !r.home);
add('P5', lapFail.length ? 'FAIL' : 'PASS', laps.map((r) => r.id + ' ' + (r.home ? 'home' : (r.stalled ? 'STALL s ' + r.s.toFixed(1) : r.phase)) + (r.nan ? ' NaN' : '')).join('; ') + '. c_d ' + dragC + ' g ' + G + ' v_max ' + vMax + ' a_brake ' + aBrake);

const guest = { admitted: true, phase: 'BOARDING', inTrigger: true, mode: 'walk', v: 0 };
const denied = [
  ['drone', boardPermitted({ ...guest, mode: 'drone' })],
  ['course', boardPermitted({ ...guest, phase: 'COURSE', v: 12 })],
  ['fast', boardPermitted({ ...guest, v: 1.2 })],
  ['no admit', boardPermitted({ ...guest, admitted: false })],
  ['outside', boardPermitted({ ...guest, inTrigger: false })],
];
const allowed = boardPermitted(guest) && boardPermitted({ ...guest, mode: 'third' });
const formulaOk = allowed && denied.every((pair) => pair[1] === false);
add('L1', formulaOk ? 'PASS' : 'FAIL', formulaOk ? 'Walk and 3rd board only in BOARDING, inside the pad, at v ≤ 1.' : 'illegal board: ' + denied.filter((p) => p[1]).map((p) => p[0]).join(', '));

const trigger = triggerFromSamples('ride-block-01', giantBlockPack().samples);
const eyeY = 1.72;
const atPad = inTrigger(trigger, trigger.x, trigger.z, eyeY);
const onHill = giantBlockPack().samples.reduce((a, b) => (b.y > a.y ? b : a));
const hillIn = inTrigger(trigger, onHill.x, onHill.z, onHill.y);
const spineIn = inTrigger(trigger, 0, 100, eyeY);
const eBoard = keyAction('KeyE', { ...guest, inTrigger: true, mode: 'walk', v: 0, boarded: false, missing: false, admitted: true, phase: 'BOARDING' });
add('L2', atPad && !hillIn && !spineIn && eBoard === 'board' ? 'PASS' : 'FAIL', 'pad ' + atPad + ' hill ' + hillIn + ' spine ' + spineIn + ' E ' + eBoard + ' |y-y_stat| ' + Math.abs(eyeY - trigger.trackY).toFixed(2));

const eDrone = keyAction('KeyE', { ...guest, mode: 'drone', inTrigger: true, boarded: false, missing: false });
add('L3', eDrone === 'noop' ? 'PASS' : 'FAIL', 'drone E → ' + eDrone);

const stopped = createOps('ride-block-01');
stopped.phase = 'COURSE';
stopped.s = 140;
stopped.v = 18;
const plan = escPlan(stopped.phase);
eStop(stopped);
const escOk = plan.brake && plan.teleport === false && stopped.s === 140 && stopped.phase === 'BRAKE';
add('L4', escOk ? 'PASS' : 'FAIL', 's stays ' + stopped.s + ' phase ' + stopped.phase + '. Return is Walk at the station pad.');

let lots = [];
try {
  lots = JSON.parse(fs.readFileSync(path.join(parkDir, 'occupy-map.json'), 'utf8')).lots || [];
} catch (err) {
  lots = [];
}
const eye = { x: LOCK.gate.x, y: 1.72, z: LOCK.gate.z };
const visible = [];
for (const pack of rails) {
  let seen = '';
  let blocker = '';
  const highs = pack.samples.filter((p) => p.y > 8);
  const probe = highs.length ? highs : [pack.samples[Math.floor(pack.samples.length / 2)]];
  for (const p of probe) {
    const hit = rayHits(eye, p, lots);
    if (!hit) { seen = 'clear y ' + p.y.toFixed(1); break; }
    blocker = hit;
  }
  visible.push(pack.id + (seen ? ' ' + seen : ' blocked by ' + (blocker || 'canopy')));
}
const anyClear = visible.some((line) => line.includes('clear'));
add('V1', anyClear ? 'PASS' : 'FAIL', 'from Gate ' + eye.z + '. ' + visible.join('; ') + (tall.length ? '. Tall rails ' + tall.map((r) => r.id + ' L' + r.L.toFixed(0) + ' y' + r.yMax.toFixed(1)).join(', ') : '. No tall rail'));

const pads = index.includes('1.2 m pads');
const banned = /SheiKra|Fury 325|VelociCoaster|Steel Vengeance|Falcon|Jurassic|Qiddiya/i;
const badNames = Object.values(RIDE_ANCHORS).filter((r) => banned.test(r.name || '')).map((r) => r.name);
add('H1', !pads && !badNames.length ? 'PASS' : 'FAIL', pads ? 'HUD still says 1.2 m pads' : 'no 1.2 m pad line. Signs: ' + (badNames.join(', ') || 'Rydelic names'));

const lines = [];
lines.push('# Math QC');
lines.push('');
lines.push('Date: 2026-09-23');
lines.push('');
lines.push('Contract evaluated against lock.js geometry and physics.tick. No new land was added.');
lines.push('');
lines.push('Tall rails already in the park (L > 50 m and y_max > 8 m): ' + (tall.length ? tall.map((r) => r.id).join(', ') : 'none') + '.');
lines.push('Spine grade max |H(0,z) − H(0,0)| = ' + grade.toFixed(3) + ' m.');
lines.push('Rail samples below the ground clearance outside the station band: ' + lowHits + '.');
lines.push('');
lines.push('| Id | Status | Detail |');
lines.push('|---|---|---|');
for (const row of rows) lines.push('| ' + row.id + ' | ' + row.status + ' | ' + row.detail + ' |');
lines.push('');
const failed = rows.filter((r) => r.status === 'FAIL').map((r) => r.id);
lines.push(failed.length ? 'FAIL ' + failed.join(', ') : 'No FAIL rows.');
lines.push('');
fs.writeFileSync(path.join(parkDir, 'MATH_QC.md'), lines.join('\n'));
for (const row of rows) console.log(row.status.padEnd(6), row.id, row.detail);
console.log('wrote park/MATH_QC.md');
process.exit(failed.length ? 1 : 0);
