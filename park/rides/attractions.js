/** Heavy rides on the locked pads. Does not import ride modules (they import this file). */
import { LOCK, occupiesSpine, nearRing, inStadium } from '../lock.js';
import { arcTable } from './path-math.js';
import { RIDE_ANCHORS, blockCoasterSamples, launchCoasterSamples, kiddieSamples, darkSamples, boardFamilySamples, giantBlockPack, gigaBlockPack, hoursLaunchPack, hybridBoardPack, rimBlockPack } from './coaster-paths.js';
import { buildTrack, buildTrain, buildDiveTrain, buildHyperTrain, buildLaunchTrain, buildHybridTrain, buildRimBerm, placeCars } from './track-build.js';
import { buildStation, buildDarkShell, darkShows, paintShows, buildFence } from './ride-show.js';
import { buildWheel, layoutWheel, buildSwings, layoutSwings, buildDrop, buildSpin, layoutSpin } from './ride-fleet.js';
import { registerRide, tickMotion, getRide, rideIds, stepRideSeconds, rideAgain } from './ride-runtime.js';
import { getRail } from './physics.js';
import { createOps } from './ride-ops.js';
import { mountParkOps } from './park-ops.js';
import { applyRideCam, mountRideHud, boardRide, exitRide, currentRide, closeRestraint, requestDispatch, emergencyStop } from './ride-cam.js';
import { tickWalkRide } from '../input/walk-ride.js';
import { playRideBed, playLandBed, faceCue } from './ride-audio.js';
import { tagRide, resetParkLogic } from '../logic/ride-logic.js';
import { mountGround } from '../terrain/ground.js';
import { mountWater } from '../water/water.js';
import { mountNpcs, layoutNpcMesh } from '../npc/npc.js';
import { agentList, AGENT_CAP } from '../logic/agents.js';
import { dayPart, getClock } from '../logic/clock.js';
import { paintBoard } from './ride-cam.js';
import { tickRideAll } from './ride-all.js';

export { tickMotion, boardRide, exitRide, rideIds };

const ID_TYPE = {
  'ride-block-01': 'coaster',
  'ride-block-02': 'giga',
  'ride-board-01': 'wheel',
  'ride-board-02': 'swings',
  'ride-hours-01': 'dark',
  'ride-hours-02': 'lsm',
  'ride-pocket-01': 'spin',
  'ride-pocket-02': 'kiddie',
  'ride-board-drop': 'drop',
  'ride-board-family': 'hybrid',
  'ride-block-rim': 'rim',
};

const COLORS = {
  coaster: { rail: 0xd5dbe3, body: 0xc45c26, tie: 0x6a5038, lamp: 0xffb060, tunnel: 0x2a241c, roof: 0x3a2a22, bodyPaint: 0x6a4030, trim: 0xc9b48a },
  launch: { rail: 0xf0c040, body: 0xf0c040, tie: 0x4a4030, lamp: 0xffe1b0, tunnel: 0x2a2418, roof: 0x3a3018, bodyPaint: 0x8a7040, trim: 0xf0c040 },
  giga: { rail: 0xb7ecee, body: 0x12828a, tie: 0x146870, lamp: 0x9ee8ea, tunnel: 0x14343c, roof: 0x1a4a52, bodyPaint: 0x1c5c64, trim: 0x8fd8dc },
  lsm: { rail: 0xd2c4ff, body: 0x1a1020, tie: 0x241428, lamp: 0xff4ad0, tunnel: 0x140818, roof: 0x241030, bodyPaint: 0x3a1848, trim: 0xc45cff },
  kiddie: { rail: 0xe7d3b0, body: 0xe07a4a, tie: 0x8a6040, lamp: 0xffc080, tunnel: 0x3a3028, roof: 0xc45c26, bodyPaint: 0xe7c8a0, trim: 0xe07a4a },
  family: { rail: 0xf4f7fb, body: 0x6a8fbf, tie: 0x5a4630, lamp: 0xffe1b0, tunnel: 0x243044, roof: 0x3a4a60, bodyPaint: 0xc4b08a, trim: 0x9ec4e8 },
  hybrid: { rail: 0xd5dce4, body: 0x2a2420, tie: 0x6a4224, lamp: 0xffb060, tunnel: 0x241810, roof: 0x5a4030, bodyPaint: 0x6a4224, trim: 0xc5ced6 },
  rim: { rail: 0xe7eaee, body: 0xd9c7a4, tie: 0xc2b59a, lamp: 0xffe6c2, tunnel: 0x3a342c, roof: 0xe7d7b8, bodyPaint: 0xd2c4a4, trim: 0xf2f4f7 },
};

