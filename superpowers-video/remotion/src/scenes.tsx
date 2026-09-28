import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Particles} from './fx';
import {Asterisk, Bolt, CodeIcon, Cursor, ForkIcon, GitHubMark, RepoIcon, Robot, Sparkle, StarIcon} from './icons';
import {C, E, FONT, FPS, GOLD_GRADIENT, H, T, W, clamp, lerp, prog, rnd, spr} from './lib';

type SP = {frame: number};
const tOf = (frame: number) => frame / FPS;
const typed = (s: string, t: number, at: number, per: number) => s.slice(0, clamp(Math.floor((t - at) / per) + 1, 0, s.length) * (t >= at ? 1 : 0));
const caretOn = (t: number) => Math.floor(t * 3.2) % 2 === 0;
const bump = (t: number, at: number, w = 0.12) => (t >= at ? Math.exp(-(t - at) / w) * (1 - Math.exp(-(t - at) / 0.015)) : 0);

// ---------------------------------------------------------------- scrim
export const TopScrim: React.FC<SP> = ({frame}) => {
	const t = tOf(frame);
	const win = (a: number, b: number) => prog(t, a, a + 0.18) * (1 - prog(t, b - 0.12, b));
	const o = Math.max(win(T.github - 0.05, T.superpowers + 0.05), win(T.builds - 0.1, T.cutBC), win(6.5, T.ten));
	if (o <= 0.001) return null;
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				width: W,
				height: 760,
				opacity: o,
				background: 'linear-gradient(180deg, rgba(6,8,22,0.72) 0%, rgba(6,8,22,0.45) 45%, rgba(6,8,22,0) 100%)',
			}}
		/>
	);
};

// ---------------------------------------------------------------- NEW pill -> card badge
const CARD = {x: 90, y: 150, w: 900, h: 330};
const cardExit = (t: number) => prog(t, T.superpowers - 0.18, T.superpowers + 0.02, E.inCubic);

export const NewPill: React.FC<SP> = ({frame}) => {
	const t = tOf(frame);
	if (t < T.newWord - 0.05 || t > T.superpowers + 0.05) return null;
	const s = spr(frame, T.newWord - 0.04, {damping: 10, stiffness: 210, mass: 0.7});
	const m = spr(frame, T.github - 0.02, {damping: 16, stiffness: 150});
	const x = lerp(540, CARD.x + CARD.w - 70, m);
	const y = lerp(330, CARD.y + 8, m);
	const q = cardExit(t);
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				transform: `translate(-50%, -50%) scale(${s * lerp(1.25, 0.8, m) * (1 + 0.1 * q)}) rotate(${(1 - s) * -16 + m * 6}deg)`,
				opacity: clamp(s * 2) * (1 - q),
				filter: q > 0 ? `blur(${q * 12}px)` : undefined,
				zIndex: 5,
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 10,
					padding: '12px 30px 12px 24px',
					borderRadius: 999,
					background: 'linear-gradient(135deg, #2ea043, #56d364)',
					boxShadow: '0 12px 34px rgba(46,160,67,0.6), inset 0 2px 0 rgba(255,255,255,0.35)',
					fontFamily: FONT.ui,
					fontWeight: 900,
					fontSize: 46,
					letterSpacing: '0.08em',
					color: '#fff',
				}}
			>
				<Sparkle size={34} color="#fff" style={{transform: `rotate(${t * 180}deg)`}} />
				NEW
			</div>
		</div>
	);
};

// ---------------------------------------------------------------- GitHub card
const Btn: React.FC<{left: number; width: number; s: number; children: React.ReactNode; style?: React.CSSProperties}> = ({left, width, s, children, style}) => (
	<div
		style={{
			position: 'absolute',
			left,
			top: 232,
			width,
			height: 68,
			borderRadius: 14,
			background: '#21262d',
			border: `2px solid ${C.ghBorder}`,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 12,
			fontFamily: FONT.ui,
			fontWeight: 700,
			fontSize: 30,
			color: '#c9d1d9',
			transform: `translateY(${(1 - s) * 30}px) scale(${0.8 + 0.2 * s})`,
			opacity: clamp(s * 2),
			...style,
		}}
	>
		{children}
	</div>
);

