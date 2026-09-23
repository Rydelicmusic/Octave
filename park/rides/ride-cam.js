/** Board a ride. While boarded, the park camera sits in the seat and looks along travel. Esc walks. */
import { getRide, rideIds } from './ride-runtime.js';

let boarded = null;
const labels = new Map();

export function boardRide(id) {
  const ride = getRide(id);
  if (!ride) return false;
  boarded = id;
  ride.boardedSeat = 0;
  const hud = typeof document !== 'undefined' ? document.getElementById('ride-hud-now') : null;
  if (hud) hud.textContent = 'Riding ' + (labels.get(id) || id);
  return true;
}

export function exitRide() {
  boarded = null;
  const hud = typeof document !== 'undefined' ? document.getElementById('ride-hud-now') : null;
  if (hud) hud.textContent = 'Walk';
}

export function currentRide() {
  return boarded;
}

export function applyRideCam(camera) {
  if (!boarded || !camera) return false;
  const ride = getRide(boarded);
  if (!ride) return false;
  if (ride.kind === 'path' && ride.lead && ride.lead.p) {
    const pose = ride.lead;
    const shake = Math.sin(ride.clock * 42) * 0.018 * Math.min(1.2, (ride.speed || 0) / 12);
    const px = pose.p.x + pose.up.x * 0.62 + pose.forward.x * 0.2;
    const py = pose.p.y + pose.up.y * 0.62 + pose.forward.y * 0.2 + shake;
    const pz = pose.p.z + pose.up.z * 0.62 + pose.forward.z * 0.2;
    camera.position.set(px, py, pz);
    camera.up.set(pose.up.x, pose.up.y, pose.up.z);
    camera.lookAt(
      pose.p.x + pose.forward.x * 9,
      pose.p.y + pose.forward.y * 9 + pose.up.y * 0.3,
      pose.p.z + pose.forward.z * 9,
    );
    return true;
  }
  if (typeof ride.eye === 'function') {
    const eye = ride.eye();
    if (!eye || !Number.isFinite(eye.x)) return false;
    camera.position.set(eye.x, eye.y, eye.z);
    camera.up.set(eye.ux || 0, eye.uy == null ? 1 : eye.uy, eye.uz || 0);
    camera.lookAt(eye.x + eye.lx * 8, eye.y + eye.ly * 8, eye.z + eye.lz * 8);
    return true;
  }
  return false;
}

export function mountRideHud(entries) {
  if (typeof document === 'undefined' || document.getElementById('ride-hud')) return;
  const wrap = document.createElement('div');
  wrap.id = 'ride-hud';
  wrap.style.cssText = 'position:fixed;right:12px;top:96px;z-index:4;display:flex;flex-direction:column;gap:4px;max-height:46vh;overflow:auto;font:11px/1.3 sans-serif;';
  const now = document.createElement('div');
  now.id = 'ride-hud-now';
  now.textContent = 'Walk';
  now.style.cssText = 'color:#f4efe6;background:rgba(18,16,14,.72);padding:4px 8px;border-radius:8px;';
  wrap.appendChild(now);
  for (const entry of entries) {
    labels.set(entry.id, entry.name || entry.id);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = entry.name || entry.id;
    btn.style.cssText = 'appearance:none;border:1px solid rgba(201,180,138,.45);background:rgba(40,32,24,.72);color:#f4efe6;padding:5px 8px;border-radius:999px;text-align:left;';
    btn.addEventListener('click', () => boardRide(entry.id));
    wrap.appendChild(btn);
  }
  document.body.appendChild(wrap);
  window.addEventListener('keydown', (ev) => {
    if (ev.code === 'Escape') exitRide();
  });
}

export function hudIds() {
  return rideIds();
}