export function rideClear(x, z, radius = 0) {
  if (!inStadium(x, z)) return false;
  if (occupiesSpine(x, z, radius)) return false;
  if (Math.hypot(x, z) < LOCK.hubOuter + radius) return false;
  if (nearRing(x, z, 8)) return false;
  return true;
}

export function exitWorld(ride) {
  const yaw = ride.yaw || 0;
  const side = (ride.w || 6) / 2 + 3.2;
  return {
    x: ride.x + Math.cos(yaw) * side,
    z: ride.z - Math.sin(yaw) * side,
  };
}

export function attractionRows() {
  return Object.values(RIDE_ANCHORS).map((ride) => ({ ride: { ...ride }, type: ride.type }));
}

function resolveType(ride, type) {
  if (ride && ID_TYPE[ride.id]) return ID_TYPE[ride.id];
  return type || 'coaster';
}

function anchorFor(ride) {
  return { ...(RIDE_ANCHORS[ride.id] || {}), ...ride, id: ride.id };
}

function ensureAnchor(THREE, scene, ride) {
  let anchor = scene.getObjectByName(ride.id + '-anchor');
  if (!anchor) {
    anchor = new THREE.Group();
    anchor.name = ride.id + '-anchor';
    scene.add(anchor);
  }
  return anchor;
}

function pathLayout(THREE, cars, table, gap, shellRide) {
  return (s, ride) => {
    const closed = !!(ride.ops && ride.ops.restraint === 'closed');
    const pose = placeCars(THREE, cars, table, s, gap, closed);
    ride.lead = pose;
    const u = table.length ? (s % table.length) / table.length : 0;
    if (shellRide) paintShows(shellRide, u);
  };
}

const PHYS = {
  coaster: { drag: 0.004, liftV: 3.2, brake: 9, minLoop: 6 },
  launch: { drag: 0.0035, liftV: 3.4, brake: 9, minLoop: 8, launch: true, launchA: 22 },
  family: { drag: 0.006, liftV: 3.1, brake: 7, minLoop: 4 },
  kiddie: { drag: 0.02, liftV: 2.2, brake: 4, minLoop: 2.2 },
  dark: { mode: 'cruise', cruise: 1.7, door: 0.6 },
  dark2: { mode: 'cruise', cruise: 1.5, door: 0.7 },
};

function attachOps(ride, extra) {
  const ops = createOps(ride.id);
  return { ops, ...extra };
}

function addAttendant(THREE, station) {
  if (!station) return null;
  const found = station.getObjectByName('attendant');
  if (found) return found;
  const fig = new THREE.Group();
  fig.name = 'attendant';
  const cloth = new THREE.MeshLambertMaterial({ color: 0xc45c26 });
  const skin = new THREE.MeshLambertMaterial({ color: 0xe7c4a8 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.9, 0.28), cloth);
  body.position.y = 1.35;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 5), skin);
  head.position.y = 1.95;
  fig.add(body, head);
  fig.position.set(1.35, 0, 3.6);
  fig.visible = false;
  station.add(fig);
  return fig;
}

function dressLogic(THREE, station, state, track) {
  tagRide(state);
  state.attendant = addAttendant(THREE, station);
  if (track && track.lamps) state.lamps = track.lamps;
}

let guestMesh = null;
let liveTHREE = null;
let lookV = null;

function cueFacing(camera, riding) {
  if (riding || !camera || !liveTHREE || !camera.getWorldDirection) return;
  if (!lookV) lookV = new liveTHREE.Vector3();
  faceCue(camera.getWorldDirection(lookV));
}

function layoutGuests() {
  if (!guestMesh) return;
  const dummy = guestMesh.userData.dummy;
  const list = agentList();
  for (let i = 0; i < AGENT_CAP; i++) {
    const agent = list[i];
    const riding = agent && agent.mode === 'ride';
    dummy.position.set(agent ? agent.x : -150, riding ? -6 : 0.78, agent ? agent.z : 30);
    dummy.scale.set(agent && !riding ? 1 : 0.001, agent && !riding ? 1 : 0.001, agent && !riding ? 1 : 0.001);
    dummy.rotation.set(0, agent ? agent.yaw || 0 : 0, 0);
    dummy.updateMatrix();
    guestMesh.setMatrixAt(i, dummy.matrix);
  }
  guestMesh.instanceMatrix.needsUpdate = true;
}

