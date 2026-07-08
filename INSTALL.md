# Hope//Punk Signal Bleed — Roll20 Installation and Asset Linking

This guide imports the Signal Bleed module into Roll20 and links NPC portraits and default tokens.

## Current canonical script

Use one Signal Bleed script in Roll20:

```text
roll20/hopepunk_signal_bleed_importer.js
```

Do not keep older Signal Bleed importer variants loaded at the same time. Multiple loaded variants can make command behavior confusing.

The command namespace is:

```text
!hopepunk-signal-bleed
```

This is separate from the pregen pack command:

```text
!hopepunk-pregens
```

## Recommended staging pages

Create these temporary Roll20 pages:

```text
Asset Staging - Portraits
Asset Staging - Tokens
```

Use these only for Signal Bleed module/NPC assets.

For pregens, use separate pages:

```text
Asset Staging - Pregen Portraits
Asset Staging - Pregen Tokens
```

Do not mix module NPC assets and pregen assets in the same selection.

## Import NPCs and handouts

After installing the script, restart the API sandbox and test:

```text
!hopepunk-signal-bleed --help
```

Preview embedded content:

```text
!hopepunk-signal-bleed --dry-run
```

Import everything:

```text
!hopepunk-signal-bleed --import
```

Update existing NPCs/handouts after script changes:

```text
!hopepunk-signal-bleed --overwrite
```

Import/update only NPCs:

```text
!hopepunk-signal-bleed --import --npcs
!hopepunk-signal-bleed --overwrite --npcs
```

Import/update only handouts:

```text
!hopepunk-signal-bleed --import --handouts
!hopepunk-signal-bleed --overwrite --handouts
```

## Journal folder placement

Roll20 API-created characters and handouts are placed at the Journal root. The importer does not reliably move entries into Roll20 Journal folders.

After import, organize the Journal manually if desired.

Recommended manual folders:

```text
Signal Bleed
Signal Bleed / NPCs
Signal Bleed / Handouts
Signal Bleed / Maps
Pregens
```

Folder placement is only organization. It does not affect linked portraits, default tokens, sheet data, or handout content.

## Player-visible handouts

Recommended visible at campaign start:

```text
Signal Bleed - Player Start Here
Signal Bleed - Player Hooks
```

Keep GM-only at start:

```text
Signal Bleed - GM Overview
Signal Bleed - Scene Outline
Signal Bleed - NPCs GM
Signal Bleed - Maps GM Overview
Signal Bleed - Map keys
Signal Bleed - Missing Person Reports GM
Signal Bleed - Antithesis Hidden Nest GM
Signal Bleed - Roll20 Installation and Asset Linking
```

Reveal other handouts only when they become relevant in play.

## Upload and stage portraits

Roll20 may not preserve original filenames on placed graphics. It may also show uploads in an order that differs from your local file browser.

Recommended process:

1. Open `Asset Staging - Portraits`.
2. Select the **TOKENS** layer.
3. Drag module portrait images onto the tabletop/canvas.
4. Arrange them in a simple grid.
5. Select only the module portrait graphics.
6. Run a dry-run naming command.
7. Compare the proposed names against the visible images before committing.

### Safer naming modes

If the staged images are arranged in the same order as the module asset folder / normal filename order:

```text
!hopepunk-signal-bleed --name-selected --asset-order --dry-run
```

If the staged images are arranged in the reverse order shown by Roll20 Uploaded Assets:

```text
!hopepunk-signal-bleed --name-selected --asset-order --reverse --dry-run
```

If the staged images are arranged in the internal NPC/story roster order:

```text
!hopepunk-signal-bleed --name-selected --dry-run
```

Only run the real naming command after the dry-run matches the visible images:

```text
!hopepunk-signal-bleed --name-selected --asset-order
```

or:

```text
!hopepunk-signal-bleed --name-selected --asset-order --reverse
```

or:

```text
!hopepunk-signal-bleed --name-selected
```

### Important warning about Roll20 ordering

The naming helpers are convenience tools, not proof that Roll20 kept the images in the expected order.

Double-check the dry-run output against the actual visible images. This is especially important if you uploaded or dragged images in multiple batches, manually dragged a few images first, or re-ordered assets in the Roll20 UI.

