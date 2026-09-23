/** Rides run while the park is open. The player is one seat, not the switch. */
import { isOpen } from '../logic/clock.js';
import { ruleFor } from '../logic/ride-logic.js';
import { queueFor } from '../logic/queue.js';
import { weatherHold } from '../logic/safety.js';

export function fillBots(ride) {
  const ops = ride.ops;
  const seats = ruleFor(ride.id).seats || ops.seats || 2;
  const player = ops.passengers === 1 ? 1 : 0;
  const q = queueFor(ride.id, 8, ruleFor(ride.id).cycle || 80);
  const held = !player && q.slots.includes('player') ? 1 : 0;
  ops.seats = seats;
  ops.dummies = Math.max(0, seats - player - held);
  if (!player && held < seats && ops.dummies < 1) ops.dummies = 1;
  ops.bots = ops.dummies;
  return ops.dummies;
}

export function stepAlive(dt, rides) {
  if (!isOpen() || weatherHold()) return;
  const list = rides ? [...rides] : [];
  for (const ride of list) {
    if (!ride || !ride.ops) continue;
    const ops = ride.ops;
    if (ops.phase === 'CLOSED' || ops.phase === 'DOWN' || ops.fault) continue;
    if (ops.phase !== 'BOARDING' && ops.phase !== 'IDLE') {
      ops.idleFor = 0;
      ops.readyAt = 0;
      continue;
    }
    if (ops.passengers !== 1) ops.gateHold = false;
    if (ops.gateHold && ops.passengers === 1) continue;
    ops.idleFor = (ops.idleFor || 0) + (dt || 0);
    ops.maxIdle = Math.max(ops.maxIdle || 0, ops.idleFor);
    fillBots(ride);
    const dwell = ops.dwell == null ? 3 : ops.dwell;
    if (!ops.readyAt) ops.readyAt = (ops.clock || 0) + dwell;
    if ((ops.clock || 0) < ops.readyAt || ops.blockOccupied) continue;
    ops.restraint = 'closed';
    ops.gateOpen = false;
    ops.doors = 'closed';
    ops.phase = 'DISPATCH';
    ops.blockOccupied = true;
    ops.eStop = false;
    ops.dispatchAt = ops.clock || 0;
    if (ride.machine && (ride.machine.phase === 'BOARDING' || ride.machine.phase === 'IDLE' || ride.machine.phase === 'UNLOAD')) {
      ride.machine.phase = 'DISPATCH';
      ride.machine.eStop = false;
    }
  }
}
