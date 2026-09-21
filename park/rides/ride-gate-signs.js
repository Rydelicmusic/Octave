/** Gate wayfinding. Off 14 m spine. G-1,8 / G0,8 / x ±24 z 210 / 1.2 × 0.35 m posts. */
import { claim, whyBlocked } from '../occupy.js';
import { occupiesSpine } from '../lock.js';

export const SIGNS = [
  { id: 'ride-gate-sign-west', x: -24, z: 210, w: 1.2, d: 0.35, h: 2.4 },
  { id: 'ride-gate-sign-east', x: 24, z: 210, w: 1.2, d: 0.35, h: 2.4 },
];

export function claimRide() {
  let n = 0;
  for (const s of SIGNS) {
    if (occupiesSpine(s.x, s.z, 1)) continue;
    const lot = { id: s.id, kind: 'prop', layer: 'prop', x: s.x, z: s.z, w: s.w, d: s.d, h: s.h, pad: 1.5 };
    if (whyBlocked(lot).length) continue;
    if (claim(lot)) n += 1;
  }
  return n === SIGNS.length;
}

export function addRideGateSigns(THREE, scene) {
  if (!claimRide()) return null;
  const g = new THREE.Group();
  const post = new THREE.MeshLambertMaterial({ color: 0x3d3428 });
  const blade = new THREE.MeshLambertMaterial({ color: 0xc9b48a });
  for (const s of SIGNS) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.16, s.h, 0.16), post);
    p.position.set(s.x, s.h / 2, s.z);
    const b = new THREE.Mesh(new THREE.BoxGeometry(s.w, 0.7, s.d), blade);
    b.position.set(s.x, s.h - 0.2, s.z);
    g.add(p, b);
  }
  scene.add(g);
  return g;
}
