/** Usable ride physics. Gravity, lift, drag, brakes. Not a sine wave. */
import { pointInto, arcTable } from './path-math.js';

export const G = 9.81;
export const climbV = 3.0;
export const vMin = 0.3;
export const vMax = 45;
export const dragC = 0.012;
export const vLoopMin = 8;
export const aLaunch = 15;
export const aBrake = -28;

const scratchA = { x: 0, y: 0, z: 0 };
const scratchB = { x: 0, y: 0, z: 0 };

export function samplePath(table, s, out) {
  return pointInto(table, s, out || { x: 0, y: 0, z: 0 });
}

/** sin(theta) along the track. Uphill is positive, so gravity slows the train. */
export function slopeSin(table, s) {
  const a = samplePath(table, s, scratchA);
  const b = samplePath(table, s + 0.5, scratchB);
  const dy = b.y - a.y;
  const ds = Math.max(0.05, Math.hypot(b.x - a.x, dy, b.z - a.z));
  return { sample: a, sinT: Math.max(-1, Math.min(1, dy / ds)) };
}

export function curvatureBank(sample) {
  return sample.bank || 0;
}

/**
 * One energy step. Mutates state.s, state.v, state.a.
 * The chain keeps pulling until the rail actually falls, so the crest
 * does not stall a meter short of the drop. Trim assist adds force.
 * It does not move s except by v * dt.
 */
export function stepEnergy(state, table, dt, opts = {}) {
  const length = table.length || 1;
  const drag = opts.drag == null ? 0.004 : opts.drag;
  const liftV = opts.liftV == null ? 3.2 : opts.liftV;
  const brakeA = opts.brake == null ? 8 : opts.brake;
  const minLoop = opts.minLoop == null ? 7 : opts.minLoop;
  const probe = slopeSin(table, state.s);
  const sample = probe.sample;
  const sinT = probe.sinT;
  if (sample.lift) state.chain = true;
  if (sinT < -0.04) state.chain = false;
  const rollingNow = state.phase === 'DISPATCH' || state.phase === 'COURSE';
  const holdFor = opts.crestHold || 0;
  if (holdFor && sample.crestHold && rollingNow && !state.eStop) {
    const lap = state.laps || 0;
    if (state.crestLap !== lap) {
      state.crestT = (state.crestT || 0) + dt;
      state.v = 0;
      state.a = 0;
      state.chain = false;
      state.lift = false;
      state.brakeZone = false;
      state.holding = true;
      state.y = sample.y;
      state.bank = sample.bank || 0;
      if (state.crestT < holdFor) return state;
      state.crestLap = lap;
      state.crestT = 0;
      state.holding = false;
      state.v = 0.35;
    }
  } else if (!sample.crestHold) {
    state.holding = false;
  }
  const late = state.s > length * 0.5;
  const tail = Math.min(42, length * 0.16);
  const finalApproach = state.s > length - tail && state.s > length * 0.72;
  const stationWindow = Math.min(22, length * 0.1);
  const onLsm = !!(sample.lsm && rollingNow && !state.eStop);
  const lift = !onLsm && !!(sample.lift || (state.chain && sinT > 0.02)) && !state.eStop && state.phase !== 'BRAKE';
  const braking = (!!sample.brake && late) || finalApproach || state.phase === 'BRAKE' || !!state.eStop;
  const brakeZone = braking && state.s > stationWindow;
  const rolling = state.phase === 'DISPATCH' || state.phase === 'COURSE';
  const c = drag;
  let aLift = 0;
  let aLaunch = 0;
  let aBrake = 0;
  if (lift) aLift = (liftV - state.v) * 8;
  const launchEnd = opts.launchUntil == null ? length * 0.28 : opts.launchUntil;
  const launched = opts.launch && !state.eStop && !onLsm && (state.laps || 0) === 0 && state.s < launchEnd;
  if (launched && rolling) aLaunch += opts.launchA == null ? 22 : opts.launchA;
  if (onLsm && state.v < (opts.lsmV || 32)) aLaunch += opts.lsmA || 28;
  if (!brakeZone && !lift && !onLsm && state.v < 1.8 && state.s < length * 0.14 && rolling) aLaunch += 6;
  let trim = false;
  const uphillSlow = !lift && !onLsm && !brakeZone && sinT > 0.05 && state.v < Math.min(minLoop, 6) && state.s > length * 0.2 && rolling;
  if ((sample.inversion && state.v < minLoop && rolling && !onLsm) || uphillSlow) {
    aLaunch += (Math.min(minLoop, 6) - state.v) * 4;
    trim = true;
    if (!state.trimOn) {
      state.trimAssist = (state.trimAssist || 0) + 1;
      state.trimOn = true;
      if (!state.trimLog) state.trimLog = [];
      state.trimLog.push({
        s: Math.round(state.s * 10) / 10,
        y: Math.round(sample.y * 10) / 10,
        v: Math.round(state.v * 100) / 100,
      });
    }
  } else {
    state.trimOn = false;
  }
  if (sample.blockBrake && rolling && !state.eStop && state.v > 6) aBrake -= 16;
  if (brakeZone) {
    const creep = state.eStop ? 1.8 : 0.32;
    if (state.v > creep + 0.4) aBrake -= Math.sign(state.v || 1) * (state.eStop ? brakeA * 1.3 : brakeA);
    else if (state.eStop) aBrake += (creep - state.v) * 8 + G * Math.max(0, sinT);
  }
  const accel = -G * sinT + aLift + aLaunch + aBrake - c * state.v * Math.abs(state.v);
  let v = state.v + accel * dt;
  if (!Number.isFinite(v)) v = 0;
  if (lift && !onLsm && v < 0.5) v = 0.5;
  if (brakeZone) {
    const creep = state.eStop ? 1.8 : 0.32;
    if (v < creep) v = creep;
  }
  if (v < 0) v = 0;
  if (v > 38) v = 38;
  const before = state.s;
  let s = before + v * dt;
  if (lift && s < before) s = before;
  let wrapped = false;
  if (s >= length) {
    s -= length;
    state.laps = (state.laps || 0) + 1;
    wrapped = true;
  }
  if (s < 0) s = 0;
  const tailClose = before > length - 1.5 || (s < 1.5 && before > length - 4);
  if (brakeZone && before > length * 0.5 && (wrapped || tailClose)) {
    if (!wrapped) state.laps = (state.laps || 0) + 1;
    s = 0;
    v = 0;
    state.arrived = true;
  }
  if (state.eStop && sample.y < 5 && before < 16) {
    s = 0;
    v = 0;
    state.arrived = true;
  }
  state.v = v;
  state.s = s;
  state.a = accel;
  state.trim = trim;
  state.lift = lift;
  state.brakeZone = brakeZone;
  state.bank = sample.bank || 0;
  state.y = sample.y;
  return state;
}

