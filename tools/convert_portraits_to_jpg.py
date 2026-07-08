#!/usr/bin/env python3
"""
Convert portrait PNG/WebP/JPEG files to JPG for Roll20 upload.

Examples:
  python3 tools/convert_portraits_to_jpg.py --input portraits_png --output portraits --quality 88 --max-width 1024
  python3 tools/convert_portraits_to_jpg.py --input portraits --output portraits_jpg --quality 88 --max-width 1024

This is intended for character portraits. Keep tokens as PNG if they use transparency.
"""
from __future__ import annotations

import argparse
from pathlib import Path
from PIL import Image, ImageOps


def convert_one(src: Path, dst: Path, quality: int, max_width: int | None) -> None:
    im = Image.open(src)
    im = ImageOps.exif_transpose(im)

    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        bg = Image.new("RGB", im.size, (255, 255, 255))
        rgba = im.convert("RGBA")
        bg.paste(rgba, mask=rgba.getchannel("A"))
        im = bg
    else:
        im = im.convert("RGB")

    if max_width and im.width > max_width:
        new_height = round(im.height * (max_width / im.width))
        im = im.resize((max_width, new_height), Image.Resampling.LANCZOS)

    dst.parent.mkdir(parents=True, exist_ok=True)
    im.save(dst, "JPEG", quality=quality, optimize=True, progressive=True)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", default="portraits", help="Input directory")
    ap.add_argument("--output", default="portraits_jpg", help="Output directory")
    ap.add_argument("--quality", type=int, default=88, help="JPEG quality, usually 85-90")
    ap.add_argument("--max-width", type=int, default=1024, help="Resize wider images to this width; use 0 to disable")
    ap.add_argument("--delete-originals", action="store_true", help="Delete source files after successful conversion")
    args = ap.parse_args()

    src_dir = Path(args.input)
    out_dir = Path(args.output)
    max_width = args.max_width or None

    exts = {".png", ".webp", ".jpg", ".jpeg"}
    files = [p for p in sorted(src_dir.iterdir()) if p.is_file() and p.suffix.lower() in exts]

    if not files:
        print(f"No image files found in {src_dir}")
        return 1

    for src in files:
        dst = out_dir / (src.stem + ".jpg")
        convert_one(src, dst, args.quality, max_width)
        print(f"{src} -> {dst}")
        if args.delete_originals and src.resolve() != dst.resolve():
            src.unlink()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
