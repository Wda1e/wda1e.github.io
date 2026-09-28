"""Procedural sound-design library + music bed (48 kHz stereo float32).

Everything here is synthesised from scratch — no samples, no licensing questions.
"""
import numpy as np
from scipy import signal

SR = 48000
rng = np.random.default_rng(7)


def t_(dur):
    return np.arange(int(dur * SR)) / SR


def env_adsr(n, a, d, s, r, sustain_len=None):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    sl = max(0, n - a - d - r) if sustain_len is None else int(sustain_len * SR)
    e = np.concatenate([np.linspace(0, 1, a, endpoint=False), np.linspace(1, s, d, endpoint=False),
                        np.full(sl, s), np.linspace(s, 0, r)])
    return np.pad(e, (0, max(0, n - len(e))))[:n]


def exp_env(n, tau):
    return np.exp(-np.arange(n) / SR / tau)


def stereo(x, pan=0.0):
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    return np.stack([x * l * 1.414, x * r * 1.414], 1)


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype="high", fs=SR, output="sos"), x)


def sweep_filter(x, f0, f1, q=2.0, kind="bp", curve=1.0, block=256):
    """Time-varying biquad (block-wise coefficient update), f0->f1 with shape `curve`."""
    y = np.zeros_like(x); zi = np.zeros(2); n = len(x)
    for s in range(0, n, block):
        p = (s / n) ** curve
        f = f0 * (f1 / f0) ** p
        w0 = 2 * np.pi * min(f, SR * 0.45) / SR; al = np.sin(w0) / (2 * q); c = np.cos(w0)
        if kind == "bp":
            b = np.array([al, 0, -al]); a = np.array([1 + al, -2 * c, 1 - al])
        elif kind == "lp":
            b = np.array([(1 - c) / 2, 1 - c, (1 - c) / 2]); a = np.array([1 + al, -2 * c, 1 - al])
        else:
            b = np.array([(1 + c) / 2, -(1 + c), (1 + c) / 2]); a = np.array([1 + al, -2 * c, 1 - al])
        y[s:s + block], zi = signal.lfilter(b / a[0], a / a[0], x[s:s + block], zi=zi)
    return y


def reverb(x, decay=1.2, mix=0.25, pre=0.012, bright=6000):
    """Cheap stereo convolution reverb from a shaped noise IR."""
    n = int(decay * SR)
    ir = rng.standard_normal((n, 2)) * np.exp(-np.arange(n) / SR / (decay / 6.9))[:, None]
    ir = np.stack([lp(ir[:, 0], bright), lp(ir[:, 1], bright)], 1)
    ir[: int(pre * SR)] = 0; ir /= np.sqrt((ir ** 2).sum(0)).max() + 1e-9
    if x.ndim == 1: x = stereo(x)
    wet = np.stack([signal.fftconvolve(x[:, c], ir[:, c]) for c in range(2)], 1)
    out = np.zeros_like(wet); out[: len(x)] += x * (1 - mix)
    return out + wet * mix


def norm(x, peak=0.9):
    return x / (np.abs(x).max() + 1e-9) * peak


# ------------------------------------------------------------------ SFX ---

def whoosh(dur=0.45, f0=300, f1=4500, pan0=-0.7, pan1=0.7, peak_at=0.6):
    n = int(dur * SR); x = rng.standard_normal(n)
    y = sweep_filter(x, f0, f1, q=1.4, curve=0.8) + 0.5 * sweep_filter(x, f0 * 2, f1 * 1.5, q=3, curve=0.8)
    k = np.arange(n) / n
    e = np.where(k < peak_at, (k / peak_at) ** 2.2, ((1 - k) / (1 - peak_at)) ** 1.6)
    y *= e
    pans = np.linspace(pan0, pan1, n)
    l = np.cos((pans + 1) * np.pi / 4); r = np.sin((pans + 1) * np.pi / 4)
    return norm(reverb(np.stack([y * l, y * r], 1), 0.6, 0.18), 0.8)


