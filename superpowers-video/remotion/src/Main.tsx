import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {camera, shake} from './camera';
import {Captions} from './captions';
import {Footage, Person, rgbSplit} from './footage';
import {Dim, FadeOut, Flash, Grain, LightLeaks, ProgressBar, Vignette} from './fx';
import {C, FPS, T, clamp, prog, spr} from './lib';
import {AgentNetwork, GitHubCard, NewPill, OutroBG, OutroText, Smarter, SpeedLines, SuperTitle, TenX, Terminal, TopScrim} from './scenes';

export const Main: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const cam = camera(frame);
	const sh = shake(frame);

	// outro: the whole edit shrinks into a floating card
	const o = spr(frame, T.outro, {damping: 17, stiffness: 95, mass: 1});
	const scale = 1 - 0.47 * o;
	const float = o * Math.sin((t - T.outro) * 1.6) * 6;
	const radius = (64 * o) / scale;

	// camera roll (around the face) — overscan so rotated corners never show
	const rotWrap: React.CSSProperties = {
		transformOrigin: `${cam.fx}px ${cam.fy}px`,
		transform: `rotate(${cam.rot}deg) scale(${1 + 0.034 * Math.abs(cam.rot)})`,
	};

	const superWin = t >= T.superpowers - 0.05 && t < T.cutAB;
	const tenWin = t >= 7.6 && t < T.outro + 0.1;
	const glowK = superWin
		? prog(t, T.superpowers, T.superpowers + 0.15) * (1 - prog(t, T.cutAB - 0.12, T.cutAB))
		: tenWin
			? prog(t, T.ten, T.ten + 0.12) * (1 - prog(t, T.outro - 0.2, T.outro + 0.05))
			: 0;
	const glow = superWin
		? `drop-shadow(0 0 22px rgba(167,139,250,${0.95 * glowK})) drop-shadow(0 0 70px rgba(34,211,238,${0.5 * glowK}))`
		: `drop-shadow(0 0 20px rgba(255,205,80,${0.95 * glowK})) drop-shadow(0 0 80px rgba(255,120,20,${0.55 * glowK}))`;
	const split = rgbSplit(t);
	const personFilter = [split > 0.4 ? 'url(#rgbsplit)' : '', glowK > 0.01 ? glow : ''].join(' ').trim() || undefined;

	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			<OutroBG frame={frame} />
			<AbsoluteFill
				style={{
					transform: `translateY(${-285 * o + float}px) scale(${scale}) rotate(${o * -1.2}deg)`,
					borderRadius: radius,
					overflow: 'hidden',
					boxShadow: o > 0.01 ? `0 0 0 ${5 / scale}px rgba(255,255,255,${0.22 * o}), 0 60px 140px rgba(0,0,0,${0.7 * o}), 0 0 120px rgba(167,139,250,${0.45 * o})` : undefined,
				}}
			>
				<AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg) scale(${1 + clamp(Math.abs(sh.x) + Math.abs(sh.y), 0, 60) / 540})`}}>
					<AbsoluteFill style={rotWrap}>
						<Footage frame={frame} cam={cam} />
					</AbsoluteFill>
					<Dim t={t} />
					<TopScrim frame={frame} />
					<SpeedLines frame={frame} cx={cam.fx} cy={cam.fy - 60} />
					{/* graphics that sit BEHIND the subject */}
					<SuperTitle frame={frame} />
					<TenX frame={frame} />
					{(superWin || tenWin) && (
						<AbsoluteFill style={rotWrap}>
							<Person frame={frame} cam={cam} glow={personFilter} />
						</AbsoluteFill>
					)}
					{/* graphics in front */}
					<GitHubCard frame={frame} />
					<NewPill frame={frame} />
					<AgentNetwork frame={frame} />
					<Terminal frame={frame} />
					<Smarter frame={frame} />
					<Captions frame={frame} />
					<LightLeaks t={t} />
					<Flash t={t} />
				</AbsoluteFill>
				<Vignette strength={0.42 * (1 - o)} />
			</AbsoluteFill>
			<OutroText frame={frame} />
			<Vignette strength={0.3} />
			<Grain frame={frame} />
			<ProgressBar t={t} />
			<FadeOut t={t} />
		</AbsoluteFill>
	);
};

export const _unused = C;
