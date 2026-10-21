# SPEC 04 — Levels

> **Status:** Approved
> **Depends on:** SPEC 01, SPEC 02, SPEC 03
> **Date:** 2026-10-20
> **Objective:** Replace the single block layout with 5 progressive levels defined as ASCII grids in `js/levels.js`, with increasing ball speed, a `Level N` HUD, and a `levelclear` step between levels.

---

## Scope

**In:**

- New file `js/levels.js` defining the global `LEVELS` (5 layouts), loaded in `index.html` before `js/game.js`.
- Layouts are ASCII grids: one string per row, one char per column (10 columns), one char per block colour or empty.
- Level 1 reproduces the current 6x10 layout exactly (same colours, same rows).
- Ball speed grows per level: `BALL_SPEED * ( 1 + LEVEL_SPEED_STEP * ( level - 1 ) )` with `LEVEL_SPEED_STEP = 0.08`.
- Clearing a level (after the last explosion finishes) enters a new mode `levelclear` with an overlay; Space or click loads the next level in `ready`.
- Clearing the last level enters `won` (existing overlay).
- Score and lives carry over between levels.
- Game over or restart after `won` resets to level 1, score 0, lives 3.
- HUD shows `Level: N` at the top centre.
- Sounds, explosions, pause and mute keep working in every level.
- Update `CLAUDE.md` (repo state, file layout, modes).

**Out of scope (for future specs):**

- Gray / multi-hit / indestructible blocks.
- Power-ups, extra lives, bonus points per level.
- Level select menu, level editor, or procedural levels.
- Persisting level progress or high scores.
- New sounds (level cleared, level start) or new sprites.
- Per-level backgrounds or music.
- Automated tests.

## Data model

Block, explosion and sound structures from SPEC 01–03 are unchanged. New file and state:

```js
// js/levels.js (plain script, no modules; defines a global like assets/spritesheet.js)
// One char per column: R red, Y yellow, C cyan, M magenta, H hotpink, G green, '.' empty.
const LEVELS = [
  [ 'RRRRRRRRRR',
    'YYYYYYYYYY',
    'CCCCCCCCCC',
    'MMMMMMMMMM',
    'HHHHHHHHHH',
    'GGGGGGGGGG' ],
  // ...levels 2–5
];

// js/game.js
const LEVEL_SPEED_STEP = 0.08;

const state = {
  // ...SPEC 01–03 fields unchanged
  level: 1,   // 1-based; LEVELS[ state.level - 1 ] is the active layout
};
```

Conventions:

- Every row string has exactly `BLOCK_COLS` (10) characters. Max 8 rows per level (blocks end at y = 316, well above the paddle at y = 440).
- Row `i`, column `j` maps to `x = j * BLOCK_W`, `y = BLOCK_TOP + i * BLOCK_H`.
- Colour char to colour name: `{ R: 'red', Y: 'yellow', C: 'cyan', M: 'magenta', H: 'hotpink', G: 'green' }`, held in `game.js`.
- Levels 2–5 are authored during implementation; each must contain at least 20 blocks and use gaps (`.`) so layouts differ visibly.
- `state.ball.speed` is set when a level loads; launch and paddle bounce already read `b.speed`.
- New mode `levelclear`. Full mode list: `ready | playing | paused | levelclear | won | gameover`.
- `state.muted` still survives `resetGame()`.

## Implementation plan

1. Create `js/levels.js` with `LEVELS` containing only level 1 (the current layout). Add the `<script>` tag to `index.html` before `js/game.js`. Game runs unchanged.
2. In `js/game.js`, add `LEVEL_SPEED_STEP`, `state.level = 1`, the colour-char map, and a `loadLevel( n )` function that sets `state.level`, builds `state.blocks` from `LEVELS[ n - 1 ]`, clears `state.explosions`, sets `state.ball.speed`, sets `mode = 'ready'` and calls `placeBallOnPaddle()`. Make `createBlocks( n )` read the grid. `resetGame()` calls `loadLevel( 1 )` after resetting score and lives. Manual test: game plays and restarts exactly as before.
3. Add levels 2–5 to `LEVELS`. Manual test: temporarily call `loadLevel( n )` from the console and see each layout and its ball speed.
4. Replace the win handling: when no alive blocks remain and `state.explosions` is empty, set `mode = 'levelclear'` if `state.level < LEVELS.length`, else `'won'`. In `handleAction()`, `levelclear` calls `loadLevel( state.level + 1 )`. Add `levelclear: [ 'Level cleared', 'Space or click to continue' ]` to `OVERLAY_TEXT`. Manual test: clear level 1, see overlay, continue into level 2 with score and lives kept.
5. Draw `Level: N` at the top centre in `drawHud()`. Manual test: number updates on each level and resets to 1 after restart.
6. Update `CLAUDE.md` (state of repo, file layout with `js/levels.js`, modes list, `index.html` script order).

