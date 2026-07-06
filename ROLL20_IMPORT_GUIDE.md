# Roll20 Import Guide: Signal Bleed

Use this script:

```text
roll20/hopepunk_signal_bleed_importer.js
```

The Roll20 chat command is:

```text
!hopepunk-signal-bleed
```

## Before importing

Create or open a Roll20 game using the public **Hope//Punk** character sheet template.

In Roll20 game settings, the selected character sheet should be:

```text
Hope//Punk
```

Do this before running the importer.

## Commands

```text
!hopepunk-signal-bleed --help
!hopepunk-signal-bleed --dry-run
!hopepunk-signal-bleed --import
!hopepunk-signal-bleed --overwrite
!hopepunk-signal-bleed --import --npcs
!hopepunk-signal-bleed --import --handouts
!hopepunk-signal-bleed --overwrite --npcs
!hopepunk-signal-bleed --overwrite --handouts
```

NPCs are created GM-only.

Handouts are created GM-only by default. Review them, then manually share the player-facing handouts with players.

Suggested player-facing handouts:

```text
Signal Bleed - Player Start Here
Signal Bleed - Player Hooks
```

Keep the GM overview, NPC notes, Bluewire de-escalation notes, and scene outline hidden from players.

## Asset linking helper

The importer can link already-uploaded Roll20 images to character sheets.

Workflow:

```text
1. Upload split portraits/tokens to Roll20 manually.
2. Create a page named Asset Staging.
3. Drag the uploaded assets onto that page.
4. Rename each placed graphic to match the character.
5. Select the staged graphics.
6. Run: !hopepunk-signal-bleed --link-selected-tokens
```

Dry-run first:

```text
!hopepunk-signal-bleed --link-selected-tokens --dry-run
```

Overwrite existing avatars/default tokens:

```text
!hopepunk-signal-bleed --link-selected-tokens --overwrite
```

Roll20 Mod/API scripts cannot upload local PNG files into your Art Library. The helper only links images that are already present in Roll20 as selected graphics.
