#!/usr/bin/env python3
"""
Rebuild the embedded HANDOUTS block in roll20/hopepunk_signal_bleed_importer.js
from Markdown files in handouts/.

By default this preserves the existing HANDOUTS list. Use --include-new to append
new handout Markdown files that exist in handouts/ but are not yet embedded in
the importer.
"""

from __future__ import annotations

import argparse
import base64
import html
import json
import re
import subprocess
from pathlib import Path
from typing import Iterable, Any


IMPORTER = Path("roll20/hopepunk_signal_bleed_importer.js")
HANDOUTS_DIR = Path("handouts")


def esc(s: str) -> str:
    return html.escape(s, quote=False)


def inline_md(s: str) -> str:
    s = esc(s)
    code_chunks: list[str] = []

    def save_code(m: re.Match[str]) -> str:
        code_chunks.append(f"<code>{m.group(1)}</code>")
        return f"\u0000CODE{len(code_chunks)-1}\u0000"

    s = re.sub(r"`([^`]+)`", save_code, s)

    # Always use callbacks so no backreference syntax can leak as literal "\\1".
    s = re.sub(r"\*\*(.+?)\*\*", lambda m: f"<strong>{m.group(1)}</strong>", s)
    s = re.sub(r"(?<!\*)\*([^*\n]+?)\*(?!\*)", lambda m: f"<em>{m.group(1)}</em>", s)

    s = re.sub(
        r"\[([^\]]+)\]\(([^)]+)\)",
        lambda m: f'<a href="{html.escape(m.group(2), quote=True)}">{m.group(1)}</a>',
        s,
    )

    for i, chunk in enumerate(code_chunks):
        s = s.replace(f"\u0000CODE{i}\u0000", chunk)

    return s


def flush_paragraph(out: list[str], paragraph: list[str]) -> None:
    if paragraph:
        out.append(f"<p>{inline_md(' '.join(paragraph).strip())}</p>")
        paragraph.clear()


def flush_list(out: list[str], items: list[str], ordered: bool) -> None:
    if items:
        tag = "ol" if ordered else "ul"
        out.append(f"<{tag}>")
        out.extend(f"<li>{inline_md(item)}</li>" for item in items)
        out.append(f"</{tag}>")
        items.clear()


def render_markdown(md: str) -> str:
    out: list[str] = []
    paragraph: list[str] = []
    list_items: list[str] = []
    list_ordered = False
    in_fence = False
    fence_lines: list[str] = []

    for raw in md.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        line = raw.rstrip()

        if line.strip().startswith("```"):
            if not in_fence:
                flush_paragraph(out, paragraph)
                flush_list(out, list_items, list_ordered)
                in_fence = True
                fence_lines = []
            else:
                out.append(f"<pre>{esc(chr(10).join(fence_lines))}</pre>")
                in_fence = False
            continue

        if in_fence:
            fence_lines.append(line)
            continue

        stripped = line.strip()

        if not stripped:
            flush_paragraph(out, paragraph)
            flush_list(out, list_items, list_ordered)
            continue

        if stripped in ("---", "***", "___"):
            flush_paragraph(out, paragraph)
            flush_list(out, list_items, list_ordered)
            out.append("<hr>")
            continue

        if stripped.startswith("> "):
            flush_paragraph(out, paragraph)
            flush_list(out, list_items, list_ordered)
            out.append(f"<blockquote>{inline_md(stripped[2:].strip())}</blockquote>")
            continue

        m = re.match(r"^(#{1,6})\s+(.+)$", stripped)
        if m:
            flush_paragraph(out, paragraph)
            flush_list(out, list_items, list_ordered)
            level = len(m.group(1))
            out.append(f"<h{level}>{inline_md(m.group(2).strip())}</h{level}>")
            continue

        m = re.match(r"^[-*]\s+(.+)$", stripped)
        if m:
            flush_paragraph(out, paragraph)
            if list_items and list_ordered:
                flush_list(out, list_items, list_ordered)
            list_ordered = False
            list_items.append(m.group(1).strip())
            continue

        m = re.match(r"^\d+[.)]\s+(.+)$", stripped)
        if m:
            flush_paragraph(out, paragraph)
            if list_items and not list_ordered:
                flush_list(out, list_items, list_ordered)
            list_ordered = True
            list_items.append(m.group(1).strip())
            continue

        if raw.startswith("    "):
            flush_paragraph(out, paragraph)
            flush_list(out, list_items, list_ordered)
            out.append(f"<pre>{esc(raw[4:])}</pre>")
            continue

        flush_list(out, list_items, list_ordered)
        paragraph.append(stripped)

    if in_fence:
        out.append(f"<pre>{esc(chr(10).join(fence_lines))}</pre>")

    flush_paragraph(out, paragraph)
    flush_list(out, list_items, list_ordered)

    return "\n".join(out)


