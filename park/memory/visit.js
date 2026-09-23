/** Return visit. One localStorage record. No account and no personal data. */
export const VISIT_KEY = 'octave-rydelic-visit';

export function blankVisit() {
  return {
    admit: false,
    lastRideId: '',
    lastPhoto: '',
    lastOpen: 0,
    spectacularSeen: false,
    welcomed: false,
  };
}

export function loadVisit(storage) {
  if (!storage || typeof storage.getItem !== 'function') return blankVisit();
  try {
    const raw = storage.getItem(VISIT_KEY);
    if (!raw) return blankVisit();
    const data = JSON.parse(raw);
    return { ...blankVisit(), ...data };
  } catch {
    return blankVisit();
  }
}

export function saveVisit(storage, patch) {
  const next = { ...loadVisit(storage), ...(patch || {}) };
  if (storage && typeof storage.setItem === 'function') {
    storage.setItem(VISIT_KEY, JSON.stringify(next));
  }
  return next;
}

export function photoStub(rideId, now) {
  const at = now || 0;
  const text = String(rideId || 'walk') + ':' + at;
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 33 + text.charCodeAt(i)) >>> 0;
  return { path: 'photo/' + hash.toString(16), at };
}

export function welcomeLine(visit) {
  if (!visit || visit.welcomed) return '';
  if (visit.lastRideId || visit.spectacularSeen || visit.lastOpen) return 'welcome back';
  return '';
}

export function rememberRide(id, storage, now) {
  const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!store) return null;
  const photo = photoStub(id, now || Date.now());
  return saveVisit(store, { lastRideId: id || '', lastPhoto: photo.path, admit: true });
}

export function markShowSeen(storage) {
  try {
    const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!store) return null;
    return saveVisit(store, { spectacularSeen: true });
  } catch {
    return null;
  }
}
