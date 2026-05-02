# Roadmap

This document tracks what we want to build next, and why. It is intentionally written with context so that when we return to it after time away, the reasoning is still clear.

-----

## Phase 1 — Quality of Life

Features that improve the day-to-day experience of using the simulation. None of these change the core mechanics, but they make the tool significantly more comfortable to use.

### Speed control

A slider that adjusts how many simulation steps run per second. Right now the FPS is hardcoded. Being able to slow things down is essential for observing patterns as they evolve, and speeding up is useful to let a population stabilise quickly.

### Generation and population counter

A small live readout showing the current generation number (how many steps have elapsed) and how many cells are currently alive. This gives the user a sense of the simulation’s state at a glance — useful for noticing population crashes, oscillations, or growth phases.

### Insertable preset patterns

A way to stamp well-known Game of Life patterns (glider, pulsar, blinker, etc.) onto the grid at the cursor position. This is one of the most classical interactions in any GoL implementation. It lets the user seed interesting dynamics without having to draw them manually cell by cell.

-----

## Phase 2 — Experience

Features that deepen the sensory and interactive quality of the project. The jar aesthetic is central to the identity of this project, so this phase expands on it.

### Full touch support

Right now touch input only draws live cells. We need proper two-touch detection to distinguish “draw” from “erase” on mobile, and general polish for small screens (iPhone-class devices in particular). This matters because the project is frequently used on mobile.

### Visual biomes

Alternative colour palettes for the jar interior. The current amber-on-soil style is one flavour, but we could offer others: bioluminescent blue (deep sea), green phosphorescent (nuclear), monochrome grayscale (clinical), etc. Each biome would just swap CSS variables and gradient colours — no structural change to the simulation logic.

### Generative ambient sound

Sound that responds to the current state of the simulation: sparse population → near silence, dense activity → a low hum or crackling. This is not background music — it is generated dynamically based on how many cells are alive and where. The goal is to make the jar feel like something alive.

-----

## Phase 3 — Alternative Mechanics

Features that expand beyond standard Conway rules. This phase is the most experimental — it changes what the simulation *is*, not just how it looks or feels.

### Configurable ruleset

Conway’s rules are B3/S23 (a cell is Born with 3 neighbours, Survives with 2 or 3). There are hundreds of named variants (Day & Night, HighLife, Maze, etc.) each producing radically different emergent behaviour. Exposing the B/S rule as editable parameters — even just a dropdown of presets — would turn this from a single simulation into a platform.

### Multiple jars

Two or more jars on screen simultaneously, each running independently. The visual interest is in comparing how different initial conditions or rulesets evolve in parallel. A stretch goal would be allowing cells to migrate between jars through a connected tube.

### Geological layers

The jar interior divided into horizontal zones (top soil, clay, bedrock, etc.) where each layer has a different simulation speed or ruleset. Cells near the top evolve faster; cells at the bottom evolve slower or follow different survival rules. This creates a visual depth metaphor where the deeper you go, the stranger things get.

-----

## Phase 4 — Social

Features that let users share what they create. This phase only makes sense once the core experience is solid enough that people want to share it.

### Export as image or GIF

A button that captures the current state of the jar as a PNG, or records a few seconds of simulation as an animated GIF. This is the most natural way for someone to share a pattern they discovered — without needing to explain anything.

### Shareable URL with encoded state

The current grid state encoded into the URL (e.g. as a compressed base64 string). Copying the URL and sending it to someone would let them open the exact same jar in the exact same state. No server required — the entire state lives in the URL.

-----

*Last updated: May 2026*
