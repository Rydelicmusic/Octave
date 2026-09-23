/** One boot for the octave layer. The park scene stays the park scene. */
import { resumeScore, mountScoreHud } from '../audio/ride-score.js';
import { entryFromSearch } from '../door/ticket.js';
import { mountMobile, detectPhone, phoneLayout, cheapPolicy, watchPerformance } from '../input/mobile.js';
import { admit } from '../logic/ticket.js';
import { loadVisit, saveVisit, welcomeLine } from '../memory/visit.js';
import { setNpcDrawCap } from '../npc/npc.js';
import { setWaterCheap } from '../water/water.js';
import { getClock } from '../logic/clock.js';
import { isAdmitted } from '../logic/ticket.js';

export function bootOctave(env) {
  const storage = env && env.storage;
  const prior = loadVisit(storage);
  const entry = entryFromSearch((env && env.search) || '');
  if (prior.admit) admit();
  const line = welcomeLine(prior);
  if (entry.admit) saveVisit(storage, { admit: true });
  if (line) saveVisit(storage, { welcomed: true });
  return {
    visit: loadVisit(storage),
    welcome: line,
    entry,
    highlight: prior.lastRideId || '',
  };
}

function applyCheap(policy) {
  setNpcDrawCap(policy.npcs);
  setWaterCheap(policy.water === 'flat');
}

function install(doc) {
  const storage = typeof localStorage !== 'undefined' ? localStorage : null;
  const search = typeof location !== 'undefined' ? location.search : '';
  const result = bootOctave({ storage, search });
  window.__octaveVisit = result.visit;
  window.__octaveWelcome = result.welcome;
  const gesture = () => { resumeScore(); };
  doc.addEventListener('pointerdown', gesture);
  doc.addEventListener('keydown', gesture);
  mountScoreHud(doc);
  const env = detectPhone(doc);
  mountMobile(doc, env);
  if (phoneLayout(env).stick) applyCheap(cheapPolicy('phone'));
  watchPerformance((policy) => applyCheap(policy));
  doc.addEventListener('visibilitychange', () => {
    if (doc.visibilityState !== 'hidden' || !storage) return;
    saveVisit(storage, { lastOpen: getClock().minutes, admit: isAdmitted() });
  });
}

if (typeof document !== 'undefined') install(document);
