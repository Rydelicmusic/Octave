# QC2 log

Date: 2026-09-23 00:41 CDT
Live: https://rydelicmusic.github.io/octave/park/
Parent: 1ae0cc1ad73aa3bd669531586c488e7f4d4b4ccc
Commit message: QC2 170/170 terrain water npc function
Command: `node park/qc2/qc2-run.js`
Result: pass 32, fail 0, skip 0
Leftover FAILs: none
Code fixes this binge: none. Binge 6 already met the checks.

SKIP is 0 because every system on the list exists. Nothing was marked pass without an assertion.

## Cycle 156 — boot

| Check | Result | Evidence |
| --- | --- | --- |
| Named import matches export | PASS | 58 files |
| Walk / 3rd / Drone | PASS | still in index.html |
| Scene constructor | PASS | THREE scene and renderer |
| Ride hook | PASS | __tickRides and seed-rides |

## Cycle 157 — terrain

| Check | Result | Evidence |
| --- | --- | --- |
| Not one plane | PASS | spread 1.27 m outside the hub |
| Spine grade | PASS | worst 0.060 m |
| Hub | PASS | y = 0 |
| Paths on the field | PASS | floaters 0 |
| Berms | PASS | 8 pads, none past park grade |
| Hero rail | PASS | min clearance 1.64 m |
| Supports | PASS | span height 9.13 m on a tall post |
| Pads | PASS | no anchor under a 2.2 m wall |

## Cycle 158 — terrain fixes

| Check | Result | Evidence |
| --- | --- | --- |
| Moves | PASS | no FAIL, no pad or rail was edited |

## Cycle 159 — water

| Check | Result | Evidence |
| --- | --- | --- |
| Hub and spine dry | PASS | 0 hits |
| Pocket rings | PASS | 1 pool, no rings field |
| Allow list | PASS | lagoon, fountain, canal, pool |
| One shape each | PASS | rx and rz set, no rings |
| Walk barrier | PASS | lagoon blocks, spine at z 120 does not |
| Waypoints dry | PASS | wet 0 |
| Old lakes | PASS | __PARK_DRY still gates LOCK.waters |

## Cycle 160 — illegal water

| Check | Result | Evidence |
| --- | --- | --- |
| Deletes | PASS | nothing illegal to remove |

## Cycle 161 — NPCs

| Check | Result | Evidence |
| --- | --- | --- |
| Cap | PASS | 56 of 56, inside 40–80 |
| Spine, rails, water | PASS | bad 0 after 10 s |
| Plaza guests | PASS | 45 guests, queue, or watch |
| Attendants | PASS | roleFor(7) is attendant and they hold |
| Train bots | PASS | seatRiders still in track-build, pool cap 72 |

## Cycle 162 — NPC fixes

| Check | Result | Evidence |
| --- | --- | --- |
| Despawn | PASS | no illegal NPC, feature kept |

## Cycle 163 — rides

| Check | Result | Evidence |
| --- | --- | --- |
| Hero closed | PASS | seam 0.000 |
| Dry run | PASS | maxY 37.7, no NaN |
| Motion | PASS | s 13.06 DISPATCH after 10 s |
| Wheel | PASS | ω 0.28 |
| Spine walk | PASS | height 0.056 m, not blocked |
| Board in COURSE | PASS | refused, reason course |

## Cycle 164 — ride fixes

| Check | Result | Evidence |
| --- | --- | --- |
| Car y | PASS | no terrain snap was required |

## Cycle 165 — alive ops

| Check | Result | Evidence |
| --- | --- | --- |
| Still cycling | PASS | same 10 s motion row, bots still wired |

## Cycle 166 — soak

| Check | Result | Evidence |
| --- | --- | --- |
| 30 s NaN | PASS | none |
| Time | PASS | 17 ms |

## Cycle 167 — perf

| Check | Result | Evidence |
| --- | --- | --- |
| Cuts | PASS | soak already cheap, coaster untouched |

## Cycle 168 — walk

park/QC2_WALK.md. Gate, spine, berms, Board edge, moving Block train, board, plaza guests.

## Cycle 169 — rerun

pass 32, fail 0, skip 0.

## Cycle 170 — stamp

Drive folder 2026-09-23-BINGE-QC2. Message QC2 170/170 terrain water npc function.
