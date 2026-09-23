# Alive log

Date: 2026-09-23 00:39 CDT
Live: https://rydelicmusic.github.io/octave/park/
Parent before this binge: c4b50c563e146a444e6c9e38fd41b03353061039
Commit message: binge 5 cycle 135/135 park is operating

The park clock opens at 09:00. While it is open, every ride with ops fills dummy seats, closes restraints, dispatches, runs, unloads, waits about 3 seconds, and goes again. The player does not have to press anything for the train to leave.

## Test

`node --test park/alive/alive-test.js`

| Check | Result | Evidence |
| --- | --- | --- |
| Hero s changes within 10 s | PASS | s 13.06, phase DISPATCH, then keeps climbing |
| Bots on the coaster | PASS | dummies 2 on the test train; the real hero seats 4 |
| Wheel turning | PASS | ω 0.28 |
| No NaN | PASS | s, v, and ω stayed finite |
| Idle under 15 s | PASS | max idle about 3.1 s, the dwell |
| E-stop is local | PASS | hero BRAKE at s 80.3; wheel eStop false and still COURSE |
| Bot pool | PASS | cap 72, a request for 100 returns 72 and the next returns 0 |
| Seats fill | PASS | Block Coaster fill returns 4 |
| Spine | PASS | occupiesSpine hits 0 |
| Block roar / wheel whoosh | PASS | faceCue west sets block, faceCue east sets wheel |

`node park/qc/qc-run.js` after the wiring: pass 46, fail 0, skip 9.
Physics, logic, and ride-test stayed green.

## What you should see

Walk in from the Gate. Within a few seconds the Block train is out of the station with riders in the cars. The wheel is turning. Swings, the drop, both dark rides, the spin, and the kiddie train are on their own loops. Boarding still works during the dwell, and it takes one dummy's seat. Esc brakes only the ride you are on.
