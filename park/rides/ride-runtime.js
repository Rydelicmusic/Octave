/** Shared ride clock. Path rides advance by arc length. Spinners advance by phase. */
import { pointAt } from './path-math.js';

const rides = new Map();
let lastMs = 0;

export function registerRide(ride) {
  rides.set(ride.id, {
    s: 0,
    phase: 0,
    hold: ride.stationHold || 0,
    lap: 0,
    clock: 0,
    speed: 0,
    lead: null,
    boardedSeat: 0,
    ...ride,
  });
  return rides.get(ride.id);
}

export function getRide(id) {
  return rides.get(id) || null;
}

export function rideIds() {
  return [...rides.keys()];
}

export function rideSnapshot() {
  return rideIds().map((id) => {
    const r = rides.get(id);
    return { id, kind: r.kind, lap: r.lap, s: r.s, phase: r.phase, hold: r.hold, speed: r.speed };
  });
}

function stepPath(ride, dt) {
  if (ride.hold > 0) {
    ride.hold -= dt;
    ride.speed = 0;
    if (ride.layout) ride.layout(ride.s, ride);
    return;
  }
  const sample = pointAt(ride.table, ride.s);
  const speed = Math.max(1.1, sample.speed || 8);
  ride.speed = speed;
  ride.s += speed * dt;
  if (ride.s >= ride.length) {
    ride.s %= ride.length;
    ride.hold = ride.stationHold || 2;
    ride.lap += 1;
  }
  if (ride.layout) ride.layout(ride.s, ride);
}

function stepPhase(ride, dt) {
  const rate = ride.rate || 0.35;
  ride.phase += dt * rate;
  ride.speed = rate;
  if (ride.phase > Math.PI * 2) {
    ride.phase %= Math.PI * 2;
    ride.lap += 1;
  }
  if (ride.layout) ride.layout(ride.phase, ride);
}

export function stepRides(dt) {
  const step = Math.max(0, Math.min(0.12, dt || 0));
  if (!step) return;
  for (const ride of rides.values()) {
    ride.clock += step;
    if (ride.kind === 'path') stepPath(ride, step);
    else stepPhase(ride, step);
  }
}

export function tickMotion(now, dt) {
  let seconds = dt;
  const stamp = typeof now === 'number' ? (now > 200 ? now : now * 1000) : 0;
  if (seconds == null || !Number.isFinite(seconds)) {
    seconds = lastMs ? Math.min(0.12, (stamp - lastMs) / 1000) : 0.016;
  }
  if (stamp) lastMs = stamp;
  stepRides(seconds);
}

/** Headless lap: no meshes. Returns the lead sample after one circuit. */
export function dryRunRide(table, cars, gap, stationHold) {
  let s = 0;
  let hold = stationHold || 0;
  let lap = 0;
  let maxY = -Infinity;
  const seen = [];
  const length = table.length;
  const dt = 0.05;
  const budget = (length / 1.1 + (stationHold || 0) + 3) * 2;
  let elapsed = 0;
  for (; elapsed < budget && lap < 1; elapsed += dt) {
    if (hold > 0) {
      hold -= dt;
      seen.push(pointAt(table, s));
      continue;
    }
    const speed = Math.max(1.1, pointAt(table, s).speed || 8);
    s += speed * dt;
    if (s >= length) {
      s %= length;
      hold = stationHold || 0;
      lap += 1;
    }
    const p = pointAt(table, s - Math.max(0, cars - 1) * (gap || 0));
    if (p.y > maxY) maxY = p.y;
    seen.push(p);
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.z)) {
      return { ok: false, lap, seen, cars, elapsed, maxY };
    }
  }
  return { ok: lap >= 1 && seen.length > 10, lap, seen, cars, elapsed, maxY };
}

export function stepRideSeconds(seconds) {
  const dt = 0.05;
  const n = Math.max(1, Math.round((seconds || 0) / dt));
  for (let i = 0; i < n; i++) stepRides(dt);
}

export function canDispatch(id) {
  const ride = rides.get(id);
  if (!ride || ride.kind !== 'path') return true;
  return ride.hold > 0 || ride.s < 6 || ride.s > ride.length - 8;
}

export function rideAgain(id) {
  const ride = rides.get(id);
  if (!ride) return false;
  if (!canDispatch(id)) return false;
  ride.s = 0;
  ride.phase = 0;
  ride.hold = ride.stationHold || 2;
  if (ride.layout) ride.layout(ride.kind === 'path' ? 0 : 0, ride);
  return true;
}
