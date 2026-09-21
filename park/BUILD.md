# Grok Build — Park quality log
2026-09-20

Director: Ryan / Rydelic. Hands iterate in `park/` only.

## Locked (must hold after every commit)
- Stadium 760×460, A=380 B=230, cap R=230, straight=300
- Hub (0,0) r18/32, Gate (0,+230), 14 m spine, walk 1.34 m/s
- Rings A (95,95) 14/20 and B (118,108) 6/11 unmoved
- Water list + land canopies in LAYOUT.md / lock.js
- No hotel / tower / elevator; no root index.html edits

## Pass 100 — four land belts, rides readable
- Trees 6 m off drives/spine, 8–10 m spacing, 0–2/cell; claim rides before canopy
- 1.2 m stone pads under the 8 land rides; queue still faces each T-drive; no new rides

## Pass 99 — RIDE_QUEUE #1–#9 DONE
- Song kiosks: Board G6,0 / x 160 z 14; Block G-8,1 / x -187.5 z 37.5; Hours G-2,-7 / x -36 z -175; Pocket G2,2 / x 70 z 50
- EP pavilions: Board G7,0 / x 187.5 z 14; Block G-8,-1 / x -187.5 z -20; Hours G-3,-7 / x -60 z -175; Pocket G1,3 / x 40 z 80
- Gate signs x ±24 z 210 off spine; 4 m queues face each land drive; hub/spine clear

## Pass 98 — Walk/3rd free in oval (no nearestWalk)
- tick() walk: `if (inStadium(nx,nz)) { pos.x=nx; pos.z=nz; }` — no ribbon snap; drone unchanged

## Pass 97 — walk stays in stadium
- Walk step: `if(inStadium(nx,nz)){ pos.x=nx; pos.z=nz; }` — no ribbon snap; lock.js untouched

## Pass 96 — stop old spawners: __PARK_DRY, belts not forest
- `window.__PARK_DRY=true`: skip water() / lakeWalk / shore ribbons; `no-water.js` strips leftover discs
- Trees via placeTree, 8–10 m belt slots, cap 2/cell; props via placeProp; dump occupy-map.json
- lock.js waters array left in place, not drawn; no hotel; G2,3 locked masses kept

## Pass 95 — 45 min survey loop: axis drives, 2 trees/cell
- G-cell jobs: axis-aligned T-drives claimed as road lots; trees cap 2/cell then rehome or skip; props skip hub r32 and spine asphalt
- `organize.js` + SURVEY_LOG.md; occupy-map.json dumped with cells; lock.js / occupy.js / LAYOUT.md untouched

## Pass 94 — tidy After Hours oval: lawn plots, T-drives only
- Strip leftover lily-pad circles / pale rings / pink discs; stadium grass is the lawn
- Streets: hub ring on r32 + 14 m spine + one T-drive per land (After Hours turns into the canopy, not a second spine)
- Trees skip hub r32 and spine asphalt; occupy.js / lock.js / LAYOUT.md untouched

## Pass 93 — seedPark: masses + spine + land plates, dump cells
- One boot call `seedPark(LOCK, BUILDINGS, GATE, STATIONS)` (locked masses, 14 m spine, LAYOUT canopy plates)
- Trees `claim(treeLot)` or skip (no slide, hub r32 empty); `dump()` lots include CRS `cell`; spatial.js via occupy.js
- lock.js / LAYOUT.md untouched; no water; no hotel

## Pass 92 — occupy queries: spine seed, whyBlocked, dump map
- Boot: `seedLocked([...BUILDINGS,...GATE,...STATIONS]); seedSpine(LOCK)`
- New structure: `whyBlocked(lot)` first; fail = skip mesh; no spine nudge
- Trees still `claim(treeLot)` or skip; `dump()` writes `park/occupy-map.json`; spatial.js untouched

## Pass 91 — occupy lots + cam/GPS handoff
- `occupy.js` seeded with BUILDINGS/GATE/STATIONS; trees `claim(treeLot)` or skip; kits claim before mesh; no spine nudge
- setMode keeps Walk/3rd/Drone on the same XZ; GPS getter follows drone vs pos; lock.js untouched

