/** The Pocket song kiosk. G2,2 / x 70 z 50 / 6 × 4 m. Off rings. Queue 4 m toward pocket-drive (x=60). */
import { claim, whyBlocked } from '../occupy.js';
import { occupiesSpine, inCanopy, nearRing } from '../lock.js';
import { addSkuKit } from '../sku-kit.js';

export const RIDE = {
  id: 'ride-pocket-01',
  land: 'The Pocket',
  sku: 'kiosk',
  name: 'Pocket Song',
  x: 70, z: 50, w: 6, d: 4, h: 3.15,
  yaw: -Math.PI / 2,
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
  if (!inCanopy(RIDE.x, RIDE.z, RIDE.land)) return false;
  if (occupiesSpine(RIDE.x, RIDE.z, Math.max(RIDE.w, RIDE.d) / 2)) return false;
  if (nearRing(RIDE.x, RIDE.z, 10)) return false;
  const lot = massLot();
  if (whyBlocked(lot).length) return false;
  if (!claim(lot)) return false;
  const q = queueLot();
  if (!whyBlocked(q).length) claim(q);
  return true;
}

export function addRidePocket01(THREE, scene) {
  if (!claimRide()) return null;
  return addSkuKit(THREE, scene, RIDE);
}
