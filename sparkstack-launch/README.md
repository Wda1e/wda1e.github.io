# SparkStack launch film

A 15-second, 16:9 launch video for the layered laser-cut acrylic Spider-Man piece (design 0018, `spidy_small.glb`). It is rendered frame by frame from the 3D model itself and scored with synthesized music on the same 100 BPM beat grid.

- **Video:** [`sparkstack-launch-16x9.mp4`](sparkstack-launch-16x9.mp4): 1920×1080, 30 fps, H.264 + AAC.
- **Brief and beat storyboard:** [`STORYBOARD.md`](STORYBOARD.md), which follows the `minimalist-product-ad-generator` skill from MiniMax-AI/MiniMax-H3.
- **Anchor stills:** [`anchors/`](anchors/)
- **Score:** [`score.wav`](score.wav)

## How it's built

| File | Role |
|---|---|
| `timeline.js` | The beat storyboard as code: layer assembly times, camera keys per shot, copy lines and timing, light and sheen sweeps |
| `scene.js` | three.js scene: loads the Draco GLB, gloss-acrylic materials (base colors unchanged), dark rim-light setup, per-piece scatter, same-line two-part typography |
| `render.mjs` | Drives headless Chromium through `window.renderAt(t)` to write deterministic PNG frames (resumable) |
| `music.py` | Procedural score: plucks, block chords, kick and sub, sweeps, wooden layer "tocks", sudden cut-off |
| `encode.py` | Muxes the frames and the score into the MP4 and exports the anchor stills |

## Re-render

```bash
npm install                # three, @fontsource/inter, playwright
pip install numpy scipy pillow imageio-ffmpeg
npm run render             # about 30–50 min on CPU (SwiftShader); resumable
npm run score
npm run encode
```

To change copy, timing or camera moves, edit `timeline.js`. To preview single frames quickly at 960×540:

```bash
node preview.mjs tests/look "0.5,4.8,7.0,9.5,13.5" && python3 sheet.py tests/look 3
```
