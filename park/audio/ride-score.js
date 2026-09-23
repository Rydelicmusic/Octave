/** Song on the rail. One AudioContext, resumed on a gesture. No stem files are shipped, so every ride is an honest stub. Nothing sets an audio src. */
import { RIDE_ANCHORS, blockCoasterSamples } from '../rides/coaster-paths.js';
import { dist3 } from '../rides/path-math.js';

export const BLEED_RADIUS = 80;
export const PLAYER_GAIN = 0.2;
export const BLEED_GAIN = 0.03;

const cues = new Map();
let ear = { x: 0, z: 224, boardedId: null };
let factory = null;
let ctx = null;
let tone = null;
let toneGain = null;
let resumed = false;
let created = 0;
let told = false;
let dropCache = 0;

export function bindAudio(Factory) {
  factory = Factory || null;
  return true;
}

export function audioCreates() {
  return created;
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

function makeContext() {
  if (factory) return new factory();
  const AC = typeof globalThis.AudioContext !== 'undefined'
    ? globalThis.AudioContext
    : typeof globalThis.webkitAudioContext !== 'undefined'
      ? globalThis.webkitAudioContext
      : null;
  return AC ? new AC() : null;
}

/** The only place a context is constructed. Null until the first gesture. */
export function sharedAudio() {
  if (!resumed) return null;
  if (ctx) return ctx;
  ctx = makeContext();
  if (ctx) created += 1;
  return ctx;
}

export function resumeScore() {
  resumed = true;
  const audio = sharedAudio();
  if (audio && audio.state === 'suspended' && typeof audio.resume === 'function') audio.resume();
  noteStub();
  return { created, resumed: true, stub: true, label: 'score: stub' };
}

export function scoreResumed() {
  return resumed;
}

function noteStub() {
  if (told) return;
  told = true;
  if (typeof document !== 'undefined' && typeof console !== 'undefined') console.info('score: stub');
}

export function stubNoted() {
  return told;
}

export function scoreMap() {
  const map = {};
  for (const id of Object.keys(RIDE_ANCHORS)) {
    map[id] = { id, url: null, mode: 'stub', label: 'score: stub' };
  }
  return map;
}

export function scoreUrls() {
  return Object.values(scoreMap()).map((row) => row.url).filter(Boolean);
}

/** First big drop on the hero, measured along the rail. */
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
  if (phase === 'BRAKE') return 'outro';
  if (phase === 'UNLOAD') return 'outro';
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

export function mixFor({ boarded, distance }) {
  if (boarded) return PLAYER_GAIN;
  if ((distance || 0) <= BLEED_RADIUS) return BLEED_GAIN;
  return 0;
}

function ensureTone() {
  const audio = sharedAudio();
  if (!audio || tone) return audio;
  if (typeof audio.createOscillator !== 'function' || typeof audio.createGain !== 'function') return audio;
  tone = audio.createOscillator();
  toneGain = audio.createGain();
  tone.type = 'sawtooth';
  tone.frequency.value = 72;
  toneGain.gain.value = 0;
  tone.connect(toneGain);
  if (audio.destination) toneGain.connect(audio.destination);
  if (typeof tone.start === 'function') tone.start();
  return audio;
}

const CUE_HZ = { idle: 64, lift: 92, drop: 48, course: 76, outro: 58, land: 70 };

function applyTone(row) {
  if (!resumed || !row) return 0;
  ensureTone();
  if (!tone || !toneGain) return 0;
  tone.frequency.value = CUE_HZ[row.cue] || 70;
  tone.type = row.cue === 'drop' ? 'sawtooth' : 'sine';
  toneGain.gain.value = row.gain || 0;
  return toneGain.gain.value;
}

export function heardGain() {
  if (!resumed || !toneGain) return 0;
  return toneGain.gain.value || 0;
}

export function scoreState(id) {
  return cues.get(id) || null;
}

export function scoreHudText() {
  const boarded = ear.boardedId && cues.get(ear.boardedId);
  const hero = cues.get('ride-block-01');
  const row = boarded || hero;
  if (!row) return 'score: stub';
  return 'score: stub · ' + row.cue;
}

export function mountScoreHud(doc) {
  if (!doc || !doc.body || doc.getElementById('score-note')) return null;
  const el = doc.createElement('div');
  el.id = 'score-note';
  el.textContent = 'score: stub';
  el.style.cssText = 'position:fixed;left:12px;bottom:96px;z-index:4;font:11px/1.3 sans-serif;color:#f4efe6;background:rgba(18,16,14,.72);padding:4px 8px;border-radius:8px;pointer-events:none';
  doc.body.appendChild(el);
  return el;
}

function paintHud() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('score-note');
  if (el) el.textContent = scoreHudText();
}

/** Follow arc length. Wall clock does not choose the lift or the drop. */
export function stepScore(list, hear) {
  const at = hear || ear;
  let loudest = null;
  const rows = list && typeof list[Symbol.iterator] === 'function' ? list : [];
  for (const ride of rows) {
    if (!ride || !ride.id) continue;
    const anchor = RIDE_ANCHORS[ride.id] || { x: ride.x || 0, z: ride.z || 0 };
    const distance = Math.hypot((at.x || 0) - anchor.x, (at.z || 0) - anchor.z);
    const boarded = at.boardedId === ride.id;
    const gain = mixFor({ boarded, distance });
    const row = {
      id: ride.id,
      cue: cueForRide(ride),
      gain,
      distance,
      s: ride.s || (ride.ops && ride.ops.s) || 0,
      stub: true,
      label: 'score: stub',
      url: null,
    };
    cues.set(ride.id, row);
    if (!loudest || row.gain > loudest.gain) loudest = row;
  }
  applyTone(loudest);
  paintHud();
  return cues;
}
