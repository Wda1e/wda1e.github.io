import json, numpy as np
FPS_OUT, FPS_SRC, NSRC = 60, 30, 339
TOTAL = 12.8
SEGS = [(0.74, 4.12), (4.44, 7.02), (7.46, 11.30)]
segs, o = [], 0.0
for a, b in SEGS:
    segs.append(dict(srcStart=a, srcEnd=b, outStart=round(o, 4), outEnd=round(o + b - a, 4))); o += b - a
SPEECH_END = o

def s2o(t):
    for s in segs:
        if s["srcStart"] - 1e-6 <= t <= s["srcEnd"] + 1e-6: return round(t - s["srcStart"] + s["outStart"], 3)
    raise ValueError(t)

# (text, srcStart, srcEnd) — ASR timings, first word + 'agents'/'ten' nudged to the energy envelope
W = [("There",0.86,1.02),("is",1.04,1.28),("this",1.28,1.52),("new",1.52,1.76),("GitHub",1.76,2.32),
     ("repository",2.32,2.98),("Superpowers",3.18,4.02),("that",4.58,4.88),("essentially",4.88,5.36),
     ("builds",5.36,5.68),("agentic",5.68,6.40),("agents",6.46,6.92),("that",7.58,7.92),("make",7.92,8.22),
     ("your",8.24,8.40),("Claude",8.40,9.00),("Code",9.04,9.44),("ten",9.46,9.80),("times",9.90,10.24),
     ("smarter",10.30,11.12)]
words = [dict(text=w, start=s2o(a), end=s2o(b)) for w, a, b in W]

# per-output-frame source frame index + face track
face = json.load(open("analysis/face.json"))
N = int(round(TOTAL * FPS_OUT)); srcf, fx, fy, fh, ftop = [], [], [], [], []
sm = face["smooth"]
for f in range(N):
    t = f / FPS_OUT; st = None
    for s in segs:
        if s["outStart"] <= t < s["outEnd"]: st = s["srcStart"] + t - s["outStart"]
    if st is None: st = SEGS[-1][1]                          # freeze last frame for outro
    i = int(min(NSRC - 1, max(0, round(st * FPS_SRC - 0.0001))))
    srcf.append(i)
    # interpolate the smoothed face track at the exact source time
    x = st * FPS_SRC; i0 = int(min(NSRC - 2, max(0, np.floor(x)))); k = min(1, max(0, x - i0))
    L = lambda key: sm[key][i0] * (1 - k) + sm[key][i0 + 1] * k
    fx.append(round(L("cx"), 4)); fy.append(round(L("cy"), 4)); fh.append(round(L("h"), 4)); ftop.append(round(L("top"), 4))

tl = dict(fps=FPS_OUT, width=1080, height=1920, total=TOTAL, durationInFrames=N, speechEnd=round(SPEECH_END, 3),
          segments=segs, words=words, srcFrame=srcf, face=dict(cx=fx, cy=fy, h=fh, top=ftop))
json.dump(tl, open("timeline.json", "w"))
print(json.dumps(segs)); print("speech end", SPEECH_END)
for w in words: print(f'{w["start"]:6.2f} {w["end"]:6.2f} {w["text"]}')
print("face cx range", min(fx), max(fx), "cy", min(fy), max(fy), "h", min(fh), max(fh), "top", min(ftop), max(ftop))
