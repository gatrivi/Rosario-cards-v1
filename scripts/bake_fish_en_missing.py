#!/usr/bin/env python3
# Voice / language (binding)
#   lang: EN only — texts from enLiberFishTexts / enGuideText (never Spanish Liber body)
#   lock: catts/data/voices/fish_default_lock/lock.wav  (EN Fish rosary lock)
#   seed: 42
#   NOT fish_es_lock / Voz 4 (that is ES only)

from __future__ import annotations

import argparse
import asyncio
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATTS = Path(r"E:\zengatrivi-drive-e\catts")
OUT = ROOT / "public" / "voice" / "en"
CATTS_MIRROR = CATTS / "static" / "fish" / "devotions" / "en"
FISH_ROSARY_EN = CATTS / "static" / "fish" / "rosary" / "en"
MANIFEST = ROOT / "scripts" / "fish-en-missing.json"
LOG = ROOT / "scripts" / "fish-en-bake.log"
LOCK = CATTS / "data" / "voices" / "fish_default_lock" / "lock.wav"
LOCK_TEXT = "In the desert of Scete, the abbot Moses spoke of the end of the monk."
SEED = 42
MIN_BYTES = 4000
CHUNK = 280
CHUNK_WALL = 400

# CatTS fish/rosary/en short names → Liber public/voice/en basenames
ROSARY_COPY = {
    "am": ["A"],
    "of": ["P"],
    "gb": ["G"],
    "f": ["F"],
    "sc": ["SC"],
    "c": ["C"],
    "ac": ["AC"],
    "s": ["S"],
    "m1": ["MG1"],
    "m2": ["MG2"],
    "m3": ["MG3"],
    "m4": ["MG4"],
    "m5": ["MG5"],
    "m6": ["MD1"],
    "m7": ["MD2"],
    "m8": ["MD3"],
    "m9": ["MD4"],
    "m10": ["MD5"],
    "m11": ["MGl1"],
    "m12": ["MGl2"],
    "m13": ["MGl3"],
    "m14": ["MGl4"],
    "m15": ["MGl5"],
    "m16": ["ML1"],
    "m17": ["ML2"],
    "m18": ["ML3"],
    "m19": ["ML4"],
    "m20": ["ML5"],
}

sys.path.insert(0, str(CATTS))
os.environ.setdefault("CATTS_TTS_SPEED", "1.0")
os.environ.setdefault("CATTS_FISH_URL", "http://127.0.0.1:8080")


def log(msg: str) -> None:
    line = f"{time.strftime('%H:%M:%S')} {msg}"
    print(line, flush=True)
    LOG.parent.mkdir(parents=True, exist_ok=True)
    with LOG.open("a", encoding="utf-8") as f:
        f.write(line + "\n")


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
                while len(sent) > CHUNK:
                    parts.append(sent[:CHUNK])
                    sent = sent[CHUNK:].lstrip()
                buf = sent
    if buf:
        parts.append(buf)
    return parts or [text[:CHUNK]]


def copy_rosary() -> int:
    """Seed Liber EN from existing CatTS Fish rosary pack. Returns files written."""
    if not FISH_ROSARY_EN.is_dir():
        log(f"WARN no fish rosary en at {FISH_ROSARY_EN}")
        return 0
    OUT.mkdir(parents=True, exist_ok=True)
    CATTS_MIRROR.mkdir(parents=True, exist_ok=True)
    n = 0
    for src_key, dests in ROSARY_COPY.items():
        src = FISH_ROSARY_EN / f"{src_key}.wav"
        if not src.is_file() or src.stat().st_size < MIN_BYTES:
            log(f"  miss rosary {src_key}")
            continue
        for dest in dests:
            for folder in (OUT, CATTS_MIRROR):
                dst = folder / f"{dest}.wav"
                shutil.copyfile(src, dst)
            n += 1
            log(f"  copy {src_key} -> {dest}.wav ({src.stat().st_size}B)")
    return n


async def synth_one(text: str, wav: Path, lock: Path) -> None:
    from services import fish_tts
    from services.ffmpeg_util import ffmpeg_path

    parts = chunk_text(text)
    with tempfile.TemporaryDirectory(prefix="fenmiss_") as td:
        td_p = Path(td)
        pieces: list[Path] = []
        for i, part in enumerate(parts):
            piece = td_p / f"p{i:03d}.wav"
            await asyncio.wait_for(
                fish_tts.synthesize(
                    part,
                    piece,
                    ref_audio=lock,
                    ref_text=LOCK_TEXT,
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
        # mirror into catts archive
        CATTS_MIRROR.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(wav, CATTS_MIRROR / wav.name)


async def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--copy-only", action="store_true", help="only seed rosary copies")
    args = ap.parse_args()

    log("=== copy Fish rosary EN → Liber ids ===")
    copied = copy_rosary()
    log(f"copied_slots={copied}")
    if args.copy_only:
        return 0

    if not MANIFEST.is_file():
        raise SystemExit(f"missing {MANIFEST} — run dumpFishEnMissing test first")
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    clips = data.get("clips") or []
    if args.limit:
        clips = clips[: args.limit]

    from services import fish_tts

    if not await fish_tts.ready():
        raise SystemExit("Fish not ready on :8080")
    if not LOCK.is_file():
        raise SystemExit(f"missing EN lock {LOCK}")

    log(f"START clips={len(clips)} lock={LOCK} seed={SEED} lang=en voice=fish_default_lock")
    # refuse Spanish body if dump regresses
    for row in clips[:5]:
        t = (row.get("text") or "").lower()
        if "dios te salve" in t or "proclama mi alma" in t:
            raise SystemExit("REFUSING Spanish texts in EN dump — re-run dumpFishEnMissing")

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
                await synth_one(text, out, LOCK)
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