## Pass 90 — CRS ground grid 25 / 100 m
- `park/grid-overlay.js` 25 m minor / 100 m major lines on grade; G-cell labels every 100 m
- Off in Walk, on in Drone; KeyG toggles; lock.js untouched

## Pass 89 — GPS HUD top-right (CRS)
- Wire only: `import { mountGpsHud } from './gps-hud.js'` then `mountGpsHud(() => pos)` (walk player meters)
- Chip is top-right; bottom-left pass card unmoved; lock.js untouched

## Pass 88 — dry park: strip all water discs, fill grass pads
- `park/dry-park.js` removes every pond/pool/rim/coping/mist; fills each locked ellipse with a grass pad (no holes, no new water)
- ∞ rings keep XZ; water material on them swapped to sand-path only
- Hub trees inside r32 stripped again; r18/r32/spine gaps held; lock.js unmoved

## Pass 87 — Block water: one pool + one coping, drive around
- `park/water-clean.js` The Block only: each locked ellipse is one filled pool + one 0.5×0.32 coping; 4 m berm off the lip
- Extra concentric rims / figure-8 shore ribbons / roads through water stripped; overlap stays water+coping, no merged flower
- Block drive T-junctions south around the cluster (x≈−52) with 4 m berm + 9 m half-width clear of water; lock.js / waters XZ unmoved

## Pass 86 — hub clean: r18 plaza, r32 curb, spine gaps
- `park/hub-clean.js` strips extras inside r32 (trees, sheds, spokes, beds, torus, hub ring road)
- Hub is only inner plaza r18, outer curb r32, ±Z 14 m spine gaps; land drives T-junction at r32 and do not cut the disc
- Waters / ∞ rings / LAYOUT XZ unmoved; lock.js untouched

## Pass 85 — hub ring inner lip r32, weave lakes
- `park/roads.js` ring inner lip on hub r=32, centerline 36.5 m, weaves out around hub lakes (no water move)
- Gaps only at the 14 m spine; one 9 m drive into each land canopy; curbs 0.45×0.48; kits on ROAD_DECK 0.28
- Waters / ∞ rings / spine width unmoved; not a second 14 m spine

## Pass 84 — hub ring + 9 m land drives
- `park/roads.js` asphalt ring on hub r=32 (gaps at 14 m spine + water) and one 9 m drive into each land
- Curbs 0.45×0.48 m; deck 0.28 m; kits sit on ROAD_DECK; waters / ∞ rings / spine width unmoved

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

## Buildings pass 25 — 1.05 m queue rails + posts
Kit queues were 0.92 m high, 0.09 m thick, two rails only. Now 1.05 m rails (0.05 m thick) with 0.1 m posts every 1.2 m along `queueL` (kiosk 2.6 / pavilion 4.4 / album 5.6 m). Footprints unchanged.

## Buildings pass 26 — gate bridge 1.1 m on 8.6 m wings
Was a 3.4 m-tall block centered at wing h=8.6 m (cut through the attic). Now a 1.1 m deck sits on the wings at y≈9.0 m, span = wing spacing + w (27 m), 18 m spine opening held. Ticket windows 1.6 × 0.9 m at y=1.2 m on each wing. GATE footprints ±13.5, 233 unchanged.

## Buildings pass 27 — ground windows at 1.45–1.6 m
Kiosk window center was `0.28+h*0.5` ≈ 1.85 m. Now kiosk 0.9 m pane at y=1.45 (sill ≈ 1.0 m); pavilion/album 1.05–1.4 m pane at y=1.6. Footprints unchanged.

## Buildings pass 28 — gate queues 2.2 m (not 5.6 m past rail)
Gate wings used album `queueL` 5.6 m, projecting to z≈242 (outside B=230). Gate `role` now uses 2.2 m rails. Land SKUs unchanged (kiosk 2.6 / pavilion 4.4 / album 5.6). GATE footprints ±13.5, 233 held.

