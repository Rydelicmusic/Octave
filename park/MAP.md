# Park map — everything has a lot
Date: 2026-09-20 22:42 CDT
Build reads this + occupy-map.json. It does not invent positions.

## Law
If it is in the scene, it is on the map.
If it is not on the map, Build must not draw it.
Organize = pack lots with gap. Never Math.random for x/z.

## Layers (bottom → top)
1. ground — stadium floor, land plates, spine, roads, paths
2. mass — buildings, kiosks, pavilions, gates, stations
3. canopy — trees (only in leftover ground after 1+2)
4. prop — lamps, benches, signs (only leftover after 1–3)

## Equal space
Gap between two mass lots: ≥ 4 m
Gap tree-to-mass: ≥ 3 m
Gap tree-to-tree: ≥ 4 m (belt) or 6 m (open lawn)
Gap prop-to-anything: ≥ 1.5 m
Spine 14 m + 0.6 m pad: empty of mass, canopy, prop
Hub r32: empty of mass + canopy

## How Build places
1. Read occupy-map.json (or dump() after seed).
2. at(x,z) / near(x,z) / whyBlocked(lot).
3. If blocked, pick the next free cell in that land canopy. Do not jitter.
4. claim() then mesh.
5. dump() write park/occupy-map.json.

## Cell language
G{floor(x/25)},{floor(z/25)} + meters. CRS.md.

## Boot seed (locked, do not randomize)
seedLocked(BUILDINGS + GATE + STATIONS)
seedSpine(LOCK)
land plates: Block / After Hours / Board / Pocket canopies from LAYOUT.md
Then trees only in cells with no mass and no ground road.