export function stepCruise(state, table, dt, opts = {}) {
  const length = table.length || 1;
  const cruise = opts.cruise == null ? 1.7 : opts.cruise;
  const moving = state.phase === 'DISPATCH' || state.phase === 'COURSE' || state.phase === 'BRAKE';
  if (!moving || state.eStop) {
    state.v = 0;
    state.a = 0;
    if (state.eStop) state.arrived = true;
    return state;
  }
  if (state.holdDoor > 0) {
    state.holdDoor -= dt;
    state.v = 0;
    state.a = 0;
    state.showHold = true;
    return state;
  }
  state.showHold = false;
  const u = state.s / length;
  if (!state.didDoor1 && u > 0.33) {
    state.didDoor1 = true;
    state.holdDoor = opts.door || 0.6;
    state.v = 0;
    state.showBeat = 1;
    return state;
  }
  if (!state.didDoor2 && u > 0.66) {
    state.didDoor2 = true;
    state.holdDoor = opts.door || 0.6;
    state.v = 0;
    state.showBeat = 2;
    return state;
  }
  state.v = cruise;
  state.a = 0;
  state.s += cruise * dt;
  if (state.s >= length) {
    state.s = 0;
    state.v = 0;
    state.laps = (state.laps || 0) + 1;
    state.didDoor1 = false;
    state.didDoor2 = false;
    state.arrived = true;
  }
  return state;
}

