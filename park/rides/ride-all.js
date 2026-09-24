/** Mount every ride into the scene index.html already renders. One tick, the existing frame. */
import { mountAttractions } from './attractions.js';
import { tickMotion } from './ride-runtime.js';

let mounted = false;
let tries = 0;

export function tickRideAll(now) {
  const t = typeof now === 'number' ? now : (typeof performance !== 'undefined' ? performance.now() : 0);
  tickMotion(t);
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
  } catch (err) {
    console.warn('ride-all', err);
  }
}

export function mountRideAll() {
  if (typeof window === 'undefined') return;
  const attach = () => {
    const prev = window.__tickRides;
    if (prev && prev.__rideAll) return;
    const wrapped = () => {
      mountNow();
      if (typeof prev === 'function') prev();
      else tickRideAll();
    };
    wrapped.__rideAll = true;
    window.__tickRides = wrapped;
  };
  queueMicrotask(attach);
}
