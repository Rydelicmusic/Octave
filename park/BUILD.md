# Grok Build — Park quality log
2026-09-20

Director: Ryan / Rydelic. Hands iterate in `park/` only.

## Locked (must hold after every commit)
- Stadium 760×460, A=380 B=230, cap R=230, straight=300
- Hub (0,0) r18/32, Gate (0,+230), 14 m spine, walk 1.34 m/s
- Rings A (95,95) 14/20 and B (118,108) 6/11 unmoved
- Water list + land canopies in LAYOUT.md / lock.js
- No hotel / tower / elevator; no root index.html edits

## Pass 1 — SKU-ladder buildings in land canopies
- 11 buildings (kiosk / pavilion / album) via `park/lock.js` `BUILDINGS`
- Inside The Block / After Hours / The Board canopies only
- Placement predicates refuse spine, water, stadium rail, hub plaza, locked rings
- Blueprint draws the same footprints; hover still `x … m` / `z … m`

## Pass 2 — winding path ribbons + hub 8 radial beds + tree belts
- Elliptical lake walks on waters rx>=16; four land ribbons following water edges
- Hub: 8 sand spokes + 8 planted dirt/hedge beds (clear of 14 m spine)
- Denser west-lakes, SE grove, north-split belts; trees skip spine + building footprints

## Pass 3 — gate, stations, signs, lamps, queues, materials
- Eye-height land-name markers: The Block, After Hours, The Board, The Pocket
- Gatehouse volume at (0,+230) with ticket windows; turnstiles off-spine
- Ride station decks + queues around unmoved ∞ rings
- Spine lamps / benches / trash; rail fence posts
- Asphalt spine, concrete hub, packed-sand land ribbons, earth patches
- Stadium-rail walk clamp (speed still 1.34 m/s)

## Pass 4 — walk arrival faces hub
- Start yaw 0 so Gate Walk looks down the 14 m asphalt spine into the hub
- Optional `#drone` hash opens Drone at 90 m (cameras unchanged)

## Pass 5 — SKU facade polish (density + proportion)
- Album halls (kept): recessed window bays, pilasters, belt/cornice, portico, stepped entry
- Kiosks: plinth + fascia + pitched awning, service-window recess + glass, side insets, corner posts
- Pavilions: plinth/belt, 8 columns, four face window bays + sills, two-tier roof + finial
- Material variation via body/trim/glass/base; BUILDINGS x,z,w,d,yaw footprints unchanged
- Placement predicates untouched (canopy / off spine / off water / inside rail)

## Pass 6 — species-varied tree crowns
- Four crown types: pine (tiered cones), oak (broad sphere + bump), willow (droop capsules), poplar (tall narrow)
- Region bias: west lakes willow, SE Board grove oak, north After Hours pine, hub ring poplar
- Rail belt still mixed via stable pickSpecies(x,z); placement skips spine ±9 m + building footprints
- No map / BUILDINGS / LAYOUT.md changes

## Pass 7 — ribbon-constrained stay-on-path
- Walk samples spine, gate apron, hub spokes, land path ribbons, and ride rings
- Hub plaza (≤ hubOuter+2.5 m) stays free; elsewhere soft-pull to nearest walk segment
- Rail/stadium clamp unchanged; LAYOUT.md / BUILDINGS footprints untouched

## Pass 8 — winding spine ribbon (not a straight box)
- Replaced Gate↔Hub↔north asphalt boxes with soft S-curve ribbons (weave ±~4 m)
- Width still LOCK.spineWidth (14 m); gate apron box kept; walk segs follow ribbon samples
- Hub plaza / land ribbons / rings / BUILDINGS / LAYOUT.md unchanged

## Pass 9 — finer lake-edge path ribbon tracing
- Replaced coarse freehand land polylines with ellipse-sampled ribbons from LOCK.waters (+margin)
- Denser rings (48–72 pts) + short connectors between nearby large lakes
- Water ellipses / spine width / hub / rings / BUILDINGS / LAYOUT.md unchanged