export const GitHubCard: React.FC<SP> = ({frame}) => {
	const t = tOf(frame);
	if (t < T.github - 0.05 || t > T.superpowers + 0.05) return null;
	const e = spr(frame, T.github - 0.02, {damping: 15, stiffness: 150, mass: 0.9});
	const q = cardExit(t);
	const full = 'obra/superpowers';
	const n = typed(full, t, T.repo + 0.02, 0.021).length;
	const owner = full.slice(0, Math.min(n, 4));
	const slash = n > 4;
	const name = full.slice(5, Math.max(5, n));
	const STAR_T = 2.03;
	const starred = t >= STAR_T;
	const sb = bump(t, STAR_T, 0.14);
	const b = (i: number) => spr(frame, T.github + 0.22 + i * 0.07, {damping: 13, stiffness: 190});
	// cursor path
	const cp = prog(t, 1.66, 1.99, E.outCubic);
	const cx = lerp(1010, CARD.x + 40 + 95 + 8, cp);
	const cy = lerp(760, CARD.y + 232 + 34 + 10, cp) - Math.sin(cp * Math.PI) * 90;
	const press = bump(t, STAR_T - 0.02, 0.08);
	const cursorO = prog(t, 1.66, 1.74) * (1 - prog(t, 2.2, 2.34));
	const ripple = prog(t, STAR_T, STAR_T + 0.4, E.outCubic);
	const starX = CARD.x + 40 + 42;
	const starY = CARD.y + 232 + 34;
	return (
		<>
			<div
				style={{
					position: 'absolute',
					left: CARD.x,
					top: CARD.y,
					width: CARD.w,
					height: CARD.h,
					transformOrigin: '50% 0%',
					transform: `perspective(1400px) translateY(${(1 - e) * -440 - q * 90}px) rotateX(${(1 - e) * 42}deg) scale(${0.9 + 0.1 * e + 0.12 * q})`,
					opacity: clamp(e * 2) * (1 - q),
					filter: q > 0 ? `blur(${q * 14}px)` : undefined,
					borderRadius: 30,
					background: `linear-gradient(180deg, ${C.ghCard}, ${C.ghBg})`,
					border: `2px solid ${starred ? `rgba(227,179,65,${0.35 + 0.5 * sb})` : C.ghBorder}`,
					boxShadow: `0 40px 90px rgba(0,0,0,0.6), 0 0 ${60 * sb}px rgba(227,179,65,${0.6 * sb}), inset 0 1px 0 rgba(255,255,255,0.08)`,
					overflow: 'hidden',
				}}
			>
				{/* header */}
				<div style={{position: 'absolute', left: 40, top: 32, display: 'flex', alignItems: 'center', gap: 18}}>
					<GitHubMark size={58} color="#fff" />
					<div style={{fontFamily: FONT.ui, fontWeight: 800, fontSize: 48, color: '#fff', letterSpacing: '-0.02em'}}>GitHub</div>
				</div>
				<div style={{position: 'absolute', left: 40, top: 116, width: CARD.w - 80, height: 2, background: C.ghBorder}} />
				{/* repo row */}
				<div
					style={{
						position: 'absolute',
						left: 40,
						top: 140,
						height: 64,
						display: 'flex',
						alignItems: 'center',
						gap: 16,
						fontFamily: FONT.ui,
						fontSize: 46,
						color: C.ghLink,
						whiteSpace: 'nowrap',
					}}
				>
					<RepoIcon size={40} color={C.ghMuted} />
					<span style={{fontWeight: 500}}>{owner}</span>
					{slash && <span style={{color: C.ghMuted, fontWeight: 400, margin: '0 -4px'}}>/</span>}
					<span style={{fontWeight: 800}}>{name}</span>
					<span style={{width: 4, height: 46, background: C.ghLink, opacity: n < full.length || caretOn(t) ? 1 : 0, marginLeft: -8}} />
					{n >= full.length && (
						<span
							style={{
								fontSize: 24,
								fontWeight: 600,
								color: C.ghMuted,
								border: `2px solid ${C.ghBorder}`,
								borderRadius: 999,
								padding: '2px 14px',
								transform: `scale(${spr(frame, T.repo + 0.36, {damping: 12, stiffness: 240})})`,
							}}
						>
							Public
						</span>
					)}
				</div>
				{/* buttons */}
				<Btn
					left={40}
					width={206}
					s={b(0)}
					style={{
						transform: `translateY(${(1 - b(0)) * 30}px) scale(${(0.8 + 0.2 * b(0)) * (1 - 0.08 * press + 0.1 * sb)})`,
						borderColor: starred ? '#e3b341' : C.ghBorder,
						color: starred ? '#e3b341' : '#c9d1d9',
					}}
				>
					<StarIcon size={34} filled={starred} color={starred ? '#e3b341' : C.ghMuted} style={{transform: `scale(${1 + 0.6 * sb}) rotate(${sb * 72}deg)`}} />
					{starred ? 'Starred' : 'Star'}
				</Btn>
				<Btn left={266} width={176} s={b(1)}>
					<ForkIcon size={32} color={C.ghMuted} />
					Fork
				</Btn>
				<Btn left={CARD.w - 40 - 214} width={214} s={b(2)} style={{background: C.ghGreen, borderColor: 'rgba(240,246,252,0.1)', color: '#fff'}}>
					<CodeIcon size={32} color="#fff" />
					Code
				</Btn>
			</div>
			{/* click ripple + star burst (screen space) */}
			{t >= STAR_T && t < STAR_T + 0.6 && q < 1 && (
				<>
					<div
						style={{
							position: 'absolute',
							left: starX + 50 - 110 * ripple,
							top: starY - 110 * ripple,
							width: 220 * ripple,
							height: 220 * ripple,
							borderRadius: '50%',
							border: `${6 * (1 - ripple)}px solid rgba(255,255,255,${0.9 * (1 - ripple)})`,
						}}
					/>
					{Array.from({length: 12}).map((_, i) => {
						const p = prog(t, STAR_T, STAR_T + 0.55, E.outCubic);
						const a = (i / 12) * Math.PI * 2 + 0.3;
						const d = 40 + 150 * p * (0.7 + rnd(i, 4) * 0.6);
						return (
							<Sparkle
								key={i}
								size={22 + rnd(i, 5) * 18}
								color={i % 3 === 0 ? '#fff' : '#FFD34E'}
								style={{
									position: 'absolute',
									left: starX + Math.cos(a) * d - 16,
									top: starY + Math.sin(a) * d - 16,
									opacity: 1 - p,
									transform: `rotate(${p * 180}deg) scale(${1 - p * 0.5})`,
									filter: 'drop-shadow(0 0 8px rgba(255,211,78,0.9))',
								}}
							/>
						);
					})}
				</>
			)}
			{cursorO > 0 && (
				<Cursor
					size={86}
					style={{
						position: 'absolute',
						left: cx,
						top: cy,
						opacity: cursorO,
						transform: `scale(${1 - 0.18 * press})`,
						transformOrigin: '12% 8%',
						filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.5))',
					}}
				/>
			)}
		</>
	);
};

