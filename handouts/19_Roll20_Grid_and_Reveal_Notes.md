# Roll20 Map Setup: Grid, Scale, and Reveal

## Current map status

The current Signal Bleed maps are AI-generated concept/playtest maps. They include a visible grid baked into the image.

For now, the simplest Roll20 setup is:

```text
Turn Roll20 grid display off for these pages.
Use the baked-in map grid visually.
Use Dynamic Lighting / Fog of War for room-by-room reveal.
```

This is good enough for playtesting.

## Why the grid should be off

Roll20’s normal square grid assumes a clean pixel scale. These maps have artistically generated grids, not mathematically exact Roll20 grids. Trying to align Roll20’s grid perfectly may be fiddly.

For these playtest maps:

```text
Recommended:
- Disable visible Roll20 grid.
- Keep the map image as the visual grid.
- Move tokens freely or use approximate snapping if it feels close enough.
```

## Future production map requirement

For a cleaner future release, produce maps in one of these forms:

```text
Gridless map image + Roll20 grid enabled
```

or:

```text
Exact-size gridded map image where 1 square = 70 × 70 pixels
```

Useful Roll20 dimensions:

```text
30 × 30 squares = 2100 × 2100 px
35 × 35 squares = 2450 × 2450 px
40 × 40 squares = 2800 × 2800 px
50 × 50 squares = 3500 × 3500 px
```

For polished tactical use, prefer gridless maps and let Roll20 draw the grid.

## Dynamic Lighting / reveal recommendation

These maps are built for room-by-room reveal.

Suggested setup:

1. Put the map image on the Map layer.
2. Disable the visible Roll20 grid.
3. Use Dynamic Lighting walls around rooms and corridors.
4. Put doors on Dynamic Lighting as door segments if available.
5. Keep public megacomplex streets visible if the PCs are there.
6. Reveal rooms as doors open, cameras are accessed, staff guide the PCs, or gang/corp contacts provide floor knowledge.

## Public areas versus hidden areas

Public areas can often start visible:

- indoor streets
- clinic front entrance
- obvious concourse spaces
- public reception
- elevator lobby

Restricted areas should be hidden until accessed:

- emergency bay
- surgery / trauma
- pharmacy / supply
- recovery rooms
- staff records
- control rooms
- maintenance bypasses
- quarantine rooms
- landing corner, unless visible from a public camera feed

## Numbered labels

Do not permanently draw numbers onto the map yet.

Recommended playtest setup:

```text
Use small numbered text objects or marker tokens on the GM layer.
```

This lets you move or rename them as the keyed locations evolve.

Later, once locations are final, create optional annotated map copies.
