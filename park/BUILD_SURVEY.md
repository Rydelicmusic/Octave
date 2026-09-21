# 45-minute survey loop
Director: Ryan. Hands: Grok Build. Start: 2026-09-20 22:54 CDT. Stop after 45 min.

## Organization (definition)
A cell is organized when:
- It has a job (road / lawn / mass / belt) — not two jobs
- Neighbor cells of the same land look similar (even count ±1)
- Nothing sits on a lot it does not own

Capacity per 25 m G-cell (inside stadium, not hub, not spine):
- ground road: 0 or 1 road segment. Never a stub that ends in empty lawn.
- mass: 0–1 building. Never 2.
- canopy: 0–2 trees. If a neighbor cell in the same land has 0 and this has 3+, move one.
- prop: 0–2 (bench or lamp). Along path edge only. Never mid-lawn.

Even geometry:
- Roads = axis-aligned or 90° T at hub r32. No diagonal slashes across a cell.
- Tree belts = offset ~6 m from path edge, spacing 8–10 m along the path.
- Benches face the path, 16–20 m apart, same side as lamps they pair with.

Illegal (always pull):
- Road that does not connect spine/hub to a land canopy
- Circle pond / pink disc / lily-pad plate
- Tree or bench on asphalt, spine, or hub r32
- Math.random x/z

## Loop (repeat until 45 min)
1. SURVEY — read occupy-map.json + LAYOUT.md. Count lots per G-cell. List offenders.
2. FIX ONE CLASS only this iteration (rotate):
   A roads · B leftover circles · C trees over capacity · D empty cells under capacity · E benches/lamps
3. CLAIM — whyBlocked / at / near. Fail = skip. Do not nudge onto spine.
4. DUMP — occupy-map.json + one line in park/SURVEY_LOG.md (cell, action, id).
5. REPEAT. Do not rewrite lock.js. Tiny file + tiny wire per pass.

Stop when 45 min elapsed OR two full A–E rotations with no offenders.
