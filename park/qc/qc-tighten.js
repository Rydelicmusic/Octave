/** One rideable loop. A missing feature stays a fail or an honest stub, never a pass. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { heroBlockPack, heroIssues } from '../rides/paths.js';
import { heroContract, PHASES } from '../rides/contract.js';
import { arcTable, pointAt } from '../rides/path-math.js';
import { dryRunRide, registerRide, stepRides, getRide } from '../rides/ride-runtime.js';
import { createOps } from '../rides/ride-ops.js';
import { resetParkLogic, attemptBoard, joinRide } from '../logic/ride-logic.js';
import { resetTicket, isAdmitted } from '../logic/ticket.js';
import { entryFromSearch } from '../door/ticket.js';
import { pocketPools } from '../water/water.js';
import { scoreMap } from '../audio/ride-score.js';
import { phoneLayout } from '../input/mobile.js';
import { saveVisit, loadVisit } from '../memory/visit.js';

const parkDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function row(name, status, detail) {
  return { area: 'tighten', name, status, detail: detail || '' };
}

function seam(table) {
  const a = pointAt(table, 0);
  const b = pointAt(table, table.length);
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

export function tightenRows() {
  const rows = [];
  const index = fs.readFileSync(path.join(parkDir, 'index.html'), 'utf8');
  const attractions = fs.readFileSync(path.join(parkDir, 'rides/attractions.js'), 'utf8');
  const haunt = fs.readFileSync(path.join(parkDir, 'halloween/haunt-scene.js'), 'utf8');
  const boot = fs.readFileSync(path.join(parkDir, 'rides/haunt-boot.js'), 'utf8');
  const waterStrip = fs.readFileSync(path.join(parkDir, 'no-water.js'), 'utf8');
  const npc = fs.readFileSync(path.join(parkDir, 'npc/npc.js'), 'utf8');
  const door = fs.readFileSync(path.join(parkDir, 'door.html'), 'utf8');
  const track = fs.readFileSync(path.join(parkDir, 'rides/track-build.js'), 'utf8');

  const live = index.includes('const scene=new THREE.Scene()') && index.includes('seed-rides') && index.includes('Walk') && index.includes('3rd') && index.includes('Drone');
  rows.push(row('boot populates a scene', live ? 'PASS' : 'FAIL', live ? 'scene and cameras' : 'blank'));

  const tickCalls = attractions.match(/tickMotion\(/g) || [];
  const renderStart = attractions.indexOf('function renderRideStack');
  const renderEnd = attractions.indexOf('return orig.call', renderStart);
  const renderBody = attractions.slice(renderStart, renderEnd);
  const oneOwner = tickCalls.length === 1 && !renderBody.includes('tickMotion(');
  rows.push(row('one motion owner', oneOwner ? 'PASS' : 'FAIL', 'tickMotion calls ' + tickCalls.length));

  const hauntOnce = haunt.includes('hauntMounted') && haunt.includes("getObjectByName('haunt-scene')") && !/import\s*\{[^}]*\btickMotion\b/.test(boot);
  rows.push(row('haunt mounts once', hauntOnce ? 'PASS' : 'FAIL', 'guard in mountHaunt'));

  const sign = index.includes("ITINERARY.totalMin+' min',ITINERARY.sign.x,ITINERARY.sign.z,0)");
  const hud = !index.includes('1.2 m pads');
  rows.push(row('gate sign faces the guest', sign && hud ? 'PASS' : 'FAIL', sign ? 'yaw 0' : 'still mirrored'));

  const pack = heroBlockPack();
  const table = arcTable(pack.samples);
  const gap = seam(table);
  const issues = heroIssues(pack.samples);
  const contract = heroContract();
  const closed = pack.samples.length >= 24 && gap < 1.5 && issues.length === 0 && contract.carName === 'ride-block-01-car' && contract.boardable && PHASES.includes(contract.phase);
  let maxPathY = 0;
  for (const p of pack.samples) if (p.y > maxPathY) maxPathY = p.y;
  rows.push(row('hero path closed and legal', closed && maxPathY >= 28 ? 'PASS' : 'FAIL', 'n ' + pack.samples.length + ' seam ' + gap.toFixed(3) + ' y ' + maxPathY.toFixed(1) + (issues.length ? ' ' + issues.join(',') : '')));

  const dry = dryRunRide(table, pack.cars, pack.carGap, 0);
  let nan = !dry.ok;
  for (const p of dry.seen || []) if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.z)) nan = true;
  rows.push(row('dry lap has no NaN', !nan ? 'PASS' : 'FAIL', 'maxY ' + (dry.maxY || 0).toFixed(1)));

  resetTicket();
  const denied = attemptBoard({ id: 'ride-block-01', ops: createOps('ride-block-01') });
  entryFromSearch('?dev=1');
  const devTry = attemptBoard({ id: 'ride-block-01', ops: createOps('ride-block-01') });
  resetTicket();
  const admitted = entryFromSearch('?admit=1');
  joinRide('ride-block-01');
  const ride = { id: 'ride-block-01', ops: createOps('ride-block-01') };
  attemptBoard(ride);
  ride.ops.phase = 'COURSE';
  const mid = attemptBoard(ride);
  const gates = denied.reason === 'admit' && devTry.reason !== 'admit' && admitted.admitted && isAdmitted() && mid.reason === 'course';
  rows.push(row('admit and no board in course', gates ? 'PASS' : 'FAIL', denied.reason + ' / ' + mid.reason));

  resetParkLogic();
  registerRide({
    id: 'tighten-hero',
    kind: 'path',
    table,
    length: table.length,
    ops: createOps('ride-block-01'),
    phys: { drag: 0.004, liftV: 3.2, brake: 9, minLoop: 6 },
    layout() {},
  });
  let maxY = 0;
  let maxS = 0;
  let bad = false;
  for (let t = 0; t < 80; t += 0.05) {
    stepRides(0.05);
    const hero = getRide('tighten-hero');
    if (!Number.isFinite(hero.ops.s) || !Number.isFinite(hero.ops.v)) bad = true;
    const p = pointAt(table, hero.ops.s);
    if (p.y > maxY) maxY = p.y;
    if (hero.ops.s > maxS) maxS = hero.ops.s;
  }
  const hero = getRide('tighten-hero');
  const moved = !bad && maxY >= 28 && maxS > table.length * 0.7 && (hero.ops.laps >= 1 || hero.ops.phase === 'BRAKE' || hero.ops.phase === 'UNLOAD' || hero.ops.phase === 'BOARDING');
  rows.push(row('hero climbs and comes home', moved ? 'PASS' : 'FAIL', 'maxY ' + maxY.toFixed(1) + ' maxS ' + maxS.toFixed(1) + ' ' + hero.ops.phase));

  const bots = track.includes('seatRiders') && track.includes('function carName');
  rows.push(row('train cars are named and carry riders', bots ? 'PASS' : 'FAIL', contract.carName));

  const score = scoreMap()['ride-block-01'];
  const stub = score && score.mode === 'stub' && score.url == null;
  rows.push(row('hero score is a silent stub', stub ? 'PASS' : 'FAIL', score ? score.label : 'missing'));

  const doorOk = door.includes('admit=1') && door.includes('dev=1') && door.includes('RYDELIC');
  rows.push(row('door admits this park only', doorOk ? 'PASS' : 'FAIL', 'ticket and dev'));

  const pools = pocketPools();
  const rings = pools.length === 1 && !pools[0].rings && index.includes('window.__PARK_DRY=true');
  const allow = waterStrip.includes('water-surface-');
  rows.push(row('water allow-list, no pocket rings', rings && allow ? 'PASS' : 'FAIL', 'pools ' + pools.length));

  const crowd = npc.includes('bootNpcs(40)');
  rows.push(row('ground npc draw cap is 40', crowd ? 'PASS' : 'FAIL', crowd ? '40' : 'still the old cap'));

  const show = fs.readFileSync(path.join(parkDir, 'octave/boot.js'), 'utf8');
  rows.push(row('spectacular floats stay unmounted', !show.includes('armShow(') ? 'PASS' : 'FAIL', 'stub, no spine parade'));

  const phone = phoneLayout({ coarse: true, width: 390 });
  const desktop = phoneLayout({ coarse: false, width: 1400 });
  rows.push(row('phone stick and board on a coarse pointer', phone.stick && phone.board && desktop.stick === false ? 'PASS' : 'FAIL', phone.stickId));

  const mem = {
    m: new Map(),
    getItem(key) { return this.m.has(key) ? this.m.get(key) : null; },
    setItem(key, value) { this.m.set(key, String(value)); },
  };
  saveVisit(mem, { admit: true, lastRideId: 'ride-block-01' });
  const back = loadVisit(mem);
  rows.push(row('visit remembers admit and last ride', back.admit === true && back.lastRideId === 'ride-block-01' ? 'PASS' : 'FAIL', back.lastRideId || 'empty'));

  return rows;
}

export function runTighten() {
  const rows = tightenRows();
  const pass = rows.filter((item) => item.status === 'PASS').length;
  const fail = rows.filter((item) => item.status === 'FAIL').length;
  const skip = rows.filter((item) => item.status === 'SKIP').length;
  return { pass, fail, skip, rows };
}

const main = process.argv[1] && process.argv[1].endsWith('qc-tighten.js');
if (main) {
  const result = runTighten();
  for (const item of result.rows) {
    console.log(item.status.padEnd(4), item.name, item.detail ? '— ' + item.detail : '');
  }
  console.log('pass ' + result.pass + '  fail ' + result.fail + '  skip ' + result.skip);
  process.exit(result.fail ? 1 : 0);
}
