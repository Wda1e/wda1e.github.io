# Superpowers: short-form edit

`superpowers-edit.mp4` is a 1080×1920 vertical edit at 60 fps and 12.8 s, with audio mastered to -14 LUFS. It was cut from a 11.3 s iPhone selfie clip that says:

> "There is this new GitHub repository, Superpowers, that essentially builds agentic agents that make your Claude Code ten times smarter."

## What's in the edit

| Time (s) | Beat | Visuals | Sound |
|---|---|---|---|
| 0.0 – 1.0 | "There is this new" | Zoom-blur reveal from 1.42× with an RGB split and a warm light leak. Word-by-word captions start, and a **NEW** pill pops on "new". | whoosh + soft boom, pop |
| 1.0 – 2.4 | "GitHub repository" | A GitHub-style repo card drops in with a 3D tilt and `obra/superpowers` types out. The NEW pill docks as a badge. A cursor clicks **Star**, which fills gold with a sparkle burst. | swipe, key ticks, click + ding |
| 2.4 – 3.4 | "Superpowers" | Punch-in to 1.3× with a camera roll and shake. The background dims to violet and the subject gets a cyan/violet rim glow. **SUPERPOWERS** springs in letter by letter *behind the head* (segmentation depth), with electric arcs, sparks, and a shine sweep. | reverse swell, boom, shimmer |
| 3.4 – 6.0 | "…builds agentic agents" | Jump cut, with dead air removed and hidden by a zoom change. A hub node spins up and four agent nodes pop in on "agentic" / "agents", joined by animated data lines. | whoosh, pops |
| 6.0 – 7.6 | "…make your Claude Code" | A terminal drops in. `claude` types out, the welcome box appears, and `> make me 10x smarter` types, then it glitches apart. | swipe, typing, glitch, riser |
| 7.6 – 9.6 | "ten times smarter" | A slot-machine counter runs 1X→9X, then **10X** slams in behind the head with a white flash, shockwave ring, anime speed lines, gold rim light, and an RGB hit. **SMARTER** flips in with sparkles. | tape-stop → **drop** lands exactly on "ten", impact, sub drop |
| 9.6 – 12.8 | End card | The edit shrinks into a floating card over a blurred, neon backdrop with a perspective grid. The Superpowers logotype appears and `github.com/obra/superpowers` types into a URL pill that ends with a star. | whoosh, pop, typing, ding |

Throughout: the camera follows the face (MediaPipe landmarks), captions are colour-coded by keyword, and there's a progress bar, film grain, a vignette, and a custom colour grade.

## Pipeline

`pipeline/` holds the Python analysis and audio, and `remotion/` holds the React motion graphics.

1. **Grade**: an ffmpeg filter chain in `grade.txt` adds contrast, highlight roll-off, warm mids, cool shadows, and vibrance.
2. **Transcribe**: `asr.py` runs NVIDIA Parakeet-TDT 0.6B (sherpa-onnx) and gives word timestamps. `energy.py` finds real pauses.
3. **Analyze**: `analyze.py` runs MediaPipe face landmarks per frame for smart reframing. It also runs a multiclass selfie segmentation, refined with a guided filter and temporal smoothing, to produce person cutouts for text-behind-subject.
4. **Timeline**: `timeline.py` builds the edit decision list (three segments, with dead air removed), remaps the words to output time, and maps each 60 fps output frame to its source frame and face position.
5. **Audio**: `sfx.py` synthesizes every sound effect and the music bed from scratch in numpy/scipy, so there are no samples and no licensing questions. `mix.py` does the voice cleanup (HPF, FFT denoise, EQ, de-ess, compressor), places SFX on the animation beats, adds a 120 bpm bed whose bar grid is anchored so the drop hits on "ten", sidechains it to the voice, and runs a two-pass loudnorm to -14 LUFS / -1.2 dBTP.
6. **Render**: in `remotion/`, run `npx remotion render src/index.ts Main out/master.mov --codec=prores --prores-profile=hq`. Then mux the audio and encode to H.264.

The source clip, extracted frames, and person cutouts are not committed because of their size. To reproduce, re-run steps 1–4 to regenerate `remotion/public/{frames,person,grain}`.
