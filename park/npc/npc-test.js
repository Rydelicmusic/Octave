/** Ground NPCs and the rides that must keep moving. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { arcTable } from '../rides/path-math.js';
import { blockCoasterSamples } from '../rides/coaster-paths.js';
import { createOps } from '../rides/ride-ops.js';
import { registerRide, stepRides, getRide } from '../rides/ride-runtime.js';
import { resetParkLogic } from '../logic/ride-logic.js';
import { bootNpcs, stepNpcs, npcList, NPC_CAP, resetNpcs } from './npc.js';
import { legalWaypoints, pointLegal, nearRail } from './nav.js';
import { occupiesSpine } from '../lock.js';
import { blocksWalk } from '../water/water.js';
import { ROLES } from './roles.js';

export function runNpcTests() {
  const lines = [];
  const fail = [];
  const check = (name, ok, detail) => {
    lines.push((ok ? 'pass' : 'FAIL') + '  ' + name + (detail ? '  ' + detail : ''));
    if (!ok) fail.push(name);
  };
  resetNpcs();
  const crowd = bootNpcs(200);
  check('npc cap', crowd.length === NPC_CAP && NPC_CAP <= 80 && NPC_CAP >= 40, 'n ' + crowd.length);
  const points = legalWaypoints();
  check('waypoints exist and are legal', points.length >= 8 && points.every(pointLegal), 'n ' + points.length);
  for (let t = 0; t < 20; t += 0.1) stepNpcs(0.1);
  let bad = 0;
  let nan = false;
  for (const npc of npcList()) {
    if (!Number.isFinite(npc.x) || !Number.isFinite(npc.z)) nan = true;
    if (occupiesSpine(npc.x, npc.z, 0.4) || blocksWalk(npc.x, npc.z) || nearRail(npc.x, npc.z, 2.4)) bad += 1;
  }
  check('npcs stay off spine, water, and rails', bad === 0 && !nan, 'bad ' + bad);

  resetParkLogic();
  const table = arcTable(blockCoasterSamples(3).samples);
  registerRide({
    id: 'terrain-hero',
    kind: 'path',
    table,
    length: table.length,
    ops: createOps('ride-block-01'),
    phys: { drag: 0.004, liftV: 3.2, brake: 9, minLoop: 6 },
    layout() {},
  });
  registerRide({
    id: 'terrain-wheel',
    kind: 'wheel',
    ops: createOps('ride-board-01'),
    machine: { phase: 'BOARDING', omega: 0, angle: -Math.PI / 2, target: 0.28, turned: 0, count: 16 },
    layout() {},
  });
  for (let t = 0; t < 20; t += 0.05) stepRides(0.05);
  const hero = getRide('terrain-hero');
  const wheel = getRide('terrain-wheel');
  const moving = [hero.ops.s > 1, Math.abs(wheel.machine.omega) > 0.05].filter(Boolean).length;
  check('half the rides still move', moving >= 1, 'moving ' + moving + '/2 s ' + hero.ops.s.toFixed(1));
  check('roles include attendant and guest', ROLES.includes('attendant') && ROLES.includes('guest'));
  return { ok: fail.length === 0, fail, lines };
}

test('npc battery', () => {
  const result = runNpcTests();
  for (const line of result.lines) console.log(line);
  assert.equal(result.ok, true, result.fail.join(', '));
});
