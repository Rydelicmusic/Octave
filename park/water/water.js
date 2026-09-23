/** Designed basins. One shape each. Not the old concentric lakes. */
import { LOCK, occupiesSpine, inEllipse } from '../lock.js';

export const BASINS = [
  { id: 'board-lagoon', kind: 'lagoon', land: 'The Board', x: 238, z: 72, rx: 22, rz: 12, y: -0.15 },
  { id: 'plaza-fountain', kind: 'fountain', land: 'The Block', x: -118, z: 62, rx: 4.2, rz: 4.2, y: 0.35 },
  { id: 'hours-canal', kind: 'canal', land: 'After Hours', x: -36, z: -178, rx: 5.5, rz: 1.1, y: 0.08 },
  { id: 'pocket-pool', kind: 'pool', land: 'The Pocket', x: 52, z: 158, rx: 7, rz: 4.2, y: 0.05 },
  { id: 'block-dive-splash', kind: 'splash', land: 'The Block', x: -148, z: 78, rx: 11, rz: 6.5, y: -0.2 },
];

export function pocketPools() {
  return BASINS.filter((b) => b.land === 'The Pocket');
}

export function blocksWalk(x, z) {
  return BASINS.some((b) => inEllipse(x, z, b.x, b.z, b.rx, b.rz));
}

export function waterHitsHubOrSpine() {
  const hits = [];
  for (const b of BASINS) {
    const samples = 12;
    for (let i = 0; i < samples; i++) {
      const a = (i / samples) * Math.PI * 2;
      const x = b.x + Math.cos(a) * b.rx;
      const z = b.z + Math.sin(a) * b.rz;
      if (Math.hypot(x, z) < LOCK.hubOuter) hits.push(b.id + ' hub');
      if (occupiesSpine(x, z, 0)) hits.push(b.id + ' spine');
    }
    if (Math.hypot(b.x, b.z) < LOCK.hubOuter) hits.push(b.id + ' center hub');
    if (occupiesSpine(b.x, b.z, 0)) hits.push(b.id + ' center spine');
  }
  return hits;
}

if (typeof window !== 'undefined') window.__blockWalk = blocksWalk;

let cheapWater = false;

export function setWaterCheap(on) {
  cheapWater = !!on;
  return cheapWater;
}

export function waterIsCheap() {
  return cheapWater;
}

function ripple(mesh, time) {
  const pos = mesh.geometry.attributes.position;
  const base = mesh.userData.base;
  if (!base) return;
  for (let i = 0; i < pos.count; i++) {
    const x = base[i * 3];
    const z = base[i * 3 + 2];
    pos.setY(i, base[i * 3 + 1] + Math.sin(time * 0.8 + x * 0.35 + z * 0.2) * 0.05);
  }
  pos.needsUpdate = true;
}

export function mountWater(THREE, scene) {
  if (!THREE || !scene || scene.getObjectByName('park-water')) return null;
  const root = new THREE.Group();
  root.name = 'park-water';
  root.userData.hubKeep = true;
  root.userData.dryKeep = true;
  root.userData.tidyKeep = true;
  const surfaces = [];
  for (const b of BASINS) {
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(b.rx * 2, b.rz * 2, 8, 6),
      new THREE.MeshLambertMaterial({ color: b.kind === 'fountain' ? 0x7eb8c8 : 0x2a5a62, emissive: 0x123840, emissiveIntensity: 0.25 }),
    );
    water.geometry.rotateX(-Math.PI / 2);
    water.position.set(b.x, b.y, b.z);
    water.name = 'water-surface-' + b.id;
    water.userData.hubKeep = true;
    water.userData.dryKeep = true;
    water.userData.tidyKeep = true;
    const attr = water.geometry.attributes.position;
    water.userData.base = new Float32Array(attr.array);
    root.add(water);
    surfaces.push(water);
    const cope = new THREE.Mesh(
      new THREE.BoxGeometry(b.rx * 2 + 0.8, 0.45, b.rz * 2 + 0.8),
      new THREE.MeshLambertMaterial({ color: 0xcfc6b4 }),
    );
    cope.position.set(b.x, b.y - 0.05, b.z);
    cope.name = 'coping-' + b.id;
    cope.userData.hubKeep = true;
    cope.userData.dryKeep = true;
    cope.userData.tidyKeep = true;
    const inner = new THREE.Mesh(
      new THREE.BoxGeometry(b.rx * 2 - 0.3, 0.5, b.rz * 2 - 0.3),
      new THREE.MeshLambertMaterial({ color: 0x1a3034 }),
    );
    inner.position.set(b.x, b.y - 0.35, b.z);
    inner.name = 'basin-floor-' + b.id;
    inner.userData.hubKeep = true;
    inner.userData.dryKeep = true;
    inner.userData.tidyKeep = true;
    root.add(cope, inner);
    if (b.kind === 'fountain') {
      const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 1.4, 8), new THREE.MeshLambertMaterial({ color: 0xd5eef2, emissive: 0x9ad0dc, emissiveIntensity: 0.4 }));
      jet.position.set(b.x, b.y + 0.9, b.z);
      jet.name = 'fountain-jet';
      root.add(jet);
    }
  }
  root.userData.tick = (t) => { if (cheapWater) return; for (const mesh of surfaces) ripple(mesh, t); };
  scene.add(root);
  if (typeof window !== 'undefined') {
    window.__tickWater = (t) => root.userData.tick(t || 0);
  }
  return root;
}
