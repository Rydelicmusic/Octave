import { LOCK, inStadium, inCanopy, ITINERARY } from './lock-a1.js';

export const BUILDINGS = [
  { id: 'block-album', land: 'The Block', sku: 'album', name: 'Block Hall', x: -250, z: 48, w: 22, d: 14, h: 9.2, yaw: 0.18, body: 0x6a4030, trim: 0x3a2418 },
  { id: 'block-ep', land: 'The Block', sku: 'pavilion', name: 'Block Pavilion', x: -95, z: -130, w: 12, d: 8.5, h: 5.2, yaw: 0.35, body: 0x7a4e38, trim: 0x3d281c },
  { id: 'block-song', land: 'The Block', sku: 'kiosk', name: 'Block Kiosk', x: -78, z: 52, w: 3.8, d: 3.8, h: 3.15, yaw: 0.1, body: 0x8a5a40, trim: 0x2c1c12 },
  { id: 'block-song-2', land: 'The Block', sku: 'kiosk', name: 'Block Cart', x: -175, z: 95, w: 3.6, d: 3.6, h: 3.05, yaw: -0.4, body: 0x8a5a40, trim: 0x2c1c12 },
  { id: 'hours-album', land: 'After Hours', sku: 'album', name: 'After Hours', x: 28, z: -182, w: 20, d: 12, h: 8.4, yaw: 0.05, body: 0x2a2438, trim: 0x1a1428 },
  { id: 'hours-ep', land: 'After Hours', sku: 'pavilion', name: 'Hours Pavilion', x: -78, z: -155, w: 11, d: 8, h: 4.9, yaw: 0.55, body: 0x3a3050, trim: 0x1c1828 },
  { id: 'hours-song', land: 'After Hours', sku: 'kiosk', name: 'Hours Kiosk', x: 95, z: -148, w: 3.6, d: 3.6, h: 3.1, yaw: -0.2, body: 0x4a4060, trim: 0x1a1424 },
  { id: 'board-album', land: 'The Board', sku: 'album', name: 'Board Hall', x: 248, z: 42, w: 22, d: 14, h: 9.0, yaw: -0.22, body: 0xc4b08a, trim: 0x6a5840 },
  { id: 'board-ep', land: 'The Board', sku: 'pavilion', name: 'Board Pavilion', x: 175, z: 95, w: 12, d: 8.5, h: 5.1, yaw: -0.45, body: 0xd2c4a0, trim: 0x6a5840 },
  { id: 'board-song', land: 'The Board', sku: 'kiosk', name: 'Board Kiosk', x: 88, z: -18, w: 3.8, d: 3.8, h: 3.15, yaw: 0.3, body: 0xd8c8a4, trim: 0x5a4830 },
  { id: 'board-song-2', land: 'The Board', sku: 'kiosk', name: 'Board Cart', x: 210, z: 88, w: 3.6, d: 3.6, h: 3.05, yaw: 0.6, body: 0xd8c8a4, trim: 0x5a4830 },
  { id: 'pocket-album', land: 'The Pocket', sku: 'album', name: 'Pocket Hall', x: 22, z: 112, w: 18, d: 14, h: 8.4, yaw: 1.57, body: 0x5a4a38, trim: 0x3d3428 },
  { id: 'pocket-ep-a', land: 'The Pocket', sku: 'pavilion', name: 'Pocket Pavilion A', x: 55, z: 95, w: 11, d: 8, h: 4.9, yaw: 0.4, body: 0x5a6a58, trim: 0x2a3228 },
  { id: 'pocket-ep-b', land: 'The Pocket', sku: 'pavilion', name: 'Pocket Pavilion B', x: 150, z: 108, w: 11, d: 8, h: 4.9, yaw: -0.5, body: 0x5a6a58, trim: 0x2a3228 },
  { id: 'pocket-song-a', land: 'The Pocket', sku: 'kiosk', name: 'Pocket Kiosk A', x: 95, z: 55, w: 3.6, d: 3.6, h: 3.1, yaw: -0.2, body: 0x6a7a68, trim: 0x243028 },
  { id: 'pocket-song-b', land: 'The Pocket', sku: 'kiosk', name: 'Pocket Kiosk B', x: 118, z: 140, w: 3.6, d: 3.6, h: 3.1, yaw: 0.3, body: 0x6a7a68, trim: 0x243028 },
  { id: 'pocket-song-c', land: 'The Pocket', sku: 'kiosk', name: 'Pocket Cart', x: 70, z: 130, w: 3.6, d: 3.6, h: 3.05, yaw: 0.15, body: 0x6a7a68, trim: 0x243028 },
];

