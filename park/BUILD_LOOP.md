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
