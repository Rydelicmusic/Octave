/** Berms and terrace pads. A few solids, not a second planet. */
import { sampleHeight } from './height.js';
import { WAYPOINTS } from '../npc/nav.js';

export const BERMS = [
  { id: 'block-terrace', x: -150, z: 10, w: 70, d: 46, lift: 0.5 },
  { id: 'block-pad', x: -190, z: 40, w: 36, d: 24, lift: 0.35 },
  { id: 'hours-pocket', x: -40, z: -150, w: 50, d: 28, lift: -0.25 },
  { id: 'hours-berm', x: 40, z: -155, w: 34, d: 18, lift: 0.85 },
  { id: 'board-deck', x: 165, z: -10, w: 64, d: 36, lift: 0.7 },
  { id: 'board-edge', x: 210, z: 40, w: 28, d: 16, lift: 0.4 },
  { id: 'pocket-berm', x: 70, z: 140, w: 40, d: 22, lift: 0.4 },
  { id: 'pocket-family', x: 100, z: 120, w: 24, d: 16, lift: 0.25 },
];

function bermY(spec) {
  return sampleHeight(spec.x, spec.z) + spec.lift;
}

export function mountGround(THREE, scene) {
  if (!THREE || !scene || scene.getObjectByName('park-berms')) return null;
  const root = new THREE.Group();
  root.name = 'park-berms';
  const dirt = new THREE.MeshLambertMaterial({ color: 0x3e4a32 });
  const deck = new THREE.MeshLambertMaterial({ color: 0x8a7352 });
  const stone = new THREE.MeshLambertMaterial({ color: 0x6a6458 });
  for (const spec of BERMS) {
    const y = bermY(spec);
    const mat = spec.id.startsWith('board') ? deck : spec.lift < 0 ? stone : dirt;
    const box = new THREE.Mesh(new THREE.BoxGeometry(spec.w, Math.max(0.25, Math.abs(y) + 0.2), spec.d), mat);
    box.position.set(spec.x, y / 2, spec.z);
    box.name = spec.id;
    root.add(box);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(spec.w + 0.4, 0.35, 0.35), stone);
    wall.position.set(spec.x, Math.max(0.15, y), spec.z + spec.d / 2);
    root.add(wall);
  }
  const pathMat = new THREE.MeshLambertMaterial({ color: 0x5c5348 });
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const a = WAYPOINTS[i];
    const b = WAYPOINTS[i + 1];
    if (a.land !== b.land) continue;
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    if (len < 2 || len > 40) continue;
    const y = sampleHeight((a.x + b.x) / 2, (a.z + b.z) / 2);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, len), pathMat);
    strip.position.set((a.x + b.x) / 2, y + 0.05, (a.z + b.z) / 2);
    strip.rotation.y = Math.atan2(dx, dz);
    strip.name = 'grade-path';
    root.add(strip);
  }
  const trunk = new THREE.MeshLambertMaterial({ color: 0x3a2a1c });
  const leaf = new THREE.MeshLambertMaterial({ color: 0x2f4a30 });
  const trees = [
    [-210, 70], [-80, -120], [120, -40], [40, 160], [-140, -60], [230, -20],
  ];
  for (const [x, z] of trees) {
    const y = sampleHeight(x, z);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 2.2, 6), trunk);
    stem.position.set(x, y + 1.1, z);
    const top = new THREE.Mesh(new THREE.SphereGeometry(1.5, 7, 6), leaf);
    top.position.set(x, y + 2.8, z);
    root.add(stem, top);
  }
  scene.add(root);
  return root;
}
