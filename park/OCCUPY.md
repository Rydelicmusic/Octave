# Occupancy — one lot per structure
Date: 2026-09-20 22:26 CDT
Hands: Grok Build. Chat does not scatter trees.

## Rule
Nothing is drawn until it **claims a lot**. Two lots never overlap. Tree vs building is the same test.

Lot = axis-aligned box on XZ + pad:
- building / pavilion / kiosk: pad 2.0 m
- tree / cluster: pad = canopy radius + 1.5 m
- path / spine: not a lot; `occupiesSpine` still blocks

## API (`park/occupy.js`)
- `claim(lot)` — false if overlap or off-stadium / on-spine. True reserves it.
- `fits(lot)` — test only
- `lots()` — all claimed
- `clearDynamic()` — sketch masses only; locked PLACEMENTS stay

Every new structure: `{ id, kind, x, z, w, d, pad, sku? }`.
`kind` is `building` | `tree` | `prop`.

## Build
1. On boot, claim GATE + STATIONS + BUILDINGS from lock.js.
2. Trees call `claim({kind:'tree', x,z,w:2r,d:2r,pad:1.5})` or skip.
3. Sketch / mass.js claims before mesh.
4. Fail = do not draw. Do not nudge into the spine.
