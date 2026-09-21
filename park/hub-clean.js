/** Hub disc only: inner plaza r18, outer curb r32, ±Z spine gaps. No extra rings. */
import { LOCK, occupiesSpine, BUILDINGS, STATIONS } from './lock.js';
import { ROAD_W, ROAD_H, CURB_W, CURB_H } from './roads.js';

export const HUB_INNER = LOCK.hubInner; // 18
export const HUB_OUTER = LOCK.hubOuter; // 32
export const HUB_CURB_T = 0.55;
export const HUB_CURB_H = 0.48;
export const HUB_SLAB = 0.28;

const SPINE_HALF = LOCK.spineWidth / 2;
const GAP = Math.asin((SPINE_HALF + 0.4) / HUB_OUTER);

/** Land drives meet the r32 curb here. They do not enter the disc. */
export const HUB_T_JUNCTIONS = [
  { land: 'The Block', x: -HUB_OUTER, z: 0 },
  { land: 'The Board', x: HUB_OUTER, z: 0 },
  { land: 'After Hours', x: -18, z: -Math.sqrt(HUB_OUTER * HUB_OUTER - 18 * 18) },
  { land: 'The Pocket', x: 18, z: Math.sqrt(HUB_OUTER * HUB_OUTER - 18 * 18) },
];

export function inHubDisc(x, z, r = HUB_OUTER) {
  return Math.hypot(x, z) < r;
}

function xzH(obj) {
  obj.updateWorldMatrix(true, false);
  const e = obj.matrixWorld.elements;
  return Math.hypot(e[12], e[14]);
}

function geomParams(obj) {
  return obj.geometry?.parameters || null;
}

function isWater(obj) {
  if (obj.material?.isMeshPhongMaterial) return true;
  const g = obj.geometry;
  if (!g) return false;
  if ((g.type === 'CircleGeometry' || g.type === 'RingGeometry') && obj.scale.x > 4) return true;
  const p = g.parameters;
  if (g.type === 'BoxGeometry' && p) {
    if (Math.abs(p.width - 0.5) < 0.02 && (Math.abs(p.height - 0.32) < 0.02 || Math.abs(p.height - 0.04) < 0.02)) return true;
  }
  return false;
}

function isSpineRibbon(obj, THREE) {
  if (!obj.geometry) return false;
  const t = obj.geometry.type;
  if (t !== 'BufferGeometry' && t !== 'TubeGeometry') return false;
  const box = new THREE.Box3().setFromObject(obj);
  const cx = (box.min.x + box.max.x) / 2;
  const sx = box.max.x - box.min.x;
  const sz = box.max.z - box.min.z;
  return sz > 40 && Math.abs(cx) < 12 && sx < 22;
}

function isGroundPlane(obj) {
  const p = geomParams(obj);
  return obj.geometry?.type === 'PlaneGeometry' && p && p.width > 200;
}

function isPlazaCore(obj, THREE) {
  const g = obj.geometry;
  if (!g) return false;
  const p = g.parameters;
  if (g.type === 'RingGeometry' && p) {
    if (Math.abs(p.innerRadius - HUB_INNER) < 0.05 && Math.abs(p.outerRadius - HUB_OUTER) < 0.05) return true;
    if (Math.abs(p.outerRadius - HUB_INNER) < 0.05 && p.innerRadius > 17 && p.innerRadius < HUB_INNER) return true;
  }
  if (g.type === 'CylinderGeometry' && p && p.radiusTop > 16 && p.radiusTop < 18.2) return true;
  if ((g.type === 'ExtrudeGeometry' || g.type === 'ShapeGeometry') && xzH(obj) < 1.2) {
    const box = new THREE.Box3().setFromObject(obj);
    const ext = Math.max(box.max.x - box.min.x, box.max.z - box.min.z);
    if (ext > 28) return true;
  }
  return false;
}

function isHubRingRoad(obj) {
  if (obj.name !== 'road-deck' && obj.name !== 'road-curb') return false;
  const x = obj.position.x;
  const z = obj.position.z;
  const r = Math.hypot(x, z);
  if (r < 30 || r > 64) return false;
  const yaw = obj.rotation.y;
  const fx = Math.sin(yaw);
  const fz = Math.cos(yaw);
  const radial = Math.abs(x * fx + z * fz) / (r || 1);
  return radial < 0.5;
}

function isSkuOnPlaza(obj) {
  if (!obj.isGroup) return false;
  const hits = [...BUILDINGS, ...STATIONS];
  for (const p of hits) {
    if (Math.abs(obj.position.x - p.x) < 0.05 && Math.abs(obj.position.z - p.z) < 0.05) {
      return inHubDisc(p.x, p.z);
    }
  }
  return false;
}