function mountGuests(THREE, scene) {
  if (!THREE || !scene || scene.getObjectByName('park-guests')) return;
  resetParkLogic();
  const geo = new THREE.BoxGeometry(0.46, 1.55, 0.32);
  const mat = new THREE.MeshLambertMaterial({ color: 0xd7c4a4 });
  guestMesh = new THREE.InstancedMesh(geo, mat, AGENT_CAP);
  guestMesh.name = 'park-guests';
  guestMesh.userData.dummy = new THREE.Object3D();
  scene.add(guestMesh);
  layoutGuests();
}

function buildCoaster(THREE, scene, ride, pack, colors) {
  if (scene.getObjectByName(ride.id + '-world')) return scene.getObjectByName(ride.id + '-anchor');
  const anchor = ensureAnchor(THREE, scene, ride);
  const world = new THREE.Group();
  world.name = ride.id + '-world';
  world.userData.hubKeep = true;
  world.userData.dryKeep = true;
  scene.add(world);
  const table = arcTable(pack.samples);
  const track = buildTrack(THREE, world, table, {
    name: ride.id,
    ...colors,
    railBulk: pack.railBulk,
    postBulk: pack.postBulk,
    gauge: pack.gauge,
    ribbon: pack.ribbon,
    spine: pack.spine,
    spineEmissive: pack.spineEmissive,
    spineGlow: pack.spineGlow,
    spineWide: pack.spineWide,
    spineHigh: pack.spineHigh,
    postWide: pack.postWide,
    rail: pack.beacon ? 0xf7f8fb : colors.rail,
    railEmissive: pack.beacon ? 0xe4edf8 : (colors.railEmissive || 0xb7c4d4),
    support: pack.support || (pack.beacon ? 0xf3efe6 : colors.tie),
    supportEmissive: pack.supportEmissive != null ? pack.supportEmissive : (pack.beacon ? 0xffe1b0 : 0),
    supportGlow: pack.supportGlow != null ? pack.supportGlow : (pack.beacon ? 0.85 : 0),
  });
  const cars = pack.rim
    ? buildHyperTrain(THREE, world, pack.cars || 6, colors, ride.id)
    : pack.hybrid
    ? buildHybridTrain(THREE, world, pack.cars || 2, colors, ride.id)
    : pack.lsm
    ? buildLaunchTrain(THREE, world, pack.cars || 3, colors, ride.id)
    : pack.hyper
      ? buildHyperTrain(THREE, world, pack.cars || 4, colors, ride.id)
      : pack.dive
        ? buildDiveTrain(THREE, world, pack.cars || 3, colors, ride.id)
        : buildTrain(THREE, world, pack.cars, colors, ride.id);
  if (pack.carScale) cars.forEach((car) => car.scale.setScalar(pack.carScale));
  if (pack.beacon) {
    let crest = pack.samples[0];
    for (const p of pack.samples) if (p.y > crest.y) crest = p;
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(2.6, 16, 12),
      new THREE.MeshLambertMaterial({ color: 0xfff6e4, emissive: 0xffc56a, emissiveIntensity: 1.4 }),
    );
    beacon.position.set(crest.x, crest.y + 3.2, crest.z);
    beacon.name = ride.id + '-crest';
    const glow = new THREE.PointLight(0xffc56a, 4.5, 280);
    glow.position.copy(beacon.position);
    world.add(beacon, glow);
  }
  if (pack.giga) {
    let crest = pack.samples[0];
    for (const p of pack.samples) if (p.y > crest.y) crest = p;
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 14, 10),
      new THREE.MeshLambertMaterial({ color: 0xd8fffb, emissive: 0x3ad0c8, emissiveIntensity: 1.2 }),
    );
    cap.position.set(crest.x, crest.y + 2.4, crest.z);
    cap.name = ride.id + '-crest';
    const glow = new THREE.PointLight(0x7ef0ea, 3.2, 220);
    glow.position.copy(cap.position);
    world.add(cap, glow);
  }
  const trainBots = cars.flatMap((car) => (car.userData && car.userData.bots) || []);
  const home = pack.stationAtPath ? pack.samples[0] : null;
  const station = buildStation(THREE, world, {
    ...ride,
    x: home ? home.x : ride.x + 12,
    z: home ? home.z : ride.z,
    name: ride.name,
    roof: colors.roof,
    body: colors.bodyPaint,
    trim: colors.trim,
  });
  buildFence(THREE, world, pack.samples, ride.id);
  if (pack.rim) buildRimBerm(THREE, world, pack.samples, ride.id);
  const state = registerRide({
    id: ride.id,
    name: ride.name,
    kind: 'path',
    table,
    length: table.length,
    stationHold: pack.stationHold,
    cars,
    phys: {
      ...(PHYS[pack.phys] || PHYS.coaster),
      crestHold: pack.crestHold || 0,
      lsmA: pack.lsmA || 0,
      lsmV: pack.lsmV || 0,
      ...(pack.drag != null ? { drag: pack.drag } : {}),
    },
    chains: track.chains,
    brakes: track.brakes,
    dogs: track.dogs,
    gate: station.getObjectByName('load-gate'),
    bots: trainBots,
    layout: pathLayout(THREE, cars, table, pack.carGap, null),
    ...attachOps(ride),
  });
  dressLogic(THREE, station, state, track);
  state.layout(0, state);
  return anchor;
}

