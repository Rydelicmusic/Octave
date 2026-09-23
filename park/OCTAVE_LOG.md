# Octave log

Date: 2026-09-23 00:44 CDT
Live: https://rydelicmusic.github.io/octave/park/
Door: https://rydelicmusic.github.io/octave/park/door.html
Parent: d6d6fd3e1e674960aad2824e218efaaeacb81920
Commit message: binge 7 cycle 195/195 song door show phone memory
Command: `node park/qc/qc-octave.js`
Result: pass 20, fail 0, skip 0
Leftover FAILs: none

No stem files are in the repo. Every ride id is `score: stub`. That is a pass. Nothing assigns an audio element src.

`?dev=1` is the documented work bypass. G is still the comp key. A guest without either is refused at board with reason `admit`.

Cheap mode, when the pointer is coarse or the frame rate stays under 30, draws 16 of the 56 NPCs and stops the water ripple. The basins stay. The hero stays.

## Battery

| Check | Result | Evidence |
| --- | --- | --- |
| Live shell | PASS | scene, canvas, Walk / 3rd / Drone |
| Score map | PASS | 10 ids, url null, mode stub |
| No fake url | PASS | ride-audio does not construct its own context; score does not set src |
| One AudioContext | PASS | created on resume, second resume reuses it, silent before the gesture |
| Loud versus bleed | PASS | rider 0.2, Block plaza 0.03, Gate 0 |
| Hero versus s | PASS | drop at s 107.9, cues lift / drop / outro |
| Admit query | PASS | `?admit=1` sets the existing ticket flag |
| Board gate | PASS | no ticket returns admit; `?dev=1` gets past it to the load check |
| One park | PASS | 200 directory rows collapse to RYDELIC |
| Show clears | PASS | floats use the spine, then park at x ±26; arch flashes; fog untouched |
| Phone stick | PASS | coarse pointer: pad, look, BOARD, EXIT |
| iOS shell | PASS | existing touch-action:none, added 100dvh |
| Cheap mode | PASS | 16 NPCs, flat water, coaster score and board kept |
| Visit | PASS | octave-rydelic-visit roundtrip, welcome back once |
| First ticket | PASS | a new admit does not say welcome back |
| Hero closed | PASS | seam 0.000 |
| Dry lap | PASS | maxY 37.7, no NaN |
| Day motion | PASS | s 13.06 DISPATCH, show idle |
| Dusk soak | PASS | 60 s, hero s 394.8, show running, wheel still turning |

Prior suites after this layer: `node park/qc/qc-run.js` pass 46, fail 0, skip 9. `node park/qc2/qc2-run.js` pass 32, fail 0, skip 0.

## Stems

Station and idle use the idle bed. Lift is the tension cue before the first 8 m fall. The drop hook is the next 48 m of rail. Brakes and unload use the outro, then the station idle bed returns. World bleed is 80 m. The player on the train is louder.
