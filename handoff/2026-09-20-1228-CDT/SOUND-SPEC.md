# SOUND-SPEC — VIME v1 (Realm One)

**Role:** one original track = world clock. Music drives the scene; gesture only changes the mix.  
**Owner:** Sound Lead · **Gesture lock (Engineer):** Harmony Drop · **Track path:** `/public/audio/realm-one.mp3` (`'/audio/realm-one.mp3'` in Vite)  
**Rights:** Keith’s original only. No ripped game music. No SEGA / “Sonic” samples or marks.  
**Status:** Interim MP3 is on the locked path. Engineer `AudioEngine` matches this spec (Player A + Layer B → masterGain → Analyser → destination).

## Tempo (world clock)

- **Provisional:** 120 BPM (4/4) until detect or Keith confirms.
- **Detect on load:** decode `realm-one.mp3` → Web Audio / Tone.js; estimate BPM from low-band onset density over first 8–16 bars (or Tone OfflineContext peak intervals). Cache; do not re-detect every frame.
- **Clock:** analyser `currentTime` + BPM → bar/beat phase. Visuals sync to this clock, not wall time.

## Energy states (RMS + spectral flux)

| State | When | World feel |
|-------|------|------------|
| **intro** | low RMS, sparse kicks, first ~16–32 bars | dim lights, slow drift, soft fog |
| **groove** | steady kick + mid energy | ground pulse, idle particles |
| **lift** | rising high-band (“rise”), RMS climbing | FOV stretch, rim brighten, particles accelerate |
| **drop** | post-rise kick spike + broadband | one flash / scale punch → groove |

Hysteresis: hold ≥ 2 bars before switch (except drop = event).

## Beat → 3D (always on; not the gesture)

| Event | Detect | World / uniforms |
|-------|--------|------------------|
| **kick** | low ≈20–120 Hz transient | ground bump + light tick → `uKickFlash` / `uBass` |
| **snare** | mid ≈150–400 Hz transient | side flash / particles |
| **rise** | high-band climb ≥0.5–2s | FOV + haze; primes drop → `uMelody` climb |

One analyser on the **master bus**. Never rebuild the graph when swapping the file.

## One v1 interaction → audio

**Harmony Drop** (only gesture)

- **Input:** pointerdown on canvas **or** Space → **toggle**. No hold, no drag, no second music control. (E = scenic lights only — not music.)
- **Audio:** fade Layer B in/out ~150–300 ms. Does **not** pause or restart the master clock.
- **World:** optional soft glow when Layer B ON — confirm only.

## Drop in Keith’s file without breaking the analyser

1. Place at **`public/audio/realm-one.mp3`** (exact name).
2. Code URL stays `'/audio/realm-one.mp3'`.
3. Graph: Player (A) + Layer B → masterGain → analyser → destination.
4. Missing file → silent loop at same URL; swap MP3 = no code change.
5. Re-run BPM detect once after buffer loads.

## Layer B (describe only)

Pad / harmony bed, same key/tempo, −6 to −12 dB vs master. Optional stem `realm-one-b.mp3` or Tone synth pad. Toggle = Harmony Drop. Not a second album.

## Rights (ship gate)

**Keith original** for Realm One / VIME. Forbidden: game OST rips, SEGA assets, Sonic samples/stems/marks, uncleared loops.
