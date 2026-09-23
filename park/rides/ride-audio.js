/** Per-ride audio hook. Uses an oscillator when the browser allows it. No audio files. */

let ctx = null;
let osc = null;
let gain = null;
let current = null;

function context() {
  const AC = typeof AudioContext !== 'undefined' ? AudioContext : typeof webkitAudioContext !== 'undefined' ? webkitAudioContext : null;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    osc = ctx.createOscillator();
    gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 70;
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
  }
  return ctx;
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

export function stopRideBed() {
  current = null;
  if (gain) gain.gain.value = 0;
  return { id: null, playing: false };
}

export function audioNow() {
  return current;
}