function buildDark(THREE, scene, ride, which) {
  if (scene.getObjectByName(ride.id + '-world')) return scene.getObjectByName(ride.id + '-anchor');
  const anchor = ensureAnchor(THREE, scene, ride);
  const world = new THREE.Group();
  world.name = ride.id + '-world';
  world.userData.hubKeep = true;
  world.userData.dryKeep = true;
  scene.add(world);
  const pack = darkSamples(which);
  const shell = buildDarkShell(THREE, world, {
    id: ride.id,
    x: ride.x,
    z: ride.z,
    w: which === 2 ? 16 : 12,
    d: which === 2 ? 20 : 15,
    h: which === 2 ? 7.5 : 6.2,
    body: 0x241830,
    trim: 0x6a4cff,
    show: 0xd4a0ff,
    shows: darkShows(which),
  });
  const table = arcTable(pack.samples);
  const cars = buildTrain(THREE, world, 1, { body: 0x3a3058 }, ride.id);
  const trainBots = cars.flatMap((car) => (car.userData && car.userData.bots) || []);
  const station = buildStation(THREE, world, {
    ...ride,
    z: ride.z + (which === 2 ? 14 : 11),
    name: ride.name,
    roof: 0x1a1428,
    body: 0x2a2438,
    trim: 0x6a4cff,
    yaw: Math.PI,
  });
  const state = registerRide({
    id: ride.id,
    name: ride.name,
    kind: 'path',
    table,
    length: table.length,
    stationHold: 1.4,
    cars,
    shell,
    phys: which === 2 ? PHYS.dark2 : PHYS.dark,
    gate: station.getObjectByName('load-gate'),
    bots: trainBots,
    waitLen: which === 2 ? 7 : 6,
    layout: pathLayout(THREE, cars, table, 0, { shell }),
    ...attachOps(ride),
  });
  dressLogic(THREE, station, state, null);
  state.layout(0, state);
  return anchor;
}

function buildWheelRide(THREE, scene, ride) {
  if (scene.getObjectByName(ride.id + '-world')) return scene.getObjectByName(ride.id + '-anchor');
  const anchor = ensureAnchor(THREE, scene, ride);
  const world = new THREE.Group();
  world.name = ride.id + '-world';
  world.userData.hubKeep = true;
  world.userData.dryKeep = true;
  scene.add(world);
  const state = buildWheel(THREE, world, { id: ride.id, x: ride.x, z: ride.z, radius: 14, gondolas: 16 });
  const station = buildStation(THREE, world, { ...ride, z: ride.z - 10, name: ride.name || 'Board Wheel', roof: 0x5a4030, body: 0xc4b08a, trim: 0xe8a040 });
  const machine = { phase: 'BOARDING', omega: 0, angle: -Math.PI / 2, target: 0.28, turned: 0, count: state.gondolas };
  const reg = registerRide({
    id: ride.id,
    name: ride.name || 'Board Wheel',
    kind: 'wheel',
    rate: 0.22,
    state,
    machine,
    waitLen: 48,
    gate: station.getObjectByName('load-gate'),
    bots: state.bots || [],
    spec: ride,
    layout(angle, rideState) {
      layoutWheel(state, angle);
      const seat = rideState.boardedSeat || 0;
      const a = angle + (seat / state.gondolas) * Math.PI * 2;
      rideState.eye = () => ({
        x: ride.x + Math.cos(a) * state.radius,
        y: state.hubY + Math.sin(a) * state.radius + 0.45,
        z: ride.z + 0.15,
        lx: -Math.sin(a),
        ly: 0.05,
        lz: 0.15,
        ux: 0, uy: 1, uz: 0,
      });
    },
    ...attachOps(ride),
  });
  dressLogic(THREE, station, reg, null);
  reg.layout(machine.angle, reg);
  return anchor;
}

