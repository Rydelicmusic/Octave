/** Park, not lakes. Strip every water disc; fill footprints with grass. Rings keep XZ. */
import { LOCK, inEllipse, MATERIALS } from './lock.js';
import { HUB_OUTER, inHubDisc } from './hub-clean.js';

export const DRY_FOOTPRINTS = LOCK.waters.map(([x, z, rx, rz]) => ({ x, z, rx, rz }));
export const RING_XZ = [
  { id: 'A', x: LOCK.rings.A.x, z: LOCK.rings.A.z, inner: LOCK.rings.A.inner, outer: LOCK.rings.A.outer },
  { id: 'B', x: LOCK.rings.B.x, z: LOCK.rings.B.z, inner: LOCK.rings.B.inner, outer: LOCK.rings.B.outer },
];

function worldXZ(obj) {
  obj.updateWorldMatrix(true, false);
  const e = obj.matrixWorld.elements;
  return [e[12], e[14]];
}

function inAnyWater(x, z, margin = 1.2) {
  return LOCK.waters.some(([cx, cz, rx, rz]) => inEllipse(x, z, cx, cz, rx + margin, rz + margin));
}

function atWaterCenter(x, z, tol = 3) {
  return LOCK.waters.some(([cx, cz]) => Math.hypot(x - cx, z - cz) < tol);
}

function atRideRing(x, z, tol = 2) {
  return RING_XZ.some((r) => Math.hypot(x - r.x, z - r.z) < tol);
}

function looksWaterMat(mat) {
  if (!mat) return false;
  if (mat.isMeshPhongMaterial) return true;
  const c = mat.color;
  if (!c) return false;
  return c.b > 0.32 && c.b >= c.g * 0.82 && c.b > c.r * 1.12;
}

function vertsHitWater(obj, THREE, pad, minFrac) {
  const g = obj.geometry;
  if (!g?.attributes?.position) return false;
  obj.updateWorldMatrix(true, false);
  const pos = g.attributes.position;
  const v = new THREE.Vector3();
  const step = Math.max(1, Math.floor(pos.count / 48));
  let hit = 0;
  let n = 0;
  let ax = 0;
  for (let i = 0; i < pos.count; i += step) {
    v.fromBufferAttribute(pos, i).applyMatrix4(obj.matrixWorld);
    n++;
    ax += Math.abs(v.x);
    if (inAnyWater(v.x, v.z, pad)) hit++;
  }
  if (!n) return false;
  if (ax / n < 12) return false;
  return hit / n >= minFrac;
}

function keep(obj) {
  if (!obj || obj.userData?.dryKeep || obj.userData?.hubKeep) return true;
  if (obj.isLight || obj.isCamera || obj.isScene) return true;
  if (obj.name === 'road-deck' || obj.name === 'road-curb') return true;
  if (obj.name === 'hub-inner-plaza' || obj.name === 'hub-outer-plaza' || obj.name === 'hub-outer-curb') return true;
  if (obj.geometry?.type === 'PlaneGeometry' && obj.geometry.parameters?.width > 200) return true;
  return false;
}

export function shouldStripWater(obj, THREE) {
  if (keep(obj)) return false;
  if (obj.name && String(obj.name).startsWith('block-water')) return true;
  const g = obj.geometry;
  const [x, z] = obj.isMesh || obj.isGroup ? worldXZ(obj) : [obj.position?.x || 0, obj.position?.z || 0];
  if (obj.isMesh && looksWaterMat(obj.material) && !atRideRing(x, z)) return true;
  if (obj.isMesh && g) {
    const t = g.type;
    if ((t === 'CircleGeometry' || t === 'RingGeometry') && atWaterCenter(x, z)) return true;
    if (t === 'CircleGeometry' && inAnyWater(x, z, 0.5) && obj.position.y > 0.4 && obj.position.y < 4) return true;
    if (t === 'BoxGeometry') {
      const p = g.parameters;
      if (p) {
        if (Math.abs(p.width - 0.5) < 0.02 && (Math.abs(p.height - 0.32) < 0.02 || Math.abs(p.height - 0.04) < 0.02) && inAnyWater(x, z, 2)) return true;
        if (p.height < 0.22 && inAnyWater(x, z, 8)) return true;
      }
    }
    if (t === 'PlaneGeometry' && pHeight(g) > 1.5 && inAnyWater(x, z, 2)) return true;
    if ((t === 'BufferGeometry' || t === 'TubeGeometry') && vertsHitWater(obj, THREE, 10, 0.34)) return true;
  }
  return false;
}

function pHeight(g) {
  return g.parameters?.height ?? 0;
}

function dryRingMaterial(obj, pathMat) {
  if (!obj.isMesh || !obj.material) return;
  const [x, z] = worldXZ(obj);
  if (!atRideRing(x, z)) return;
  if (obj.material.isMeshPhongMaterial || looksWaterMat(obj.material)) {
    obj.material = pathMat;
  }
}

function stripHubTrees(scene) {
  const dump = [];
  scene.traverse((o) => {
    if (!o.isGroup || o === scene) return;
    if (o.userData?.hubKeep || o.userData?.dryKeep) return;
    const [x, z] = worldXZ(o);
    if (inHubDisc(x, z, HUB_OUTER)) dump.push(o);
  });
  for (const o of dump) {
    if (o.parent) o.parent.remove(o);
  }
}

export function addDryPark(THREE, scene) {
  const dump = [];
  scene.traverse((o) => {
    if (o === scene) return;
    if (shouldStripWater(o, THREE)) dump.push(o);
  });
  for (const o of dump) {
    if (o.parent) o.parent.remove(o);
  }

  const grass = new THREE.MeshLambertMaterial({ color: MATERIALS.grass });
  const path = new THREE.MeshLambertMaterial({ color: MATERIALS['sand-path'] });
  scene.traverse((o) => dryRingMaterial(o, path));

  for (const { x, z, rx, rz } of DRY_FOOTPRINTS) {
    const pad = new THREE.Mesh(new THREE.CircleGeometry(1, 48), grass);
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(x, Math.hypot(x, z) < HUB_OUTER ? 0.03 : 0.04, z);
    pad.scale.set(rx, rz, 1);
    pad.userData.dryKeep = true;
    pad.name = 'dry-park-pad';
    scene.add(pad);
  }

  stripHubTrees(scene);
}
