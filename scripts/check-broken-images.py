"""Scan src for broken /gallery-images/ URLs and broken asset imports."""
from __future__ import annotations

import os
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(".")
PUBLIC = ROOT / "public"
SRC = ROOT / "src"

PAT_PUBLIC = re.compile(
    r"""['"](/gallery-images/[^'"]+\.(?:jpg|jpeg|png|webp|gif))['"]""",
    re.I,
)
PAT_IMPORT = re.compile(
    r"""from\s+['"](\./assets/img/[^'"]+)['"]""",
)

broken_public = defaultdict(list)
ok_public = 0
broken_imports = []

for p in SRC.rglob("*"):
    if p.suffix.lower() not in {".js", ".jsx", ".ts", ".tsx", ".css", ".json"}:
        continue
    if "node_modules" in p.parts:
        continue
    try:
        text = p.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        continue
    rel_file = str(p).replace("\\", "/")
    for m in PAT_PUBLIC.finditer(text):
        url = m.group(1)
        fs = PUBLIC / url.lstrip("/").replace("/", os.sep)
        if fs.exists():
            ok_public += 1
        else:
            broken_public[url].append(rel_file)
    for m in PAT_IMPORT.finditer(text):
        imp = m.group(1)
        target = (p.parent / imp).resolve()
        if not target.exists():
            broken_imports.append((rel_file, imp))

print(f"ok_public_refs={ok_public} broken_unique={len(broken_public)}")
print("=== BROKEN PUBLIC ===")
for url in sorted(broken_public):
    files = sorted(set(broken_public[url]))
    print(url)
    for f in files[:5]:
        print(f"  <- {f}")
    if len(files) > 5:
        print(f"  ... +{len(files) - 5} more")

print("=== BROKEN IMPORTS ===")
for file, imp in broken_imports:
    print(f"{file}: {imp}")