## Acceptance criteria

- [ ] The game loads with no console errors and shows `Level: 1`.
- [ ] Level 1 looks identical to the current layout: 6 rows x 10 blocks, same colour order.
- [ ] `LEVELS.length === 5` and every row of every level has exactly 10 characters.
- [ ] Clearing level 1 plays its last explosion, then shows the `Level cleared` overlay (not `You win!`).
- [ ] Space or click on the `Level cleared` overlay loads level 2 in `ready` with the ball on the paddle; `Level: 2` is shown.
- [ ] Score and lives are the same before the overlay and after loading the next level.
- [ ] Ball launch speed in level N is `360 * ( 1 + 0.08 * ( N - 1 ) )` px/s (level 5 = 475.2 px/s).
- [ ] Clearing level 5 shows `You win!`; Space or click restarts at level 1 with score 0 and 3 lives.
- [ ] Losing the last life in any level shows `Game over`; restarting begins at level 1 with the level 1 layout and speed.
- [ ] Losing a life (not the last) keeps the same level, the same remaining blocks and the same ball speed.
- [ ] Levels 2–5 each have at least 20 blocks and contain at least one empty cell.
- [ ] Explosions, sounds, pause (P) and mute (M) work in every level; no explosions or blocks carry over into the next level.
- [ ] P does nothing during `levelclear`.
- [ ] Mute state survives level changes and restarts.

## Decisions

- **Yes:** 5 levels. Enough to show progression without a large authoring cost.
- **No:** 3 or 10 levels. 3 feels too short; 10 adds layout work with no new mechanics.
- **Yes:** ASCII grids in `js/levels.js`. Layouts are readable and editable at a glance; no build step needed (plain script global, like `assets/spritesheet.js`).
- **No:** layouts inline in `game.js`. Grows the file with data.
- **No:** procedural generation. Harder to control and verify.
- **Yes:** difficulty = layout + ball speed only. Uses existing `b.speed`; minimal code.
- **No:** gray multi-hit blocks. Needs hit counters and hit feedback; its own spec.
- **Yes:** score and lives carry over; game over restarts at level 1. Classic Arkanoid behaviour.
- **No:** reset lives per level, or restart the current level on game over. Softer but not what was chosen.
- **Yes:** dedicated `levelclear` mode with overlay. Gives the player a pause between levels and reuses the overlay system.
- **No:** auto-advance without overlay. Abrupt, and the ball would reset with no warning.
- **Yes (author default, not explicitly confirmed):** `LEVEL_SPEED_STEP = 0.08` (level 5 is 32% faster). Tune on playtest.
- **Yes (author default, not explicitly confirmed):** `Level: N` at the top centre, since score is left and lives/mute are right.
- **Yes (author default, not explicitly confirmed):** layouts use only the six existing colours; level 1 equals the current layout.
- **Yes (author default, not explicitly confirmed):** pause is not available in `levelclear`, same as `ready`/`won`/`gameover` today.
- **Yes (author default, not explicitly confirmed):** no sound for level clear or level start (no assets).

## Risks

| Risk                                                      | Mitigation                                                                                          |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Malformed layout row (wrong length or unknown char)       | Acceptance criteria check row length; `createBlocks` skips `.` and the unknown-char case is covered by manual review of the 5 grids. |
| Layouts too sparse make a level trivial                   | Minimum 20 blocks per level for levels 2–5.                                                         |
| Ball speed at level 5 causes tunnelling through blocks    | 475 px/s at max dt of 1/30 s is ~16 px per frame, equal to `BALL_SIZE`. Verify in playtest; lower `LEVEL_SPEED_STEP` if it tunnels. |
| `levels.js` forgotten or loaded after `game.js`           | `index.html` script order documented in `CLAUDE.md`; a missing `LEVELS` fails loudly at load.       |

## What is **not** in this spec

- Gray, multi-hit or indestructible blocks.
- Power-ups, bonus points or extra lives.
- Level select, editor, or procedural levels.
- Persisted progress or high scores.
- New sounds or sprites.