function buildSwingsRide(THREE, scene, ride) {
  if (scene.getObjectByName(ride.id + '-world')) return scene.getObjectByName(ride.id + '-anchor');
  const anchor = ensureAnchor(THREE, scene, ride);
  const world = new THREE.Group();
  world.name = ride.id + '-world';
  world.userData.hubKeep = true;
  world.userData.dryKeep = true;
  scene.add(world);
  const at = { id: ride.id, x: ride.x + 18, z: ride.z + 22, height: 20, radius: 8.5, seats: 12 };
  const state = buildSwings(THREE, world, at);
  const station = buildStation(THREE, world, { ...ride, name: ride.name || 'Board Swings', roof: 0x5a4030, body: 0xc4b08a, trim: 0xe8a040 });
  const machine = { phase: 'BOARDING', omega: 0, omegaMax: 0.85, ramp: 0.28, holdTime: 6, radius: at.radius, angle: 0, kick: 0, mode: 'REST' };
  const reg = registerRide({
    id: ride.id,
    name: ride.name || 'Board Swings',
    kind: 'swings',
    rate: 0.45,
    state,
    machine,
    waitLen: 28,
    gate: station.getObjectByName('load-gate'),
    bots: state.bots || [],
    layout(angle, rideState) {
      const fly = Math.min(1.35, machine.kick || 0);
      layoutSwings(state, angle, fly);
      const seat = rideState.boardedSeat || 0;
      const row = state.seats[seat];
      const ang = row.ang + angle;
      const r = state.radius + fly * 1.4;
      rideState.eye = () => ({
        x: at.x + Math.cos(ang) * r,
        y: state.height - 6.2,
        z: at.z + Math.sin(ang) * r,
        lx: Math.cos(ang),
        ly: -0.05,
        lz: Math.sin(ang),
        ux: 0, uy: 1, uz: 0,
      });
    },
    ...attachOps(ride),
  });
  dressLogic(THREE, station, reg, null);
  reg.layout(0, reg);
  return anchor;
}

function buildDropRide(THREE, scene, ride) {
  if (scene.getObjectByName(ride.id + '-world')) return scene.getObjectByName(ride.id + '-anchor');
  const anchor = ensureAnchor(THREE, scene, ride);
  const world = new THREE.Group();
  world.name = ride.id + '-world';
  world.userData.hubKeep = true;
  world.userData.dryKeep = true;
  scene.add(world);
  const state = buildDrop(THREE, world, { id: ride.id, x: ride.x, z: ride.z, height: 28 });
  const station = buildStation(THREE, world, { ...ride, name: ride.name || 'Board Drop', x: ride.x, z: ride.z - 8, roof: 0x5a4030, body: 0xc45c26, trim: 0xc4382a });
  const machine = {
    phase: 'BOARDING', mode: 'HOIST', y: 2.2, vy: 0, hoistV: 2.5,
    top: 26.6, catchY: 6.2, bottom: 2.2, hangTime: 1.05, peak: 2.2, hoistDy: 0, eStop: false,
  };
  const reg = registerRide({
    id: ride.id,
    name: ride.name || 'Board Drop',
    kind: 'drop',
    rate: 0.18,
    state,
    machine,
    waitLen: 24,
    gate: station.getObjectByName('load-gate'),
    bots: state.bots || [],
    layout(y) {
      state.cab.position.y = y;
      state.physY = y;
      const falling = machine.mode === 'FALL';
      reg.eye = () => ({
        x: ride.x,
        y: y + 0.45,
        z: ride.z + 0.2,
        lx: 0, ly: falling ? -0.4 : 0.12, lz: 1,
        ux: 0, uy: 1, uz: 0,
      });
    },
    ...attachOps(ride),
  });
  dressLogic(THREE, station, reg, null);
  reg.layout(machine.y, reg);
  return anchor;
}

