# Rydelic Park — Kit (frozen iteration 1)
Date: 2026-09-20 11:58 CDT

## Source of truth
Repo: Rydelicmusic/octave
Folder: park/
Do not edit root index.html. Chat HTML is not source.

Live 3D: https://rydelicmusic.github.io/octave/park/
Live blueprint: https://rydelicmusic.github.io/octave/park/blueprint.html

## Files
- park/index.html — walkable Three.js park (iteration 1)
- park/blueprint.html — 2D grid site plan
- park/BUILD.md — Grok Build brief
- park/KIT.md — this file

## Frozen geometry (do not invent new numbers)
- 1 unit = 1 meter
- Stadium oval rail: A=380, B=230, cap R=230, straight=300, overall 760×460 m
- Origin (0,0) = hub. +X east = The Board. +Z south = Gate
- Gate at (0, +230). Spawn just inside gate looking toward hub
- Pocket spine: 14 m wide, hub → gate
- Hub rings: inner r=18, outer r=32
- Walk speed 1.34 m/s. Eye 1.72 m
- Lands: The Block (west / water), The Pocket (spine+hub), The Board (east plaza), After Hours (north)

## Cameras
Walk / 3rd / Drone. V cycles. Drone is free-fly (55 m/s, Shift 110). Drag look. Stick/WASD. Q/E or +/− altitude.

## Out of scope for iteration 1
No rides. No audio. No hotel tower. No mixing theme-park + hotel in this v1.
