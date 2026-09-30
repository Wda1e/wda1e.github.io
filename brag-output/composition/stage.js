// SparkStack brag — Three.js stage for the HyperFrames `three` adapter.
// Every frame is a pure function of HyperFrames time (hf-seek). The real GLB
// (design 0018) is rendered live: pieces pop in, layers seat onto the
// standoffs on the vol-9 beat grid, then the piece hangs in a sunlit room.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// The adapter watches THREE.DefaultLoadingManager on window to hold render-ready.
window.THREE = THREE;

const W = 1920;
const H = 1080;
const FPS = 30;

// ---- beat map (vol-9 cue preset, 114.84 BPM) ---------------------------------
// beat-grid: layer seats on half-beats from 3.70s → 6.06s
const LAND = Array.from({ length: 10 }, (_, b) => 3.7 + b * 0.2625);
const HERO = 6.34; // beat-locked: 6.34s strong cue ("1 hero.")
const CUT = 7.92; // beat-locked: 7.92s strong cue (hard cut to depth shot)
const PULL = [11.9, 12.8]; // pull-back to the room; line lands at 12.65s (beat-locked)
const PIECE_Y = 1.45; // piece centre height on the wall (m)

// ---- helpers -----------------------------------------------------------------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const win = (t, t0, d) => clamp((t - t0) / d);
const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOutBack = (x) => { const c1 = 1.8, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const easeInOutSine = (x) => -(Math.cos(Math.PI * x) - 1) / 2;
let seed = 18;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// ---- renderer ------------------------------------------------------------------
const canvas = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#e9e1d5');
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.32;

const camera = new THREE.PerspectiveCamera(30, W / H, 0.01, 30);
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new OutputPass());
composer.addPass(new SMAAPass(W, H));

// ---- room ----------------------------------------------------------------------
const std = (color, roughness = 0.8, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const add = (geo, mat, x, y, z, { cast = true, receive = true } = {}) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = cast;
  m.receiveShadow = receive;
  scene.add(m);
  return m;
};

// Warm plaster wall — the same #efe8dd family as the typography canvas.
add(new THREE.PlaneGeometry(10, 5), std('#ebe6de', 0.96), 0, 2.5, -0.003, { cast: false });

// Oak floor with seeded plank variation.
const floorTex = (() => {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 1024;
  const g = c.getContext('2d');
  const rows = 8;
  for (let r = 0; r < rows; r++) {
    let x = -rand() * 400;
    while (x < 1024) {
      const len = 380 + rand() * 420;
      const l = 62 + rand() * 9;
      g.fillStyle = `hsl(${30 + rand() * 4}, ${38 + rand() * 8}%, ${l}%)`;
      g.fillRect(x, r * 128, len, 128);
      g.fillStyle = 'rgba(60,35,15,0.35)';
      g.fillRect(x, r * 128, 3, 128);
      x += len;
    }
    g.fillStyle = 'rgba(60,35,15,0.4)';
    g.fillRect(0, r * 128, 1024, 3);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 3.2);
  t.anisotropy = 4;
  return t;
})();
const floor = add(new THREE.PlaneGeometry(10, 8), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.55 }), 0, 0, 4, { cast: false });
floor.rotation.x = -Math.PI / 2;
add(new THREE.BoxGeometry(10, 0.09, 0.016), std('#f3eee6', 0.7), 0, 0.045, 0.008);

// Walnut console on black steel legs.
const walnut = std('#6b4731', 0.42);
const steel = std('#26221f', 0.38, 0.55);
add(new THREE.BoxGeometry(1.12, 0.035, 0.34), walnut, 0, 0.78, 0.19);
add(new THREE.BoxGeometry(1.04, 0.022, 0.3), walnut, 0, 0.2, 0.19);
for (const x of [-0.53, 0.53]) for (const z of [0.045, 0.335]) add(new THREE.BoxGeometry(0.026, 0.763, 0.026), steel, x, 0.3815, z);

