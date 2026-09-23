/** Shared ride clock. Ops rides integrate s and v. Dry laps keep the old speed table. */
import { pointAt } from './path-math.js';
import { stepEnergy, stepCruise, stepWheel, stepSwings, stepDropRide, stepSpin, stepBumper, wheelInWindow } from './physics.js';
import { canBoard, tryBoard, advancePhase } from './ride-ops.js';
import { clickLift, whoosh, dispatchBell, hissBrakes } from './ride-audio.js';
import { stepParkLogic } from '../logic/ride-logic.js';
import { stepAlive } from '../alive/auto-ops.js';
import { stepNpcs } from '../npc/npc.js';
import { stepScore } from '../audio/ride-score.js';
import { stepSpectacular } from '../show/spectacular.js';
import { dayPart, getClock } from '../logic/clock.js';

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
    a: 0,
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
    const ops = r.ops;
    return {
      id,
      kind: r.kind,
      lap: r.lap,
      s: r.s,
      phase: ops ? ops.phase : r.phase,
      hold: r.hold,
      speed: r.speed,
      v: ops ? ops.v : r.speed,
      block: ops ? ops.blockOccupied : false,
    };
  });
}

function cueAudio(ride, phase) {
  if (!phase || ride._audioPhase === phase) return;
  if (phase === 'DISPATCH') dispatchBell(ride.id);
  if (phase === 'BRAKE') hissBrakes(ride.id);
  ride._audioPhase = phase;
}

function syncVisuals(ride, dt) {
  const ops = ride.ops;
  const loading = ops && (ops.phase === 'BOARDING' || ops.phase === 'IDLE' || ops.phase === 'UNLOAD');
  const open = !!(loading && ops.restraint !== 'closed' && !ops.gateHold && !ops.eStop);
  if (ops) ops.gateOpen = open;
  if (ride.gate) {
    const target = open ? 2.35 : 1.15;
    ride.gate.position.y += (target - ride.gate.position.y) * Math.min(1, (dt || 0) * 6);
  }
  if (ride.attendant) ride.attendant.visible = !!(ops && ops.phase === 'BOARDING' && !ops.fault && ops.phase !== 'CLOSED');
  const moving = ops && (ops.phase === 'COURSE' || ops.phase === 'DISPATCH' || ops.phase === 'BRAKE');
  if (ride.lamps && ride.lamps.material && ops) {
    const night = ops.light != null ? ops.light : 0.22;
    ride.lamps.material.emissiveIntensity = moving ? Math.max(night, 0.62) : night;
  }
  if (ride.bots) {
    const show = ((ops && ops.dummies) || 0) > 0 || (ops && ops.passengers === 1);
    for (const bot of ride.bots) if (bot) bot.visible = !!show && (!ops || ops.phase !== 'CLOSED');
  }
  const drive = !!(ops && ops.lift);
  if (ride.chains && ride.chains.material) {
    ride.chains.material.emissiveIntensity = drive ? 0.9 : 0.06;
    ride.chains.position.y = drive ? (ride.clock * Math.max(0.5, ops.v)) % 0.28 : 0;
  }
  if (ride.dogs && ride.dogs.material) {
    ride.dogs.material.emissiveIntensity = drive ? 0.55 : 0.04;
  }
  if (ride.brakes && ride.brakes.material) {
    const hot = !!(ops && (ops.brakeZone || ops.phase === 'BRAKE'));
    ride.brakes.material.emissiveIntensity = hot ? 0.95 : 0.12;
  }
  if (ops && ops.lift && ops.v > 0.4) {
    ride._clickS = (ride._clickS || 0) + ops.v * dt;
    const spacing = Math.max(0.65, 2.2 - ops.v * 0.3);
    if (ride._clickS >= spacing) {
      ride._clickS = 0;
      clickLift(ride.id);
    }
  }
  if (ride.guest && ops && ops.a < -6) whoosh(ride.id, ops.v);
}