// ---------------------------------------------------------------- SUPERPOWERS (behind subject)
const SUPER_COLORS = ['#22D3EE', '#38BDF8', '#60A5FA', '#818CF8', '#A78BFA', '#C084FC', '#D8B4FE', '#E879F9', '#F472B6', '#FB7185', '#F472B6'];

export const SuperTitle: React.FC<SP> = ({frame}) => {
	const t = tOf(frame);
	if (t < T.superpowers - 0.05 || t > T.cutAB + 0.02) return null;
	const q = prog(t, T.cutAB - 0.12, T.cutAB, E.inCubic);
	const letters = 'SUPERPOWERS'.split('');
	const shinePos = lerp(-3, 14, prog(t, T.superpowers + 0.35, T.superpowers + 0.75, E.inOutSine));
	const lab = spr(frame, T.superpowers + 0.14, {damping: 16, stiffness: 160});
	return (
		<AbsoluteFill style={{opacity: 1 - q, transform: `scale(${1 + 0.25 * q})`, filter: q > 0 ? `blur(${q * 14}px)` : undefined}}>
			{/* label */}
			<div
				style={{
					position: 'absolute',
					top: 188,
					left: 0,
					width: W,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					gap: 18,
					opacity: lab,
					transform: `translateY(${(1 - lab) * -30}px)`,
					fontFamily: FONT.grotesk,
					fontWeight: 700,
					fontSize: 34,
					letterSpacing: '0.42em',
					color: 'rgba(255,255,255,0.92)',
					textShadow: '0 0 20px rgba(167,139,250,0.9)',
				}}
			>
				<Bolt size={44} gradient id="lb1" style={{opacity: 0.6 + 0.4 * Math.abs(Math.sin(t * 22))}} />
				<span style={{marginRight: '-0.42em'}}>GITHUB REPO</span>
				<Bolt size={44} gradient id="lb2" style={{opacity: 0.6 + 0.4 * Math.abs(Math.cos(t * 19))}} />
			</div>
			{/* title */}
			<div
				style={{
					position: 'absolute',
					top: 236,
					left: 0,
					width: W,
					textAlign: 'center',
					fontFamily: FONT.display,
					fontSize: 196,
					lineHeight: 1,
					whiteSpace: 'nowrap',
					filter: 'drop-shadow(0 0 26px rgba(167,139,250,0.85)) drop-shadow(0 0 60px rgba(34,211,238,0.35))',
				}}
			>
				{letters.map((ch, i) => {
					const s = spr(frame, T.superpowers + i * 0.026, {damping: 12, stiffness: 200, mass: 0.7});
					const shine = Math.exp(-Math.pow(i - shinePos, 2) / 1.4);
					const c = SUPER_COLORS[i];
					return (
						<span
							key={i}
							style={{
								display: 'inline-block',
								position: 'relative',
								transform: `translateY(${(1 - s) * 180}px) scale(${0.4 + 0.6 * s}) rotate(${(1 - s) * (i % 2 ? 16 : -16)}deg)`,
								opacity: clamp(s * 2.2),
							}}
						>
							<span
								style={{
									color: '#14082e',
									textShadow: '0 5px 0 #2a0f63, 0 10px 0 #1f0a4a, 0 15px 0 #150734, 0 30px 40px rgba(0,0,0,0.65)',
								}}
							>
								{ch}
							</span>
							<span
								style={{
									position: 'absolute',
									left: 0,
									top: 0,
									backgroundImage: `linear-gradient(180deg, #ffffff 0%, ${c} 42%, ${c} 100%)`,
									WebkitBackgroundClip: 'text',
									backgroundClip: 'text',
									color: 'transparent',
									filter: `brightness(${1 + shine * 0.9})`,
								}}
							>
								{ch}
							</span>
						</span>
					);
				})}
			</div>
			<ElectricArcs frame={frame} />
			<Particles t={t} at={T.superpowers} until={T.cutAB - 0.1} count={46} cx={540} cy={470} spread={820} colors={[C.cyan, C.violet, C.pink, '#fff']} seed={3} rise={520} />
		</AbsoluteFill>
	);
};