export const GATE = [
  { id: 'gate-west', name: 'Gate West', sku: 'album', land: 'Gate', role: 'gate', x: -13.5, z: 233, w: 9, d: 7.2, h: 8.6, yaw: 0, body: 0x5a4634, trim: 0x3d2e22 },
  { id: 'gate-east', name: 'Gate East', sku: 'album', land: 'Gate', role: 'gate', x: 13.5, z: 233, w: 9, d: 7.2, h: 8.6, yaw: 0, body: 0x5a4634, trim: 0x3d2e22 },
];

export function stationPose(ringId, ang) {
  const r = LOCK.rings[ringId];
  const dist = r.outer + 9;
  return { x: r.x + Math.cos(ang) * dist, z: r.z + Math.sin(ang) * dist, ang };
}

const stationA = stationPose('A', -2.4);
const stationB = stationPose('B', -0.6);

export const STATIONS = [
  { id: 'station-a', name: 'Ring A', sku: 'pavilion', land: 'The Board', role: 'station', ring: 'A', x: stationA.x, z: stationA.z, ang: stationA.ang, w: 14, d: 7.5, h: 4.05, yaw: -stationA.ang + Math.PI / 2, body: 0x6a5844, trim: 0x3d3428 },
  { id: 'station-b', name: 'Ring B', sku: 'kiosk', land: 'The Board', role: 'station', ring: 'B', x: stationB.x, z: stationB.z, ang: stationB.ang, w: 8, d: 6, h: 3.6, yaw: -stationB.ang + Math.PI / 2, body: 0x6a5844, trim: 0x3d3428 },
];

export const PLACEMENTS = [...BUILDINGS, ...GATE, ...STATIONS];

export function occupancyAABB(b) {
  const hw = b.w / 2, hd = b.d / 2;
  return { minX: b.x - hw, maxX: b.x + hw, minZ: b.z - hd, maxZ: b.z + hd };
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export function aabbHitsCircle(aabb, cx, cz, r) {
  const qx = clamp(cx, aabb.minX, aabb.maxX);
  const qz = clamp(cz, aabb.minZ, aabb.maxZ);
  return Math.hypot(qx - cx, qz - cz) < r;
}

export function aabbHitsEllipse(aabb, cx, cz, rx, rz) {
  const nx0 = (aabb.minX - cx) / rx, nx1 = (aabb.maxX - cx) / rx;
  const nz0 = (aabb.minZ - cz) / rz, nz1 = (aabb.maxZ - cz) / rz;
  const minX = Math.min(nx0, nx1), maxX = Math.max(nx0, nx1);
  const minZ = Math.min(nz0, nz1), maxZ = Math.max(nz0, nz1);
  const qx = clamp(0, minX, maxX);
  const qz = clamp(0, minZ, maxZ);
  return qx * qx + qz * qz < 1;
}

export function aabbHitsAabb(a, b) {
  return a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;
}

export function hitsHub(aabb) {
  return aabbHitsCircle(aabb, 0, 0, LOCK.hubOuter);
}

export function hitsSpine(aabb) {
  return aabbHitsAabb(aabb, {
    minX: -LOCK.spineWidth / 2,
    maxX: LOCK.spineWidth / 2,
    minZ: 0,
    maxZ: LOCK.B,
  });
}

export function hitsWater(aabb) {
  return LOCK.waters.some(([x, z, rx, rz]) => aabbHitsEllipse(aabb, x, z, rx, rz));
}

export { ITINERARY as PARK_ITINERARY };
