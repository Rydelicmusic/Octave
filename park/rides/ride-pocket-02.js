/** The Pocket EP pavilion. G1,3 / x 40 z 80 / 12 × 8 m. Off rings. Queue 4 m toward pocket-drive. */
import { claim, whyBlocked } from '../occupy.js';
import { occupiesSpine, inCanopy, nearRing } from '../lock.js';
import { addSkuKit } from '../sku-kit.js';

export const RIDE = {
  id: 'ride-pocket-02',
  land: 'The Pocket',
  sku: 'pavilion',
  name: 'Pocket EP',
  x: 40, z: 80, w: 12, d: 8, h: 4.9,
  yaw: Math.PI / 2,
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

export function addRidePocket02(THREE, scene) {
  if (!claimRide()) return null;
  return addSkuKit(THREE, scene, RIDE);
}
