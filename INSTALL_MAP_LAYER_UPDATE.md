# INSTALL.md map setup update

Add or replace the map-placement section in `INSTALL.md` with this text.

## Place maps on the MAP layer

Maps should be placed on the Roll20 **MAP** layer, not the **TOKENS** layer.

Recommended workflow for each map page:

1. Create or open the Roll20 page for the floor/map.
2. Select the **MAP** layer.
3. Drag the map image onto the tabletop/canvas.
4. If Roll20 asks **Change size for VTT?**, choose:

```text
Adjust Page Size
```

This resizes the Roll20 page to fit the image. It is usually the safest first choice for these module maps.

Do not choose **Fit to Page** unless you have already set the page to the exact intended dimensions and want Roll20 to stretch/scale the image to that existing page.

After choosing **Adjust Page Size**, check the page dimensions and grid alignment. If needed, fine-tune the page or map image dimensions manually.

## Why MAP layer matters

If the map image is on the **TOKENS** layer, it can cover the Roll20 grid and intercept clicks. That makes the map behave like a giant token.

Correct final state:

```text
Map artwork: MAP layer
NPC/player tokens: TOKENS layer
GM-only markers: GM layer
```

When you are on the **TOKENS** layer, you should be able to select character/NPC tokens, but not the map artwork.

If you can still click or right-click the map artwork while on the **TOKENS** layer, the map is probably on the wrong layer. Move it to:

```text
MAP / Map & Background
```

## Bring to Front / Send to Back

Do not use **Bring to Front** for base map artwork.

**Bring to Front** only changes stacking order inside the current layer. If a full-page map is on the TOKENS layer and brought to the front, it can cover tokens and make interaction difficult.

For base map artwork:

```text
Layer: MAP
Stacking: Send to Back if needed
```

For character and NPC pieces:

```text
Layer: TOKENS
```

## Grid visibility troubleshooting

If the grid is visible in the white page area but not over the map artwork, the map image is probably on the TOKENS or FOREGROUND layer.

Fix:

1. Select the layer where the map can currently be clicked.
2. Click the map image.
3. Move it to the **MAP** layer.
4. Return to the **TOKENS** layer.
5. Confirm the grid appears over the map and the map can no longer be selected from the TOKENS layer.