function stepPath(ride, dt) {
  if (ride.table) {
    if (!ride.ops) {
      ride.ops = {
        id: ride.id,
        phase: 'COURSE',
        s: ride.s || 0,
        v: 0,
        a: 0,
        eStop: false,
        trimAssist: 0,
        laps: ride.lap || 0,
        chain: false,
        clock: 0,
        passengers: 0,
        restraint: 'closed',
        blockOccupied: true,
      };
    }
    const ops = ride.ops;
    const moving = ops.phase === 'DISPATCH' || ops.phase === 'COURSE' || ops.phase === 'BRAKE';
    if (moving) {
      if (ride.phys && ride.phys.mode === 'cruise') stepCruise(ops, ride.table, dt, ride.phys);
      else stepEnergy(ops, ride.table, dt, ride.phys || {});
    } else {
      ops.v = 0;
      ops.a = 0;
    }
    advancePhase(ops, ride.table, dt);
    ride.s = ops.s;
    ride.speed = ops.v;
    ride.a = ops.a || 0;
    ride.phase = ops.phase;
    ride.hold = ops.phase === 'UNLOAD' ? 1 : 0;
    ride.lap = ops.laps || 0;
    cueAudio(ride, ops.phase);
    if (ride.layout) ride.layout(ride.s, ride);
    syncVisuals(ride, dt);
  }
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

function stepMachine(ride, dt) {
  const m = ride.machine;
  const ops = ride.ops;
  if (!m || !ops) {
    stepPhase(ride, dt);
    syncVisuals(ride, dt);
    return;
  }
  if (ops.phase === 'DISPATCH' && (m.phase === 'BOARDING' || m.phase === 'IDLE')) {
    m.phase = 'DISPATCH';
    m.eStop = false;
  }
  if (ops.eStop && m.phase !== 'UNLOAD' && m.phase !== 'BOARDING' && m.phase !== 'IDLE') {
    m.phase = 'BRAKE';
    m.eStop = true;
  }
  if (m.phase === 'UNLOAD') {
    if (m.unloadLeft == null) m.unloadLeft = 1.2;
    m.unloadLeft -= dt;
    ops.phase = 'UNLOAD';
    ops.restraint = 'open';
    ops.blockOccupied = false;
    ops.v = 0;
    if (m.unloadLeft <= 0) {
      m.unloadLeft = null;
      m.phase = 'BOARDING';
      m.eStop = false;
      ops.phase = 'BOARDING';
      ops.passengers = 0;
      ops.eStop = false;
      ops.autoAt = 0;
    }
  } else {
    if (ride.kind === 'wheel') stepWheel(m, dt);
    else if (ride.kind === 'swings') stepSwings(m, dt);
    else if (ride.kind === 'drop') stepDropRide(m, dt);
    else if (ride.kind === 'spin') {
      stepSpin(m, dt);
      const base = (ride.state && ride.state.radius ? ride.state.radius : 6.5) - 1.3;
      const cars = ride.state && ride.state.cars ? ride.state.cars : [];
      for (const car of cars) {
        const bump = car.userData && car.userData.bump;
        if (!bump) continue;
        if (m.phase === 'COURSE') stepBumper(bump, dt);
        else bump.r = base;
        car.userData.orbitR = bump.r;
      }
    }
    if (m.phase === 'UNLOAD') {
      ops.phase = 'UNLOAD';
      ops.restraint = 'open';
      ops.blockOccupied = false;
      ops.v = 0;
      m.unloadLeft = 1.2;
    } else {
      ops.phase = m.phase;
      ops.v = m.omega != null ? m.omega : m.vy || 0;
      ops.s = m.angle != null ? m.angle : m.y || 0;
      if (m.phase === 'COURSE' || m.phase === 'DISPATCH' || m.phase === 'BRAKE') {
        if (ops.restraint !== 'closed') ops.restraint = 'closed';
        ops.blockOccupied = true;
      }
    }
  }
  ops.clock += dt;
  if (ops.phase === 'BOARDING' && ops.passengers === 1 && ops.restraint === 'closed' && ops.autoAt && ops.clock >= ops.autoAt && !ops.blockOccupied) {
    ops.phase = 'DISPATCH';
    ops.blockOccupied = true;
    ops.dispatchAt = ops.clock;
    m.phase = 'DISPATCH';
  }
  ride.speed = Math.abs(m.omega != null ? m.omega : m.vy || 0);
  ride.a = ride.kind === 'drop' ? m.vy || 0 : m.kick || 0;
  ride.s = ops.s;
  ride.phase = ops.phase;
  ride.lap = ops.laps || ride.lap || 0;
  if (ride.layout) {
    if (ride.kind === 'drop') ride.layout(m.y, ride);
    else ride.layout(m.angle || 0, ride);
  }
  cueAudio(ride, ops.phase);
  syncVisuals(ride, dt);
}

export function stepRides(dt) {
  const step = Math.max(0, Math.min(0.12, dt || 0));
  if (!step) return;
  for (const ride of rides.values()) {
    ride.clock += step;
    if (ride.kind === 'path') stepPath(ride, step);
    else if (ride.machine && ride.ops) stepMachine(ride, step);
    else stepPhase(ride, step);
  }
  stepParkLogic(step, rides.values());
  stepAlive(step, rides.values());
  stepNpcs(step);
  stepScore(rides.values());
  stepSpectacular(step, dayPart(getClock()));
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

/** Headless lap on the prescribed speed table. Physics laps live in physics-test.js. */
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
  const hero = rides.get('ride-block-01');
  if (hero && typeof window !== 'undefined' && hero.lead && hero.lead.p) {
    const ops = hero.ops;
    window.__blockS = {
      s: hero.s,
      y: hero.lead.p.y,
      v: ops ? ops.v : hero.speed,
      phase: ops ? ops.phase : hero.phase,
      hold: hero.hold,
      lap: ops ? ops.laps : hero.lap,
      block: ops ? ops.blockOccupied : false,
    };
  }
}

export function boardAllowed(ride) {
  if (!ride || !ride.ops) return false;
  if (!canBoard(ride.ops)) return false;
  if (ride.kind === 'wheel') {
    const m = ride.machine;
    if (!m || Math.abs(m.omega) > 0.02) return false;
    return wheelInWindow(m.angle, ride.boardedSeat || 0, m.count || 16);
  }
  if (ride.kind === 'swings' || ride.kind === 'spin') {
    return !ride.machine || Math.abs(ride.machine.omega) < 0.02;
  }
  if (ride.kind === 'drop') {
    return !!ride.machine && ride.machine.y <= (ride.machine.bottom || 0) + 0.35;
  }
  return true;
}

export function canDispatch(id) {
  const ride = rides.get(id);
  if (!ride) return true;
  if (ride.ops) {
    return !ride.ops.blockOccupied && (ride.ops.phase === 'BOARDING' || ride.ops.phase === 'IDLE');
  }
  if (ride.kind !== 'path') return true;
  return ride.hold > 0 || ride.s < 6 || ride.s > ride.length - 8;
}

export function rideAgain(id) {
  const ride = rides.get(id);
  if (!ride) return false;
  if (ride.ops) {
    if (ride.ops.blockOccupied) return false;
    if (ride.ops.phase !== 'BOARDING' && ride.ops.phase !== 'IDLE' && ride.ops.phase !== 'UNLOAD') return false;
    return tryBoard(ride.ops);
  }
  if (!canDispatch(id)) return false;
  ride.s = 0;
  ride.phase = 0;
  ride.hold = ride.stationHold || 2;
  if (ride.layout) ride.layout(ride.kind === 'path' ? 0 : 0, ride);
  return true;
}
