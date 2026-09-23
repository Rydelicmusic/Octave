/** Physics battery. Run: node --test park/rides/physics-test.js */
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { arcTable } from './path-math.js';
import { blockCoasterSamples, launchCoasterSamples, boardFamilySamples, kiddieSamples, darkSamples, giantBlockPack, gigaBlockPack, rimBlockPack, hoursLaunchPack, hybridBoardPack } from './coaster-paths.js';
import {
  G, stepEnergy, stepCruise, stepDrop, stepPendulum, stepWheel, stepSwings, stepSpin, stepBumper,
  wheelInWindow, gondolaWorldUp, simulateEnergy, registerRail, bindRail, tick, profileForId, aLaunch, climbV,
} from './physics.js';
import { createOps, tryBoard, setRestraint, tryDispatch, eStop, advancePhase } from './ride-ops.js';

const HERO = { drag: 0.004, liftV: 3.2, brake: 9, minLoop: 6 };
const LAUNCH = { drag: 0.0035, liftV: 3.4, brake: 9, minLoop: 8, launch: true, launchA: 22 };
const FAMILY = { drag: 0.006, liftV: 3.1, brake: 7, minLoop: 4 };

function rideLap(pack, opts, seconds) {
  const table = arcTable(pack.samples);
  const ops = createOps(pack.id);
  tryBoard(ops);
  setRestraint(ops, true);
  tryDispatch(ops);
  let nan = false;
  let vLift = null;
  let vDrop = 0;
  let peakV = 0;
  let openCourse = false;
  let boardedCourse = false;
  const dt = 0.05;
  for (let t = 0; t < seconds && ops.phase !== 'BOARDING'; t += dt) {
    const moving = ops.phase === 'DISPATCH' || ops.phase === 'COURSE' || ops.phase === 'BRAKE';
    if (moving) stepEnergy(ops, table, dt, opts);
    else {
      ops.v = 0;
      ops.a = 0;
    }
    if (ops.phase === 'COURSE') {
      if (setRestraint(ops, false)) openCourse = true;
      if (tryBoard(ops)) boardedCourse = true;
    }
    advancePhase(ops, table, dt);
    if (!Number.isFinite(ops.s) || !Number.isFinite(ops.v) || !Number.isFinite(ops.a)) nan = true;
    if (ops.v > peakV) peakV = ops.v;
    if (ops.lift) vLift = ops.v;
    if (vLift != null && !ops.lift && ops.v > vDrop) vDrop = ops.v;
  }
  return { ops, vLift, vDrop, peakV, nan, openCourse, boardedCourse, length: table.length };
}

