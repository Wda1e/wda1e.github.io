import numpy as np, soundfile as sf, json
from scipy import signal
a, sr = sf.read("audio16k.wav", dtype="float32")
sos = signal.butter(4, [150, 4000], btype="band", fs=sr, output="sos"); b = signal.sosfilt(sos, a)
hop = int(0.02*sr); fr = np.array([np.sqrt(np.mean(b[i:i+hop*2]**2)) for i in range(0, len(b)-hop*2, hop)])
db = 20*np.log10(fr+1e-6); db -= db.max()
line = ""
for i, v in enumerate(db):
    t = i*0.02
    if i % 5 == 0: line += f"\n{t:5.2f} "
    line += "#" if v > -20 else ("+" if v > -30 else ("." if v > -40 else " "))
print(line)
print("noise floor p10", np.percentile(db, 10))
