/** Park clock. One day, open and close. Ride lights read the same clock. */

const MIN = 60;

const clock = {
  minutes: 10 * MIN,
  openMin: 9 * MIN,
  closeMin: 22 * MIN,
  dayScale: 1,
};

export function getClock() {
  return clock;
}

export function resetClock() {
  clock.minutes = 10 * MIN;
  clock.openMin = 9 * MIN;
  clock.closeMin = 22 * MIN;
  clock.dayScale = 1;
  return clock;
}

export function setDayScale(scale) {
  clock.dayScale = scale;
  return clock;
}

export function stepClock(dt, target = clock) {
  const step = (dt || 0) * (target.dayScale || 1) / MIN;
  target.minutes += step;
  if (!Number.isFinite(target.minutes)) target.minutes = target.openMin;
  while (target.minutes >= 24 * MIN) target.minutes -= 24 * MIN;
  while (target.minutes < 0) target.minutes += 24 * MIN;
  return target;
}

export function isOpen(target = clock) {
  const m = target.minutes;
  return m >= target.openMin && m < target.closeMin;
}

/** day, dusk, night. Dusk is the haunt handoff. */
export function dayPart(target = clock) {
  const m = target.minutes;
  if (m >= 19.5 * MIN || m < 6 * MIN) return 'night';
  if (m >= 17.5 * MIN) return 'dusk';
  return 'day';
}

export function lightScale(part) {
  if (part === 'night') return 0.95;
  if (part === 'dusk') return 0.55;
  return 0.22;
}

export function formatClock(target = clock) {
  const m = Math.floor(target.minutes);
  const hh = String(Math.floor(m / 60)).padStart(2, '0');
  const mm = String(m % 60).padStart(2, '0');
  return hh + ':' + mm;
}
