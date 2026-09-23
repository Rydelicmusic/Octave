/** Usable ride physics. Gravity, lift, drag, brakes. Not a sine wave. */
import { pointInto } from './path-math.js';

export const G = 9.81;

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
  const lift = !!(sample.lift || (state.chain && sinT > 0.02)) && !state.eStop && state.phase !== 'BRAKE';
  const braking = (!!sample.brake && late) || finalApproach || state.phase === 'BRAKE' || !!state.eStop;
  const brakeZone = braking && state.s > stationWindow;
  let accel = -G * sinT - drag * state.v * Math.abs(state.v);
  if (lift) accel += (liftV - state.v) * 8;
  const launchEnd = opts.launchUntil == null ? length * 0.28 : opts.launchUntil;
  const launched = opts.launch && !state.eStop && (state.laps || 0) === 0 && state.s < launchEnd;
  if (launched && (state.phase === 'DISPATCH' || state.phase === 'COURSE')) {
    accel += opts.launchA == null ? 22 : opts.launchA;
  }
  if (sample.lsm && rollingNow && !state.eStop && state.v < (opts.lsmV || 32)) {
    accel += opts.lsmA || 28;
  }
  const rolling = state.phase === 'DISPATCH' || state.phase === 'COURSE';
  if (!brakeZone && !lift && state.v < 1.8 && state.s < length * 0.14 && rolling) accel += 6;
  let trim = false;
  const uphillSlow = !lift && !brakeZone && sinT > 0.05 && state.v < Math.min(minLoop, 6) && state.s > length * 0.2 && rolling;
  if ((sample.inversion && state.v < minLoop && rolling) || uphillSlow) {
    accel += (Math.min(minLoop, 6) - state.v) * 4;
    trim = true;
    if (!state.trimOn) {
      state.trimAssist = (state.trimAssist || 0) + 1;
      state.trimOn = true;
    }
  } else {
    state.trimOn = false;
  }
  if (sample.blockBrake && rolling && !state.eStop && state.v > 6) accel -= 16;
  if (brakeZone) {
    const creep = state.eStop ? 1.8 : 0.32;
    if (state.v > creep + 0.4) accel -= Math.sign(state.v || 1) * (state.eStop ? brakeA * 1.3 : brakeA);
    else if (state.eStop) accel += (creep - state.v) * 8 + G * Math.max(0, sinT);
  }
  let v = state.v + accel * dt;
  if (!Number.isFinite(v)) v = 0;
  if (lift && v < 0.5) v = 0.5;
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
