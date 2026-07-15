# Signal Bleed Importer: Visible GM Labels

This version makes GM-layer labels much more visible.

Default GM labels are now:

```text
44px white text
black pseudo-outline
GM layer
```

The outline is implemented with multiple offset Roll20 text objects behind the foreground label, because Roll20 text objects do not have a native stroke/outline option.

## Replace old tiny labels

Select any graphic on Floor A, then run:

```text
!hopepunk-signal-bleed --clear-gm-labels floor-a
```

Then select the map image on the MAP layer and run:

```text
!hopepunk-signal-bleed --gm-labels floor-a
```

## Optional styles

```text
!hopepunk-signal-bleed --gm-labels floor-a --label-size 56 --label-color yellow
!hopepunk-signal-bleed --gm-labels floor-a --label-size 48 --label-color white --outline-color black
!hopepunk-signal-bleed --gm-labels floor-a --no-outline
```

Available named colors include yellow, white, black, cyan, magenta, red, green, and blue.
Hex colors such as `#FFFF00` also work.