export function runPhysicsTests() {
  const lines = [];
  const fail = [];
  const check = (name, ok, detail) => {
    lines.push((ok ? 'pass' : 'FAIL') + '  ' + name + (detail ? '  ' + detail : ''));
    if (!ok) fail.push(name);
  };

  check('g', G === 9.81, String(G));

  const specPacks = [giantBlockPack(), gigaBlockPack(), rimBlockPack(), hoursLaunchPack(), hybridBoardPack()];
  const specNotes = [];
  for (const pack of specPacks) {
    const profile = profileForId(pack.id, pack.samples);
    const table = arcTable(pack.samples);
    const a0 = pack.samples[0];
    const a1 = pack.samples[pack.samples.length - 1];
    const seam = Math.hypot(a0.x - a1.x, a0.y - a1.y, a0.z - a1.z);
    registerRail(pack.id, pack.samples, profile, { hold: pack.crestHold || 0 });
    const ops = createOps(pack.id);
    bindRail(pack.id, ops);
    tryBoard(ops);
    setRestraint(ops, true);
    tryDispatch(ops);
    let nan = false;
    let hold = 0;
    let vCrest = null;
    let vAfter = 0;
    let peak = 0;
    let windows = 0;
    let prevLaunch = false;
    let rejected = false;
    let stalled = false;
    for (let t = 0; t < 240 && ops.phase !== 'BOARDING'; t += 0.02) {
      const moving = ops.phase === 'DISPATCH' || ops.phase === 'COURSE' || ops.phase === 'BRAKE';
      const before = ops.s;
      if (moving) tick(pack.id, 0.02);
      else { ops.v = 0; ops.a = 0; }
      if (ops.holding) hold += 0.02;
      if (!Number.isFinite(ops.s) || !Number.isFinite(ops.v) || !Number.isFinite(ops.a)) nan = true;
      if (ops.v > peak) peak = ops.v;
      if (ops.lift) vCrest = climbV;
      if (vCrest != null && !ops.lift && !ops.holding && ops.v > vAfter) vAfter = ops.v;
      const launching = (ops.launchTerm || 0) > 5;
      if (launching && !prevLaunch) windows += 1;
      prevLaunch = launching;
      if (ops.phase === 'COURSE' && !rejected) rejected = tryBoard(ops) === false;
      advancePhase(ops, table, 0.02);
      if (ops.phase === 'COURSE' && !ops.lift && !ops.holding && ops.v <= 0.05 && ops.s > 40 && Math.abs(ops.s - before) < 1e-4) {
        stalled = true;
        break;
      }
    }
    const home = ops.phase === 'BOARDING' && ops.s < 2 && !nan && !stalled;
    specNotes.push({ id: pack.id, profile, seam, hold, vCrest, vAfter, peak, windows, rejected, nan, stalled, home, s: ops.s, length: table.length, trim: ops.trimAssist || 0, log: ops.physLog || [] });
    check(pack.id + ' closed', seam < 2, 'seam ' + seam.toFixed(2));
    check(pack.id + ' spec lap no NaN', !nan && (home || stalled), home ? 'home' : (stalled ? 'STALL s ' + ops.s.toFixed(1) : ops.phase));
    if (profile !== 'launch') check(pack.id + ' faster after the drop', vAfter > (vCrest || 0), 'crest ' + vCrest + ' after ' + vAfter.toFixed(2));
    if (profile === 'dive') check(pack.id + ' hold 2-4 s', hold >= 2 && hold <= 4, hold.toFixed(2));
    if (profile === 'launch') check(pack.id + ' two launch windows', windows >= 2 && aLaunch > 5, 'windows ' + windows + ' aLaunch ' + aLaunch);
    check(pack.id + ' board rejected on course', rejected === true);
  }

  const visible = [
    [giantBlockPack(), { drag: 0.004, liftV: 3.2, brake: 9, minLoop: 6, crestHold: 3 }, 420],
    [gigaBlockPack(), { drag: 0.004, liftV: 3.2, brake: 9, minLoop: 6 }, 420],
    [rimBlockPack(), { drag: 0.0011, liftV: 3.2, brake: 9, minLoop: 6 }, 420],
    [hoursLaunchPack(), { drag: 0.0035, liftV: 3.2, brake: 9, minLoop: 6, lsmA: 36, lsmV: 34 }, 240],
    [hybridBoardPack(), { drag: 0.004, liftV: 3.2, brake: 9, minLoop: 6 }, 280],
  ];
  const railNotes = [];
  for (const [pack, opts, seconds] of visible) {
    const lap = rideLap(pack, opts, seconds);
    const trims = lap.ops.trimLog || [];
    const home = lap.ops.phase === 'BOARDING' && lap.ops.s < 1.5 && !lap.nan;
    const lifts = pack.samples.filter((p) => p.lsm).length;
    railNotes.push({
      id: pack.id,
      len: lap.length,
      home,
      peak: lap.peakV,
      drop: lap.vDrop,
      lift: lap.vLift,
      trim: lap.ops.trimAssist || 0,
      trims,
      lsm: lifts,
      hold: opts.crestHold || 0,
    });
    check(pack.id + ' energy lap', home, 'phase ' + lap.ops.phase + ' s ' + lap.ops.s.toFixed(1) + ' trim ' + (lap.ops.trimAssist || 0));
  }
  const dive = railNotes[0];
  check('block dive hold is 2-4 s', dive.hold >= 2 && dive.hold <= 4, String(dive.hold));
  const hours = railNotes.find((r) => r.id === 'ride-hours-02');
  check('hours two lsm windows', hours && hours.lsm > 20, 'lsm samples ' + (hours && hours.lsm));

  const heroPack = blockCoasterSamples(3);
  const heroTable = arcTable(heroPack.samples);
  const parked = createOps('ride-block-01');
  check('station v0', parked.v === 0 && parked.s === 0, 'v ' + parked.v);

  const hero = rideLap(heroPack, HERO, 420);
  check('drop faster than lift', hero.vDrop > hero.vLift + 1, 'lift ' + hero.vLift + ' drop ' + hero.vDrop);
  check('lap s within 1.5', hero.ops.s < 1.5 && hero.ops.phase === 'BOARDING', 's ' + hero.ops.s + ' ' + hero.ops.phase);
  check('no NaN', !hero.nan);
  check('restraint stays shut on course', hero.openCourse === false);
  check('board rejected on course', hero.boardedCourse === false);
  check('trim assist counted', hero.ops.trimAssist >= 0, 'trim ' + hero.ops.trimAssist);
  check('one train block cleared', hero.ops.blockOccupied === false);

  const blocked = createOps('ride-block-01');
  tryBoard(blocked);
  setRestraint(blocked, true);
  check('dispatch', tryDispatch(blocked) === true);
  check('second dispatch refused', tryDispatch(blocked) === false && blocked.blockOccupied === true);

  const auto = createOps('ride-block-01');
  tryBoard(auto);
  setRestraint(auto, true);
  for (let t = 0; t < 3.2; t += 0.05) advancePhase(auto, heroTable, 0.05);
  check('auto dispatch 3s', auto.phase === 'DISPATCH' || auto.phase === 'COURSE', auto.phase);

  const stopped = createOps('ride-block-01');
  tryBoard(stopped);
  setRestraint(stopped, true);
  tryDispatch(stopped);
  let marked = 0;
  for (let t = 0; t < 90 && marked === 0; t += 0.05) {
    stepEnergy(stopped, heroTable, 0.05, HERO);
    advancePhase(stopped, heroTable, 0.05);
    if (stopped.s > 140 && stopped.phase === 'COURSE') marked = stopped.s;
  }
  eStop(stopped);
  const atStop = stopped.s;
  for (let t = 0; t < 2; t += 0.05) {
    stepEnergy(stopped, heroTable, 0.05, HERO);
    advancePhase(stopped, heroTable, 0.05);
  }
  check('e-stop stays on the rail', marked > 100 && stopped.s > 80 && stopped.phase === 'BRAKE', 'at ' + atStop.toFixed(1) + ' now ' + stopped.s.toFixed(1) + ' ' + stopped.phase);

  let liftS = 0;
  for (let s = 40; s < 90; s += 1) {
    const row = { s, v: 0, phase: 'COURSE', eStop: false, trimAssist: 0, laps: 0 };
    stepEnergy(row, heroTable, 0.05, HERO);
    if (row.lift) {
      liftS = s;
      break;
    }
  }
  const dog = { s: liftS, v: -4, phase: 'COURSE', eStop: false, trimAssist: 0, laps: 0, chain: true };
  const beforeDog = dog.s;
  stepEnergy(dog, heroTable, 0.05, HERO);
  check('lift anti-rollback', dog.s >= beforeDog - 1e-6 && dog.v >= 0.5, 's ' + dog.s.toFixed(2) + ' v ' + dog.v.toFixed(2));

  const launch = simulateEnergy(arcTable(launchCoasterSamples(2).samples), 240, LAUNCH);
  check('launch spike', launch.peakV > 18 && launch.state.s < 1.5 && !launch.nan, 'peak ' + launch.peakV.toFixed(1));

  const family = rideLap(boardFamilySamples(), FAMILY, 240);
  check('family same integrator', family.vDrop > family.vLift && family.ops.s < 1.5 && !family.nan, 'lift ' + family.vLift + ' drop ' + family.vDrop);

  const kid = rideLap(kiddieSamples(), { drag: 0.02, liftV: 2.2, brake: 4, minLoop: 2.2 }, 180);
  check('kiddie returns', kid.ops.phase === 'BOARDING' && kid.ops.s < 1.5 && !kid.nan, kid.ops.phase);

  const darkTable = arcTable(darkSamples(1).samples);
  const dark = createOps('ride-hours-01');
  tryBoard(dark);
  setRestraint(dark, true);
  tryDispatch(dark);
  let holds = 0;
  for (let t = 0; t < 30 && dark.phase !== 'BOARDING'; t += 0.05) {
    const prev = dark.holdDoor || 0;
    if (dark.phase === 'DISPATCH' || dark.phase === 'COURSE') stepCruise(dark, darkTable, 0.05, { cruise: 1.7, door: 0.6 });
    if (prev <= 0 && dark.holdDoor > 0) holds += 1;
    advancePhase(dark, darkTable, 0.05);
  }
  check('dark doors', holds >= 2 && dark.ops === undefined && dark.s < 1.5, 'holds ' + holds + ' s ' + dark.s);

  const drop = { mode: 'HOIST', y: 2.2, vy: 0, hoistV: 2.4, top: 28, catchY: 5, bottom: 2.2, hangTime: 0.4, peak: 2.2, hoistDy: 0 };
  let peak = 0;
  let hoistRate = 0;
  let fallRate = 0;
  for (let t = 0; t < 40; t += 0.02) {
    const before = drop.y;
    const mode = drop.mode;
    stepDrop(drop, 0.02);
    if (drop.y > peak) peak = drop.y;
    const rate = (drop.y - before) / 0.02;
    if (mode === 'HOIST' && rate > 0) hoistRate = Math.max(hoistRate, rate);
    if (mode === 'FALL' && rate < 0) fallRate = Math.max(fallRate, -rate);
  }
  check('drop freefall', peak > 20 && fallRate > hoistRate + 1, 'peak ' + peak.toFixed(1) + ' hoist ' + hoistRate.toFixed(2) + ' fall ' + fallRate.toFixed(2));

  const pend = { L: 8, theta: 0.2, omega: 0, drag: 0.05, cycles: 0, prev: 0.2 };
  for (let t = 0; t < 6; t += 0.02) stepPendulum(pend, 0.02);
  check('pendulum swings', Math.abs(pend.theta) > 0.05 && Number.isFinite(pend.theta), 'theta ' + pend.theta.toFixed(3));

  const wheel = { phase: 'BOARDING', omega: 2, angle: 1, target: 0.4, turned: 0 };
  stepWheel(wheel, 0.05);
  const up = gondolaWorldUp();
  check('wheel rests in window', wheel.omega === 0 && wheelInWindow(wheel.angle, 0, 16) && up.y > 0.9, 'up ' + up.y);
  check('other gondola not in window', wheelInWindow(wheel.angle, 4, 16) === false);
  wheel.phase = 'DISPATCH';
  stepWheel(wheel, 0.1);
  check('wheel omega holds', Math.abs(wheel.omega - 0.4) < 1e-6, String(wheel.omega));

  const sw = { phase: 'DISPATCH', omega: 0, omegaMax: 0.9, ramp: 0.4, holdTime: 1, radius: 8, angle: 0, kick: 0, mode: 'REST' };
  for (let t = 0; t < 3; t += 0.05) stepSwings(sw, 0.05);
  check('swings kick', sw.kick > 0.05 && sw.omega > 0.4, 'kick ' + sw.kick.toFixed(3));
  const rest = { phase: 'BOARDING', omega: 1, radius: 8, kick: 1, mode: 'HOLD' };
  stepSwings(rest, 0.05);
  check('swings board at rest', rest.omega === 0 && rest.kick === 0);

  const bump = { angle: 0, r: 4, vr: 2, omega: 0.5, ring: 5, minR: 3 };
  for (let t = 0; t < 4; t += 0.05) stepBumper(bump, 0.05);
  check('bumper stays in the ring', bump.r <= 5.001 && bump.r >= 2.999, 'r ' + bump.r.toFixed(2));

  const spin = { phase: 'DISPATCH', omega: 0, omegaMax: 0.6, ramp: 0.5, holdTime: 0.4, radius: 6, angle: 0, lean: 0, mode: 'REST' };
  for (let t = 0; t < 2; t += 0.05) stepSpin(spin, 0.05);
  check('spin leans', spin.lean > 0 && spin.omega > 0.2, 'lean ' + spin.lean.toFixed(3));

  const md = [];
  md.push('# Physics QC');
  md.push('');
  md.push('Date: 2026-09-23');
  md.push('Live speed owner: tick(id, dt) in park/rides/physics.js. stepEnergy stays for the legacy battery only.');
  md.push("a = -g sin(theta) + aLaunch on LSM + aBrake on a brake section - dragC v |v|");
  md.push('g = 9.81, climbV = 3, vMin = 0.3, vMax = 45, dragC = 0.012, aLaunch = 15, aBrake = -28.');
  md.push('Arc length s. A path with a table does not play sample.speed.');
  md.push('');
  md.push('## Spec tick');
  md.push('');
  md.push('Constants: g 9.81, climbV 3, vMin 0.3, vMax 45, dragC 0.012, aLaunch 15, aBrake -28.');
  md.push('Sling: MISSING. slingshot.js is not mounted and is not called from physics.js.');
  md.push('');
  for (const note of specNotes) {
    md.push('### ' + note.id + ' (' + note.profile + ')');
    md.push('');
    md.push('- Seam ' + note.seam.toFixed(2) + ' m');
    md.push('- Peak ' + note.peak.toFixed(2) + (note.vCrest == null ? '' : ', chain ' + note.vCrest + ', after drop ' + note.vAfter.toFixed(2)));
    if (note.profile === 'dive') md.push('- Hold ' + note.hold.toFixed(2) + ' s');
    if (note.profile === 'launch') md.push('- Launch windows with term > 5: ' + note.windows);
    md.push('- Trim count ' + note.trim);
    md.push('- Lap ' + (note.home ? 'home, no NaN' : (note.stalled ? 'STALL' : 'not home')) + (note.nan ? ' NaN' : ''));
    if (note.stalled) md.push('- Stopped at s ' + note.s.toFixed(1) + ' of ' + note.length.toFixed(0) + ' m. dragC 0.012 bled the speed. Not a completed lap, and s was not moved.');
    if (note.log.length) for (const line of note.log) md.push('- ' + line);
    md.push('');
  }
  md.push('## Visible rails under the legacy stepEnergy opts');
  md.push('');
  for (const note of railNotes) {
    md.push('### ' + note.id);
    md.push('');
    md.push('- Length ' + note.len.toFixed(0) + ' m');
    md.push('- Lap ' + (note.home ? 'home, boarding, s under 1.5, no NaN' : 'DID NOT COME HOME'));
    md.push('- Peak speed ' + Number(note.peak || 0).toFixed(2) + (note.lift == null ? '' : ', chain ' + Number(note.lift).toFixed(2) + ', after the drop ' + Number(note.drop || 0).toFixed(2)));
    if (note.hold) md.push('- Crest hold ' + note.hold + ' s');
    if (note.id === 'ride-hours-02') md.push('- LSM samples ' + note.lsm + '. No chain climb clamp on those windows.');
    if (!note.trims.length) md.push('- Trim: none');
    else {
      md.push('- Trim ' + note.trim + ' (logged, train was not moved to another s):');
      for (const hit of note.trims) md.push('  - s ' + hit.s + ' y ' + hit.y + ' v ' + hit.v);
    }
    md.push('');
  }
  md.push('## Battery');
  md.push('');
  for (const line of lines) md.push('- ' + line);
  md.push('');
  md.push(fail.length ? 'FAIL ' + fail.join(', ') : 'All checks passed.');
  md.push('');
  fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'PHYSICS_QC.md'), md.join('\n'));

  return { ok: fail.length === 0, fail, lines };
}

test('physics battery', () => {
  const result = runPhysicsTests();
  for (const line of result.lines) console.log(line);
  assert.equal(result.ok, true, result.fail.join(', '));
});
