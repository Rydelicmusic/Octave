/** Ground guests. Instanced. Riders on the trains are a different pool. */
import { legalWaypoints, pointLegal } from './nav.js';
import { roleFor } from './roles.js';
import { sampleHeight } from '../terrain/height.js';

export const NPC_CAP = 56;

const npcs = [];
let npcMesh = null;

export function resetNpcs() {
  npcs.length = 0;
}

export function npcList() {
  return npcs;
}

export function bootNpcs(n = NPC_CAP) {
  const points = legalWaypoints();
  npcs.length = 0;
  const count = Math.max(0, Math.min(NPC_CAP, n));
  if (!points.length) return npcs;
  for (let i = 0; i < count; i++) {
    const at = points[i % points.length];
    npcs.push({
      id: 'npc-' + i,
      role: roleFor(i),
      x: at.x,
      z: at.z,
      land: at.land,
      leg: (i + 1) % points.length,
      mode: roleFor(i) === 'watch' || roleFor(i) === 'attendant' ? 'watch' : 'walk',
    });
  }
  return npcs;
}

export function stepNpcs(dt) {
  const points = legalWaypoints();
  if (!points.length) return npcs;
  const step = Math.max(0, Math.min(0.12, dt || 0));
  for (const npc of npcs) {
    if (npc.mode !== 'walk') continue;
    const target = points[npc.leg % points.length];
    if (target.land !== npc.land) {
      npc.leg = (npc.leg + 1) % points.length;
      continue;
    }
    const dx = target.x - npc.x;
    const dz = target.z - npc.z;
    const dist = Math.hypot(dx, dz) || 1;
    const move = Math.min(dist, 1.2 * step);
    const nx = npc.x + (dx / dist) * move;
    const nz = npc.z + (dz / dist) * move;
    if (!Number.isFinite(nx) || !Number.isFinite(nz) || !pointLegal({ x: nx, z: nz })) {
      npc.leg = (npc.leg + 1) % points.length;
      continue;
    }
    npc.x = nx;
    npc.z = nz;
    if (dist < 0.8) npc.leg = (npc.leg + 1) % points.length;
  }
  return npcs;
}

export function mountNpcs(THREE, scene) {
  if (!THREE || !scene || scene.getObjectByName('park-npcs')) return null;
  bootNpcs(NPC_CAP);
  const geo = new THREE.BoxGeometry(0.42, 1.5, 0.3);
  const mat = new THREE.MeshLambertMaterial({ color: 0xd7c4a4 });
  const mesh = new THREE.InstancedMesh(geo, mat, NPC_CAP);
  mesh.name = 'park-npcs';
  mesh.userData.dummy = new THREE.Object3D();
  npcMesh = mesh;
  scene.add(mesh);
  layoutNpcs(mesh);
  return mesh;
}

export function layoutNpcMesh() {
  if (npcMesh) layoutNpcs(npcMesh);
}

export function layoutNpcs(mesh) {
  if (!mesh) return;
  const dummy = mesh.userData.dummy;
  const list = npcList();
  for (let i = 0; i < NPC_CAP; i++) {
    const npc = list[i];
    if (!npc) {
      dummy.position.set(0, -8, 0);
      dummy.scale.set(0.001, 0.001, 0.001);
    } else {
      dummy.position.set(npc.x, sampleHeight(npc.x, npc.z) + 0.75, npc.z);
      dummy.scale.set(1, 1, 1);
    }
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
}
