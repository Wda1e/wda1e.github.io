import sherpa_onnx, soundfile as sf, json, numpy as np
d = "models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8/"
rec = sherpa_onnx.OfflineRecognizer.from_transducer(
    encoder=d+"encoder.int8.onnx", decoder=d+"decoder.int8.onnx", joiner=d+"joiner.int8.onnx",
    tokens=d+"tokens.txt", num_threads=4, model_type="nemo_transducer")
a, sr = sf.read("audio16k.wav", dtype="float32")
s = rec.create_stream(); s.accept_waveform(sr, a); rec.decode_stream(s)
r = s.result
print(r.text)
toks = list(r.tokens); ts = list(r.timestamps)
durs = list(getattr(r, "durations", []) or [])
print(len(toks), len(ts), len(durs))
# group sentencepiece tokens into words
words = []
for i,(t,st) in enumerate(zip(toks, ts)):
    if t.startswith("▁") or t.startswith(" ") or not words:
        words.append({"w": t.lstrip("▁ "), "s": st, "tok_ends":[st + (durs[i] if durs else 0.08)]})
    else:
        words[-1]["w"] += t; words[-1]["tok_ends"].append(st + (durs[i] if durs else 0.08))
for i,w in enumerate(words):
    w["e"] = max(w["tok_ends"]); del w["tok_ends"]
for w in words: print(f'{w["s"]:6.2f} {w["e"]:6.2f} {w["w"]}')
json.dump(words, open("words_raw.json","w"), indent=1)