export function shouldStripHubExtra(obj, THREE) {
  if (!obj || obj.userData?.hubKeep) return false;
  if (obj.isCamera || obj.isScene) return false;
  if (obj.isHemisphereLight || obj.isAmbientLight || obj.isDirectionalLight) return false;
  if (obj.isPointLight) return xzH(obj) < HUB_OUTER && obj.position.y < 12;
  if (isGroundPlane(obj)) return false;
  if (isWater(obj)) return false;
  if (isSpineRibbon(obj, THREE)) return false;
  if (isPlazaCore(obj, THREE)) return false;
  if (isHubRingRoad(obj)) return true;
  if (obj.name === 'road-deck' || obj.name === 'road-curb') {
    return inHubDisc(obj.position.x, obj.position.z, HUB_OUTER + 0.2);
  }
  if (obj.isGroup) {
    if (isSkuOnPlaza(obj)) return true;
    return xzH(obj) < HUB_OUTER;
  }
  if (obj.isMesh) return xzH(obj) < HUB_OUTER && !isPlazaCore(obj, THREE);
  return false;
}

function arcCurb(THREE, scene, a0, a1, mat) {
  const innerR = HUB_OUTER;
  const outerR = HUB_OUTER + HUB_CURB_T;
  const shape = new THREE.Shape();
  const n = Math.max(10, Math.ceil(((a1 - a0) / (Math.PI * 2)) * 72));
  for (let i = 0; i <= n; i++) {
    const a = a0 + (a1 - a0) * i / n;
    const x = Math.cos(a) * outerR;
    const y = Math.sin(a) * outerR;
    i ? shape.lineTo(x, y) : shape.moveTo(x, y);
  }
  for (let i = n; i >= 0; i--) {
    const a = a0 + (a1 - a0) * i / n;
    shape.lineTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
  }
  shape.closePath();
  const mesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: HUB_CURB_H, bevelEnabled: false }),
    mat,
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = HUB_SLAB;
  mesh.userData.hubKeep = true;
  mesh.name = 'hub-outer-curb';
  scene.add(mesh);
}

function addTJunction(THREE, scene, t, asphalt, curb) {
  if (occupiesSpine(t.x, t.z, ROAD_W / 2)) return;
  const r = Math.hypot(t.x, t.z) || 1;
  const ux = t.x / r;
  const uz = t.z / r;
  const len = 9;
  const mx = ux * (HUB_OUTER + len / 2);
  const mz = uz * (HUB_OUTER + len / 2);
  const yaw = Math.atan2(ux, uz);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(ROAD_W, ROAD_H, len), asphalt);
  deck.position.set(mx, ROAD_H / 2, mz);
  deck.rotation.y = yaw;
  deck.name = 'road-deck';
  deck.userData.hubKeep = true;
  scene.add(deck);
  const off = ROAD_W / 2 + CURB_W / 2;
  for (const side of [-1, 1]) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(CURB_W, CURB_H, len), curb);
    c.position.set(mx + Math.cos(yaw) * side * off, CURB_H / 2, mz - Math.sin(yaw) * side * off);
    c.rotation.y = yaw;
    c.name = 'road-curb';
    c.userData.hubKeep = true;
    scene.add(c);
  }
}

export function addHubClean(THREE, scene) {
  const dump = [];
  scene.traverse((o) => {
    if (o === scene) return;
    if (shouldStripHubExtra(o, THREE)) dump.push(o);
  });
  for (const o of dump) {
    if (o.parent) o.parent.remove(o);
  }

  const concrete = new THREE.MeshLambertMaterial({ color: 0xb9b3a8 });
  const curbMat = new THREE.MeshLambertMaterial({ color: 0x5a4630 });
  const asphalt = new THREE.MeshLambertMaterial({ color: 0x3e3e42 });

  const inner = new THREE.Mesh(new THREE.CylinderGeometry(HUB_INNER, HUB_INNER, 0.22, 64), concrete);
  inner.position.y = 0.11;
  inner.userData.hubKeep = true;
  inner.name = 'hub-inner-plaza';
  scene.add(inner);

  const deck = new THREE.Mesh(new THREE.RingGeometry(HUB_INNER, HUB_OUTER, 72), concrete);
  deck.rotation.x = -Math.PI / 2;
  deck.position.y = HUB_SLAB + 0.04;
  deck.userData.hubKeep = true;
  deck.name = 'hub-outer-plaza';
  scene.add(deck);

  const segs = [
    [Math.PI / 2 + GAP, Math.PI * 3 / 2 - GAP],
    [Math.PI * 3 / 2 + GAP, Math.PI * 2 + Math.PI / 2 - GAP],
  ];
  for (const [a0, a1] of segs) arcCurb(THREE, scene, a0, a1, curbMat);

  for (const t of HUB_T_JUNCTIONS) addTJunction(THREE, scene, t, asphalt, curbMat);
}
