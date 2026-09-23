/** Octave layer battery. Stub scores pass. A missing stem file is not a 404. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RIDE_ANCHORS, blockCoasterSamples } from '../rides/coaster-paths.js';
import { arcTable, pointAt } from '../rides/path-math.js';
import { dryRunRide, registerRide, stepRides, getRide } from '../rides/ride-runtime.js';
import { createOps } from '../rides/ride-ops.js';
import { resetParkLogic, attemptBoard, joinRide } from '../logic/ride-logic.js';
import { resetTicket, isAdmitted } from '../logic/ticket.js';
import { stepClock, getClock, dayPart } from '../logic/clock.js';
import { occupiesSpine } from '../lock.js';
import {
  bindAudio, resumeScore, audioCreates, heardGain, scoreMap, scoreUrls,
  heroDropS, cueForRide, mixFor, stepScore, scoreState, BLEED_GAIN, PLAYER_GAIN,
} from '../audio/ride-score.js';
import { entryFromSearch } from '../door/ticket.js';
import { thisParkOnly, directoryFromMap, PARK_ID } from '../door/occupy-link.js';
import {
  resetShow, stepSpectacular, showSnapshot, showHomes, showBlocksGuest,
  archHot, chaseLights, touchesFog,
} from '../show/spectacular.js';
import { phoneLayout, iosGuards, cheapPolicy } from '../input/mobile.js';
import { saveVisit, loadVisit, photoStub, welcomeLine, VISIT_KEY } from '../memory/visit.js';
import { bootOctave } from '../octave/boot.js';

const parkDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function row(area, name, status, detail) {
  return { area, name, status, detail: detail || '' };
}

function memoryStore() {
  const m = new Map();
  return {
    getItem(key) { return m.has(key) ? m.get(key) : null; },
    setItem(key, value) { m.set(key, String(value)); },
  };
}

function seam(table) {
  const a = pointAt(table, 0);
  const b = pointAt(table, table.length);
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

class FakeAudio {
  constructor() {
    FakeAudio.builds += 1;
    this.state = 'suspended';
    this.destination = {};
  }
  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
  createGain() {
    const gain = {
      value: 0,
      cancelScheduledValues() {},
      setValueAtTime() {},
      exponentialRampToValueAtTime() {},
    };
    return { gain, connect() {} };
  }
  createOscillator() {
    return { frequency: { value: 0 }, type: 'sine', connect() {}, start() {} };
  }
}
FakeAudio.builds = 0;

export function octaveRows() {
  const rows = [];
  const index = fs.readFileSync(path.join(parkDir, 'index.html'), 'utf8');
  const live = index.includes('const scene=new THREE.Scene()')
    && index.includes('canvas')
    && index.includes('seed-rides')
    && index.includes('Walk')
    && index.includes('3rd')
    && index.includes('Drone');
  rows.push(row('boot', 'live still populates', live ? 'PASS' : 'FAIL', live ? 'scene, canvas, cameras' : 'blank shell'));

  const map = scoreMap();
  const ids = Object.keys(RIDE_ANCHORS);
  const mapped = ids.every((id) => map[id] && (map[id].mode === 'stub' || map[id].mode === 'file'));
  const urls = scoreUrls();
  const stubbed = ids.every((id) => map[id].mode === 'stub' && map[id].url == null);
  rows.push(row('score', 'ride-score maps all known ids', mapped && stubbed && urls.length === 0 ? 'PASS' : 'FAIL', ids.length + ' stubs'));

  const audioSrc = fs.readFileSync(path.join(parkDir, 'rides/ride-audio.js'), 'utf8');
  const scoreSrc = fs.readFileSync(path.join(parkDir, 'audio/ride-score.js'), 'utf8');
  const noFetch = !/new\s+AudioContext/.test(audioSrc) && !/new AC\(/.test(audioSrc) && !/\.src\s*=/.test(scoreSrc) && !/fetch\(/.test(scoreSrc);
  rows.push(row('score', 'no fake audio url', noFetch ? 'PASS' : 'FAIL', 'stub hook, no src'));

  bindAudio(FakeAudio);
  const length = 500;
  const drop = heroDropS();
  stepScore([{ id: 'ride-block-01', s: drop + 2, length, phase: 'COURSE' }], { x: -187, z: 37, boardedId: 'ride-block-01' });
  const silent = heardGain() === 0 && audioCreates() === 0;
  resumeScore();
  resumeScore();
  const once = audioCreates() === 1 && FakeAudio.builds === 1;
  stepScore([{ id: 'ride-block-01', s: drop + 2, length, phase: 'COURSE' }], { x: -187, z: 37, boardedId: 'ride-block-01' });
  const loud = heardGain() === PLAYER_GAIN;
  stepScore([{ id: 'ride-block-01', s: drop + 2, length, phase: 'COURSE' }], { x: -118, z: 62, boardedId: null });
  const bleed = scoreState('ride-block-01').gain === BLEED_GAIN;
  stepScore([{ id: 'ride-block-01', s: 0, length, phase: 'BOARDING' }], { x: 0, z: 224, boardedId: null });
  const far = scoreState('ride-block-01').gain === 0;
  rows.push(row('score', 'AudioContext created only once', silent && once ? 'PASS' : 'FAIL', 'creates ' + audioCreates()));
  rows.push(row('score', 'player loud, plaza bleed, gate quiet', loud && bleed && far ? 'PASS' : 'FAIL', 'gain ' + heardGain()));

  const liftS = Math.max(length * 0.12, Math.min(drop - 8, drop * 0.8));
  const lift = cueForRide({ id: 'ride-block-01', s: liftS, length, phase: 'COURSE' });
  const hook = cueForRide({ id: 'ride-block-01', s: drop + 4, length, phase: 'COURSE' });
  const outro = cueForRide({ id: 'ride-block-01', s: length * 0.9, length, phase: 'BRAKE' });
  const idle = cueForRide({ id: 'ride-block-01', s: 0, length, phase: 'BOARDING' });
  const wheelBed = cueForRide({ id: 'ride-board-01', phase: 'COURSE' });
  const cuesOk = lift === 'lift' && hook === 'drop' && outro === 'outro' && idle === 'idle' && wheelBed === 'course';
  rows.push(row('score', 'hero score follows s', cuesOk ? 'PASS' : 'FAIL', 'drop ' + drop.toFixed(1) + ' ' + lift + '/' + hook + '/' + outro));

  resetTicket();
  const bare = { id: 'ride-block-01', ops: createOps('ride-block-01') };
  const denied = attemptBoard(bare);
  const refused = denied.ok === false && denied.reason === 'admit';
  entryFromSearch('?dev=1');
  const devTry = attemptBoard({ id: 'ride-block-01', ops: createOps('ride-block-01') });
  const devOk = devTry.reason !== 'admit';
  resetTicket();
  const ticket = entryFromSearch('?admit=1');
  rows.push(row('door', 'door ticket sets admit', ticket.admitted && isAdmitted() ? 'PASS' : 'FAIL', 'admit query'));
  rows.push(row('door', 'board refused when closed and not dev', refused && devOk ? 'PASS' : 'FAIL', denied.reason + ' / dev ' + devTry.reason));

  const crowd = Array.from({ length: 200 }, (_, i) => ({ id: 'park-' + i }));
  const only = thisParkOnly(crowd);
  const mappedDoor = directoryFromMap({ parks: crowd.concat([{ id: PARK_ID }]), count: 200 });
  const onePark = only.length === 1 && only[0].id === PARK_ID && mappedDoor.length === 1 && mappedDoor[0].id === PARK_ID;
  rows.push(row('door', 'directory stays on this park', onePark ? 'PASS' : 'FAIL', 'rows ' + only.length));

  resetShow();
  const homes = showHomes();
  const homesClear = homes.every((home) => !occupiesSpine(home.x, home.z, 1));
  let sawSpine = false;
  let cleared = false;
  let flashed = false;
  let chase = false;
  for (let n = 0; n < 800 && !cleared; n++) {
    const snap = stepSpectacular(0.5, 'dusk');
    if (snap.actors.some((actor) => actor.onSpine)) sawSpine = true;
    if (archHot()) flashed = true;
    if (chaseLights().some((light) => light.on)) chase = true;
    if (sawSpine && snap.mode === 'idle' && snap.buildings === 0 && snap.actors.every((actor) => !actor.onSpine)) cleared = true;
  }
  const edgeOpen = showBlocksGuest(14, 120) === false;
  resetShow();
  const showOk = homesClear && sawSpine && cleared && flashed && chase && edgeOpen && touchesFog() === false;
  rows.push(row('show', 'spectacular clears the spine', showOk ? 'PASS' : 'FAIL', 'saw ' + sawSpine + ' cleared ' + cleared + ' arch ' + flashed));

  const phone = phoneLayout({ coarse: true, width: 390 });
  const desktop = phoneLayout({ coarse: false, width: 1400 });
  const guards = iosGuards();
  const cheap = cheapPolicy('phone');
  const phoneOk = phone.stick && phone.look && phone.board && phone.exit && desktop.stick === false;
  const iosOk = index.includes('touch-action:none') && index.includes('100dvh') && guards.touchAction === 'none' && guards.height === '100dvh';
  const cheapOk = cheap.coaster === true && cheap.score === true && cheap.board === true && cheap.npcs === 16 && cheap.water === 'flat';
  rows.push(row('phone', 'mobile stick exists when coarse', phoneOk ? 'PASS' : 'FAIL', phone.stickId));
  rows.push(row('phone', 'dvh and touch-action stay', iosOk ? 'PASS' : 'FAIL', guards.height));
  rows.push(row('phone', 'cheap mode keeps the coaster', cheapOk ? 'PASS' : 'FAIL', 'npcs ' + cheap.npcs));

  resetTicket();
  const store = memoryStore();
  const photo = photoStub('ride-block-01', 10);
  saveVisit(store, {
    admit: true,
    lastRideId: 'ride-block-01',
    lastPhoto: photo.path,
    lastOpen: 18 * 60,
    spectacularSeen: true,
    welcomed: false,
  });
  const saved = loadVisit(store);
  const round = saved.admit === true && saved.lastRideId === 'ride-block-01' && saved.lastPhoto === photo.path && saved.lastOpen === 18 * 60;
  const first = bootOctave({ storage: store, search: '' });
  const second = bootOctave({ storage: store, search: '' });
  const memoryOk = round && first.welcome === 'welcome back' && first.highlight === 'ride-block-01' && second.welcome === '' && isAdmitted();
  rows.push(row('memory', 'visit roundtrip and welcome once', memoryOk ? 'PASS' : 'FAIL', VISIT_KEY));

  const fresh = memoryStore();
  const opened = bootOctave({ storage: fresh, search: '?admit=1' });
  rows.push(row('memory', 'first ticket is not a welcome back', opened.welcome === '' && opened.entry.admit ? 'PASS' : 'FAIL', opened.welcome || 'first door'));

  const pack = blockCoasterSamples(3);
  const table = arcTable(pack.samples);
  const gap = seam(table);
  rows.push(row('rides', 'coaster still closed', gap < 1.5 ? 'PASS' : 'FAIL', 'seam ' + gap.toFixed(3)));
  const dry = dryRunRide(table, pack.cars || 1, pack.carGap || 0, 0);
  let nan = !dry.ok;
  for (const p of dry.seen || []) if (!Number.isFinite(p.y)) nan = true;
  rows.push(row('rides', 'dry lap has no NaN', !nan ? 'PASS' : 'FAIL', 'maxY ' + (dry.maxY || 0).toFixed(1)));

  resetParkLogic();
  resetShow();
  registerRide({
    id: 'octave-hero',
    kind: 'path',
    table,
    length: table.length,
    ops: createOps('ride-block-01'),
    phys: { drag: 0.004, liftV: 3.2, brake: 9, minLoop: 6 },
    layout() {},
  });
  registerRide({
    id: 'octave-wheel',
    kind: 'wheel',
    ops: createOps('ride-board-01'),
    machine: { phase: 'BOARDING', omega: 0, angle: -Math.PI / 2, target: 0.28, turned: 0, count: 16 },
    layout() {},
  });
  for (let t = 0; t < 10; t += 0.05) stepRides(0.05);
  const dayHero = getRide('octave-hero');
  const dayShow = showSnapshot();
  const dayMove = dayHero.ops.s > 1 && Number.isFinite(dayHero.ops.s) && dayShow.mode === 'idle';
  rows.push(row('rides', 'coaster still moving by day', dayMove ? 'PASS' : 'FAIL', 's ' + dayHero.ops.s.toFixed(2) + ' ' + dayHero.ops.phase));

  stepClock(8 * 3600);
  const part = dayPart(getClock());
  resetShow();
  const before = getRide('octave-hero').ops.s;
  let soakNan = !Number.isFinite(before);
  for (let t = 0; t < 60; t += 0.05) {
    stepRides(0.05);
    const hero = getRide('octave-hero');
    if (!Number.isFinite(hero.ops.s) || !Number.isFinite(hero.ops.v)) soakNan = true;
  }
  const after = getRide('octave-hero');
  const duskShow = showSnapshot();
  const wheel = getRide('octave-wheel');
  const together = !soakNan
    && (part === 'dusk' || part === 'night')
    && after.ops.s > before
    && duskShow.mode === 'show'
    && duskShow.buildings === 0
    && duskShow.actors.some((actor) => actor.onSpine)
    && Math.abs(wheel.machine.omega) > 0.05;
  rows.push(row('soak', 'show runs while the coaster dispatches', together ? 'PASS' : 'FAIL', part + ' s ' + after.ops.s.toFixed(1) + ' show ' + duskShow.mode));

  const mix = mixFor({ boarded: true, distance: 3 }) > mixFor({ boarded: false, distance: 12 });
  rows.push(row('score', 'mix prefers the rider', mix ? 'PASS' : 'FAIL', ''));
  return rows;
}

export function runOctave() {
  const rows = octaveRows();
  const pass = rows.filter((item) => item.status === 'PASS').length;
  const fail = rows.filter((item) => item.status === 'FAIL').length;
  const skip = rows.filter((item) => item.status === 'SKIP').length;
  return { pass, fail, skip, rows };
}

const main = process.argv[1] && process.argv[1].endsWith('qc-octave.js');
if (main) {
  const result = runOctave();
  for (const item of result.rows) {
    console.log(item.status.padEnd(4), item.area.padEnd(8), item.name, item.detail ? '— ' + item.detail : '');
  }
  console.log('pass ' + result.pass + '  fail ' + result.fail + '  skip ' + result.skip);
  process.exit(result.fail ? 1 : 0);
}