// Lamp, books, terracotta vase with dried stems.
add(new THREE.CylinderGeometry(0.058, 0.066, 0.02, 40), steel, -0.37, 0.808, 0.19);
add(new THREE.CylinderGeometry(0.006, 0.006, 0.2, 12), steel, -0.37, 0.918, 0.19);
const shade = add(new THREE.CylinderGeometry(0.085, 0.122, 0.165, 48, 1, true), new THREE.MeshStandardMaterial({ color: '#efe4d1', roughness: 0.9, side: THREE.DoubleSide, emissive: '#ffe9c8', emissiveIntensity: 0.28 }), -0.37, 1.0, 0.19);
shade.castShadow = false;
const bulb = new THREE.PointLight('#ffdcae', 0.35, 1.6, 2);
bulb.position.set(-0.37, 0.97, 0.19);
scene.add(bulb);
add(new THREE.BoxGeometry(0.22, 0.034, 0.155), std('#1b5c8c', 0.7), 0.08, 0.814, 0.2);
const book2 = add(new THREE.BoxGeometry(0.19, 0.028, 0.14), std('#e7dccb', 0.8), 0.085, 0.845, 0.2);
book2.rotation.y = 0.12;
const vaseProfile = [[0, 0], [0.046, 0], [0.062, 0.04], [0.064, 0.1], [0.05, 0.17], [0.03, 0.22], [0.028, 0.25], [0.036, 0.265]].map(([r, h]) => new THREE.Vector2(r, h));
add(new THREE.LatheGeometry(vaseProfile, 48), std('#c4633d', 0.62), 0.36, 0.7975, 0.2);
for (let i = 0; i < 3; i++) {
  const stem = add(new THREE.CylinderGeometry(0.0022, 0.003, 0.24, 6), std('#b3935f', 0.8), 0.36 + (i - 1) * 0.018, 1.1, 0.2);
  stem.rotation.z = (i - 1) * 0.22;
  stem.position.x += (i - 1) * 0.04;
}

// ---- light ---------------------------------------------------------------------
scene.add(new THREE.HemisphereLight('#fffaf4', '#c8a585', 0.62));
const sun = new THREE.DirectionalLight('#fff5e8', 2.3);
sun.position.set(-2.3, PIECE_Y + 2.1, 2.6);
sun.target.position.set(0, PIECE_Y - 0.2, 0);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
Object.assign(sun.shadow.camera, { left: -1.9, right: 1.9, top: 1.9, bottom: -1.9, near: 0.5, far: 8 });
sun.shadow.bias = -0.00005;
sun.shadow.normalBias = 0.0005;
scene.add(sun, sun.target);
const SUN_BASE = sun.intensity;

// ---- the piece -------------------------------------------------------------------
const P = { layers: [], rods: [], caps: [], pieces: [], order: [] };

async function build() {
  const draco = new DRACOLoader().setDecoderPath('assets/vendor/three/addons/libs/draco/');
  const gltf = await new GLTFLoader().setDRACOLoader(draco).loadAsync('assets/models/spidy_small.glb');
  const root = gltf.scene;
  root.position.set(0, PIECE_Y, 0);
  scene.add(root);

  const cache = new Map();
  const upgrade = (m, role) => {
    const key = m.uuid + role;
    if (!cache.has(key)) {
      // Base colours stay exactly as authored; only the finish reads as gloss acrylic.
      cache.set(key, new THREE.MeshPhysicalMaterial({
        color: m.color.clone(), metalness: 0, side: THREE.DoubleSide,
        roughness: role === 'acrylic' ? 0.22 : 0.3,
        clearcoat: role === 'rod' ? 0.3 : 1, clearcoatRoughness: 0.06,
      }));
    }
    return cache.get(key);
  };
  root.traverse((o) => {
    const role = o.userData?.role;
    if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.material = upgrade(o.material, role || 'acrylic'); }
    if (role === 'layer_anim') P.layers.push(o);
    if (role === 'rod') P.rods.push(o);
    if (role === 'cap') P.caps.push(o);
  });
  P.layers.sort((a, b) => a.name.localeCompare(b.name)); // Layer_01 (face) … Layer_10 (back)
  for (const c of P.caps) c.userData.base = c.position.clone();

  // Pivot every laser-cut piece at its own centre so it can scatter and tumble.
  P.layers.forEach((layer, i) => {
    const b = P.layers.length - 1 - i; // 0 = against the backplate
    for (const mesh of [...layer.children]) {
      mesh.geometry.computeBoundingBox();
      const c = mesh.geometry.boundingBox.getCenter(new THREE.Vector3()).multiply(mesh.scale);
      const pivot = new THREE.Group();
      pivot.position.copy(c);
      layer.add(pivot);
      pivot.add(mesh);
      mesh.position.sub(c);
      const r = Math.hypot(c.x, c.y) || 1;
      pivot.userData = {
        base: c.clone(), b,
        off: new THREE.Vector3((c.x / r) * (0.01 + 0.03 * rand()) + (rand() - 0.5) * 0.012, (c.y / r) * (0.01 + 0.03 * rand()) + (rand() - 0.5) * 0.012, (rand() - 0.3) * 0.04),
        rot: new THREE.Vector3((rand() - 0.5) * 0.7, (rand() - 0.5) * 0.7, (rand() - 0.5) * 0.6),
        spin: new THREE.Vector3((rand() - 0.5) * 0.35, (rand() - 0.5) * 0.35, (rand() - 0.5) * 0.3),
      };
      P.pieces.push(pivot);
    }
  });
  // Seeded pop-in order: the hook counter counts these 154 pieces as they appear.
  P.order = P.pieces.map((p, i) => ({ p, k: rand() })).sort((a, b) => a.k - b.k).map((o) => o.p);
  P.order.forEach((p, n) => { p.userData.appear = 0.1 + 1.35 * (n / (P.order.length - 1)); });
  window.__sparkstack = { pieces: P.pieces.length, layers: P.layers.length, rods: P.rods.length };
}

