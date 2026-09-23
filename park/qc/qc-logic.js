/** Board, dispatch, queue, e-stop. SKIP only when the logic files are absent. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createOps, setRestraint, eStop, advancePhase } from '../rides/ride-ops.js';
import { arcTable } from '../rides/path-math.js';
import { blockCoasterSamples } from '../rides/coaster-paths.js';

const logicDir = path.join(path.dirname(path.dirname(fileURLToPath(import.meta.url))), 'logic');

function row(name, status, detail) {
  return { area: 'logic', name, status, detail: detail || '' };
}

export async function logicRows() {
  if (!fs.existsSync(path.join(logicDir, 'ride-logic.js'))) {
    return [row('ride-logic.js', 'SKIP', 'file not built')];
  }
  const logic = await import('../logic/ride-logic.js');
  const ticket = await import('../logic/ticket.js');
  const queue = await import('../logic/queue.js');
  const rows = [];
  logic.resetParkLogic();
  ticket.admit();

  const table = arcTable(blockCoasterSamples(3).samples);
  const ride = { id: 'ride-block-01', kind: 'coaster', ops: createOps('ride-block-01'), table };
  const joined = logic.joinRide('ride-block-01');
  const boarded = logic.attemptBoard(ride);
  rows.push(row('board at load when admitted', joined.ok && boarded.ok ? 'PASS' : 'FAIL', boarded.reason || ''));

  ride.ops.phase = 'COURSE';
  ride.ops.restraint = 'closed';
  const mid = logic.attemptBoard(ride);
  rows.push(row('board rejected in COURSE', mid.ok === false && mid.reason === 'course' ? 'PASS' : 'FAIL', mid.reason));

  const dispatchRide = { id: 'ride-block-01', kind: 'coaster', ops: createOps('ride-block-01'), table };
  dispatchRide.ops.passengers = 1;
  dispatchRide.ops.phase = 'BOARDING';
  dispatchRide.ops.restraint = 'open';
  dispatchRide.ops.gateOpen = false;
  const open = logic.attemptDispatch(dispatchRide);
  rows.push(row('no dispatch with restraints open', open.ok === false && open.reason === 'restraints' ? 'PASS' : 'FAIL', open.reason));
  setRestraint(dispatchRide.ops, true);
  dispatchRide.ops.gateOpen = false;
  const sent = logic.attemptDispatch(dispatchRide);
  rows.push(row('dispatch when restraints are closed', sent.ok ? 'PASS' : 'FAIL', sent.reason));

  const line = queue.queueFor('qc-queue', 4, 60);
  line.slots[0] = 'riding';
  queue.joinQueue(line, 'player');
  queue.advanceQueue(line);
  rows.push(row('queue advances after unload', line.slots[0] === 'player' ? 'PASS' : 'FAIL', line.slots.join(',')));

  const stopped = createOps('ride-block-01');
  stopped.phase = 'COURSE';
  stopped.s = 90;
  eStop(stopped);
  rows.push(row('e-stop forces BRAKE', stopped.phase === 'BRAKE' ? 'PASS' : 'FAIL', stopped.phase));

  const closing = createOps('ride-block-01');
  closing.phase = 'UNLOAD';
  closing.laps = 1;
  closing.closeAfter = true;
  closing.unloadUntil = closing.clock;
  advancePhase(closing, table, 0.05);
  rows.push(row('close-of-day reaches CLOSED', closing.phase === 'CLOSED' ? 'PASS' : 'FAIL', closing.phase));
  logic.resetParkLogic();
  return rows;
}
