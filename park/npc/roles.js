/** Who is on the ground. Riders stay on the trains from the alive pool. */

export const ROLES = ['guest', 'queue', 'watch', 'attendant', 'op'];

export function roleFor(index) {
  if (index % 17 === 0) return 'op';
  if (index % 7 === 0) return 'attendant';
  if (index % 5 === 0) return 'queue';
  if (index % 3 === 0) return 'watch';
  return 'guest';
}
