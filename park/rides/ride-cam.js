/** Board a ride. While boarded, the park camera sits in the seat and looks along travel. Esc walks. */
import { getRide, rideIds, rideAgain, boardAllowed } from './ride-runtime.js';
import { tryBoard, setRestraint, tryDispatch, eStop, waitMinutes } from './ride-ops.js';

let boarded = null;
const labels = new Map();

function hudNow() {
  return typeof document !== 'undefined' ? document.getElementById('ride-hud-now') : null;
}

function paintOps(ride) {
  const hud = hudNow();
  const line = typeof document !== 'undefined' ? document.getElementById('ride-ops') : null;
  if (!hud) return;
  if (!ride || !ride.ops) {
    hud.textContent = boarded ? 'Riding ' + (labels.get(boarded) || boarded) : 'Walk';
    if (line) line.textContent = 'board  /  close restraint  /  dispatch  /  exit';
    return;
  }
  const ops = ride.ops;
  const wait = waitMinutes(ride.length || ride.waitLen || 80, 8);
  const name = labels.get(ride.id) || ride.id;
  hud.textContent = name + '  ' + ops.phase + '  v ' + (ops.v || 0).toFixed(1);
  if (line) {
    const block = ops.blockOccupied ? 'block full' : 'block clear';
    const trim = ops.trim ? '  trim assist' : '';
    line.textContent = ops.phase + '  wait ' + wait + ' min  restraint ' + ops.restraint + '  ' + block + trim + '  — board / close restraint / dispatch / exit';
  }
}

export function boardRide(id) {
  const ride = getRide(id);
  if (!ride) return false;
  if (ride.ops) {
    if (!boardAllowed(ride)) return false;
    if (!tryBoard(ride.ops)) return false;
  }
  boarded = id;
  ride.guest = true;
  ride.boardedSeat = 0;
  paintOps(ride);
  return true;
}

export function closeRestraint() {
  const ride = boarded ? getRide(boarded) : null;
  if (!ride || !ride.ops) return false;
  const ok = setRestraint(ride.ops, true);
  paintOps(ride);
  return ok;
}

export function requestDispatch() {
  const ride = boarded ? getRide(boarded) : null;
  if (!ride || !ride.ops) return false;
  const ok = tryDispatch(ride.ops);
  paintOps(ride);
  return ok;
}

export function emergencyStop() {
  const ride = boarded ? getRide(boarded) : null;
  if (!ride || !ride.ops) return false;
  ride.ops.leaveAfterStop = true;
  const ok = eStop(ride.ops);
  if (ride.machine) ride.machine.eStop = true;
  paintOps(ride);
  return ok;
}

function clearBoard() {
  const ride = boarded ? getRide(boarded) : null;
  if (ride) ride.guest = false;
  boarded = null;
  const hud = hudNow();
  if (hud) hud.textContent = 'Walk';
  const line = typeof document !== 'undefined' ? document.getElementById('ride-ops') : null;
  if (line) line.textContent = 'board  /  close restraint  /  dispatch  /  exit';
}

export function exitRide() {
  const ride = boarded ? getRide(boarded) : null;
  if (ride && ride.ops && (ride.ops.phase === 'COURSE' || ride.ops.phase === 'DISPATCH' || ride.ops.phase === 'BRAKE')) {
    emergencyStop();
    return false;
  }
  clearBoard();
  return true;
}

export function currentRide() {
  return boarded;
}

