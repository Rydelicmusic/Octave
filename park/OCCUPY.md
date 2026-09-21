# Occupancy — Build reads this instead of guessing
Date: 2026-09-20 22:33 CDT

Build cannot see the WebGL scene. It reads `occupy.js` queries + dumped lots.

## Law
Claim a lot before any mesh. Fail = do not draw. Never nudge onto the spine.

Layers (hard vs hard = reject):
- ground: spine, roads, paths
- mass: buildings, kiosks, pavilions, gates
- canopy: trees

Tree on road = reject. Building on tree = reject. Tree on building = reject.

## Queries (how Build "feels" neighbors)
- `at(x,z)` — what is on / under / over this point
- `near(x,z,r)` — lots within r meters, closest first
- `whyBlocked(lot)` — who overlaps, by id
- `dump()` — full map Build can print to `park/occupy-map.json`

## Boot
seedLocked(BUILDINGS+GATE+STATIONS)
seedSpine(LOCK)
then trees / sketch masses claim or skip.
