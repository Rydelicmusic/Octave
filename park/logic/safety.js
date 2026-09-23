/** E-stop, weather hold, reset. Gates stay shut until reset. */
import { eStop } from '../rides/ride-ops.js';

const safety = { estop: false, weather: false, latched: false };

export function getSafety() {
  return safety;
}

export function resetSafetyState() {
  safety.estop = false;
  safety.weather = false;
  safety.latched = false;
  return safety;
}

export function setWeather(on) {
  safety.weather = !!on;
  return safety.weather;
}

export function weatherHold() {
  return safety.weather;
}

export function estopLatched() {
  return safety.estop;
}

export function tripAll(rides) {
  safety.estop = true;
  safety.latched = true;
  const list = rides || [];
  for (const ride of list) {
    if (!ride || !ride.ops) continue;
    eStop(ride.ops);
    ride.ops.gateHold = true;
    ride.ops.gateOpen = false;
    if (ride.machine && ride.machine.phase !== 'BOARDING' && ride.machine.phase !== 'IDLE') {
      ride.machine.eStop = true;
      ride.machine.phase = 'BRAKE';
    }
  }
  return safety;
}

/** Clears the latch. A down ride at the station can board again. */
export function resetSafety(rides) {
  safety.estop = false;
  safety.weather = false;
  safety.latched = false;
  const list = rides || [];
  for (const ride of list) {
    if (!ride || !ride.ops) continue;
    ride.ops.gateHold = false;
    ride.ops.eStop = false;
    ride.ops.weatherHold = false;
    if (ride.ops.phase === 'DOWN' || ride.ops.fault) {
      ride.ops.fault = false;
      ride.ops.statusNote = '';
      if (ride.ops.s < 1.5) ride.ops.phase = 'BOARDING';
    }
    if (ride.machine) ride.machine.eStop = false;
  }
  return safety;
}