## Pass 45 — spine lamps actually light
Gate→Hub poles sit at z=18,32,46,… so `z%28===0` / `z%42<1` never matched a spine z. Shared `spineLampLitWest` (`z%28===18`) / `spineLampLitEast` (`z%28===4`) + `spineLampPointLights()` light z=18 west and z=32 east (then every 28 m). 3D `lamp()` consumes `spineLampZs()` + those predicates. Locks held.

## Pass 46 — ride-station kit densify + zig queues in kit
- Station shed: belt, side windows, canopy posts, thicker platform (STATIONS/rings unmoved)
- Pass-36 zig queues folded into `skuKit` queue rails (`yaw` on emit.box); standalone `queueZig` removed

## Pass 47 — Catmull ribbon sample length for tour meters
- `catmullRibbonMeters` / `catmullPoint` match THREE pathRibbon (tension 0.18, segs=max(20,n*10))
- `walkRibbonMeters` + itinerary approach/return use Catmull sample length (not control-point polyline)

## Pass 48 — denser PointLights (Still fake #3)
- Cap 56→80; LAMP_LIGHT intensity 9→7, dist 22→17
- Spine: both sides lit every pole; corridor+hub every lantern (not every other); denser −Z + WALKS lit
- Fill-rate: lower intensity/distance so denser set stays under hard cap

## Pass 49 — gate ticket booth polish
- Framed dual ticket windows, sill, counter, canopy, TICKETS band per GATE wing
- Queue stanchions + rails on guest face (GATE x/z/w/d/h held)

## Pass 50 — water material densify
- Deep tint core + mid ring + dual shimmer bands + foam lip (LOCK.waters x/z/rx/rz held)

## Pass 51 — facade mid-block detail
- SKU kit: base + mid belt + pilaster rhythm + window muntins (+ upper row on tall SKUs)
- Album halls: denser bay grid, hall belt/base, denser pilasters, muntins in addWindowBay
- BUILDINGS x/z/w/d/h/yaw held

## Pass 52 — night fill polish
- Soft AmbientLight dusk fill (no PointLight cost)
- Denser windowGlow panes; walk-sign + canopy + mid-spine soft PointLights under shared cap
- Footprints / LAYOUT held

## Pass 53 — earth densify
- Canopy-grid + freckle scatter of tone-varied grass/dirt patches
- Skips spine strip, waters, BUILDINGS, STATIONS, rings
- Pass-34 hand spots kept

## Pass 54 — stadium rail densify
- denser railPts sample (segs 24→36); every-post + mid-posts; triple rail bars + caps
- Stadium S/B/R meters held; gate opening skip held

## Pass 55 — hub plaza densify
- Concentric plaza material bands; denser beds/planting; denser benches + planter/trash rhythm
- Inner paver chips; hubBenches 8→12
- Hub r18/32 + spine ±Z openings held

## Pass 56 — path curb polish
- pathBox curb-top wear chips + vertical joint grooves
- CAD spine-edge curb chips (14 m spine held)

## Pass 57 — wayfinding densify
- Denser itinerary chevrons (~10 m); directional posts + mini blade signs on WALKS connectors
- Hub apron shoulder + Gate approach posts (spine strip skipped)

## Pass 58 — guest seating densify
- Denser WALKS shore/connector benches; canopy seating pods; Gate + corridor flank benches
- Spine strip / waters / BUILDINGS / rings skipped

## Pass 59 — canopy understory densify
- Radial planted beds + understory clumps under each land canopy
- Skips spine strip, waters, BUILDINGS, rings, hub; canopy ellipses held
## Pass 60 — tour mid-leg pause seating
- Benches + trash along hub-apron itinerary legs between tour stops
- Spine strip / waters / BUILDINGS skipped; LAYOUT itinerary held

## Pass 61 — Gate secondary queue furniture
- Outer parallel queue lanes + waiting benches; denser approach bollards; info pedestals
- GATE footprints + 14 m spine held

## Pass 62 — SKU service aprons
- Rear loading pads + curb + dock bumper at BUILDINGS; small GATE rear pads
- BUILDINGS/GATE footprints held; spine/rings skipped

## Pass 63 — night water mist
- Translucent mist discs + shore wisps over LOCK.waters (meters held)
- Spine skipped on shore cards

