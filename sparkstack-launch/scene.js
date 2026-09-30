// SparkStack launch film — deterministic three.js scene.
// The page exposes window.init() and window.renderAt(t); render.mjs drives it
// frame by frame so every frame is reproducible (no wall-clock animation).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { timeline } from './timeline.js';

let composer, renderer, scene, camera, comp, ctx, W, H, keyLight, sweepLight, wall, maskMat, sheenCanvas, sheenCtx;
const P = { layers: [], rods: [], caps: [], backplate: null, root: null };

const RED = '#d6262e'; // WEB_acrylic_002 — the piece's dominant red, used as the copy accent

window.init = async ({ width, height, shadowSize = 4096, clearcoat = true, aa = 'msaa' }) => {
  W = width; H = height;
  renderer = new THREE.WebGLRenderer({ antialias: aa === 'msaa', preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  comp = document.createElement('canvas');
  comp.width = W; comp.height = H;
  document.body.appendChild(comp);
  ctx = comp.getContext('2d');

  scene = new THREE.Scene();
  scene.background = new THREE.Color('#070708');
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.22;

  camera = new THREE.PerspectiveCamera(30, W / H, 0.005, 20);

  // Dark gallery wall the piece hangs on; catches the key-light pool and shadows.
  wall = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 6),
    new THREE.MeshStandardMaterial({ color: '#101114', roughness: 0.95, metalness: 0 })
  );
  wall.position.z = -0.0025;
  wall.receiveShadow = true;
  scene.add(wall);

  scene.add(new THREE.HemisphereLight('#cfd8ff', '#1a1210', 0.18));

  keyLight = new THREE.SpotLight('#fff7ef', 26, 0, Math.PI / 7, 0.85, 2);
  keyLight.position.set(-0.75, 1.05, 1.35);
  keyLight.target.position.set(0, 0, 0);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(shadowSize, shadowSize);
  keyLight.shadow.bias = -0.00006;
  keyLight.shadow.normalBias = 0.0004;
  keyLight.shadow.radius = 3;
  keyLight.shadow.camera.near = 0.8;
  keyLight.shadow.camera.far = 3.2;
  scene.add(keyLight, keyLight.target);

  const rimCool = new THREE.DirectionalLight('#bcd2ff', 1.6);
  rimCool.position.set(1.4, 0.35, 0.12);
  const rimWarm = new THREE.DirectionalLight('#ffb27a', 1.1);
  rimWarm.position.set(-1.4, -0.45, 0.18);
  scene.add(rimCool, rimWarm);

  // Moving highlight used for the edge sweeps (intensity/position driven by the timeline).
  sweepLight = new THREE.PointLight('#fff6ea', 0, 0.9, 2);
  scene.add(sweepLight);
  // Sheen: a product-only mask pass lets a soft highlight band glide across the
  // acrylic face without lifting the wall or the background.
  maskMat = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide });
  sheenCanvas = document.createElement('canvas');
  sheenCanvas.width = W; sheenCanvas.height = H;
  sheenCtx = sheenCanvas.getContext('2d');

  if (aa === 'smaa') {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new OutputPass());
    composer.addPass(new SMAAPass(W, H));
  }

  const draco = new DRACOLoader().setDecoderPath('./node_modules/three/examples/jsm/libs/draco/');
  const gltf = await new GLTFLoader().setDRACOLoader(draco).loadAsync('./spidy_small.glb');
  P.root = gltf.scene;
  scene.add(P.root);

  const matCache = new Map();
  const upgrade = (m, role) => {
    const key = m.uuid + role;
    if (matCache.has(key)) return matCache.get(key);
    // Keep the file's base colours exactly; only the finish is upgraded to read as gloss acrylic.
    const pm = new THREE.MeshPhysicalMaterial({
      color: m.color.clone(),
      roughness: role === 'acrylic' ? 0.2 : role === 'backplate' ? 0.28 : 0.32,
      metalness: 0,
      clearcoat: clearcoat ? (role === 'rod' ? 0.3 : 1.0) : 0,
      clearcoatRoughness: 0.05,
      side: THREE.DoubleSide,
    });
    matCache.set(key, pm);
    return pm;
  };

  P.root.traverse((o) => {
    const role = o.userData?.role;
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
      o.material = upgrade(o.material, role || 'acrylic');
    }
    if (role === 'layer_anim') P.layers.push(o);
    if (role === 'rod') P.rods.push(o);
    if (role === 'cap') P.caps.push(o);
    if (role === 'backplate_group') P.backplate = o;
  });
  // Layer_01 is the top (closest to viewer); assembly runs from Layer_10 upward.
  P.layers.sort((a, b) => a.name.localeCompare(b.name));
  for (const l of [...P.layers, ...P.rods, ...P.caps]) l.userData.base = l.position.clone();
  // Wrap every laser-cut piece in a pivot at its own centre so it can drift and
  // tumble independently while its layer is still unassembled.
  let seed = 18;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  P.pieces = P.layers.map((l) => [...l.children].map((mesh) => {
    mesh.geometry.computeBoundingBox();
    const c = mesh.geometry.boundingBox.getCenter(new THREE.Vector3()).multiply(mesh.scale);
    const pivot = new THREE.Group();
    pivot.position.copy(c);
    l.add(pivot);
    pivot.add(mesh);
    mesh.position.sub(c);
    const r = Math.hypot(c.x, c.y) || 1;
    pivot.userData.base = c.clone();
    pivot.userData.off = new THREE.Vector3(
      (c.x / r) * (0.008 + 0.022 * rand()) + (rand() - 0.5) * 0.01,
      (c.y / r) * (0.008 + 0.022 * rand()) + (rand() - 0.5) * 0.01,
      (rand() - 0.35) * 0.035
    );
    pivot.userData.rot = new THREE.Vector3((rand() - 0.5) * 0.6, (rand() - 0.5) * 0.6, (rand() - 0.5) * 0.5);
    return pivot;
  }));

  await document.fonts.load('600 64px Inter');
  await document.fonts.load('700 64px Inter');
  return { layers: P.layers.length, rods: P.rods.length, caps: P.caps.length, pieces: P.pieces.flat().length };
};

