"""Synthesised UI sounds and a light background beat for the promo shorts (no licensed audio).

  python scripts/sfx.py      → public/sfx/*.wav, public/music/beat.wav

To use a real track instead, drop it at public/music/beat.wav (same name).
"""

from pathlib import Path

import numpy as np
import wave

SR = 44100
HERE = Path(__file__).resolve().parent.parent
rng = np.random.default_rng(7)


def save(path: Path, x: np.ndarray, peak=0.9):
    path.parent.mkdir(parents=True, exist_ok=True)
    x = x / (np.abs(x).max() + 1e-9) * peak
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    if pcm.ndim == 1:
        pcm = np.stack([pcm, pcm], 1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def t_(dur):
    return np.arange(int(SR * dur)) / SR


def env(t, a=0.003, d=0.1):
    return np.minimum(1, t / a) * np.exp(-t / d)


def sweep(f0, f1, dur, shape=2.0):
    t = t_(dur)
    f = f0 + (f1 - f0) * (t / dur) ** (1 / shape)
    return t, np.sin(2 * np.pi * np.cumsum(f) / SR)


def lowpass(x, cut):
    a = np.exp(-2 * np.pi * cut / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def bandnoise(dur, lo, hi):
    n = rng.standard_normal(int(SR * dur))
    return lowpass(n, hi) - lowpass(n, lo)


sfx = HERE / "public" / "sfx"

# pop: bubbly upward blip for cards appearing
t, s = sweep(380, 900, 0.12)
save(sfx / "pop.wav", s * env(t, 0.002, 0.04))

# tap: short woody click for a finger tap
t = t_(0.06)
save(sfx / "tap.wav", (np.sin(2 * np.pi * 1700 * t) * 0.6 + rng.standard_normal(len(t)) * 0.4) * env(t, 0.0005, 0.008))

# key: tiny typing tick
t = t_(0.04)
save(sfx / "key.wav", rng.standard_normal(len(t)) * env(t, 0.0003, 0.004), 0.5)

# whoosh: filtered noise swelling and fading, for scene changes and swipes
t = t_(0.42)
n = bandnoise(0.42, 600, 4000)
shape = np.sin(np.pi * np.clip(t / 0.42, 0, 1)) ** 2
save(sfx / "whoosh.wav", n * shape, 0.7)

# ding: correct answer (two bright partials)
t = t_(0.7)
d = sum(np.sin(2 * np.pi * f * t) * g for f, g in [(1318.5, 1), (1975.5, 0.5), (2637, 0.25)])
t2 = t_(0.7)
d2 = sum(np.sin(2 * np.pi * f * t2) * g for f, g in [(1760, 1), (2637, 0.4)])
x = np.zeros(int(SR * 0.85))
x[: len(d)] += d * env(t, 0.002, 0.18)
x[int(SR * 0.09): int(SR * 0.09) + len(d2)] += d2 * env(t2, 0.002, 0.25)
save(sfx / "ding.wav", x, 0.6)

# buzz: wrong answer (low, soft square-ish)
t = t_(0.35)
b = np.sign(np.sin(2 * np.pi * 150 * t)) * 0.5 + np.sin(2 * np.pi * 150 * t)
save(sfx / "buzz.wav", lowpass(b, 900) * env(t, 0.004, 0.12), 0.5)

# stamp: low thud for big slams
t, s = sweep(140, 45, 0.35, 0.5)
save(sfx / "stamp.wav", s * env(t, 0.001, 0.12) + bandnoise(0.35, 200, 2500) * env(t, 0.0005, 0.02) * 0.6)

# tick: counter roll
t = t_(0.03)
save(sfx / "tick.wav", np.sin(2 * np.pi * 2600 * t) * env(t, 0.0003, 0.006), 0.35)

# notif: two-note phone notification
x = np.zeros(int(SR * 0.6))
for i, f in enumerate([987.8, 1318.5]):
    t = t_(0.4)
    tone = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * env(t, 0.002, 0.12)
    o = int(SR * 0.12 * i)
    x[o: o + len(t)] += tone
save(sfx / "notif.wav", x, 0.6)

# ---- beat: 112 BPM, chill pop, four chords, 40 s ----
BPM = 112
beat = 60 / BPM
dur = 40.0
N = int(SR * dur)
mix = np.zeros(N)


def add(x, at, gain=1.0):
    o = int(at * SR)
    if o >= N:
        return
    x = x[: N - o]
    mix[o: o + len(x)] += x * gain


tk, kick = sweep(150, 42, 0.32, 0.4)
kick *= env(tk, 0.001, 0.11)
clap = bandnoise(0.2, 900, 5000) * env(t_(0.2), 0.001, 0.05)
hat = bandnoise(0.05, 7000, 16000) * env(t_(0.05), 0.0005, 0.012)

# A minor-ish loop: Am  F  C  G, one bar each
chords = [[220.0, 261.6, 329.6], [174.6, 220.0, 261.6], [196.0, 261.6, 329.6], [196.0, 246.9, 293.7]]
bass = [110.0, 87.3, 130.8, 98.0]
bar = beat * 4
nbars = int(dur / bar) + 1
for b in range(nbars):
    t0 = b * bar
    ch = chords[b % 4]
    tb = t_(bar)
    pad = sum(np.sin(2 * np.pi * f * tb) + 0.4 * np.sin(2 * np.pi * f * 2.003 * tb) for f in ch)
    pad *= np.minimum(1, tb / 0.08) * np.exp(-tb / 2.5)
    add(lowpass(pad, 1800), t0, 0.16)
    for q in range(4):
        tq = t0 + q * beat
        if q in (0, 2):
            add(kick, tq, 0.9)
        if q in (1, 3):
            add(clap, tq, 0.35)
        add(hat, tq + beat / 2, 0.25)
        add(hat, tq, 0.12)
        # plucked bass on each beat
        tp = t_(beat * 0.9)
        f = bass[b % 4]
        pl = (np.sin(2 * np.pi * f * tp) + 0.25 * np.sin(4 * np.pi * f * tp)) * env(tp, 0.004, 0.18)
        add(pl, tq, 0.35)

fade = np.minimum(1, np.minimum(np.arange(N) / (SR * 0.3), (N - np.arange(N)) / (SR * 2.0)))
save(HERE / "public" / "music" / "beat.wav", mix * fade, 0.8)
print("sfx + beat written")
