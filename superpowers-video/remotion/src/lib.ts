import {Easing, spring} from 'remotion';
import timeline from './timeline.json';

export const FPS = 60;
export const W = 1080;
export const H = 1920;

export type Word = {text: string; start: number; end: number};
export const TL = timeline as unknown as {
	fps: number;
	durationInFrames: number;
	total: number;
	speechEnd: number;
	words: Word[];
	srcFrame: number[];
	face: {cx: number[]; cy: number[]; h: number[]; top: number[]};
};

// ---- key beats (output-timeline seconds), all derived from the word timings
const w = (i: number) => TL.words[i];
export const T = {
	newWord: w(3).start, // "new"
	github: w(4).start, // "GitHub"
	repo: w(5).start, // "repository"
	superpowers: w(6).start, // "Superpowers"
	cutAB: 3.38,
	builds: w(9).start,
	agentic: w(10).start,
	agents: w(11).start,
	cutBC: 5.96,
	claude: w(15).start,
	ten: w(17).start,
	times: w(18).start,
	smarter: w(19).start,
	speechEnd: TL.speechEnd,
	outro: TL.speechEnd - 0.25,
	total: TL.total,
};

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const E = {
	outCubic: Easing.out(Easing.cubic),
	inCubic: Easing.in(Easing.cubic),
	inOutCubic: Easing.inOut(Easing.cubic),
	outExpo: Easing.out(Easing.exp),
	inExpo: Easing.in(Easing.exp),
	outBack: Easing.out(Easing.back(1.6)),
	inBack: Easing.in(Easing.back(1.6)),
	inOutSine: Easing.inOut(Easing.sin),
	outQuint: Easing.out(Easing.poly(5)),
	linear: (x: number) => x,
};
/** eased 0..1 progress of time t between a and b */
export const prog = (t: number, a: number, b: number, e: (x: number) => number = E.inOutCubic) =>
	e(clamp((t - a) / (b - a)));

export type SpringCfg = {damping?: number; stiffness?: number; mass?: number; overshootClamping?: boolean};
/** spring that starts at time `at` (seconds) */
export const spr = (frame: number, at: number, cfg: SpringCfg = {}) => {
	const f = frame - Math.round(at * FPS);
	if (f <= 0) return 0;
	return spring({frame: f, fps: FPS, config: {damping: 14, stiffness: 120, mass: 1, ...cfg}});
};

/** smooth pseudo-noise in [-1, 1] */
export const noise = (t: number, seed = 0) =>
	0.5 * Math.sin(t * 13.1 + seed * 1.7) + 0.3 * Math.sin(t * 27.7 + 1.3 + seed * 2.9) + 0.2 * Math.sin(t * 41.3 + 2.1 + seed * 0.7);

/** deterministic hash-random in [0,1) */
export const rnd = (i: number, seed = 1) => {
	const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
	return x - Math.floor(x);
};

export const pad4 = (n: number) => String(n).padStart(4, '0');

export const FONT = {
	ui: "'Inter', system-ui, sans-serif",
	display: "'Anton', 'Inter', sans-serif",
	mono: "'JetBrains Mono', monospace",
	grotesk: "'Space Grotesk', 'Inter', sans-serif",
};

export const C = {
	cyan: '#22D3EE',
	violet: '#A78BFA',
	violetDeep: '#7C3AED',
	pink: '#F472B6',
	gold: '#FFD34E',
	orange: '#FF8A5B',
	claude: '#D97757',
	ghBg: '#0d1117',
	ghCard: '#161b22',
	ghBorder: '#30363d',
	ghText: '#e6edf3',
	ghMuted: '#8b949e',
	ghLink: '#4493f8',
	ghGreen: '#238636',
};

export const SUPER_GRADIENT = `linear-gradient(90deg, ${C.cyan} 0%, ${C.violet} 45%, ${C.pink} 100%)`;
export const GOLD_GRADIENT = 'linear-gradient(180deg, #FFF6C8 0%, #FFE066 28%, #FFB627 62%, #FF8A00 100%)';