function buildSpinRide(THREE, scene, ride) {
  if (scene.getObjectByName(ride.id + '-world')) return scene.getObjectByName(ride.id + '-anchor');
  const anchor = ensureAnchor(THREE, scene, ride);
  const world = new THREE.Group();
  world.name = ride.id + '-world';
  world.userData.hubKeep = true;
  world.userData.dryKeep = true;
  scene.add(world);
  const state = buildSpin(THREE, world, { id: ride.id, x: ride.x, z: ride.z, radius: 6.5, seats: 8 });
  const station = buildStation(THREE, world, { ...ride, z: ride.z - 10, name: ride.name || 'Pocket Spin', roof: 0x6a5840, body: 0xd2c4a0, trim: 0xe07a4a });
  const baseR = state.radius - 1.3;
  for (const car of state.cars) {
    car.userData.bump = { angle: 0, r: baseR, vr: 1.15, omega: 0.35, ring: state.radius - 0.55, minR: state.radius - 2.4 };
    car.userData.orbitR = baseR;
  }
  const machine = { phase: 'BOARDING', omega: 0, omegaMax: 0.7, ramp: 0.4, holdTime: 5, radius: state.radius, angle: 0, lean: 0, mode: 'REST' };
  const reg = registerRide({
    id: ride.id,
    name: ride.name || 'Pocket Spin',
    kind: 'spin',
    rate: 0.6,
    state,
    machine,
    waitLen: 16,
    gate: station.getObjectByName('load-gate'),
    bots: state.bots || [],
    layout(angle, rideState) {
      layoutSpin(state, angle, machine.lean || 0);
      const seat = rideState.boardedSeat || 0;
      const row = state.cars[seat];
      const ang = row.userData.ang + angle;
      const r = row.userData.orbitR || baseR;
      rideState.eye = () => ({
        x: ride.x + Math.cos(ang) * r,
        y: 1.55,
        z: ride.z + Math.sin(ang) * r,
        lx: -Math.sin(ang),
        ly: 0,
        lz: Math.cos(ang),
        ux: 0, uy: 1, uz: 0,
      });
    },
    ...attachOps(ride),
  });
  dressLogic(THREE, station, reg, null);
  reg.layout(0, reg);
  return anchor;
}

export function addAttraction(THREE, scene, ride, type) {
  if (!THREE || !scene || !ride) return null;
  publishRideHooks();
  hookRideStack(THREE);
  showHud();
  const kind = resolveType(ride, type);
  const spec = anchorFor({ ...ride, name: (RIDE_ANCHORS[ride.id] && RIDE_ANCHORS[ride.id].name) || ride.name });
  if (kind === 'coaster') {
    const pack = ride.id === 'ride-block-01'
      ? { ...giantBlockPack(), beacon: false, ribbon: false, railBulk: 3.2, postBulk: 2.6, gauge: 1.4, support: 0x1a1e22 }
      : { ...blockCoasterSamples(3), phys: 'coaster' };
    const colors = ride.id === 'ride-block-01'
      ? { ...COLORS.coaster, rail: 0x1a1e22, tie: 0x2a2e32, railEmissive: 0x6a7380 }
      : COLORS.coaster;
    return buildCoaster(THREE, scene, spec, pack, colors);
  }
  if (kind === 'giga') return buildCoaster(THREE, scene, spec, gigaBlockPack(), COLORS.giga);
  if (kind === 'lsm') return buildCoaster(THREE, scene, spec, hoursLaunchPack(), COLORS.lsm);
  if (kind === 'launch') return buildCoaster(THREE, scene, spec, { ...launchCoasterSamples(2), phys: 'launch' }, COLORS.launch);
  if (kind === 'kiddie') return buildCoaster(THREE, scene, spec, { ...kiddieSamples(), phys: 'kiddie' }, COLORS.kiddie);
  if (kind === 'hybrid') return buildCoaster(THREE, scene, spec, hybridBoardPack(), COLORS.hybrid);
  if (kind === 'rim') return buildCoaster(THREE, scene, spec, rimBlockPack(), COLORS.rim);
  if (kind === 'family') return buildCoaster(THREE, scene, spec, { ...boardFamilySamples(), phys: 'family' }, COLORS.family);
  if (kind === 'dark') return buildDark(THREE, scene, spec, 1);
  if (kind === 'dark2') return buildDark(THREE, scene, spec, 2);
  if (kind === 'wheel') return buildWheelRide(THREE, scene, spec);
  if (kind === 'swings') return buildSwingsRide(THREE, scene, spec);
  if (kind === 'drop') return buildDropRide(THREE, scene, spec);
  if (kind === 'spin') return buildSpinRide(THREE, scene, spec);
  return buildCoaster(THREE, scene, spec, { ...blockCoasterSamples(3), phys: 'coaster' }, COLORS.coaster);
}

