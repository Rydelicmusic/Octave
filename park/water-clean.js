/** The Block water: one pool + one coping per locked ellipse. No flower, no road through. */
import {
  LOCK, inEllipse, inCanopy, inWater, occupiesSpine, waterCopingSegments, GROUNDS_SCALE,
} from './lock.js';
import { ROAD_W, ROAD_H, CURB_W, CURB_H, LAND_DRIVES } from './roads.js';

export const BERM_M = 4;
export const BLOCK_WATERS = LOCK.waters.filter(([x, z]) => inCanopy(x, z, 'The Block'));

/** South around the Block cluster; T off hub r32. 4 m berm + 9 m half-width clear of water. */
export const BLOCK_DRIVE_AROUND = [
  [-41, 0],
  [-52, 0],
  [-52, -80],
  [-52, -125],
  [-100, -128],
  [-140, -110],
];

export function inBlockWater(x, z, margin = 0) {
  return BLOCK_WATERS.some(([cx, cz, rx, rz]) => inEllipse(x, z, cx, cz, rx + margin, rz + margin));
}

export function roadClearsBlockWater(x, z, half = ROAD_W / 2) {
  if (occupiesSpine(x, z, half)) return false;
  if (inBlockWater(x, z, BERM_M + half)) return false;
  if (inWater(x, z, BERM_M + half)) return false;
  return true;
}

function worldXZ(obj) {
  obj.updateWorldMatrix(true, false);
  const e = obj.matrixWorld.elements;
  return [e[12], e[14]];
}

function atBlockCenter(obj, tol = 2.5) {
  const [x, z] = worldXZ(obj);
  return BLOCK_WATERS.some(([cx, cz]) => Math.hypot(x - cx, z - cz) < tol);
}

function vertsHitBlock(obj, THREE, pad, minFrac) {
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
    ax += v.x;
    if (inBlockWater(v.x, v.z, pad)) hit++;
  }
  if (!n) return false;
  return hit / n >= minFrac && ax / n < -40;
}

function isOldBlockDrive(obj) {
  if (obj.name !== 'road-deck' && obj.name !== 'road-curb') return false;
  const [x, z] = worldXZ(obj);
  if (inBlockWater(x, z, BERM_M)) return true;
  const d = LAND_DRIVES.find((r) => r.id === 'block-drive');
  if (!d) return false;
  for (let i = 0; i < d.pts.length - 1; i++) {
    const mx = (d.pts[i][0] + d.pts[i + 1][0]) / 2;
    const mz = (d.pts[i][1] + d.pts[i + 1][1]) / 2;
    if (Math.hypot(x - mx, z - mz) < 10) return true;
  }
  return false;
}

export function shouldStripBlockWaterExtra(obj, THREE) {
  if (!obj || obj.userData?.waterKeep || obj.userData?.hubKeep) return false;
  if (obj.isLight || obj.isCamera || obj.isScene) return false;
  if (obj.geometry?.type === 'PlaneGeometry' && obj.geometry.parameters?.width > 200) return false;
  if (isOldBlockDrive(obj)) return true;
  const g = obj.geometry;
  if (!g) return false;
  const t = g.type;
  if ((t === 'CircleGeometry' || t === 'RingGeometry') && atBlockCenter(obj)) return true;
  if (t === 'BoxGeometry') {
    const p = g.parameters;
    const [x, z] = worldXZ(obj);
    if (!inBlockWater(x, z, 8)) return false;
    const h = p?.height ?? 9;
    if (h < 0.55) return true;
    return false;
  }
  if (t === 'BufferGeometry' || t === 'TubeGeometry') {
    return vertsHitBlock(obj, THREE, 10, 0.32);
  }
  return false;
}

function addDeck(THREE, scene, w, len, x, z, yaw, asphalt, curb) {
  const deck = new THREE.Mesh(new THREE.BoxGeometry(w, ROAD_H, len), asphalt);
  deck.position.set(x, ROAD_H / 2, z);
  deck.rotation.y = yaw;
  deck.name = 'road-deck';
  deck.userData.waterKeep = true;
  scene.add(deck);
  const off = w / 2 + CURB_W / 2;
  for (const side of [-1, 1]) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(CURB_W, CURB_H, len), curb);
    c.position.set(x + Math.cos(yaw) * side * off, CURB_H / 2, z - Math.sin(yaw) * side * off);
    c.rotation.y = yaw;
    c.name = 'road-curb';
    c.userData.waterKeep = true;
    scene.add(c);
  }
}

function addBlockDrive(THREE, scene, asphalt, curb) {
  const pts = BLOCK_DRIVE_AROUND;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i];
    const [x1, z1] = pts[i + 1];
    const mx = (x0 + x1) / 2;
    const mz = (z0 + z1) / 2;
    if (!roadClearsBlockWater(mx, mz)) continue;
    const len = Math.hypot(x1 - x0, z1 - z0);
    if (len < 0.5) continue;
    const yaw = Math.atan2(x1 - x0, z1 - z0);
    addDeck(THREE, scene, ROAD_W, len * 1.06, mx, mz, yaw, asphalt, curb);
  }
}

function addBlockPool(THREE, scene, cx, cz, rx, rz) {
  const earth = new THREE.MeshLambertMaterial({ color: 0x4a5a38 });
  const water = new THREE.MeshPhongMaterial({
    color: 0x1a5a6c, shininess: 80, specular: 0x66aacc,
  });
  const coping = new THREE.MeshLambertMaterial({ color: 0x5a4630 });

  const berm = new THREE.Mesh(new THREE.CircleGeometry(1, 64), earth);
  berm.rotation.x = -Math.PI / 2;
  berm.position.set(cx, 0.03, cz);
  berm.scale.set(rx + BERM_M, rz + BERM_M, 1);
  berm.userData.waterKeep = true;
  berm.name = 'block-water-berm';
  scene.add(berm);

  const pool = new THREE.Mesh(new THREE.CircleGeometry(1, 64), water);
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(cx, 0.07, cz);
  pool.scale.set(rx, rz, 1);
  pool.userData.waterKeep = true;
  pool.name = 'block-water-pool';
  scene.add(pool);

  const h = GROUNDS_SCALE.copingH;
  waterCopingSegments(cx, cz, rx, rz).forEach((s) => {
    const rim = new THREE.Mesh(new THREE.BoxGeometry(s.w, h, s.len * 1.12), coping);
    rim.position.set(s.x, h / 2, s.z);
    rim.rotation.y = s.rotY;
    rim.userData.waterKeep = true;
    rim.name = 'block-water-coping';
    scene.add(rim);
  });
}

export function addWaterClean(THREE, scene) {
  const dump = [];
  scene.traverse((o) => {
    if (o === scene) return;
    if (shouldStripBlockWaterExtra(o, THREE)) dump.push(o);
  });
  for (const o of dump) {
    if (o.parent) o.parent.remove(o);
  }
  for (const [cx, cz, rx, rz] of BLOCK_WATERS) addBlockPool(THREE, scene, cx, cz, rx, rz);
  const asphalt = new THREE.MeshLambertMaterial({ color: 0x3e3e42 });
  const curb = new THREE.MeshLambertMaterial({ color: 0x5a4630 });
  addBlockDrive(THREE, scene, asphalt, curb);
}
