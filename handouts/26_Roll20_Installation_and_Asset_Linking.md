# Roll20 Module Installation and Asset Linking Guide

This guide is for a GM installing Signal Bleed into a Roll20 game.

The GitHub package already contains split portrait files and token files. GMs should **not** run the portrait-splitting script unless they are rebuilding the portrait assets from the original triptych images.

## What the importer can and cannot do

The Roll20 importer can create:

```text
GM-only handouts
GM-only NPC character entries
character avatars from selected uploaded portrait graphics
default tokens from selected uploaded token graphics
```

The importer cannot do these things automatically:

```text
upload image files into your Roll20 Art Library
create Journal folders reliably
move Journal entries into folders reliably
place map images for you
draw Dynamic Lighting walls
configure every page setting perfectly
```

So the basic installation pattern is:

```text
1. Create Roll20 pages.
2. Upload/place maps, portraits, and tokens.
3. Install the importer script.
4. Import handouts and NPC character entries.
5. Link staged portraits/tokens to the imported NPC sheets.
6. Manually organize Journal folders.
```

The image upload/staging work can be done before or after installing the script, but the actual linking step must happen **after** the NPC character entries exist.

## 1. Create Roll20 pages

Use the existing Roll20 `Start` page as the landing page. You may rename it, but that is optional.

Create these additional pages manually:

```text
Floor A - Clinic and Indoor Street
Floor B - Community Support
Floor C - Service Utility
Floor D - Quarantine Incident
Asset Staging - Portraits
Asset Staging - Tokens
```

### Page settings

When you turn Grid off, Roll20 shows page size in pixels. The old 40 × 30 grid-square recommendation is equivalent to 2800 × 2100 pixels because Roll20’s normal square is 70 pixels.

For `Start` and Floor A–D pages:

```text
Grid: Off
Width: 2800 px
Height: 2100 px
```

For asset staging pages:

```text
Grid: Off
Width: 1750 px
Height: 1750 px
```

If a map feels cramped, use:

```text
Width: 2800 px
Height: 2800 px
```

With Grid off, you do not need a separate snap-to-grid setting.

## 2. Upload and place maps

Upload the map images from the repository’s `maps/` folder into Roll20.

Suggested placement:

```text
Start
  Optional splash / landing image

Floor A - Clinic and Indoor Street
  maps/10_Map_Floor_A_Clinic_and_Indoor_Street.png

Floor B - Community Support
  maps/11_Map_Floor_B_Community_Support.png

Floor C - Service Utility
  maps/12_Map_Floor_C_Service_Utility.png

Floor D - Quarantine Incident
  maps/13_Map_Floor_D_Quarantine_Incident.png
```

For each map page:

1. Open the page.
2. Switch to the **Map & Background** layer.
3. Drag/upload the map image onto the page.
4. Resize it to fit the page area.
5. Right-click the image and send it to the back if needed.
6. Lock it if your Roll20 UI supports locking placed images.

The current maps have baked-in visual grids. Recommended setup:

```text
Roll20 Grid: Off
Use the baked-in visual grid only as a visual guide
Use Dynamic Lighting / Fog of War manually if desired
```

## 3. Upload portraits and tokens

The GitHub repository already has ready-to-upload images:

```text
portraits/
tokens/
```

Do **not** run this unless you are regenerating portraits from the original triptych sheets:

```text
python3 split_signal_bleed_portraits.py
```

That step was used during asset creation, not normal GM installation.

### Upload portraits

Upload all PNG files in:

```text
portraits/
```

to Roll20.

Detailed workflow:

1. Open Roll20.
2. Open the **Art Library** tab.
3. Upload or drag the portrait PNG files into the library.
4. Open the `Asset Staging - Portraits` page.
5. Drag each uploaded portrait from the Art Library onto that page.
6. Arrange them loosely so they are easy to select.
7. The placed graphic names should match the filenames without `.png`.

Examples:

```text
Dr. Sera Valez
Mara Mother Red Vey
Nox Bluewire Kade
Juno Switch Hale
Commander Ilan Rusk
```

If Roll20 gives a placed graphic a strange name, open the token/graphic settings and rename it.

### Upload tokens

Upload all PNG files in:

```text
tokens/
```

to Roll20.

Detailed workflow:

