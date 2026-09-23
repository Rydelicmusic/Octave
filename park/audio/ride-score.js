/** Song on the rail. Audio is off. Hooks stay so the park tick does not throw. */
import { RIDE_ANCHORS, blockCoasterSamples } from '../rides/coaster-paths.js';
import { dist3 } from '../rides/path-math.js';

export const BLEED_RADIUS = 80;
export const PLAYER_GAIN = 0;
export const BLEED_GAIN = 0;

const cues = new Map();
let ear = { x: 0, z: 224, boardedId: null };
let dropCache = 0;

export function bindAudio() {
  return true;
}

export function audioCreates() {
  return 0;
}

export function scoreEar() {
  return ear;
}

export function setScoreEar(next) {
  if (!next) return ear;
  ear = {
    x: Number.isFinite(next.x) ? next.x : 0,
    z: Number.isFinite(next.z) ? next.z : 0,
    boardedId: next.boardedId || null,
  };
  return ear;
}

export function sharedAudio() {
  return null;
}

export function resumeScore() {
  return { created: 0, resumed: false, stub: true, label: 'score: off' };
}

export function scoreResumed() {
  return false;
}

export function stubNoted() {
  return true;
}

export function scoreMap() {
  const map = {};
  for (const id of Object.keys(RIDE_ANCHORS)) {
    map[id] = { id, url: null, mode: 'off', label: 'score: off' };
  }
  return map;
}

export function scoreUrls() {
  return [];
}

export function heroDropS() {
  if (dropCache) return dropCache;
  const samples = blockCoasterSamples(3).samples;
  let s = 0;
  let rise = samples.length ? samples[0].y : 0;
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1];
    const b = samples[i];
    s += dist3(a, b);
    if (b.y > rise) rise = b.y;
    if (rise > 16 && rise - b.y > 8) {
      dropCache = s;
      return dropCache;
    }
  }
  dropCache = s * 0.34 || 80;
  return dropCache;
}

export function cueForHero(ride) {
  const phase = ride.phase || (ride.ops && ride.ops.phase) || 'BOARDING';
  const length = ride.length || 500;
  const s = ride.s || (ride.ops && ride.ops.s) || 0;
  if (phase === 'BRAKE' || phase === 'UNLOAD') return 'outro';
  if (phase === 'BOARDING' || phase === 'IDLE' || phase === 'CLOSED' || phase === 'DOWN') return 'idle';
  const drop = heroDropS();
  if (s < length * 0.1) return 'idle';
  if (s >= drop && s < drop + 48) return 'drop';
  if (s < drop) return 'lift';
  if (s > length * 0.82) return 'outro';
  return 'course';
}

export function cueForRide(ride) {
  if (!ride) return 'idle';
  if (ride.id === 'ride-block-01') return cueForHero(ride);
  const phase = ride.phase || (ride.ops && ride.ops.phase) || 'BOARDING';
  if (phase === 'BRAKE' || phase === 'UNLOAD') return 'outro';
  if (phase === 'COURSE' || phase === 'DISPATCH') return 'course';
  return 'idle';
}

export function mixFor() {
  return 0;
}

export function heardGain() {
  return 0;
}

export function scoreState(id) {
  return cues.get(id) || null;
}

export function scoreHudText() {
  return 'score: off';
}

export function mountScoreHud() {
  return null;
}

export function stepScore(list, hear) {
  const at = hear || ear;
  const rows = list && typeof list[Symbol.iterator] === 'function' ? list : [];
  for (const ride of rows) {
    if (!ride || !ride.id) continue;
    cues.set(ride.id, {
      id: ride.id,
      cue: cueForRide(ride),
      gain: 0,
      distance: Math.hypot((at.x || 0) - ((RIDE_ANCHORS[ride.id] || {}).x || 0), (at.z || 0) - ((RIDE_ANCHORS[ride.id] || {}).z || 0)),
      s: ride.s || (ride.ops && ride.ops.s) || 0,
      stub: true,
      label: 'score: off',
      url: null,
    });
  }
  return cues;
}