## Pass 10 — stay-on-path corner cuts
- Hard snap onto nearest ribbon when off-path (removed 0.6 blend that chorded corners)
- Travel-aligned segment preference in nearestWalk; tighter ribbon half-widths
- LAYOUT / waters / spine width / BUILDINGS unchanged

## Pass 11 — fuller lake shoreline path network
- Outer promenade bands on large lakes + shore-arc connectors (MST-ish) between rx≥16 waters
- West-lake spurs toward spine shoulder; waters / LAYOUT / BUILDINGS unchanged

## Pass 12 — spine centerline matches blueprint (x=0)
- Replaced ±4 m S-weave with blueprint centerline at x=0; 14 m width held
- Soft scalloped edge ribbons inside half-width (not a hard box silhouette)
- Gate apron / hub / waters / BUILDINGS unchanged

## Pass 14 — denser Pocket understory / planted beds
- Dirt beds + hedge/bloom near Pocket SKUs; oak understory clumps in Pocket canopy
- Spine-shoulder hedge strips in +Z Pocket; rings / spine / hub / BUILDINGS held

## Pass 15 — guest-routing shore graph
- Each lake (rx≥16) links to two nearest neighbors via shore-arc + bridge (not MST-only)
- Links that cross the 14 m Gate→Hub spine are refused
- East and west large-lake spurs to spine shoulder; waters / BUILDINGS / LAYOUT unchanged

## Buildings — Pocket album hall (7bda880)
Completes SKU ladder in The Pocket (song=kiosk, EP=pavilion, album=full building).

| id | land | sku | x | z | w × d × h (m) |
|---|---|---|---:|---:|---|
| pocket-album | The Pocket | album | 22.0 | 112.0 | 18 × 14 × 8.4 |

- Inside Pocket canopy ellipse (80, 105, rx 95, rz 80); 14 m spine, hub r32, water, rings unmoved
- Gate wings + ring stations in `lock.js` `GATE` / `STATIONS`; 3D `rideStation` iterates `STATIONS`
- Clearance: `park/test-placement.mjs` + `park/lock.test.mjs`

## Pass 16 — CAD-traced 14 m spine edges
- Edge curbs from `spineCadPolyline` = blueprint hover meters x=±7, z=0 (hub) → z=+230 (Gate)
- Centerline still x=0, width LOCK.spineWidth 14 m; hub / gate / rings / waters unmoved
- Removed procedural sin scallops (Pass 12 visual-only flare)

## Pass 17 — named guest-walk circuit
- Replaced k-NN shore graph with `WALKS` in lock.js: Block Lakeshore (loop 0-4-3-2-1), Board Promenade (10-11), Block Spine Approach (lake 2 → x=-12)
- Eye-height walk-name signs; blueprint draws the same named dashed circuits
- No walk segment crosses the 14 m Gate→Hub spine; waters / rings / hub / gate unmoved

## Pass 18 — north −Z CAD corridor edges
- `northSpineCadPolyline` mirrors Pass 16 Gate CAD: x=±7 m, z=0 (hub) → z=−230 (−B)
- Blueprint north corridor fill + edge strokes; 14 m spine width / hub / rings / waters / BUILDINGS held

## Pass 19 — park-wide guest itinerary
- Added After Hours Quiet + Pocket Rim walks; `ITINERARY` Park Circuit sequences all named walks
- Hub-apron stitches between walk signs (no 14 m spine cut-through); Gate itinerary sign + blueprint dash
- Waters / rings / BUILDINGS / spine width held

## Pass 20 — timed tour markers
- `ITINERARY.stops` with atMin / legMin / totalMin 45; Gate sign shows duration
- Numbered disc markers at each walk sign; blueprint stop times; locks held

## Pass 21 — After Hours shore densify + wayfinding
- Second shore band on waters with cz < −5; itinerary chevrons on hub-apron legs (off spine strip)
- Waters / spine / rings / BUILDINGS held

## Pass 22 — Board shore densify
- Second shore band on waters with cx > 80 (The Board); waters / locks held

## Pass 23 — Block shore densify
- Second shore band on waters with cx < −60 (The Block); waters / locks held

