# Roll20 Import Guide: Signal Bleed

This file covers only the first setup steps needed before the full Roll20 installation handout exists inside your game.

After you import the module, continue from the imported Roll20 handout:

```text
Signal Bleed - Roll20 Installation and Asset Linking
```

The source file for that full guide is:

```text
handouts/26_Roll20_Installation_and_Asset_Linking.md
```

## 1. Get the module files locally

Before setting up Roll20, download the repository/package and extract it into a local folder.

### Option A: Download the GitHub ZIP on Windows

1. Open the GitHub repository page.
2. Click **Code**.
3. Click **Download ZIP**.
4. In File Explorer, right-click the downloaded ZIP file.
5. Choose **Extract All...**
6. Accept the suggested output folder, or change it to a simpler location.

After extraction, open folders until you see this structure:

```text
README.md
ROLL20_IMPORT_GUIDE.md
data/
handouts/
maps/
portraits/
roll20/
tokens/
tools/
```

That folder is the module root.

Windows may create a nested folder such as:

```text
Downloads\HopePunk-Module_Signal-Bleed-main\HopePunk-Module_Signal-Bleed-main\
```

That is fine. The correct folder is the one that directly contains:

```text
maps/
portraits/
tokens/
roll20/
```

### Option B: Clone with Git

If you are comfortable using Git:

```bash
git clone https://github.com/Frank-T-Johansen/HopePunk-Module_Signal-Bleed.git
cd HopePunk-Module_Signal-Bleed
```

## 2. Create or open a Roll20 game

Create or open a Roll20 game using the public Hope//Punk character sheet.

Use the default Roll20 `Start` page as the landing/start page.

You do not need to upload maps, portraits, or tokens before installing the importer. The importer cannot upload images anyway; those steps are covered in the full installation handout after import.

## 3. Install the importer script

In your local module folder, open:

```text
roll20/hopepunk_signal_bleed_importer.js
```

In Roll20:

1. Open the game.
2. Open **Game Settings / Mod Scripts / API Scripts**.
3. Create a new script.
4. Paste the entire contents of `roll20/hopepunk_signal_bleed_importer.js`.
5. Save the script.

If you are testing an updated package, replace the entire old script with the new one and save.

## 4. Import the module handouts and NPCs

In Roll20 chat, run:

```text
!hopepunk-signal-bleed --dry-run
```

If the dry run looks reasonable, run:

```text
!hopepunk-signal-bleed --import
```

If you are refreshing an existing test game after updating the script, run:

```text
!hopepunk-signal-bleed --overwrite
```

## 5. Continue from the imported handout

After the import finishes, open this Roll20 handout:

```text
Signal Bleed - Roll20 Installation and Asset Linking
```

Continue there for:

```text
creating/configuring pages
uploading maps from maps/
uploading portraits from portraits/
uploading tokens from tokens/
creating Asset Staging pages
linking portraits and tokens
organizing Journal folders
troubleshooting
```

## Quick command reference

```text
!hopepunk-signal-bleed --help
!hopepunk-signal-bleed --dry-run
!hopepunk-signal-bleed --import
!hopepunk-signal-bleed --overwrite
!hopepunk-signal-bleed --import --handouts
!hopepunk-signal-bleed --import --npcs
```
