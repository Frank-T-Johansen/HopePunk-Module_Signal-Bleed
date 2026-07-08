# Documentation Cleanup Notes

Recommended documentation state for the Signal Bleed module repo:

## Keep

```text
README.md
INSTALL.md
roll20/hopepunk_signal_bleed_importer.js
tools/convert_portraits_to_jpg.py
```

Keep any actual module content/data/map files that the repo already uses.

## Remove or archive if present

Old one-off importer variants should not remain in the active docs as separate workflows:

```text
hopepunk_signal_bleed_importer_jpg_map_support.js.txt
hopepunk_signal_bleed_importer_token_clone_fix.js.txt
hopepunk_signal_bleed_importer_name_selected_token_fix.js.txt
hopepunk_signal_bleed_importer_name_selected_dispatch_fix.js.txt
hopepunk_signal_bleed_importer_asset_order_fix.js.txt
hopepunk_signal_bleed_importer_asset_order_reverse_fix.js.txt
```

The repo should expose one canonical script:

```text
roll20/hopepunk_signal_bleed_importer.js
```

If old scripts are kept for history, move them to an archive folder and mark them as obsolete.

## Asset-format notes

Prefer:

```text
portraits/  JPG
tokens/     PNG
maps/       JPG for full-color maps, PNG only for transparent overlays
```

Avoid keeping duplicate PNG and JPG portrait sets in the public repo unless there is a specific source-art reason.
