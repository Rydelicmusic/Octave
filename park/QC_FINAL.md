# QC final

Date: 2026-09-23 00:51 CDT
Command: `node park/qc/qc-final.js`
Result: pass 12, fail 0, stub 2, skip 0
Live tab: https://rydelicmusic.github.io/octave/park/ on fa718e55fea9e41b582558010a7d637921615f2b
Exceptions in that tab: none

The first battery run failed one law row because LAYOUT.md says “do not design a hotel”. That sentence is the ban, not a tower. The check now looks for a hotel mesh in the page. No park file was changed to satisfy it.

```json
{
  "pass": 12,
  "fail": 0,
  "stub": 2,
  "skip": 0,
  "rows": [
    {"area": "boot", "name": "static imports resolve", "status": "PASS", "detail": "241 import edges"},
    {"area": "boot", "name": "scene and cameras are in the page", "status": "PASS", "detail": "scene, mesh, three cameras"},
    {"area": "law", "name": "four lands, no hotel mesh in the page", "status": "PASS", "detail": "LAYOUT names held"},
    {"area": "law", "name": "allow-list water, hub and spine dry", "status": "PASS", "detail": "board-lagoon, plaza-fountain, hours-canal, pocket-pool hits 0"},
    {"area": "law", "name": "no-water keeps the allow-list and old lakes stay gated", "status": "PASS", "detail": "PARK_DRY true"},
    {"area": "motion", "name": "one ride motion owner", "status": "PASS", "detail": "tickMotion calls 1"},
    {"area": "motion", "name": "haunt group latches once", "status": "PASS", "detail": "module latch"},
    {"area": "rides", "name": "eight pad hooks exist", "status": "PASS", "detail": "1.2 m stones under the kiosk anchors"},
    {"area": "rides", "name": "hero path closed, no NaN", "status": "PASS", "detail": "n 63 seam 0.000 maxY 35.9"},
    {"area": "rides", "name": "board, refuse course, Esc returns Walk", "status": "PASS", "detail": "board true course"},
    {"area": "hud", "name": "copy matches the coaster, not the old pad line", "status": "PASS", "detail": "Block coaster west of the spine"},
    {"area": "perf", "name": "score stub does not request a missing file", "status": "PASS", "detail": "no audio src"},
    {"area": "rides", "name": "spectacular floats", "status": "STUB", "detail": "not mounted this era"},
    {"area": "rides", "name": "launch, wheel, swings as a gate walk", "status": "STUB", "detail": "modules mount; not the proven loop"}
  ]
}
```
