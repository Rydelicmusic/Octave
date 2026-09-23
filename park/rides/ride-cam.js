/** Board a ride from the load slot. Esc e-stops. The queue is the line, not the button. */
import { getRide, rideIds, boardAllowed } from './ride-runtime.js';
import { setRestraint, waitMinutes } from './ride-ops.js';
import { attemptBoard, attemptDispatch, joinRide, loadRideId, rideStatus, postedRideWait, ruleFor } from '../logic/ride-logic.js';
import { admit, setCheat, takeMerch, isAdmitted } from '../logic/ticket.js';
import { leaveQueue, queueFor } from '../logic/queue.js';
import { formatClock, isOpen, getClock } from '../logic/clock.js';
import { setWeather, weatherHold, resetSafety } from '../logic/safety.js';
import { eStop } from './ride-ops.js';

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
    if (line) line.textContent = 'ticket / queue / board / close restraint / dispatch / exit';
    return;
  }
  const ops = ride.ops;
  const rules = ruleFor(ride.id);
  const wait = postedRideWait(ride.id) || waitMinutes(ride.length || ride.waitLen || rules.cycle || 80, 8);
  const name = labels.get(ride.id) || ride.id;
  const status = rideStatus(ops);
  hud.textContent = name + '  ' + status + '  ' + ops.phase + '  v ' + (ops.v || 0).toFixed(1);
  if (line) {
    const block = ops.blockOccupied ? 'block full' : 'block clear';
    const note = ops.statusNote ? '  ' + ops.statusNote : '';
    const photo = ops.photo ? '  photo ready ' + ops.photo : '';
    const tag = rules.thrill + '  ' + (rules.height ? rules.height + ' in' : 'any height');
    line.textContent = ops.phase + '  wait ' + wait + ' min  restraint ' + ops.restraint + '  ' + block + '  ' + tag + note + photo;
  }
}

export function paintBoard() {
  if (typeof document === 'undefined') return;
  const clock = document.getElementById('park-clock');
  if (clock) {
    const open = isOpen(getClock());
    clock.textContent = formatClock(getClock()) + (open ? '  OPEN' : '  CLOSED') + (weatherHold() ? '  WEATHER HOLD' : '') + (isAdmitted() ? '  ADMITTED' : '  NEED TICKET');
  }
  for (const id of rideIds()) {
    const dot = document.getElementById('dot-' + id);
    if (!dot) continue;
    const status = rideStatus(getRide(id) && getRide(id).ops);
    dot.textContent = status;
    dot.style.color = status === 'down' ? '#e07060' : status === 'closed' ? '#9a9086' : '#8dcc8a';
  }
  const ride = boarded ? getRide(boarded) : null;
  if (ride) paintOps(ride);
}

