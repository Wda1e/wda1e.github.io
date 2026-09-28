import React from 'react';
import {GitHubMark} from './icons';
import {C, E, FONT, FPS, T, TL, W, clamp, prog, spr} from './lib';

type Page = {idx: number[]; start: number; end: number};
const wd = TL.words;
// pages follow the phrasing; hero words (SUPERPOWERS / 10X SMARTER) are carried by the big titles instead
const PAGES: Page[] = [
	{idx: [0, 1, 2, 3], start: wd[0].start - 0.04, end: T.github - 0.02},
	{idx: [4, 5], start: T.github - 0.02, end: T.superpowers - 0.08},
	{idx: [7, 8, 9], start: wd[7].start - 0.04, end: T.agentic - 0.02},
	{idx: [10, 11], start: T.agentic - 0.02, end: T.cutBC - 0.06},
	{idx: [12, 13, 14], start: wd[12].start - 0.04, end: T.claude - 0.02},
	{idx: [15, 16], start: T.claude - 0.02, end: 7.6},
];

const KEY: Record<number, string> = {10: C.cyan, 11: C.cyan, 15: C.orange, 16: C.orange};

export const Captions: React.FC<{frame: number}> = ({frame}) => {
	const t = frame / FPS;
	const page = PAGES.find((p) => t >= p.start && t < p.end + 0.08);
	if (!page) return null;
	const out = prog(t, page.end - 0.02, page.end + 0.08, E.inCubic);
	const fontSize = page.idx.length > 2 ? 84 : 96;
	return (
		<div
			style={{
				position: 'absolute',
				left: (W - 980) / 2,
				width: 980,
				top: 1380,
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: 'center',
				alignItems: 'center',
				columnGap: 36,
				rowGap: 4,
				opacity: 1 - out,
				transform: `translateY(${-24 * out}px) scale(${1 - 0.12 * out})`,
			}}
		>
			{page.idx.map((i, k) => {
				const w = wd[i];
				const next = k < page.idx.length - 1 ? wd[page.idx[k + 1]].start : page.end;
				const s = spr(frame, w.start - 0.05, {damping: 13, stiffness: 250, mass: 0.6});
				if (s <= 0.001) return null;
				const active = t >= w.start - 0.03 && t < next - 0.03;
				const pillIn = spr(frame, w.start - 0.03, {damping: 14, stiffness: 320, mass: 0.6});
				const pillOut = t >= next - 0.03 ? spr(frame, next - 0.03, {damping: 20, stiffness: 320}) : 0;
				const pill = clamp(pillIn - pillOut);
				const key = KEY[i];
				const text = w.text.toUpperCase();
				const common: React.CSSProperties = {
					fontFamily: FONT.ui,
					fontWeight: 900,
					fontSize,
					lineHeight: 1.12,
					letterSpacing: '-0.02em',
					whiteSpace: 'nowrap',
				};
				return (
					<div
						key={i}
						style={{
							position: 'relative',
							display: 'inline-flex',
							alignItems: 'center',
							gap: 14,
							transform: `translateY(${(1 - s) * 44}px) scale(${(0.55 + 0.45 * s) * (active ? 1.04 : 1)})`,
							opacity: clamp(s * 2.5),
							filter: s < 0.9 ? `blur(${(1 - s) * 8}px)` : undefined,
						}}
					>
						{!key && i !== 4 && pill > 0.01 && (
							<div
								style={{
									position: 'absolute',
									left: -16,
									right: -16,
									top: 6,
									bottom: 2,
									borderRadius: 20,
									background: 'linear-gradient(135deg, #7C3AED, #DB2777)',
									boxShadow: '0 10px 30px rgba(124,58,237,0.55)',
									transform: `scale(${0.6 + 0.4 * pill}) rotate(${-2 * pill}deg)`,
									opacity: pill,
								}}
							/>
						)}
						{i === 4 && (
							<div style={{transform: `scale(${spr(frame, w.start, {damping: 9, stiffness: 220})}) rotate(${(1 - spr(frame, w.start, {damping: 12})) * -90}deg)`}}>
								<GitHubMark size={fontSize * 0.86} color="#fff" style={{filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.6))', display: 'block'}} />
							</div>
						)}
						<span style={{position: 'relative'}}>
							<span style={{...common, color: '#000', WebkitTextStroke: '16px #000', filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.5))'}}>{text}</span>
							<span
								style={{
									...common,
									position: 'absolute',
									left: 0,
									top: 0,
									color: key ?? '#fff',
									textShadow: key ? `0 0 28px ${key}` : undefined,
								}}
							>
								{text}
							</span>
						</span>
					</div>
				);
			})}
		</div>
	);
};
