# Physics QC

Date: 2026-09-23
Live speed owner: tick(id, dt) in park/rides/physics.js. stepEnergy stays for the legacy battery only.
a = -g sin(theta) + aLaunch on LSM + aBrake on a brake section - dragC v |v|
g = 9.81, climbV = 3, vMin = 0.3, vMax = 45, dragC = 0.012, aLaunch = 15, aBrake = -28.
Arc length s. A path with a table does not play sample.speed.

## Spec tick

Constants: g 9.81, climbV 3, vMin 0.3, vMax 45, dragC 0.012, aLaunch 15, aBrake -28.
Sling: MISSING. slingshot.js is not mounted and is not called from physics.js.

### ride-block-01 (dive)

- Seam 0.00 m
- Peak 19.72, chain 3, after drop 19.72
- Hold 2.98 s
- Trim count 2
- Lap home, no NaN
- ride-block-01 trim s 117.8 v 7.87 -> 8
- ride-block-01 trim s 135.2 v 7.53 -> 8

### ride-block-02 (giga)

- Seam 0.00 m
- Peak 19.54, chain 3, after drop 19.54
- Trim count 0
- Lap STALL
- Stopped at s 151.0 of 458 m. dragC 0.012 bled the speed. Not a completed lap, and s was not moved.

### ride-block-rim (rim)

- Seam 0.00 m
- Peak 24.34, chain 3, after drop 24.34
- Trim count 0
- Lap STALL
- Stopped at s 259.3 of 836 m. dragC 0.012 bled the speed. Not a completed lap, and s was not moved.

### ride-hours-02 (launch)

- Seam 0.00 m
- Peak 31.28
- Launch windows with term > 5: 2
- Trim count 0
- Lap home, no NaN

### ride-board-family (hybrid)

- Seam 0.00 m
- Peak 17.17, chain 3, after drop 17.17
- Trim count 0
- Lap STALL
- Stopped at s 182.7 of 251 m. dragC 0.012 bled the speed. Not a completed lap, and s was not moved.

## Visible rails under the legacy stepEnergy opts

### ride-block-01

- Length 248 m
- Lap home, boarding, s under 1.5, no NaN
- Peak speed 22.12, chain 1.99, after the drop 22.12
- Crest hold 3 s
- Trim 3 (logged, train was not moved to another s):
  - s 68.5 y 31.3 v 0.35
  - s 128.2 y 24.7 v 5.75
  - s 135.2 y 26.3 v 5.82

### ride-block-02

- Length 458 m
- Lap home, boarding, s under 1.5, no NaN
- Peak speed 21.79, chain 2.09, after the drop 21.79
- Trim 1 (logged, train was not moved to another s):
  - s 343 y 8.2 v 5.95

### ride-block-rim

- Length 836 m
- Lap home, boarding, s under 1.5, no NaN
- Peak speed 33.32, chain 2.45, after the drop 33.32
- Trim: none

### ride-hours-02

- Length 277 m
- Lap home, boarding, s under 1.5, no NaN
- Peak speed 35.58
- LSM samples 72. No chain climb clamp on those windows.
- Trim: none

### ride-board-family

- Length 251 m
- Lap home, boarding, s under 1.5, no NaN
- Peak speed 18.81, chain 2.50, after the drop 18.81
- Trim 1 (logged, train was not moved to another s):
  - s 187.7 y 9.6 v 5.98

## Battery

- pass  g  9.81
- pass  ride-block-01 closed  seam 0.00
- pass  ride-block-01 spec lap no NaN  home
- pass  ride-block-01 faster after the drop  crest 3 after 19.72
- pass  ride-block-01 hold 2-4 s  2.98
- pass  ride-block-01 board rejected on course
- pass  ride-block-02 closed  seam 0.00
- pass  ride-block-02 spec lap no NaN  STALL s 151.0
- pass  ride-block-02 faster after the drop  crest 3 after 19.54
- pass  ride-block-02 board rejected on course
- pass  ride-block-rim closed  seam 0.00
- pass  ride-block-rim spec lap no NaN  STALL s 259.3
- pass  ride-block-rim faster after the drop  crest 3 after 24.34
- pass  ride-block-rim board rejected on course
- pass  ride-hours-02 closed  seam 0.00
- pass  ride-hours-02 spec lap no NaN  home
- pass  ride-hours-02 two launch windows  windows 2 aLaunch 15
- pass  ride-hours-02 board rejected on course
- pass  ride-board-family closed  seam 0.00
- pass  ride-board-family spec lap no NaN  STALL s 182.7
- pass  ride-board-family faster after the drop  crest 3 after 17.17
- pass  ride-board-family board rejected on course
- pass  ride-block-01 energy lap  phase BOARDING s 0.0 trim 3
- pass  ride-block-02 energy lap  phase BOARDING s 0.0 trim 1
- pass  ride-block-rim energy lap  phase BOARDING s 0.0 trim 0
- pass  ride-hours-02 energy lap  phase BOARDING s 0.0 trim 0
- pass  ride-board-family energy lap  phase BOARDING s 0.0 trim 1
- pass  block dive hold is 2-4 s  3
- pass  hours two lsm windows  lsm samples 72
- pass  station v0  v 0
- pass  drop faster than lift  lift 2.507892380526283 drop 23.574360863301138
- pass  lap s within 1.5  s 0 BOARDING
- pass  no NaN
- pass  restraint stays shut on course
- pass  board rejected on course
- pass  trim assist counted  trim 2
- pass  one train block cleared
- pass  dispatch
- pass  second dispatch refused
- pass  auto dispatch 3s  DISPATCH
- pass  e-stop stays on the rail  at 141.0 now 156.4 BRAKE
- pass  lift anti-rollback  s 43.02 v 0.50
- pass  launch spike  peak 38.0
- pass  family same integrator  lift 3.308248716817656 drop 15.879390725743175
- pass  kiddie returns  BOARDING
- pass  dark doors  holds 2 s 0
- pass  drop freefall  peak 28.0 hoist 2.40 fall 20.99
- pass  pendulum swings  theta 0.235
- pass  wheel rests in window  up 1
- pass  other gondola not in window
- pass  wheel omega holds  0.4
- pass  swings kick  kick 0.661
- pass  swings board at rest
- pass  bumper stays in the ring  r 3.54
- pass  spin leans  lean 0.110

All checks passed.
