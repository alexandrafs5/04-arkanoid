# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language

Always respond in English, and write all implementations (code, identifiers, comments, in-game text) in English, even though the README is in Spanish.

## State of the repo

Early-stage Arkanoid/Breakout game. No game code, build system, package manifest, tests, or git repo yet — only `README.md` and `assets/`. Update this file once code lands.

## Stack discrepancy

`README.md` (Spanish) says the game is Python + Pygame. But `assets/spritesheet.js` is browser JS (`const` globals, canvas-style `{sx, sy, sw, sh}` source rects), which implies an HTML5 canvas game. Confirm with the user which stack to use before scaffolding.

## Assets

- `assets/spritesheet-breakout.png` — single sprite atlas.
- `assets/spritesheet.js` — plain script (no modules/exports) defining globals: `EXPLOSION_FRAMES` (per-colour 4-frame 32x16 animations; `gray` reuses the `red` frames), `EXPLOSION_DURATION` (150), and `SPRITES` (paddle, ball, per-colour `blocks`). Load it via `<script>` before game code. Colours: red, cyan, green, magenta, yellow, hotpink, gray.
- `assets/sounds/ball-bounce.mp3`, `break-sound.mp3` — SFX for paddle/wall bounce and block break.
