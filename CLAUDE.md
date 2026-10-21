# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language

Always respond in English, and write all implementations (code, identifiers, comments, in-game text) in English, even though the README is in Spanish.

## State of the repo

Playable 5-level Arkanoid MVP (spec `specs/01-arkanoid-mvp.md`) with block explosion animation (spec `specs/02-block-explosion-animation.md`), sound effects (spec `specs/03-sound-effects.md`) and levels (spec `specs/04-levels.md`). HTML5 canvas + plain JS, no build step, no package manifest, no automated tests. `README.md` is stale (Spanish, says Pygame); the real stack is canvas JS.

## Running

Serve the repo root with any static server and open `index.html`, e.g. `python -m http.server` or `npx serve`. Loading the spritesheet may fail over `file://`.

## File layout

- `index.html` — 640x480 canvas `#game`; loads `assets/spritesheet.js`, then `js/levels.js`, then `js/game.js`.
- `css/style.css` — centered canvas, dark background.
- `js/levels.js` — plain script defining global `LEVELS`: 5 layouts, each an array of 10-char strings (one char per column: R red, Y yellow, C cyan, M magenta, H hotpink, G green, `.` empty).
- `js/game.js` — all game logic: `state` object (mode, score, lives, level, paddle, ball, blocks, explosions, muted), `update(dt)`, `draw()`, rAF loop with dt clamped to 1/30 s. Modes: `ready | playing | paused | levelclear | won | gameover`. `loadLevel( n )` builds blocks from `LEVELS`, sets ball speed (`BALL_SPEED * ( 1 + LEVEL_SPEED_STEP * ( n - 1 ) )`) and returns to `ready`; score and lives carry over between levels, `resetGame()` returns to level 1. Destroyed blocks leave a cosmetic entry in `state.explosions` (`{ x, y, w, h, color, elapsed }` in ms), advanced only in `playing`; `levelclear` (or `won` after the last level) fires once the last explosion finishes (ball frozen meanwhile). `SOUNDS` + `playSound( name )` play `bounce` (wall/paddle) and `break` (block hit) via `cloneNode()` so plays overlap; `state.muted` is not reset by `resetGame()`.
- `specs/` — feature specs (workflow: `/spec`, `/spec-impl`).

Controls: Left/Right or A/D or mouse = paddle; Space/click = launch / restart; P = pause; M = mute/unmute.

## Assets

- `assets/spritesheet-breakout.png` — single sprite atlas.
- `assets/spritesheet.js` — plain script (no modules/exports) defining globals: `EXPLOSION_FRAMES` (per-colour 4-frame 32x16 animations; `gray` reuses the `red` frames), `EXPLOSION_DURATION` (150), and `SPRITES` (paddle, ball, per-colour `blocks`). Load it via `<script>` before game code. Colours: red, cyan, green, magenta, yellow, hotpink, gray.
- `assets/sounds/ball-bounce.mp3`, `break-sound.mp3` — SFX for paddle/wall bounce and block break; played by `js/game.js`.
