/** Walk and third-person boarding at the load pad. Drone cannot board. */
import { getRide, rideIds } from '../rides/ride-runtime.js';
import { boardRide, closeRestraint, requestDispatch, currentRide } from '../rides/ride-cam.js';
import { claimLoad } from '../logic/queue.js';
import { admit, isAdmitted, isDevBypass, setDevBypass } from '../logic/ticket.js';

const RADIUS = 4.5;
const LOOK_DOT = 0.35;

const lookScratch = {
  x: 0,
  y: 0,
  z: 0,
  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  },
  normalize() {
    const l = Math.hypot(this.x, this.y, this.z) || 1;
    this.x /= l;
    this.y /= l;
    this.z /= l;
    return this;
  },
};

let last = emptyState();
let home = null;
let feetHeld = false;

function emptyState() {
  return {
    mode: 'walk',
    dev: false,
    inTrigger: false,
    facing: false,
    admitted: false,
    phase: 'BOARDING',
    v: 0,
    s: 0,
    boarded: false,
    restraint: 'open',
    missing: false,
    triggerId: '',
    trigger: null,
  };
}

function devQuery() {
  try {
    return typeof location !== 'undefined' && /(?:\?|&)dev=1(?:&|$)/.test(location.search || '');
  } catch (err) {
    return false;
  }
}

if (devQuery()) setDevBypass(true);

export function triggerFromSamples(id, samples, radius = RADIUS) {
  if (!id || !samples || !samples.length) return null;
  const p = samples[0];
  if (!Number.isFinite(p.x) || !Number.isFinite(p.z)) return null;
  return { id, x: p.x, z: p.z, y: 0, trackY: Number.isFinite(p.y) ? p.y : 0, r: radius };
}

export function inTrigger(trigger, x, z, y) {
  if (!trigger || !Number.isFinite(x) || !Number.isFinite(z)) return false;
  if (Math.hypot(x - trigger.x, z - trigger.z) >= trigger.r) return false;
  if (y != null && Number.isFinite(y) && Number.isFinite(trigger.trackY)) {
    if (Math.abs(y - trigger.trackY) >= 2) return false;
  }
  return true;
}

/** Admit ∧ BOARDING ∧ InTrigger ∧ Walk/3rd ∧ v ≤ 1. Moving rides are not boardable. */
export function boardPermitted(state) {
  if (!state || state.admitted !== true) return false;
  if (state.phase !== 'BOARDING') return false;
  if (!state.inTrigger) return false;
  if (state.mode !== 'walk' && state.mode !== 'third') return false;
  if ((state.v || 0) > 1) return false;
  return true;
}

export function facingTarget(px, pz, lx, lz, tx, tz) {
  const vx = tx - px;
  const vz = tz - pz;
  const dist = Math.hypot(vx, vz);
  if (dist < 1.2) return true;
  const look = Math.hypot(lx, lz);
  if (look < 1e-6) return false;
  return (lx * vx + lz * vz) / (look * dist) > LOOK_DOT;
}

export function escPlan(phase) {
  if (phase === 'COURSE' || phase === 'DISPATCH' || phase === 'BRAKE') {
    return { stay: true, brake: true, teleport: false, walk: false };
  }
  return { stay: false, brake: false, teleport: false, walk: true };
}

export function promptFor(state) {
  if (!state || state.mode === 'drone' || state.mode === 'above') return '';
  if (state.missing || !state.inTrigger) return '';
  if (!state.admitted) return '[E] Admit here';
  if (state.boarded && (state.phase === 'BOARDING' || state.phase === 'IDLE') && state.restraint !== 'closed') return '[F] Close restraint';
  if (state.boarded && (state.phase === 'BOARDING' || state.phase === 'IDLE') && state.restraint === 'closed') return '[E] Dispatch';
  if (state.boarded && (state.phase === 'COURSE' || state.phase === 'DISPATCH' || state.phase === 'BRAKE')) return '[Esc] Stop';
  if (state.phase === 'COURSE' || state.phase === 'DISPATCH' || state.phase === 'BRAKE' || state.phase === 'UNLOAD') return 'Wait for train';
  if ((state.v || 0) > 1) return 'Wait for train';
  if (state.phase === 'BOARDING' || state.phase === 'IDLE') return '[E] Board';
  return '';
}

