/** Heavy rides on the locked pads. Does not import ride modules (they import this file). */
import { LOCK, occupiesSpine, nearRing, inStadium } from '../lock.js';
import { arcTable, pointAt } from './path-math.js';
import { RIDE_ANCHORS, blockCoasterSamples, launchCoasterSamples, kiddieSamples, darkSamples } from './coaster-paths.js';
import { buildTrack, buildTrain, placeCars } from './track-build.js';
import { buildStation, buildDarkShell, darkShows, paintShows, buildFence } from './ride-show.js';
import { buildWheel, layoutWheel, buildSwings, layoutSwings, buildDrop, layoutDrop, buildSpin, layoutSpin } from './ride-fleet.js';
import { registerRide, tickMotion, getRide, rideIds } from './ride-runtime.js';
import { applyRideCam, mountRideHud, boardRide, exitRide, currentRide } from './ride-cam.js';
import { playRideBed, clickLift, stopRideBed } from './ride-audio.js';

export { tickMotion, boardRide, exitRide, rideIds };

const ID_TYPE = {
  'ride-block-01': 'coaster',
  'ride-block-02': 'launch',
  'ride-board-01': 'wheel',
  'ride-board-02': 'swings',
  'ride-hours-01': 'dark',
  'ride-hours-02': 'dark2',
  'ride-pocket-01': 'spin',
  'ride-pocket-02': 'kiddie',
  'ride-board-drop': 'drop',
};

const COLORS = {
  coaster: { rail: 0xd5dbe3, body: 0xc45c26, tie: 0x6a5038, lamp: 0xffb060, tunnel: 0x2a241c, roof: 0x3a2a22, bodyPaint: 0x6a4030, trim: 0xc9b48a },
  launch: { rail: 0xf0c040, body: 0xf0c040, tie: 0x4a4030, lamp: 0xffe1b0, tunnel: 0x2a2418, roof: 0x3a3018, bodyPaint: 0x8a7040, trim: 0xf0c040 },
  kiddie: { rail: 0xe7d3b0, body: 0xe07a4a, tie: 0x8a6040, lamp: 0xffc080, tunnel: 0x3a3028, roof: 0xc45c26, bodyPaint: 0xe7c8a0, trim: 0xe07a4a },
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
    const pose = placeCars(THREE, cars, table, s, gap);
    ride.lead = pose;
    const u = table.length ? (s % table.length) / table.length : 0;
    if (shellRide) paintShows(shellRide, u);
    const sample = pointAt(table, s);
    if (sample.lift && currentRide() === ride.id && Math.floor(ride.clock * 8) !== ride._click) {
      ride._click = Math.floor(ride.clock * 8);
      clickLift(ride.id);
    }
  };
}

function buildCoaster(THREE, scene, ride, pack, colors) {
  if (scene.getObjectByName(ride.id + '-world')) return scene.getObjectByName(ride.id + '-anchor');
  const anchor = ensureAnchor(THREE, scene, ride);
  const world = new THREE.Group();
  world.name = ride.id + '-world';
  scene.add(world);
  const table = arcTable(pack.samples);
  buildTrack(THREE, world, table, { name: ride.id, ...colors });
  const cars = buildTrain(THREE, world, pack.cars, colors);
  buildStation(THREE, world, { ...ride, name: ride.name, roof: colors.roof, body: colors.bodyPaint, trim: colors.trim });
  buildFence(THREE, world, pack.samples, ride.id);
  const state = registerRide({
    id: ride.id,
    name: ride.name,
    kind: 'path',
    table,
    length: table.length,
    stationHold: pack.stationHold,
    cars,
    layout: pathLayout(THREE, cars, table, pack.carGap, null),
  });
  state.layout(0, state);
  return anchor;
}

function buildDark(THREE, scene, ride, which) {
  if (scene.getObjectByName(ride.id + '-world')) return scene.getObjectByName(ride.id + '-anchor');
  const anchor = ensureAnchor(THREE, scene, ride);
  const world = new THREE.Group();
  world.name = ride.id + '-world';
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
  const cars = buildTrain(THREE, world, 1, { body: 0x3a3058 });
  buildStation(THREE, world, {
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
    layout: pathLayout(THREE, cars, table, 0, { shell }),
  });
  state.layout(0, state);
  return anchor;
}

