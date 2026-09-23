/** Per-ride operations. One train. Board only while the station is open. */

export const PHASES = ['IDLE', 'BOARDING', 'DISPATCH', 'COURSE', 'BRAKE', 'UNLOAD'];

export function createOps(id) {
  return {
    id,
    phase: 'BOARDING',
    s: 0,
    v: 0,
    a: 0,
    passengers: 0,
    restraint: 'open',
    dispatchAt: 0,
    blockOccupied: false,
    eStop: false,
    leaveAfterStop: false,
    trimAssist: 0,
    clock: 0,
    laps: 0,
    autoAt: 0,
  };
}

export function canBoard(ops) {
  if (!ops) return false;
  return ops.phase === 'BOARDING' || ops.phase === 'IDLE';
}

export function tryBoard(ops) {
  if (!canBoard(ops)) return false;
  ops.passengers = 1;
  ops.phase = 'BOARDING';
  ops.restraint = 'open';
  ops.autoAt = 0;
  return true;
}

export function setRestraint(ops, closed) {
  if (!ops) return false;
  if (closed) {
    if (ops.passengers !== 1) return false;
    if (ops.phase !== 'BOARDING' && ops.phase !== 'IDLE') return false;
    ops.restraint = 'closed';
    ops.gateOpen = false;
    ops.doors = 'closed';
    ops.autoAt = ops.clock + 3;
    return true;
  }
  if (ops.phase === 'COURSE' || ops.phase === 'DISPATCH' || ops.phase === 'BRAKE') return false;
  ops.restraint = 'open';
  ops.doors = 'open';
  ops.gateOpen = true;
  ops.autoAt = 0;
  return true;
}

export function tryDispatch(ops) {
  if (!ops) return false;
  if (ops.restraint !== 'closed') return false;
  if (ops.passengers !== 1) return false;
  if (ops.blockOccupied) return false;
  if (ops.gateOpen === true) return false;
  if (ops.weatherHold) return false;
  if (ops.parkClosed || ops.phase === 'CLOSED' || ops.phase === 'DOWN') return false;
  if (ops.fault || ops.eStop || ops.hoistFault) return false;
  if (ops.phase !== 'BOARDING' && ops.phase !== 'IDLE') return false;
  ops.phase = 'DISPATCH';
  ops.blockOccupied = true;
  ops.dispatchAt = ops.clock;
  ops.eStop = false;
  return true;
}

export function eStop(ops) {
  if (!ops) return false;
  ops.eStop = true;
  ops.leaveAfterStop = true;
  ops.gateHold = true;
  ops.gateOpen = false;
  if (ops.phase === 'COURSE' || ops.phase === 'DISPATCH') ops.phase = 'BRAKE';
  return true;
}

export function advancePhase(ops, table, dt) {
  if (!ops) return ops;
  ops.clock += dt;
  if (ops.phase === 'CLOSED' || ops.phase === 'DOWN') {
    ops.v = 0;
    ops.gateOpen = false;
    return ops;
  }
  const length = table ? table.length : 0;
  const autoOk = ops.gateOpen !== true && !ops.weatherHold && !ops.parkClosed && !ops.fault && !ops.eStop && !ops.hoistFault;
  if (ops.phase === 'BOARDING' && ops.passengers === 1 && ops.restraint === 'closed' && ops.autoAt && ops.clock >= ops.autoAt && !ops.blockOccupied && autoOk) {
    tryDispatch(ops);
  }
  const courseMark = Math.min(18, Math.max(4, length * 0.08));
  if (ops.phase === 'DISPATCH' && ops.s > courseMark) ops.phase = 'COURSE';
  if ((ops.phase === 'COURSE' || ops.phase === 'DISPATCH') && (ops.brakeZone || ops.eStop) && ops.s > length * 0.45) {
    ops.phase = 'BRAKE';
  }
  if (ops.eStop && (ops.phase === 'COURSE' || ops.phase === 'DISPATCH') && ops.s > Math.min(30, length * 0.2)) {
    ops.phase = 'BRAKE';
  }
  const parked = ops.arrived || (ops.phase === 'BRAKE' && ops.s < 1.5 && ops.v < 0.45);
  if (parked && ops.phase !== 'UNLOAD' && ops.phase !== 'BOARDING' && ops.phase !== 'IDLE') {
    ops.s = 0;
    ops.v = 0;
    ops.a = 0;
    ops.arrived = false;
    ops.phase = 'UNLOAD';
    ops.blockOccupied = false;
    ops.eStop = false;
    ops.chain = false;
    ops.restraint = 'open';
    ops.unloadUntil = ops.clock + 1.4;
  }
  if (ops.phase === 'UNLOAD' && ops.clock >= (ops.unloadUntil || 0)) {
    ops.passengers = 0;
    ops.autoAt = 0;
    ops.unloadUntil = 0;
    ops.seatFreed = true;
    if ((ops.laps || 0) > 0) ops.photo = (ops.id || 'ride') + ':' + ops.laps;
    if (ops.fault) {
      ops.phase = 'DOWN';
      ops.statusNote = 'temporarily closed';
    } else if (ops.parkClosed || ops.closeAfter) {
      ops.phase = 'CLOSED';
      ops.parkClosed = true;
    } else {
      ops.phase = 'BOARDING';
    }
  }
  if ((ops.phase === 'COURSE' || ops.phase === 'DISPATCH' || ops.phase === 'BRAKE') && ops.restraint !== 'closed') {
    ops.restraint = 'closed';
  }
  return ops;
}

export function waitMinutes(length, speed) {
  const v = speed || 8;
  return Math.max(4, Math.round((length || 80) / v / 60 * 10) / 10);
}
