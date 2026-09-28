import json, subprocess, numpy as np, soundfile as sf
from scipy import signal
import sfx
SR = sfx.SR
tl = json.load(open("timeline.json")); TOTAL = tl["total"]; N = int(TOTAL * SR)

# ---------- 1. voice: cut segments exactly on the video EDL (8 ms micro-fades, no overlap)
a, sr = sf.read("audio.wav", dtype="float32"); assert sr == SR
voice = np.zeros((N, 2), np.float32); F = int(0.008 * SR)
for s in tl["segments"]:
    x = a[int(s["srcStart"] * SR):int(s["srcEnd"] * SR)].copy()
    x[:F] *= np.linspace(0, 1, F)[:, None]; x[-F:] *= np.linspace(1, 0, F)[:, None]
    o = int(s["outStart"] * SR); voice[o:o + len(x)] = x[: N - o]
sf.write("audio_out/voice_cut.wav", voice, SR, subtype="FLOAT")
chain = ("highpass=f=85,afftdn=nr=14:nf=-38:tn=1,"
         "equalizer=f=220:t=q:w=1.1:g=-2.5,equalizer=f=3400:t=q:w=1.4:g=2.5,equalizer=f=11000:t=h:w=0.7:g=2.5,"
         "deesser=i=0.35,acompressor=threshold=-22dB:ratio=3.2:attack=4:release=90:makeup=3dB,"
         "alimiter=limit=0.89:level=false")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "audio_out/voice_cut.wav", "-af", chain, "-ar", str(SR),
                "-c:a", "pcm_f32le", "audio_out/voice_proc.wav"], check=True)
voice, _ = sf.read("audio_out/voice_proc.wav", dtype="float32")
voice = np.pad(voice, ((0, max(0, N - len(voice))), (0, 0)))[:N]
if voice.ndim == 1: voice = np.stack([voice, voice], 1)
m = voice.mean(1); voice = np.stack([m, m], 1)       # iPhone mic is effectively mono — centre it
voice = voice / (np.abs(voice).max() + 1e-9) * 0.85

# ---------- 2. music bed: 120 bpm, bar grid anchored so the drop lands exactly on "ten"
DROP = [w for w in tl["words"] if w["text"] == "ten"][0]["start"]
BPM = 120; bar = 4 * 60 / BPM; off = bar - (DROP % bar)          # music-time = t + off
SUPER = [w for w in tl["words"] if w["text"] == "Superpowers"][0]["start"]
mus = sfx.music(TOTAL + off, BPM, dict(filter_open=SUPER + off, drop=DROP + off, end=TOTAL + off - 1.25))
mus = mus[int(off * SR):][:N]; mus = np.pad(mus, ((0, N - len(mus)), (0, 0)))

# gain automation: quiet bed under speech, tape-stop gap before drop, lift in the outro
t = np.arange(N) / SR
g = np.interp(t, [0, 0.4, DROP - 0.30, DROP - 0.26, DROP - 0.01, DROP, tl["speechEnd"] - 0.2, tl["speechEnd"] + 0.4, TOTAL],
                 [0, 0.22, 0.26, 0.0, 0.0, 0.34, 0.34, 0.62, 0.62])
# sidechain duck to the voice envelope
env = signal.sosfiltfilt(signal.butter(2, 6, fs=SR, output="sos"), np.abs(voice[:, 0]))
env = np.clip(env / (np.percentile(env, 98) + 1e-9), 0, 1)
mus *= (g * (1 - 0.45 * env))[:, None]

# ---------- 3. sound design, placed on the animation beats
lib = {k: f() for k, f in sfx.LIB.items()}
fx = np.zeros((N, 2))
def put(name, at, gain=1.0):
    x = lib[name] if isinstance(name, str) else name
    s = int(at * SR)
    if s < 0: x = x[-s:]; s = 0
    e = min(N, s + len(x)); fx[s:e] += x[: e - s] * gain
W = {w["text"] + (str(i) if w["text"] == "that" else ""): w for i, w in enumerate(tl["words"])}
ev = [("whoosh_long", -0.05, 0.55), ("boom_soft", 0.02, 0.55), ("pop", 0.78, 0.35),          # intro, NEW pill
      ("swipe", 0.98, 0.5), ("click", 2.02, 0.7), ("ding", 2.06, 0.35), ("pop_hi", 2.06, 0.3),  # GitHub card + star
      ("reverse_swell", SUPER - 0.7, 0.55), ("boom_soft", SUPER, 0.7), ("shimmer", SUPER, 0.45), ("whoosh", SUPER - 0.2, 0.5),
      ("whoosh", 3.28, 0.45),                                                                   # cut A->B
      ("pop", 4.30, 0.35), ("pop_hi", 4.66, 0.25), ("pop_hi", 4.86, 0.22), ("pop_hi", 5.44, 0.25), ("pop_hi", 5.62, 0.22),
      ("whoosh", 5.86, 0.45),                                                                   # cut B->C
      ("swipe", 6.56, 0.5), ("pop", 7.30, 0.3),
      ("riser", DROP - 1.5, 0.5), ("glitch", 7.60, 0.55),
      ("impact", DROP + 0.01, 0.72), ("sub_drop", DROP, 0.5),
      ("shimmer", 8.80, 0.4), ("whoosh", 8.72, 0.45),
      ("whoosh_long", tl["speechEnd"] - 0.3, 0.55), ("pop", 10.35, 0.35), ("ding", 11.55, 0.35), ("boom_soft", 10.2, 0.4)]
for name, at, gain in ev: put(name, at, gain)
# keyboard ticks for the typed text (repo name ~1.62–1.95, `claude` 6.92–7.12, URL 10.6–11.45)
ticks = [1.62 + i * 0.021 for i in range(16)] + [6.92 + i * 0.035 for i in range(6)] + [7.34 + i * 0.025 for i in range(10)] + [10.62 + i * 0.03 for i in range(27)]
for i, at in enumerate(ticks): put(sfx.key_tick(100 + i), at, 0.55)
for k in range(9): put('pop_hi', 7.62 + k * 0.037, 0.12 + k * 0.02)   # slot-machine counter 1X..9X
fx[:, :] *= 0.8

# ---------- 4. mix + master
mix = voice * 1.0 + mus * 0.55 + fx * 0.42
mix[-int(0.25 * SR):] *= np.linspace(1, 0, int(0.25 * SR))[:, None]
sf.write("audio_out/mix_pre.wav", mix.astype(np.float32), SR, subtype="FLOAT")
# two-pass loudnorm to -14 LUFS / -1 dBTP (social-platform target)
r = subprocess.run(["ffmpeg", "-hide_banner", "-y", "-i", "audio_out/mix_pre.wav", "-af",
                    "loudnorm=I=-14:TP=-1.2:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True)
js = json.loads(r.stderr[r.stderr.rfind("{"):])
af = (f"loudnorm=I=-14:TP=-1.2:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
      f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "audio_out/mix_pre.wav", "-af", af, "-ar", "48000",
                "-c:a", "pcm_s24le", "audio_out/final_mix.wav"], check=True)
for part, arr in [("voice", voice), ("music", mus * 0.55), ("sfx", fx * 0.42)]:
    sf.write(f"audio_out/stem_{part}.wav", arr.astype(np.float32), SR, subtype="FLOAT")
print("measured", js["input_i"], "LUFS ->", "-14 target; drop at", DROP, "music offset", round(off, 3))
