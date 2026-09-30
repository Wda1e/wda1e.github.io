# Hyperframes Composition Brief: SparkStack (design 0018)

## Objective
Create a short launch-style brag video for SparkStack's layered acrylic wall art (design 0018).

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape, 1920×1080, 30 fps
- Duration: 20.5 s

## Source Material
- Project root: `/home/user/wda1e.github.io`. The product is the user-supplied model `sparkstack-launch/spidy_small.glb` (Blender export, Draco-compressed).
- Primary files read: the GLB's node and material hierarchy (10 `Layer_XX_ANIM` groups, 154 acrylic pieces, 54 rods, 54 caps, backplate, 30 materials).
- Product name: SparkStack (from the user's domain, sparkstack.com). The site itself is blocked by the environment's network policy.
- Tagline / strongest claim: 154 laser-cut pieces, 10 layers (counted from the GLB)
- Key visual to show: the real GLB, rendered live with Three.js (Hyperframes `three` adapter), assembling from loose pieces into the finished relief
- Copy that must appear verbatim:
  - 154 pieces.
  - 10 layers.
  - 1 hero.
  - Real depth.
  - Not a print.
  - Made for your wall.
  - SparkStack
  - Art that stacks up.
  - sparkstack.com
  - Labels: `LASER-CUT ACRYLIC · DESIGN 0018`, `LAYER 01/10`…`10/10`, `10 LAYERS · 54 STANDOFFS`, `3D ACRYLIC WALL ART`

## Creative Direction
- Tone preset: `default`
- Creative direction: pop-art product drop, a hero assembling itself piece by piece on a sunlit wall
- Interpretation: punchy and warm. Heavy display type slams in, then holds. Camera moves carry the transitions, plus one hard cut on a strong beat.
- Angle: count it up. 154 pieces appear, 10 layers seat, "1 hero." lands, then depth is proved and the piece goes on a wall.
- Hook: pieces pop into the air while a counter races 001→154, then "154 pieces." slams in.
- Outro / punchline: "Made for your wall." → SparkStack / Art that stacks up. / sparkstack.com
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Re-drawing the product: always render the GLB
  - Naming the licensed character on screen

## Visual Identity
- Background: `#efe8dd` (warm wall and paper; the 3D wall material matches it)
- Text: `#1d1814`
- Accent: `#d6262e` (the piece's red, WEB_acrylic_002)
- Supporting: `#1b5c8c`, `#f0b83f` (piece blue and amber)
- Display font: Archivo Black (Hyperframes-embedded)
- Body and labels: Space Mono (Hyperframes-embedded)
- Visual references: glossy cut edges, the eye pieces, stepped layer shadows, standoffs and caps

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

1. Hook, 3.18 s: 154 pieces pop in one by one, counter 001→154, "154 pieces."
2. Reveal, 4.74 s: 10 layers seat on the half-beat grid, readout LAYER 01–10/10, "10 layers." → "1 hero." at 6.34 s
3. Depth, 4.2 s: hard cut at 7.92 s to a raking side view, "Real depth." / "Not a print."
4. On the wall, 4.22 s: pull back to the room vignette, "Made for your wall." at 12.65 s
5. Outro, 4.16 s: SparkStack / Art that stacks up. / sparkstack.com

## Audio
- Audio role: warm, upbeat bed with a light, motion-matched SFX layer
- Audio arc: energy from frame 1, build through the assembly, success hit, groove through depth and room, fade under the lockup
- Music: `assets/music/happy-beats-business-moves-vol-9-by-ende-dot-app.mp3`
- Music treatment: volume about 0.35, starts at 0, about 1 s fade-out at the end
- Music cue guidance: bundled preset `brag/skills/brag/assets/music/cues/happy-beats-business-moves-vol-9-by-ende-dot-app.music-cues.json`. Strong locks at 6.34, 7.92 and 12.65 s; the beat grid for the layer seats and lockup lines.
- Audio-reactive treatment: subtle. Bass and RMS drive the sunlight warmth and the red accent rule's glow. No visualizer graphics.
- Audio-coupled moments:
  - Hook headline slam: soft impact
  - Layers 1 and 10 seating: plastic chip clack
  - "1 hero.": success bell
  - Room reveal line: soft impact
  - Wordmark: warm bong
- SFX analysis guidance: `brag/skills/brag/assets/sfx/sfx-analysis.md`, low or medium HF-risk picks only
- Audio files: copied into `brag-output/composition/assets/`
