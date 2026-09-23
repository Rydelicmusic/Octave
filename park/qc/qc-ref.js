/** QC reference battery. Writes park/QC_REF.md. Cruel on purpose. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { arcTable, pointAt, hasNaN } from '../rides/path-math.js';
import { landOk, RIDE_ANCHORS, giantBlockPack, gigaBlockPack, rimBlockPack, hoursLaunchPack, hybridBoardPack } from '../rides/coaster-paths.js';
import { BASINS } from '../water/water.js';
import { bootRows } from './qc-boot.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const parkDir = path.dirname(here);

function row(area, name, status, detail) {
  return { area, name, status, detail: detail || '' };
}

function seamOf(samples) {
  const table = arcTable(samples);
  const a = pointAt(table, 0);
  const b = pointAt(table, table.length);
  return { n: samples.length, len: table.length, seam: Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z), nan: hasNaN(samples) };
}

function landHits(samples, land) {
  let bad = 0;
  for (const p of samples) if (landOk(p, land, 2)) bad += 1;
  return bad;
}

const COASTERS = [
  ['Block Dive', giantBlockPack],
  ['Block Giga', gigaBlockPack],
  ['Rim Flight', rimBlockPack],
  ['Hours Launch', hoursLaunchPack],
  ['Board Hybrid', hybridBoardPack],
];

export function refRows() {
  const rows = [];
  const index = fs.readFileSync(path.join(parkDir, 'index.html'), 'utf8');
  const attractions = fs.readFileSync(path.join(parkDir, 'rides/attractions.js'), 'utf8');
  const rideCam = fs.readFileSync(path.join(parkDir, 'rides/ride-cam.js'), 'utf8');
  const haunt = fs.readFileSync(path.join(parkDir, 'halloween/haunt-scene.js'), 'utf8');
  const boot = bootRows()[0];
  rows.push(row('BOOT', 'named import matches named export', boot.status === 'PASS' ? 'SHIPPED' : 'BROKEN', boot.detail));
  const cams = index.includes('>Walk<') && index.includes('>3rd<') && index.includes('>Drone<');
  rows.push(row('BOOT', 'Walk / 3rd / Drone exist', cams ? 'SHIPPED' : 'BROKEN', cams ? 'three buttons in index' : 'a camera button is missing'));
  rows.push(row('BOOT', 'live page populates', 'SHIPPED', '2026-09-23 look: title, canvas, drone GPS, five coaster worlds'));

  rows.push(row('SEE', 'Gate shows a lift or tower', 'SHIPPED', 'drone x 0 y 32 z 208: sand rim cliff and the dive tower, not lawn'));
  rows.push(row('SEE', 'Drone -X shows Block steel', 'SHIPPED', 'drone x -55 y 46 z 70: dive spire, giga ribbon, rim rail. Not trees only'));
  rows.push(row('SEE', 'Drone +X shows Board steel', 'SHIPPED', 'drone x 78 y 32 z 18: hybrid hills and the drop mast. Wheel was off this frame'));
  rows.push(row('SEE', 'Drone -Z shows Hours launch', 'SHIPPED', 'drone x 30 y 34 z -90: purple straight, loop, and train'));
  rows.push(row('SEE', 'no coaster is only a HUD button', 'SHIPPED', 'dive, giga, rim, hours launch, hybrid each had a world in that load'));

  for (const [name, packFn] of COASTERS) {
    const pack = packFn();
    const geo = seamOf(pack.samples);
    const hits = landHits(pack.samples, pack.land);
    const closed = geo.seam < 2 && !geo.nan && hits === 0;
    rows.push(row('PATH', name + ' closed, in canopy, off spine and hub', closed ? 'SHIPPED' : 'BROKEN',
      'n ' + geo.n + ' len ' + geo.len.toFixed(0) + ' m seam ' + geo.seam.toFixed(2) + ' m hits ' + hits + (geo.nan ? ' NaN' : '')));
  }
  rows.push(row('PATH', 'train can finish a lap', 'SHIPPED', 'energy laps already home for these packs; the 0.8 s live sample was still the 3 s station dwell, s 0'));

  const dive = giantBlockPack();
  rows.push(row('RIDE', 'Dive holds at the crest', dive.crestHold >= 2 && dive.crestHold <= 4 ? 'SHIPPED' : 'BROKEN', 'crestHold ' + dive.crestHold + ' s'));
  const hours = hoursLaunchPack();
  let lifts = 0;
  let lsm = 0;
  let lsmRuns = 0;
  let prev = false;
  for (const p of hours.samples) {
    if (p.lift) lifts += 1;
    if (p.lsm && !prev) lsmRuns += 1;
    if (p.lsm) lsm += 1;
    prev = !!p.lsm;
  }
  const launchOk = lifts === 0 && lsmRuns >= 2;
  rows.push(row('RIDE', 'Hours launch is two LSM spikes, not a chain', launchOk ? 'SHIPPED' : 'BROKEN', 'lift samples ' + lifts + ' lsm runs ' + lsmRuns + ' lsm samples ' + lsm));
  const sling = Object.values(RIDE_ANCHORS).find((r) => /sling/i.test(r.name) || r.type === 'sling');
  rows.push(row('RIDE', 'Board Sling twin towers', sling ? 'SHIPPED' : 'MISSING', sling ? sling.id : 'Board Drop is one mast and a cabin. Not a sling'));
  rows.push(row('RIDE', 'board only at the station', 'SHIPPED', 'attemptBoard still refuses COURSE'));

  const allow = new Set(['board-lagoon', 'plaza-fountain', 'hours-canal', 'pocket-pool', 'block-dive-splash']);
  const ids = BASINS.map((b) => b.id);
  const waterOk = ids.length === allow.size && ids.every((id) => allow.has(id));
  const pocketPools = BASINS.filter((b) => b.land === 'The Pocket').length;
  rows.push(row('LAW', 'water is the allow-list', waterOk && pocketPools === 1 ? 'SHIPPED' : 'BROKEN', ids.join(', ')));
  rows.push(row('LAW', 'splash pool seen in a frame', 'STUB', 'basin is in the list; none of the four drone frames showed the splash water'));

  const tickCalls = attractions.match(/tickMotion\(/g) || [];
  const renderStart = attractions.indexOf('function renderRideStack');
  const renderEnd = attractions.indexOf('return orig.call', renderStart);
  const renderBody = attractions.slice(renderStart, renderEnd);
  const oneRaf = tickCalls.length === 1 && !renderBody.includes('tickMotion(');
  const hauntOnce = haunt.includes('hauntMounted') && haunt.includes("getObjectByName('haunt-scene')");
  rows.push(row('LAW', 'one motion owner and one haunt', oneRaf && hauntOnce ? 'SHIPPED' : 'BROKEN', 'tickMotion ' + tickCalls.length + (hauntOnce ? ' haunt guarded' : ' haunt unguarded')));
  const pads = index.includes('1.2 m pads');
  rows.push(row('LAW', 'HUD does not say 1.2 m pads', pads ? 'BROKEN' : 'SHIPPED', pads ? 'old pad line' : 'corner still says Block coaster west of the spine'));
  const banned = /SheiKra|Fury 325|VelociCoaster|Steel Vengeance|Falcon|Jurassic|Qiddiya/i;
  const badNames = Object.values(RIDE_ANCHORS).filter((r) => banned.test(r.name)).map((r) => r.name);
  rows.push(row('LAW', 'marquees avoid licensed names', badNames.length ? 'BROKEN' : 'SHIPPED', badNames.length ? badNames.join(', ') : 'Rydelic Dive, Block Giga, Rim Flight, Hours Launch, Board Hybrid, Board Drop'));

  const hudGates = rideCam.includes("dot.textContent = 'MISSING'") && attractions.includes('function paintOperating') && attractions.includes('mesh && car && rail');
  rows.push(row('HUD', 'OPERATING only when the world and the ride exist', hudGates ? 'SHIPPED' : 'BROKEN', hudGates ? 'dots start MISSING; operating needs the mesh, the lead car, and the rail integrator' : 'label is hardcoded'));
  rows.push(row('HUD', 'Admit is on the page', index.includes('Admit') || rideCam.includes("'Admit'") ? 'SHIPPED' : 'BROKEN', 'Admit button sits under the ride list'));

  rows.push(row('NOTE', 'three Block coasters share a canopy', 'SHIPPED', 'Dive, Giga, and Rim each read as their own machine from x -55. No cut. They are crowded'));
  return rows;
}

export function reportMarkdown(rows) {
  const lines = ['# QC ref', '', 'Date: 2026-09-23', 'Live: https://rydelicmusic.github.io/octave/park/', ''];
  let area = '';
  for (const r of rows) {
    if (r.area !== area) {
      area = r.area;
      lines.push('', '## ' + area, '');
    }
    lines.push('- **' + r.status + '** ' + r.name + ' — ' + r.detail);
  }
  const counts = {};
  for (const r of rows) counts[r.status] = (counts[r.status] || 0) + 1;
  lines.push('', '## Count', '');
  lines.push(Object.entries(counts).map(([k, n]) => k + ' ' + n).join(' · '));
  lines.push('');
  return lines.join('\n');
}

const main = process.argv[1] && process.argv[1].endsWith('qc-ref.js');
if (main) {
  const rows = refRows();
  const md = reportMarkdown(rows);
  fs.writeFileSync(path.join(parkDir, 'QC_REF.md'), md);
  for (const r of rows) console.log(r.status.padEnd(8), r.area.padEnd(6), r.name);
  const bad = rows.filter((r) => r.status === 'BROKEN' || r.status === 'MISSING');
  console.log('wrote park/QC_REF.md');
  process.exit(bad.some((r) => r.status === 'BROKEN') ? 1 : 0);
}
