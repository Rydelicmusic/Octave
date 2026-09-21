/** Hub ring + 9 m land drives. XZ from LAYOUT; not a second 14 m spine. */
import { LOCK, occupiesSpine, nearRing, BUILDINGS, STATIONS } from './lock.js';

export const ROAD_W = 9;
export const ROAD_DECK = 0.28;
export const ROAD_H = 0.28;
export const CURB_W = 0.45;
export const CURB_H = 0.48;
export const HUB_RING_R = LOCK.hubOuter; // 32 m plaza lip
export const RING_SEGS = 96;

export const LAND_DRIVES = [
  { id: 'block-drive', land: 'The Block', pts: [[-36.5, 0], [-55, -28], [-90, -48], [-130, -55]] },
  { id: 'board-drive', land: 'The Board', pts: [[36.5, 0], [80, 6], [125, 10], [175, 12]] },
  { id: 'hours-drive', land: 'After Hours', pts: [[-18, -36], [-48, -80], [-48, -140], [-30, -165]] },
  { id: 'pocket-drive', land: 'The Pocket', pts: [[18, 36], [32, 48], [48, 64], [60, 78]] },
];

export function roadOk(x, z, half = ROAD_W / 2) {
  if (occupiesSpine(x, z, half)) return false;
  if (nearRing(x, z, 8)) return false;
  return true;
}

export function roadGradeY() {
  return ROAD_DECK;
}

/** Inner lip on r32; skip 14 m spine openings. No weave, no dead ends in grass. */
export function hubRingPoints(n = RING_SEGS) {
  const r0 = HUB_RING_R + ROAD_W / 2;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = Math.cos(a) * r0;
    const z = Math.sin(a) * r0;
    if (occupiesSpine(x, z, ROAD_W / 2) || nearRing(x, z, 8)) pts.push(null);
    else pts.push([x, z]);
  }
  return pts;
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

function addSeg(THREE, scene, x0, z0, x1, z1, asphalt, curb, overlap = 1.06) {
  const mx = (x0 + x1) / 2;
  const mz = (z0 + z1) / 2;
  if (!roadOk(mx, mz)) return;
  const len = Math.hypot(x1 - x0, z1 - z0);
  if (len < 0.5) return;
  const yaw = Math.atan2(x1 - x0, z1 - z0);
  addDeck(THREE, scene, ROAD_W, len * overlap, mx, mz, yaw, asphalt, curb);
}

function addPolylineRoad(THREE, scene, pts, asphalt, curb) {
  for (let i = 0; i < pts.length - 1; i++) {
    addSeg(THREE, scene, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], asphalt, curb);
  }
}

export function addParkRoads(THREE, scene) {
  const asphalt = new THREE.MeshLambertMaterial({ color: 0x3e3e42 });
  const curb = new THREE.MeshLambertMaterial({ color: 0x5a4630 });
  const ring = hubRingPoints();
  const n = ring.length;
  for (let i = 0; i < n; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % n];
    if (!a || !b) continue;
    addSeg(THREE, scene, a[0], a[1], b[0], b[1], asphalt, curb, 1.14);
  }
  for (const d of LAND_DRIVES) addPolylineRoad(THREE, scene, d.pts, asphalt, curb);
  const onGrade = [...BUILDINGS, ...STATIONS];
  scene.traverse((o) => {
    if (!o.isGroup) return;
    for (const p of onGrade) {
      if (Math.abs(o.position.x - p.x) < 0.05 && Math.abs(o.position.z - p.z) < 0.05) {
        o.position.y = ROAD_DECK;
      }
    }
  });
}
