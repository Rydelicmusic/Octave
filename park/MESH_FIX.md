# Mesh fix

Date: 2026-09-23

1. seed-rides claims the 6×4 kiosk. attractions.js builds the rail, but only inside `WebGLRenderer.prototype.render`.
2. Three r160 assigns `this.render` on the instance in the constructor. The prototype hook never runs, so the rail was added to no scene the Walk camera renders.
3. index.html `addRideBlock01` draws the kiosk and a 1.2 m stone (`PAD_H`). The coaster samples were never scaled onto that pad. They stayed unmounted.
4. The rail material is Lambert steel `0x5d6d7e`, not lawn green. It was invisible because it was not in the scene, not because it matched the grass.
5. `blockCoasterSamples(3)` keeps world-up y. After `finish()`, length is 500.6 m, y max is 37.8 m, seam 0.7 m, off the spine and outside hub r32.
6. Supports existed in track-build and were never created, because the track group was never added.
7. No import error. The boot console is quiet. The missing mesh is the skipped render hook, not a thrown exception.
8. `__PARK_DRY` skips lakes. `no-water.js` does not remove `ride-block-01-world`. The rail is added after that pass, on the same scene the kiosk already uses.

Fix: `addRideBlock01` stores that scene. The existing frame loop calls `ensureHeroRail()`, which runs `buildTrack` on `blockCoasterSamples(3)` into it. Rail cross-section is 0.70 m by 0.58 m. Supports use `H(x,z)`. Lead car is `ride-block-01-car`. OPERATING requires that group to have children.

VISIBLE. Live https://rydelicmusic.github.io/octave/park/#mesh , same scene as Walk: the lift stands above the trees west of the spine. ride-block-01-world has 39 children, the crest is at 36.3 m, and the dot says operating only after that group exists. The corner does not say “1.2 m pads”.