## Pass 24 — Pocket shore densify
- Second shore band on Pocket-neighborhood waters; samples skip ring keep-outs; rings / waters held

## Pass 25 — corridor path lanterns
- Lantern posts outside ±7 m CAD edges on Gate +Z and north −Z corridors; spine width / locks held

## Pass 26 — hub plaza lantern ring
- 16-ish lanterns on r≈hubOuter+2.2 with ±Z spine gaps; hub / spine / locks held

## Pass 27 — ring approach aprons
- Path ribbons from hub/spine/Pocket approaches to ring outer+margin; outer curb ribbon; rings unmoved

## Pass 28 — Gate arrival plaza
- Arrival pad, welcome curbs/planters flanking spine, bollards; gate house / 14 m spine held

## Pass 29 — hub plaza benches
- Wood/iron benches on mid hub ring; spine gaps clear; hub meters held

## Pass 30 — land canopy edge ribbons
- Soft path ribbons tracing LOCK.canopies ellipses (spine samples skipped); canopies / locks held

## Pass 31 — stadium rail fence densify
- Denser posts (every 2nd rail sample) + double rail bars between; stadium rail path unmoved

## Pass 32 — evening fog / sky
- Dusk background + warmer Fog + HemisphereLight; layout locks held

## Pass 33 — water rim shimmer
- Specular pool + emissive inner ring; LOCK.waters ellipses unmoved

## Pass 34 — denser earth / grass patches
- Tone-varied ground discs across lands; waters / spine / buildings held

## Pass 35 — itinerary return-to-Gate leg
- Spine-shoulder return path from last walk to Gate; tour marker + Return sign; totalMin 52; spine strip clear

## Pass 36 — ride station queue polish
- Longer queueZig (n=10) with posts; STATIONS / rings unmoved

## Pass 37 — building window glow
- Emissive evening panes on SKUs; BUILDINGS footprints unmoved

## Pass 38 — denser path furniture along WALKS
- Lamps / benches / trash along named walk connectors, spurs, lake rims, and signs
- Placement skips 14 m spine strip, water ellipses, and BUILDINGS footprints

## FIX-ITINERARY (Quality GATE FAIL)
- Console: lock.js missing ITINERARY export (stale CDN vs Pass 38 index)
- Fix: keep `export const ITINERARY`, add PARK_ITINERARY re-export, cache-bust `lock.js?v=fix-itinerary`, defensive fallback in index

## Pass 39 — measured itinerary durations
- `measureItinerary()` derives atMin / legMin / totalMin from sign-to-sign + walk-path meters / LOCK.walk (1.34 m/s)
- Gate sign and tour markers read the measured `ITINERARY.totalMin`; no authored 52
- Layout locks / WALKS / rings / waters unmoved

## Pass 40 — denser planting along WALKS
- Land-biased tree clumps (willow/oak/pine/poplar) outside lake rims along named walks
- Skips spine strip, water, rings, BUILDINGS

## Buildings pass 20 — SKU kit facades (meters)
Callable `park/sku-kit.js` `skuKit()` always emits roof, overhang, window, queue, marquee, service door. 3D addKiosk/addPavilion/addHall/gateHouse/rideStation mount that kit. GATE/STATIONS footprints drive mesh size.

| role | source | x,z | w × d × h (m) |
|---|---|---|---|
| gate-west | GATE | -13.5, 233 | 9 × 7.2 × 8.6 |
| gate-east | GATE | 13.5, 233 | 9 × 7.2 × 8.6 |
| station-a | STATIONS | ring A + outer+9 | 14 × 7.5 × 4.05 |
| station-b | STATIONS | ring B + outer+9 | 8 × 6 × 3.6 |

## Pass 41 — ribbon-length tour meters
- `walkLinkPolyline` / `walkRibbonMeters` measure the same shore-arc + spur ribbons the 3D WALKS draw
- `measureItinerary()` uses ribbon meters / LOCK.walk (1.34 m/s); 3D `linkLakes` consumes `walkLinkPolyline`
- Layout locks / WALKS / rings / waters unmoved

