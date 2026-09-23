/** The Block song kiosk. G-8,1 / x -187.5 z 37.5 / 6 × 4 m. Queue 4 m toward block-drive (z=0). */
import { claim, whyBlocked, lots } from '../occupy.js';
import { occupiesSpine, inCanopy } from '../lock.js';
import { addSkuKit } from '../sku-kit.js';
import { markRide } from './ride-mark.js';

export const RIDE = {
  id: 'ride-block-01',
  land: 'The Block',
  sku: 'kiosk',
  name: 'Block Song',
  x: -137.5, z: 112.5, w: 6, d: 4, h: 3.15,
  yaw: Math.PI,
  queueL: 4,
  queueW: 2.2,
};

function massLot() {
  return {
    id: RIDE.id, kind: 'kiosk', layer: 'mass',
    x: RIDE.x, z: RIDE.z, w: RIDE.w, d: RIDE.d, h: RIDE.h,
    pad: 2, sku: 'kiosk', land: RIDE.land,
  };
}

function queueLot() {
  const front = RIDE.d / 2 + RIDE.queueL / 2;
  return {
    id: RIDE.id + '-queue', kind: 'path', layer: 'ground',
    x: RIDE.x + Math.sin(RIDE.yaw) * front,
    z: RIDE.z + Math.cos(RIDE.yaw) * front,
    w: RIDE.queueW, d: RIDE.queueL, h: 0.2, pad: 0.4,
  };
}

export function claimRide() {
  if (lots().some((c) => c.id === RIDE.id)) return true;
  if (!inCanopy(RIDE.x, RIDE.z, RIDE.land)) return false;
  if (occupiesSpine(RIDE.x, RIDE.z, Math.max(RIDE.w, RIDE.d) / 2)) return false;
  const lot = massLot();
  if (whyBlocked(lot).length) return false;
  if (!claim(lot)) return false;
  const q = queueLot();
  if (!whyBlocked(q).length) claim(q);
  return true;
}

export function addRideBlock01(THREE, scene) {
  if (typeof window !== 'undefined') {
    window.__parkTHREE = THREE;
    if (scene && scene.isScene) window.__parkScene = scene;
  }
  if (!claimRide()) return null;
  const g = addSkuKit(THREE, scene, RIDE);
  return markRide(THREE, scene, RIDE, g);
}