function buildWheelRide(THREE, scene, ride) {
  if (scene.getObjectByName(ride.id + '-world')) return scene.getObjectByName(ride.id + '-anchor');
  const anchor = ensureAnchor(THREE, scene, ride);
  const world = new THREE.Group();
  world.name = ride.id + '-world';
  scene.add(world);
  const state = buildWheel(THREE, world, { id: ride.id, x: ride.x, z: ride.z, radius: 14, gondolas: 16 });
  buildStation(THREE, world, { ...ride, z: ride.z - 10, name: ride.name || 'Board Wheel', roof: 0x5a4030, body: 0xc4b08a, trim: 0xe8a040 });
  const reg = registerRide({
    id: ride.id,
    name: ride.name || 'Board Wheel',
    kind: 'wheel',
    rate: 0.22,
    state,
    spec: ride,
    layout(phase, rideState) {
      layoutWheel(state, phase);
      const seat = rideState.boardedSeat || 0;
      const a = phase + (seat / state.gondolas) * Math.PI * 2;
      rideState.eye = () => ({
        x: ride.x + Math.cos(a) * state.radius,
        y: state.hubY + Math.sin(a) * state.radius + 0.45,
        z: ride.z + 0.15,
        lx: -Math.sin(a),
        ly: Math.cos(a),
        lz: 0.15,
        ux: 0, uy: 1, uz: 0,
      });
    },
  });
  reg.layout(0, reg);
  return anchor;
}

