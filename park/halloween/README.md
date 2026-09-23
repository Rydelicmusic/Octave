# Halloween Haunt overlay
Stamp: 2026-09-22-2325-CDT

`haunt-scene.js` paints night, moon, bats, jack-o, lanterns, Night Circuit.
`rides/attractions.js` is the motion registry + 8 machines.

`park/index.html` must import:
```
import { tickMotion } from './rides/attractions.js';
import { addHauntScene } from './halloween/haunt-scene.js?v=haunt-0922';
```
Call `addHauntScene(THREE,scene)` after the ride mounts.
Call `tickMotion(clock.elapsedTime, dt)` inside `tick()` before render.
