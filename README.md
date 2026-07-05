# Hope//Punk Starter Job: Signal Bleed

Draft module/scenario files for a Hope//Punk starter job.

This is an unofficial fan creation for Hope//Punk by RavensDagger.

Official rules and information: https://ravensdagger.itch.io/hopepunk

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
  hopepunk_signal_bleed_npc_importer.js
```

The Markdown handouts can be copied into Roll20 handouts manually.

The NPC importer is an early draft. It creates NPC character entries and fills Bio/GM Notes, but it is intentionally conservative about detailed sheet mechanics until the NPC stat format is finalized.

Commands:

```text
!hopepunk-signal-bleed-npcs --help
!hopepunk-signal-bleed-npcs --dry-run
!hopepunk-signal-bleed-npcs --import
!hopepunk-signal-bleed-npcs --overwrite
```