export function promptSub(state) {
  if (!state || state.admitted || state.missing) return '';
  if (state.mode === 'drone' || state.mode === 'above') return '';
  if (!state.inTrigger) return '';
  return 'or walk to the Gate';
}

export function boardAllowedHere(state) {
  if (!state || state.missing || state.boarded) return false;
  return boardPermitted(state);
}

export function keyAction(code, state) {
  const here = state || emptyState();
  if (code === 'KeyG') return here.dev ? 'cheat' : 'noop';
  if (code === 'Escape') return escPlan(here.phase).brake ? 'estop' : 'walk';
  if ((code === 'KeyE' || code === 'KeyF') && (here.mode === 'drone' || here.mode === 'above')) return 'noop';
  if (code === 'KeyF' && here.boarded && here.phase === 'BOARDING' && (here.mode === 'walk' || here.mode === 'third')) return 'bar';
  if (code === 'KeyE' && here.boarded && here.restraint === 'closed' && (here.phase === 'BOARDING' || here.phase === 'IDLE')) return 'dispatch';
  if (code === 'KeyE' && !here.admitted && here.inTrigger && here.facing) return 'admit';
  if (code === 'KeyE' && boardAllowedHere(here)) return 'board';
  return 'noop';
}

function leadCar(ride) {
  if (!ride || !ride.cars) return null;
  return ride.cars.find((car) => car && car.name === ride.id + '-car') || null;
}

export function liveTriggers() {
  const list = [];
  for (const id of rideIds()) {
    const ride = getRide(id);
    if (!leadCar(ride)) continue;
    if (ride.ops && ride.ops.missing) continue;
    const samples = ride.table && ride.table.samples;
    const trigger = triggerFromSamples(id, samples);
    if (!trigger) continue;
    list.push(trigger);
  }
  return list;
}

export function readMode(camera) {
  if (typeof window === 'undefined' || !window.__parkGpsGet || !camera || !camera.position) return 'walk';
  const gps = window.__parkGpsGet();
  if (!gps) return 'walk';
  const dx = camera.position.x - gps.x;
  const dz = camera.position.z - gps.z;
  const near = Math.hypot(dx, dz) < 1.5 && Math.abs(camera.position.y - gps.y) < 3;
  if (near && gps.y > 7) return 'drone';
  if (near) return 'walk';
  return 'third';
}

function playerXZ() {
  if (typeof window === 'undefined' || !window.__parkGpsGet) return null;
  const gps = window.__parkGpsGet();
  if (!gps || !Number.isFinite(gps.x) || !Number.isFinite(gps.z)) return null;
  return { x: gps.x, y: Number.isFinite(gps.y) ? gps.y : 1.72, z: gps.z };
}

function lookXZ(camera) {
  if (!camera || !camera.getWorldDirection) return { x: 0, z: -1 };
  const dir = camera.getWorldDirection(lookScratch);
  return { x: dir.x, z: dir.z };
}

function nearest(triggers, player) {
  let best = null;
  let bestD = Infinity;
  for (const trigger of triggers) {
    if (!inTrigger(trigger, player.x, player.z, player.y)) continue;
    const d = Math.hypot(player.x - trigger.x, player.z - trigger.z);
    if (d < bestD) {
      best = trigger;
      bestD = d;
    }
  }
  return best;
}

function stateFrom(mode, player, look, trigger) {
  const ride = trigger ? getRide(trigger.id) : null;
  const ops = ride && ride.ops;
  const riding = currentRide();
  return {
    mode,
    dev: devQuery() || isDevBypass(),
    inTrigger: !!(player && trigger),
    facing: !!(player && trigger),
    admitted: isAdmitted(),
    phase: ops ? ops.phase : 'MISSING',
    v: ops ? ops.v || 0 : 0,
    s: ops ? ops.s || 0 : 0,
    boarded: !!riding,
    restraint: ops ? ops.restraint || 'open' : 'open',
    missing: !ride || !ops || !!ops.missing,
    triggerId: trigger ? trigger.id : '',
    trigger: trigger || null,
  };
}

