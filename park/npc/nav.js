/** Plaza and path points. Crossing the spine is not a route. */
import { occupiesSpine } from '../lock.js';
import { blocksWalk } from '../water/water.js';
import { allPaths } from '../rides/coaster-paths.js';

export const WAYPOINTS = [
  { land: 'The Block', x: -150, z: 28 },
  { land: 'The Block', x: -136, z: 12 },
  { land: 'The Block', x: -158, z: -8 },
  { land: 'The Block', x: -172, z: 18 },
  { land: 'The Board', x: 150, z: 36 },
  { land: 'The Board', x: 172, z: 18 },
  { land: 'The Board', x: 164, z: 48 },
  { land: 'The Board', x: 142, z: 24 },
  { land: 'After Hours', x: -78, z: -148 },
  { land: 'After Hours', x: -62, z: -160 },
  { land: 'After Hours', x: -90, z: -156 },
  { land: 'The Pocket', x: 70, z: 150 },
  { land: 'The Pocket', x: 86, z: 158 },
  { land: 'The Pocket', x: 96, z: 136 },
];

let rail = null;

function railPoints() {
  if (rail) return rail;
  rail = [];
  for (const pack of allPaths()) {
    const samples = pack.samples;
    for (let i = 0; i < samples.length; i += 4) rail.push(samples[i]);
  }
  return rail;
}

export function nearRail(x, z, pad = 3.2) {
  for (const p of railPoints()) {
    if ((p.x - x) * (p.x - x) + (p.z - z) * (p.z - z) < pad * pad) return true;
  }
  return false;
}

export function pointLegal(p) {
  if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.z)) return false;
  if (occupiesSpine(p.x, p.z, 0.5)) return false;
  if (Math.hypot(p.x, p.z) < 36) return false;
  if (blocksWalk(p.x, p.z)) return false;
  if (nearRail(p.x, p.z, 3.2)) return false;
  return true;
}

export function legalWaypoints() {
  return WAYPOINTS.filter(pointLegal);
}
