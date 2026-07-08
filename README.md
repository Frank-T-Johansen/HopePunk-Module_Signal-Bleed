# Hope//Punk Module: Signal Bleed

Roll20 support package for the Hope//Punk Signal Bleed module.

## Roll20 importer

The importer command is:

```text
!hopepunk-signal-bleed
```

Use:

```text
roll20/hopepunk_signal_bleed_importer.js
```

The importer can create/update:

```text
NPC character entries
module handouts
NPC portrait links
NPC default-token links
```

## Important asset-linking note

Roll20 does not reliably preserve the original local filename/order after assets are uploaded and placed as unnamed tabletop graphics.

The importer includes convenience naming commands, but the GM must dry-run and visually verify the proposed names before linking portraits/tokens.

Recommended dry-run before committing names:

```text
!hopepunk-signal-bleed --name-selected --asset-order --dry-run
```

or, if the staging page follows Roll20's reverse Uploaded Assets order:

```text
!hopepunk-signal-bleed --name-selected --asset-order --reverse --dry-run
```

Only after the dry-run matches the visible images should you run the real naming/linking commands.

See `INSTALL.md` for the full workflow and recovery steps.
