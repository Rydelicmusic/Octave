# Physics spec

Date: 2026-09-23

Rail speed is `physics.tick(id, dt)` only. A path with a table does not play `sample.speed`. Sling is not this integrator.

```
g = 9.81
climbV = 3.0
vMin = 0.3
vMax = 45
dragC = 0.012
aLaunch = 15
aBrake = -28
vLoopMin = 8

a = -g sin(theta)
lift: a = 0, v = climbV, s cannot decrease
LSM: a += aLaunch
dive hold: v = 0 for 3 s (clamped to 2–4), then release
brake section, while v > 4: a += aBrake
a += -dragC v |v|
v = clamp(v + a dt, 0, vMax)
s = s + v dt
closed and s > L: s -= L, or s = 0 and arrived when the phase is BRAKE
```

dt is clamped to 1/30. A NaN step sets s = 0, v = 0, phase BRAKE, and logs.

The chain stays on while theta is still uphill. The lift flag flips a meter short of the crest; releasing there stalls the train before the drop. Launch rides never take that clamp.

A brake or block section applies aBrake only while v > 4, then releases. The final brake grade floors v at vMin so the train reaches the platform. E-stop sets phase BRAKE and creeps at vMin along the rail. It does not jump out of a loop.

Phases: IDLE, BOARDING, DISPATCH, COURSE, BRAKE, UNLOAD. `boardRide` only in BOARDING. The dive hold is COURSE with v = 0.

## Profiles

| Id | Profile | This pass |
|---|---|---|
| ride-block-01 | dive | Chain, 3 s hold (measured 2.98 s), drop to 19.7 m/s, two trims, lap home |
| ride-block-02 | giga | Chain, drop to 19.5 m/s, then STALL at s 151 of 458 m |
| ride-hours-02 | launch | Two LSM windows, no climb clamp, peak 31.3 m/s, lap home |
| ride-board-family | hybrid | Same forces as the giga. Drop to 17.2 m/s, then STALL at s 183 of 251 m |
| ride-block-rim | rim | Same forces as the giga. Drop to 24.3 m/s, then STALL at s 259 of 836 m |
| sling | MISSING | `slingshot.js` is the vertical integrator. No sling id is mounted |

Giga, hybrid, and rim are gravity and drag after the crest. dragC 0.012 stops them before the station. Those stops are logged as STALL. The train is not moved to the station to fake a lap.

Lead car name is `${id}-car`. Position is sample(s). Facing is the path tangent. Roll is the path bank (the Immelmann bank is already on the samples). Kappa is stored on each cache row.

Dark rides stay on the cruise integrator. Wheel, swings, drop, and spin are not rails.

HUD says operating only when the world mesh, `${id}-car`, and the rail cache all exist. Otherwise the dot says MISSING and dispatch is refused.