function apply(s) {
  camera.fov = s.fov;
  camera.position.set(...s.cam);
  camera.up.set(0, 1, 0);
  camera.lookAt(new THREE.Vector3(...s.target));
  if (s.roll) camera.rotateZ(s.roll);
  camera.updateProjectionMatrix();

  P.layers.forEach((l, i) => {
    const st = s.layers[i];
    l.position.set(l.userData.base.x + st.x, l.userData.base.y + st.y, l.userData.base.z + st.z);
    l.rotation.set(st.rx || 0, st.ry || 0, st.rz || 0);
    l.visible = st.visible !== false;
    const k = st.scatter || 0;
    for (const p of P.pieces[i]) {
      const { base, off, rot } = p.userData;
      p.position.set(base.x + off.x * k, base.y + off.y * k, base.z + off.z * k);
      p.rotation.set(rot.x * k, rot.y * k, rot.z * k);
    }
  });
  P.rods.forEach((r) => { r.scale.z = Math.max(1e-4, s.rodScale); r.visible = s.rodScale > 0.001; });
  P.caps.forEach((c, i) => {
    const k = s.caps[i] ?? 1;
    c.visible = k > 0.001;
    c.position.z = c.userData.base.z + (1 - k) * 0.03;
    c.scale.setScalar(Math.max(1e-4, k));
  });
  P.backplate.position.z = s.backplateZ || 0;
  P.backplate.visible = s.backplateVisible !== false;
  wall.visible = s.wall !== false;

  keyLight.intensity = s.key;
  sweepLight.intensity = s.sweep.intensity;
  sweepLight.position.set(...s.sweep.pos);

  renderer.toneMappingExposure = s.exposure;
}