const ElectricArcs: React.FC<SP> = ({frame}) => {
	const t = tOf(frame);
	const on = t >= T.superpowers && t < T.superpowers + 0.7;
	if (!on) return null;
	const seed = Math.floor(frame / 2);
	const arcs = [0, 1, 2].map((k) => {
		const x0 = 60 + rnd(seed + k * 7, 11) * 960;
		const y0 = 230 + rnd(seed + k * 3, 12) * 60;
		const x1 = x0 + (rnd(seed + k, 13) - 0.5) * 420;
		const y1 = 420 + rnd(seed + k * 5, 14) * 60;
		const pts: string[] = [];
		for (let i = 0; i <= 9; i++) {
			const p = i / 9;
			const jx = i === 0 || i === 9 ? 0 : (rnd(seed * 31 + i + k * 17, 15) - 0.5) * 60;
			const jy = i === 0 || i === 9 ? 0 : (rnd(seed * 29 + i + k * 13, 16) - 0.5) * 40;
			pts.push(`${lerp(x0, x1, p) + jx},${lerp(y0, y1, p) + jy}`);
		}
		return pts.join(' ');
	});
	const flick = rnd(seed, 21) > 0.35 ? 1 : 0.25;
	const fade = 1 - prog(t, T.superpowers + 0.45, T.superpowers + 0.7);
	return (
		<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: flick * fade}}>
			{arcs.map((p, i) => (
				<g key={i}>
					<polyline points={p} fill="none" stroke="rgba(167,139,250,0.7)" strokeWidth={10} strokeLinejoin="round" style={{filter: 'blur(6px)'}} />
					<polyline points={p} fill="none" stroke="#fff" strokeWidth={3} strokeLinejoin="round" />
				</g>
			))}
		</svg>
	);
};

// ---------------------------------------------------------------- agent network
const HUB = {x: 540, y: 250};
const NODES = [
	{x: 150, y: 175, at: () => T.agentic + 0.02},
	{x: 930, y: 175, at: () => T.agentic + 0.22},
	{x: 185, y: 415, at: () => T.agents + 0.02},
	{x: 895, y: 415, at: () => T.agents + 0.2},
];

