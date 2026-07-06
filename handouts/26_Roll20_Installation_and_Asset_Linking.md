# Roll20 Module Installation and Asset Linking Guide

This guide describes the practical installation workflow for Signal Bleed in Roll20.

The importer can create handouts and GM-only NPC character entries. Roll20 does not allow Mod/API scripts to upload local image files into your Art Library, so maps, portraits, and token images must still be uploaded through the Roll20 UI.

The importer includes an asset-linking helper that can connect already-uploaded Roll20 images to matching character sheets.

## 1. Create or copy a Roll20 game

Create a Roll20 game using the public Hope//Punk character sheet.

Recommended Journal folders:

```text
Characters
Pregens
NPCs
Bestiary
Handouts
Maps / GM Notes
```

Recommended pages:

```text
Landing / Start Page
Floor A - Clinic and Indoor Street
Floor B - Community Support
Floor C - Service Utility
Floor D - Quarantine Incident
Asset Staging
```

## 2. Install the Roll20 importer

Open the game, then go to the Mod/API Scripts page, create a new script, and paste:

```text
roll20/hopepunk_signal_bleed_importer.js
```

## 3. Import handouts and NPC character entries

Run these in Roll20 chat as GM:

```text
!hopepunk-signal-bleed --dry-run
!hopepunk-signal-bleed --import
```

Import only handouts:

```text
!hopepunk-signal-bleed --import --handouts
```

Import only NPCs:

```text
!hopepunk-signal-bleed --import --npcs
```

Update existing imported content after a package update:

```text
!hopepunk-signal-bleed --overwrite
```

NPCs and handouts are created GM-only by default.

## 4. Upload maps manually

Roll20 Mod/API scripts cannot upload files from your computer into the Art Library.

Upload each map image through Roll20, then place it on the relevant page's Map layer.

Current AI playtest maps have a baked-in visual grid, but are not mathematically aligned to Roll20's 70-pixel grid standard. For now:

```text
Disable visible Roll20 grid.
Use the baked-in grid visually.
Use Dynamic Lighting / Fog of War for reveal.
```

## 5. Upload portraits and tokens manually

Split the portrait sheets locally first:

```text
python3 split_signal_bleed_portraits.py --dry-run
python3 split_signal_bleed_portraits.py
```

Upload the resulting portraits and canonical Antithesis tokens into Roll20 through the Art Library UI.

## 6. Create an Asset Staging page

Create a Roll20 page named:

```text
Asset Staging
```

Drag each uploaded portrait/token image onto that page.

Set each placed graphic's name to the matching character name. Examples:

```text
Dr. Sera Valez
Mara Mother Red Vey
Nox Bluewire Kade
Juno Switch Hale
Model 1 Juvenile
Model 3 Juvenile
```

## 7. Link selected assets to character sheets

On the Asset Staging page:

1. Select one or more staged portrait/token graphics.
2. Run:

```text
!hopepunk-signal-bleed --link-selected-tokens --dry-run
```

Then run:

```text
!hopepunk-signal-bleed --link-selected-tokens
```

The script will:

```text
read each selected graphic name
find the matching character
set that character's avatar image
set that graphic as the character's default token
```

To replace existing avatars/default tokens:

```text
!hopepunk-signal-bleed --link-selected-tokens --overwrite
```

## 8. Token naming advice

Visible names help social play:

```text
Dr. Valez
Mara “Mother Red”
Bluewire
Nurse Cho
Switch
Corp Recovery #1
Corp Recovery #2
Bloke #3
```

For hidden identities, start vague and rename later:

```text
Bloke #3 -> Orlan Pike
Redline Sitter -> Switch
Corp Medic -> Mara Silex
Dying Courier -> Tamsin Quill
```

## 9. Bestiary notes

Use canonical-looking Antithesis tokens for Model 1 and Model 3, not the AI-generated portrait panels.

Suggested Bestiary folder entries:

```text
Model 1 Juvenile
Model 3 Juvenile
```

For now, create their mechanical sheets manually if you know the exact Hope//Punk sheet fields. The importer can create GM-only character entries and notes, but full mechanical sheet automation requires the exact Roll20 attribute names for NPC override, HP, movement, attacks, and special abilities.

## 10. Common issues

### The linker says no selected graphics

Select the staged image objects on the tabletop first, then run the command.

### The linker says no matching character

Check the graphic name. It should resemble the imported character name.

### The linker says ambiguous match

Rename the staged graphic more specifically, then rerun.

### Avatar/default token does not visually update

Open the character sheet and check whether the avatar/default token changed. Sometimes Roll20 UI needs a refresh.

### The image does not link

The selected object must be a Roll20 `graphic` object with an Art Library image source. The API cannot use arbitrary web URLs or local file paths.
