"""Procedural score for the SparkStack launch film.

Follows the minimalist-product-ad-generator music direction: ~100 BPM, fast tech
feel, block chords, pluck + airy noise bed, kick + sub-bass + sine sweeps,
wooden percussion, and a sudden cut-off where everything stops within 0.5 s and
only the pluck tail decays. All hits are on the same beat grid as timeline.js.

    python3 music.py out.wav
"""
import sys
import numpy as np
from scipy.signal import lfilter, butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR = 48000
BPM = 100
BEAT = 60 / BPM          # 0.6 s
BAR = 4 * BEAT           # 2.4 s
DUR = 15.0
CUT = 13.8               # sudden cut-off (matches the copy swap to the URL)
LAND = [2.1 + b * BEAT / 2 for b in range(10)]  # layer seat times (timeline.js)
N = int(SR * DUR)
rng = np.random.default_rng(18)


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def buf():
    return np.zeros((2, N))


def place(bus, sig, t, pan=0.0, gain=1.0):
    i = int(round(t * SR))
    if i >= N:
        return
    sig = sig[: N - i] * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    bus[0, i:i + len(sig)] += sig * l * np.sqrt(2)
    bus[1, i:i + len(sig)] += sig * r * np.sqrt(2)


def env_exp(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))


# ---- instruments --------------------------------------------------------------

def pluck(midi, dur=1.4, bright=0.6, damp=0.996):
    """Karplus-Strong string: crisp, forward pluck. An allpass in the loop
    supplies the fractional delay so chords stay in tune."""
    period = SR / hz(midi)
    d = int(period - 0.6)
    delta = period - 0.5 - d
    c = (1 - delta) / (1 + delta)
    n = int(dur * SR)
    burst = rng.uniform(-1, 1, d + 2)
    burst = lfilter([bright, 1 - bright], [1], burst)  # soften the excitation
    x = np.zeros(n)
    x[: len(burst)] = burst
    a = np.zeros(d + 3)
    a[0], a[1] = 1, c
    a[d] -= damp * 0.5 * c
    a[d + 1] -= damp * 0.5 * (1 + c)
    a[d + 2] -= damp * 0.5
    y = lfilter([1, c], a, x)
    y *= np.minimum(1, np.arange(n) / (0.002 * SR))
    return y / (np.max(np.abs(y)) + 1e-9)


def stab(midis, dur=0.42):
    """Block-chord stab: detuned saws through a closing low-pass."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for m in midis:
        for det in (-0.07, 0.0, 0.07):
            f = hz(m + det)
            s += 2 * ((t * f) % 1.0) - 1
    s /= len(midis) * 3
    sos = butter(2, 2400, 'low', fs=SR, output='sos')
    s = sosfilt(sos, s)
    e = env_exp(n, 0.12) * np.minimum(1, t / 0.004)
    return s * e


def kick(dur=0.45):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 45 + 95 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.16)
    click = rng.uniform(-1, 1, n) * np.exp(-t / 0.002) * 0.25
    return np.tanh(1.6 * (body + click)) * 0.9


def sub(midi, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * hz(midi) * t)
    a = np.minimum(1, t / 0.01) * np.minimum(1, (dur - t) / 0.03)
    return s * a


def wood(midi, dur=0.18, noise=0.35):
    """Wooden 'tock' — the acrylic seating onto its standoffs."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(midi)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.028)
    s += 0.45 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.012)
    nz = rng.uniform(-1, 1, n) * np.exp(-t / 0.004)
    sos = butter(2, [f * 1.5, min(f * 6, 16000)], 'band', fs=SR, output='sos')
    s += noise * sosfilt(sos, nz)
    return s * 0.8


def sweep(f0, f1, dur, curve=2.0):
    n = int(dur * SR)
    u = np.arange(n) / n
    f = f0 * (f1 / f0) ** (u ** curve if f1 > f0 else u ** (1 / curve))
    ph = 2 * np.pi * np.cumsum(f) / SR
    a = np.sin(np.pi * u) ** 1.5 if f1 < f0 else u ** 1.8 * np.minimum(1, (1 - u) / 0.03)
    return np.sin(ph) * a


def air(dur, lo=2500, hi=9000):
    n = int(dur * SR)
    w = rng.normal(0, 1, n)
    # Pink-ish tilt, then band-limit for a premium "air" bed.
    w = lfilter([0.049922035, -0.095993537, 0.050612699, -0.004408786], [1, -2.494956002, 2.017265875, -0.522189400], w)
    sos = butter(2, [lo, hi], 'band', fs=SR, output='sos')
    return sosfilt(sos, w) / 0.15


