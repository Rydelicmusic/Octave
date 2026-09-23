/** Hero Block coaster. Closed, inside the Block canopy, off the spine and the hub.
 *  The lift faces the Gate so a walk down the spine can see the crest. */
import { LOCK, inCanopy, occupiesSpine } from '../lock.js';

function lerp(a, b, t) {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

function span(out, a, b, n, flags) {
  for (let i = 0; i < n; i++) {
    const p = lerp(a, b, i / n);
    out.push({
      x: p.x,
      y: p.y,
      z: p.z,
      bank: (flags && flags.bank) || 0,
      speed: (flags && flags.speed) || 8,
      lift: !!(flags && flags.lift),
      brake: !!(flags && flags.brake),
    });
  }
}

function helix(out, cx, cz, radius, y0, y1, n) {
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const a = -0.4 + t * Math.PI * 1.35;
    out.push({
      x: cx + Math.cos(a) * radius,
      y: y0 + (y1 - y0) * Math.sin(t * Math.PI),
      z: cz + Math.sin(a) * radius,
      bank: 0.4,
      speed: 11,
      lift: false,
      brake: false,
    });
  }
}

export function heroSamples() {
  const station = { x: -102, y: 3.2, z: 96 };
  const liftFoot = { x: -112, y: 4.2, z: 82 };
  const crest = { x: -124, y: 36, z: 64 };
  const valley = { x: -136, y: 4.4, z: 50 };
  const out = [];
  span(out, station, liftFoot, 6, { speed: 6 });
  span(out, liftFoot, crest, 14, { lift: true, speed: 7 });
  span(out, crest, valley, 10, { speed: 16 });
  helix(out, -122, 62, 12, 5, 14, 16);
  const after = out[out.length - 1];
  const brakeIn = { x: -108, y: 4.2, z: 78 };
  span(out, { x: after.x, y: after.y, z: after.z }, brakeIn, 8, { speed: 9 });
  span(out, brakeIn, station, 8, { brake: true, speed: 4 });
  out.push({ ...station, bank: 0, speed: 3, lift: false, brake: true });
  return out;
}

export function heroIssues(samples) {
  const bad = [];
  for (let i = 0; i < samples.length; i++) {
    const p = samples[i];
    if (!inCanopy(p.x, p.z, 'The Block')) bad.push(i + ' canopy');
    if (occupiesSpine(p.x, p.z, 2)) bad.push(i + ' spine');
    if (Math.hypot(p.x, p.z) < LOCK.hubOuter + 4) bad.push(i + ' hub');
    if (bad.length > 6) break;
  }
  return bad;
}

export function heroBlockPack() {
  const samples = heroSamples();
  return {
    id: 'ride-block-01',
    land: 'The Block',
    phys: 'coaster',
    samples,
    cars: 4,
    carGap: 4.4,
    carScale: 1.55,
    stationHold: 2,
    beacon: true,
    railBulk: 2.4,
    postBulk: 3.1,
  };
}
