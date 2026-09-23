/** Alive park battery. Run: node --test park/alive/alive-test.js */
import test from 'node:test';
import assert from 'node:assert/strict';
import { arcTable } from '../rides/path-math.js';
import { blockCoasterSamples } from '../rides/coaster-paths.js';
import { createOps, eStop } from '../rides/ride-ops.js';
import { registerRide, stepRides, getRide } from '../rides/ride-runtime.js';
import { resetParkLogic } from '../logic/ride-logic.js';
import { spineHits, resetAgents } from '../logic/agents.js';
import { reserveBots, resetBots, BOT_CAP } from './bots.js';
import { fillBots } from './auto-ops.js';
import { faceCue } from '../rides/ride-audio.js';

function bootPair() {
  resetParkLogic();
  resetAgents();
  const table = arcTable(blockCoasterSamples(3).samples);
  registerRide({
    id: 'alive-hero',
    kind: 'path',
    table,
    length: table.length,
    ops: createOps('ride-block-01'),
    phys: { drag: 0.004, liftV: 3.2, brake: 9, minLoop: 6 },
    layout() {},
  });
  registerRide({
    id: 'alive-wheel',
    kind: 'wheel',
    ops: createOps('ride-board-01'),
    machine: { phase: 'BOARDING', omega: 0, angle: -Math.PI / 2, target: 0.28, turned: 0, count: 16 },
    layout() {},
  });
  return { hero: getRide('alive-hero'), wheel: getRide('alive-wheel') };
}

export function runAliveTests() {
  const lines = [];
  const fail = [];
  const check = (name, ok, detail) => {
    lines.push((ok ? 'pass' : 'FAIL') + '  ' + name + (detail ? '  ' + detail : ''));
    if (!ok) fail.push(name);
  };
  const { hero, wheel } = bootPair();
  let nan = false;
  for (let t = 0; t < 10; t += 0.05) {
    stepRides(0.05);
    if (!Number.isFinite(hero.ops.s) || !Number.isFinite(hero.ops.v) || !Number.isFinite(wheel.machine.omega)) nan = true;
  }
  check('hero s changes within 10s', hero.ops.s > 1, 's ' + hero.ops.s.toFixed(2) + ' ' + hero.ops.phase);
  check('bots on the coaster', (hero.ops.dummies || 0) > 0, 'dummies ' + hero.ops.dummies);
  check('wheel is turning', Math.abs(wheel.machine.omega) > 0.05, 'w ' + wheel.machine.omega);
  check('no NaN', !nan);
  check('idle under 15s', (hero.ops.maxIdle || 0) < 15 && (wheel.ops.maxIdle || 0) < 15, 'hero ' + hero.ops.maxIdle + ' wheel ' + wheel.ops.maxIdle);

  for (let t = 10; t < 40; t += 0.05) stepRides(0.05);
  eStop(hero.ops);
  for (let t = 0; t < 1; t += 0.05) stepRides(0.05);
  check('e-stop is local', hero.ops.phase === 'BRAKE' && hero.ops.s > 20 && !wheel.ops.eStop, hero.ops.phase + ' s ' + hero.ops.s.toFixed(1) + ' wheelStop ' + !!wheel.ops.eStop);
  check('other ride was not the target', wheel.ops.phase !== 'DOWN' && wheel.ops.phase !== 'CLOSED', wheel.ops.phase);

  resetBots();
  const first = reserveBots(100);
  const second = reserveBots(10);
  check('bot pool caps', first === BOT_CAP && second === 0 && BOT_CAP <= 80 && BOT_CAP >= 20, 'got ' + first);
  resetBots();

  const seated = fillBots({ id: 'ride-block-01', ops: createOps('ride-block-01') });
  check('fill puts riders in seats', seated >= 2, String(seated));
  check('spine stays clear', spineHits() === 0, 'hits ' + spineHits());
  const cue = faceCue({ x: -0.8, y: 0, z: 0.2 });
  check('block roar hook', cue.block === true && cue.roar === true);
  const wheelCue = faceCue({ x: 0.8, y: 0, z: 0 });
  check('wheel whoosh hook', wheelCue.wheel === true && wheelCue.whoosh === true);
  return { ok: fail.length === 0, fail, lines };
}

test('alive battery', () => {
  const result = runAliveTests();
  for (const line of result.lines) console.log(line);
  assert.equal(result.ok, true, result.fail.join(', '));
});
