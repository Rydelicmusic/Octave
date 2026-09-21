# Occupancy + spatial index
Date: 2026-09-20 22:35 CDT

Build cannot see WebGL. It reads occupy queries + occupy-map.json.

## Engine
- `park/spatial.js` — 25 m hash (same cells as CRS) + AABB collision
- `park/occupy.js` — claim / at / near / whyBlocked / dump

No CDN. Hash keys are `G` cells: floor(x/25), floor(z/25).

## Law
Claim before mesh. Fail = do not draw. Never nudge onto spine.

Layers that reject each other: ground (roads/spine) · mass (buildings) · canopy (trees).
Tree on street = reject.

## Queries
at(x,z) on/under/over · near(x,z,r) · whyBlocked(lot) · dump() → park/occupy-map.json
