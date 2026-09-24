/** Every listed ride is boardable from the HUD. Cycling is not a lock. */
import { mountAttractions } from './attractions.js';
import { getRide, rideIds, tickMotion } from './ride-runtime.js';
import { boardRide, exitRide, currentRide, applyRideCam, closeRestraint, requestDispatch } from './ride-cam.js';
import { admit, setCheat, setDevBypass } from '../logic/ticket.js';
import { claimLoad } from '../logic/queue.js';
import { pointAt } from './path-math.js';
import { holdStations, tickStationHold } from './station-hold.js';

let mounted = false;
let tries = 0;
let hudBound = false;
let keyBound = false;

function samplesOf(ride) {
  if (!ride) return null;
  if (ride.table && ride.table.samples && ride.table.samples.length) return ride.table.samples;
  if (ride.samples && ride.samples.length) return ride.samples;
  if (ride.path && ride.path.length) return ride.path;
  return null;
}

function snapStation(ride) {
  if (!ride) return false;
  const ops = ride.ops || (ride.ops = {
    id: ride.id, phase: 'BOARDING', s: 0, v: 0, a: 0,
    passengers: 0, restraint: 'open', eStop: false, blockOccupied: false, clock: 0,
  });
  ops.phase = 'BOARDING';
  ops.s = 0;
  ops.v = 0;
  ops.a = 0;
  ops.passengers = 1;
  ops.restraint = 'open';
  ops.eStop = false;
  ops.blockOccupied = false;
  ops.leaveAfterStop = false;
  ops.weatherHold = false;
  ops.parkClosed = false;
  ops.fault = false;
  ops.hoistFault = false;
  ops.gateOpen = false;
  ops.missing = false;
  ride.s = 0;
  ride.speed = 0;
  ride.guest = true;
  if (ride.machine) {
    ride.machine.phase = 'BOARDING';
    ride.machine.s = 0;
    ride.machine.v = 0;
    ride.machine.eStop = false;
  }
  return true;
}

export function boardAny(id) {
  setDevBypass(true);
  setCheat(true);
  try { admit(); } catch (err) { /* ticket module may already be open */ }
  const ride = getRide(id);
  if (!ride) return false;
  snapStation(ride);
  try { claimLoad(id); } catch (err) { /* queue is optional */ }
  const ok = boardRide(id);
  if (!ok) {
    ride.guest = true;
    ride.boardedSeat = 0;
  }
  if (typeof window !== 'undefined') {
    window.__parkForceWalk = false;
    window.__parkRideCam = id;
  }
  return true;
}

export function dispatchAny() {
  const id = currentRide();
  const ride = id ? getRide(id) : null;
  if (!ride) return false;
  closeRestraint();
  if (ride.ops) {
    ride.ops.restraint = 'closed';
    ride.ops.passengers = 1;
    ride.ops.phase = 'DISPATCH';
    ride.ops.blockOccupied = true;
    ride.ops.v = 4;
  }
  requestDispatch();
  return true;
}

function eyeFromSamples(ride) {
  const samples = samplesOf(ride);
  if (!samples || !samples.length) return null;
  const s = ride.s || (ride.ops && ride.ops.s) || 0;
  let p = samples[0];
  let nxt = samples[Math.min(4, samples.length - 1)];
  if (ride.table && ride.table.samples) {
    const here = pointAt(ride.table, s);
    const ahead = pointAt(ride.table, s + 2);
    if (here && Number.isFinite(here.x)) p = here;
    if (ahead && Number.isFinite(ahead.x)) nxt = ahead;
  }
  const fx = (nxt.x - p.x) || 0;
  const fy = ((nxt.y || 0) - (p.y || 0)) || 0;
  const fz = (nxt.z - p.z) || 1;
  const fl = Math.hypot(fx, fy, fz) || 1;
  return {
    x: p.x - (fx / fl) * 6,
    y: (p.y || 3) + 2.5,
    z: p.z - (fz / fl) * 6,
    lx: fx / fl,
    ly: fy / fl,
    lz: fz / fl,
    ux: 0,
    uy: 1,
    uz: 0,
  };
}

