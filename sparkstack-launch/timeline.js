// Beat timeline for the SparkStack launch film.
// 100 BPM → beat = 0.6 s, bar = 2.4 s. Every hit below sits on that grid so the
// synthesized score (music.py) lands on the same frames.
export const BPM = 100;
export const BEAT = 60 / BPM;
export const DURATION = 15.0;

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
const easeOutBack = (t) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const win = (t, t0, dur) => clamp((t - t0) / dur);

// ---- Assembly -------------------------------------------------------------
// Layers land bottom-first on straight 8th notes: pickup at 2.1 s, the top
// layer (Layer_01) lands on the bar-3 downbeat at 4.8 s.
export const LAND = Array.from({ length: 10 }, (_, b) => 2.1 + b * (BEAT / 2));
const FLIGHT = 0.85;
const explodedZ = (b) => 0.075 + b * 0.05;

function layerState(t, i, n) {
  const b = n - 1 - i; // 0 = Layer_10 (against the backplate), 9 = Layer_01 (face)
  const land = LAND[b];
  const u = win(t, land - FLIGHT, FLIGHT);
  const k = easeInOutCubic(u); // 0 = exploded, 1 = seated on the standoffs
  // While hovering the whole stack breathes slowly toward the wall.
  const hover = explodedZ(b) * (1 - 0.1 * easeInOutSine(clamp(t / 2.4)));
  const drift = (1 - k);
  let z = hover * (1 - k);
  const dt = t - land;
  if (dt > 0) z += 0.0011 * Math.exp(-14 * dt) * Math.sin(34 * dt); // seating "click"
  return {
    x: drift * 0.006 * Math.sin(0.9 * t + b * 1.7),
    y: drift * 0.006 * Math.cos(0.8 * t + b * 2.3),
    z,
    rx: drift * 0.05 * Math.sin(0.7 * t + b),
    ry: drift * 0.07 * Math.cos(0.6 * t + b * 0.8),
    rz: drift * 0.035 * Math.sin(0.5 * t + b * 1.3),
    // Pieces converge into the layer outline slightly ahead of the layer seating.
    scatter: 1 - easeInOutCubic(win(t, land - FLIGHT - 0.15, FLIGHT)),
  };
}

// Caps ripple out from the centre in the half-beat after the final layer lands.
function capState(t, xy) {
  const d = Math.hypot(xy[0], xy[1] * 1.3) / 0.27;
  return easeOutBack(win(t, 4.86 + 0.42 * clamp(d), 0.22));
}

// ---- Camera -----------------------------------------------------------------
// Keys are spherical around a target: az (deg, 0 = straight on, + = from the
// right), el (deg), dist (m). Hermite interpolation keeps velocity continuous
// through keys inside a shot; shot boundaries are hard cuts on the beat.
const SHOTS = [
  { // S1 — close in the floating pieces, pull back to reveal the cloud, orbit through assembly
    t0: 0, t1: 6.0, keys: [
      { t: 0.0, az: -26, el: 5, dist: 0.62, tgt: [-0.04, 0.04, 0.33], fov: 30 },
      { t: 2.4, az: -46, el: 10, dist: 1.42, tgt: [0.02, 0.0, 0.2], fov: 30 },
      { t: 4.8, az: 16, el: 4, dist: 1.2, tgt: [0.0, 0.0, 0.03], fov: 30 },
      { t: 6.0, az: 22, el: 3, dist: 1.15, tgt: [0.0, 0.0, 0.03], fov: 30 },
    ],
  },
  { // S2 — raking view from the right: stepped layers, standoffs, cast shadows
    t0: 6.0, t1: 8.4, keys: [
      { t: 6.0, az: 60, el: 7, dist: 0.36, tgt: [0.235, 0.0, 0.025], fov: 32 },
      { t: 8.4, az: 53, el: 3, dist: 0.33, tgt: [0.225, -0.1, 0.025], fov: 32 },
    ],
  },
  { // S3 — mirror move from the left, drifting across the eye and its cut edges
    t0: 8.4, t1: 10.8, keys: [
      { t: 8.4, az: -46, el: 8, dist: 0.31, tgt: [-0.235, 0.12, 0.03], fov: 34 },
      { t: 10.8, az: -40, el: 4, dist: 0.29, tgt: [-0.235, 0.05, 0.03], fov: 34 },
    ],
  },
  { // S4 — hero: arc to straight-on, hold for the closing copy
    t0: 10.8, t1: 15.0, keys: [
      { t: 10.8, az: 34, el: -10, dist: 0.7, tgt: [0.12, 0.0, 0.03], fov: 30 },
      { t: 12.0, az: 4, el: 1, dist: 1.02, tgt: [0.155, 0.0, 0.02], fov: 30 },
      { t: 15.0, az: 0, el: 0, dist: 0.98, tgt: [0.155, 0.0, 0.02], fov: 30 },
    ],
  },
];

function hermite(keys, t, field) {
  const n = keys.length;
  if (t <= keys[0].t) return keys[0][field];
  if (t >= keys[n - 1].t) return keys[n - 1][field];
  let i = 0;
  while (t > keys[i + 1].t) i++;
  const k0 = keys[i], k1 = keys[i + 1];
  const h = k1.t - k0.t;
  const s = (t - k0.t) / h;
  const slope = (j) => {
    const a = keys[Math.max(0, j - 1)], c = keys[Math.min(n - 1, j + 1)];
    if (a === c) return 0;
    return (c[field] - a[field]) / (c.t - a.t);
  };
  // First key of each shot starts moving (no dead start); last key brakes to rest.
  const m0 = i === 0 ? (k1[field] - k0[field]) / h * 0.9 : slope(i);
  const m1 = i + 1 === n - 1 ? 0 : slope(i + 1);
  const s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * k0[field] + (s3 - 2 * s2 + s) * h * m0 + (-2 * s3 + 3 * s2) * k1[field] + (s3 - s2) * h * m1;
}