export function boardRide(id) {
  const ride = getRide(id);
  if (!ride) return false;
  if (ride.ops) {
    if (!boardAllowed(ride)) return false;
    const gate = attemptBoard(ride);
    if (!gate.ok) {
      const line = typeof document !== 'undefined' ? document.getElementById('ride-ops') : null;
      if (line) line.textContent = gate.reason === 'admit' ? 'Ticket required' : gate.reason === 'load' ? 'Join the queue and wait at the load gate' : 'Board refused: ' + gate.reason;
      return false;
    }
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
  const gate = attemptDispatch(ride);
  paintOps(ride);
  const line = typeof document !== 'undefined' ? document.getElementById('ride-ops') : null;
  if (!gate.ok && line) line.textContent = 'Dispatch refused: ' + gate.reason;
  return gate.ok;
}

export function emergencyStop() {
  const ride = boarded ? getRide(boarded) : null;
  if (!ride || !ride.ops) return false;
  ride.ops.leaveAfterStop = true;
  eStop(ride.ops);
  if (ride.machine && (ride.machine.phase === 'COURSE' || ride.machine.phase === 'DISPATCH')) {
    ride.machine.eStop = true;
    ride.machine.phase = 'BRAKE';
  }
  paintOps(ride);
  return true;
}

export function resetParkSafety() {
  return resetSafety(rideIds().map((id) => getRide(id)).filter(Boolean));
}

function clearBoard() {
  const ride = boarded ? getRide(boarded) : null;
  if (ride) ride.guest = false;
  boarded = null;
  const hud = hudNow();
  if (hud) hud.textContent = 'Walk';
  const line = typeof document !== 'undefined' ? document.getElementById('ride-ops') : null;
  if (line) line.textContent = 'ticket / queue / board / close restraint / dispatch / exit';
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
  if (ride.ops && ride.ops.leaveAfterStop && (ride.ops.phase === 'BOARDING' || ride.ops.phase === 'IDLE' || ride.ops.phase === 'DOWN' || ride.ops.phase === 'CLOSED')) {
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
  wrap.style.cssText = 'position:fixed;right:12px;top:64px;z-index:4;display:flex;flex-direction:column;gap:4px;max-height:78vh;overflow:auto;font:11px/1.3 sans-serif;';
  const clock = document.createElement('div');
  clock.id = 'park-clock';
  clock.textContent = '10:00  OPEN';
  clock.style.cssText = 'color:#f4efe6;background:rgba(18,16,14,.82);padding:4px 8px;border-radius:8px;';
  wrap.appendChild(clock);
  const now = document.createElement('div');
  now.id = 'ride-hud-now';
  now.textContent = 'Walk';
  now.style.cssText = 'color:#f4efe6;background:rgba(18,16,14,.72);padding:4px 8px;border-radius:8px;';
  wrap.appendChild(now);
  const ops = document.createElement('div');
  ops.id = 'ride-ops';
  ops.textContent = 'ticket / queue / board / close restraint / dispatch / exit';
  ops.style.cssText = 'color:#f4efe6;background:rgba(18,16,14,.72);padding:4px 8px;border-radius:8px;max-width:260px;';
  wrap.appendChild(ops);
  for (const entry of entries) {
    labels.set(entry.id, entry.name || entry.id);
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:6px;align-items:center;';
    const dot = document.createElement('span');
    dot.id = 'dot-' + entry.id;
    dot.textContent = 'operating';
    dot.style.cssText = 'color:#8dcc8a;min-width:72px;';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = entry.name || entry.id;
    btn.style.cssText = 'appearance:none;border:1px solid rgba(201,180,138,.45);background:rgba(40,32,24,.72);color:#f4efe6;padding:5px 8px;border-radius:999px;text-align:left;flex:1;';
    btn.addEventListener('click', () => {
      const res = joinRide(entry.id);
      const note = document.getElementById('ride-ops');
      if (!note) return;
      if (!res.ok && res.reason === 'admit') note.textContent = 'Ticket required. Admit at the gate. G is the comp key.';
      else if (!res.ok) note.textContent = 'Queue full';
      else note.textContent = 'Queued ' + (entry.name || entry.id) + '  wait ' + res.wait + ' min' + (res.at === 0 ? '  — board' : '');
    });
    row.appendChild(dot);
    row.appendChild(btn);
    wrap.appendChild(row);
  }
  wrap.appendChild(opsButton('Admit', () => { admit(); paintBoard(); }));
  wrap.appendChild(opsButton('Board', () => { const id = loadRideId(); if (id) boardRide(id); }));
  wrap.appendChild(opsButton('Leave queue', () => {
    for (const id of rideIds()) leaveQueue(queueFor(id), 'player');
    const note = document.getElementById('ride-ops');
    if (note) note.textContent = 'Left the queue';
  }));
  wrap.appendChild(opsButton('Close restraint', () => closeRestraint()));
  wrap.appendChild(opsButton('Dispatch', () => requestDispatch()));
  wrap.appendChild(opsButton('E-stop', () => emergencyStop()));
  wrap.appendChild(opsButton('Reset safety', () => { resetParkSafety(); paintBoard(); }));
  wrap.appendChild(opsButton('Weather hold', () => { setWeather(!weatherHold()); paintBoard(); }));
  wrap.appendChild(opsButton('Merch', () => {
    const bought = takeMerch('cart');
    const note = document.getElementById('ride-ops');
    if (note) note.textContent = 'Merch noted (' + bought.count + '). No charge.';
  }));
  const again = document.createElement('button');
  again.type = 'button';
  again.textContent = 'Ride again';
  again.style.cssText = 'appearance:none;border:1px solid rgba(201,180,138,.45);background:rgba(90,40,24,.8);color:#f4efe6;padding:5px 8px;border-radius:999px;text-align:left;';
  again.addEventListener('click', () => {
    const id = currentRide() || loadRideId();
    if (!id) return;
    joinRide(id);
    if (loadRideId() === id) boardRide(id);
  });
  wrap.appendChild(again);
  document.body.appendChild(wrap);
  window.addEventListener('keydown', (ev) => {
    if (ev.code === 'Escape') exitRide();
    if (ev.code === 'KeyG') {
      setCheat(true);
      paintBoard();
    }
  });
}

export function hudIds() {
  return rideIds();
}
