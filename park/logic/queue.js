/** Load queues. A slot is a person, not a painted rail. */

const queues = new Map();

export function createQueue(id, slots = 8, cycle = 120) {
  return {
    id,
    slots: Array.from({ length: slots }, () => null),
    cycle,
  };
}

export function queueFor(id, slots = 8, cycle = 120) {
  let q = queues.get(id);
  if (!q) {
    q = createQueue(id, slots, cycle);
    queues.set(id, q);
  }
  return q;
}

export function resetQueues() {
  queues.clear();
}

export function joinQueue(q, who) {
  if (!q || !who) return false;
  if (q.slots.includes(who)) return true;
  const seat = q.slots.indexOf(null);
  if (seat < 0) return false;
  q.slots[seat] = who;
  return true;
}

export function leaveQueue(q, who) {
  if (!q || !who) return false;
  const i = q.slots.indexOf(who);
  if (i < 0) return false;
  q.slots[i] = null;
  compact(q);
  return true;
}

function compact(q) {
  const filled = q.slots.filter((s) => s);
  while (filled.length < q.slots.length) filled.push(null);
  for (let i = 0; i < q.slots.length; i++) q.slots[i] = filled[i];
}

/** Seat freed: drop the riding hold and pull the line forward. */
export function advanceQueue(q) {
  if (!q) return q;
  if (q.slots[0] === 'riding' || q.slots[0] == null) q.slots[0] = null;
  compact(q);
  return q;
}

export function playerAtLoad(id) {
  const q = queues.get(id);
  return !!(q && q.slots[0] === 'player');
}

/** Player is standing on the load pad. Take the open seat. A bot does not keep it. */
export function claimLoad(id) {
  const q = queueFor(id);
  const mine = q.slots.indexOf('player');
  if (mine === 0) return true;
  if (mine > 0) q.slots[mine] = null;
  const front = q.slots[0];
  if (front === 'riding') return false;
  if (front && String(front).startsWith('agent-')) {
    const hole = q.slots.indexOf(null, 1);
    if (hole > 0) q.slots[hole] = front;
  }
  q.slots[0] = 'player';
  return true;
}

export function partiesAhead(q, who) {
  if (!q) return 0;
  const i = q.slots.indexOf(who);
  if (i < 0) return 0;
  let n = 0;
  for (let k = 0; k < i; k++) if (q.slots[k]) n += 1;
  return n;
}

/** Posted wait in minutes. Parties ahead times one cycle. */
export function postedWait(q, who) {
  if (!q) return 0;
  const ahead = who ? partiesAhead(q, who) : q.slots.filter(Boolean).length;
  return Math.round((ahead * (q.cycle || 120)) / 60 * 10) / 10;
}

export function holdForRide(id) {
  const q = queues.get(id);
  if (!q) return false;
  if (q.slots[0] === 'player') q.slots[0] = 'riding';
  return true;
}