export function tickRideAll(camera) {
  const t = typeof camera === 'number' ? camera : (typeof performance !== 'undefined' ? performance.now() : 0);
  tickStationHold();
  tickMotion(t);
  tickStationHold();
  if (!camera || typeof camera !== 'object' || !camera.position) return false;
  if (typeof window !== 'undefined') window.__parkCamera = camera;
  const id = currentRide() || (typeof window !== 'undefined' ? window.__parkRideCam : null);
  if (!id) return false;
  const held = applyRideCam(camera);
  if (held) return true;
  const ride = getRide(id);
  if (!ride) return false;
  const eye = typeof ride.eye === 'function' ? ride.eye() : eyeFromSamples(ride);
  if (!eye || !Number.isFinite(eye.x)) return false;
  camera.position.set(eye.x, eye.y, eye.z);
  camera.up.set(eye.ux || 0, eye.uy == null ? 1 : eye.uy, eye.uz || 0);
  camera.lookAt(eye.x + (eye.lx || 0) * 8, eye.y + (eye.ly || 0) * 8, eye.z + (eye.lz || 1) * 8);
  return true;
}

function rewireHud() {
  if (typeof document === 'undefined') return 0;
  const wrap = document.getElementById('ride-hud');
  if (!wrap) return 0;
  const ids = rideIds();
  const buttons = wrap.querySelectorAll('button');
  let n = 0;
  buttons.forEach((btn) => {
    if (btn.dataset.boardAny === '1') {
      n += 1;
      return;
    }
    const label = (btn.textContent || '').trim();
    const id = ids.find((rid) => {
      const ride = getRide(rid);
      const name = (ride && (ride.name || ride.id)) || rid;
      return label === name || label === rid || (name && label.indexOf(name) !== -1);
    });
    if (!id) return;
    const fresh = btn.cloneNode(true);
    fresh.dataset.boardAny = '1';
    fresh.addEventListener('click', (ev) => {
      ev.preventDefault();
      boardAny(id);
    });
    btn.replaceWith(fresh);
    n += 1;
  });
  const all = wrap.querySelectorAll('button');
  const board = [...all].find((b) => b.textContent === 'Board' && b.dataset.boardAny !== '1');
  if (board) {
    const fresh = board.cloneNode(true);
    fresh.dataset.boardAny = '1';
    fresh.addEventListener('click', (ev) => {
      ev.preventDefault();
      const id = currentRide() || ids[0];
      if (id) boardAny(id);
    });
    board.replaceWith(fresh);
  }
  const dispatch = [...all].find((b) => b.textContent === 'Dispatch' && b.dataset.boardAny !== '1');
  if (dispatch) {
    const fresh = dispatch.cloneNode(true);
    fresh.dataset.boardAny = '1';
    fresh.addEventListener('click', (ev) => {
      ev.preventDefault();
      dispatchAny();
    });
    dispatch.replaceWith(fresh);
  }
  if (n > 0) hudBound = true;
  return n;
}

function mountNow() {
  if (mounted || tries >= 4 || typeof window === 'undefined') return;
  const scene = window.__parkScene;
  const THREE = window.__parkTHREE;
  if (!scene || !scene.isScene || !THREE) return;
  tries += 1;
  try {
    mountAttractions(THREE, scene);
    mounted = !!(scene.getObjectByName('ride-block-01-world') || scene.getObjectByName('ride-block-02-world') || scene.getObjectByName('ride-block-rim-world'));
    if (mounted) holdStations();
  } catch (err) {
    console.warn('ride-all', err);
  }
}

export function mountRideAll() {
  setDevBypass(true);
  setCheat(true);
  try { admit(); } catch (err) { /* already open */ }
  if (typeof window === 'undefined') return 0;
  window.__boardAny = boardAny;
  window.__dispatchAny = dispatchAny;
  window.__exitAny = exitRide;
  if (!keyBound) {
    keyBound = true;
    window.addEventListener('keydown', (ev) => {
      if (ev.code === 'KeyR' && ev.shiftKey) {
        const ids = rideIds();
        if (ids[0]) boardAny(ids[0]);
      }
    });
  }
  const attach = () => {
    const prev = window.__tickRides;
    if (prev && prev.__rideAll) return;
    const wrapped = () => {
      mountNow();
      if (!hudBound) rewireHud();
      if (typeof prev === 'function') prev();
      else tickRideAll();
    };
    wrapped.__rideAll = true;
    window.__tickRides = wrapped;
  };
  queueMicrotask(attach);
  const n = rewireHud();
  console.info('ride-all: mounted', n, 'hud binds', rideIds());
  return n;
}
