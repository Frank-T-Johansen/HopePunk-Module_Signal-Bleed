#!/usr/bin/env python3
"""
Scale Signal Bleed map images for Roll20.

Normal GM use:
    python3 tools/scale_signal_bleed_maps.py --scale 3

This reads PNGs from maps/ and writes scaled PNGs to maps_scaled/.

Useful options:
    --scale 3
    --width 3258
    --height 4344
    --grid-overlay
    --grid-size 70
    --grid-color 255,0,0,180
    --combined-grid
    --dry-run

Requires Pillow:
    python3 -m pip install pillow
"""
from __future__ import annotations
import argparse
from pathlib import Path
from typing import Tuple

try:
    from PIL import Image, ImageDraw
except ImportError as exc:
    raise SystemExit("Missing dependency: Pillow\nInstall it with:\n  python3 -m pip install pillow\n") from exc

DEFAULT_MAPS = [
    "Start.png",
    "10_Map_Floor_A_Clinic_and_Indoor_Street.png",
    "11_Map_Floor_B_Community_Support.png",
    "12_Map_Floor_C_Service_Utility.png",
    "13_Map_Floor_D_Quarantine_Incident.png",
]

def parse_rgba(value: str) -> Tuple[int, int, int, int]:
    parts = [int(p.strip()) for p in value.split(",")]
    if len(parts) == 3:
        parts.append(180)
    if len(parts) != 4 or any(p < 0 or p > 255 for p in parts):
        raise argparse.ArgumentTypeError("Expected R,G,B or R,G,B,A values in the range 0-255")
    return tuple(parts)  # type: ignore[return-value]

def scaled_size(width: int, height: int, args: argparse.Namespace) -> tuple[int, int]:
    if args.width and args.height:
        return args.width, args.height
    if args.width:
        factor = args.width / width
        return args.width, round(height * factor)
    if args.height:
        factor = args.height / height
        return round(width * factor), args.height
    return round(width * args.scale), round(height * args.scale)

def make_grid_overlay(size: tuple[int, int], grid_size: int, color: tuple[int, int, int, int]) -> Image.Image:
    width, height = size
    overlay = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for x in range(0, width + 1, grid_size):
        draw.line([(x, 0), (x, height)], fill=color, width=1)
    for y in range(0, height + 1, grid_size):
        draw.line([(0, y), (width, y)], fill=color, width=1)
    border = (color[0], color[1], color[2], min(255, color[3] + 40))
    draw.rectangle([(0, 0), (width - 1, height - 1)], outline=border, width=2)
    return overlay

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", default="maps")
    parser.add_argument("--output-dir", default="maps_scaled")
    parser.add_argument("--scale", type=float, default=3.0)
    parser.add_argument("--width", type=int)
    parser.add_argument("--height", type=int)
    parser.add_argument("--grid-overlay", action="store_true")
    parser.add_argument("--grid-size", type=int, default=70)
    parser.add_argument("--grid-color", type=parse_rgba, default=(255, 0, 0, 180))
    parser.add_argument("--combined-grid", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("files", nargs="*")
    args = parser.parse_args()

    root = Path.cwd()
    input_dir = root / args.input_dir
    output_dir = root / args.output_dir
    if not input_dir.exists():
        raise SystemExit(f"Input folder not found: {input_dir}")

    names = args.files or DEFAULT_MAPS
    found_any = False
    if not args.dry_run:
        output_dir.mkdir(parents=True, exist_ok=True)

    for name in names:
        src = input_dir / name
        if not src.exists():
            print(f"skip missing: {src}")
            continue
        found_any = True
        with Image.open(src) as img:
            img = img.convert("RGBA")
            new_size = scaled_size(img.width, img.height, args)
            scaled_path = output_dir / f"{src.stem}_scaled_{new_size[0]}x{new_size[1]}{src.suffix}"
            print(f"{src} -> {scaled_path} ({img.width}x{img.height} -> {new_size[0]}x{new_size[1]})")
            if args.dry_run:
                continue
            scaled = img.resize(new_size, Image.Resampling.LANCZOS)
            scaled.save(scaled_path)
            if args.grid_overlay or args.combined_grid:
                overlay = make_grid_overlay(new_size, args.grid_size, args.grid_color)
                if args.grid_overlay:
                    overlay_path = output_dir / f"{src.stem}_grid_overlay_{new_size[0]}x{new_size[1]}_{args.grid_size}px.png"
                    overlay.save(overlay_path)
                    print(f"  overlay -> {overlay_path}")
                if args.combined_grid:
                    combined = Image.alpha_composite(scaled, overlay)
                    combined_path = output_dir / f"{src.stem}_scaled_grid_{new_size[0]}x{new_size[1]}_{args.grid_size}px.png"
                    combined.save(combined_path)
                    print(f"  combined -> {combined_path}")
    if not found_any:
        raise SystemExit("No map files found. Check --input-dir or filenames.")
    print("\nRoll20 starting point:")
    print("  Page size: 50 x 65 cells")
    print("  For 1086x1448 maps at --scale 3: image size is 3258 x 4344 px, about 46.5 x 62 cells.")
    print("  Place map at 100% opacity. Use overlay PNG above it if you want a visible grid.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
