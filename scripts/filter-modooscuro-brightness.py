"""Batch luminance gate for modooscuro backgrounds.

Keep mean Rec.601 luma < threshold. Flag latin manuscript / prayer-text
photos by filename (dual-text risk under golden overlays).

Usage:
  python scripts/filter-modooscuro-brightness.py [dirs...]
  python scripts/filter-modooscuro-brightness.py datos/assets/img --apply
"""
from __future__ import annotations

import argparse
import statistics
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("need Pillow: pip install pillow")

DEFAULT_THRESHOLD = 110
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
LATIN_HINTS = (
    "latin",
    "credo",
    "pater",
    "ave-maria",
    "ave_maria",
    "avemaria",
    "gloria",
    "angelus",
    "salve",
    "sanctus",
    "regina caeli",
    "regina-caeli",
    "avemarialat",
)


def mean_luma(path: Path, max_side: int = 256) -> tuple[float, float]:
    im = Image.open(path).convert("RGB")
    w, h = im.size
    scale = max_side / max(w, h)
    if scale < 1:
        im = im.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.BILINEAR)
    # ponytail: downsample + mean luma; ceiling = no OCR / no center-weighted ROI
    vals = [0.299 * r + 0.587 * g + 0.114 * b for r, g, b in im.getdata()]
    return sum(vals) / len(vals), statistics.median(vals)


def is_latin(name: str) -> bool:
    n = name.lower()
    return any(h in n for h in LATIN_HINTS)


def scan(dirs: list[Path], threshold: float):
    rows = []
    for folder in dirs:
        if not folder.is_dir():
            print(f"skip missing: {folder}", file=sys.stderr)
            continue
        for p in sorted(folder.iterdir()):
            if not p.is_file() or p.suffix.lower() not in EXTS:
                continue
            if "_reject" in p.parts:
                continue
            m, med = mean_luma(p)
            lat = is_latin(p.name)
            keep = (m < threshold) and not lat
            reason = "keep" if keep else ("latin-text" if lat else "bright")
            rows.append((keep, reason, m, med, p))
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dirs", nargs="*", default=["datos/assets/img"])
    ap.add_argument("--apply", action="store_true", help="move rejects into _reject/")
    ap.add_argument("--threshold", type=float, default=DEFAULT_THRESHOLD)
    args = ap.parse_args()
    dirs = [Path(d) for d in args.dirs]
    rows = scan(dirs, args.threshold)
    print(f"threshold mean_luma < {args.threshold}")
    print()
    for keep, reason, m, med, p in sorted(rows, key=lambda r: (r[0], -r[2])):
        print(f"{reason:11} luma={m:6.1f} med={med:5.1f}  {p}")
    keeps = sum(1 for r in rows if r[0])
    print(f"\ntotal={len(rows)} keep={keeps} reject={len(rows) - keeps}")
    if not args.apply:
        return
    for keep, reason, m, med, p in rows:
        if keep:
            continue
        dest_dir = p.parent / "_reject" / reason
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest = dest_dir / p.name
        if dest.exists():
            print(f"exists, skip move: {dest}")
            continue
        p.rename(dest)
        print(f"moved -> {dest}")


if __name__ == "__main__":
    main()
