# Math QC

Date: 2026-09-23

Contract evaluated against lock.js geometry and physics.tick. No new land was added.

Tall rails already in the park (L > 50 m and y_max > 8 m): ride-block-01, ride-block-02, ride-block-rim, ride-hours-02, ride-board-family.
Spine grade max |H(0,z) − H(0,0)| = 0.060 m.
Rail samples below the ground clearance outside the station band: 0.

| Id | Status | Detail |
|---|---|---|
| B2 | PASS | node --check on park js |
| B1 | PASS | park/index.html builds a Three scene and owns one frame loop. Mesh count is the mounted track, stations, and ground, not an empty canvas. |
| C1 | PASS | A 380 B 230 lands The Block, After Hours, The Board, The Pocket. inStadium stays the locked capsule. |
| C2 | PASS | Block plaza fountain (-118, 62) r 133 is one ellipse, off the spine, outside hub 32. One Pocket pool. Hub and spine dry. |
| C3 | PASS | spine hits 0, hub hits 0, canopy rejects 0. ride-block-01 L 248 y 32.0 n 162 seam 0.00; ride-block-02 L 458 y 30.0 n 277 seam 0.00; ride-block-rim L 836 y 64.0 n 572 seam 0.00; ride-hours-02 L 277 y 18.5 n 203 seam 0.00; ride-board-family L 251 y 22.0 n 198 seam 0.00; ride-pocket-02 L 49 y 2.5 n 56 seam 1.25; ride-hours-01 L 11 y 1.1 n 40 seam 0.21 |
| P1 | PASS | ride-block-01 seam 0.00 n 162; ride-block-02 seam 0.00 n 277; ride-block-rim seam 0.00 n 572; ride-hours-02 seam 0.00 n 203; ride-board-family seam 0.00 n 198; ride-pocket-02 seam 1.25 n 56; ride-hours-01 seam 0.21 n 40 |
| P2 | PASS | ride-block-01 crest 3 bottom 19.72; ride-block-02 crest 3 bottom 19.54; ride-block-rim crest 3 bottom 24.34; ride-hours-02 crest none bottom 0.00; ride-board-family crest 3 bottom 17.17; ride-pocket-02 crest 3 bottom 5.68; ride-hours-01 crest none bottom 0.00 |
| P3 | PASS | hold 2.98 s |
| P4 | PASS | windows 2 a_LSM 15 lift samples 0 |
| P5 | FAIL | ride-block-01 home; ride-block-02 STALL s 151.0; ride-block-rim STALL s 259.3; ride-hours-02 home; ride-board-family STALL s 182.7; ride-pocket-02 home; ride-hours-01 home. c_d 0.012 g 9.81 v_max 45 a_brake -28 |
| L1 | PASS | Walk and 3rd board only in BOARDING, inside the pad, at v ≤ 1. |
| L2 | PASS | pad true hill false spine false E board |y-y_stat| 1.48 |
| L3 | PASS | drone E → noop |
| L4 | PASS | s stays 140 phase BRAKE. Return is Walk at the station pad. |
| V1 | PASS | from Gate 230. ride-block-01 blocked by tree-280; ride-block-02 clear y 8.5; ride-block-rim clear y 8.9; ride-hours-02 blocked by tree-217; ride-board-family blocked by tree-60; ride-pocket-02 blocked by pocket-album; ride-hours-01 blocked by tree-186. Tall rails ride-block-01 L248 y32.0, ride-block-02 L458 y30.0, ride-block-rim L836 y64.0, ride-hours-02 L277 y18.5, ride-board-family L251 y22.0 |
| H1 | PASS | no 1.2 m pad line. Signs: Rydelic names |

FAIL P5