function ensurePrompt() {
  if (typeof document === 'undefined') return null;
  let el = document.getElementById('walk-ride-prompt');
  if (el) return el;
  el = document.createElement('div');
  el.id = 'walk-ride-prompt';
  el.style.cssText = 'position:fixed;left:50%;bottom:16%;transform:translateX(-50%);z-index:6;min-width:220px;text-align:center;font:16px/1.35 sans-serif;color:#f4efe6;background:rgba(18,16,14,.82);padding:10px 16px;border-radius:12px;pointer-events:none;';
  document.body.appendChild(el);
  return el;
}

function paintPrompt(state) {
  const el = ensurePrompt();
  if (!el) return;
  const show = state.mode === 'walk' || state.mode === 'third';
  el.style.display = show ? 'block' : 'none';
  const text = promptFor(state);
  const sub = promptSub(state);
  el.replaceChildren();
  if (!show || (!text && !sub)) {
    el.style.display = 'none';
    return;
  }
  if (text) {
    const line = document.createElement('div');
    line.textContent = text;
    el.appendChild(line);
  }
  if (sub) {
    const line = document.createElement('div');
    line.textContent = sub;
    line.style.opacity = '0.8';
    line.style.fontSize = '13px';
    el.appendChild(line);
  }
}

function ensurePad(ride, trigger) {
  const car = leadCar(ride);
  if (!car || !car.parent || !car.geometry || !car.constructor) return;
  const parent = car.parent;
  if (parent.getObjectByName(ride.id + '-station') || parent.getObjectByName(ride.id + '-pad')) return;
  try {
    const pad = new car.constructor(new car.geometry.constructor(2, 0.2, 1), car.material);
    pad.name = ride.id + '-pad';
    pad.position.set(trigger.x, 0.1, trigger.z);
    parent.add(pad);
  } catch (err) {
    /* geometry is not a box; the station mesh is the pad */
  }
}

function holdFeet() {
  if (feetHeld || typeof window === 'undefined') return;
  feetHeld = true;
  const prev = window.__blockWalk;
  window.__blockWalk = (x, z) => {
    if (currentRide()) return true;
    return typeof prev === 'function' ? !!prev(x, z) : false;
  };
}

function restoreHome(mode, camera) {
  if (currentRide() || !home) return;
  if (mode === 'drone' || mode === 'above') {
    home = null;
    return;
  }
  if (typeof window !== 'undefined' && window.__parkGpsGet) {
    const gps = window.__parkGpsGet();
    if (gps) {
      gps.x = home.x;
      gps.z = home.z;
    }
  }
  if (camera && camera.up && camera.up.set) camera.up.set(0, 1, 0);
  home = null;
}

export function tickWalkRide(camera) {
  holdFeet();
  const mode = readMode(camera);
  restoreHome(mode, camera);
  const triggers = liveTriggers();
  for (const trigger of triggers) {
    const ride = getRide(trigger.id);
    if (ride) ensurePad(ride, trigger);
  }
  const player = playerXZ();
  const trigger = player ? nearest(triggers, player) : null;
  if (typeof window !== 'undefined' && window.__parkForceWalk && !currentRide()) {
    window.__parkForceWalk = false;
    const btn = typeof document !== 'undefined' ? document.getElementById('b1') : null;
    if (btn && btn.click) btn.click();
  }
  last = stateFrom(mode, player, null, trigger);
  paintPrompt(last);
  return last;
}

function doBoard() {
  if (!last.triggerId) return false;
  claimLoad(last.triggerId);
  const ok = boardRide(last.triggerId);
  if (ok && last.trigger) home = { x: last.trigger.x, z: last.trigger.z };
  return ok;
}

function doBar() {
  const id = currentRide();
  const ride = id ? getRide(id) : null;
  if (ride && ride.ops && ride.ops.restraint !== 'closed') closeRestraint();
  return requestDispatch();
}

function onKey(ev) {
  if (!ev || ev.repeat) return;
  const tag = ev.target && ev.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  const action = keyAction(ev.code, last);
  if (action === 'admit') {
    admit();
    last = { ...last, admitted: true };
    paintPrompt(last);
    return;
  }
  if (action === 'board') doBoard();
  else if (action === 'dispatch') requestDispatch();
  else if (action === 'bar') doBar();
}

if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('keydown', onKey);
}

export function lastWalkState() {
  return last;
}