def pop(f0=1100, f1=260, dur=0.13):
    t = t_(dur); f = f1 + (f0 - f1) * np.exp(-t / 0.018)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * exp_env(len(t), 0.035)
    y += 0.25 * hp(rng.standard_normal(len(t)), 3000) * exp_env(len(t), 0.004)
    return norm(reverb(y, 0.35, 0.12), 0.7)


def click():
    n = int(0.05 * SR)
    y = bp(rng.standard_normal(n), 1800, 7000) * exp_env(n, 0.0025)
    y += 0.6 * np.sin(2 * np.pi * 2400 * t_(0.05)) * exp_env(n, 0.003)
    y2 = np.zeros(int(0.12 * SR)); y2[:n] += y
    up = bp(rng.standard_normal(n), 2500, 9000) * exp_env(n, 0.002) * 0.5
    y2[int(0.055 * SR):int(0.055 * SR) + n] += up
    return norm(stereo(y2, 0.1), 0.6)


def key_tick(seed):
    r = np.random.default_rng(seed); n = int(0.045 * SR)
    y = bp(r.standard_normal(n), 1500 + r.random() * 1500, 6000 + r.random() * 3000) * exp_env(n, 0.004 + r.random() * 0.003)
    y += 0.3 * np.sin(2 * np.pi * (180 + r.random() * 80) * t_(0.045)) * exp_env(n, 0.008)
    return norm(stereo(y, r.uniform(-0.3, 0.3)), 0.35 + r.random() * 0.15)


def riser(dur=1.5):
    n = int(dur * SR); t = t_(dur); k = t / dur
    noise = sweep_filter(rng.standard_normal(n), 400, 9000, q=1.2, curve=1.6)
    f = 180 * (8 ** (k ** 1.5))
    tone = sum(signal.sawtooth(2 * np.pi * np.cumsum(f * d) / SR) for d in (1.0, 1.007, 0.993)) / 3
    tone = sweep_filter(tone, 500, 8000, q=0.9, kind="lp", curve=1.4)
    y = (0.7 * noise + 0.35 * tone) * (k ** 2.4)
    y[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))
    return norm(reverb(y, 1.0, 0.25), 0.75)


def impact(dur=2.2):
    t = t_(dur); n = len(t)
    f = 32 + 90 * np.exp(-t / 0.06)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * exp_env(n, 0.45)
    sub = np.tanh(sub * 2.2) * 0.8
    crack = lp(rng.standard_normal(n), 5000) * exp_env(n, 0.05)
    body = bp(rng.standard_normal(n), 80, 900) * exp_env(n, 0.22)
    y = sub + 0.45 * crack + 0.5 * body
    return norm(reverb(y, 2.0, 0.3, bright=3500), 0.95)


def sub_drop(dur=0.9):
    t = t_(dur); f = 38 + 110 * np.exp(-t / 0.18)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * exp_env(len(t), 0.3)
    return norm(stereo(np.tanh(y * 1.8)), 0.85)


def shimmer(dur=1.4, root=880):
    t = t_(dur); n = len(t); y = np.zeros(n)
    notes = [1, 5 / 4, 3 / 2, 2, 5 / 2, 3, 4]
    for i, m in enumerate(notes):
        st = int(i * 0.055 * SR)
        if st >= n: break
        tt = t[: n - st]
        tone = np.sin(2 * np.pi * root * m * tt + 0.8 * np.sin(2 * np.pi * root * m * 2.01 * tt))
        y[st:] += tone * exp_env(n - st, 0.35) * (0.8 ** i)
    y += 0.15 * hp(rng.standard_normal(n), 7000) * exp_env(n, 0.3)
    return norm(reverb(y, 2.2, 0.4, bright=9000), 0.6)


