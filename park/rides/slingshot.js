/**
 * Vertical sling. Not a rail and not used by physics.js.
 * No sling id is mounted. Board Drop is a different machine.
 * LOAD, impulse, apex tumble, fall, damp, LOAD.
 */

export const SLING_MOUNTED = false;

export function createSling(id) {
  return {
    id: id || 'sling',
    phase: 'LOAD',
    y: 1.2,
    v: 0,
    omega: 0,
    angle: 0,
    mounted: false,
  };
}

export function stepSling(state, dt) {
  if (!state) return state;
  const step = Math.max(0, Math.min(1 / 30, dt || 0));
  const g = 9.81;
  if (state.phase === 'LOAD') {
    state.v = 0;
    state.omega = 0;
    state.y = state.restY == null ? 1.2 : state.restY;
    return state;
  }
  if (state.phase === 'LAUNCH') {
    state.v += (state.impulse || 28) * step;
    state.y += state.v * step;
    if (state.v > 0 && state.y > (state.apex || 28)) state.phase = 'TUMBLE';
    return state;
  }
  if (state.phase === 'TUMBLE') {
    state.omega = state.tumble || 2.4;
    state.angle += state.omega * step;
    state.v -= g * step;
    state.y += state.v * step;
    if (state.v < 0) state.phase = 'FALL';
    return state;
  }
  if (state.phase === 'FALL') {
    state.v -= g * step;
    state.y += state.v * step;
    state.angle += (state.omega || 0) * step * 0.4;
    if (state.y <= (state.restY == null ? 1.2 : state.restY)) {
      state.y = state.restY == null ? 1.2 : state.restY;
      state.phase = 'DAMP';
    }
    return state;
  }
  state.v *= Math.max(0, 1 - step * 4);
  state.omega *= Math.max(0, 1 - step * 3);
  if (Math.abs(state.v) < 0.2 && Math.abs(state.omega) < 0.2) {
    state.v = 0;
    state.omega = 0;
    state.phase = 'LOAD';
  }
  return state;
}
