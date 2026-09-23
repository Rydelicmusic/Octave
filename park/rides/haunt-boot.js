/** Starts ride motion + one haunt mount. Safe to import from seed-rides. */
import { tickMotion } from './attractions.js';

if (typeof window !== 'undefined' && !window.__PARK_MOTION_RAF) {
  window.__PARK_MOTION_RAF = true;
  let last = performance.now() / 1000;
  const loop = (nowMs) => {
    const now = nowMs / 1000;
    const dt = Math.min(0.05, Math.max(0, now - last));
    last = now;
    tickMotion(now, dt);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

export function bootHaunt(THREE, scene) {
  if (!scene || typeof window === 'undefined' || window.__HAUNT_SCENE) return;
  window.__HAUNT_SCENE = true;
  import('../halloween/haunt-scene.js').then((m) => m.addHauntScene(THREE, scene));
}