// Single-line, two-part copy: first half fades/slides in, then the second half
// arrives on the same line while the first half eases ~12px to make room.
function drawCopy(c) {
  if (!c || c.alpha <= 0) return;
  const size = Math.round(c.size * H);
  ctx.save();
  ctx.font = `600 ${size}px Inter`;
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = `${(-0.02 * size).toFixed(2)}px`;
  const gap = size * (c.gap ?? 0.28);
  const wA = ctx.measureText(c.a).width;
  const wB = ctx.measureText(c.b).width;
  const total = wA + gap + wB;
  const y = c.y * H;
  let x0;
  if (c.align === 'center') x0 = c.x * W - total / 2;
  else if (c.align === 'right') x0 = c.x * W - total;
  else x0 = c.x * W;
  // Until the second half arrives, the first half sits a subtle ~0.3em toward
  // it, then eases back to make room (it finishes before the second half settles).
  // A URL must never show a gap between its halves, so it only fades.
  const shift = c.still ? 0 : (1 - c.aShift) * size * 0.3;
  const nudge = c.still ? 0 : (1 - c.aIn) * size * 0.35;
  const slideB = c.still ? 0 : (1 - c.bIn) * size * 0.35;
  ctx.globalAlpha = c.alpha * c.aIn;
  ctx.fillStyle = c.colorA || '#ffffff';
  ctx.fillText(c.a, x0 + shift + nudge, y);
  ctx.globalAlpha = c.alpha * c.bIn;
  ctx.fillStyle = c.colorB || RED;
  ctx.fillText(c.b, x0 + wA + gap + slideB, y);
  ctx.restore();
}

function drawSheen(sh) {
  if (!sh || sh.alpha <= 0) return;
  // Mask render: product in white on black, same camera, no lighting.
  const bg = scene.background, tm = renderer.toneMapping;
  scene.background = new THREE.Color('#000000');
  scene.overrideMaterial = maskMat;
  wall.visible = false;
  const shadows = renderer.shadowMap.enabled;
  renderer.shadowMap.enabled = false;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.render(scene, camera);
  renderer.toneMapping = tm;
  renderer.shadowMap.enabled = shadows;
  scene.overrideMaterial = null;
  scene.background = bg;
  wall.visible = true;

  const g = sheenCtx;
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#000';
  g.fillRect(0, 0, W, H);
  // Diagonal band across the frame, position 0..1 along its travel.
  const ang = sh.angle;
  const dx = Math.cos(ang), dy = Math.sin(ang);
  const L = Math.hypot(W, H);
  const cx = W / 2 + (sh.pos - 0.5) * L * dx, cy = H / 2 + (sh.pos - 0.5) * L * dy;
  const half = sh.width * L / 2;
  const grad = g.createLinearGradient(cx - dx * half, cy - dy * half, cx + dx * half, cy + dy * half);
  grad.addColorStop(0, 'rgba(255,248,238,0)');
  grad.addColorStop(0.42, 'rgba(255,248,238,0.55)');
  grad.addColorStop(0.5, 'rgba(255,250,244,1)');
  grad.addColorStop(0.58, 'rgba(255,248,238,0.55)');
  grad.addColorStop(1, 'rgba(255,248,238,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  // Keep only where the product is (mask luminance → alpha via multiply).
  g.globalCompositeOperation = 'multiply';
  g.drawImage(renderer.domElement, 0, 0);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = sh.alpha;
  ctx.drawImage(sheenCanvas, 0, 0);
  ctx.restore();
}

function post(s) {
  ctx.globalAlpha = 1;
  ctx.drawImage(renderer.domElement, 0, 0);
  drawSheen(s.sheen);
  // Soft vignette keeps the eye on the piece.
  const g = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.35, W * 0.5, H * 0.5, Math.hypot(W, H) * 0.62);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  drawCopy(s.copy);
  if (s.fade > 0) {
    ctx.fillStyle = `rgba(0,0,0,${s.fade})`;
    ctx.fillRect(0, 0, W, H);
  }
}

window.renderAt = (t, fmt = 'image/png', overrides = null) => {
  const s = timeline(t, { aspect: W / H, layers: P.layers.length, caps: P.caps.length, capXY: P.caps.map((c) => [c.userData.base.x, c.userData.base.y]) });
  if (overrides) Object.assign(s, overrides);
  apply(s);
  if (composer) composer.render(); else renderer.render(scene, camera);
  post(s);
  return comp.toDataURL(fmt, 0.95);
};
