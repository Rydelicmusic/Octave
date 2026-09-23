/** One record every boardable ride can speak. Path samples are meters, y up. */
import { heroBlockPack } from './paths.js';

export const PHASES = ['IDLE', 'BOARDING', 'COURSE', 'BRAKE', 'UNLOAD', 'DOWN', 'CLOSED'];

export function rideContract(source) {
  const ride = source || {};
  return {
    id: ride.id || '',
    land: ride.land || '',
    type: ride.type || 'coaster',
    path: Array.isArray(ride.path) ? ride.path.map((p) => ({ x: p.x, y: p.y, z: p.z })) : [],
    carName: ride.carName || ((ride.id || 'car') + '-car'),
    phase: PHASES.includes(ride.phase) ? ride.phase : 'BOARDING',
    s: ride.s || 0,
    v: ride.v || 0,
    boardable: ride.boardable !== false,
    scoreKey: ride.scoreKey || ride.id || '',
  };
}

/** The one hero a guest can see from the spine. */
export function heroContract() {
  const pack = heroBlockPack();
  return rideContract({
    id: pack.id,
    land: pack.land,
    type: 'coaster',
    path: pack.samples,
    carName: pack.id + '-car',
    phase: 'BOARDING',
    s: 0,
    v: 0,
    boardable: true,
    scoreKey: pack.id,
  });
}
