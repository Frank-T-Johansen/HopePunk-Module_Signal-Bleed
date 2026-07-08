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


## Current plot canon

The current module canon is in:

```text
handouts/21_Updated_Plot_Canon_GM.md
handouts/22_Missing_Person_Reports_GM.md
handouts/23_Antithesis_Hidden_Nest_GM.md
```

These supersede earlier signal-interference framing. Signal Bleed now treats the relay as human evidence and the Antithesis threat as biological: the corporation’s first nest was nearly destroyed, but escaped Model 1s seeded a second hidden nest that is producing juvenile Model 3s and gathering biomass.


## Map handout structure

Map handouts 10–13 are the main floor-operation handouts. They now summarize what happens on each map, active NPCs, major clues, surveillance ownership, and scene beats.

Map key handouts 14–17 are detailed keyed-location references. Use them when the PCs inspect a specific location or when you need skill prompts for a room, corridor, or feature.

Recommended GM flow:

```text
Use 10–13 to run the floor.
Use 14–17 to zoom into individual numbered locations.
Use 21–23 for current plot canon, missing persons, and Antithesis behavior.
Use 24–25 for missing-person descriptions and supporting NPCs.
```

## Installation and asset linking

See:

```text
handouts/26_Roll20_Installation_and_Asset_Linking.md
```

The Roll20 importer can create handouts and GM-only NPC character entries. It can also link selected, already-uploaded Roll20 graphics to matching character sheets as avatars/default tokens:

```text
!hopepunk-signal-bleed --link-selected-tokens --dry-run
!hopepunk-signal-bleed --link-selected-tokens
!hopepunk-signal-bleed --link-selected-tokens --overwrite
```

Roll20 Mod/API scripts cannot upload local PNGs into the Art Library, so portraits/tokens still need to be uploaded manually first.

## Portraits and tokens

The repository contains separate portrait and token assets:

```text
portraits/
tokens/
```

The Roll20 importer can link selected, already-uploaded Roll20 graphics to matching character sheets:

```text
!hopepunk-signal-bleed --link-selected-portraits
!hopepunk-signal-bleed --link-selected-tokens
!hopepunk-signal-bleed --link-selected-assets
```

The `tokens/` folder includes normal NPC tokens plus optional escalation tokens for Model 1 / Model 3 adolescent and adult variants.


## GM install note

GMs do not need to split portrait sheets. The repository already contains ready-to-upload files:

```text
portraits/
tokens/
maps/
```

Use the Roll20 installation guide:

```text
handouts/26_Roll20_Installation_and_Asset_Linking.md
```

## Roll20 setup

Start with:

```text
ROLL20_IMPORT_GUIDE.md
```

That file covers the steps required before the in-game Roll20 installation handout exists.

After importing, continue from the Roll20 handout:

```text
Signal Bleed - Roll20 Installation and Asset Linking
```

The source file for the full in-game guide is:

```text
handouts/26_Roll20_Installation_and_Asset_Linking.md
```

## Map scaling utility

The package includes a helper script for preparing larger Roll20 map files and optional transparent grid overlays.

Recommended for old or slower laptops:

```bash
python3 tools/scale_signal_bleed_maps.py --scale 3 --format jpg --quality 88
```

With transparent grid overlays too:

```bash
python3 tools/scale_signal_bleed_maps.py --scale 3 --format jpg --quality 88 --grid-overlay
```

The output is written to `maps_scaled/`.

Recommended format split:

```text
Scaled full-color maps: JPG
Transparent grid overlays: PNG
Tokens and portraits: PNG
```