def glitch(dur=0.28):
    n = int(dur * SR); y = np.zeros(n); pos = 0
    while pos < n:
        L = int(rng.uniform(0.012, 0.04) * SR)
        f = rng.choice([220, 440, 880, 1760, 3520])
        seg = signal.square(2 * np.pi * f * t_(L / SR)) * rng.uniform(0.3, 1)
        if rng.random() < 0.5: seg = rng.standard_normal(L) * 0.6
        seg = np.round(seg * 6) / 6
        y[pos:pos + L] = seg[: max(0, min(L, n - pos))]; pos += L + int(rng.uniform(0, 0.01) * SR)
    return norm(stereo(bp(y, 200, 9000), 0.0), 0.45)


def ding():
    t = t_(1.6); n = len(t); y = np.zeros(n)
    for f, a, tau in [(1318.5, 1, 0.5), (1975.5, 0.5, 0.35), (2637, 0.25, 0.25), (3951, 0.1, 0.15)]:
        y += a * np.sin(2 * np.pi * f * t) * exp_env(n, tau)
    y *= np.minimum(1, np.arange(n) / (0.002 * SR))
    return norm(reverb(y, 1.4, 0.3), 0.5)


def reverse_swell(dur=1.0):
    x = shimmer(dur + 0.6, root=660)[: int(dur * SR)]
    x = x[::-1] * np.linspace(0, 1, int(dur * SR))[:, None] ** 1.5
    return norm(x, 0.6)


def boom_soft():
    t = t_(1.0); f = 45 + 70 * np.exp(-t / 0.04)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * exp_env(len(t), 0.25)
    return norm(reverb(y, 1.2, 0.2), 0.6)


def swipe(dur=0.22):
    return whoosh(dur, 1200, 7000, 0.4, -0.4, 0.35) * 0.7


LIB = dict(whoosh=whoosh, whoosh_long=lambda: whoosh(0.8, 200, 3500, -0.9, 0.9, 0.7), pop=pop,
           pop_hi=lambda: pop(1800, 600, 0.1), click=click, riser=riser, impact=impact,
           sub_drop=sub_drop, shimmer=shimmer, glitch=glitch, ding=ding, reverse_swell=reverse_swell,
           boom_soft=boom_soft, swipe=swipe)


# --------------------------------------------------------------- MUSIC ---

def midi(m):
    return 440 * 2 ** ((m - 69) / 12)


def supersaw(freq, dur, voices=5, detune=0.012, cutoff=2500):
    t = t_(dur); y = 0
    for i in range(voices):
        d = 1 + detune * (i - (voices - 1) / 2) / ((voices - 1) / 2)
        y = y + signal.sawtooth(2 * np.pi * freq * d * t + rng.random() * 6.28)
    return lp(y / voices, cutoff)


def kick():
    t = t_(0.45); f = 44 + 120 * np.exp(-t / 0.035)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * exp_env(len(t), 0.16)
    y += 0.3 * hp(rng.standard_normal(len(t)), 2000) * exp_env(len(t), 0.003)
    return np.tanh(y * 1.5)


def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    return hp(rng.standard_normal(n), 8000, 4) * exp_env(n, 0.06 if open_ else 0.012)


def clap():
    n = int(0.3 * SR); y = np.zeros(n)
    for o in (0, 0.009, 0.018):
        s = int(o * SR); y[s:] += bp(rng.standard_normal(n - s), 900, 3500) * exp_env(n - s, 0.012 if o < 0.018 else 0.12)
    return y


def pluck(freq, dur=0.35):
    t = t_(dur)
    y = signal.sawtooth(2 * np.pi * freq * t) + 0.5 * signal.square(2 * np.pi * freq * 2 * t, 0.3)
    y = sweep_filter(y, 6000, 500, q=1.0, kind="lp", curve=0.4)
    return y * exp_env(len(t), 0.12)


