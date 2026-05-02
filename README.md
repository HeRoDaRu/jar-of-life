# 🫙 Jar of Life

A browser-based Game of Life simulation contained inside a glass jar, styled as an ant colony viewed from the outside. Built with vanilla HTML, CSS, and JavaScript — no dependencies, no build tools.

![License: MIT](https://img.shields.io/badge/license-MIT-amber)

**[▶ Live demo](https://herodaru.github.io/jar-of-life)**

-----

## What is this?

[Conway’s Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game%27s_of_Life) is a cellular automaton where cells live or die based on how many neighbours they have. This project constrains that simulation to the shape of a jar, masking out everything outside its silhouette. The visual aesthetic is inspired by ant farm colonies: dark soil, amber glowing tunnels, glass reflections.

## How to run

No installation required. Just open `index.html` in any modern browser.

```bash
git clone https://github.com/HeRoDaRu/jar-of-life.git
cd jar-of-life
open index.html
```

## Controls

|Input             |Action                         |
|------------------|-------------------------------|
|Left click / drag |Draw live cells                |
|Right click / drag|Erase cells (kill)             |
|**Play / Pause**  |Toggle simulation              |
|**Reset**         |Randomise with a new population|
|**Clear**         |Kill all cells                 |

All painting happens in real time — the simulation does not pause when you draw.

## How it works

- The jar silhouette is defined as a `Path2D` bezier curve.
- At startup, a `mask[]` array precomputes which grid cells fall inside the jar using `isPointInPath()`, so the simulation never processes cells outside the shape.
- The soil texture is generated procedurally once into an offscreen canvas and reused every frame.
- The glass shine overlay is also rendered once and composited on top as a static layer.
- Live cells are drawn with a radial gradient glow to simulate bioluminescent tunnels.

## Tech stack

- Vanilla HTML / CSS / JavaScript
- Canvas 2D API
- Zero dependencies

## License

MIT
