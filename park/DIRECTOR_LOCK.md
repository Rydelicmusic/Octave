# Director lock — 2026-09-20 20:53 CDT
From: Ryan / Rydelic
Hands: Grok Build only. Chat does not rewrite the 3D scene graph.

## CRS (new)
Read `park/CRS.md`. Every change briefs with cell + meters + lat/lng.
Hub (0,0) = 29.973000 N, 95.694000 W. +X east, +Z south.
Grid 25 m. Cell `G{floor(x/25)},{floor(z/25)}`.

## HUD (new)
Top-right glass location chip. File already in repo: `park/gps-hud.js`.
Wire only: `import { mountGpsHud } from './gps-hud.js';` then `mountGpsHud(() => camera.position)` or the walk player object.
Show live: cell, x z y meters, lat/lng. Do not put it bottom-left. Do not restyle the existing pass card over it.

## Park not lakes
No water / pond discs. Fill with park grade.

## Hub
Only r18 + r32 + 14 m spine gaps. No extra rings. No trees inside r32.

Ship: wire gps-hud.js with one import / one call. Do not rewrite lock.js.
