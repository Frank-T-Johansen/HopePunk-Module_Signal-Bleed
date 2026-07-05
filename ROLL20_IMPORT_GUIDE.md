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
