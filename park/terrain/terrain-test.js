/** Terrain and designed water. Run: node --test park/terrain/terrain-test.js */
import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleHeight, supportSpan, railClear } from './height.js';
import { BASINS, pocketPools, waterHitsHubOrSpine } from '../water/water.js';
import { blockCoasterSamples } from '../rides/coaster-paths.js';
import { LOCK } from '../lock.js';

export function runTerrainTests() {
  const lines = [];
  const fail = [];
  const check = (name, ok, detail) => {
    lines.push((ok ? 'pass' : 'FAIL') + '  ' + name + (detail ? '  ' + detail : ''));
    if (!ok) fail.push(name);
  };
  let spine = 0;
  let worst = 0;
  for (let z = -200; z <= 220; z += 10) {
    const h = sampleHeight(0, z);
    worst = Math.max(worst, Math.abs(h));
    if (Math.abs(h) > 0.25) spine += 1;
  }
  check('spine stays near the old grade', spine === 0, 'worst ' + worst.toFixed(3));
  let hub = 0;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const h = sampleHeight(Math.cos(a) * 10, Math.sin(a) * 10);
    if (Math.abs(h) > 0.2) hub += 1;
  }
  check('hub plaza stays low', hub === 0 && sampleHeight(0, 0) === 0);

  const hits = waterHitsHubOrSpine();
  check('water misses hub and spine', hits.length === 0, hits.join(', '));
  const pools = pocketPools();
  check('one pocket pool', pools.length === 1 && !pools[0].rings, pools.map((p) => p.id).join(','));
  check('no stacked rings', BASINS.every((b) => !b.rings && b.rx > 0 && b.rz > 0));
  check('designed basins', BASINS.length === 5 && BASINS.some((b) => b.id === 'block-dive-splash'), String(BASINS.length));

  let sunk = 0;
  let minClear = Infinity;
  for (const p of blockCoasterSamples(3).samples) {
    const clear = railClear(p.y, sampleHeight(p.x, p.z));
    minClear = Math.min(minClear, clear);
    if (clear < 0.6) sunk += 1;
  }
  check('coaster stays above the berm', sunk === 0, 'min clear ' + minClear.toFixed(2) + ' sunk ' + sunk);
  const span = supportSpan(12, sampleHeight(-200, 20));
  check('support reaches the grade', span.height > 0.8 && span.top > span.foot, 'h ' + span.height.toFixed(2));
  check('hub outer still 32', LOCK.hubOuter === 32);
  return { ok: fail.length === 0, fail, lines };
}

test('terrain battery', () => {
  const result = runTerrainTests();
  for (const line of result.lines) console.log(line);
  assert.equal(result.ok, true, result.fail.join(', '));
});
