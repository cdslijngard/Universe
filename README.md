# Universe

A navigable atlas that spans twenty orders of magnitude, from a moon's surface
to the edge of the observable universe. Pick your own route and your own
altitude: step one abstraction level at a time, or jump straight to any of the
eight.

```bash
npm install
npm run dev
```

## The eight levels

| | Level | One scene unit | What's there |
| --- | --- | --- | --- |
| 1 | Body | the body's own radius | one world, animated, up close |
| 2 | Planetary system | 10⁵ km | moons and rings in their real orbits |
| 3 | Solar system | 1 AU | the Sun and its planets, at today's positions |
| 4 | Kuiper belt | 10 AU | the belt, the heliosphere, three spacecraft |
| 5 | Local stars | 1 ly | the nearest ~50 systems in true 3D |
| 6 | Milky Way | 1,000 ly | spiral arms, the bar, Sgr A*, and us |
| 7 | Local Group | 100,000 ly | Andromeda and our companions |
| 8 | Cosmic web | 10 Mly | filaments, voids, superclusters, the CMB |

## How it works

A single scene cannot hold twenty orders of magnitude: WebGL coordinates are
float32, so one unified system either collapses planets into the origin or
loses galaxies to precision noise. Each level is therefore its own scene with
its own unit, chosen so every coordinate sits in a float-friendly range. Levels
are stitched together by a cross-fade in which both scenes are briefly live.

Adjacent levels differ by anything from 1.4× to 6,300×, so transitions animate
a constant perceptual zoom rather than the true ratio — a literal 6,300× push
would spend the whole animation with everything invisibly small. The scale bar
reports the honest figure throughout.

Nothing is textured. Every surface, galaxy and belt is generated in GLSL from
noise, so the app has no assets to download and the storms and clouds actually
move rather than being a rotating photograph.

## Controls

| | |
| --- | --- |
| `+` / `↑` | zoom in one level |
| `−` / `↓` | zoom out one level |
| `1`–`8` | jump to a level |
| `L` | toggle labels |
| `T` | toggle true scale |
| `Esc` | clear selection |

Drag to orbit, scroll to dolly within a level, click to select, double-click to
descend into something.

## Data

Real figures throughout — orbital elements, parallax distances, masses,
spacecraft telemetry. See [SOURCES.md](SOURCES.md) for provenance, the
verification the orbital solver was put through, and an explicit list of the
three places where the geometry is deliberately not to scale.
