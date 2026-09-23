/** Crowd cap, rails, spine, water, and the train riders that must remain. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bootNpcs, stepNpcs, npcList, NPC_CAP, resetNpcs } from '../npc/npc.js';
import { nearRail, pointLegal } from '../npc/nav.js';
import { roleFor, ROLES } from '../npc/roles.js';
import { occupiesSpine } from '../lock.js';
import { blocksWalk } from '../water/water.js';
import { BOT_CAP } from '../alive/bots.js';

const parkDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function row(name, status, detail) {
  return { area: 'npc', name, status, detail: detail || '' };
}

export function npcRows() {
  const rows = [];
  resetNpcs();
  const crowd = bootNpcs(200);
  rows.push(row('count stays at the cap', crowd.length === NPC_CAP && NPC_CAP <= 80 && NPC_CAP >= 40 ? 'PASS' : 'FAIL', 'n ' + crowd.length + ' cap ' + NPC_CAP));
  for (let t = 0; t < 10; t += 0.1) stepNpcs(0.1);
  let bad = 0;
  let nan = false;
  let guests = 0;
  for (const npc of npcList()) {
    if (!Number.isFinite(npc.x) || !Number.isFinite(npc.z)) nan = true;
    if (occupiesSpine(npc.x, npc.z, 0.4) || blocksWalk(npc.x, npc.z) || nearRail(npc.x, npc.z, 2.4) || !pointLegal(npc)) bad += 1;
    if (npc.role === 'guest' || npc.role === 'queue' || npc.role === 'watch') guests += 1;
  }
  rows.push(row('none on spine, rails, or water', bad === 0 && !nan ? 'PASS' : 'FAIL', 'bad ' + bad));
  rows.push(row('guests are in the plazas after 10s', guests >= 1 ? 'PASS' : 'FAIL', 'guests ' + guests));
  const attendant = roleFor(7);
  rows.push(row('attendants are a hold role', ROLES.includes('attendant') && attendant === 'attendant' ? 'PASS' : 'FAIL', attendant));
  const train = fs.readFileSync(path.join(parkDir, 'rides/track-build.js'), 'utf8');
  rows.push(row('train rider pool still wired', train.includes('seatRiders') && BOT_CAP >= 20 && BOT_CAP <= 80 ? 'PASS' : 'FAIL', 'cap ' + BOT_CAP));
  return rows;
}
