/** Arc-length track math. Park frame: +X east, +Y up, +Z south. No THREE. */

export function dist3(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.hypot(dx, dy, dz);
}

export function lerpSample(a, b, t) {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
    bank: (a.bank || 0) + ((b.bank || 0) - (a.bank || 0)) * t,
    lift: t < 0.5 ? a.lift : b.lift,
    brake: t < 0.5 ? a.brake : b.brake,
    tunnel: t < 0.5 ? a.tunnel : b.tunnel,
    speed: (a.speed || 8) + ((b.speed || 8) - (a.speed || 8)) * t,
  };
}

export function arcTable(samples) {
  const n = samples.length;
  const seg = new Array(n);
  let length = 0;
  for (let i = 0; i < n; i++) {
    const d = dist3(samples[i], samples[(i + 1) % n]);
    seg[i] = d;
    length += d;
  }
  return { samples, seg, length, n };
}

/** s and s+length are the same point. Wrap is modulo, so the seam is zero. */
export function pointAt(table, s) {
  const n = table.n;
  if (!n) return { x: 0, y: 0, z: 0, bank: 0, speed: 0 };
  let u = s % table.length;
  if (u < 0) u += table.length;
  let acc = 0;
  for (let i = 0; i < n; i++) {
    const d = table.seg[i];
    if (acc + d >= u || i === n - 1) {
      const t = d > 1e-8 ? (u - acc) / d : 0;
      const clamped = Math.max(0, Math.min(1, t));
      return lerpSample(table.samples[i], table.samples[(i + 1) % n], clamped);
    }
    acc += d;
  }
  return table.samples[0];
}

function sub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function scale(a, s) {
  return { x: a.x * s, y: a.y * s, z: a.z * s };
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function len(a) {
  return Math.hypot(a.x, a.y, a.z);
}

export function norm(a) {
  const l = len(a) || 1;
  return { x: a.x / l, y: a.y / l, z: a.z / l };
}

/**
 * Facing +Z (south), world up +Y: rider's right is -X (west).
 * right = forward × up. Then up = right × forward.
 * Bank rotates that pair around forward. Positive bank lowers the rider's right.
 */
export function frameFromTangent(forward, bank = 0, prevRight = null) {
  const T = norm(forward);
  let worldUp = { x: 0, y: 1, z: 0 };
  if (Math.abs(dot(T, worldUp)) > 0.92) {
    worldUp = prevRight ? norm(cross(prevRight, T)) : { x: 1, y: 0, z: 0 };
  }
  let right = cross(T, worldUp);
  if (len(right) < 1e-4 && prevRight) right = { ...prevRight };
  right = norm(right);
  let up = norm(cross(right, T));
  const c = Math.cos(bank);
  const s = Math.sin(bank);
  const bankedRight = norm(add(scale(right, c), scale(up, s)));
  const bankedUp = norm(sub(scale(up, c), scale(right, s)));
  return { forward: T, right: bankedRight, up: bankedUp };
}

export function framesFor(samples) {
  const n = samples.length;
  const frames = new Array(n);
  let prevRight = null;
  for (let i = 0; i < n; i++) {
    const a = samples[(i - 1 + n) % n];
    const b = samples[(i + 1) % n];
    const forward = sub(b, a);
    const frame = frameFromTangent(forward, samples[i].bank || 0, prevRight);
    prevRight = frame.right;
    frames[i] = frame;
  }
  return frames;
}

export function maxGap(samples) {
  const n = samples.length;
  let gap = 0;
  let yJump = 0;
  for (let i = 0; i < n; i++) {
    const a = samples[i];
    const b = samples[(i + 1) % n];
    gap = Math.max(gap, dist3(a, b));
    yJump = Math.max(yJump, Math.abs(a.y - b.y));
  }
  return { gap, yJump };
}

export function hasNaN(samples) {
  return samples.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.z) || !Number.isFinite(p.bank || 0));
}

/** One lap of the heartline. Seam is pointAt(0) vs pointAt(length). */
export function dryLap(samples, steps = 180) {
  const table = arcTable(samples);
  const frames = framesFor(samples);
  let maxJump = 0;
  let prev = null;
  const positions = [];
  for (let i = 0; i <= steps; i++) {
    const p = pointAt(table, (i / steps) * table.length);
    if (prev) maxJump = Math.max(maxJump, dist3(prev, p));
    prev = p;
    positions.push(p);
  }
  const seam = dist3(pointAt(table, 0), pointAt(table, table.length));
  const endStep = dist3(positions[0], positions[positions.length - 1]);
  return { table, frames, positions, maxJump, seam, endStep, length: table.length };
}

export function pushSpan(pts, from, to, steps, yAt, bankAt, flags) {
  for (let i = 0; i < steps; i++) {
    const t = steps === 1 ? 0 : i / steps;
    const p = {
      x: from.x + (to.x - from.x) * t,
      z: from.z + (to.z - from.z) * t,
      y: yAt(t),
      bank: bankAt ? bankAt(t) : 0,
      speed: flags && flags.speed ? flags.speed(t) : 8,
      lift: !!(flags && flags.lift),
      brake: !!(flags && flags.brake),
      tunnel: !!(flags && flags.tunnel),
    };
    pts.push(p);
  }
}

/** Vertical loop. phi 0 and 2pi sit on the entry point. Travel continues +forward. */
export function pushLoop(pts, entry, forward, radius, steps) {
  const T = norm(forward);
  const center = { x: entry.x, y: entry.y + radius, z: entry.z };
  for (let k = 1; k <= steps; k++) {
    const phi = (k / steps) * Math.PI * 2;
    const along = Math.sin(phi) * radius;
    const y = center.y - Math.cos(phi) * radius;
    pts.push({
      x: center.x + T.x * along,
      y,
      z: center.z + T.z * along,
      bank: 0,
      speed: 14,
      lift: false,
      brake: false,
      tunnel: false,
      inversion: phi > 0.6 && phi < 5.6,
    });
  }
}

/** Corkscrew: advance along forward while banking a full turn. */
export function pushCorkscrew(pts, entry, forward, length, rise, steps) {
  const T = norm(forward);
  for (let k = 1; k <= steps; k++) {
    const u = k / steps;
    const bank = u * Math.PI * 2;
    pts.push({
      x: entry.x + T.x * length * u,
      y: entry.y + Math.sin(u * Math.PI) * rise,
      z: entry.z + T.z * length * u,
      bank,
      speed: 12,
      lift: false,
      brake: false,
      tunnel: false,
      inversion: bank > 1.2 && bank < 5.0,
    });
  }
}

/** Helix around a center. Turns > 1. Ends near the start angle so the next span can leave. */
export function pushHelix(pts, center, radius, y0, climb, turns, steps, startAng) {
  for (let k = 1; k <= steps; k++) {
    const u = k / steps;
    const ang = startAng + u * Math.PI * 2 * turns;
    pts.push({
      x: center.x + Math.cos(ang) * radius,
      y: y0 + climb * u,
      z: center.z + Math.sin(ang) * radius,
      bank: 0.65,
      speed: 9,
      lift: false,
      brake: false,
      tunnel: false,
    });
  }
}

export function stats(samples) {
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of samples) {
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { count: samples.length, minY, maxY, ...maxGap(samples), nan: hasNaN(samples) };
}
