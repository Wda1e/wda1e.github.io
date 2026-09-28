import {E, FPS, H, SpringCfg, T, TL, W, clamp, lerp, noise, spr} from './lib';

type Key = {t: number; v: number; kind: 'spring' | 'cut' | 'ramp'; d?: number; cfg?: SpringCfg; e?: (x: number) => number};

/** additive key chain: each key moves the value from the previous key's target to its own */
const chain = (keys: Key[], v0: number, frame: number) => {
	const t = frame / FPS;
	let v = v0;
	let prev = v0;
	for (const k of keys) {
		const delta = k.v - prev;
		prev = k.v;
		if (t < k.t) continue;
		let p = 1;
		if (k.kind === 'ramp') p = (k.e ?? E.inOutSine)(clamp((t - k.t) / (k.d ?? 1)));
		else if (k.kind === 'spring') p = spr(frame, k.t, k.cfg);
		v += delta * p;
	}
	return v;
};

const PUNCH: SpringCfg = {damping: 11, stiffness: 260, mass: 0.7};
const SLAM: SpringCfg = {damping: 10, stiffness: 320, mass: 0.6};

const ZOOM: Key[] = [
	{t: 0, v: 1.08, kind: 'spring', cfg: {damping: 20, stiffness: 70, mass: 1}}, // intro reveal
	{t: 0.8, v: 1.15, kind: 'ramp', d: 1.6},
	{t: T.superpowers, v: 1.3, kind: 'spring', cfg: PUNCH},
	{t: T.superpowers + 0.45, v: 1.33, kind: 'ramp', d: T.cutAB - T.superpowers - 0.45, e: E.linear},
	{t: T.cutAB, v: 1.07, kind: 'cut'},
	{t: T.cutAB, v: 1.14, kind: 'ramp', d: T.cutBC - T.cutAB, e: E.linear},
	{t: T.cutBC, v: 1.2, kind: 'cut'},
	{t: T.cutBC, v: 1.25, kind: 'ramp', d: T.ten - T.cutBC, e: E.linear},
	{t: T.ten, v: 1.36, kind: 'spring', cfg: SLAM},
	{t: T.ten + 0.45, v: 1.29, kind: 'ramp', d: 1.2, e: E.inOutSine},
];

const ROT: Key[] = [
	{t: T.superpowers, v: -1.4, kind: 'spring', cfg: PUNCH},
	{t: T.cutAB, v: 0, kind: 'cut'},
	{t: T.ten, v: 1.1, kind: 'spring', cfg: SLAM},
	{t: T.ten + 0.6, v: 0, kind: 'ramp', d: 1.0},
];

const zoomAt = (frame: number) => chain(ZOOM, 1.42, frame);

export const shakeAmp = (t: number) => {
	const hit = (at: number, amp: number, tau: number) => (t >= at ? amp * Math.exp(-(t - at) / tau) : 0);
	return hit(0, 8, 0.15) + hit(T.superpowers, 16, 0.16) + hit(T.ten, 30, 0.22) + hit(T.smarter, 9, 0.15);
};

export type Cam = {z: number; tx: number; ty: number; rot: number; zVel: number; fx: number; fy: number};

export const camera = (frame: number): Cam => {
	const t = frame / FPS;
	const z = zoomAt(frame);
	const zVel = (zoomAt(frame + 1) - zoomAt(frame - 1)) * FPS * 0.5;
	const f = clamp(frame, 0, TL.durationInFrames - 1);
	const fx = TL.face.cx[f] * W;
	const fy = TL.face.cy[f] * H;
	// the tighter we zoom, the more we frame the face to a fixed "rule-of-thirds" anchor
	const k = clamp((z - 1) / 0.25) * 0.9;
	const px = lerp(fx, W * 0.5, k);
	const py = lerp(fy, H * 0.53, k);
	let tx = clamp(px - fx * z, W - W * z, 0);
	let ty = clamp(py - fy * z, H - H * z, 0);
	const rot = chain(ROT, 0, frame);
	return {z, tx, ty, rot, zVel, fx: px, fy: py};
};

/** screen-space shake for the whole frame */
export const shake = (frame: number) => {
	const t = frame / FPS;
	const a = shakeAmp(t);
	return {x: a * noise(t * 3.1, 1), y: a * noise(t * 3.1, 2), r: a * 0.03 * noise(t * 2.3, 3)};
};