export function stepDrop(drop, dt) {
  const g = G;
  if (drop.mode === 'HOIST') {
    const before = drop.y;
    drop.y += drop.hoistV * dt;
    drop.vy = drop.hoistV;
    if (drop.y >= drop.top) {
      drop.y = drop.top;
      drop.mode = 'HANG';
      drop.hang = drop.hangTime || 1.1;
      drop.peak = drop.y;
    }
    drop.hoistDy = (drop.hoistDy || 0) + Math.max(0, drop.y - before);
    return drop;
  }
  if (drop.mode === 'HANG') {
    drop.vy = 0;
    drop.hang -= dt;
    if (drop.hang <= 0) {
      drop.mode = 'FALL';
      drop.vy = 0;
    }
    return drop;
  }
  if (drop.mode === 'FALL') {
    drop.vy -= g * dt;
    drop.y += drop.vy * dt;
    if (drop.y > (drop.peak || 0)) drop.peak = drop.y;
    if (drop.y <= drop.catchY) {
      drop.y = drop.catchY;
      drop.mode = 'CATCH';
    }
    return drop;
  }
  if (drop.mode === 'CATCH') {
    const mag = 28;
    if (drop.vy < 0) drop.vy = Math.min(0, drop.vy + mag * dt);
    drop.y += drop.vy * dt;
    if (drop.y < drop.bottom) drop.y = drop.bottom;
    if (drop.vy >= -0.4) {
      drop.vy = 0;
      drop.mode = 'RESET';
    }
    return drop;
  }
  drop.vy = 0;
  if (drop.y > drop.bottom) drop.y = Math.max(drop.bottom, drop.y - drop.hoistV * dt);
  else drop.mode = 'HOIST';
  return drop;
}

export function stepDropRide(drop, dt) {
  if (drop.eStop && drop.y > drop.bottom + 0.4 && drop.mode !== 'RESET') {
    drop.mode = 'CATCH';
    drop.phase = 'BRAKE';
  }
  if (drop.phase === 'BOARDING' || drop.phase === 'IDLE') {
    drop.mode = 'HOIST';
    drop.y = drop.bottom;
    drop.vy = 0;
    return drop;
  }
  if (drop.phase === 'DISPATCH') {
    drop.phase = 'COURSE';
    drop.mode = 'HOIST';
    drop.peak = drop.bottom;
  }
  stepDrop(drop, dt);
  if (drop.mode === 'RESET') drop.phase = 'BRAKE';
  if (drop.mode === 'HOIST' && drop.phase === 'BRAKE' && drop.y <= drop.bottom + 0.05) {
    drop.y = drop.bottom;
    drop.phase = 'UNLOAD';
  }
  return drop;
}

export function stepPendulum(p, dt) {
  const accel = -(G / p.L) * Math.sin(p.theta) - (p.drag || 0.08) * p.omega;
  const push = p.cycles < 2 && Math.abs(p.theta) < 0.4 ? 1.4 : 0;
  p.omega += (accel + push) * dt;
  p.theta += p.omega * dt;
  if (p.theta > 0 && p.prev < 0) p.cycles += 1;
  p.prev = p.theta;
  return p;
}

export function stepWheel(w, dt) {
  if (w.phase === 'BOARDING' || w.phase === 'IDLE' || w.phase === 'UNLOAD') {
    w.omega = 0;
    w.angle = -Math.PI / 2;
    return w;
  }
  if (w.phase === 'DISPATCH') w.phase = 'COURSE';
  if (w.phase === 'COURSE') {
    w.omega = w.target;
    w.angle += w.omega * dt;
    w.turned = (w.turned || 0) + Math.abs(w.omega) * dt;
    if (w.turned >= Math.PI * 2) w.phase = 'BRAKE';
  }
  if (w.phase === 'BRAKE') {
    w.omega = Math.max(0, w.omega - dt * 0.45);
    w.angle += w.omega * dt;
    if (w.omega <= 0.02) {
      w.omega = 0;
      w.angle = -Math.PI / 2;
      w.turned = 0;
      w.phase = 'UNLOAD';
    }
  }
  return w;
}

export function wheelInWindow(angle, index, count) {
  const n = count || 1;
  const a = angle + (index / n) * Math.PI * 2;
  const bottom = -Math.PI / 2;
  const d = Math.atan2(Math.sin(a - bottom), Math.cos(a - bottom));
  return Math.abs(d) <= (20 * Math.PI) / 180;
}

/** Gondolas are not parented to the rim. Local rotation stays 0, so world up stays +Y. */
export function gondolaWorldUp() {
  return { x: 0, y: 1, z: 0 };
}

