# Hope//Punk Starter Job: Signal Bleed

Draft module/scenario files for a Hope//Punk starter job.

This is an unofficial fan creation for Hope//Punk by RavensDagger.

Official rules and information: https://ravensdagger.itch.io/hopepunk

## Roll20 requirements

This module is designed for a Roll20 game using the public **Hope//Punk** character sheet template.

When creating the Roll20 game, choose:

```text
Character Sheet: Hope//Punk

## Current contents

```text
handouts/
  00_GM_Overview.md
  01_Player_Start_Here.md
  02_Player_Hooks.md
  03_Mercy_Twelve_Clinic.md
  04_Redline_Choir.md
  05_NPCs_GM.md
  06_Bluewire_Deescalation.md
  07_Scene_Outline.md
data/
  signal_bleed_npcs.json
roll20/
  hopepunk_signal_bleed_importer.js
```

The Markdown handouts can be copied into Roll20 handouts manually.

The importer is an early draft. It creates scenario handouts and NPC character entries with Bio/GM Notes, but it is intentionally conservative about detailed sheet mechanics until the NPC stat format is finalized.

Commands:

```text
!hopepunk-signal-bleed --help
!hopepunk-signal-bleed --dry-run
!hopepunk-signal-bleed --import
!hopepunk-signal-bleed --overwrite
```