// ---- motion ------------------------------------------------------------------------
const explodedZ = (b) => 0.07 + b * 0.045;

function layerState(t, b) {
  const land = LAND[b];
  const k = easeInOutCubic(win(t, land - 0.8, 0.8));
  const hover = explodedZ(b) * (1 - 0.12 * easeInOutSine(win(t, 0, 3.7)));
  let z = hover * (1 - k);
  const dt = t - land;
  if (dt > 0) z += 0.0011 * Math.exp(-14 * dt) * Math.sin(34 * dt); // seating click
  const d = 1 - k;
  return {
    z, d,
    rx: d * 0.05 * Math.sin(0.7 * t + b), ry: d * 0.07 * Math.cos(0.6 * t + b * 0.8), rz: d * 0.035 * Math.sin(0.5 * t + b * 1.3),
    scatter: 1 - easeInOutCubic(win(t, land - 0.95, 0.85)),
  };
}

// Camera keys: spherical around a target (az° from +z toward +x, el°, dist m).
// Targets sit left of the piece so it frames right, leaving the left column for type.
const C = (dx, dy, dz) => [dx, PIECE_Y + dy, dz];
const SHOTS = [
  { t0: 0, t1: CUT, keys: [ // hook → assembly → hero: one continuous move
    { t: 0.0, az: -34, el: 6, dist: 1.02, tgt: C(-0.2, 0.0, 0.22) },
    { t: 3.18, az: -24, el: 4.5, dist: 1.2, tgt: C(-0.23, 0.0, 0.15) },
    { t: 5.2, az: -8, el: 3, dist: 1.24, tgt: C(-0.23, 0.0, 0.06) },
    { t: HERO, az: -3, el: 2, dist: 1.2, tgt: C(-0.225, 0.0, 0.03) },
    { t: CUT, az: 2, el: 1.5, dist: 1.16, tgt: C(-0.225, 0.0, 0.03) },
  ] },
  { t0: CUT, t1: PULL[0], keys: [ // depth: raking view from the left, wall on the left for type
    { t: CUT, az: -47, el: 8, dist: 0.34, tgt: C(-0.225, 0.1, 0.03) },
    { t: PULL[0], az: -41, el: 4, dist: 0.31, tgt: C(-0.225, 0.04, 0.03) },
  ] },
  { t0: PULL[0], t1: 99, keys: [ // pull back to the room, then a slow push for the lockup
    { t: PULL[0], az: -41, el: 4, dist: 0.31, tgt: C(-0.225, 0.04, 0.03) },
    { t: PULL[1], az: 9, el: 3, dist: 2.35, tgt: [-0.44, 1.2, 0.1] },
    { t: 16.34, az: 5, el: 3, dist: 2.22, tgt: [-0.43, 1.22, 0.1] },
    { t: 20.5, az: 2, el: 2.5, dist: 1.92, tgt: [-0.39, 1.27, 0.08] },
  ] },
];