def music(total, bpm, sections):
    """sections: dict with keys 'filter_open' (s), 'drop' (s), 'end' (s) in output-timeline seconds."""
    n = int(total * SR); L = np.zeros((n, 2)); beat = 60 / bpm
    def put(x, at, gain=1.0, pan=0.0):
        s = int(at * SR)
        if s >= n: return
        x = stereo(x, pan) if x.ndim == 1 else x
        e = min(n, s + len(x)); L[s:e] += x[: e - s] * gain

    # progression i–VI–III–VII in A minor: Am F C G (one chord per bar)
    prog = [(57, 60, 64), (53, 57, 60), (48, 52, 55), (55, 59, 62)]
    bar = beat * 4
    drop, end, fo = sections["drop"], sections["end"], sections["filter_open"]
    t = 0.0; i = 0
    pads = np.zeros((n, 2))
    while t < total:
        ch = prog[i % 4]
        chunk = sum(supersaw(midi(m), bar + 0.4, cutoff=1800) for m in ch) / 3
        chunk = chunk * env_adsr(len(chunk), 0.25, 0.3, 0.8, 0.4)
        s = int(t * SR); e = min(n, s + len(chunk)); pads[s:e] += stereo(chunk)[: e - s] * 0.6
        # sub bass on root, 8ths
        for k in range(8):
            bt = t + k * beat / 2
            if bt >= total: break
            b = np.sin(2 * np.pi * midi(ch[0] - 24) * t_(beat / 2)) * env_adsr(int(beat / 2 * SR), 0.005, 0.05, 0.8, 0.05)
            put(b, bt, 0.55 if bt >= fo else 0.25)
        # arp plucks after the filter opens
        arp = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 24]
        for k in range(8):
            at = t + k * beat / 2
            if fo <= at < total:
                put(pluck(midi(arp[k % 4])), at, 0.16 if at < drop else 0.22, pan=(-0.35 if k % 2 else 0.35))
        t += bar; i += 1
    # filter sweep on pads: dark until filter_open, then opens up to the drop
    k = np.arange(n) / SR
    cut = np.where(k < fo, 500, np.where(k < drop, 500 + (4000 - 500) * np.clip((k - fo) / max(1e-3, drop - fo), 0, 1) ** 1.5, 5000))
    pad_f = np.zeros_like(pads); blk = 512; zi = [np.zeros((1, 2)), np.zeros((1, 2))]
    for s in range(0, n, blk):
        sos = signal.butter(2, cut[s], btype="low", fs=SR, output="sos")
        for c in range(2):
            pad_f[s:s + blk, c], zi[c] = signal.sosfilt(sos, pads[s:s + blk, c], zi=zi[c])
    L += pad_f

    # drums: soft hats from filter_open, full groove from drop
    nb = int(total / beat) + 1
    kick_env = np.ones(n)
    for b in range(nb):
        bt = b * beat
        if bt >= drop and bt < end:
            put(kick(), bt, 0.9)
            s = int(bt * SR); d = int(0.28 * SR)
            kick_env[s:s + d] = np.minimum(kick_env[s:s + d], 1 - 0.7 * np.linspace(1, 0, d)[: len(kick_env[s:s + d])] ** 2)
            if b % 2 == 1: put(clap(), bt, 0.35)
        if bt >= fo and bt < end:
            put(hat(), bt + beat / 2, 0.22, 0.3)
            if bt >= drop: put(hat(), bt + beat / 4, 0.1, -0.3); put(hat(), bt + 3 * beat / 4, 0.12, -0.2)
    # sidechain pump on everything except kick itself is approximated by ducking the bed
    L *= kick_env[:, None] ** 0.6
    L = reverb(L, 1.6, 0.15)[:n]
    # fade out at end
    fe = int(end * SR); fl = int(1.2 * SR)
    L[fe:fe + fl] *= np.linspace(1, 0, len(L[fe:fe + fl]))[:, None]; L[fe + fl:] = 0
    L[: int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR))[:, None]
    return norm(L, 0.8)
