# Walk logic QC

Date: 2026-09-23

Walk and 3rd can board at the load pad. Drone E does not board. A prompt exists only for an id that has a lead car.

## Station pads

| Id | Status | Detail |
|---|---|---|
| ride-block-01 | PASS | pad -132.0, 74.0 r 4.5 trackY 3.2 — Walk E boards, COURSE waits, drone E ignored |
| ride-block-02 | PASS | pad -188.0, 58.0 r 4.5 trackY 3.2 — Walk E boards, COURSE waits, drone E ignored |
| ride-block-rim | PASS | pad -186.0, 118.0 r 4.5 trackY 3.2 — Walk E boards, COURSE waits, drone E ignored |
| ride-hours-02 | PASS | pad 76.0, -150.0 r 4.5 trackY 2.3 — Walk E boards, COURSE waits, drone E ignored |
| ride-board-family | PASS | pad 188.0, -18.0 r 4.5 trackY 2.4 — Walk E boards, COURSE waits, drone E ignored |
| ride-pocket-02 | PASS | pad 55.5, 86.0 r 4.5 trackY 1.1 — Walk E boards, COURSE waits, drone E ignored |
| ride-hours-01 | PASS | pad -36.0, -176.1 r 4.5 trackY 1.1 — Walk E boards, COURSE waits, drone E ignored |
| ride-board-01 | MISSING | no ride-board-01-car, no walk prompt |
| ride-board-02 | MISSING | no ride-board-02-car, no walk prompt |
| ride-board-drop | MISSING | no ride-board-drop-car, no walk prompt |
| ride-pocket-01 | MISSING | no ride-pocket-01-car, no walk prompt |
| sling | MISSING | no sling mesh. slingshot.js stays unloaded. No E prompt |

## Realism

- **PASS** launch is not climb-clamped — profile launch lift samples 0 LSM runs 2
- **PASS** dive hold still runs with a guest path — held 2.98 s. The hold does not read the guest flag
- **PASS** sling load only at the bottom — unmounted phase LOAD y 1.2
- **PASS** Esc brakes on the rail — s 140 phase BRAKE
- **PASS** dummy riders leave the player seat — board dummies 2 seats 4

## Boot

- **PASS** named import matches named export — 54 files
- **PASS** Walk / 3rd / Drone still switch — buttons b1 b3 bM
- **PASS** one ride RAF — tickMotion calls 1
- **PASS** OPERATING only with mesh and motion — paintOperating requires world, car, and rail
- **PASS** walk prompt wired once — attractions calls tickWalkRide before the ride camera

No FAIL rows. MISSING means there is no car and no prompt.
