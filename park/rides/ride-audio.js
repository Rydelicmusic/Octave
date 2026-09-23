/** Per-ride audio hook. Uses the one shared context after a gesture. No audio files. */
import { sharedAudio } from '../audio/ride-score.js';

let osc = null;
let gain = null;
let current = null;

function context() {
  const audio = sharedAudio();
  if (!audio || typeof audio.createOscillator !== 'function') return null;
  if (!osc) {
    osc = audio.createOscillator();
    gain = audio.createGain();
    osc.type = 'square';
    osc.frequency.value = 70;
    gain.gain.value = 0;
    osc.connect(gain);
    if (audio.destination) gain.connect(audio.destination);
    osc.start();
  }
  return audio;
}

export function playRideBed(id, speed) {
  current = id;
  const audio = context();
  if (!audio || !gain) return { id, src: null, playing: false };
  const hz = 55 + Math.min(40, (speed || 0) * 2);
  osc.frequency.value = hz;
  gain.gain.value = speed > 1 ? 0.015 : 0;
  return { id, src: 'oscillator', playing: speed > 1, hz };
}

export function clickLift(id) {
  const audio = context();
  if (!audio || !gain) return { id, click: false };
  const now = audio.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(0.03, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
  return { id, click: true };
}

/** Drop whoosh. Pitch follows speed. No sample file. */
export function whoosh(id, speed) {
  const audio = context();
  if (!audio || !osc || !gain) return { id, whoosh: false };
  const hz = 42 + Math.min(90, Math.abs(speed || 0) * 3);
  osc.type = 'sawtooth';
  osc.frequency.value = hz;
  const now = audio.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(0.02, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  return { id, whoosh: true, hz };
}

export function dispatchBell(id) {
  const audio = context();
  if (!audio || !osc || !gain) return { id, bell: false };
  const now = audio.currentTime;
  osc.type = 'sine';
  osc.frequency.value = 880;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(0.03, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
  return { id, bell: true };
}

export function hissBrakes(id) {
  const audio = context();
  if (!audio || !osc || !gain) return { id, hiss: false };
  const now = audio.currentTime;
  osc.type = 'square';
  osc.frequency.value = 90;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(0.012, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
  return { id, hiss: true };
}

/** Land bed follows the park clock: day, dusk, night. Not a second park. */
export function playLandBed(part) {
  const audio = context();
  if (!audio || !osc || !gain) return { part, src: null };
  const hz = part === 'night' ? 48 : part === 'dusk' ? 62 : 74;
  osc.type = 'sine';
  osc.frequency.value = hz;
  gain.gain.value = 0.008;
  return { part, src: 'oscillator', hz };
}

/** Distant roar toward The Block, whoosh toward The Board. Silent if audio is blocked. */
export function faceCue(dir) {
  const x = dir && dir.x ? dir.x : 0;
  const block = x < -0.2;
  const wheel = x > 0.2;
  const audio = context();
  if (audio && osc && gain && (block || wheel)) {
    osc.type = block ? 'sawtooth' : 'sine';
    osc.frequency.value = block ? 55 : 180;
    gain.gain.value = 0.008;
  }
  return { block, wheel, roar: block, whoosh: wheel };
}

export function stopRideBed() {
  current = null;
  if (gain) gain.gain.value = 0;
  return { id: null, playing: false };
}

export function audioNow() {
  return current;
}
