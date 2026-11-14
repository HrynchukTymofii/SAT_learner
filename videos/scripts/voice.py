"""Voiceover for the videos: one audio file per script line.

  python scripts/voice.py <video>          # e.g. problem-tickets, lesson-scatterplots
  python scripts/voice.py <video> --redo   # voice every line again

Reads src/videos/<video>/script.json ({voice, rate, lines: [{id, text, gap?} | {id, silence}]}), writes
public/voice/<video>/<id>.mp3 with Edge TTS and public/voice/<video>/timing.json with each line's length,
word timings and loudness per frame (the mascot's mouth). The video takes its whole timeline from timing.json (src/timeline.ts), so run this after
changing any line. A line is voiced again only when its text changed.

To use a real voice (ElevenLabs, a recording), put <id>.mp3|wav|m4a|flac in public/voice/<video>/rec/ and run
this script: those files win over TTS, and Whisper (medium, on the GPU) finds their word timings so every
highlight still lands on its word. Lines with no recording keep the TTS voice.
"""

import argparse
import asyncio
import hashlib
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
EXTS = (".wav", ".mp3", ".m4a", ".flac")
_whisper = None


def duration(path: Path) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                         capture_output=True, text=True, check=True).stdout
    return round(float(out.strip()), 3)


def text_hash(script: dict, line: dict) -> str:
    return hashlib.sha1(f"{script['voice']}|{script.get('rate', '+0%')}|{line['text']}".encode()).hexdigest()[:12]


def envelope(path: Path, fps: int = 30) -> list:
    """Loudness per video frame, 0..1 (peak of the line = 1): drives a mascot's mouth."""
    import numpy as np

    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(path), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    pcm = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    hop = 16000 // fps
    rms = np.array([np.sqrt(np.mean(pcm[i:i + hop] ** 2)) for i in range(0, len(pcm) - hop + 1, hop)])
    rms = rms / (np.percentile(rms, 98) + 1e-6)
    return [round(float(min(1.0, v)), 2) for v in rms]


def file_hash(path: Path) -> str:
    return hashlib.sha1(path.read_bytes()).hexdigest()[:12]


def transcribe(path: Path) -> list:
    global _whisper
    import whisper

    if _whisper is None:
        _whisper = whisper.load_model("medium")
    res = _whisper.transcribe(str(path), language="en", word_timestamps=True)
    return [{"w": w["word"].strip(), "t": round(w["start"], 3), "d": round(w["end"] - w["start"], 3)} for seg in res["segments"] for w in seg["words"]]


async def tts(script: dict, line: dict, out: Path) -> list:
    import edge_tts
    import truststore

    truststore.inject_into_ssl()  # this Python has no CA bundle; use the Windows store
    for attempt in range(4):  # the Edge service now and then answers with no audio
        try:
            com = edge_tts.Communicate(line["text"], script["voice"], rate=script.get("rate", "+0%"), boundary="WordBoundary")
            words, audio = [], bytearray()
            async for chunk in com.stream():
                if chunk["type"] == "audio":
                    audio.extend(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    # offsets come in 100 ns ticks
                    words.append({"w": chunk["text"], "t": round(chunk["offset"] / 1e7, 3), "d": round(chunk["duration"] / 1e7, 3)})
            out.write_bytes(audio)
            return words
        except edge_tts.exceptions.NoAudioReceived:
            if attempt == 3:
                raise
            await asyncio.sleep(2 * (attempt + 1))


async def run(video: str, redo: bool):
    script = json.loads((HERE / "src/videos" / video / "script.json").read_text(encoding="utf-8"))
    folder = HERE / "public/voice" / video
    folder.mkdir(parents=True, exist_ok=True)
    timing_path = folder / "timing.json"
    old = json.loads(timing_path.read_text(encoding="utf-8")) if timing_path.exists() else {}
    timing = {}
    for line in script["lines"]:
        if "text" not in line:
            continue
        lid, h = line["id"], text_hash(script, line)
        own = next((folder / "rec" / f"{lid}{e}" for e in EXTS if (folder / "rec" / f"{lid}{e}").exists()), None)
        if own:  # a recorded voice wins over TTS
            fh, prev = file_hash(own), old.get(lid, {})
            words = prev["words"] if prev.get("hash") == fh else transcribe(own)
            if prev.get("hash") != fh:
                print("transcribed", own.name, " ".join(w["w"] for w in words))
            timing[lid] = {"src": own.relative_to(HERE / "public").as_posix(), "duration": duration(own), "words": words, "env": envelope(own), "hash": fh}
            continue
        mp3 = folder / f"{lid}.mp3"
        prev = old.get(lid)
        if redo or not mp3.exists() or not prev or prev.get("hash") != h:
            words = await tts(script, line, mp3)
            print("voiced", lid)
        else:
            words = prev["words"]
        timing[lid] = {"src": mp3.relative_to(HERE / "public").as_posix(), "duration": duration(mp3), "words": words, "env": envelope(mp3), "hash": h}
    timing_path.write_text(json.dumps(timing, ensure_ascii=False, indent=1), encoding="utf-8")
    total = sum(t["duration"] for t in timing.values())
    print(f"{video}: {len(timing)} lines, {total:.1f} s of voice")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--redo", action="store_true")
    args = ap.parse_args()
    # aiodns (used by edge-tts) needs the selector loop on Windows
    asyncio.run(run(args.video, args.redo), loop_factory=asyncio.SelectorEventLoop)


if __name__ == "__main__":
    main()