export function applyRideCam(camera) {
  if (typeof window !== 'undefined') window.__parkRideCam = boarded;
  if (!boarded || !camera) return false;
  const ride = getRide(boarded);
  if (!ride) return false;
  if (ride.ops && ride.ops.leaveAfterStop && (ride.ops.phase === 'BOARDING' || ride.ops.phase === 'IDLE')) {
    clearBoard();
    return false;
  }
  paintOps(ride);
  if (ride.kind === 'path' && ride.lead && ride.lead.p) {
    const pose = ride.lead;
    const accel = Math.abs(ride.a || (ride.ops && ride.ops.a) || 0);
    const shake = Math.sin(ride.clock * 48) * 0.02 * Math.min(1.5, accel / 9);
    const px = pose.p.x - pose.forward.x * 6 + pose.right.x * 2.4;
    const py = pose.p.y + 2.6 + shake;
    const pz = pose.p.z - pose.forward.z * 6 + pose.right.z * 2.4;
    camera.position.set(px, py, pz);
    const upx = pose.up.x * 0.45;
    const upy = 0.55 + pose.up.y * 0.45;
    const upz = pose.up.z * 0.45;
    camera.up.set(upx, upy, upz);
    const lookY = pose.p.y + pose.forward.y * 4;
    const clampedY = Math.max(pose.p.y - 2, Math.min(pose.p.y + 1.2, lookY));
    camera.lookAt(pose.p.x + pose.forward.x * 10, clampedY, pose.p.z + pose.forward.z * 10);
    return true;
  }
  if (typeof ride.eye === 'function') {
    const eye = ride.eye();
    if (!eye || !Number.isFinite(eye.x)) return false;
    const accel = Math.abs(ride.a || 0);
    const shake = Math.sin(ride.clock * 40) * 0.015 * Math.min(1.2, accel / 6);
    camera.position.set(eye.x, eye.y + shake, eye.z);
    camera.up.set(eye.ux || 0, eye.uy == null ? 1 : eye.uy, eye.uz || 0);
    camera.lookAt(eye.x + eye.lx * 8, eye.y + eye.ly * 8, eye.z + eye.lz * 8);
    return true;
  }
  return false;
}

function opsButton(label, onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = label;
  btn.style.cssText = 'appearance:none;border:1px solid rgba(201,180,138,.45);background:rgba(70,48,28,.82);color:#f4efe6;padding:5px 8px;border-radius:999px;text-align:left;';
  btn.addEventListener('click', onClick);
  return btn;
}

export function mountRideHud(entries) {
  if (typeof document === 'undefined' || document.getElementById('ride-hud')) return;
  const wrap = document.createElement('div');
  wrap.id = 'ride-hud';
  wrap.style.cssText = 'position:fixed;right:12px;top:96px;z-index:4;display:flex;flex-direction:column;gap:4px;max-height:70vh;overflow:auto;font:11px/1.3 sans-serif;';
  const now = document.createElement('div');
  now.id = 'ride-hud-now';
  now.textContent = 'Walk';
  now.style.cssText = 'color:#f4efe6;background:rgba(18,16,14,.72);padding:4px 8px;border-radius:8px;';
  wrap.appendChild(now);
  const ops = document.createElement('div');
  ops.id = 'ride-ops';
  ops.textContent = 'board  /  close restraint  /  dispatch  /  exit';
  ops.style.cssText = 'color:#f4efe6;background:rgba(18,16,14,.72);padding:4px 8px;border-radius:8px;max-width:240px;';
  wrap.appendChild(ops);
  for (const entry of entries) {
    labels.set(entry.id, entry.name || entry.id);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = entry.name || entry.id;
    btn.style.cssText = 'appearance:none;border:1px solid rgba(201,180,138,.45);background:rgba(40,32,24,.72);color:#f4efe6;padding:5px 8px;border-radius:999px;text-align:left;';
    btn.addEventListener('click', () => boardRide(entry.id));
    wrap.appendChild(btn);
  }
  wrap.appendChild(opsButton('Close restraint', () => closeRestraint()));
  wrap.appendChild(opsButton('Dispatch', () => requestDispatch()));
  wrap.appendChild(opsButton('E-stop', () => emergencyStop()));
  const again = document.createElement('button');
  again.type = 'button';
  again.textContent = 'Ride again';
  again.style.cssText = 'appearance:none;border:1px solid rgba(201,180,138,.45);background:rgba(90,40,24,.8);color:#f4efe6;padding:5px 8px;border-radius:999px;text-align:left;';
  again.addEventListener('click', () => {
    const id = currentRide();
    if (id && rideAgain(id)) boardRide(id);
  });
  wrap.appendChild(again);
  document.body.appendChild(wrap);
  window.addEventListener('keydown', (ev) => {
    if (ev.code === 'Escape') exitRide();
  });
}

export function hudIds() {
  return rideIds();
}