function buildSwingsRide(THREE, scene, ride) {
  if (scene.getObjectByName(ride.id + '-world')) return scene.getObjectByName(ride.id + '-anchor');
  const anchor = ensureAnchor(THREE, scene, ride);
  const world = new THREE.Group();
  world.name = ride.id + '-world';
  scene.add(world);
  const at = { id: ride.id, x: ride.x + 18, z: ride.z + 22, height: 20, radius: 8.5, seats: 12 };
  const state = buildSwings(THREE, world, at);
  buildStation(THREE, world, { ...ride, name: ride.name || 'Board Swings', roof: 0x5a4030, body: 0xc4b08a, trim: 0xe8a040 });
  const reg = registerRide({
    id: ride.id,
    name: ride.name || 'Board Swings',
    kind: 'swings',
    rate: 0.45,
    state,
    layout(phase, rideState) {
      const fly = 0.5 + 0.5 * Math.sin(phase * 0.5);
      layoutSwings(state, phase, fly);
      const seat = rideState.boardedSeat || 0;
      const row = state.seats[seat];
      const ang = row.ang + phase;
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
  });
  reg.layout(0, reg);
  return anchor;
}

function buildDropRide(THREE, scene, ride) {
  if (scene.getObjectByName(ride.id + '-world')) return scene.getObjectByName(ride.id + '-anchor');
  const anchor = ensureAnchor(THREE, scene, ride);
  const world = new THREE.Group();
  world.name = ride.id + '-world';
  scene.add(world);
  const state = buildDrop(THREE, world, { id: ride.id, x: ride.x, z: ride.z, height: 28 });
  buildStation(THREE, world, { ...ride, name: ride.name || 'Board Drop', x: ride.x, z: ride.z - 8, roof: 0x5a4030, body: 0xc45c26, trim: 0xc4382a });
  const reg = registerRide({
    id: ride.id,
    name: ride.name || 'Board Drop',
    kind: 'drop',
    rate: 0.18,
    state,
    layout(phase) {
      const u = (phase / (Math.PI * 2)) % 1;
      layoutDrop(state, u < 0 ? u + 1 : u);
      reg.eye = () => ({
        x: ride.x,
        y: state.cab.position.y + 0.45,
        z: ride.z + 0.2,
        lx: 0, ly: u < 0.7 ? 0.2 : -0.35, lz: 1,
        ux: 0, uy: 1, uz: 0,
      });
    },
  });
  reg.layout(0);
  return anchor;
}

function buildSpinRide(THREE, scene, ride) {
  if (scene.getObjectByName(ride.id + '-world')) return scene.getObjectByName(ride.id + '-anchor');
  const anchor = ensureAnchor(THREE, scene, ride);
  const world = new THREE.Group();
  world.name = ride.id + '-world';
  scene.add(world);
  const state = buildSpin(THREE, world, { id: ride.id, x: ride.x, z: ride.z, radius: 6.5, seats: 8 });
  buildStation(THREE, world, { ...ride, z: ride.z - 10, name: ride.name || 'Pocket Spin', roof: 0x6a5840, body: 0xd2c4a0, trim: 0xe07a4a });
  const reg = registerRide({
    id: ride.id,
    name: ride.name || 'Pocket Spin',
    kind: 'spin',
    rate: 0.6,
    state,
    layout(phase, rideState) {
      layoutSpin(state, phase);
      const seat = rideState.boardedSeat || 0;
      const row = state.cars[seat];
      const ang = row.userData.ang + phase;
      const r = state.radius - 1.3;
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
  });
  reg.layout(0, reg);
  return anchor;
}

export function addAttraction(THREE, scene, ride, type) {
  if (!THREE || !scene || !ride) return null;
  hookRideStack(THREE);
  showHud();
  const kind = resolveType(ride, type);
  const spec = anchorFor({ ...ride, name: (RIDE_ANCHORS[ride.id] && RIDE_ANCHORS[ride.id].name) || ride.name });
  if (kind === 'coaster') return buildCoaster(THREE, scene, spec, blockCoasterSamples(3), COLORS.coaster);
  if (kind === 'launch') return buildCoaster(THREE, scene, spec, launchCoasterSamples(2), COLORS.launch);
  if (kind === 'kiddie') return buildCoaster(THREE, scene, spec, kiddieSamples(), COLORS.kiddie);
  if (kind === 'dark') return buildDark(THREE, scene, spec, 1);
  if (kind === 'dark2') return buildDark(THREE, scene, spec, 2);
  if (kind === 'wheel') return buildWheelRide(THREE, scene, spec);
  if (kind === 'swings') return buildSwingsRide(THREE, scene, spec);
  if (kind === 'drop') return buildDropRide(THREE, scene, spec);
  if (kind === 'spin') return buildSpinRide(THREE, scene, spec);
  return buildCoaster(THREE, scene, spec, blockCoasterSamples(3), COLORS.coaster);
}

export function mountAttractions(THREE, scene) {
  if (!THREE || !scene) return null;
  let root = scene.getObjectByName('park-attractions');
  if (!root) {
    root = new THREE.Group();
    root.name = 'park-attractions';
    scene.add(root);
  }
  for (const row of attractionRows()) addAttraction(THREE, scene, row.ride, row.type);
  showHud();
  return root;
}

let armed = false;
let hooked = false;
let hudDone = false;

function showHud() {
  if (hudDone || typeof document === 'undefined') return;
  hudDone = true;
  mountRideHud(attractionRows().map((row) => ({ id: row.ride.id, name: row.ride.name })));
}

export function hookRideStack(THREE) {
  if (!THREE || !THREE.WebGLRenderer || THREE.WebGLRenderer.prototype.__rydelicRideStack) return;
  const proto = THREE.WebGLRenderer.prototype;
  const orig = proto.render;
  proto.__rydelicRideStack = true;
  if (typeof window !== 'undefined') window.__parkRideHook = true;
  proto.render = function renderRideStack(scene, camera) {
    if (!hooked && scene && scene.isScene) {
      hooked = true;
      try { mountAttractions(THREE, scene); } catch (err) { console.warn('attractions', err); }
    }
    try { tickMotion(performance.now()); } catch (err) { console.warn('tickMotion', err); }
    try {
      const riding = applyRideCam(camera);
      if (typeof window !== 'undefined') window.__parkRideDrew = !!riding;
      const ride = riding ? getRide(currentRide()) : null;
      if (ride) playRideBed(ride.id, ride.speed || 0);
      else stopRideBed();
    } catch (err) { console.warn('ride-cam', err); }
    return orig.call(this, scene, camera);
  };
}

export function armAttractions() {
  if (armed || typeof document === 'undefined') return;
  armed = true;
}

armAttractions();
