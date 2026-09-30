# SparkStack launch film: production brief and beat storyboard

This brief follows the `minimalist-product-ad-generator` skill from [MiniMax-AI/MiniMax-H3](https://github.com/MiniMax-AI/MiniMax-H3/tree/main/skills/minimalist-product-ad-generator), steps 1–10.

**Generation engine:** the skill defaults to MiniMax-H3 on MiniMax Hub, which this environment can't reach. Every frame is instead rendered straight from `spidy_small.glb` in three.js. The piece is never re-imagined by a video model, so its shapes, piece count and colors are exact. That is the skill's "product body colour is a hard fidelity constraint" rule, held literally.

## Start gate (adopted result)

| Field | Adopted choice |
|---|---|
| Product material | `25d185f8-0018_spidy_small.glb`, design 0018 "spidy_small" (the Spider-Man piece) |
| Variant status | Single variant. Main color is the piece's red `#d6262e` (WEB_acrylic_002). |
| Target duration | 15 s (the assembly of ten layers needs more room than 10 s) |
| Aspect ratio | 16:9, 1920×1080, 30 fps |
| Apple-style template | **Dark rim light**. The colored acrylic reads strongest on a dark gallery wall, and a white-tech background would swallow the white backplate. |
| In-frame copy | Agent-generated Apple-style English copy (below) |
| Video model | Default MiniMax-H3 unavailable, so this is a deterministic 3D render of the GLB itself |

## Step 1: Product fact summary

- **Category:** layered laser-cut acrylic wall art (a 3D relief).
- **Construction, from the GLB hierarchy:** 10 acrylic layers (`Layer_01`…`Layer_10`) with 154 laser-cut pieces, 1.6 mm thick. The layers sit 4.6 mm apart on 54 standoffs with 54 caps over a white backplate. That's 263 parts in total. The overall size is about 50.6 × 38 cm and about 5 cm deep.
- **Palette:** red `#d6262e` / `#ad322b` / `#892a23`; orange and amber `#f0b83f` `#db8d3b` `#dd744a`; blues `#1c8da8` `#1b5c8c` `#173648`; pale aqua `#b2c9ca`; cream `#e8e9e1`; near-black `#221d1b`. The backplate, standoffs and caps are white.
- **Quality:** pass. The meshes are clean, and the file ships with per-layer `*_ANIM` nodes, so it is ready to animate.
- **Showable structure:** layers stacking onto the standoffs; crisp, glossy cut edges; stepped shadows between layers; standoff caps; the eye pieces as the focal point.

## Step 2: Production brief

White-on-dark gallery look, 16:9, 15 s, single variant, red as the accent, agent-written copy. Brand direction is taken from the name **SparkStack**: "spark" (laser light, energy) plus "stack" (layers). sparkstack.com couldn't be reached from this environment, so the tone is inferred from the brand name and the product.

## Step 3: Narrative spine

**Product Launch**, with a Feature Touch mid-section. It opens on the pieces floating in space, the layers assemble on the beat, raking and macro detail shots prove the depth and the cut, and it closes on a hero shot with the copy.

## Step 4: Motion language

> The layers themselves drive the edit. Each one slides down the standoffs and seats on an 8th note, and the camera travels along the same depth axis. Cuts land on beats, with the camera direction mirrored between S2 and S3. Two peaks: the top layer seats on the bar-3 downbeat (4.8 s), and the hero lands with a gloss sheen on the bar-6 downbeat (12.0 s). Two braking moments: the macro drift (8.4–10.8 s) and the final hold.

## Step 5: Copy

Every line is single-line, two-part: the first half in white, the second half in the piece's red `#d6262e`. The font is Inter SemiBold, standing in for SF Pro Display Semibold, which can't be redistributed.

| Line | First half (white) | Second half (red) | Why |
|---|---|---|---|
| Mid 1 | Ten layers | of depth | A literal product fact from the GLB |
| Mid 2 | Cut by | light | Laser-cut, said as sensation |
| Final | Built from | a spark | Ties the piece to the SparkStack name |
| CTA | sparkstack | .com | Replaces the final line in place at the cut-off, so only one line is ever on screen |

## Step 6: Anchor frames

Three standalone stills, rendered from the film itself, are in `anchors/`:

1. `01-hero.jpg`: the assembled piece, three-quarter hero view.
2. `02-material-detail.jpg`: raking view of the stepped layers, standoffs and cast shadows.
3. `03-final-copy.jpg`: the closing composition with the "Built from a spark" line.

## Step 7: Beat storyboard

**User choice statement:** dark rim-light style, 16:9, 15 seconds, Product Launch spine, single variant, red as the accent color, copy: "Ten layers of depth", "Cut by light", "Built from a spark", then "sparkstack.com".

100 BPM gives a 0.6 s beat and a 2.4 s bar.

| Time | Shot | Purpose | Visual lead | Visual / camera | Copy | Text color | Text effect | Transition | Rhythm |
|---|---|---|---|---|---|---|---|---|---|
| 0.0–2.1 | S1 | Striking open | 154 pieces floating in ten loose layers | Fade up from black in 0.35 s, already moving. Starts inside the cloud and pulls back fast to reveal the backplate and standoffs. A warm light glides through the gaps. | none | – | – | – | setup |
| 2.1–4.8 | S1 | Product action | Layers seating, bottom first | Pieces converge into each layer's outline, then each layer slides down the standoffs and seats on an 8th note (2.1, 2.4 … 4.8 s). The camera orbits from left three-quarter to right three-quarter. | none | – | – | continuous | prepare → impact |
| 4.8–6.0 | S1 | Peak and settle | Top layer seats; caps ripple out from center | Brief exposure lift on the downbeat, then the camera settles | none | – | – | hard cut on the beat | impact → brake |
| 6.0–8.4 | S2 | Prove depth | Stepped layers, standoffs, stacked shadows | Raking view from the right, slow drift down along the arm | Ten layers of depth, right side, vertically centered | first half white, second half red | "Ten layers" slides in at 6.3 s; "of depth" arrives at 6.9 s while the first half eases about 0.3 em left | cut on the beat, camera direction mirrored | establish |
| 8.4–10.8 | S3 | Material detail | The eye piece and its cut edges | Mirror move from the left over the eye; a gloss sheen glides across the acrylic | Cut by light, left side, vertically centered | first half white, second half red | "Cut by" at 8.7 s, "light" at 9.3 s, same-line shift | cut on the beat | brake |
| 10.8–12.0 | S4 | Hero build | The whole piece | Arc from a low right angle to straight-on, landing on the downbeat; the sheen sweeps the face | none | – | – | continuous | prepare |
| 12.0–13.8 | S4 | Hero hold | The piece, left of center | Near-static push, the stable product closing | Built from a spark, right side, vertically centered | first half white, second half red | "Built from" at 12.3 s, "a spark" at 12.9 s | – | impact → settle |
| 13.8–15.0 | S4 | Close | The piece plus the URL | Music cuts off at 13.8 s and the final line is replaced in place | sparkstack.com | "sparkstack" white, ".com" red | Fades in place with no slide, so the URL never shows a gap | final hold | settle |

**Principles applied:** one single-line copy line at a time; exactly two text colors; text rendered inside the film (no subtitle track); text sits in the vertically centered zone, never in a lower-third position; no grids, panels or split screens; no fake logo.

## Step 8: Render

Every beat above is implemented in `timeline.js`. That file is the prompt-equivalent: every copy line, its timing, its colors and every camera key is spelled out there. `scene.js` renders each frame deterministically in headless Chromium.

## Step 9: Score (`music.py`)

Everything is synthesized, so there is no licensing to worry about. The music is 100 BPM in A major with add9 color, one chord per bar:

- A Karplus-Strong pluck arpeggio: 8ths in the intro and the braking bar, 16ths elsewhere.
- Block-chord stabs.
- An airy noise bed.
- Four-on-the-floor kick and a sidechained sub from the assembly on. It drops out for the macro brake and returns into the hero shot.
- Sine risers into 2.4 s and 12.0 s.
- **Wooden percussion that doubles as the product's sound:** each layer that seats triggers a wooden "tock", rising up an A-major pentatonic scale, and the caps ripple as tiny ticks.
- A sudden cut-off at 13.8 s, where everything stops within 30 ms and only the final pluck chord rings out.

## Step 10: Mix and delivery checks

- The score is written to the same beat grid as the picture, so every hit is frame-aligned (at 30 fps, a beat is 18 frames).
- Loudness is restrained: about -16 dBFS RMS in the groove, peaks at or below -1 dBFS, with gentle soft-clipping only.
- The only fade is a 0.15 s tail fade.
- Target checks: 16:9, 15.0 s, English copy, a stable closing frame with the product and copy.