## Pass 64 — PathRibbon curb companions
- Wear chips + joint posts along land sand pathRibbon edges (pathMat only)
- Spine asphalt ribbons unchanged; rings/waters skipped

## Pass 65 — Gate approach densify
- Crosswalk bars, approach planters, outer-queue shade posts/fabric, trash
- GATE footprints + spine held

## Pass 66 — station queue shade
- Canopy posts + fabric over zig queue in front of STATIONS (footprints held)

## Pass 67 — hub plaza mid densify
- Mid-ring litter cans + planters; inner pocket planter ring
- Hub IN/OUT + spine gaps held

## Pass 68 — After Hours walk furniture
- Mid-loop benches/lamps/trash on after-hours-quiet spur + north seating clusters
- Spine / waters / BUILDINGS / rings held

## Pass 69 — Boardwalk shore seating
- Seating clusters on Board land + board-promenade spur densify
- Waters / rings / BUILDINGS / spine held

## Pass 70 — 3.2 m lakeside walks (layout)
- Was RingGeometry 1.03–1.18 scaled by water rx,rz (west lake path ~7.2×10.5 m, torus curb 0.022×rx)
- Now `lakesideRibbonRuns` + `pathRibbon` at PATH_SCALE.lakesideW = 3.2 m, offset 2.6 m outside rim
- Spine strip skipped; water ellipses unmoved

## Pass 71 — 3.6 m path lanterns (layout)
- Corridor + hub lantern posts were 2.4 / 2.2 m (toy vs person-scale)
- Now PATH_SCALE.lampH = 3.6 m on CAD corridor edges and hub ring (spine gaps held)

## Pass 72 — 0.45 m spine curbs outside 14 m walk
- CAD curb ribbons were 0.9 m centered on x=±7 (ate 0.45 m of the 14 m asphalt)
- Now PATH_SCALE.spineCurbW = 0.45 m, center offset 0.225 m outside the strip
- Blueprint hover edges stay x=±7; waters / hub / rings unmoved

## Pass 73 — 0.28 m stadium rail posts (layout)
- Posts were 0.18×1.15 m with 0.07 m bars (paper from Drone)
- Now PATH_SCALE.railPost 0.28 m, railH 1.2 m, railBarT 0.12 m; stadium S/B/R and gate opening held

## Pass 74 — merge park-grounds planting/lighting into main buildings page
- Kept main `park/index.html` SKU-kit mounts (GATE / STATIONS / land SKUs); did not take grounds box facades
- Ported GROUNDS_SCALE meters: lamp 3.6, bench 0.45, lakeside 3.2, coping 0.5×0.32, hub beds 0.38, trunks 5.2–11.2
- Overlapping land tree belts via `beltTreePositions` + `treeMetrics`; hub radial beds; land wash; spine ropes 1.55 m off 14 m walk
- Water coping from `waterCopingSegments` (not rx-scaled); LAYOUT.md Pocket canopy (80,105,95,80) held

## Still fake (worst next)
- Water coping boxes still facet the ellipse (width is meter-true 0.5 m)
- Hub inner continuous curb is 0.22 m (step-over) while outer parapet is 0.55 m
- Gate arrival pathBox is 22 m wide vs 14 m spine




