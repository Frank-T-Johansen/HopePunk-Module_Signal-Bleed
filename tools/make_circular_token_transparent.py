#!/usr/bin/env python3
"""
Make the outside of a circular Roll20 token transparent.

Usage:
  python3 tools/make_circular_token_transparent.py generic_tokens/*.png

This keeps the circular token art and ring, and makes only the square outside
the circle transparent. It is useful when an exported/generated circular token
has a black or white square background.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import argparse

def fix_file(path: Path, suffix: str = "_transparent", inset: int = 2) -> Path:
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    size = min(w, h)

    cx, cy = w / 2, h / 2
    r = (size / 2) - inset

    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)

    result = img.copy()
    result.putalpha(mask)

    out = path.with_name(path.stem + suffix + path.suffix)
    result.save(out)
    return out

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("files", nargs="+", help="PNG/WebP/JPG token files to fix")
    parser.add_argument("--suffix", default="_transparent")
    parser.add_argument("--inset", type=int, default=2, help="Pixels to inset the circular mask")
    args = parser.parse_args()

    for f in args.files:
        path = Path(f)
        if not path.exists():
            print(f"missing: {path}")
            continue
        out = fix_file(path, args.suffix, args.inset)
        print(f"{path} -> {out}")

if __name__ == "__main__":
    main()