export const AgentNetwork: React.FC<SP> = ({frame}) => {
	const t = tOf(frame);
	if (t < T.builds - 0.05 || t > T.cutBC) return null;
	const q = prog(t, T.cutBC - 0.16, T.cutBC - 0.02, E.inCubic);
	const hs = spr(frame, T.builds - 0.02, {damping: 12, stiffness: 200, mass: 0.8});
	return (
		<AbsoluteFill
			style={{
				opacity: 1 - q,
				transform: `scale(${1 - 0.35 * q})`,
				transformOrigin: `${HUB.x}px ${HUB.y}px`,
				filter: q > 0 ? `blur(${q * 10}px)` : undefined,
			}}
		>
			<svg width={W} height={700} style={{position: 'absolute', left: 0, top: 0}}>
				<defs>
					<linearGradient id="ln" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0" stopColor={C.cyan} />
						<stop offset="1" stopColor={C.violet} />
					</linearGradient>
				</defs>
				{NODES.map((nd, j) => {
					const at = nd.at();
					const L = Math.hypot(nd.x - HUB.x, nd.y - HUB.y);
					const d = prog(t, at - 0.18, at + 0.02, E.outCubic);
					if (d <= 0) return null;
					const pp = ((t - at) * 1.5 + j * 0.25) % 1;
					const px = lerp(HUB.x, nd.x, pp);
					const py = lerp(HUB.y, nd.y, pp);
					return (
						<g key={j}>
							<line x1={HUB.x} y1={HUB.y} x2={nd.x} y2={nd.y} stroke="rgba(0,0,0,0.35)" strokeWidth={12} strokeDasharray={L} strokeDashoffset={L * (1 - d)} strokeLinecap="round" />
							<line x1={HUB.x} y1={HUB.y} x2={nd.x} y2={nd.y} stroke="url(#ln)" strokeWidth={5} strokeDasharray={L} strokeDashoffset={L * (1 - d)} strokeLinecap="round" />
							{d >= 1 && (
								<>
									<line x1={HUB.x} y1={HUB.y} x2={nd.x} y2={nd.y} stroke="#fff" strokeOpacity={0.7} strokeWidth={3} strokeDasharray="4 22" strokeDashoffset={-t * 160} strokeLinecap="round" />
									<circle cx={px} cy={py} r={9} fill="#fff" style={{filter: 'drop-shadow(0 0 10px #22D3EE) drop-shadow(0 0 20px #22D3EE)'}} />
								</>
							)}
						</g>
					);
				})}
			</svg>
			{/* hub */}
			<div
				style={{
					position: 'absolute',
					left: HUB.x - 82,
					top: HUB.y - 82,
					width: 164,
					height: 164,
					borderRadius: '50%',
					transform: `scale(${hs})`,
					background: `conic-gradient(from ${t * 240}deg, ${C.cyan}, ${C.violet}, ${C.pink}, ${C.cyan})`,
					boxShadow: '0 0 50px rgba(167,139,250,0.8), 0 20px 50px rgba(0,0,0,0.5)',
					padding: 7,
				}}
			>
				<div style={{width: '100%', height: '100%', borderRadius: '50%', background: '#0a0b1c', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Bolt size={92} gradient id="hubbolt" />
				</div>
			</div>
			{[0, 1, 2].map((k) => {
				const p = ((t - T.builds) * 1.4 + k / 3) % 1;
				if (t < T.builds) return null;
				return (
					<div
						key={k}
						style={{
							position: 'absolute',
							left: HUB.x - 82 - 90 * p,
							top: HUB.y - 82 - 90 * p,
							width: 164 + 180 * p,
							height: 164 + 180 * p,
							borderRadius: '50%',
							border: `3px solid rgba(167,139,250,${0.6 * (1 - p) * hs})`,
						}}
					/>
				);
			})}
			{/* nodes */}
			{NODES.map((nd, j) => {
				const at = nd.at();
				const s = spr(frame, at, {damping: 11, stiffness: 230, mass: 0.6});
				if (s <= 0) return null;
				const bob = Math.sin(t * 4 + j * 1.3) * 5;
				const ping = bump(t, at, 0.3);
				return (
					<div
						key={j}
						style={{
							position: 'absolute',
							left: nd.x - 70,
							top: nd.y - 70 + bob,
							width: 140,
							transform: `scale(${s})`,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
						}}
					>
						<div
							style={{
								width: 140,
								height: 140,
								borderRadius: 36,
								background: 'rgba(10,14,30,0.9)',
								border: `3px solid rgba(34,211,238,${0.55 + 0.45 * ping})`,
								boxShadow: `0 0 ${30 + 60 * ping}px rgba(34,211,238,${0.45 + 0.4 * ping}), 0 20px 40px rgba(0,0,0,0.45)`,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								position: 'relative',
							}}
						>
							<Robot size={82} color={C.cyan} />
							<div
								style={{
									position: 'absolute',
									right: 12,
									top: 12,
									width: 16,
									height: 16,
									borderRadius: 8,
									background: '#3fb950',
									boxShadow: '0 0 12px #3fb950',
									opacity: 0.4 + 0.6 * Math.abs(Math.sin(t * 6 + j)),
								}}
							/>
						</div>
						<div
							style={{
								marginTop: 10,
								fontFamily: FONT.mono,
								fontWeight: 700,
								fontSize: 24,
								letterSpacing: '0.14em',
								color: '#fff',
								background: 'rgba(10,14,30,0.8)',
								padding: '4px 12px',
								borderRadius: 8,
							}}
						>
							AGENT_0{j + 1}
						</div>
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- terminal
const TERM = {x: 70, y: 96, w: 940, h: 330};
const TERM_IN = 6.54;
const GLITCH_AT = 7.6;
const GLITCH_END = 7.8;

const TerminalBody: React.FC<{frame: number}> = ({frame}) => {
	const t = tOf(frame);
	const l1 = typed('claude', t, T.claude + 0.02, 0.035);
	const w = spr(frame, 7.2, {damping: 13, stiffness: 230});
	const l3at = 7.34;
	const l3 = typed('make me 10x smarter', t, l3at, 0.0125);
	return (
		<div
			style={{
				width: TERM.w,
				height: TERM.h,
				borderRadius: 24,
				background: 'rgba(14,14,18,0.94)',
				border: '1.5px solid rgba(255,255,255,0.14)',
				boxShadow: '0 40px 90px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.5)',
				overflow: 'hidden',
			}}
		>
			<div style={{height: 56, background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'relative'}}>
				{['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
					<div key={c} style={{position: 'absolute', left: 28 + i * 32, top: 19, width: 18, height: 18, borderRadius: 9, background: c}} />
				))}
				<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.mono, fontSize: 22, color: 'rgba(255,255,255,0.5)'}}>
					~/projects — zsh
				</div>
			</div>
			<div style={{padding: '22px 34px', fontFamily: FONT.mono, fontSize: 33, lineHeight: '52px', color: '#e6e6e6', whiteSpace: 'pre'}}>
				<div>
					<span style={{color: '#28c840', fontWeight: 700}}>➜ </span>
					<span style={{color: C.cyan, fontWeight: 700}}>~ </span>
					<span>{l1}</span>
					{t < 7.2 && <span style={{background: '#e6e6e6', opacity: caretOn(t) || l1.length < 6 ? 1 : 0}}> </span>}
				</div>
				{w > 0 && (
					<div
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 14,
							marginTop: 10,
							padding: '4px 22px',
							border: `2.5px solid ${C.claude}`,
							borderRadius: 14,
							transform: `scale(${0.85 + 0.15 * w})`,
							transformOrigin: '0 50%',
							opacity: clamp(w * 2),
						}}
					>
						<Asterisk size={30} color={C.claude} style={{transform: `rotate(${t * 90}deg)`}} />
						<span>
							Welcome to <b style={{color: '#fff'}}>Claude Code</b>!
						</span>
					</div>
				)}
				{t >= l3at - 0.05 && (
					<div style={{marginTop: 10}}>
						<span style={{color: C.claude, fontWeight: 700}}>&gt; </span>
						<span>{l3}</span>
						<span style={{background: C.claude, opacity: caretOn(t) || l3.length < 19 ? 1 : 0}}> </span>
					</div>
				)}
			</div>
		</div>
	);
};

export const Terminal: React.FC<SP> = ({frame}) => {
	const t = tOf(frame);
	if (t < TERM_IN - 0.02 || t >= GLITCH_END) return null;
	const e = spr(frame, TERM_IN, {damping: 14, stiffness: 150, mass: 0.9});
	const base: React.CSSProperties = {
		position: 'absolute',
		left: TERM.x,
		top: TERM.y,
		transformOrigin: '50% 0%',
		transform: `perspective(1400px) translateY(${(1 - e) * -440}px) rotateX(${(1 - e) * 34}deg) scale(${0.9 + 0.1 * e})`,
		opacity: clamp(e * 2),
	};
	if (t < GLITCH_AT) {
		return (
			<div style={base}>
				<TerminalBody frame={frame} />
			</div>
		);
	}
	// glitch-out: sliced + RGB-shifted copies
	const seed = Math.floor(frame / 2);
	const g = prog(t, GLITCH_AT, GLITCH_END);
	const bands = 6;
	return (
		<div style={{...base, opacity: (rnd(seed, 40) > 0.25 ? 1 : 0.3) * (1 - g * 0.6)}}>
			{[`rgba(255,0,80,0.8)`, `rgba(0,220,255,0.8)`].map((c, k) => (
				<div
					key={c}
					style={{position: 'absolute', left: (k ? -1 : 1) * (8 + 26 * g), top: 0, mixBlendMode: 'screen', opacity: 0.7, filter: `drop-shadow(0 0 0 ${c}) hue-rotate(${k ? 180 : 0}deg)`}}
				>
					<TerminalBody frame={frame} />
				</div>
			))}
			{Array.from({length: bands}).map((_, i) => {
				const top = (i / bands) * 100;
				const bot = 100 - ((i + 1) / bands) * 100;
				const dx = (rnd(seed * 7 + i, 41) - 0.5) * 120 * (0.3 + g);
				return (
					<div key={i} style={{position: 'absolute', left: dx, top: 0, clipPath: `inset(${top}% 0 ${bot}% 0)`}}>
						<TerminalBody frame={frame} />
					</div>
				);
			})}
		</div>
	);
};

// ---------------------------------------------------------------- 10X (behind subject)
const TENX_Y = 92;

export const TenX: React.FC<SP> = ({frame}) => {
	const t = tOf(frame);
	if (t < GLITCH_AT || t > T.outro + 0.1) return null;
	const q = prog(t, T.outro - 0.22, T.outro + 0.05, E.inCubic);
	if (t < T.ten) {
		// rolling counter 1x -> 9x while the terminal glitches out
		const p = prog(t, GLITCH_AT + 0.02, T.ten - 0.01, E.linear);
		const n = 1 + Math.min(8, Math.floor(p * 9));
		const size = lerp(200, 300, p);
		const jit = (rnd(frame, 51) - 0.5) * 10;
		return (
			<div
				style={{
					position: 'absolute',
					left: 0,
					width: W,
					top: TENX_Y + (420 - size) * 0.62,
					textAlign: 'center',
					fontFamily: FONT.display,
					fontSize: size,
					lineHeight: 1,
					color: '#fff',
					transform: `translateX(${jit}px)`,
					textShadow: '0 0 30px rgba(255,200,60,0.9), 0 10px 0 rgba(120,60,0,0.6)',
					opacity: prog(t, GLITCH_AT, GLITCH_AT + 0.05),
				}}
			>
				{n}X
			</div>
		);
	}
	const s = spr(frame, T.ten, {damping: 9, stiffness: 280, mass: 0.8});
	const pulse = bump(t, T.times, 0.12);
	const scale = (2.4 - 1.4 * s) * (1 + 0.1 * pulse) * (1 + 0.3 * q);
	const ring = prog(t, T.ten, T.ten + 0.55, E.outCubic);
	const style: React.CSSProperties = {fontFamily: FONT.display, fontSize: 420, lineHeight: 1, letterSpacing: '0.01em', whiteSpace: 'nowrap'};
	return (
		<AbsoluteFill style={{opacity: 1 - q, filter: q > 0 ? `blur(${q * 16}px)` : undefined}}>
			{ring < 1 && (
				<div
					style={{
						position: 'absolute',
						left: 540 - 1000 * ring,
						top: TENX_Y + 230 - 1000 * ring,
						width: 2000 * ring,
						height: 2000 * ring,
						borderRadius: '50%',
						border: `${18 * (1 - ring)}px solid rgba(255,220,120,${1 - ring})`,
						boxShadow: `0 0 60px rgba(255,190,60,${0.8 * (1 - ring)})`,
					}}
				/>
			)}
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: TENX_Y,
					width: W,
					textAlign: 'center',
					transform: `scale(${scale})`,
					transformOrigin: '50% 60%',
					opacity: clamp((t - T.ten) * 40),
					filter: `drop-shadow(0 0 ${40 + 40 * pulse}px rgba(255,180,40,0.8)) blur(${Math.max(0, 1 - s) * 14}px)`,
				}}
			>
				<div style={{position: 'relative', display: 'inline-block'}}>
					<span
						style={{
							...style,
							color: '#6b3500',
							textShadow: '0 4px 0 #d08200, 0 8px 0 #b06a00, 0 12px 0 #8f5300, 0 16px 0 #714000, 0 20px 0 #552f00, 0 40px 60px rgba(0,0,0,0.75)',
						}}
					>
						10X
					</span>
					<span
						style={{
							...style,
							position: 'absolute',
							left: 0,
							top: 0,
							backgroundImage: GOLD_GRADIENT,
							WebkitBackgroundClip: 'text',
							backgroundClip: 'text',
							color: 'transparent',
						}}
					>
						10X
					</span>
					{/* specular sweep */}
					<span
						style={{
							...style,
							position: 'absolute',
							left: 0,
							top: 0,
							backgroundImage: 'linear-gradient(105deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0) 60%)',
							backgroundSize: '300% 100%',
							backgroundPosition: `${lerp(100, -20, prog(t, T.ten + 0.25, T.ten + 0.8, E.inOutSine)) * 1.5}% 0`,
							WebkitBackgroundClip: 'text',
							backgroundClip: 'text',
							color: 'transparent',
						}}
					>
						10X
					</span>
				</div>
			</div>
			<Particles t={t} at={T.ten} until={T.outro - 0.2} count={40} cx={540} cy={480} spread={900} colors={[C.gold, '#fff', '#FFB627']} seed={9} rise={560} />
		</AbsoluteFill>
	);
};

/** anime focus lines behind the subject */
export const SpeedLines: React.FC<{frame: number; cx: number; cy: number}> = ({frame, cx, cy}) => {
	const t = tOf(frame);
	if (t < T.ten || t > T.outro + 0.1) return null;
	const o = prog(t, T.ten, T.ten + 0.08) * (1 - prog(t, T.outro - 0.2, T.outro + 0.05));
	const seed = Math.floor(frame / 3);
	const N = 64;
	const polys = Array.from({length: N}).map((_, i) => {
		const a = (i / N) * Math.PI * 2 + (rnd(i + seed * 97, 61) - 0.5) * 0.08;
		const w = 0.006 + rnd(i + seed * 13, 62) * 0.014;
		const r1 = 430 + rnd(i + seed * 17, 63) * 260;
		const r2 = 1700;
		const p = (ang: number, r: number) => `${cx + Math.cos(ang) * r},${cy + Math.sin(ang) * r}`;
		return {pts: `${p(a, r1)} ${p(a - w, r2)} ${p(a + w, r2)}`, op: 0.25 + rnd(i + seed, 64) * 0.45};
	});
	return (
		<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: o, mixBlendMode: 'screen'}}>
			{polys.map((pl, i) => (
				<polygon key={i} points={pl.pts} fill={i % 5 === 0 ? '#FFD34E' : '#ffffff'} opacity={pl.op} />
			))}
		</svg>
	);
};

