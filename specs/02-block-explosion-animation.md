# SPEC 02 — Block explosion animation

> **Status:** Implmented
> **Depends on:** SPEC 01
> **Date:** 2026-10-20
> **Objective:** When the ball destroys a block, play that block's 4-frame explosion animation from the existing sprite sheet before it disappears.

---

## Scope

**In:**

- On block hit, the block is removed from gameplay immediately (no collision, score added at hit) and an explosion animation plays at its position.
- Animation uses `EXPLOSION_FRAMES[ color ]` (4 frames, 32x16) drawn at block size 64x32, total duration `EXPLOSION_DURATION` (150 ms).
- Animation timers advance only while `mode === 'playing'`; frozen in `paused`.
- `resetGame()` clears all active explosions.
- `won` triggers only after the last block's explosion finishes. Ball and paddle-ball collision are frozen during that wait; paddle still moves.
- Update `CLAUDE.md` (repo state, file layout) to reflect the animation.

**Out of scope (for future specs):**

- Audio (`break-sound.mp3`, `ball-bounce.mp3` stay unused).
- Particles, screen shake, score pop-ups, or any other effect.
- Gray / multi-hit blocks.
- Making the ball collide with a block during its animation.
- Automated tests.

## Data model

Block objects from SPEC 01 are unchanged. New runtime state in `js/game.js`:

```js
const state = {
  // ...SPEC 01 fields unchanged
  explosions: [ /* { x, y, w, h, color, elapsed } */ ],  // elapsed in ms
};
```

Conventions:

- `x, y, w, h` copied from the destroyed block.
- `elapsed` starts at 0 and grows by `dt * 1000` per `playing` update.
- Frame index = `Math.min( 3, Math.floor( elapsed / ( EXPLOSION_DURATION / 4 ) ) )`.
- Explosion is removed when `elapsed >= EXPLOSION_DURATION`.

## Implementation plan

1. Add `state.explosions = []` and clear it in `resetGame()`. Game runs unchanged.
2. On block hit in `update()`, push `{ x, y, w, h, color, elapsed: 0 }` to `state.explosions` alongside `hit.alive = false`. Game runs unchanged (nothing drawn yet).
3. In `update()`, while `mode === 'playing'`, advance `elapsed` for each explosion and drop finished ones.
4. In `draw()`, draw each explosion with `drawFrame( ctx, EXPLOSION_FRAMES[ color ][ frame ], x, y, w, h )`, after blocks and before paddle. Manual test: hit a block, see 4-frame animation.
5. Change win handling: when no alive blocks remain, stop ball movement and collision; set `mode = 'won'` once `state.explosions` is empty. Manual test: clear the last block, see its explosion, then overlay.
6. Update `CLAUDE.md` (state of repo, `game.js` description).

## Acceptance criteria

- [x] Hitting a block draws a 4-frame explosion at the block position, in that block's colour, lasting ~150 ms.
- [x] The block sprite is gone on the hit frame; the ball cannot collide with the exploding block.
- [x] Score increases by 10 on the hit frame, not at the end of the animation.
- [x] Hitting several blocks in quick succession plays overlapping animations independently.
- [x] Pressing P during an explosion freezes it on the current frame; resuming continues it.
- [x] After `gameover` or `won`, restarting shows no leftover explosions.
- [x] After the last block is hit, its explosion plays fully, then the `won` overlay appears (score 600).
- [x] During the final-explosion wait, losing the ball is impossible (ball frozen) and lives stay unchanged.
- [x] No sound plays and no console errors appear.

## Decisions

- **Yes:** instant removal from gameplay, cosmetic-only animation. Keeps SPEC 01 collision and scoring untouched.
- **No:** ball collides during animation. Risk of double hits and score ambiguity.
- **Yes:** `won` waits for last animation. Player sees the final explosion.
- **No:** immediate `won`. Overlay would cover the explosion.
- **Yes:** animation frozen on pause, cleared on restart. Consistent with game clock.
- **No:** wall-clock timing. Animation would continue under the pause overlay.
- **No:** audio in this spec. Separate spec.
- **Yes (author default, not explicitly confirmed):** freeze the ball while waiting for `won`, so a life cannot be lost after the last block is cleared. Adjust on review.
- **Yes (author default, not explicitly confirmed):** no new mode; the `won` wait is handled inside `playing` to avoid touching mode checks in input and HUD code.
- **Yes:** explosions stored in a separate `state.explosions` array, not on the block. Blocks stay simple; finished explosions are just dropped.

## Risks

| Risk                                                  | Mitigation                                                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `gray` explosion reuses `red` frames                  | Gray blocks are out of scope; no impact.                                                         |
| Pause during final-wait leaves `won` pending          | Timers advance only in `playing`; `won` fires after resume. Covered by acceptance criteria.      |
| Ball frozen mid-air looks odd during the ~150 ms wait | Wait is short; accepted. Revisit if it feels wrong in playtest.                                  |

## What is **not** in this spec

- Audio of any kind.
- Particles, shake, score pop-ups.
- Gray or multi-hit blocks.
- Collision with exploding blocks.
