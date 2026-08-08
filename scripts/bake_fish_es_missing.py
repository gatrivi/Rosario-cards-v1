#!/usr/bin/env python3
"""Bake missing Rosario ES devotion WAVs with Fish Voz 4 lock.

  Requires Fish on :8080 and catts checkout.
  Manifest: scripts/fish-es-missing.json (from dumpFishEsMissing.test.js)

  python scripts/bake_fish_es_missing.py
  python scripts/bake_fish_es_missing.py --force
"""
from __future__ import annotations

import argparse
import asyncio
import json
import os
import re
import shutil
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATTS = Path(r"E:\zengatrivi-drive-e\catts")
OUT = ROOT / "public" / "voice" / "es"
MANIFEST = ROOT / "scripts" / "fish-es-missing.json"
LOG = ROOT / "scripts" / "fish-es-bake.log"
LOCK = CATTS / "data" / "voices" / "fish_es_lock" / "lock.wav"
LOCK_FALLBACK = CATTS / "static" / "fish" / "es" / "v4.wav"
LOCK_META = CATTS / "data" / "voices" / "fish_es_lock" / "lock.json"
SEED = 77
MIN_BYTES = 4000
CHUNK = 280
CHUNK_WALL = 400

sys.path.insert(0, str(CATTS))
os.environ.setdefault("CATTS_TTS_SPEED", "1.0")
os.environ.setdefault("CATTS_FISH_URL", "http://127.0.0.1:8080")


def log(msg: str) -> None:
    line = f"{time.strftime('%H:%M:%S')} {msg}"
    print(line, flush=True)
    LOG.parent.mkdir(parents=True, exist_ok=True)
    with LOG.open("a", encoding="utf-8") as f:
        f.write(line + "\n")


def lock_path() -> Path:
    if LOCK.is_file() and LOCK.stat().st_size > 4000:
        return LOCK
    if LOCK_FALLBACK.is_file():
        return LOCK_FALLBACK
    raise SystemExit("missing Fish ES Voz 4 lock")


def lock_text() -> str:
    if LOCK_META.is_file():
        meta = json.loads(LOCK_META.read_text(encoding="utf-8"))
        t = (meta.get("lock_text") or "").strip()
        if t:
            return t
    return (
        "Padre nuestro que estás en el cielo, santificado sea tu Nombre; "
        "venga a nosotros tu reino; hágase tu voluntad en la tierra como en el cielo."
    )


def chunk_text(text: str) -> list[str]:
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= CHUNK:
        return [text]
    parts: list[str] = []
    buf = ""
    bits = re.split(r"(?<=[.|;!?])\s+", text)
    for sent in bits:
        sent = sent.strip()
        if not sent:
            continue
        trial = f"{buf} {sent}".strip() if buf else sent
        if len(trial) <= CHUNK:
            buf = trial
        else:
            if buf:
                parts.append(buf)
            if len(sent) <= CHUNK:
                buf = sent
            else:
                # hard split long sentence
                while len(sent) > CHUNK:
                    parts.append(sent[:CHUNK])
                    sent = sent[CHUNK:].lstrip()
                buf = sent
    if buf:
        parts.append(buf)
    return parts or [text[:CHUNK]]


async def synth_one(text: str, wav: Path, lock: Path, ref_text: str) -> None:
    from services import fish_tts
    from services.ffmpeg_util import ffmpeg_path
    import subprocess
    import tempfile

    parts = chunk_text(text)
    with tempfile.TemporaryDirectory(prefix="fesmiss_") as td:
        td_p = Path(td)
        pieces: list[Path] = []
        for i, part in enumerate(parts):
            piece = td_p / f"p{i:03d}.wav"
            await asyncio.wait_for(
                fish_tts.synthesize(
                    part,
                    piece,
                    ref_audio=lock,
                    ref_text=ref_text,
                    seed=SEED,
                    temperature=0.5,
                ),
                timeout=CHUNK_WALL,
            )
            if piece.stat().st_size < MIN_BYTES:
                raise RuntimeError(f"tiny part {i} bytes={piece.stat().st_size}")
            pieces.append(piece)
        wav.parent.mkdir(parents=True, exist_ok=True)
        if len(pieces) == 1:
            shutil.copyfile(pieces[0], wav)
        else:
            ff = ffmpeg_path() or "ffmpeg"
            lst = td_p / "list.txt"
            lst.write_text("".join(f"file '{p.as_posix()}'\n" for p in pieces), encoding="utf-8")
            subprocess.run(
                [ff, "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(wav)],
                check=True,
                capture_output=True,
            )


async def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()

    if not MANIFEST.is_file():
        raise SystemExit(f"missing {MANIFEST} — run dumpFishEsMissing test first")
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    clips = data.get("clips") or []
    if args.limit:
        clips = clips[: args.limit]

    from services import fish_tts

    if not await fish_tts.ready():
        raise SystemExit("Fish not ready on :8080")

    lock = lock_path()
    ref = lock_text()
    log(f"START clips={len(clips)} lock={lock} seed={SEED}")
    ok = fail = skip = 0
    t0 = time.perf_counter()

    for i, row in enumerate(clips, 1):
        cid = row["id"]
        text = row["text"]
        out = OUT / f"{cid}.wav"
        if not args.force and out.is_file() and out.stat().st_size > MIN_BYTES:
            skip += 1
            log(f"[{i}/{len(clips)}] skip {cid}")
            continue
        log(f"[{i}/{len(clips)}] fish {cid} chars={len(text)}")
        err = None
        for attempt in range(1, 4):
            try:
                await synth_one(text, out, lock, ref)
                err = None
                break
            except Exception as e:
                err = str(e)
                log(f"  retry {attempt}: {e}")
                await asyncio.sleep(2 * attempt)
        if err:
            fail += 1
            log(f"  FAIL {cid}")
            continue
        ok += 1
        log(f"  OK {cid} bytes={out.stat().st_size}")

    elapsed = time.perf_counter() - t0
    log(f"DONE ok={ok} skip={skip} fail={fail} sec={elapsed:.0f}")

    # regen pack map
    import subprocess

    r = subprocess.run(
        ["node", str(ROOT / "scripts" / "genBundledVoiceMap.js")],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
    )
    log(r.stdout.strip() or r.stderr.strip())
    return 0 if fail == 0 else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
