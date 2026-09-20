# ART-BIBLE — Realm One (VIME)

**Day job (2026-09-20):** ONE lucid-club / premium-night scene for Engineer to match tonight.  
**Role:** World Art  
**Scene count:** ONE (no second realm)  
**Look:** premium night / lucid club — match Keith’s hotel video, not generic, not cartoon  
**Motif (locked):** **Album Tower — hotel lobby + tower**  
**Brand:** REALM ONE / VIME only — **no SEGA / Sonic / hedgehog** marks or wordmarks  

**Sources:**  
- This file  
- `/workspace/project/realm-one/refs/VIDEO-MATCH.md`  
- `/workspace/project/realm-one/refs/stills/still-01` … `still-04` (pinned)  
- HTML twin: `legacy/keith-interaction-examples/day7-album-tower-v2-lobby.html`  

**Status:** ART DONE — holding for Engineer scene match. Cap = 4 stills (no more Imagine).

---

## Motif — Album Tower (one scene)

Outside night approach → glass doors → walkable lobby (long desk, upright mural, wavy ceiling) → Lobby Lights / aurora mood → stairs/elevator stubs OK.  
Songs-as-floors DNA from HTML twin; **one** music gesture: Harmony Drop (+ Lobby Lights as mood visual only).

---

## Five-color palette

| Token | Hex | Role |
|-------|-----|------|
| `void` | `#07060B` | Night sky, fog, dark aurora mode |
| `mist` | `#1A1630` | Charcoal ceiling / shadow fill |
| `neon-violet` | `#8B5CFF` | Maroon-purple banners / multi neon |
| `cyan-haze` | `#3DE8FF` | Teal title, glass rim, aurora strips |
| `warm-pulse` | `#FF4D8D` | Kick bloom; amber facade dashes; warm poles |

Materials (cream, oak, brass, fabric) are lit by these five — not extra brand colors.

---

## Bass vs melody (shader uniforms)

- **Bass / `uBass` / `uKickFlash`:** desk base + floor `warm-pulse`; facade amber dashes spike  
- **Melody / `uMelody`:** teal ceiling strips phase; mural swirl emissive  
- **Harmony Drop:** one gesture — intensify aurora / Layer B (Sound). Lobby Lights pedestal = visual mood toggle in twin  

---

## Shader / geometry (no Blender)

Build with boxes + planes + emissive shaders:

1. Facade + **horizontal equalizer dashes** + teal center title (REALM ONE / DAY 7 layout — no Sonic)  
2. Triple glass bays + center doors + warm pole lights  
3. Lobby shell, wood slats, left sconce  
4. Very long desk (cream / wood / base strip / score lines)  
5. Back mural plane (ridge landscape) + **upright** REALM ONE wordmark  
6. Wavy hanging banner ceiling → dark panels + curved teal neon strips (lights on)  
7. Leaf-shield / geometric tiled floor  
8. Sofa + table + LOBBY LIGHTS pedestal (right)  
9. Stairs / elevator on +X (HTML twin)  
10. Exp fog + bloom post  

---

## Four reference stills (pinned files)

| # | File | Role |
|---|------|------|
| 1 | `refs/stills/still-01-outside.jpg` | Outside EQ facade + triple glass |
| 2 | `refs/stills/still-02-lobby-enter.jpg` | **Frame A** — lobby enter (pass/fail) |
| 3 | `refs/stills/still-03-lights-aurora.jpg` | Lights on / neon strips |
| 4 | `refs/stills/still-04-kick-mood.jpg` | Dark lucid-club mood (kick = uniforms on this camera) |

Still 4 kick bloom = same camera as 3 with `uKickFlash` — do not invent a fifth still.

---

## Fail if Keith says “not my video”

- Generic empty lobby / upside-down mural / short desk  
- Outside without equalizer dashes + triple glass  
- Ceiling missing wavy banners → neon strip change  

---

## Engineer handoff

1. Ship **Still 2** look first (lobby enter).  
2. Match pinned stills + VIDEO-MATCH — strip Sonic text only.  
3. Wire Still 3–4 via Lobby Lights + `uBass` / `uMelody` / `uKickFlash`.  
4. Art holds after this pack — no second motif, no still #5.

**World Art status:** DONE for day job. Holding for Engineer scene match.
