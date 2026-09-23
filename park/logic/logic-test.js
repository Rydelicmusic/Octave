/** Park logic battery. Run: node --test park/logic/logic-test.js */
import test from 'node:test';
import assert from 'node:assert/strict';
import { arcTable } from '../rides/path-math.js';
import { blockCoasterSamples } from '../rides/coaster-paths.js';
import { createOps, setRestraint, tryDispatch, eStop, advancePhase } from '../rides/ride-ops.js';
import { stepEnergy } from '../rides/physics.js';
import { occupiesSpine } from '../lock.js';
import { getClock, stepClock, isOpen, formatClock, setDayScale } from './clock.js';
import { queueFor, joinQueue, leaveQueue, advanceQueue, postedWait, resetQueues } from './queue.js';
import { admit, isAdmitted, setCheat, resetTicket, takeMerch } from './ticket.js';
import { tripAll, setWeather, resetSafety, weatherHold } from './safety.js';
import { bootAgents, stepAgents, agentList, spineHits, AGENT_CAP } from './agents.js';
import {
  resetParkLogic, attemptBoard, attemptDispatch, joinRide, markFault, rideStatus,
  blockSection, sectionClear, stepParkLogic, ruleFor, RIDE_RULES,
} from './ride-logic.js';

const HERO = { drag: 0.004, liftV: 3.2, brake: 9, minLoop: 6 };

function heroRide(ops) {
  const pack = blockCoasterSamples(3);
  return {
    id: 'ride-block-01',
    kind: 'coaster',
    ops,
    table: arcTable(pack.samples),
    length: 0,
  };
}

