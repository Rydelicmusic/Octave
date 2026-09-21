/** Hub ring + 9 m land drives. XZ from LAYOUT; not a second 14 m spine. */
import { LOCK, occupiesSpine, inWater, nearRing, PLACEMENTS } from './lock.js';

export const ROAD_W = 9;
export const ROAD_DECK = 0.28;
export const ROAD_H = 0.28;
export const CURB_W = 0.45;
export const CURB_H = 0.48;
export const HUB_RING_R = LOCK.hubOuter; // 32 m

export const LAND_DRIVES = [
  { id: 'block-drive', land: 'The Block', pts: [[-32, 0], [-50, -4], [-75, -8], [-100, -12]] },
  { id: 'board-drive', land: 'The Board', pts: [[32, 0], [70, 6], [100, 9], [125, 10]] },
  { id: 'hours-drive', land: 'After Hours', pts: [[-18, -32], [-18, -55], [-18, -85], [-18, -120]] },
  { id: 'pocket-drive', land: 'The Pocket', pts: [[18, 32], [32, 40], [48, 58], [60, 78]] },
];

export function roadOk(x, z, half = ROAD_W / 2) {
  if (occupiesSpine(x, z, half)) return false;
  if (inWater(x, z, 2.2)) return false;
  if (nearRing(x, z, 8)) return false;
  return true;
}

export function roadGradeY() {
  return ROAD_DECK;
}

function addDeck(THREE, scene, w, len, x, z, yaw, asphalt, curb) {
  const deck = new THREE.Mesh(new THREE.BoxGeometry(w, ROAD_H, len), asphalt);
  deck.position.set(x, ROAD_H / 2, z);
  deck.rotation.y = yaw;
  deck.name = 'road-deck';
  scene.add(deck);
  const off = w / 2 + CURB_W / 2;
  for (const side of [-1, 1]) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(CURB_W, CURB_H, len), curb);
    c.position.set(x + Math.cos(yaw) * side * off, CURB_H / 2, z - Math.sin(yaw) * side * off);
    c.rotation.y = yaw;
    c.name = 'road-curb';
    scene.add(c);
  }
}

function addPolylineRoad(THREE, scene, pts, asphalt, curb) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i];
    const [x1, z1] = pts[i + 1];
    const mx = (x0 + x1) / 2;
    const mz = (z0 + z1) / 2;
    if (!roadOk(mx, mz)) continue;
    const len = Math.hypot(x1 - x0, z1 - z0);
    if (len < 0.6) continue;
    const yaw = Math.atan2(x1 - x0, z1 - z0);
    addDeck(THREE, scene, ROAD_W, len * 1.04, mx, mz, yaw, asphalt, curb);
  }
}

export function addParkRoads(THREE, scene) {
  const asphalt = new THREE.MeshLambertMaterial({ color: 0x3e3e42 });
  const curb = new THREE.MeshLambertMaterial({ color: 0x5a4630 });
  const n = 72;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    const x0 = Math.cos(a0) * HUB_RING_R;
    const z0 = Math.sin(a0) * HUB_RING_R;
    const x1 = Math.cos(a1) * HUB_RING_R;
    const z1 = Math.sin(a1) * HUB_RING_R;
    const mx = (x0 + x1) / 2;
    const mz = (z0 + z1) / 2;
    if (!roadOk(mx, mz)) continue;
    const len = Math.hypot(x1 - x0, z1 - z0);
    const yaw = Math.atan2(x1 - x0, z1 - z0);
    addDeck(THREE, scene, ROAD_W, len * 1.12, mx, mz, yaw, asphalt, curb);
  }
  for (const d of LAND_DRIVES) addPolylineRoad(THREE, scene, d.pts, asphalt, curb);
  scene.traverse((o) => {
    if (!o.isGroup) return;
    for (const p of PLACEMENTS) {
      if (Math.abs(o.position.x - p.x) < 0.05 && Math.abs(o.position.z - p.z) < 0.05) {
        o.position.y = ROAD_DECK;
      }
    }
  });
}
