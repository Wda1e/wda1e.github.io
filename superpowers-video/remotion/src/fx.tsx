import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {FPS, H, T, W, clamp, prog} from './lib';

export const Grain: React.FC<{frame: number}> = ({frame}) => (
	<AbsoluteFill style={{mixBlendMode: 'overlay', opacity: 0.11, pointerEvents: 'none'}}>
		<Img src={staticFile(`grain/${Math.floor(frame / 2) % 8}.png`)} style={{width: W, height: H, imageRendering: 'auto'}} />
	</AbsoluteFill>
);

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.42}) => (
	<AbsoluteFill
		style={{
			background: `radial-gradient(ellipse 75% 60% at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`,
			pointerEvents: 'none',
		}}
	/>
);

/** white flash envelopes on hits and cuts */
export const Flash: React.FC<{t: number}> = ({t}) => {
	const f = (at: number, peak: number, dur: number) => (t >= at && t < at + dur ? peak * Math.pow(1 - (t - at) / dur, 2) : 0);
	const o = f(0, 0.9, 0.22) + f(T.superpowers, 0.55, 0.18) + f(T.cutAB, 0.3, 0.1) + f(T.cutBC, 0.3, 0.1) + f(T.ten, 0.95, 0.26);
	if (o <= 0.001) return null;
	return <AbsoluteFill style={{backgroundColor: '#fff', opacity: clamp(o), mixBlendMode: 'screen'}} />;
};

/** warm film light-leaks sweeping across on transitions */
export const LightLeaks: React.FC<{t: number}> = ({t}) => {
	const leaks = [
		{at: -0.05, dur: 0.85, from: -500, to: 900, y: 500, c1: 'rgba(255,140,40,0.95)', c2: 'rgba(255,60,120,0.6)'},
		{at: T.cutAB - 0.1, dur: 0.5, from: 1300, to: -300, y: 1300, c1: 'rgba(130,90,255,0.9)', c2: 'rgba(34,211,238,0.5)'},
		{at: T.cutBC - 0.1, dur: 0.5, from: -300, to: 1300, y: 700, c1: 'rgba(255,120,60,0.9)', c2: 'rgba(255,200,60,0.5)'},
		{at: T.outro - 0.05, dur: 0.9, from: 1400, to: -400, y: 900, c1: 'rgba(167,139,250,0.9)', c2: 'rgba(244,114,182,0.6)'},
	];
	return (
		<>
			{leaks.map((l, i) => {
				const p = (t - l.at) / l.dur;
				if (p < 0 || p > 1) return null;
				const x = l.from + (l.to - l.from) * p;
				const o = Math.sin(Math.PI * p);
				return (
					<AbsoluteFill key={i} style={{mixBlendMode: 'screen', opacity: 0.75 * o, pointerEvents: 'none'}}>
						<div
							style={{
								position: 'absolute',
								left: x - 700,
								top: l.y - 900,
								width: 1400,
								height: 1800,
								background: `radial-gradient(closest-side, ${l.c1}, ${l.c2} 45%, rgba(0,0,0,0) 100%)`,
								filter: 'blur(40px)',
								transform: `rotate(${20 + p * 25}deg)`,
							}}
						/>
					</AbsoluteFill>
				);
			})}
		</>
	);
};

export const ProgressBar: React.FC<{t: number}> = ({t}) => {
	const p = clamp(t / T.total);
	const intro = prog(t, 0.1, 0.5, (x) => 1 - Math.pow(1 - x, 3));
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: W, height: 12, opacity: intro}}>
			<div style={{position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.14)'}} />
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					height: 12,
					width: W * p,
					background: 'linear-gradient(90deg, #22D3EE, #A78BFA 40%, #F472B6 70%, #FFD34E)',
					backgroundSize: `${W}px 12px`,
					boxShadow: '0 0 18px rgba(167,139,250,0.9), 0 0 36px rgba(34,211,238,0.5)',
					borderRadius: '0 6px 6px 0',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: W * p - 9,
					top: -3,
					width: 18,
					height: 18,
					borderRadius: 9,
					background: '#fff',
					boxShadow: '0 0 16px 4px rgba(255,255,255,0.9)',
				}}
			/>
		</div>
	);
};

/** darkens + tints everything behind the subject during hero moments */
export const Dim: React.FC<{t: number}> = ({t}) => {
	const sp = t < T.cutAB ? prog(t, T.superpowers - 0.02, T.superpowers + 0.12) * (1 - prog(t, T.cutAB - 0.1, T.cutAB)) : 0;
	const tx = prog(t, T.ten - 0.02, T.ten + 0.1) * (1 - prog(t, T.outro - 0.1, T.outro + 0.15));
	if (sp + tx < 0.002) return null;
	return (
		<>
			{sp > 0 && (
				<AbsoluteFill
					style={{
						opacity: sp,
						background: 'radial-gradient(ellipse 90% 70% at 50% 35%, rgba(60,20,140,0.55), rgba(8,4,24,0.86) 70%)',
					}}
				/>
			)}
			{tx > 0 && (
				<AbsoluteFill
					style={{
						opacity: tx,
						background: 'radial-gradient(ellipse 90% 70% at 50% 30%, rgba(120,60,0,0.55), rgba(12,6,0,0.88) 72%)',
					}}
				/>
			)}
		</>
	);
};

export const FadeOut: React.FC<{t: number}> = ({t}) => {
	const o = prog(t, T.total - 0.45, T.total - 0.02, (x) => x * x);
	if (o <= 0) return null;
	return <AbsoluteFill style={{backgroundColor: '#000', opacity: o}} />;
};

export const Particles: React.FC<{
	t: number;
	at: number;
	until: number;
	count: number;
	cx: number;
	cy: number;
	spread: number;
	colors: string[];
	seed: number;
	rise?: number;
}> = ({t, at, until, count, cx, cy, spread, colors, seed, rise = 420}) => {
	if (t < at || t > until + 1) return null;
	const fade = 1 - prog(t, until, until + 0.25);
	return (
		<>
			{Array.from({length: count}).map((_, i) => {
				const r = (k: number) => {
					const x = Math.sin((i + 1) * 91.7 + seed * 13.3 + k * 7.1) * 43758.5453;
					return x - Math.floor(x);
				};
				const life = 0.6 + r(1) * 0.7;
				const born = at + r(2) * (until - at) * 0.7;
				const p = (t - born) / life;
				if (p < 0 || p > 1) return null;
				const ang = (r(3) - 0.5) * Math.PI * 1.2 - Math.PI / 2;
				const dist = rise * (0.4 + r(4) * 0.8) * (1 - Math.pow(1 - p, 2));
				const x = cx + (r(5) - 0.5) * spread + Math.cos(ang) * dist * 0.6;
				const y = cy + Math.sin(ang) * dist;
				const s = 4 + r(6) * 9;
				const c = colors[i % colors.length];
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x - s / 2,
							top: y - s / 2,
							width: s,
							height: s,
							borderRadius: s,
							background: c,
							boxShadow: `0 0 ${s * 2}px ${s * 0.6}px ${c}`,
							opacity: fade * Math.sin(Math.PI * p),
						}}
					/>
				);
			})}
		</>
	);
};

export const tAt = (frame: number) => frame / FPS;