1. ~~Ride-station kit body / zig queues~~ — addressed Pass 46 (zig in sku-kit; denser shed)
2. ~~Tour meters hub-apron chords~~ — addressed Pass 47 (Catmull ribbon sample length)
3. ~~Sparse PointLights~~ — addressed Pass 48 (cap 80 + denser lit; still not 1:1 every mesh under fill-rate)
4. ~~Gate ticket booth blank kiosk~~ — addressed Pass 49 (windows/counter/queue)
5. ~~Water flat Lambert~~ — addressed Pass 50 (deep tint + foam lip + shimmer bands)
6. ~~Facade mid-block light~~ — addressed Pass 51 (pilasters/muntins/belts)
7. ~~Night fill thin~~ — addressed Pass 52 (ambient + walk/land soft fills under cap)
8. ~~Earth flat patches~~ — addressed Pass 53 (canopy + freckle tone scatter; locks skipped)
9. ~~Stadium rail sparse~~ — addressed Pass 54 (every/mid posts + triple bars)
10. ~~Hub plaza light~~ — addressed Pass 55 (bands/beds/furniture; r18/32 + spine gaps held)
11. ~~Path curb under-articulated~~ — addressed Pass 56 (wear chips + joints)
12. ~~Wayfinding sparse~~ — addressed Pass 57 (chevrons/posts/blade signs; spine clear)
13. ~~Guest seating thin~~ — addressed Pass 58 (WALKS/canopy/Gate/corridor benches)
14. ~~Canopy understory soft~~ — addressed Pass 59 (beds + clumps under canopies)
15. ~~Tour mid-leg pause seating thin~~ — addressed Pass 60 (hub-apron pause benches)
16. ~~Gate secondary queue thin~~ — addressed Pass 61 (outer lanes/bollards/info)
17. ~~SKU service doors bare~~ — addressed Pass 62 (rear aprons/bumpers)
18. ~~Night fog uniform / no local mist~~ — addressed Pass 63 (water mist discs + shore wisps)
19. ~~PathRibbon curb companions~~ — addressed Pass 64 (sand ribbon chips/joints)
20. ~~Gate approach thin~~ — addressed Pass 65 (crosswalk/planters/shade)
21. ~~Station queue shade thin~~ — addressed Pass 66 (posts + fabric over zig)
22. ~~Hub plaza mid litter/planters~~ — addressed Pass 67
23. ~~After Hours mid-loop furniture~~ — addressed Pass 68
24. ~~Boardwalk shore seating~~ — addressed Pass 69
25. Block land still needs mid-path bollard rhythm
26. Pocket rim still thin on south approach furniture

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