def find_handouts_block(src: str) -> tuple[int, int, str]:
    marker = "var HANDOUTS = ["
    start = src.find(marker)
    if start < 0:
        raise SystemExit("Could not find 'var HANDOUTS = [' in importer")

    m = re.search(r"\n\];", src[start:])
    if not m:
        raise SystemExit("Could not find end of HANDOUTS block")
    end = start + m.end()
    block = src[start + len("var HANDOUTS = "): end - 1]
    return start, end, block


def load_existing_handouts(src: str) -> list[dict[str, Any]]:
    _start, _end, block = find_handouts_block(src)
    try:
        return json.loads(block)
    except json.JSONDecodeError as e:
        raise SystemExit(f"Could not parse existing HANDOUTS block as JSON: {e}") from e


def source_to_name(source_file: str) -> str:
    stem = Path(source_file).stem
    stem = re.sub(r"^\d+[_ -]*", "", stem)
    title = stem.replace("_", " ").replace("-", " ").strip()
    title = re.sub(r"\s+", " ", title)
    return "Signal Bleed - " + title


def with_new_handouts(existing: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[str]]:
    by_source = {str(h["source_file"]) for h in existing}
    new_sources: list[str] = []

    for md in sorted(HANDOUTS_DIR.glob("*.md")):
        source = md.as_posix()
        if source not in by_source:
            new_sources.append(source)

    combined = list(existing)
    for source in new_sources:
        combined.append({
            "name": source_to_name(source),
            "source_file": source,
            "notes_b64": "",
        })

    return combined, new_sources


def rebuild_handouts(entries: list[dict[str, Any]]) -> list[dict[str, str]]:
    rebuilt: list[dict[str, str]] = []
    missing: list[str] = []

    for old in entries:
        name = old["name"]
        source_file = old["source_file"]
        path = Path(source_file)

        if not path.exists():
            missing.append(source_file)
            continue

        md = path.read_text(encoding="utf-8")
        notes_html = render_markdown(md)
        notes_b64 = base64.b64encode(notes_html.encode("utf-8")).decode("ascii")

        rebuilt.append({
            "name": name,
            "source_file": source_file,
            "notes_b64": notes_b64,
        })

    if missing:
        raise SystemExit("Missing source handout files:\n" + "\n".join(f"  {x}" for x in missing))

    return rebuilt


def decoded_bad_counts(handouts: Iterable[dict[str, str]]) -> list[tuple[str, int]]:
    bad = []
    for h in handouts:
        html_text = base64.b64decode(h["notes_b64"]).decode("utf-8", errors="replace")
        n = html_text.count("\\1") + html_text.count("\x01")
        if n:
            bad.append((h["name"], n))
    return bad


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--include-new", action="store_true",
                    help="append handouts/*.md files that are not already embedded")
    ap.add_argument("--importer", default=str(IMPORTER))
    args = ap.parse_args()

    importer = Path(args.importer)
    src = importer.read_text(encoding="utf-8")

    original_entries = load_existing_handouts(src)
    entries = original_entries
    new_sources: list[str] = []

    if args.include_new:
        entries, new_sources = with_new_handouts(original_entries)

    rebuilt = rebuild_handouts(entries)
    bad = decoded_bad_counts(rebuilt)

    print(f"Existing embedded handouts before rebuild: {len(original_entries)}")
    print(f"Handouts after rebuild:                  {len(rebuilt)}")
    if args.include_new:
        print(f"New handouts discovered:                 {len(new_sources)}")
        for source in new_sources:
            print(f"  + {source} -> {source_to_name(source)}")
    print(f"Bad decoded \\1/control-A occurrences after rebuild: {sum(n for _, n in bad)}")

    if bad:
        for name, n in bad:
            print(f"  {n:3} {name}")
        raise SystemExit("Rebuilt handouts still contain \\1/control-A; aborting.")

    handouts_json = json.dumps(rebuilt, ensure_ascii=False, indent=2)
    start, end, _block = find_handouts_block(src)
    new_src = src[:start] + "var HANDOUTS = " + handouts_json + ";\n" + src[end:]

    if args.dry_run:
        print("Dry run only. Re-run without --dry-run to write changes.")
        return

    backup = importer.with_suffix(importer.suffix + ".bak")
    backup.write_text(src, encoding="utf-8")
    importer.write_text(new_src, encoding="utf-8")

    print(f"Wrote:   {importer}")
    print(f"Backup:  {backup}")

    try:
        res = subprocess.run(["node", "--check", str(importer)], text=True, capture_output=True)
        if res.returncode == 0:
            print("node --check: ok")
        else:
            print("node --check failed:")
            print(res.stderr)
            raise SystemExit(1)
    except FileNotFoundError:
        print("node not found; skipped JS syntax check.")


if __name__ == "__main__":
    main()