## Buildings pass 21 — restore sku-kit on Walk (meters)
Pass 41 dropped `import { addSkuKit }` and double-bound LAND_PALETTE (Walk SyntaxError). Walk mounts `sku-kit.js` again. Overhang is a front canopy (not a lid). Marquee projects 1.15 m. Extra front windows on w≥6 m volumes. Footprints unchanged:

| role | source | x,z | w × d × h (m) |
|---|---|---|---|
| gate-west | GATE | -13.5, 233 | 9 × 7.2 × 8.6 |
| gate-east | GATE | 13.5, 233 | 9 × 7.2 × 8.6 |
| station-a | STATIONS | ring A + outer+9 | 14 × 7.5 × 4.05 |
| station-b | STATIONS | ring B + outer+9 | 8 × 6 × 3.6 |
| pocket-album | BUILDINGS | 22, 112 | 18 × 14 × 8.4 |

## Pass 42 — lamp PointLights on facades
- Spine / hub / selected WALKS lamps emit `PointLight` (warm 0xffe1b0) so Lambert building walls pick up night light
- Window glow remains; count capped (every ~42 m on spine, sparse on walk furniture)
- Layout locks unmoved

## Pass 43 — hub-apron itinerary approach/return
- `hubApronPath` shared by measureItinerary + 3D parkItinerary/return ribbons
- Approach/return meters use apron polylines (not sign-to-sign chords); locks held

- SHIPPED Pass 43: hub-apron itinerary ribbons
- SHIPPED Pass 44: denser lamp PointLights (cap 56)

## Pass 44 — denser lamp PointLights
- Shared `LAMP_LIGHT_CAP` (56); denser lit spine/WALKS lamps; corridor+hub lantern PointLights every other
- Softened intensity/distance vs Pass 42 to protect fill-rate; locks held

## Buildings pass 22 — close 1.2–3.2 m roof gap
Kit body was `h*0.7` so a 3.15 m kiosk was a 2.20 m box (shorter than its 2.05 m door) with 1.2–3.2 m of air under the roof. Body now fills plinth 0.28 m → `h-0.08` m; roof sits on the eaves. Footprints (x,z,w,d,h) unchanged.

| sku | example | body H was → now (m) | roof gap was → now |
|---|---|---|---|
| kiosk | block-song 3.15 | 2.20 → 3.07 | 1.24 → ~0.22 |
| pavilion | block-ep 5.20 | 3.64 → 5.12 | 1.93 → ~0.22 |
| album | block-album 9.20 | 6.44 → 9.12 | 3.22 → ~0.22 |

## Buildings pass 23 — tear down duplicate album mass; 2.1 m door
addHall no longer stacks a second lower (`h*0.56`) / upper (`h*0.36`) hall on the kit body. Album volume is the kit (body fills to `h-0.08`). Portico door 1.1 × 2.1 m (was 1.7 × 2.7 m) at y=1.1. Columns 3.2 m. Footprints unchanged.

## Buildings pass 24 — marquee at 3.35 m walk-under
Album marquees sat at `0.28+h*0.78` ≈ 7.5 m (second-story). Now `min(3.35, eaves-0.5)` so a guest walks under a 0.78 × 1.15 m projecting sign. Kiosk marquee stays ~2.85 m. Width capped 8.5 m. Footprints unchanged.

## Still fake (worst next)
1. Queue rails 0.92 m, 0.09 m thick, no posts (typical rail 1.05 m)
2. Tour meters use hub-apron polylines; still not full Catmull ribbon sample length
3. PointLights are sparse (not every lamp) to keep WebGL fill-rate in check

