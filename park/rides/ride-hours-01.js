/** After Hours song kiosk. G-2,-7 / x -36 z -175 / 6 × 4 m. G0,-7 hit spine; next free in land. Queue 4 m toward hours-drive. */
import { claim, whyBlocked, lots } from '../occupy.js';
import { occupiesSpine, inCanopy } from '../lock.js';
import { addSkuKit } from '../sku-kit.js';
import { markRide } from './ride-mark.js';

export const RIDE = {
  id: 'ride-hours-01',
  land: 'After Hours',
  sku: 'kiosk',
  name: 'Hours Song',
  x: -36, z: -175, w: 6, d: 4, h: 3.15,
  yaw: Math.PI / 2,
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

export function addRideHours01(THREE, scene) {
  if (!claimRide()) return null;
  const g = addSkuKit(THREE, scene, RIDE);
  return markRide(THREE, scene, RIDE, g);
}
