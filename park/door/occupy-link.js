/** This session loads one park. A directory list is not a second scene. */
export const PARK_ID = 'RYDELIC';

export function thisParkOnly(list) {
  const rows = Array.isArray(list) ? list : [];
  const found = rows.find((row) => row && (row.id === PARK_ID || row.name === PARK_ID));
  return [{
    id: PARK_ID,
    href: (found && found.href) || './index.html?admit=1',
    map: 'occupy-map.json',
    rule: 'MAP.md',
  }];
}

/** occupy-map.json has lots, not a park catalogue. Anything else still collapses to RYDELIC. */
export function directoryFromMap(map) {
  const parks = map && Array.isArray(map.parks) ? map.parks : [{ id: PARK_ID }];
  return thisParkOnly(parks);
}
