# Signal Bleed Importer: GM Layer Labels

Adds GM-layer label generation.

## Usage

1. Open a floor page.
2. Select the **MAP** layer.
3. Select the map image.
4. Run:

```text
!hopepunk-signal-bleed --gm-labels floor-a --dry-run
```

If the preview looks reasonable:

```text
!hopepunk-signal-bleed --gm-labels floor-a
```

Other floors:

```text
!hopepunk-signal-bleed --gm-labels floor-b
!hopepunk-signal-bleed --gm-labels floor-c
!hopepunk-signal-bleed --gm-labels floor-d
```

Clear labels:

```text
!hopepunk-signal-bleed --clear-gm-labels floor-a --dry-run
!hopepunk-signal-bleed --clear-gm-labels floor-a
```

## Notes

The labels are placed relative to the selected map image, so the command should work even if the map image was resized.
The generated labels are Roll20 text objects on the `gmlayer`.