export function mountAttractions(THREE, scene) {
  if (!THREE || !scene) return null;
  let root = scene.getObjectByName('park-attractions');
  if (!root) {
    root = new THREE.Group();
    root.name = 'park-attractions';
    scene.add(root);
  }
  const rows = attractionRows();
  const first = rows.filter((row) => row.ride.id === 'ride-board-family' || row.ride.id === 'ride-board-drop');
  const rest = rows.filter((row) => row.ride.id !== 'ride-board-family' && row.ride.id !== 'ride-board-drop');
  for (const row of first.concat(rest)) {
    try { addAttraction(THREE, scene, row.ride, row.type); }
    catch (err) { console.warn('attraction', row.ride && row.ride.id, err); }
  }
  try { mountParkOps(THREE, scene); } catch (err) { console.warn('park-ops', err); }
  try { mountGuests(THREE, scene); } catch (err) { console.warn('guests', err); }
  try { mountGround(THREE, scene); } catch (err) { console.warn('ground', err); }
  try { mountWater(THREE, scene); } catch (err) { console.warn('water', err); }
  try { mountNpcs(THREE, scene); } catch (err) { console.warn('npcs', err); }
  showHud();
  return root;
}

let armed = false;
let hooked = false;
let hudDone = false;
let boardMeshTries = 0;
let heroTries = 0;

function scrubPadLine(scene) {
  const world = scene && scene.getObjectByName('ride-block-01-world');
  if (!world || !world.children || !world.children.length || typeof document === 'undefined') return;
  document.querySelectorAll('.hud div, .hud b').forEach((el) => {
    if (!el.textContent || !el.textContent.includes('1.2 m pads')) return;
    el.textContent = 'Steel lift west of the spine';
  });
}

function ensureHeroRail() {
  if (heroTries >= 8) return;
  const scene = (typeof window !== 'undefined' && window.__parkScene) || parkScene();
  const THREE = liveTHREE || (typeof window !== 'undefined' && window.__parkTHREE);
  if (!scene || !THREE) return;
  const world = scene.getObjectByName('ride-block-01-world');
  const car = scene.getObjectByName('ride-block-01-car');
  if (world && world.children && world.children.length > 0 && car) {
    heroTries = 8;
    scrubPadLine(scene);
    return;
  }
  heroTries += 1;
  const row = attractionRows().find((item) => item.ride.id === 'ride-block-01');
  if (!row) return;
  try { addAttraction(THREE, scene, row.ride, 'coaster'); }
  catch (err) { console.warn('hero-rail', err); }
  scrubPadLine(scene);
}

function parkScene() {
  for (const id of rideIds()) {
    const ride = getRide(id);
    if (!ride) continue;
    const seeds = [];
    if (ride.cars) seeds.push(...ride.cars);
    if (ride.gate) seeds.push(ride.gate);
    const state = ride.state;
    if (state) seeds.push(state.cab, state.hub, state.root, state.frame, state.mesh);
    for (const seed of seeds) {
      let node = seed;
      while (node && !node.isScene) node = node.parent;
      if (node && node.isScene) return node;
    }
  }
  return null;
}

function ensureBoardMesh() {
  if (boardMeshTries >= 4 || !liveTHREE) return;
  const scene = parkScene();
  if (!scene) return;
  const family = scene.getObjectByName('ride-board-family-world');
  const car = scene.getObjectByName('ride-board-family-car');
  const drop = scene.getObjectByName('ride-board-drop-world');
  const rim = scene.getObjectByName('ride-block-rim-car');
  if (family && car && drop && rim) {
    boardMeshTries = 4;
    return;
  }
  boardMeshTries += 1;
  const rows = attractionRows().filter((row) => row.ride.id === 'ride-board-family' || row.ride.id === 'ride-board-drop' || row.ride.id === 'ride-block-rim');
  for (const row of rows) {
    try { addAttraction(liveTHREE, scene, row.ride, row.type); }
    catch (err) { console.warn('board-hybrid', row.ride && row.ride.id, err); }
  }
  paintOperating(scene);
}

function paintOperating(scene) {
  if (!scene || typeof document === 'undefined') return;
  for (const row of attractionRows()) {
    const dot = document.getElementById('dot-' + row.ride.id);
    if (!dot) continue;
    const world = scene.getObjectByName(row.ride.id + '-world');
    const mesh = !!(world && world.children && world.children.length > 0);
    const car = scene.getObjectByName(row.ride.id + '-car');
    const ride = getRide(row.ride.id);
    const rail = getRail(row.ride.id);
    const railRide = !!(ride && ride.kind === 'path' && !(ride.phys && ride.phys.mode === 'cruise'));
    const live = railRide ? !!(mesh && car && rail && ride.ops) : !!(mesh && ride);
    if (ride && ride.ops) ride.ops.missing = !live;
    const word = live ? 'operating' : 'MISSING';
    if (dot.textContent === word) continue;
    dot.textContent = word;
    dot.style.color = live ? '#8dcc8a' : '#a89880';
  }
}

