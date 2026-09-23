/** Dispatch rules sit in front of the integrator. Physics does not overrule a closed gate. */
import { RIDE_ANCHORS } from '../rides/coaster-paths.js';
import { tryBoard, tryDispatch } from '../rides/ride-ops.js';
import { getClock, stepClock, isOpen, dayPart, lightScale, resetClock } from './clock.js';
import { queueFor, joinQueue, leaveQueue, playerAtLoad, holdForRide, advanceQueue, resetQueues, postedWait } from './queue.js';
import { isAdmitted, resetTicket } from './ticket.js';
import { getSafety, weatherHold, estopLatched, resetSafetyState } from './safety.js';
import { bootAgents, stepAgents, agentList, resetAgents } from './agents.js';

export const RIDE_RULES = {
  'ride-block-01': { kind: 'coaster', seats: 4, thrill: 'extreme', height: 48, cycle: 140, blocks: true },
  'ride-block-02': { kind: 'launch', seats: 2, thrill: 'extreme', height: 48, cycle: 90, blocks: true },
  'ride-board-family': { kind: 'family', seats: 3, thrill: 'family', height: 36, cycle: 70, blocks: true },
  'ride-board-01': { kind: 'wheel', seats: 16, thrill: 'gentle', height: 0, cycle: 48 },
  'ride-board-02': { kind: 'swings', seats: 12, thrill: 'moderate', height: 42, cycle: 36 },
  'ride-board-drop': { kind: 'drop', seats: 4, thrill: 'extreme', height: 48, cycle: 40 },
  'ride-hours-01': { kind: 'dark', seats: 2, thrill: 'gentle', height: 0, cycle: 50, dark: true },
  'ride-hours-02': { kind: 'dark', seats: 2, thrill: 'gentle', height: 0, cycle: 55, dark: true },
  'ride-pocket-01': { kind: 'spin', seats: 8, thrill: 'moderate', height: 36, cycle: 28 },
  'ride-pocket-02': { kind: 'kiddie', seats: 3, thrill: 'kiddie', height: 0, cycle: 24 },
};

export function ruleFor(id) {
  return RIDE_RULES[id] || { kind: 'coaster', seats: 2, thrill: 'moderate', height: 42, cycle: 80 };
}

export function tagRide(ride) {
  if (!ride || !ride.ops) return ride;
  const rules = ruleFor(ride.id);
  ride.ops.seats = rules.seats;
  ride.ops.thrill = rules.thrill;
  ride.ops.heightIn = rules.height;
  queueFor(ride.id, 8, rules.cycle);
  return ride;
}

export function blockSection(s, length) {
  const u = length ? s / length : 0;
  if (u < 0.12) return 'station';
  if (u < 0.28) return 'lift';
  if (u < 0.82) return 'course';
  return 'brake';
}

/** One train: the section it occupies is hot. A second train may not enter it. */
export function sectionClear(ops, section) {
  if (!ops || !ops.blockOccupied) return true;
  return ops.section !== section;
}

export function rideStatus(ops) {
  if (!ops) return 'closed';
  if (ops.phase === 'DOWN' || ops.fault) return 'down';
  if (ops.phase === 'CLOSED') return 'closed';
  if (!isOpen(getClock()) && (ops.phase === 'BOARDING' || ops.phase === 'IDLE')) return 'closed';
  if (ops.phase === 'COURSE' || ops.phase === 'DISPATCH' || ops.phase === 'BRAKE' || ops.phase === 'UNLOAD') return 'cycling';
  return 'operating';
}

export function joinRide(id) {
  if (!isAdmitted()) return { ok: false, reason: 'admit' };
  const rules = ruleFor(id);
  const q = queueFor(id, 8, rules.cycle);
  const ok = joinQueue(q, 'player');
  return { ok, reason: ok ? 'queued' : 'full', at: q.slots.indexOf('player'), wait: postedWait(q, 'player') };
}

export function loadRideId() {
  for (const id of Object.keys(RIDE_RULES)) {
    if (playerAtLoad(id)) return id;
  }
  return null;
}

export function attemptBoard(ride) {
  if (!ride || !ride.ops) return { ok: false, reason: 'missing' };
  const ops = ride.ops;
  if (!isAdmitted()) return { ok: false, reason: 'admit' };
  if (ops.phase === 'COURSE' || ops.phase === 'DISPATCH' || ops.phase === 'BRAKE') return { ok: false, reason: 'course' };
  if (!playerAtLoad(ride.id)) return { ok: false, reason: 'load' };
  if (ops.phase === 'CLOSED' || ops.phase === 'DOWN' || ops.fault) return { ok: false, reason: 'down' };
  if (estopLatched() || ops.eStop) return { ok: false, reason: 'estop' };
  if (weatherHold() || ops.weatherHold) return { ok: false, reason: 'weather' };
  const rules = ruleFor(ride.id);
  if (rules.kind === 'swings' && ride.machine && ride.machine.omega > 0.05) return { ok: false, reason: 'spin' };
  if (rules.kind === 'wheel' && ride.machine && Math.abs(ride.machine.omega) > 0.02) return { ok: false, reason: 'window' };
  const filled = (ops.passengers || 0) + (ops.dummies || 0);
  if (filled >= rules.seats) return { ok: false, reason: 'full' };
  if (!tryBoard(ops)) return { ok: false, reason: 'phase' };
  if ((ops.dummies || 0) > 0) ops.dummies -= 1;
  ops.bots = ops.dummies || 0;
  holdForRide(ride.id);
  ops.doors = 'open';
  return { ok: true, reason: 'board' };
}

