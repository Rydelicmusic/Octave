# Code review

Date: 2026-09-23

Live https://rydelicmusic.github.io/octave/park/ serves the Walk / 3rd / Drone shell and the line “Block coaster west of the spine”. It is not a blank document. `seed-rides.js` returned 503 once, then 200. The module graph after that retry is 200, including `input/walk-ride.js`.

One patch: ribbon posts. Everything else below is left alone on purpose.

## Files

| File | Status | Why |
|---|---|---|
| park/rides/seed-rides.js | OK | Claims the nine queue rides and pulls attractions, ride-cam, and runtime. It does not invent a tenth coaster. |
| park/rides/haunt-boot.js | OK | One dynamic `mountHaunt`. It does not call `tickMotion`. `haunt-scene.js` also calls `armHaunt()` on import, and `mountHaunt` still refuses a second group. First render replaces the sky with the night color. That is one haunt, not two. |
| park/rides/attractions.js | OK | One `tickMotion(` in the ride hook. HUD “operating” requires the world mesh, `${id}-car`, and the rail cache. Missing any of those paints MISSING. |
| park/rides/ride-runtime.js | OK | A path that is not cruise calls `physics.tick`. Dark rides stay on `stepCruise`. `sample.speed` is not the live clock. |
| park/rides/physics.js | OK | `dv/dt = −g sinθ + lift + LSM + brake − 0.012 v\|v\|`, g=9.81, climb=3, v max 45. NaN snaps to s=0, v=0, BRAKE and logs. Dive hold measured 2.98 s. Hours Launch has two LSM windows at +15 and no chain. Sling is not in this file. |
| park/rides/coaster-paths.js | OK | Dive, giga, rim, launch, and hybrid are closed (seam 0). y max is 32, 30, 64, 18.5, 22. No sample on the spine or inside hub r32. |
| park/rides/track-build.js | PATCHED | Ribbon posts were a box of height `p.y` centered at `p.y/2`, so they always met y=0 and ignored H(x,z). They now use `supportSpan` and `sampleHeight`, same as the instanced supports. |
| park/rides/ride-cam.js | OK | Esc on COURSE/DISPATCH/BRAKE calls e-stop and leaves s alone. The camera stays on the train until the station, then Walk is forced at that pad. |
| park/rides/ride-ops.js | OK | Phases are IDLE, BOARDING, DISPATCH, COURSE, BRAKE, UNLOAD. `tryBoard` still accepts IDLE. The walk layer does not. |
| park/rides/park-ops.js | OK | Carts and games are checked against `occupiesSpine`. No water in this file. |
| park/input/walk-ride.js | OK | Present. E boards only when admitted, phase is BOARDING, the guest is inside the γ(0) pad, mode is Walk or 3rd, and v ≤ 1. Drone E does not call `boardRide`. F closes the bar and dispatches. |
| park/no-water.js | OK | Meshes named `water-surface-`, `coping-`, `basin-floor-`, and `fountain-jet` are kept. It strips leftover discs. It does not remove the five allow-list basins. |
| park/lock.js | OK | Read only. `inStadium` is the locked capsule, A=380, B=230, hubOuter=32, spine width 14. Not rewritten. |

## Predicates

| Id | Status | Detail |
|---|---|---|
| B1 boot populate | PASS | Static shell is populated. Ride modules answered 200 after one 503 on `seed-rides.js`. This was not a WebGL mesh count. |
| B2 exports | PASS | `node --test park/rides/ride-test.js` named-import sweep, 54 files. `haunt-boot.js` does not static-import `tickMotion`. |
| P1 closed path | PASS | Seams: dive 0, giga 0, rim 0, launch 0, hybrid 0, kiddie 1.25, dark 0.21. All under 2 m. |
| P2 v_drop > v_crest | PASS | Where a chain exists, bottom speed beats climb 3: dive 19.7, giga 19.5, rim 24.3, hybrid 17.2, kiddie 5.7. Launch has no crest. That row is not a drop. |
| L2 Walk E boards | PASS | Cars exist for the seven rail ids. E at the dive pad, Walk, BOARDING, v=0 returns board. The lift hill and the spine do not. This is the function, not a browser keypress. |
| V1 visible from Gate | FAIL | From (0, 1.72, 230), Block Giga and Rim Flight clear the occupy map. Rydelic Dive is blocked by tree-280 (x −16, z 213, top 8 m). Hours Launch is blocked by tree-217. Board Hybrid is blocked by tree-60. Pocket kiddie is blocked by pocket-album. Hours Dark is blocked by tree-186. The meshes exist, so painting them MISSING would be a new lie. Moving the trees would be landscaping. V1 stays FAIL. |
| H1 HUD truth | PASS | Index does not say “1.2 m pads”. Marquees are Rydelic Dive, Block Giga, Rim Flight, Hours Launch, Board Hybrid. “operating” is not a hardcoded string. |

## Left broken on purpose

Giga stops at s 151 of 458 m, Rim at s 259 of 836 m, Hybrid at s 183 of 251 m. Drag is 0.012. Shortening the layout or cutting drag to fake a lap is forbidden. Dive, Hours Launch, kiddie, and the dark cruise do finish a lap. No NaN.

Sling is MISSING. No towers, no rail s, no E prompt.

`tryBoard` in ride-ops still returns true for IDLE. Walk does not use that door.

Haunt’s first render sets a night sky. It does not mount a second haunt group.