1. Open Roll20.
2. Open the **Art Library** tab.
3. Upload or drag the token PNG files into the library.
4. Open the `Asset Staging - Tokens` page.
5. Drag each uploaded token from the Art Library onto that page.
6. Arrange them loosely so they are easy to select.
7. The placed graphic names should match the filenames without `.png`.

Examples:

```text
Dr. Sera Valez
Mara Mother Red Vey
Model 1 Juvenile
Model 1 Adolescent
Model 1 Adult
Model 3 Juvenile
Model 3 Adolescent
Model 3 Adult
```

The importer is forgiving about punctuation, quotes, and a few known aliases, but exact readable names are best.

## 4. Install the importer script

Open the Roll20 game, then go to:

```text
Game Settings / Mod Scripts / API Scripts
```

Create a new script named:

```text
HopePunk Signal Bleed Importer
```

Paste the contents of:

```text
roll20/hopepunk_signal_bleed_importer.js
```

Save the script.

## 5. Import handouts and NPC character entries

In Roll20 chat, run:

```text
!hopepunk-signal-bleed --dry-run
```

If the dry run looks right, import everything:

```text
!hopepunk-signal-bleed --import
```

To update existing imported content later:

```text
!hopepunk-signal-bleed --overwrite
```

To import only NPCs:

```text
!hopepunk-signal-bleed --import --npcs
```

To import only handouts:

```text
!hopepunk-signal-bleed --import --handouts
```

Imported handouts and characters appear at the root of the Journal. Move them into folders manually after import.

## 6. Link portraits to character avatars

Go to the `Asset Staging - Portraits` page.

Select all staged portrait graphics.

Run:

```text
!hopepunk-signal-bleed --link-selected-portraits --dry-run
```

Review the output. It should show lines like:

```text
Dr. Sera Valez -> Dr. Sera Valez: would set avatar
Mara Mother Red Vey -> Mara “Mother Red” Vey: would set avatar
```

If the matches look right, run:

```text
!hopepunk-signal-bleed --link-selected-portraits
```

To replace existing avatars:

```text
!hopepunk-signal-bleed --link-selected-portraits --overwrite
```

## 7. Link tokens to default tokens

Go to the `Asset Staging - Tokens` page.

Select all staged token graphics.

Run:

```text
!hopepunk-signal-bleed --link-selected-tokens --dry-run
```

Review the output. If the matches look right, run:

```text
!hopepunk-signal-bleed --link-selected-tokens
```

To replace existing default tokens:

```text
!hopepunk-signal-bleed --link-selected-tokens --overwrite
```

## 8. Combined linking option

If you only have one staged image per character and want that image to serve as both avatar and default token, select the graphics and run:

```text
!hopepunk-signal-bleed --link-selected-assets --dry-run
!hopepunk-signal-bleed --link-selected-assets
```

For this module, the cleaner workflow is usually:

```text
portraits/ -> --link-selected-portraits
tokens/    -> --link-selected-tokens
```

## 9. Suggested Journal organization

Create folders manually after import:

```text
NPCs
  Mercy Twelve Clinic
  Redline Choir
  Corporate Recovery
  Community / Civilians

Bestiary
  Model 1 Juvenile
  Model 1 Adolescent
  Model 1 Adult
  Model 3 Juvenile
  Model 3 Adolescent
  Model 3 Adult

Handouts
  Player-facing
  GM-only
  Maps / Keys
  Installation
```

Suggested player-facing handouts to share:

```text
Signal Bleed - Player Start Here
Signal Bleed - Player Hooks
```

Keep GM-only handouts hidden unless you intentionally reveal them.

## 10. Troubleshooting

### The linker says no selected graphics

Select the staged image objects on the tabletop first, then run the command.

### The linker says no matching character

Check the staged graphic name. It should resemble the imported character name.

Good:

```text
Mara Mother Red Vey
Nox Bluewire Kade
Model 3 Adolescent
```

Bad:

```text
image.png
download 7
token
```

### The linker says ambiguous match

Rename the staged graphic more specifically, then rerun the dry run.

### The linked token does not look right

Use `--overwrite` after adjusting the staged token’s size, name, bars, aura, or settings. The default token copies the staged graphic’s current token settings.

### The map image keeps moving

Make sure you are on the Map & Background layer when placing maps. If your Roll20 UI supports locking, lock the map after placement.

### The script does not upload images

Correct. Roll20 Mod/API scripts cannot upload local PNG files into your Art Library. Upload the images manually first.
