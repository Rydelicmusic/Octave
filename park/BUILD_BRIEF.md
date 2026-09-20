# DIRECTOR → BUILD
From: Ryan / Rydelic
To: Grok Build (GitHub-linked)
Date: 2026-09-20
Repo: Rydelicmusic/octave
Scope: `park/` only. Never touch root `index.html`.

I am the director. You are the hands. Do not invent a new map. Design from the locked layout.

## Read first
1. `park/LAYOUT.md` — canonical meters
2. `park/blueprint.html` — 2D source of truth
3. `park/index.html` — current 3D walk
4. `park/KIT.md` — kit note
5. Measured sheet (Drive): https://drive.google.com/file/d/1HC6WuDCmLmdJD_RMtKz58yARhOVkbwYl/view

## Mission for this phase
Use the locked stadium + hub + four lands as the master template for every artist park. First park is Rydelic Park (this repo). Later artist parks clone the same geometry and only reskin lands / rides / audio.

## Pass 1 instructions (do only this)
LOCKED: stadium 760×460, A=380 B=230, cap R=230, straight=300, hub r18/32, spine 14 m, Gate (0,+230), four land footprints, water list in LAYOUT.md.

GOAL: make the 3D walk read as the measured blueprint — same bones, clearer lands.

CHANGES ONLY:
- Keep Walk / 3rd / Drone cameras.
- Make land names readable at eye height near each canopy (The Block, After Hours, The Board, The Pocket).
- Keep water recessed with coping (already in index.html).
- Do not relocate the locked ∞ rings unless I say so in a later pass.
- Do not rebuild from scratch. Edit existing `park/index.html` and `park/blueprint.html`.
- Do not add hotel / tower / elevator floors. This is a park, not the archived Album Tower.

SHIP GATES:
- Hub still at (0,0), gate still south +230
- Spine still 14 m and walkable Gate → Hub
- Blueprint hover still reports x,z in meters
- Live URLs under `/octave/park/` still work
- Commit message names the pass and lists CHANGES only

## How I will brief you after this
Every pass from me will use:
LOCKED + GOAL + CHANGES only + SHIP GATES.

If a request is missing those four lines, ask me before coding.
If a request fights LAYOUT.md, LAYOUT.md wins until I date a new lock.

## Artist-park clone rule (later, not this pass)
When we spin a park for another artist:
- Copy `park/` geometry unchanged
- Swap land skins, ride skins, audio, planting
- Keep the same origin, stadium, hub, spine, gate, land footprints