## KEITH fleet check-in — 2026-09-20 14:08 CDT
- **TIME:** 2026-09-20 14:08 CDT (America/Chicago)
- **FLEET:** KEITH COO; Realm Engineer = park/; Site Luxury = park-site/; Quality = GATE
- **STARTED:** Scheduled 15-min loop (no STOP from Ryan)
- **GOING:** Park tip Pass 45 (spine lamps actually light) + buildings passes 22–28 (roof gap, album mass, marquee 3.35 m, queue rails 1.05 m, gate bridge, ground windows, gate queues 2.2 m). Site racing Pass 160–166 (materials→nests, credits, visit-paths, land hubs, densify notes/materials→venues/works/guest/booking). Tip b5b11ad. Pages API still reports errored; live hubs mostly 200.
- SHIPPED Pass 46: ride-station kit densify + zig queues in sku-kit
- SHIPPED Pass 47: Catmull ribbon sample length for tour meters
- SHIPPED Pass 48: denser PointLights (cap 80, spine/corridor/hub/WALKS)
- SHIPPED Pass 49: gate ticket booth polish (windows/counter/queue; GATE held)
- SHIPPED Pass 50: water material densify (deep/foam/shimmer; waters held)
- SHIPPED Pass 51: facade mid-block detail (pilasters/muntins/belts; BUILDINGS held)
- SHIPPED Pass 52: night fill polish (ambient + soft fills; cap held)
- SHIPPED Pass 53: earth densify (tone-varied canopy/freckle patches)
- SHIPPED Pass 54: stadium rail densify (posts/bars; S/B/R held)
- SHIPPED Pass 55: hub plaza densify (bands/beds/furniture; hub radii held)
- SHIPPED Pass 56: path curb polish (wear chips + joints; spine held)
- SHIPPED Pass 57: wayfinding densify (chevrons/posts/signs; spine clear)
- SHIPPED Pass 58: guest seating densify (WALKS/canopy/Gate/corridor)
- SHIPPED Pass 59: canopy understory densify (beds/clumps; ellipses held)
- SHIPPED Pass 60: tour mid-leg pause seating (hub-apron benches)
- SHIPPED Pass 61: Gate secondary queue furniture (outer lanes; GATE/spine held)
- SHIPPED Pass 62: SKU service aprons (rear pads; footprints held)
- SHIPPED Pass 63: night water mist (waters held)
- SHIPPED Pass 64: PathRibbon curb companions (pathMat sand only)
- SHIPPED Pass 65: Gate approach densify
- SHIPPED Pass 66: station queue shade
- SHIPPED Pass 67: hub plaza mid densify
- SHIPPED Pass 68: After Hours walk furniture
- SHIPPED Pass 69: Board shore seating clusters
- **NEXT:** (await Keith) Block bollards or Pocket rim furniture (was: Pass 46 — ride-station kit body: fold Pass-36 zig queues into kit rails; densify shed body (STATIONS / rings held). Site Pass 167+ collision-safe nested density + periodic link audit.
- **CONSTRAINTS:** park/ only for Realm; park-site/ only for Site Luxury; LAYOUT.md meters; no hotel-tower; no rebuild; BUILDINGS/GATE/STATIONS/rings/waters/spine held; never touch root index.html; no html/dir basename collisions on Pages
- **SOLUTIONS:** Ordered Pass 46 to Realm Engineer; Site Luxury continue Pass 167+ (no self-STOP); Quality live Walk + site hub probes (note Pages errored)
- **COMMITS:** b5b11ad site Pass 166; 46ca18d buildings pass 28 gate queues; b0cec02 Pass 45 spine lamps; 4a60b3f STATUS Pass 165
- **BLOCKED BOTS:** none

## KEITH order — Pass 46 (2026-09-20 14:08 CDT)
- ORDERED Realm Engineer: Pass 46 ride-station kit body + fold zig queues into kit rails (STATIONS/rings held); then Pass 47 Catmull ribbon tour meters if Pass 46 ships
- ORDERED Site Luxury: Pass 167+ densify; keep MOCK roster; no self-STOP
- ORDERED Quality GATE: live https://rydelicmusic.github.io/octave/park/ Walk + park-site hubs; flag Pages errored vs 200 probes
- No STOP

## KEITH fleet check-in — 2026-09-20 14:21 CDT
- **TIME:** 2026-09-20 14:21 CDT (America/Chicago)
- **FLEET:** KEITH COO; Realm Engineer = park/; Site Luxury = park-site/; Quality = GATE
- **STARTED:** Scheduled 15-min loop (no STOP from Ryan)
- **GOING:** Park tip Pass 57 (wayfinding densify) after Pass 46–56 burst (ride-station kit, Catmull meters, PointLights, gate booth, water, facade, night fill, earth, rail, hub plaza, path curb). Site racing Pass 185–191 (court/, measure/, press/setlist, guest lounge/lost, booking receipt/transfer, paths night-loop/day-grid, materials, notes, thin wires). Tip c141c99. Live hubs 200; Pages API still intermittently errored.
- **NEXT:** Pass 58 — guest seating densify away from hub / WALKS belts (Still fake #13); then Pass 59 land canopy understory break-up. Site Pass 192+ collision-safe nested density + periodic link audit.
- **CONSTRAINTS:** park/ only for Realm; park-site/ only for Site Luxury; LAYOUT.md meters; no hotel-tower; no rebuild; BUILDINGS/GATE/STATIONS/rings/waters/spine held; never touch root index.html; no html/dir basename collisions on Pages
- **SOLUTIONS:** Ordered Pass 58 to Realm Engineer; Site Luxury continue Pass 192+ (no self-STOP); Quality live Walk + site hub probes
- **COMMITS:** c141c99 Pass 57 wayfinding; 843743d Pass 56 path curb; 9a8cc66 Pass 55 hub plaza; bdabfb6 site Pass 191 STATUS; 565a841 Pass 190; 6a4f46e Pass 189
- **BLOCKED BOTS:** none

## KEITH order — Pass 58 (2026-09-20 14:21 CDT)
- ORDERED Realm Engineer: Pass 58 guest seating densify (benches/planters off hub + off WALKS furniture belts; skip spine strip / waters / BUILDINGS / rings); then Pass 59 canopy understory if Pass 58 ships
- ORDERED Site Luxury: Pass 192+ densify; keep MOCK roster; no self-STOP; no new html↔dir collisions
- ORDERED Quality GATE: live https://rydelicmusic.github.io/octave/park/ Walk + park-site hubs; flag Pages errored vs 200 probes
- No STOP