export function stepSwings(sw, dt) {
  if (sw.phase === 'BOARDING' || sw.phase === 'IDLE' || sw.phase === 'UNLOAD') {
    sw.omega = 0;
    sw.kick = 0;
    sw.mode = 'REST';
    return sw;
  }
  if (sw.phase === 'DISPATCH') {
    sw.phase = 'COURSE';
    sw.mode = 'RAMP';
    sw.holdLeft = sw.holdTime || 6;
  }
  if (sw.mode === 'RAMP') {
    sw.omega = Math.min(sw.omegaMax, sw.omega + sw.ramp * dt);
    if (sw.omega >= sw.omegaMax - 0.01) sw.mode = 'HOLD';
  } else if (sw.mode === 'HOLD') {
    sw.omega = sw.omegaMax;
    sw.holdLeft -= dt;
    if (sw.holdLeft <= 0) sw.mode = 'DOWN';
  } else if (sw.mode === 'DOWN') {
    sw.omega = Math.max(0, sw.omega - sw.ramp * dt);
    if (sw.omega <= 0.02) {
      sw.omega = 0;
      sw.phase = 'BRAKE';
      sw.mode = 'REST';
    }
  }
  if (sw.phase === 'BRAKE' || sw.eStop) {
    sw.phase = 'BRAKE';
    sw.omega = Math.max(0, sw.omega - (sw.ramp || 0.3) * dt);
    sw.angle += sw.omega * dt;
    sw.kick = (sw.omega * sw.omega * sw.radius) / G;
    if (sw.omega <= 0.02) {
      sw.omega = 0;
      sw.kick = 0;
      sw.phase = 'UNLOAD';
    }
    return sw;
  }
  sw.angle += sw.omega * dt;
  sw.kick = (sw.omega * sw.omega * sw.radius) / G;
  return sw;
}

export function stepSpin(sp, dt) {
  if (sp.phase === 'BOARDING' || sp.phase === 'IDLE' || sp.phase === 'UNLOAD') {
    sp.omega = 0;
    sp.mode = 'REST';
    return sp;
  }
  if (sp.phase === 'BRAKE' || sp.eStop) {
    sp.phase = 'BRAKE';
    sp.mode = 'DOWN';
  }
  if (sp.phase === 'DISPATCH') {
    sp.phase = 'COURSE';
    sp.mode = 'RAMP';
    sp.left = sp.holdTime || 5;
  }
  if (sp.mode === 'RAMP') {
    sp.omega = Math.min(sp.omegaMax, sp.omega + sp.ramp * dt);
    if (sp.omega >= sp.omegaMax - 0.01) sp.mode = 'HOLD';
  } else if (sp.mode === 'HOLD') {
    sp.left -= dt;
    if (sp.left <= 0) sp.mode = 'DOWN';
  } else if (sp.mode === 'DOWN') {
    sp.omega = Math.max(0, sp.omega - sp.ramp * dt);
    if (sp.omega <= 0.02) {
      sp.omega = 0;
      sp.phase = 'UNLOAD';
      sp.mode = 'REST';
    }
  }
  sp.angle += sp.omega * dt;
  sp.lean = (sp.omega * sp.omega * (sp.radius || 6)) / G;
  return sp;
}

export function stepBumper(b, dt) {
  b.angle += b.omega * dt;
  b.r += b.vr * dt;
  if (b.r > b.ring) {
    b.r = b.ring;
    b.vr = -Math.abs(b.vr) * 0.82;
  }
  if (b.r < b.minR) {
    b.r = b.minR;
    b.vr = Math.abs(b.vr) * 0.82 + 0.35;
  }
  return b;
}

export function simulateEnergy(table, seconds, opts, phase) {
  const state = {
    s: 0,
    v: 0,
    a: 0,
    phase: phase || 'DISPATCH',
    eStop: false,
    trimAssist: 0,
    laps: 0,
    chain: false,
  };
  const dt = 0.05;
  let vAtLift = null;
  let vAfterDrop = null;
  let nan = false;
  let maxStep = 0;
  let peakV = 0;
  for (let t = 0; t < seconds && state.laps < 1 && !state.arrived; t += dt) {
    const before = state.s;
    stepEnergy(state, table, dt, opts);
    const hopped = Math.abs(state.s - before);
    maxStep = Math.max(maxStep, Math.min(hopped, lengthSafe(table) - hopped));
    if (state.v > peakV) peakV = state.v;
    if (!Number.isFinite(state.s) || !Number.isFinite(state.v)) nan = true;
    if (state.lift) vAtLift = state.v;
    if (vAtLift != null && !state.lift && state.s > table.length * 0.12 && state.v > (vAfterDrop || 0)) {
      vAfterDrop = state.v;
    }
  }
  return { state, vAtLift, vAfterDrop, nan, maxStep, peakV };
}

function lengthSafe(table) {
  return table.length || 1;
}

const rails = new Map();

