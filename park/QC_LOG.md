# QC log

Date: 2026-09-23 00:36 CDT
Live: https://rydelicmusic.github.io/octave/park/
Parent: e63d9f108f37a9189c0681f4a2110337cf0b4282
Commit: 35f55015092fcad689b9255b0d00fb6837e723f5
Commit message: QC 115/115 function check
Command: `node park/qc/qc-run.js`
Result: pass 46, fail 0, skip 9
ride-test.js: 12 pass, 0 fail
Leftover FAILs: none

SKIP is a feature that is not a rail, or a mesh count that headless node cannot see. None of these rows were marked PASS.

## Cycle 101 — boot glance

| Check | Result | Evidence |
| --- | --- | --- |
| Dry park flag | PASS | index sets window.__PARK_DRY |
| Ride hook | PASS | __tickRides and __applyRideCam before render |
| Seed import | PASS | index imports ./rides/seed-rides.js |
| Haunt static tickMotion | PASS | haunt-boot uses a dynamic import only |

## Cycle 102 — qc-boot.js

| Check | Result | Evidence |
| --- | --- | --- |
| Named import matches named export | PASS | 45 files under rides, logic, qc, and the seed side files |
| Index boots seed and ride hook | PASS | dry, hook, seed |
| Haunt export | PASS | mountHaunt exists; no static tickMotion import |
| Walk / 3rd / Drone | PASS | labels remain in index.html |

## Cycle 103 — qc-layout.js

| Check | Result | Evidence |
| --- | --- | --- |
| Four land names | PASS | The Block, After Hours, The Board, The Pocket |
| Water meshes stay off | PASS | water() runs only when PARK_DRY is false |
| Samples in canopy | PASS | violations 0 |
| Spine | PASS | hits 0 |
| Hub | PASS | hits 0 |
| Anchors | PASS | the same four lands |

## Cycle 104 — layout fixes

| Check | Result | Evidence |
| --- | --- | --- |
| Sample moves | PASS | no layout FAIL, so no sample was moved |

## Cycle 105 — qc-paths.js

| Check | Result | Evidence |
| --- | --- | --- |
| ride-block-01 v1 | PASS | n 320, len 284.0, seam 0.000 |
| ride-block-01 v2 | PASS | n 442, len 407.7, seam 0.000 |
| ride-block-01 v3 | PASS | n 560, len 500.6, seam 0.000 |
| ride-block-02 v2 | PASS | n 277, len 279.2, seam 0.000 |
| ride-pocket-02 v1 | PASS | n 56, len 49.2, seam 0.000 |
| ride-board-family v1 | PASS | n 148, len 137.1, seam 0.000 |
| ride-hours-01 v1 | PASS | n 40, len 10.9, seam 0.000 |
| ride-hours-02 v2 | PASS | n 56, len 23.9, seam 0.000 |
| ride-board-01 path | SKIP | wheel has no rail to close |
| ride-board-02 path | SKIP | swings have no rail to close |
| ride-pocket-01 path | SKIP | spin has no rail to close |
| ride-board-drop path | SKIP | drop has no rail to close |

## Cycle 106 — path fixes

| Check | Result | Evidence |
| --- | --- | --- |
| Open paths | PASS | seam 0 on every path row; nothing to close |

## Cycle 107 — qc-ride.js laps

| Check | Result | Evidence |
| --- | --- | --- |
| ride-block-01 dry lap | PASS | elapsed 52.5, maxY 37.7 |
| ride-block-02 dry lap | PASS | elapsed 31.5, maxY 30.1 |
| ride-board-family dry lap | PASS | elapsed 16.8, maxY 16.4 |
| ride-pocket-02 dry lap | PASS | elapsed 22.5, maxY 2.5 |
| ride-hours-01 dry lap | PASS | elapsed 8.3, maxY 1.1 |
| ride-hours-02 dry lap | PASS | elapsed 16.5, maxY 1.1 |
| wheel period | PASS | reaches UNLOAD |
| swings period | PASS | reaches UNLOAD |
| drop period | PASS | peak 26.0, UNLOAD |
| spin period | PASS | reaches UNLOAD |
| board in BOARDING | PASS | admitted player at slot 0 |
| board rejected in COURSE | PASS | reason course |

## Cycle 108 — car names

| Check | Result | Evidence |
| --- | --- | --- |
| Lead car name | PASS | carName('ride-block-01', 0) is ride-block-01-car |
| Wheel vehicle | SKIP | gondolas, not a rail car |
| Swings vehicle | SKIP | swing seats, not a rail car |
| Drop vehicle | SKIP | cabin, not a rail car |
| Spin vehicle | SKIP | bumper orbit, not a rail car |

The only code change in this binge is that name. buildTrain now names the lead car `${id}-car`.

## Cycle 109 — qc-physics.js

| Check | Result | Evidence |
| --- | --- | --- |
| Station speed | PASS | s 0.00, v 0.00 after the lap |
| First drop | PASS | lift 2.51 m/s, drop 23.57 m/s |
| E-stop | PASS | from s 180.0 to s 189.0, phase BRAKE |

## Cycle 110 — qc-logic.js

| Check | Result | Evidence |
| --- | --- | --- |
| Board at load | PASS | reason board |
| Board in COURSE | PASS | reason course |
| Open restraints | PASS | dispatch reason restraints |
| Closed restraints | PASS | dispatch |
| Queue advance | PASS | riding hold shifts, player reaches slot 0 |
| E-stop | PASS | phase BRAKE |
| Close of day | PASS | phase CLOSED |

## Cycle 111 — qc-perf.js

| Check | Result | Evidence |
| --- | --- | --- |
| Agent cap | PASS | cap 28, boot of 80 still returns 28 |
| 60 s soak | PASS | no NaN, spine hits 0 |
| Soak time | PASS | 2 ms |
| Path samples | PASS | 1899, under 12000 |
| Live mesh count | SKIP | headless node does not mount THREE |

## Cycle 112 — soak

The 60 s soak above is the qc-run soak. No NaN. Agents stayed off the spine.

## Cycle 113 — human script

park/QC_WALK.md. Gate, spine, Admit, Block Coaster queue, Board, lap, exit, Board Wheel.

## Cycle 114 — full rerun

`node park/qc/qc-run.js` → pass 46, fail 0, skip 9.
`node --test park/rides/ride-test.js` → 12 pass, 0 fail.
Boot FAILs: 0. Feature FAILs: 0.

## Cycle 115 — stamp

Drive folder 2026-09-23-BINGE-QC. Commit 35f55015092fcad689b9255b0d00fb6837e723f5, message QC 115/115 function check. Parent e63d9f1.
