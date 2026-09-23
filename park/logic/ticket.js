/** Gate admit. No payment backend. G is the documented comp key. */

let admitted = false;
let cheat = false;
const merch = [];

export function resetTicket() {
  admitted = false;
  cheat = false;
  merch.length = 0;
}

export function admit() {
  admitted = true;
  return true;
}

export function setCheat(on) {
  cheat = !!on;
  if (cheat) admitted = true;
  return cheat;
}

export function isAdmitted() {
  return admitted || cheat;
}

export function cheatOn() {
  return cheat;
}

/** Cart / merch click. Records the interest. Does not charge. */
export function takeMerch(id) {
  merch.push(id || 'cart');
  return { id: id || 'cart', ok: true, paid: false, count: merch.length };
}

export function merchCount() {
  return merch.length;
}