export function profileForId(id, samples) {
  if (id === 'ride-block-01') return 'dive';
  if (id === 'ride-block-02') return 'giga';
  if (id === 'ride-block-rim') return 'rim';
  if (id === 'ride-hours-02') return 'launch';
  if (id === 'ride-board-family') return 'hybrid';
  if (samples && samples.some((p) => p.lsm)) return 'launch';
  return 'giga';
}

function buildCache(samples) {
  const table = arcTable(samples);
  const rows = [];
  let acc = 0;
  for (let i = 0; i < samples.length; i++) {
    const a = samples[i];
    const b = samples[(i + 1) % samples.length];
    const ds = table.seg[i] || 1e-6;
    const theta = Math.asin(Math.max(-1, Math.min(1, (b.y - a.y) / ds)));
    rows.push({
      x: a.x, y: a.y, z: a.z, s: acc, theta,
      kappa: 0,
      bank: a.bank || 0,
      lift: !!a.lift,
      brake: !!a.brake,
      lsm: !!a.lsm,
      crestHold: !!a.crestHold,
      inversion: !!a.inversion,
      blockBrake: !!a.blockBrake,
    });
    acc += ds;
  }
  for (let i = 0; i < rows.length; i++) {
    const prev = rows[(i - 1 + rows.length) % rows.length];
    const seg = Math.max(0.05, table.seg[(i - 1 + rows.length) % rows.length] || 0.05);
    let dTheta = rows[i].theta - prev.theta;
    if (dTheta > Math.PI) dTheta -= Math.PI * 2;
    if (dTheta < -Math.PI) dTheta += Math.PI * 2;
    rows[i].kappa = dTheta / seg;
  }
  return { table, samples: rows, length: table.length };
}

function sampleAt(rail, s) {
  const p = pointInto(rail.cache.table, s, rail.scratch);
  const rows = rail.cache.samples;
  const n = rows.length;
  let u = s % rail.cache.length;
  if (u < 0) u += rail.cache.length;
  let acc = 0;
  let idx = n - 1;
  for (let i = 0; i < n; i++) {
    const d = rail.cache.table.seg[i];
    if (acc + d >= u || i === n - 1) { idx = i; break; }
    acc += d;
  }
  const row = rows[idx];
  p.theta = row.theta;
  p.kappa = row.kappa;
  return p;
}

export function registerRail(id, samples, profile, opts = {}) {
  if (!id || !samples || !samples.length) return null;
  const cache = buildCache(samples);
  const rail = {
    id,
    profile: profile || profileForId(id, samples),
    cache,
    scratch: { x: 0, y: 0, z: 0 },
    state: null,
    hold: opts.hold != null ? opts.hold : (profile === 'dive' ? 3 : 0),
    log: [],
  };
  rails.set(id, rail);
  return rail;
}

export function bindRail(id, state) {
  const rail = rails.get(id);
  if (!rail) return null;
  rail.state = state;
  return rail;
}

export function getRail(id) {
  return rails.get(id) || null;
}

export function railIds() {
  return [...rails.keys()];
}

function note(rail, msg) {
  rail.log.push(msg);
  if (rail.state) {
    if (!rail.state.physLog) rail.state.physLog = [];
    rail.state.physLog.push(msg);
  }
}