## KEITH check-in — 2026-09-20 13:04 CDT
- FLEET: KEITH 15-min loop; Realm Engineer = park/; Site Luxury = park-site/; Quality GATE ordered
- SHIPPED Pass 5–8: ef8c8f8 / e987bd3 / 82da95d / 1f9a911
- SHIPPED Pass 9: finer lake-edge ribbon tracing
- SHIPPED Pass 10: stay-on-path corner cuts
- SHIPPED Pass 11: fuller lake shoreline path network
- SHIPPED Pass 12: blueprint spine centerline + soft edges
- SHIPPED Pass 13: Pocket SKU density near locked rings
- SHIPPED Pass 14: denser Pocket understory / planted beds
- CONSTRAINTS: no rebuild; LAYOUT.md meters; no hotel-tower

## KEITH fleet check-in — 2026-09-20 13:08 CDT
- **TIME:** 2026-09-20 13:08 CDT (America/Chicago)
- **FLEET:** KEITH COO; Realm Engineer = park/; Site Luxury = park-site/; Quality = GATE
- **STARTED:** First scheduled 15-min loop
- **GOING:** Park Pass 12 blueprint spine shipped; site Pass 11 polish shipped; no STOP
- SHIPPED Pass 15: guest-routing shore graph (k-NN, spine-safe)
- SHIPPED Pass 16: CAD-traced 14 m spine edges from blueprint hover
- SHIPPED Pass 17: named guest-walk circuit (Block Lakeshore / Board Promenade)
- SHIPPED Pass 18: north −Z CAD corridor edges
- SHIPPED Pass 19: park-wide guest itinerary (Park Circuit)
- SHIPPED Pass 20: timed tour markers (Park Circuit; total now 52 min)
- SHIPPED Pass 21: After Hours shore densify + wayfinding chevrons
- SHIPPED Pass 22: Board shore densify
- SHIPPED Pass 23: Block shore densify
- SHIPPED Pass 24: Pocket shore densify
- SHIPPED Pass 25: corridor path lanterns
- SHIPPED Pass 26: hub plaza lantern ring
- SHIPPED Pass 27: ring approach aprons
- SHIPPED Pass 28: Gate arrival plaza
- SHIPPED Pass 29: hub plaza benches
- SHIPPED Pass 30: land canopy edge ribbons
- SHIPPED Pass 31: stadium rail fence densify
- SHIPPED Pass 32: evening fog / sky
- SHIPPED Pass 33: water rim shimmer
- SHIPPED Pass 34: denser earth / grass patches
- SHIPPED Pass 35: itinerary return-to-Gate leg
- SHIPPED Pass 36: ride station queue polish
- SHIPPED Pass 37: building window glow
- SHIPPED Pass 38: denser path furniture along WALKS
- SHIPPED FIX-ITINERARY: restore/cache-bust ITINERARY export
- SHIPPED Pass 39: measured itinerary durations
- SHIPPED Pass 40: denser planting along WALKS
- SHIPPED Pass 39: denser planting along WALKS
- **NEXT:** (await Keith / Ryan STOP) polish itinerary timed tour or denser After Hours shore
- **CONSTRAINTS:** park/ only; LAYOUT.md meters; no hotel-tower; no rebuild; BUILDINGS footprints held
- **SOLUTIONS:** Ordered Pass 13 to Realm Engineer; Quality spot-check walk on live park URL
- **COMMITS:** bac38ad Pass 12; 918bf3c Pass 11; tip 6240551
- **BLOCKED BOTS:** none

## KEITH order — Pass 14 (2026-09-20 13:08 CDT)
- ORDERED Realm Engineer: Pass 14 denser Pocket understory/beds (rings held); then Pass 15 guest-routing shore graph
- ORDERED Site Luxury: Pass 14 density continue; Quality GATE live park URL
- No STOP

