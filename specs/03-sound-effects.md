# SPEC 03 — Sound effects

> **Status:** Approved
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-10-20
> **Objective:** Play the existing `ball-bounce.mp3` on paddle and wall hits and `break-sound.mp3` when a block is destroyed, with an M key to toggle mute.

---

## Scope

**In:**

- `ball-bounce.mp3` plays when the ball bounces off the left, right or top wall, or off the paddle.
- `break-sound.mp3` plays when the ball destroys a block. `ball-bounce.mp3` does not play on block hits.
- Rapid repeated events overlap instead of cutting each other off.
- M toggles mute in any mode. Mute state is not persisted.
- HUD shows a `Muted` indicator while muted.
- Sounds play only while `mode === 'playing'` (no sound is triggered in `paused`, `ready`, `won`, `gameover`).
- Playback failures (autoplay policy, missing file) never throw or break the game loop.
- Update `CLAUDE.md` (repo state, file layout, controls).

**Out of scope (for future specs):**

- Background music.
- Sounds for life lost, win, game over, launch, or menu actions (no assets exist).
- Volume slider or per-sound volume settings.
- Persisting mute in `localStorage`.
- Web Audio API, audio sprites, spatial or pitch-varied sound.
- Automated tests.

## Data model

Block, explosion and ball structures from SPEC 01 and SPEC 02 are unchanged. New runtime state in `js/game.js`:

```js
const SOUNDS = {
  bounce: new Audio( 'assets/sounds/ball-bounce.mp3' ),
  break:  new Audio( 'assets/sounds/break-sound.mp3' ),
};

const state = {
  // ...SPEC 01 and SPEC 02 fields unchanged
  muted: false,
};
```

Conventions:

- `playSound( name )` returns immediately if `state.muted` is true.
- Each play uses `SOUNDS[ name ].cloneNode()` so overlapping plays do not restart a single element.
- The `play()` promise rejection is caught and ignored.
- `state.muted` survives `resetGame()` (mute is a player preference, not game state).

## Implementation plan

1. Add `SOUNDS`, `state.muted = false` and `playSound( name )` to `js/game.js`. Do not call it yet. Game runs unchanged.
2. Call `playSound( 'bounce' )` in the wall bounce branches and the paddle bounce branch of `update()`. Manual test: ball hitting walls and paddle makes a sound.
3. Call `playSound( 'break' )` next to `hit.alive = false` on block hit. Manual test: block hit plays break sound only.
4. Add M key handling in the existing `keydown` listener to toggle `state.muted`, and draw `Muted` in `drawHud()`. Manual test: M silences and restores sound; indicator toggles.
5. Update `CLAUDE.md` (state of repo, controls, assets note that the SFX are now used).

## Acceptance criteria

- [ ] Ball hitting the left, right or top wall plays `ball-bounce.mp3`.
- [ ] Ball hitting the paddle plays `ball-bounce.mp3`.
- [ ] Ball destroying a block plays `break-sound.mp3` and does not play `ball-bounce.mp3` on that frame.
- [ ] Two block hits within 100 ms produce overlapping break sounds (the first is not cut off).
- [ ] Pressing M mutes all sounds and shows `Muted` in the HUD; pressing M again restores sound and hides the indicator.
- [ ] M works in `ready`, `playing` and `paused`.
- [ ] No sound plays while paused.
- [ ] Mute state is kept after `gameover`/`won` restart and is reset on page reload.
- [ ] Deleting an mp3 file does not throw or stop the game; no uncaught errors appear in the console.
- [ ] Launching the ball with Space or click (first user gesture) does not produce an autoplay error.

## Decisions

- **Yes:** SFX only, using the two existing files. No new assets needed.
- **No:** background music. No asset exists; separate spec if wanted.
- **Yes:** `break-sound.mp3` alone on block hit. Avoids two overlapping sounds on one event.
- **No:** both sounds on block hit. Muddier, no benefit.
- **Yes:** M toggles mute, not persisted. Simple and enough for the MVP.
- **No:** persisting mute in `localStorage`. Adds storage handling for little value.
- **Yes:** `HTMLAudioElement` with `cloneNode()` per play. No build step, no new dependency, overlap works.
- **No:** Web Audio API. Overengineering for two short clips.
- **Yes (author default, not explicitly confirmed):** `Muted` text in the HUD, placed under or next to the lives text. Position adjustable on review.
- **Yes (author default, not explicitly confirmed):** default volume 1.0 (no volume control).
- **Yes (author default, not explicitly confirmed):** `mute` survives `resetGame()`.

## Risks

| Risk                                                       | Mitigation                                                                                          |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Browser autoplay policy blocks `play()` before a gesture   | First sound happens after launch (Space/click), which is a user gesture. Rejections are caught.     |
| Many cloned `Audio` elements pile up in long sessions      | Clips are short; clones are garbage-collected after playback ends.                                  |
| `file://` loading fails                                    | Already documented in `CLAUDE.md`; use a static server.                                             |
| Clip latency makes bounce feel late                        | Preload with `preload = 'auto'`; revisit with Web Audio in a later spec if it feels wrong.          |

## What is **not** in this spec

- Background music.
- Sounds for life lost, win, game over or launch.
- Volume controls.
- Persisted mute.
