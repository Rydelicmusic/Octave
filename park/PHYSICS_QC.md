# Physics QC

Date: 2026-09-23
Speed owner: stepEnergy in park/rides/physics.js
v' = -g sin(theta) + a_lift + a_launch + a_brake - c v^2
g = 9.81. Arc length s. A path with a table does not play sample.speed.

## Visible rails

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