def reverb_ir(sec=1.3, seed=0):
    r = np.random.default_rng(seed)
    n = int(sec * SR)
    t = np.arange(n) / SR
    ir = r.normal(0, 1, n) * np.exp(-t / (sec / 6.9))
    sos = butter(1, 6000, 'low', fs=SR, output='sos')
    ir = sosfilt(sos, ir)
    ir[: int(0.012 * SR)] = 0  # pre-delay
    return ir / np.sqrt(np.sum(ir ** 2))


def verb(bus, sec=1.3, wet=0.25):
    out = np.zeros_like(bus)
    for ch in range(2):
        out[ch] = fftconvolve(bus[ch], reverb_ir(sec, seed=ch + 1))[: bus.shape[1]]
    return out * wet


# ---- arrangement ----------------------------------------------------------------
# Harmony: A major, add9 colour. One chord per bar.
CHORDS = [
    ('Amaj9', 45, [57, 61, 64, 68, 71]),
    ('F#m9', 42, [54, 57, 61, 64, 68]),
    ('Dmaj9', 38, [50, 54, 57, 61, 64]),
    ('E6sus', 40, [52, 57, 59, 61, 64]),
    ('F#m9', 42, [54, 57, 61, 64, 68]),
    ('Dmaj9', 38, [50, 54, 57, 61, 64]),
]
PENTA = [69, 71, 73, 76, 78, 81, 83, 85, 88, 90]  # A major pentatonic, rising per layer

plucks, chords, drums, low, fx, pads = buf(), buf(), buf(), buf(), buf(), buf()
tail = buf()  # the final pluck chord — exempt from the cut

for bar, (_, root, notes) in enumerate(CHORDS):
    t0 = bar * BAR
    # Pluck arpeggio: 8ths in the intro and the braking bar, 16ths elsewhere.
    step = BEAT / 2 if bar in (0, 3) else BEAT / 4
    order = [0, 2, 4, 1, 3, 2, 4, 1]
    k = 0
    t = t0
    while t < t0 + BAR - 1e-6:
        if t < CUT - 0.01:
            m = notes[order[k % len(order)]] + 12
            vel = 0.55 if k % 2 == 0 else 0.38
            if bar == 0:
                vel *= 0.35 + 0.65 * (t / BAR)  # swell in from the fade-up
            place(plucks, pluck(m, dur=0.9, bright=0.55), t, pan=(-0.45 if k % 2 else 0.45), gain=vel * 0.32)
        k += 1
        t += step
    # Block-chord stabs on 1 and the "and" of 2 (bar 1 stays sparse).
    if bar > 0:
        for off in (0.0, 1.5 * BEAT, 3.0 * BEAT):
            if t0 + off < CUT - 0.01 and not (bar == 3 and off > 0):
                place(chords, stab(notes), t0 + off, gain=0.3 if off == 0 else 0.2)
    # Soft pad bed under everything for glue.
    n = int(BAR * SR)
    tt = np.arange(n) / SR
    pad = sum(np.sin(2 * np.pi * hz(m) * tt + i) for i, m in enumerate(notes)) / len(notes)
    pad *= np.minimum(1, tt / 0.3) * np.minimum(1, (BAR - tt) / 0.3)
    place(pads, pad, t0, gain=0.06 if bar else 0.035)

