/** Claim the nine queue rides before trees so canopy skips those lots. */
import { claimRide as claimBoard01 } from './ride-board-01.js';
import { claimRide as claimBlock01 } from './ride-block-01.js';
import { claimRide as claimHours01 } from './ride-hours-01.js';
import { claimRide as claimPocket01 } from './ride-pocket-01.js';
import { claimRide as claimBoard02 } from './ride-board-02.js';
import { claimRide as claimBlock02 } from './ride-block-02.js';
import { claimRide as claimHours02 } from './ride-hours-02.js';
import { claimRide as claimPocket02 } from './ride-pocket-02.js';
import { claimRide as claimGateSigns } from './ride-gate-signs.js';
import '../park-kit.js';
import '../gate-icon.js';
import '../halloween/haunt-scene.js';
import './attractions.js';
import '../land-beds.js';

export function claimAllRides() {
  const fns = [
    claimBoard01, claimBlock01, claimHours01, claimPocket01,
    claimBoard02, claimBlock02, claimHours02, claimPocket02, claimGateSigns,
  ];
  return fns.filter((fn) => fn()).length;
}
