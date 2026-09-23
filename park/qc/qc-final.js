/** Pivot gate. PASS is a check that held. STUB is an honest incomplete. FAIL blocks the pivot. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { heroBlockPack, heroIssues } from '../rides/paths.js';
import { arcTable, pointAt } from '../rides/path-math.js';
import { dryRunRide, registerRide, getRide } from '../rides/ride-runtime.js';
import { createOps } from '../rides/ride-ops.js';
import { resetParkLogic, attemptBoard, joinRide } from '../logic/ride-logic.js';
import { boardRide, exitRide, currentRide } from '../rides/ride-cam.js';
import { pocketPools, BASINS, waterHitsHubOrSpine } from '../water/water.js';
import { LOCK } from '../lock.js';
import { entryFromSearch } from '../door/ticket.js';
import { resetTicket } from '../logic/ticket.js';

const parkDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const EIGHT = [
  'ride-board-01', 'ride-block-01', 'ride-hours-01', 'ride-pocket-01',
  'ride-board-02', 'ride-block-02', 'ride-hours-02', 'ride-pocket-02',
];

function row(area, name, status, detail) {
  return { area, name, status, detail: detail || '' };
}

function namedExports(src) {
  const names = new Set();
  for (const m of src.matchAll(/export\s+(?:async\s+)?function\s+(\w+)/g)) names.add(m[1]);
  for (const m of src.matchAll(/export\s+(?:const|let|class)\s+(\w+)/g)) names.add(m[1]);
  for (const m of src.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const part of m[1].split(',')) {
      const bit = part.trim();
      if (!bit || bit.startsWith('type ')) continue;
      const alias = bit.split(/\s+as\s+/);
      names.add((alias[1] || alias[0]).trim());
    }
  }
  return names;
}

function specToFile(fromFile, spec) {
  const base = path.resolve(path.dirname(fromFile), spec.split('?')[0]);
  return base.endsWith('.js') ? base : base + '.js';
}

function readImports(file, src) {
  const found = [];
  const named = /import\s*\{([^}]+)\}\s*from\s*['"](\.[^'"]+)['"]/g;
  const side = /import\s*['"](\.[^'"]+)['"]/g;
  let m;
  while ((m = named.exec(src))) {
    for (const part of m[1].split(',')) {
      const bit = part.trim();
      if (!bit) continue;
      found.push({ kind: 'named', imported: bit.split(/\s+as\s+/)[0].trim(), spec: m[2], file });
    }
  }
  while ((m = side.exec(src))) found.push({ kind: 'side', spec: m[1], file });
  return found;
}

function htmlImports(htmlPath) {
  const src = fs.readFileSync(htmlPath, 'utf8');
  const found = [];
  const re = /import\s*(?:\{([^}]+)\}\s*from\s*)?['"](\.[^'"]+)['"]/g;
  let m;
  while ((m = re.exec(src))) {
    if (m[1]) {
      for (const part of m[1].split(',')) {
        const bit = part.trim();
        if (!bit) continue;
        found.push({ kind: 'named', imported: bit.split(/\s+as\s+/)[0].trim(), spec: m[2], file: htmlPath });
      }
    } else found.push({ kind: 'side', spec: m[2], file: htmlPath });
  }
  return found;
}

function bootGraph() {
  const missing = [];
  const seen = new Set();
  const queue = [];
  for (const html of ['index.html', 'door.html']) {
    const full = path.join(parkDir, html);
    if (!fs.existsSync(full)) {
      missing.push('missing ' + html);
      continue;
    }
    queue.push(...htmlImports(full));
  }
  while (queue.length) {
    const item = queue.shift();
    const target = specToFile(item.file, item.spec);
    const key = target + ':' + (item.imported || '*');
    if (seen.has(key)) continue;
    seen.add(key);
    if (!fs.existsSync(target)) {
      missing.push(path.basename(item.file) + ' -> missing ' + item.spec);
      continue;
    }
    const src = fs.readFileSync(target, 'utf8');
    if (item.kind === 'named' && !namedExports(src).has(item.imported)) {
      missing.push(path.basename(item.file) + ' imports ' + item.imported + ' from ' + path.basename(target));
    }
    for (const next of readImports(target, src)) queue.push(next);
  }
  return { missing, files: seen.size };
}

function seam(table) {
  const a = pointAt(table, 0);
  const b = pointAt(table, table.length);
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

export function finalRows() {
  const rows = [];
  const index = fs.readFileSync(path.join(parkDir, 'index.html'), 'utf8');
  const attractions = fs.readFileSync(path.join(parkDir, 'rides/attractions.js'), 'utf8');
  const haunt = fs.readFileSync(path.join(parkDir, 'halloween/haunt-scene.js'), 'utf8');
  const score = fs.readFileSync(path.join(parkDir, 'audio/ride-score.js'), 'utf8');
  const strip = fs.readFileSync(path.join(parkDir, 'no-water.js'), 'utf8');
  const cam = fs.readFileSync(path.join(parkDir, 'rides/ride-cam.js'), 'utf8');
  const layout = fs.readFileSync(path.join(parkDir, 'LAYOUT.md'), 'utf8');

  const graph = bootGraph();
  rows.push(row('boot', 'static imports resolve', graph.missing.length ? 'FAIL' : 'PASS', graph.missing.length ? graph.missing.slice(0, 6).join('; ') : graph.files + ' import edges'));

  const scene = index.includes('const scene=new THREE.Scene()') && index.includes('new THREE.Mesh') && index.includes('canvas');
  const cameras = index.includes('>Walk<') && index.includes('>3rd<') && index.includes('>Drone<');
  rows.push(row('boot', 'scene and cameras are in the page', scene && cameras ? 'PASS' : 'FAIL', scene ? 'scene, mesh, three cameras' : 'blank shell'));

  const lands = ['The Block', 'After Hours', 'The Board', 'The Pocket'].every((name) => layout.includes(name));
  const hotelBuilt = /new THREE\.[A-Za-z]+\([^)]*hotel/i.test(index) || /id:\s*['"]hotel/i.test(index);
  rows.push(row('law', 'four lands, no hotel mesh in the page', lands && !hotelBuilt ? 'PASS' : 'FAIL', 'LAYOUT names held'));

  const pools = pocketPools();
  const hits = waterHitsHubOrSpine();
  const rings = pools.some((pool) => pool.rings) || BASINS.some((basin) => basin.rings);
  const allowIds = BASINS.map((basin) => basin.id).join(', ');
  const ids = BASINS.map((basin) => basin.id);
  const legal = pools.length === 1 && !rings && hits.length === 0 && ids.includes('block-dive-splash') && ids.length === 5;
  rows.push(row('law', 'allow-list water, hub and spine dry', legal ? 'PASS' : 'FAIL', allowIds + ' hits ' + hits.length));

  const contradicts = strip.includes("name.startsWith('water-surface-')") && strip.includes("return false");
  const oldGated = index.includes('window.__PARK_DRY=true') && index.includes('if(!window.__PARK_DRY) LOCK.waters.forEach');
  rows.push(row('law', 'no-water keeps the allow-list and old lakes stay gated', contradicts && oldGated ? 'PASS' : 'FAIL', 'PARK_DRY ' + oldGated));

  const tickCalls = attractions.match(/tickMotion\(/g) || [];
  const renderStart = attractions.indexOf('function renderRideStack');
  const renderEnd = attractions.indexOf('return orig.call', renderStart);
  const renderBody = attractions.slice(renderStart, Math.max(renderStart, renderEnd));
  const oneRideLoop = tickCalls.length === 1 && !renderBody.includes('tickMotion(') && index.includes('requestAnimationFrame(tick)');
  rows.push(row('motion', 'one ride motion owner', oneRideLoop ? 'PASS' : 'FAIL', 'tickMotion calls ' + tickCalls.length));

  const hauntOnce = haunt.includes('hauntMounted') && haunt.includes("getObjectByName('haunt-scene')");
  rows.push(row('motion', 'haunt group latches once', hauntOnce ? 'PASS' : 'FAIL', 'module latch'));

  const pads = EIGHT.every((id) => index.includes(id.replace('ride-', 'addRide').replace(/-([a-z])/g, (_, c) => c.toUpperCase()) || index.includes("'" + id + "'") || index.includes(id)));
  const called = ['addRideBoard01', 'addRideBlock01', 'addRideHours01', 'addRidePocket01', 'addRideBoard02', 'addRideBlock02', 'addRideHours02', 'addRidePocket02'].every((name) => index.includes(name + '('));
  const mark = fs.readFileSync(path.join(parkDir, 'rides/ride-mark.js'), 'utf8');
  rows.push(row('rides', 'eight pad hooks exist', called && mark.includes('PAD_H = 1.2') ? 'PASS' : 'FAIL', '1.2 m stones under the kiosk anchors'));

  const pack = heroBlockPack();
  const table = arcTable(pack.samples);
  const gap = seam(table);
  const issues = heroIssues(pack.samples);
  const dry = dryRunRide(table, pack.cars || 1, pack.carGap || 0, 0);
  let nan = !dry.ok;
  for (const p of dry.seen || []) if (!Number.isFinite(p.y)) nan = true;
  const closed = pack.samples.length >= 24 && gap < 1.5 && issues.length === 0 && !nan;
  rows.push(row('rides', 'hero path closed, no NaN', closed ? 'PASS' : 'FAIL', 'n ' + pack.samples.length + ' seam ' + gap.toFixed(3) + ' maxY ' + (dry.maxY || 0).toFixed(1)));

  resetParkLogic();
  resetTicket();
  entryFromSearch('?admit=1');
  joinRide('ride-block-01');
  registerRide({
    id: 'ride-block-01',
    kind: 'path',
    table,
    length: table.length,
    ops: createOps('ride-block-01'),
    layout() {},
  });
  const boarded = boardRide('ride-block-01');
  const ride = getRide('ride-block-01');
  if (ride && ride.ops) ride.ops.phase = 'COURSE';
  const mid = attemptBoard(ride);
  exitRide();
  const esc = cam.includes("ev.code === 'Escape'") && cam.includes('exitRide()') && cam.includes('clearBoard()');
  const boardOk = boarded === true && mid.reason === 'course' && currentRide() === null && esc;
  rows.push(row('rides', 'board, refuse course, Esc returns Walk', boardOk ? 'PASS' : 'FAIL', 'board ' + boarded + ' ' + mid.reason));

  const hudLie = index.includes('1.2 m pads');
  const hudHonest = index.includes('Block coaster west of the spine');
  rows.push(row('hud', 'copy matches the coaster, not the old pad line', !hudLie && hudHonest ? 'PASS' : 'FAIL', hudLie ? 'still says 1.2 m pads' : 'Block coaster west of the spine'));

  const noFetch = !/\.src\s*=/.test(score) && !/fetch\(/.test(score) && score.includes("mode: 'stub'");
  rows.push(row('perf', 'score stub does not request a missing file', noFetch ? 'PASS' : 'FAIL', 'no audio src'));

  rows.push(row('rides', 'spectacular floats', 'STUB', 'not mounted this era'));
  rows.push(row('rides', 'launch, wheel, swings as a gate walk', 'STUB', 'modules mount; not the proven loop'));

  return rows;
}

export function runFinal() {
  const rows = finalRows();
  const pass = rows.filter((item) => item.status === 'PASS').length;
  const fail = rows.filter((item) => item.status === 'FAIL').length;
  const stub = rows.filter((item) => item.status === 'STUB').length;
  const skip = rows.filter((item) => item.status === 'SKIP').length;
  return { pass, fail, stub, skip, rows };
}

const main = process.argv[1] && process.argv[1].endsWith('qc-final.js');
if (main) {
  const result = runFinal();
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.fail ? 1 : 0);
}
