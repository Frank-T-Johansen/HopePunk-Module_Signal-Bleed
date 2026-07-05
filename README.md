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


## Roll20 requirements

This module is designed for a Roll20 game using the public **Hope//Punk** character sheet template.

When creating or configuring the Roll20 game, choose:

```text
Character Sheet: Hope//Punk
```


## Maps

The current draft assumes four main map floors inside the same megacomplex stack:

```text
Floor A: Mercy Twelve Clinic and Indoor Street
Floor B: Community Support, Shelter, and School Annex
Floor C: Service, Utility, and Maintenance Floor
Floor D: Quarantine, Incident Floor, and Landing Corner
```

These maps are intended to be stacked vertically with possible dummy floors in between. Elevators are the accessible and cargo/patient-safe route. Stair/ladderwells are emergency access routes: useful for PCs, bad for stretchers.


## Keyed map locations

The module now includes separate GM key handouts for each active map:

```text
handouts/14_Map_A_Clinic_Key.md
handouts/15_Map_B_Community_Support_Key.md
handouts/16_Map_C_Service_Utility_Key.md
handouts/17_Map_D_Incident_Key.md
```

The location keys are designed to prompt players to interact with the environment using many skills, not only Awareness/Investigation. Combat skills such as Small Arms, Big Guns, Blades, and Melee Combat can reveal tactical and forensic information without requiring violence.
