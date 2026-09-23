/** Heavy ride battery. Run: node --test park/rides/ride-test.js */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { frameFromTangent, dryLap, hasNaN, arcTable, pointAt } from './path-math.js';
import { allPaths, blockCoasterSamples, launchCoasterSamples, kiddieSamples, darkSamples } from './coaster-paths.js';
import { dryRunRide, tickMotion } from './ride-runtime.js';
import { boardRide, exitRide, currentRide } from './ride-cam.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const parkDir = path.dirname(here);

function namedExports(src) {
  const names = new Set();
  for (const m of src.matchAll(/export\s+(?:async\s+)?function\s+(\w+)/g)) names.add(m[1]);
  for (const m of src.matchAll(/export\s+(?:const|let|class)\s+(\w+)/g)) names.add(m[1]);
  for (const m of src.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const part of m[1].split(',')) {
      const bit = part.trim();
      if (!bit) continue;
      const alias = bit.split(/\s+as\s+/);
      names.add((alias[1] || alias[0]).trim());
    }
  }
  return names;
}

function namedImports(src) {
  const found = [];
  const re = /import\s*\{([^}]+)\}\s*from\s*['"](\.[^'"]+)['"]/g;
  let m;
  while ((m = re.exec(src))) {
    const spec = m[2];
    for (const part of m[1].split(',')) {
      const bit = part.trim();
      if (!bit) continue;
      const alias = bit.split(/\s+as\s+/);
      const imported = alias[0].trim();
      if (imported) found.push({ imported, spec });
    }
  }
  return found;
}

function resolveSpec(fromFile, spec) {
  const base = path.resolve(path.dirname(fromFile), spec);
  if (base.endsWith('.js')) return base;
  return base + '.js';
}

test('every relative named import has a matching export', () => {
  const files = [];
  function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) {
        if (name !== 'backup-version') walk(full);
      } else if (name.endsWith('.js')) files.push(full);
    }
  }
  walk(here);
  const missing = [];
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    for (const row of namedImports(src)) {
      const target = resolveSpec(file, row.spec);
      if (!fs.existsSync(target)) {
        missing.push(path.basename(file) + ' -> missing file ' + row.spec);
        continue;
      }
      const exports = namedExports(fs.readFileSync(target, 'utf8'));
      if (!exports.has(row.imported)) missing.push(path.basename(file) + ' imports ' + row.imported + ' from ' + path.basename(target));
    }
  }
  assert.deepEqual(missing, []);
});

test('tickMotion is exported for haunt-boot', async () => {
  const mod = await import('./attractions.js');
  assert.equal(typeof mod.tickMotion, 'function');
  assert.equal(typeof mod.addAttraction, 'function');
  assert.equal(typeof mod.armAttractions, 'function');
  assert.equal(typeof mod.mountAttractions, 'function');
  assert.equal(typeof mod.attractionRows, 'function');
  const rows = mod.attractionRows();
  assert.ok(rows.length >= 9);
  assert.ok(rows.some((r) => r.type === 'coaster'));
  assert.ok(rows.some((r) => r.type === 'wheel'));
  assert.ok(rows.some((r) => r.type === 'drop'));
});

test('hero coaster is a long closed lap with inversions', () => {
  const hero = blockCoasterSamples(3);
  assert.equal(hero.violations.length, 0, JSON.stringify(hero.violations.slice(0, 3)));
  assert.equal(hero.stats.nan, false);
  assert.ok(hero.stats.count > 400);
  assert.ok(hero.stats.maxY > 28);
  assert.ok(hero.stats.maxY < 45);
  assert.ok(hero.stats.gap < 2.2);
  assert.ok(hero.stats.yJump < 2.2);
  assert.ok(hero.lap.length > 400);
  assert.ok(hero.lap.seam < 0.05);
  assert.equal(hero.cars, 4);
  assert.ok(hero.samples.some((p) => p.inversion));
  assert.ok(hero.samples.some((p) => p.lift));
  assert.ok(hero.samples.some((p) => p.brake));
  assert.ok(hero.samples.some((p) => p.tunnel));
});

test('launch, kiddie, and both dark rides stay legal', () => {
  for (const pack of [launchCoasterSamples(2), kiddieSamples(), darkSamples(1), darkSamples(2), blockCoasterSamples(2)]) {
    assert.equal(pack.violations.length, 0, pack.id + ' ' + JSON.stringify(pack.violations[0]));
    assert.equal(hasNaN(pack.samples), false);
    assert.ok(pack.lap.seam < 0.05);
    assert.ok(pack.stats.gap < 2.5);
    assert.ok(pack.cars >= 1);
  }
  const launch = launchCoasterSamples();
  assert.ok(launch.stats.maxY > 24);
  const kiddie = kiddieSamples();
  assert.ok(kiddie.stats.maxY < 4);
  assert.ok(kiddie.stats.maxY > 1.5);
});

test('frame: facing south, rider right is west', () => {
  const frame = frameFromTangent({ x: 0, y: 0, z: 1 }, 0);
  assert.ok(frame.right.x < -0.8);
  assert.ok(frame.up.y > 0.8);
  assert.ok(Math.abs(frame.forward.z - 1) < 0.05);
  const rolled = frameFromTangent({ x: 0, y: 0, z: 1 }, Math.PI);
  assert.ok(rolled.up.y < -0.8);
});

test('dry-run boards one lap without NaN', () => {
  for (const pack of allPaths()) {
    const table = arcTable(pack.samples);
    const run = dryRunRide(table, pack.cars, pack.carGap || 3, pack.stationHold, 200);
    assert.equal(run.ok, true, pack.id);
    assert.ok(run.lap >= 1);
    assert.equal(run.cars, pack.cars);
    const jump = pack.lap.maxJump;
    assert.ok(jump < 12, pack.id + ' jump ' + jump);
  }
});

test('pointAt seam is the station point', () => {
  const hero = blockCoasterSamples(3);
  const table = arcTable(hero.samples);
  const a = pointAt(table, 0);
  const b = pointAt(table, table.length);
  const c = pointAt(table, table.length * 3);
  assert.ok(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < 0.05);
  assert.ok(Math.hypot(a.x - c.x, a.y - c.y, a.z - c.z) < 0.05);
});

test('camera board api is safe with no scene', () => {
  assert.equal(boardRide('missing'), false);
  exitRide();
  assert.equal(currentRide(), null);
  tickMotion(1.2, 0.016);
  const lap = dryLap(blockCoasterSamples(1).samples, 90);
  assert.ok(lap.endStep < 8);
});
