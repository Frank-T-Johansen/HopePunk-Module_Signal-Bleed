#!/usr/bin/env python3
"""
Scale Signal Bleed map images for Roll20.

Normal GM use:
    python3 tools/scale_signal_bleed_maps.py --scale 3 --format jpg --quality 88

This reads PNGs from maps/ and writes scaled maps to maps_scaled/.

Useful options:
    --scale 3
    --width 3258
    --height 4344
    --format jpg
    --quality 88
    --optimize
    --grid-overlay
    --grid-size 70
    --grid-color 255,0,0,180
    --combined-grid
    --dry-run

Recommended usage:
    # Smaller Roll20-friendly map files
    python3 tools/scale_signal_bleed_maps.py --scale 3 --format jpg --quality 88

    # Same, but also generate transparent grid overlays
    python3 tools/scale_signal_bleed_maps.py --scale 3 --format jpg --quality 88 --grid-overlay

Notes:
    * Use JPG/JPEG for large full-color map images.
    * Use PNG for transparent grid overlays.
    * Use PNG for tokens and portraits.

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
    'Start.png',
    '10_Map_Floor_A_Clinic_and_Indoor_Street.png',
    '11_Map_Floor_B_Community_Support.png',
    '12_Map_Floor_C_Service_Utility.png',
    '13_Map_Floor_D_Quarantine_Incident.png',
]

FORMAT_ALIASES = {
    'jpg': 'JPEG',
    'jpeg': 'JPEG',
    'png': 'PNG',
    'webp': 'WEBP',
}

EXT_ALIASES = {
    'jpg': '.jpg',
    'jpeg': '.jpg',
    'png': '.png',
    'webp': '.webp',
}


def parse_rgba(value: str) -> Tuple[int, int, int, int]:
    parts = [int(p.strip()) for p in value.split(',')]
    if len(parts) == 3:
        parts.append(180)
    if len(parts) != 4 or any(p < 0 or p > 255 for p in parts):
        raise argparse.ArgumentTypeError('Expected R,G,B or R,G,B,A values in the range 0-255')
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
    overlay = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for x in range(0, width + 1, grid_size):
        draw.line([(x, 0), (x, height)], fill=color, width=1)
    for y in range(0, height + 1, grid_size):
        draw.line([(0, y), (width, y)], fill=color, width=1)
    border = (color[0], color[1], color[2], min(255, color[3] + 40))
    draw.rectangle([(0, 0), (width - 1, height - 1)], outline=border, width=2)
    return overlay


def save_image(img: Image.Image, path: Path, fmt: str, quality: int, optimize: bool) -> None:
    fmt_norm = FORMAT_ALIASES[fmt]
    save_kwargs = {}
    if fmt_norm == 'JPEG':
        if img.mode != 'RGB':
            img = img.convert('RGB')
        save_kwargs.update({'quality': quality, 'optimize': optimize, 'progressive': True})
    elif fmt_norm == 'WEBP':
        save_kwargs.update({'quality': quality, 'method': 6})
    elif fmt_norm == 'PNG':
        save_kwargs.update({'optimize': optimize})
    img.save(path, format=fmt_norm, **save_kwargs)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--input-dir', default='maps')
    parser.add_argument('--output-dir', default='maps_scaled')
    parser.add_argument('--scale', type=float, default=3.0)
    parser.add_argument('--width', type=int)
    parser.add_argument('--height', type=int)
    parser.add_argument('--format', default='jpg', choices=['png', 'jpg', 'jpeg', 'webp'], help='Output format for scaled maps and combined-grid maps. Default: jpg')
    parser.add_argument('--quality', type=int, default=88, help='Lossy quality for jpg/webp. Default: 88')
    parser.add_argument('--optimize', action='store_true', help='Enable optimizer when supported')
    parser.add_argument('--grid-overlay', action='store_true')
    parser.add_argument('--grid-size', type=int, default=70)
    parser.add_argument('--grid-color', type=parse_rgba, default=(255, 0, 0, 180))
    parser.add_argument('--combined-grid', action='store_true')
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('files', nargs='*')
    args = parser.parse_args()

    root = Path.cwd()
    input_dir = root / args.input_dir
    output_dir = root / args.output_dir
    if not input_dir.exists():
        raise SystemExit(f'Input folder not found: {input_dir}')

    names = args.files or DEFAULT_MAPS
    found_any = False
    out_ext = EXT_ALIASES[args.format]
    if not args.dry_run:
        output_dir.mkdir(parents=True, exist_ok=True)

    for name in names:
        src = input_dir / name
        if not src.exists():
            print(f'skip missing: {src}')
            continue
        found_any = True
        with Image.open(src) as img:
            img = img.convert('RGBA')
            new_size = scaled_size(img.width, img.height, args)
            scaled_path = output_dir / f"{src.stem}_scaled_{new_size[0]}x{new_size[1]}{out_ext}"
            print(f'{src} -> {scaled_path} ({img.width}x{img.height} -> {new_size[0]}x{new_size[1]})')
            if args.dry_run:
                continue
            scaled = img.resize(new_size, Image.Resampling.LANCZOS)
            save_image(scaled, scaled_path, args.format, args.quality, args.optimize)
            if args.grid_overlay or args.combined_grid:
                overlay = make_grid_overlay(new_size, args.grid_size, args.grid_color)
                if args.grid_overlay:
                    overlay_path = output_dir / f"{src.stem}_grid_overlay_{new_size[0]}x{new_size[1]}_{args.grid_size}px.png"
                    overlay.save(overlay_path, format='PNG', optimize=args.optimize)
                    print(f'  overlay -> {overlay_path}')
                if args.combined_grid:
                    combined = Image.alpha_composite(scaled, overlay)
                    combined_path = output_dir / f"{src.stem}_scaled_grid_{new_size[0]}x{new_size[1]}_{args.grid_size}px{out_ext}"
                    save_image(combined, combined_path, args.format, args.quality, args.optimize)
                    print(f'  combined -> {combined_path}')

    if not found_any:
        raise SystemExit('No map files found. Check --input-dir or filenames.')

    print('\nRoll20 starting point:')
    print('  Page size: 50 x 65 cells')
    print('  For 1086x1448 maps at --scale 3: image size is 3258 x 4344 px, about 46.5 x 62 cells.')
    print('  Recommended scaled map format: JPG quality 88.')
    print('  Keep overlays as PNG if you want a visible grid.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