export function dispatchBlockers(ride) {
  const reasons = [];
  if (!ride || !ride.ops) return ['missing'];
  const ops = ride.ops;
  const rules = ruleFor(ride.id);
  if (ops.restraint !== 'closed') reasons.push('restraints');
  if (ops.gateOpen === true) reasons.push('gates');
  if (ops.blockOccupied && ops.phase !== 'BOARDING' && ops.phase !== 'IDLE') reasons.push('block');
  if (ops.phase !== 'BOARDING' && ops.phase !== 'IDLE') reasons.push('phase');
  if (ops.eStop || estopLatched()) reasons.push('estop');
  if (ops.weatherHold || weatherHold()) reasons.push('weather');
  if (ops.parkClosed || ops.phase === 'CLOSED' || !isOpen(getClock())) reasons.push('closed');
  if (ops.fault || ops.phase === 'DOWN') reasons.push('down');
  if (rules.kind === 'drop' && ops.hoistFault) reasons.push('hoist');
  if (rules.dark && ops.doors !== 'closed') reasons.push('doors');
  if (rules.blocks && ops.section && !sectionClear(ops, ops.section)) reasons.push('section');
  return reasons;
}

export function attemptDispatch(ride) {
  const reasons = dispatchBlockers(ride);
  if (reasons.length) return { ok: false, reason: reasons[0], reasons };
  const ok = tryDispatch(ride.ops);
  return { ok, reason: ok ? 'dispatch' : 'ops', reasons: ok ? [] : ['ops'] };
}

export function markFault(ops) {
  if (!ops) return ops;
  ops.fault = true;
  ops.statusNote = 'temporarily closed';
  ops.gateHold = true;
  ops.gateOpen = false;
  if (ops.phase === 'COURSE' || ops.phase === 'DISPATCH') ops.phase = 'BRAKE';
  ops.eStop = true;
  ops.leaveAfterStop = true;
  return ops;
}

function serviceQueues(rides) {
  const list = agentList();
  for (const ride of rides) {
    if (!ride || !ride.ops) continue;
    const rules = ruleFor(ride.id);
    const q = queueFor(ride.id, 8, rules.cycle);
    if (ride.ops.seatFreed) {
      ride.ops.dummies = 0;
      for (const agent of list) {
        if (agent.ride === ride.id && agent.mode === 'ride') {
          agent.mode = 'walk';
          agent.ride = null;
        }
      }
      advanceQueue(q);
      ride.ops.seatFreed = false;
    }
    if (ride.ops.phase !== 'BOARDING' || ride.ops.fault) continue;
    let guard = 0;
    while (guard < rules.seats && (ride.ops.dummies || 0) < rules.seats - 1) {
      guard += 1;
      if (!q.slots.some((slot) => slot && String(slot).startsWith('agent-'))) offerOne(ride, list, q);
      const who = q.slots[0];
      if (!who || !String(who).startsWith('agent-')) break;
      ride.ops.dummies = (ride.ops.dummies || 0) + 1;
      const agent = list.find((row) => row.id === who);
      if (agent) {
        agent.mode = 'ride';
        agent.ride = ride.id;
      }
      leaveQueue(q, who);
    }
  }
}

function offerOne(ride, list, q) {
  const anchor = RIDE_ANCHORS[ride.id];
  if (!anchor) return false;
  const agent = list.find((row) => row.mode === 'walk' && Math.sign(row.x) === Math.sign(anchor.x || 1));
  if (!agent) return false;
  if (!joinQueue(q, agent.id)) return false;
  agent.mode = 'queue';
  agent.ride = ride.id;
  return true;
}

export function stepParkLogic(dt, rides) {
  const list = rides ? [...rides] : [];
  stepClock(dt);
  const open = isOpen(getClock());
  const part = dayPart(getClock());
  const level = lightScale(part);
  const safety = getSafety();
  stepAgents(dt);
  for (const ride of list) {
    if (!ride || !ride.ops) continue;
    const ops = ride.ops;
    ops.light = level;
    ops.weatherHold = safety.weather;
    if (ride.table && ride.table.length) ops.section = blockSection(ops.s || 0, ride.table.length);
    if (!open) ops.closeAfter = true;
    if (ops.closeAfter && (ops.phase === 'BOARDING' || ops.phase === 'IDLE')) {
      ops.parkClosed = true;
      ops.phase = 'CLOSED';
      ops.v = 0;
      ops.gateOpen = false;
    }
    if (ops.phase === 'CLOSED' || ops.phase === 'DOWN') ops.gateOpen = false;
  }
  serviceQueues(list);
  return { open, part, minutes: getClock().minutes };
}

export function resetParkLogic() {
  resetClock();
  resetTicket();
  resetQueues();
  resetAgents();
  resetSafetyState();
  bootAgents();
}

export function postedRideWait(id) {
  const rules = ruleFor(id);
  return postedWait(queueFor(id, 8, rules.cycle), 'player');
}
