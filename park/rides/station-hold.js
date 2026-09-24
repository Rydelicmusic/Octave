/** Trains wait at the load platform. No ghost dispatch. Player sends the train. */
import { getRide, rideIds } from './ride-runtime.js';
import { currentRide } from './ride-cam.js';

function parked(ride) {
  if (!ride) return false;
  const ops = ride.ops || (ride.ops = {
    id: ride.id,
    phase: 'BOARDING',
    s: 0,
    v: 0,
    a: 0,
    passengers: 0,
    restraint: 'open',
    eStop: false,
    blockOccupied: false,
    clock: 0,
  });
  const guest = !!(ride.guest || (currentRide() && currentRide() === ride.id));
  if (guest && (ops.phase === 'DISPATCH' || ops.phase === 'COURSE' || ops.phase === 'BRAKE')) {
    return false;
  }
  ops.phase = 'BOARDING';
  ops.s = 0;
  ops.v = 0;
  ops.a = 0;
  ops.eStop = false;
  ops.blockOccupied = false;
  ops.readyAt = ops.clock + 99999;
  ops.idleFor = 0;
  ops.dwell = 99999;
  ops.autoAt = 0;
  ops.dummies = 0;
  ops.bots = 0;
  ops.gateHold = !guest;
  ops.gateOpen = true;
  ops.doors = 'open';
  ops.restraint = guest ? ops.restraint : 'open';
  if (!guest) ops.passengers = 0;
  ride.s = 0;
  ride.speed = 0;
  if (ride.machine) {
    ride.machine.phase = 'BOARDING';
    ride.machine.s = 0;
    ride.machine.v = 0;
    ride.machine.eStop = false;
  }
  return true;
}

export function holdStations() {
  let n = 0;
  for (const id of rideIds()) {
    if (parked(getRide(id))) n += 1;
  }
  if (typeof console !== 'undefined') console.info('station-hold: parked', n);
  return n;
}

export function tickStationHold() {
  const riding = currentRide();
  for (const id of rideIds()) {
    const ride = getRide(id);
    if (!ride || !ride.ops) continue;
    const guest = !!(ride.guest || riding === id);
    if (guest && (ride.ops.phase === 'DISPATCH' || ride.ops.phase === 'COURSE' || ride.ops.phase === 'BRAKE')) {
      continue;
    }
    parked(ride);
  }
}

if (typeof window !== 'undefined') {
  window.__holdStations = holdStations;
}
