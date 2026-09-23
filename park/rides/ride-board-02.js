/** The Board EP pavilion. G7,0 / x 187.5 z 14 / 12 × 8 m. Queue 4 m toward board-drive. */
import { claim, whyBlocked, lots } from '../occupy.js';
import { occupiesSpine, inCanopy } from '../lock.js';
import { addAttraction } from './attractions.js';
import { markRide } from './ride-mark.js';

export const RIDE = {
  id: 'ride-board-02',
  land: 'The Board',
  sku: 'pavilion',
  name: 'Bone Carousel',
  x: 187.5, z: 14, w: 12, d: 8, h: 4.9,
  yaw: Math.PI,
  queueL: 4,
  queueW: 3.2,
};

function massLot() {
  return {
    id: RIDE.id, kind: 'pavilion', layer: 'mass',
    x: RIDE.x, z: RIDE.z, w: RIDE.w, d: RIDE.d, h: RIDE.h,
    pad: 2, sku: 'pavilion', land: RIDE.land,
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

export function addRideBoard02(THREE, scene) {
  if (!claimRide()) return null;
  const g = addAttraction(THREE, scene, RIDE, 'carousel');
  return markRide(THREE, scene, RIDE, g);
}