If you drag two images first and then drag the remaining images later, Roll20 may not preserve the order assumed by the batch naming command. In that case, batch naming can silently assign the wrong names to staged graphics.

If the dry-run does not visibly match, stop and either:

```text
rearrange the staged images into the expected order
name only a small verified batch
name individual graphics manually in Roll20
```

## Link portraits

After staged portrait graphics are correctly named:

```text
!hopepunk-signal-bleed --link-selected-portraits --dry-run
```

If the output matches the NPCs you intend to update:

```text
!hopepunk-signal-bleed --link-selected-portraits
```

To replace existing avatars:

```text
!hopepunk-signal-bleed --link-selected-portraits --overwrite
```

## Upload and stage tokens

Open:

```text
Asset Staging - Tokens
```

Select the **TOKENS** layer, place the module token images, arrange them in a simple grid, and select only the module token graphics.

Use the same naming approach as portraits.

Normal asset-folder order:

```text
!hopepunk-signal-bleed --name-selected --asset-order --dry-run
!hopepunk-signal-bleed --name-selected --asset-order
```

Reverse Uploaded Assets order:

```text
!hopepunk-signal-bleed --name-selected --asset-order --reverse --dry-run
!hopepunk-signal-bleed --name-selected --asset-order --reverse
```

Internal NPC/story roster order:

```text
!hopepunk-signal-bleed --name-selected --dry-run
!hopepunk-signal-bleed --name-selected
```

## Link tokens

After staged token graphics are correctly named:

```text
!hopepunk-signal-bleed --link-selected-tokens --dry-run --overwrite
```

If the output matches the NPCs you intend to update:

```text
!hopepunk-signal-bleed --link-selected-tokens --overwrite
```

Default token size is normalized to one Roll20 grid cell:

```text
70 × 70 px
```

Explicit one-cell tokens:

```text
!hopepunk-signal-bleed --link-selected-tokens --overwrite --token-size 70
```

Two-cell tokens:

```text
!hopepunk-signal-bleed --link-selected-tokens --overwrite --token-size 140
```

Preserve staged token dimensions:

```text
!hopepunk-signal-bleed --link-selected-tokens --overwrite --keep-token-size
```

After relinking default tokens, delete any old test tokens already placed on maps and drag fresh tokens from the Journal. Existing placed tokens do not automatically update.

## Verify after linking

After portraits and tokens are linked, spot-check several NPCs:

```text
Bex Aranda
Florence “NightCrash” Vale
Juno “Switch” Hale
Mara “Mother Red” Vey
Model 1 Juvenile
Model 3 Adult
Vex Tan
```

For each checked NPC:

1. Open the Journal character.
2. Confirm the avatar is correct.
3. Confirm the default token image is correct.
4. Drag the NPC to a normal page and confirm token size/art.
5. Delete the test token.

If any NPC has the wrong image, fix only that NPC:

1. Find the correct staged portrait/token graphic.
2. Rename that staged graphic to the exact NPC name.
3. Select only that corrected graphic.
4. Relink with `--overwrite`.

Portrait:

```text
!hopepunk-signal-bleed --link-selected-portraits --dry-run --overwrite
!hopepunk-signal-bleed --link-selected-portraits --overwrite
```

Token:

```text
!hopepunk-signal-bleed --link-selected-tokens --dry-run --overwrite
!hopepunk-signal-bleed --link-selected-tokens --overwrite
```

## Showing NPC portraits to players

Use the NPC character entry in the Journal, not the staging page.

Open the NPC character and use Roll20's **Show to Players** option. Staging pages are import workbenches and may contain unrevealed NPCs or monsters.

## Keep or delete staging pages?

Keep staging pages until all portraits and tokens have been tested.

After that:

- For your working GM game, it is useful to keep staging pages at the far end of the page list.
- For a clean public/demo game, you may delete staging pages after confirming all links work.

Deleting staging pages should not remove already-linked character avatars/default tokens, but if you need to relink later you will need to recreate the staging setup.

## Portrait file format

Portraits should be Roll20-ready JPG files unless transparency is needed.

Recommended:

```text
portraits/
  Bex Aranda.jpg
  Florence NightCrash Vale.jpg
  ...

tokens/
  Bex Aranda.png
  Florence NightCrash Vale.png
  ...
```

Keep tokens as PNG if they use transparency.