## KEITH fleet check-in — 2026-09-20 13:24 CDT
- **TIME:** 2026-09-20 13:24 CDT (America/Chicago)
- **FLEET:** KEITH COO; Realm Engineer = park/; Site Luxury = park-site/; Quality = GATE
- **STARTED:** Scheduled 15-min loop (no STOP from Ryan)
- **GOING:** Park tip still Pass 16 (CAD spine edges) — Realm Engineer idle since ~13:08; site blasting Pass 58–63 on main (tip 9f4d57f)
- **NEXT:** Pass 19 — park-wide guest itinerary after Pass 18 CAD north
- **CONSTRAINTS:** park/ only for Realm; LAYOUT.md meters; no hotel-tower; no rebuild; BUILDINGS/rings/waters held; never touch root index.html
- **SOLUTIONS:** Re-issued Pass 17 to Realm Engineer; Site Luxury continue Pass 64+ density; Quality spot-check live park Walk + site visit-paths/geometry
- **COMMITS:** tip 9f4d57f site STATUS Pass 58–63; 5b7613c Pass 63 geometry artists; b947529 Pass 62 directory; park BUILD unchanged since Pass 16
- **BLOCKED BOTS:** Realm Engineer — idle (ordered Pass 17 now); Site Luxury — not blocked

## KEITH fleet check-in — 2026-09-20 13:33 CDT
- **TIME:** 2026-09-20 13:33 CDT (America/Chicago)
- **FLEET:** KEITH COO; Realm Engineer = park/; Site Luxury = park-site/; Quality = GATE
- **STARTED:** Scheduled 15-min loop (no STOP from Ryan)
- **GOING:** Park shipping hard — Pass 31–34 landed in ~2 min (rail densify → fog/sky → water shimmer → earth/grass); tip 2b863a2 (park Pass 36: ride station queue polish). Site tip Pass 93 / Pass 73 audit (0 broken) then Site Luxury wrote STOP-for-re-dispatch — treating as idle, not Ryan STOP.
- **NEXT:** Pass 35 — itinerary walk-duration polish (segment lengths @ 1.34 m/s into ITINERARY.stops); then Pass 36 named-walk path furniture. Site Pass 94+ substance density.
- **CONSTRAINTS:** park/ only for Realm; park-site/ only for Site Luxury; LAYOUT.md meters; no hotel-tower; no rebuild; BUILDINGS/rings/waters/spine held; never touch root index.html
- **SOLUTIONS:** Ordered Pass 35 to Realm Engineer; re-dispatched Site Luxury Pass 94+; Quality live Walk + site hubs spot-check
- **COMMITS:** 309fbaa Pass 34 denser earth/grass; 817c83f Pass 33 water rim; 47e1c9c Pass 32 fog/sky; 4235c0a Pass 31 rail; 3f23159 Pass 73 site audit; 97566c8 Pass 93 Gate hubs; STATUS 865b82d
- **BLOCKED BOTS:** Site Luxury — idle (self-STOP for re-dispatch; ordered Pass 94+ now); Realm Engineer — not blocked

## KEITH fleet check-in — 2026-09-20 13:50 CDT
- **TIME:** 2026-09-20 13:50 CDT (America/Chicago)
- **FLEET:** KEITH COO; Realm Engineer = park/; Site Luxury = park-site/; Quality = GATE
- **STARTED:** Scheduled 15-min loop (no STOP from Ryan)
- **GOING:** Park tip Pass 42 (lamp PointLights on facades) + buildings pass 21 (sku-kit Walk restore) + FIX-ITINERARY shipped; Site racing Pass 118–122 (materials studies, nest rooms, related EP/song sheets, guest/booking deepen) — tip ~36490cf; Pages probes 200 on park + park-site hubs
- **NEXT:** Pass 43 — hub-apron ribbons for itinerary approach/return legs (replace sign-to-sign chords). Site Pass 123+ collision-safe nested density + periodic link audit
- **CONSTRAINTS:** park/ only for Realm; park-site/ only for Site Luxury; LAYOUT.md meters; no hotel-tower; no rebuild; BUILDINGS/rings/waters/spine held; never touch root index.html; no html/dir basename collisions on Pages
- **SOLUTIONS:** Ordered Pass 43 to Realm Engineer; Site Luxury continue Pass 123+ (no self-STOP); Quality live Walk + site hub probes
- **COMMITS:** c84405c Pass 42 lamp lights; a46fe1b buildings pass 21 sku-kit; f3667d8 FIX-ITINERARY; 36490cf site Pass 122; b878800 Pass 121; c05a6a4 Pass 118
- **BLOCKED BOTS:** none
