/** Door ticket. Same admit flag the ride gate already checks. */
import { admit, isAdmitted, setDevBypass } from '../logic/ticket.js';

export function entryFromSearch(search) {
  const raw = String(search || '');
  const q = new URLSearchParams(raw.charAt(0) === '?' ? raw.slice(1) : raw);
  const admitQuery = q.get('admit') === '1';
  const dev = q.get('dev') === '1';
  if (dev) setDevBypass(true);
  if (admitQuery) admit();
  return { admit: admitQuery, dev, admitted: isAdmitted() };
}

export function doorHref() {
  return './index.html?admit=1';
}
