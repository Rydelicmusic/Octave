# BUILD LOOP
Date: 2026-09-20 20:29 CDT
Hands: Grok Build. Chat is not the worker.
Canon: park/LAYOUT.md XZ + park/DIRECTOR_LOCK.md (dated locks win).

## This run
LOOK → strip water → clean hub → keep roads → one commit.

## Priority queue
W1. Delete all water meshes / pond discs / lake materials. Fill with park ground. This is a park.
H1. Hub only r18 + r32 + 14 m spine gaps. No stacked rings. No trees inside r32.
R1. Keep / finish hub ring + land drives. Not more grass.
Then ride kiosks on pads, not on y=0.

park/ only. One small file + one wire per pass.

## Cycle 1 — 2026-09-22
File: park/park-kit.js. Wire: one import in park/rides/seed-rides.js.
Checked: kitClear vs occupiesSpine, hub r32, nearRing; land names The Block / After Hours / The Board / The Pocket; queue poses on the eight claimed rides; no water mesh; cameras untouched. lock.test + test-placement 23 pass.
Pass: arches, plaza paint, lamps, trash, path edges, queue switchbacks stay off spine and hub.
Fail: gate landmark absent; ride vehicles still static; Halloween skin absent; main not updated until this commit.
Next: park/gate-icon.js at Gate (0,+230), one wire.

## Cycle 2 — 2026-09-22
File: park/gate-icon.js. Wire: one import in park/rides/seed-rides.js.
Checked: piers (±10, 216) and map/ticket props pass gateClear (occupiesSpine, hub r32, nearRing). Crown mesh anchor is (0, +230) overhead in the wing opening. No ground foot on the spine. No water. Cameras untouched. Crown spins on its own RAF.
Pass: first view is the RYDELIC PARK arch; tickets and map are props, not a new building SKU.
Fail: ride vehicles still static; Halloween skin absent; land beds absent.
Next: park/halloween/haunt-scene.js night skin, one wire.

## Cycle 3 — 2026-09-22
File: park/halloween/haunt-scene.js. Wire: one import in park/rides/seed-rides.js.
Checked: four pumpkins and four bat orbits pass hauntClear (occupiesSpine, hub r32, nearRing). Pumpkins sit inside their land canopies. Moon stays in the sky. Fog color/near only; fog.far left for Walk / 3rd / Above. No water.
Pass: night clear, moon orbit, pumpkin bob and flicker, bat orbit. Land materials untouched.
Fail: ride vehicles still static; land beds absent.
Next: park/rides/attractions.js motion on the eight claimed pads, one wire.

## Cycle 4 — 2026-09-22
File: park/rides/attractions.js. Wire: one import in park/rides/seed-rides.js.
Checked: eight existing ids kept. Exit photos pass rideClear and sit in their land canopy, outside the mass pad. Types: Block launch/coaster, Hours dark, Board wheel/swings, Pocket spin/kiddie. Motion registry self-starts. claimRide/markRide untouched. No new spine or hub lot. No water.
Pass: queue already in the kit; load posts, moving vehicle, unload posts, exit frame on each pad.
Fail: land beds absent.
Next: park/land-beds.js emissive trim and music-bed stub, one wire.

## Cycle 5 — 2026-09-22
File: park/land-beds.js. Wire: one import in park/rides/seed-rides.js.
Checked: four trims pass bedClear (occupiesSpine, hub r32, nearRing) and sit in their canopy. playLandBed returns src null. No rings. No water. Cameras untouched. Emissive pulse is its own RAF.
Pass: music-bed hook stubbed. Trim is land color, not a new lot on the spine.
Ship gates: footprint still the locked park; gate arch + crown, spine untouched, four land arches, eight rides moving; ground not removed; no water added; motion does not need an index.html rewrite.
Next: none. Five cycles spent. Drive copy of these files is the handoff, not another park rewrite.
