# Arkanoid

Arkanoid game built with HTML5 canvas and plain JavaScript (no build step, no dependencies). Destroy all the blocks with a ball bouncing off a paddle you control, across 5 levels of increasing speed.

## Features

- 5 levels defined as ASCII grids in `js/levels.js`; ball speed grows 8% per level.
- Score and lives carry over between levels; game over restarts at level 1.
- Block explosion animation from the sprite sheet.
- Sound effects for bounces and block breaks, with mute toggle.

## Running

Serve the repo root with any static server and open `index.html`:

```
python -m http.server
```

or `npx serve`. Opening `index.html` directly over `file://` may fail to load the spritesheet.

## Controls

| Input                    | Action                    |
| ------------------------ | ------------------------- |
| Left/Right arrows, A/D   | Move paddle               |
| Mouse                    | Move paddle               |
| Space or click           | Launch ball / continue / restart |
| P                        | Pause / resume            |
| M                        | Mute / unmute             |

## Project layout

- `index.html` — 640x480 canvas.
- `js/game.js` — game logic and rendering.
- `js/levels.js` — level layouts.
- `assets/` — spritesheet and sound effects.
- `specs/` — feature specs.