function cameraAt(t, aspect) {
  const shot = SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
  const keys = shot.keys.map((k) => ({ ...k, tx: k.tgt[0], ty: k.tgt[1], tz: k.tgt[2] }));
  const f = (name) => hermite(keys, t, name);
  const az = (f('az') * Math.PI) / 180, el = (f('el') * Math.PI) / 180, dist = f('dist');
  const tgt = [f('tx'), f('ty'), f('tz')];
  const cam = [tgt[0] + dist * Math.cos(el) * Math.sin(az), tgt[1] + dist * Math.sin(el), tgt[2] + dist * Math.cos(el) * Math.cos(az)];
  // Narrower frames need a wider lens to keep the same horizontal coverage.
  const fov = aspect >= 1 ? f('fov') : f('fov') * 1.0;
  return { cam, target: tgt, fov, shot: SHOTS.indexOf(shot) };
}

// ---- Copy -------------------------------------------------------------------
// One single-line, two-part line at a time. First half in white, second half in
// the piece's red. Positions are fractions of the frame, vertically centred zone.
const COPY = [
  { a: 'Ten layers', b: 'of depth', tA: 6.3, tB: 6.9, tOut: 8.05, x: 0.93, y: 0.5, align: 'right' },
  { a: 'Cut by', b: 'light', tA: 8.7, tB: 9.3, tOut: 10.45, x: 0.07, y: 0.5, align: 'left' },
  { a: 'Built from', b: 'a spark', tA: 12.3, tB: 12.9, tOut: 13.8, x: 0.9, y: 0.5, align: 'right', outDur: 0.18 },
  { a: 'sparkstack', b: '.com', tA: 14.0, tB: 14.3, tOut: 99, x: 0.9, y: 0.5, align: 'right', gap: 0, still: true },
];

function copyAt(t) {
  for (const c of COPY) {
    if (t < c.tA || t >= c.tOut + (c.outDur ?? 0.3)) continue;
    return {
      ...c,
      size: 0.058,
      aIn: easeOutCubic(win(t, c.tA, 0.5)),
      bIn: easeOutCubic(win(t, c.tB, 0.5)),
      aShift: easeOutCubic(win(t, c.tB, 0.38)),
      alpha: 1 - win(t, c.tOut, c.outDur ?? 0.3),
    };
  }
  return null;
}

// ---- Light --------------------------------------------------------------------
// A warm point light glides across the face as the edge highlight: through the
// hovering pieces in S1, along the macro in S3, and across the hero reveal in S4.
function sweepAt(t) {
  const sweeps = [
    { t0: 0.0, dur: 2.6, from: [-0.35, 0.2, 0.34], to: [0.3, -0.1, 0.3], peak: 0.9 },
  ];
  for (const s of sweeps) {
    const u = win(t, s.t0, s.dur);
    if (u > 0 && u < 1) {
      const e = easeInOutSine(u);
      return { intensity: s.peak * Math.sin(Math.PI * u), pos: s.from.map((v, j) => lerp(v, s.to[j], e)) };
    }
  }
  return { intensity: 0, pos: [0, 0, 0.3] };
}

// Sheen band glides across the acrylic face: over the eye in S3, across the
// whole piece as the hero lands in S4 (peak on the bar-6 downbeat at 12.0 s).
function sheenAt(t) {
  const sheens = [
    { t0: 8.5, dur: 2.2, from: 0.3, to: 0.85, peak: 0.28, width: 0.16, angle: 0.5 },
    { t0: 11.1, dur: 1.9, from: 0.12, to: 0.95, peak: 0.5, width: 0.11, angle: 0.42 },
  ];
  for (const s of sheens) {
    const u = win(t, s.t0, s.dur);
    if (u > 0 && u < 1) {
      return { pos: lerp(s.from, s.to, easeInOutSine(u)), alpha: s.peak * Math.pow(Math.sin(Math.PI * u), 0.5), width: s.width, angle: s.angle };
    }
  }
  return null;
}

export function timeline(t, info) {
  const { cam, target, fov, shot } = cameraAt(t, info.aspect);
  const layers = Array.from({ length: info.layers }, (_, i) => layerState(t, i, info.layers));
  // Brief exposure lift on the two peaks (final layer seats; hero reveal lands).
  const pulse = 0.07 * Math.exp(-6 * Math.max(0, t - 4.8)) * (t >= 4.8 ? 1 : 0) + 0.03 * Math.exp(-5 * Math.max(0, t - 12.0)) * (t >= 12.0 ? 1 : 0);
  return {
    fov, cam, target, roll: 0, shot,
    layers,
    rodScale: 1,
    caps: info.capXY.map((xy) => capState(t, xy)),
    key: 26,
    sweep: sweepAt(t),
    sheen: sheenAt(t),
    exposure: 1.0 + pulse,
    copy: copyAt(t),
    fade: 1 - easeOutCubic(win(t, 0, 0.35)),
  };
}
