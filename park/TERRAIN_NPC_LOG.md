# Terrain, water, NPCs

Date: 2026-09-23 00:40 CDT
Live: https://rydelicmusic.github.io/octave/park/
Parent: c1ef51314a2ffce4db8f6ab1632462bb1ed80618
Commit message: binge 6 cycle 155/155 depth water npcs

The old LOCK.waters rings stay off because __PARK_DRY is still true. New water is four basins in park/water/water.js.

## Terrain

| Check | Result | Evidence |
| --- | --- | --- |
| Spine grade | PASS | worst abs height on x=0 is 0.060 m |
| Hub | PASS | height 0 inside the plaza |
| Coaster clearance | PASS | hero rail stays at least 1.64 m above the berm |
| Supports | PASS | supportSpan from grade up to the rail, height 11 m on a tall sample |

## Water

| Basin | Where | Shape |
| --- | --- | --- |
| board-lagoon | (238, 72) The Board | one ellipse 22 by 12 m |
| plaza-fountain | (-118, 62) The Block | one disk plus a jet |
| hours-canal | (-36, -178) inside Hours | channel 5.5 by 1.1 m |
| pocket-pool | (52, 158) The Pocket | one ellipse, no rings |

Hub hits 0. Spine hits 0. Walk steps that land inside a basin are refused.

## NPCs

56 instanced guests. 14 waypoints, all off the spine, off the water, and off the rails. After 20 s of walking, bad positions were 0. Hero and wheel were both still moving (2/2). Train riders from binge 5 are unchanged.

## Tests

`node --test park/terrain/terrain-test.js park/npc/npc-test.js park/alive/alive-test.js park/rides/ride-test.js` — 15 pass, 0 fail.
`node park/qc/qc-run.js` — pass 46, fail 0, skip 9.