function showHud() {
  if (hudDone || typeof document === 'undefined') return;
  hudDone = true;
  mountRideHud(attractionRows().map((row) => ({ id: row.ride.id, name: row.ride.name })));
}

function publishRideHooks() {
  if (typeof window === 'undefined') return;
  window.__stepRideSeconds = (n) => stepRideSeconds(n);
  window.__rideAgain = (id) => rideAgain(id || (typeof currentRide === 'function' ? currentRide() : null));
  window.__closeRestraint = () => closeRestraint();
  window.__dispatchRide = () => requestDispatch();
  window.__eStopRide = () => emergencyStop();
  window.__tickRides = () => {
    try {
      ensureHeroRail();
      ensureBoardMesh();
      paintOperating((typeof window !== 'undefined' && window.__parkScene) || parkScene());
      layoutGuests();
      layoutNpcMesh();
      if (typeof window !== 'undefined' && window.__tickWater) window.__tickWater(performance.now() / 1000);
      const hero = getRide('ride-block-01');
      if (hero && hero.lead && hero.lead.p) {
        window.__blockS = {
          s: hero.s,
          y: hero.lead.p.y,
          hold: hero.hold,
          lap: hero.lap,
          holding: !!(hero.ops && hero.ops.holding),
          v: hero.ops ? hero.ops.v : hero.speed,
        };
      }
    } catch (err) { console.warn('tickMotion', err); }
  };
  window.__applyRideCam = (camera) => {
    try {
      tickRideAll(camera);
      if (camera && typeof location !== 'undefined' && location.hash === '#mesh') {
        camera.position.set(18, 26, 168);
        camera.up.set(0, 1, 0);
        camera.lookAt(-220, 24, 28);
      }
      tickWalkRide(camera);
      paintBoard();
      const riding = applyRideCam(camera);
      const ride = riding ? getRide(currentRide()) : null;
      if (ride) playRideBed(ride.id, ride.speed || 0);
      else playLandBed(dayPart(getClock()));
      cueFacing(camera, riding);
      window.__parkRideDrew = !!riding;
    } catch (err) { console.warn('ride-cam', err); }
  };
}

export function hookRideStack(THREE) {
  if (THREE) liveTHREE = THREE;
  publishRideHooks();
  if (!THREE || !THREE.WebGLRenderer) return;
  const proto = THREE.WebGLRenderer.prototype;
  if (!proto.__rydelicRideOrig) proto.__rydelicRideOrig = proto.render;
  const orig = proto.__rydelicRideOrig;
  proto.__rydelicRideStack = true;
  if (typeof window !== 'undefined') window.__parkRideHook = true;
  let mountTries = 0;
  let splashTries = 0;
  let hybridTries = 0;
  proto.render = function renderRideStack(scene, camera) {
    if (!hooked && scene && scene.isScene && mountTries < 4) {
      mountTries += 1;
      try { mountAttractions(THREE, scene); } catch (err) { console.warn('attractions', err); }
      hooked = !!scene.getObjectByName('ride-block-01-bone') || mountTries >= 4;
    }
    if (scene && scene.isScene && hybridTries < 4 && !scene.getObjectByName('ride-board-family-world')) {
      hybridTries += 1;
      try { mountAttractions(THREE, scene); } catch (err) { console.warn('attractions', err); }
    }
    if (scene && scene.isScene && splashTries < 8 && !scene.getObjectByName('water-surface-block-dive-splash')) {
      splashTries += 1;
      try { mountWater(THREE, scene); } catch (err) { console.warn('water', err); }
    }
    try { layoutGuests(); layoutNpcMesh(); if (window.__tickWater) window.__tickWater(performance.now() / 1000); } catch (err) { console.warn('tickMotion', err); }
    try {
      paintBoard();
      const riding = applyRideCam(camera);
      if (typeof window !== 'undefined') window.__parkRideDrew = !!riding;
      const ride = riding ? getRide(currentRide()) : null;
      if (ride) playRideBed(ride.id, ride.speed || 0);
      else playLandBed(dayPart(getClock()));
      cueFacing(camera, riding);
    } catch (err) { console.warn('ride-cam', err); }
    return orig.call(this, scene, camera);
  };
}

export function armAttractions() {
  if (armed || typeof document === 'undefined') return;
  armed = true;
  import('three').then((THREE) => hookRideStack(THREE)).catch((err) => console.warn('attractions', err));
}

armAttractions();