// ---------------------------------------------------------------- SMARTER (front)
export const Smarter: React.FC<SP> = ({frame}) => {
	const t = tOf(frame);
	if (t < T.smarter - 0.05 || t > T.outro + 0.05) return null;
	const q = prog(t, T.outro - 0.2, T.outro + 0.02, E.inCubic);
	const letters = 'SMARTER'.split('');
	const st: React.CSSProperties = {fontFamily: FONT.display, fontSize: 210, lineHeight: 1, letterSpacing: '0.02em'};
	return (
		<AbsoluteFill style={{opacity: 1 - q, transform: `scale(${1 + 0.2 * q})`, filter: q > 0 ? `blur(${q * 12}px)` : undefined}}>
			<div
				style={{
					position: 'absolute',
					top: 1330,
					left: 0,
					width: W,
					textAlign: 'center',
					whiteSpace: 'nowrap',
					filter: 'drop-shadow(0 0 30px rgba(255,190,60,0.65))',
				}}
			>
				{letters.map((ch, i) => {
					const s = spr(frame, T.smarter + i * 0.032, {damping: 12, stiffness: 210, mass: 0.7});
					return (
						<span
							key={i}
							style={{
								display: 'inline-block',
								position: 'relative',
								transform: `perspective(900px) translateY(${(1 - s) * 90}px) rotateX(${(1 - s) * -95}deg)`,
								opacity: clamp(s * 2.5),
							}}
						>
							<span style={{...st, color: '#2a1500', textShadow: '0 5px 0 #7a4a00, 0 10px 0 #5a3600, 0 15px 0 #3d2400, 0 30px 40px rgba(0,0,0,0.7)'}}>{ch}</span>
							<span
								style={{
									...st,
									position: 'absolute',
									left: 0,
									top: 0,
									backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #FFF1B8 40%, #FFC23D 75%, #FF9500 100%)',
									WebkitBackgroundClip: 'text',
									backgroundClip: 'text',
									color: 'transparent',
								}}
							>
								{ch}
							</span>
						</span>
					);
				})}
			</div>
			{Array.from({length: 12}).map((_, i) => {
				const at = T.smarter + 0.05 + rnd(i, 71) * 0.45;
				const p = prog(t, at, at + 0.5, E.linear);
				if (p <= 0 || p >= 1) return null;
				const x = 150 + rnd(i, 72) * 780;
				const y = 1300 + rnd(i, 73) * 290;
				const sz = 30 + rnd(i, 74) * 40;
				return (
					<Sparkle
						key={i}
						size={sz}
						color={i % 2 ? '#fff' : '#FFE27A'}
						style={{
							position: 'absolute',
							left: x - sz / 2,
							top: y - sz / 2,
							transform: `scale(${Math.sin(Math.PI * p)}) rotate(${p * 120}deg)`,
							filter: 'drop-shadow(0 0 10px rgba(255,220,120,0.95))',
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- outro
export const OutroBG: React.FC<SP> = ({frame}) => {
	const t = tOf(frame);
	if (t < T.outro - 0.05) return null;
	const o = prog(t, T.outro - 0.05, T.outro + 0.35);
	const blob = (i: number, color: string) => {
		const x = 540 + Math.sin(t * 0.9 + i * 2.1) * 360;
		const y = 960 + Math.cos(t * 0.7 + i * 1.7) * 620;
		return (
			<div
				key={i}
				style={{
					position: 'absolute',
					left: x - 520,
					top: y - 520,
					width: 1040,
					height: 1040,
					borderRadius: '50%',
					background: `radial-gradient(closest-side, ${color}, rgba(0,0,0,0))`,
					mixBlendMode: 'screen',
					opacity: 0.55,
				}}
			/>
		);
	};
	return (
		<AbsoluteFill style={{opacity: o, backgroundColor: '#05060f', overflow: 'hidden'}}>
			<Img src={staticFile('frames/0338.jpg')} style={{position: 'absolute', width: W, height: H, transform: 'scale(1.35)', filter: 'blur(38px) brightness(0.38) saturate(1.5)'}} />
			{blob(0, 'rgba(124,58,237,0.9)')}
			{blob(1, 'rgba(34,211,238,0.7)')}
			{blob(2, 'rgba(244,114,182,0.7)')}
			{/* perspective grid */}
			<div
				style={{
					position: 'absolute',
					left: -540,
					width: W * 2,
					top: 1150,
					height: 1400,
					transform: 'perspective(700px) rotateX(62deg)',
					transformOrigin: '50% 0%',
					backgroundImage:
						'linear-gradient(rgba(167,139,250,0.55) 2px, transparent 2px), linear-gradient(90deg, rgba(167,139,250,0.55) 2px, transparent 2px)',
					backgroundSize: '90px 90px',
					backgroundPosition: `0 ${(t * 90) % 90}px`,
					WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 40%)',
					opacity: 0.45,
				}}
			/>
		</AbsoluteFill>
	);
};

export const OutroText: React.FC<SP> = ({frame}) => {
	const t = tOf(frame);
	if (t < T.outro + 0.3) return null;
	const T0 = T.outro + 0.45;
	const letters = 'SUPERPOWERS'.split('');
	const bs = spr(frame, T0 - 0.05, {damping: 10, stiffness: 180, mass: 0.7});
	const sub = spr(frame, T0 + 0.3, {damping: 16, stiffness: 140});
	const pill = spr(frame, T0 + 0.45, {damping: 13, stiffness: 170});
	const URL_AT = T0 + 0.6;
	const url = typed('github.com/obra/superpowers', t, URL_AT, 0.03);
	const DONE = URL_AT + 27 * 0.03 + 0.12;
	const ok = bump(t, DONE, 0.25);
	const done = t >= DONE;
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 1215, left: 0, width: W, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14}}>
				<Bolt size={120} gradient id="obolt" style={{transform: `scale(${bs}) rotate(${(1 - bs) * -40}deg)`, filter: 'drop-shadow(0 0 24px rgba(167,139,250,0.9))'}} />
				<div style={{fontFamily: FONT.display, fontSize: 134, lineHeight: 1, whiteSpace: 'nowrap', filter: 'drop-shadow(0 0 22px rgba(167,139,250,0.7))'}}>
					{letters.map((ch, i) => {
						const s = spr(frame, T0 + i * 0.025, {damping: 12, stiffness: 200, mass: 0.7});
						return (
							<span
								key={i}
								style={{
									display: 'inline-block',
									transform: `translateY(${(1 - s) * 80}px) scale(${0.5 + 0.5 * s})`,
									opacity: clamp(s * 2.2),
									backgroundImage: `linear-gradient(180deg, #ffffff 0%, ${SUPER_COLORS[i]} 45%)`,
									WebkitBackgroundClip: 'text',
									backgroundClip: 'text',
									color: 'transparent',
								}}
							>
								{ch}
							</span>
						);
					})}
				</div>
			</div>
			<div
				style={{
					position: 'absolute',
					top: 1378,
					left: 0,
					width: W,
					textAlign: 'center',
					fontFamily: FONT.grotesk,
					fontWeight: 600,
					fontSize: 46,
					color: 'rgba(255,255,255,0.82)',
					opacity: sub,
					transform: `translateY(${(1 - sub) * 30}px)`,
				}}
			>
				supercharge your <span style={{color: C.orange, fontWeight: 700}}>Claude Code</span>
			</div>
			<div style={{position: 'absolute', top: 1470, left: 0, width: W, display: 'flex', justifyContent: 'center'}}>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 18,
						padding: '20px 34px',
						borderRadius: 999,
						background: 'rgba(255,255,255,0.08)',
						border: `2.5px solid ${done ? `rgba(255,211,78,${0.6 + 0.4 * ok})` : 'rgba(255,255,255,0.22)'}`,
						boxShadow: `0 20px 50px rgba(0,0,0,0.45), 0 0 ${50 * ok + (done ? 18 : 0)}px rgba(255,211,78,${done ? 0.35 + 0.5 * ok : 0})`,
						transform: `scale(${pill * (1 + 0.06 * ok)})`,
						opacity: clamp(pill * 2),
						fontFamily: FONT.mono,
						fontWeight: 600,
						fontSize: 36,
						color: '#fff',
						whiteSpace: 'nowrap',
					}}
				>
					<GitHubMark size={46} color="#fff" />
					<span style={{minWidth: 590}}>
						{url}
						{!done && <span style={{background: '#fff', opacity: caretOn(t) || url.length < 27 ? 1 : 0}}> </span>}
					</span>
					<StarIcon size={40} filled color="#FFD34E" style={{transform: `scale(${done ? 1 + 0.5 * ok : 0}) rotate(${ok * 90}deg)`}} />
				</div>
			</div>
			<Particles t={t} at={DONE} until={DONE + 0.5} count={24} cx={540} cy={1520} spread={640} colors={[C.gold, '#fff', C.violet]} seed={17} rise={260} />
		</AbsoluteFill>
	);
};
