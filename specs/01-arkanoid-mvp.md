# SPEC 01 — Arkanoid MVP

**Status:** Approved
**Depends on:** none
**Date:** 2026-10-20
**Objective:** A playable single-level Arkanoid in an HTML5 canvas (paddle, ball, blocks, 3 lives, score), using the existing sprite sheet.

---

## Scope

### In
- HTML5 canvas game, plain JS, no build step.
- Keyboard (Left/Right or A/D) and mouse paddle control; Space or click launches the ball.
- Ball bounces off walls (left, right, top), paddle (angle depends on hit position) and blocks.
- One fixed level: 6 rows x 10 columns, one row per colour (red, yellow, cyan, magenta, hotpink, green), 1 hit per block.
- 3 lives; ball falling off the bottom costs a life and resets the ball onto the paddle.
- Score: flat 10 points per block.
- HUD: score and lives, drawn on the canvas.
- States: `ready`, `playing`, `paused`, `won`, `gameover`. P toggles pause. Space/click on end screens restarts.
- Sprites via existing `assets/spritesheet.js` (`loadSpritesheet`, `drawSprite`).

### Not in
- Audio (`assets/sounds/*` unused).
- Explosion animation (`EXPLOSION_FRAMES` unused; block disappears instantly).
- Multiple levels, level progression.
- Gray blocks / multi-hit blocks (gray sprite unused).
- Power-ups, high score, any persistence.
- Touch controls, mobile layout, gamepad.
- Automated tests.

## Data model

No persistent data. Runtime state in `js/game.js`:

```js
const state = {
  mode: 'ready',        // 'ready' | 'playing' | 'paused' | 'won' | 'gameover'
  score: 0,
  lives: 3,
  paddle: { x, y, w, h, speed },
  ball:   { x, y, w, h, vx, vy, speed },
  blocks: [ { x, y, w, h, color, alive } ],
};
```

Constants (defaults chosen here, tweakable): canvas 640x480; block 64x32 (sprite 32x16 at 2x); paddle 120x14; ball 16x16; ball speed 360 px/s; paddle speed 480 px/s; max bounce angle 60° from vertical; blocks grid 10 cols x 6 rows starting at y = 60.

## Implementation plan

1. Create `index.html` (canvas 640x480, loads `assets/spritesheet.js` then `js/game.js`, links `css/style.css`) and `css/style.css` (centered canvas, dark background). Page loads without errors.
2. `js/game.js`: bootstrap — call `loadSpritesheet`, start `requestAnimationFrame` loop with delta time, clear + draw paddle sprite. Paddle visible.
3. Paddle input: keyboard (Left/Right, A/D) and mouse X tracking, clamped to canvas.
4. Ball in `ready` mode follows the paddle; Space/click launches it upward. Wall bounces (left, right, top).
5. Paddle collision: reflect with angle from hit position (center = vertical, edges = ±60°), constant speed, ball pushed above paddle to avoid sticking.
6. Build the block grid (6 colours x 10 columns); draw with `drawSprite('block_<colour>')`. Ball–block AABB collision: remove block, add 10 to score, flip vx or vy by minimum penetration axis.
7. Lives: ball below canvas → lives-1, back to `ready`; lives 0 → `gameover`. No alive blocks → `won`.
8. HUD (score top-left, lives top-right) and overlay text for `ready`, `paused`, `won`, `gameover`. P toggles pause; Space/click on `won`/`gameover` resets state.
9. Manual playthrough of the acceptance criteria; update `CLAUDE.md` (repo state, run instructions, file layout).

## Acceptance criteria

- [ ] Opening `index.html` (via local static server) shows canvas, paddle, ball on paddle, 60 blocks in 6 colour rows, HUD with `Score: 0` and 3 lives; no console errors.
- [ ] Left/Right, A/D and mouse move the paddle; it never leaves the canvas.
- [ ] Space or click in `ready` launches the ball upward.
- [ ] Ball bounces off left, right and top walls.
- [ ] Hitting paddle centre sends ball ~vertical; hitting an edge sends it ~60° from vertical; ball speed stays constant.
- [ ] Ball hitting a block removes it, adds 10 to score, and bounces the ball.
- [ ] Ball falling off the bottom reduces lives by 1 and returns to `ready`.
- [ ] After the 3rd lost ball, `gameover` overlay shows; Space/click restarts with score 0, lives 3, 60 blocks.
- [ ] Clearing all 60 blocks shows `won` overlay (score 600); Space/click restarts.
- [ ] P pauses (ball and paddle frozen, "Paused" shown) and resumes.
- [ ] No sound plays and no explosion animation is drawn.

## Decisions taken and discarded

- **Stack: HTML5 canvas + JS (taken).** Sprite sheet is already browser JS; Pygame from README discarded. README is stale (Spanish, says Pygame) — not updated in this spec.
- **Files `index.html` + `js/game.js` + `css/style.css` (taken)** over a single inline file or Vite; no build tooling for an MVP.
- **Keyboard + mouse controls (taken)** over keyboard-only or mouse-only.
- **3 lives, win by clearing all blocks (taken)** over 1 life or infinite lives.
- **One fixed level, 1-hit blocks, gray unused (taken)**; multi-level and multi-hit deferred to a later spec.
- **Score + lives HUD, no audio, no explosion animation (taken).** Reduces MVP scope; assets stay available for later.
- **Paddle angle by hit position (taken)** over pure mirror reflection to avoid loops and give player control.
- **Flat 10 pts per block (taken)** over per-row scoring.
- **Pause with P (taken).**
- **Canvas/sprite sizes (defaults chosen by the spec author, not explicitly confirmed):** 640x480, 2x block scale, 120x14 paddle. Adjust freely during review.

## Identified risks

- **Sprite sheet loading via `file://`:** `loadSpritesheet` copies the image to an offscreen canvas and draws from it; opening via `file://` may not taint it for drawing, but `getImageData` is not used so it should work. If it fails, serve with a static server (`python -m http.server`).
- **Tunnelling at high speed / low framerate:** 360 px/s with dt clamp (e.g. max 1/30 s) keeps per-frame movement under the 16 px ball size; clamp dt in the loop.
- **Corner/double block hits:** resolve at most one block per frame to avoid double bounces.