# Kick + sub: four-on-the-floor from the assembly (bar 2), braking bar keeps only
# its downbeat, full groove returns into the hero reveal.
for b in range(int(DUR / BEAT) + 1):
    t = round(b * BEAT, 6)
    if t >= CUT - 0.01:
        break
    bar = int(t // BAR)
    on = (t >= 2.4 and t < 8.4) or (t >= 10.8)
    if 8.4 <= t < 10.8 and abs(t - 8.4) < 1e-6:
        on = True
    if on:
        place(drums, kick(), t, gain=0.34)
    root = CHORDS[min(bar, 5)][1]
    if t >= 2.4 and not (8.4 < t < 10.8):
        # 8th-note sub pulse, ducked under the kick.
        for half in (0.0, BEAT / 2):
            if t + half < CUT - 0.01:
                place(low, sub(root, BEAT / 2 - 0.02), t + half, gain=0.28 if half == 0 else 0.22)
    elif 8.4 <= t < 10.8:
        place(low, sub(root, BEAT - 0.02), t, gain=0.16)

# Layer landings: a rising wooden tock for each of the ten layers.
for b, t in enumerate(LAND):
    place(drums, wood(PENTA[b] - 12, noise=0.4), t, pan=-0.3 + 0.06 * b, gain=0.42)
# Caps ripple: a quick run of tiny high ticks right after the last layer seats.
for j in range(7):
    place(drums, wood(96 + (j % 3) * 2, dur=0.06, noise=0.6), 4.88 + j * 0.065, pan=(-0.5 + j / 6), gain=0.16)
# Light wooden off-beat ticks keep the groove tactile in the later bars.
for b in range(int(DUR / BEAT)):
    t = round(b * BEAT + BEAT / 2, 6)
    if (6.0 <= t < 8.4 or 10.8 <= t < CUT - 0.05):
        place(drums, wood(84, dur=0.08, noise=0.5), t, pan=0.35, gain=0.12)

# Sine sweeps: risers into the assembly and the hero; soft down-sweeps on the cuts.
place(fx, sweep(180, 2200, 1.2), 1.2, gain=0.1)
place(fx, sweep(160, 2600, 1.2), 10.8, gain=0.12)
for tc in (6.0, 8.4):
    place(fx, sweep(1800, 220, 0.45), tc - 0.05, gain=0.06)
# Airy noise bed, with bursts on the two peaks.
bed = air(DUR)
shape = np.interp(np.arange(N) / SR, [0, 0.4, 2.4, 4.8, 8.4, 10.8, 12.0, CUT, DUR], [0, 0.35, 0.5, 0.55, 0.4, 0.5, 0.6, 0.6, 0.0])
fx += np.vstack([bed * shape, np.roll(bed, 997) * shape]) * 0.05
for tp, g in ((4.8, 0.2), (12.0, 0.22)):
    b2 = air(1.4, 1500, 12000) * env_exp(int(1.4 * SR), 0.35)
    place(fx, b2, tp, gain=g)
# Peak hits: extra low boom under the two downbeats.
for tp in (4.8, 12.0):
    place(drums, kick(0.8) * 0.9, tp, gain=0.24)

# Final chord at the cut: pluck voicing that rings out alone.
for i, m in enumerate([57, 64, 69, 71, 73, 76]):
    place(tail, pluck(m + 12, dur=2.0, bright=0.5, damp=0.998), CUT + i * 0.012, pan=(-0.4 + 0.16 * i), gain=0.26)

# ---- mix ------------------------------------------------------------------------
# Sidechain: duck the sub and pads under each kick.
duck = np.ones(N)
for b in range(int(DUR / BEAT) + 1):
    t = round(b * BEAT, 6)
    if (2.4 <= t < 8.4) or (t >= 10.8 and t < CUT):
        i = int(t * SR)
        n = min(int(0.25 * SR), N - i)
        duck[i:i + n] *= 1 - 0.6 * np.exp(-np.arange(n) / (0.07 * SR))
low *= duck
pads *= duck

# Bus balance (measured over the groove): kick/wood ≈ -19, sub ≈ -21,
# plucks ≈ -21, chords ≈ -25, air/fx and pads ≈ -30 dB RMS.
plucks *= 2.5
chords *= 4.0
low *= 0.6
fx *= 2.0
pads *= 2.0
tail *= 2.5

def _rms(b, t0=2.4, t1=8.4):
    seg = b[:, int(t0 * SR):int(t1 * SR)]
    return 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-12)


if '--stems' in sys.argv:
    for name, b in (('plucks', plucks), ('chords', chords), ('drums', drums), ('low', low), ('fx', fx), ('pads', pads)):
        print(f'{name:7s} groove {_rms(b):6.1f} dB   intro {_rms(b, 0, 2.4):6.1f} dB')

dry = plucks + chords + drums + low + fx + pads
send = plucks * 0.9 + chords * 0.6 + pads * 0.8 + drums * 0.15
mix = dry + verb(send, 1.4, 0.3)

# Sudden cut-off: everything but the final pluck stops within ~30 ms of CUT.
g = np.ones(N)
ic = int(CUT * SR)
fade = int(0.03 * SR)
g[ic:ic + fade] = np.linspace(1, 0, fade)
g[ic + fade:] = 0
mix *= g
mix += tail + verb(tail, 1.8, 0.35)

# Tiny tail fade on the last 0.15 s only (skill: no long fade-outs).
tf = int(0.15 * SR)
mix[:, -tf:] *= np.linspace(1, 0, tf)

# Restrained loudness: gentle soft-clip, peak at -1 dBFS.
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix *= 10 ** (-1 / 20) / np.max(np.abs(mix))
cur = np.sqrt(np.mean(mix[:, int(2.4 * SR):int(CUT * SR)] ** 2))
mix *= min(1.0, 10 ** (-16 / 20) / cur)  # never push louder than -1 dBFS peak
rms = 20 * np.log10(np.sqrt(np.mean(mix[:, : ic] ** 2)))
print(f'RMS before cut: {rms:.1f} dBFS, duration {N / SR:.2f}s')
out = next((a for a in sys.argv[1:] if not a.startswith('--')), 'score.wav')
wavfile.write(out, SR, (mix.T * 32767).astype(np.int16))