/** One rail step. dt is clamped to 1/30. Missing id does not invent a train. */
export function tick(id, dt) {
  const rail = rails.get(id);
  if (!rail || !rail.state || !rail.cache || !rail.cache.length && !rail.cache.samples) {
    return { missing: true, status: 'MISSING', id };
  }
  const state = rail.state;
  const step = Math.max(0, Math.min(1 / 30, dt || 0));
  if (!step) return state;
  const L = rail.cache.length || 1;
  const sample = sampleAt(rail, state.s || 0);
  if (!Number.isFinite(sample.x) || !Number.isFinite(sample.y) || !Number.isFinite(sample.theta)) {
    state.s = 0;
    state.v = 0;
    state.a = 0;
    state.phase = 'BRAKE';
    note(rail, id + ' NaN sample, held for brakes');
    return state;
  }
  const lap = state.laps || 0;
  const rolling = state.phase === 'DISPATCH' || state.phase === 'COURSE' || state.phase === 'BRAKE';
  // The chain dog stays engaged while the rail is still rising. The lift flag
  // flips at the midpoint of the last uphill segment, a meter short of the drop.
  if (sample.lift && rail.profile !== 'launch') state.chain = true;
  const stillUp = (sample.theta || 0) >= -0.04;
  if (!stillUp) state.chain = false;
  const onLift = !!state.chain && stillUp && state.phase !== 'BRAKE' && !state.eStop && rail.profile !== 'launch';
  const onLsm = !!sample.lsm && (state.phase === 'DISPATCH' || state.phase === 'COURSE') && !state.eStop;
  const holdFor = rail.profile === 'dive' ? Math.max(2, Math.min(4, rail.hold || 3)) : 0;
  if (holdFor && sample.crestHold && (state.phase === 'DISPATCH' || state.phase === 'COURSE') && !state.eStop && state.crestLap !== lap) {
    state.phase = 'COURSE';
    state.crestT = (state.crestT || 0) + step;
    state.v = 0;
    state.a = 0;
    state.holding = true;
    state.y = sample.y;
    state.bank = sample.bank || 0;
    state.kappa = sample.kappa || 0;
    if (state.crestT < holdFor) return state;
    state.crestLap = lap;
    state.crestT = 0;
    state.holding = false;
    state.v = vMin;
    state.releaseS = (state.s || 0) + 30;
  } else if (!sample.crestHold) {
    state.holding = false;
  }
  if (!rolling && state.phase !== 'BRAKE') {
    state.v = 0;
    state.a = 0;
    return state;
  }
  if (onLift) {
    state.leftStation = true;
    state.a = 0;
    state.v = climbV;
    state.lift = true;
    state.launchTerm = 0;
    let s = (state.s || 0) + climbV * step;
    if (s < state.s) s = state.s;
    state.s = s;
    state.y = sample.y;
    state.bank = sample.bank || 0;
    state.kappa = sample.kappa || 0;
    return state;
  }
  let a = -G * Math.sin(sample.theta || 0);
  state.launchTerm = 0;
  if (onLsm && rail.profile === 'launch') {
    a += aLaunch;
    state.launchTerm = aLaunch;
  }
  const late = (state.s || 0) > L * 0.5;
  const onBrakeSection = !!(sample.brake || (sample.blockBrake && rolling));
  // Full aBrake only while the train is still fast. Below 4 m/s the section
  // releases, so a block brake trims instead of pinning the only train.
  const braking = (onBrakeSection && (state.v || 0) > 4) || (state.eStop && (state.v || 0) > 2);
  if (braking) a += aBrake;
  a += -dragC * state.v * Math.abs(state.v || 0);
  let v = (state.v || 0) + a * step;
  if (!Number.isFinite(v) || !Number.isFinite(a)) {
    state.s = 0;
    state.v = 0;
    state.a = 0;
    state.phase = 'BRAKE';
    note(rail, id + ' NaN step, held for brakes');
    return state;
  }
  if (v < 0) v = 0;
  if (v > vMax) v = vMax;
  if (onLsm || (sample.theta || 0) < -0.08) state.leftStation = true;
  if (!state.leftStation && v < vMin && (sample.theta || 0) > -0.05 && !sample.brake && state.phase !== 'BRAKE' && !state.eStop) {
    v = vMin;
  }
  if (state.releaseS && (state.s || 0) < state.releaseS && v < vMin && (sample.theta || 0) > -0.12 && !state.eStop) {
    v = vMin;
  }
  if (state.eStop && v < vMin) v = vMin;
  // Final brake grade rises into the station. Once speed is gone, roll the platform at vMin.
  if (sample.brake && late && !state.eStop && v < vMin) v = vMin;
  if (rail.profile === 'dive' && sample.inversion && v < vLoopMin && v > 0) {
    if (!state.trimOn) {
      state.trimAssist = (state.trimAssist || 0) + 1;
      state.trimOn = true;
      note(rail, id + ' trim s ' + (state.s || 0).toFixed(1) + ' v ' + v.toFixed(2) + ' -> ' + vLoopMin);
    }
    v = vLoopMin;
  } else if (!sample.inversion) {
    state.trimOn = false;
  }

  let s = (state.s || 0) + v * step;
  if (s >= L) {
    state.laps = (state.laps || 0) + 1;
    if (state.phase === 'BRAKE' || state.eStop || sample.brake) {
      s = 0;
      v = 0;
      state.arrived = true;
    } else {
      s -= L;
    }
  }
  state.v = v;
  state.s = s;
  state.a = a;
  state.lift = false;
  state.y = sample.y;
  state.bank = sample.bank || 0;
  state.kappa = sample.kappa || 0;
  state.brakeZone = !!(sample.brake && late) || !!state.eStop;
  return state;
}