function hermite(keys, t, get) {
  const n = keys.length;
  if (t <= keys[0].t) return get(keys[0]);
  if (t >= keys[n - 1].t) return get(keys[n - 1]);
  let i = 0;
  while (t > keys[i + 1].t) i++;
  const k0 = keys[i], k1 = keys[i + 1], h = k1.t - k0.t, s = (t - k0.t) / h;
  const slope = (j) => {
    const a = keys[Math.max(0, j - 1)], c = keys[Math.min(n - 1, j + 1)];
    return a === c ? 0 : (get(c) - get(a)) / (c.t - a.t);
  };
  const m0 = i === 0 ? ((get(k1) - get(k0)) / h) * 0.6 : slope(i);
  const m1 = i + 1 === n - 1 ? 0 : slope(i + 1);
  const s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * get(k0) + (s3 - 2 * s2 + s) * h * m0 + (-2 * s3 + 3 * s2) * get(k1) + (s3 - s2) * h * m1;
}

function poseCamera(t) {
  const shot = SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
  let keys = shot.keys;
  let tt = t;
  if (shot === SHOTS[2] && t < PULL[1]) {
    // The pull-back is a single eased whoosh rather than a spline segment.
    const e = easeInOutCubic(win(t, PULL[0], PULL[1] - PULL[0]));
    keys = [keys[0], keys[1]];
    tt = PULL[0] + e * (PULL[1] - PULL[0]);
    const lerpKey = (f) => f(keys[0]) + (f(keys[1]) - f(keys[0])) * e;
    return place(lerpKey((k) => k.az), lerpKey((k) => k.el), Math.exp(lerpKey((k) => Math.log(k.dist))), [0, 1, 2].map((j) => lerpKey((k) => k.tgt[j])));
  }
  const f = (fn) => hermite(keys, tt, fn);
  return place(f((k) => k.az), f((k) => k.el), f((k) => k.dist), [0, 1, 2].map((j) => f((k) => k.tgt[j])));
}

function place(az, el, dist, tgt) {
  const a = (az * Math.PI) / 180, e = (el * Math.PI) / 180;
  camera.position.set(tgt[0] + dist * Math.cos(e) * Math.sin(a), tgt[1] + dist * Math.sin(e), tgt[2] + dist * Math.cos(e) * Math.cos(a));
  camera.lookAt(tgt[0], tgt[1], tgt[2]);
  camera.updateProjectionMatrix();
}

// Subtle audio-reactive sunlight: bass/RMS from the pre-extracted music data.
function audioLift(t) {
  const A = window.AUDIO_DATA;
  if (!A) return 0;
  const f = Math.min(A.totalFrames - 1, Math.max(0, Math.round(t * FPS)));
  let s = 0, n = 0;
  for (let j = f - 2; j <= f; j++) if (j >= 0) { s += A.frames[j].bands[0] * 0.6 + A.frames[j].rms * 0.4; n++; }
  return n ? s / n : 0;
}

function renderAt(t) {
  P.layers.forEach((layer, i) => {
    const b = P.layers.length - 1 - i;
    const st = layerState(t, b);
    layer.position.z = st.z;
    layer.rotation.set(st.rx, st.ry, st.rz);
  });
  for (const p of P.pieces) {
    const { base, off, rot, spin, b, appear } = p.userData;
    const k = layerState(t, b).scatter;
    p.position.set(base.x + off.x * k, base.y + off.y * k, base.z + off.z * k);
    p.rotation.set((rot.x + spin.x * t) * k, (rot.y + spin.y * t) * k, (rot.z + spin.z * t) * k);
    const pop = easeOutBack(win(t, appear, 0.22));
    p.scale.setScalar(Math.max(1e-4, pop));
    p.visible = pop > 0.001;
  }
  P.caps.forEach((c) => {
    const d = Math.hypot(c.userData.base.x, c.userData.base.y * 1.3) / 0.27;
    const k = easeOutBack(win(t, LAND[9] + 0.02 + 0.22 * clamp(d), 0.18));
    c.visible = k > 0.001;
    c.position.z = c.userData.base.z + (1 - k) * 0.03;
    c.scale.setScalar(Math.max(1e-4, k));
  });
  sun.intensity = SUN_BASE * (1 + 0.05 * (audioLift(t) - 0.3));
  renderer.toneMappingExposure = 1 + 0.06 * Math.exp(-6 * Math.max(0, t - HERO)) * (t >= HERO ? 1 : 0);
  poseCamera(t);
  composer.render();
}

let ready = false;
let pending = window.__hfThreeTime || 0;
window.addEventListener('hf-seek', (e) => {
  pending = e.detail.time;
  if (ready) renderAt(pending);
});
window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady['sparkstack-stage'] = build().then(() => {
  ready = true;
  renderAt(pending);
});