export function runLogicTests() {
  const lines = [];
  const fail = [];
  const check = (name, ok, detail) => {
    lines.push((ok ? 'pass' : 'FAIL') + '  ' + name + (detail ? '  ' + detail : ''));
    if (!ok) fail.push(name);
  };

  resetParkLogic();
  check('clock opens at 10', isOpen(getClock()) && formatClock(getClock()) === '10:00', formatClock(getClock()));
  check('rules cover the rides', Object.keys(RIDE_RULES).length >= 9, String(Object.keys(RIDE_RULES).length));

  const bare = heroRide(createOps('ride-block-01'));
  bare.table = arcTable(blockCoasterSamples(3).samples);
  const denied = attemptBoard(bare);
  check('no board without admit', denied.ok === false && denied.reason === 'admit', denied.reason);
  setCheat(true);
  check('cheat admits', isAdmitted());
  resetTicket();
  admit();
  check('gate admit', isAdmitted());

  const queued = joinRide('ride-block-01');
  check('player reaches load', queued.ok && queued.at === 0, 'at ' + queued.at);
  const boarded = attemptBoard(bare);
  check('board at load', boarded.ok === true, boarded.reason);
  bare.ops.phase = 'COURSE';
  bare.ops.restraint = 'closed';
  const mid = attemptBoard(bare);
  check('no board in course', mid.ok === false && mid.reason === 'course', mid.reason);

  const dispatchRide = heroRide(createOps('ride-block-01'));
  dispatchRide.table = bare.table;
  admit();
  joinQueue(queueFor('ride-block-02'), 'player');
  dispatchRide.id = 'ride-block-01';
  dispatchRide.ops.passengers = 1;
  dispatchRide.ops.phase = 'BOARDING';
  dispatchRide.ops.restraint = 'open';
  dispatchRide.ops.gateOpen = false;
  const openBar = attemptDispatch(dispatchRide);
  check('no dispatch restraints open', openBar.ok === false && openBar.reason === 'restraints', openBar.reason);
  setRestraint(dispatchRide.ops, true);
  dispatchRide.ops.gateOpen = true;
  const openGate = attemptDispatch(dispatchRide);
  check('no dispatch gates open', openGate.ok === false && openGate.reason === 'gates', openGate.reason);
  dispatchRide.ops.gateOpen = false;
  const sent = attemptDispatch(dispatchRide);
  check('dispatch when clear', sent.ok === true, sent.reason);

  const stopped = createOps('ride-block-01');
  stopped.phase = 'COURSE';
  stopped.s = 180;
  stopped.v = 12;
  eStop(stopped);
  check('e-stop forces brake', stopped.phase === 'BRAKE' && stopped.gateOpen === false, stopped.phase);
  const before = stopped.s;
  for (let t = 0; t < 1; t += 0.05) stepEnergy(stopped, bare.table, 0.05, HERO);
  check('e-stop stays on the rail', stopped.s > before - 1 && stopped.s > 100, stopped.s.toFixed(1));

  resetQueues();
  const line = queueFor('ride-board-01', 4, 48);
  line.slots[0] = 'riding';
  joinQueue(line, 'player');
  advanceQueue(line);
  check('queue advances after unload', line.slots[0] === 'player', line.slots.join(','));
  leaveQueue(line, 'player');
  check('abandon frees the slot', line.slots[0] == null);
  const wait = postedWait(queueFor('ride-block-01', 8, 120), 'nobody');
  check('posted wait is finite', Number.isFinite(wait));

  const closing = heroRide(createOps('ride-block-01'));
  closing.ops.phase = 'COURSE';
  closing.ops.closeAfter = true;
  closing.ops.s = 0.4;
  closing.ops.v = 0.2;
  closing.ops.laps = 1;
  closing.ops.arrived = true;
  advancePhase(closing.ops, bare.table, 0.05);
  check('cycle reaches unload', closing.ops.phase === 'UNLOAD', closing.ops.phase);
  closing.ops.unloadUntil = closing.ops.clock;
  advancePhase(closing.ops, bare.table, 0.05);
  check('close of day ends closed', closing.ops.phase === 'CLOSED', closing.ops.phase);
  check('photo after a lap', typeof closing.ops.photo === 'string' && closing.ops.photo.indexOf('1') > 0, closing.ops.photo || '');

  const down = heroRide(createOps('ride-block-01'));
  down.ops.phase = 'COURSE';
  down.ops.s = 40;
  down.ops.v = 8;
  markFault(down.ops);
  const faultAt = down.ops.s;
  stepEnergy(down.ops, bare.table, 0.2, HERO);
  check('fault evacuates forward', down.ops.phase === 'BRAKE' && down.ops.s > faultAt - 1 && down.ops.statusNote === 'temporarily closed', down.ops.s.toFixed(1));
  check('status down', rideStatus(down.ops) === 'down');

  const blocked = createOps('ride-block-01');
  blocked.blockOccupied = true;
  blocked.section = 'lift';
  blocked.s = 80;
  check('occupied block refuses the section', sectionClear(blocked, 'lift') === false && blockSection(80, 500) === 'lift');
  check('one train documented', ruleFor('ride-block-01').seats === 4);

  setWeather(true);
  check('weather hold', weatherHold() === true);
  const wet = heroRide(createOps('ride-block-01'));
  wet.ops.passengers = 1;
  wet.ops.phase = 'BOARDING';
  wet.ops.restraint = 'closed';
  wet.ops.gateOpen = false;
  const held = attemptDispatch(wet);
  check('weather blocks dispatch', held.ok === false && held.reason === 'weather', held.reason);
  resetSafety([wet]);
  check('reset clears weather', weatherHold() === false);

  const crowd = tripAll([wet]);
  check('park e-stop latches', crowd.estop === true && wet.ops.phase !== 'COURSE');

  bootAgents(AGENT_CAP);
  check('at least 20 guests', agentList().length >= 20, String(agentList().length));
  for (let t = 0; t < 30; t += 0.1) stepAgents(0.1);
  let nanAgent = false;
  for (const agent of agentList()) {
    if (!Number.isFinite(agent.x) || !Number.isFinite(agent.z)) nanAgent = true;
    if (occupiesSpine(agent.x, agent.z, 0.45)) nanAgent = true;
  }
  check('agents stay off the spine', spineHits() === 0 && !nanAgent, 'hits ' + spineHits());

  const merch = takeMerch('block-cart');
  check('merch stub clicks', merch.ok === true && merch.paid === false);

  resetParkLogic();
  setDayScale(60);
  const soakRide = heroRide(createOps('ride-block-01'));
  soakRide.table = bare.table;
  let nan = false;
  for (let t = 0; t < 60; t += 0.25) {
    const row = stepParkLogic(0.25, [soakRide]);
    stepClock(0);
    if (!Number.isFinite(row.minutes) || !Number.isFinite(soakRide.ops.s) || !Number.isFinite(soakRide.ops.v)) nan = true;
  }
  check('60s soak has no NaN', !nan && isOpen(getClock()), formatClock(getClock()));
  check('hero still a coaster rule', ruleFor('ride-block-01').kind === 'coaster');

  resetParkLogic();
  admit();
  const walked = heroRide(createOps('ride-block-01'));
  walked.table = bare.table;
  const joined = joinRide('ride-block-01');
  const onTrain = attemptBoard(walked);
  setRestraint(walked.ops, true);
  walked.ops.gateOpen = false;
  const go = attemptDispatch(walked);
  let photo = '';
  if (go.ok) {
    for (let t = 0; t < 420 && walked.ops.phase !== 'BOARDING'; t += 0.05) {
      const moving = walked.ops.phase === 'DISPATCH' || walked.ops.phase === 'COURSE' || walked.ops.phase === 'BRAKE';
      if (moving) stepEnergy(walked.ops, walked.table, 0.05, HERO);
      else { walked.ops.v = 0; walked.ops.a = 0; }
      advancePhase(walked.ops, walked.table, 0.05);
      if (!Number.isFinite(walked.ops.s) || !Number.isFinite(walked.ops.v)) nan = true;
    }
    photo = walked.ops.photo || '';
  }
  const wheelLine = joinRide('ride-board-01');
  check('walk ticket queue lap photo wheel', joined.ok && onTrain.ok && go.ok && walked.ops.s < 1.5 && photo.length > 0 && wheelLine.ok, photo + ' wheel ' + wheelLine.at);

  const again = tryDispatch(createOps('missing'));
  check('empty ops refuses dispatch', again === false);

  return { ok: fail.length === 0, fail, lines };
}

test('logic battery', () => {
  const result = runLogicTests();
  for (const line of result.lines) console.log(line);
  assert.equal(result.ok, true, result.fail.join(', '));
});
