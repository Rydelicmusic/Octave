/** Gate wayfinding. Off 14 m spine. G-1,8 / G0,8 / x ±24 z 210. */
import { claim, whyBlocked, lots } from '../occupy.js';
import { occupiesSpine } from '../lock.js';

export const SIGNS = [
  { id: 'ride-gate-sign-west', x: -24, z: 210, w: 1.2, d: 0.35, h: 2.4 },
  { id: 'ride-gate-sign-east', x: 24, z: 210, w: 1.2, d: 0.35, h: 2.4 },
];

export function claimRide() {
  if (SIGNS.every((s) => lots().some((c) => c.id === s.id))) return true;
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
  const post = new THREE.MeshLambertMaterial({ color: 0x1c1612 });
  const blade = new THREE.MeshLambertMaterial({ color: 0x4a1020, emissive: 0xff7a18, emissiveIntensity: 0.35 });
  const pump = new THREE.MeshLambertMaterial({ color: 0xd35412, emissive: 0xff7a18, emissiveIntensity: 0.55 });
  for (const s of SIGNS) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.18, s.h, 0.18), post);
    p.position.set(s.x, s.h / 2, s.z);
    const b = new THREE.Mesh(new THREE.BoxGeometry(s.w + 0.4, 0.8, 0.22), blade);
    b.position.set(s.x, s.h - 0.15, s.z);
    const jack = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.42, 10), pump);
    jack.position.set(s.x, 0.28, s.z + 0.55);
    g.add(p, b, jack);
  }
  scene.add(g);
  return g;
}
