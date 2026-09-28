import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Cam} from './camera';
import {FPS, H, T, TL, W, clamp, pad4, prog} from './lib';

const srcIdx = (frame: number) => TL.srcFrame[clamp(frame, 0, TL.durationInFrames - 1)];
export const frameSrc = (frame: number) => staticFile(`frames/${pad4(srcIdx(frame))}.jpg`);
export const personSrc = (frame: number) => staticFile(`person/${pad4(srcIdx(frame))}.webp`);

const camTransform = (c: Cam, extra = 1) => {
	// scale around the face anchor for ghost copies (zoom blur)
	const z = c.z * extra;
	const tx = c.fx - (c.fx - c.tx) * extra;
	const ty = c.fy - (c.fy - c.ty) * extra;
	return `translate(${tx}px, ${ty}px) scale(${z})`;
};

/** RGB split amount (px) — intro + the two big hits */
export const rgbSplit = (t: number) => {
	const hit = (at: number, amp: number, tau: number) => (t >= at ? amp * Math.exp(-(t - at) / tau) : 0);
	return hit(0, 14, 0.14) + hit(T.superpowers, 9, 0.1) + hit(T.ten, 16, 0.14) + hit(T.cutAB, 5, 0.06) + hit(T.cutBC, 5, 0.06);
};

export const RGBFilterDefs: React.FC<{d: number}> = ({d}) => (
	<svg width={0} height={0} style={{position: 'absolute'}}>
		<defs>
			<filter id="rgbsplit" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
				<feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
				<feOffset in="r" dx={d} dy={d * 0.25} result="r2" />
				<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
				<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
				<feOffset in="b" dx={-d} dy={-d * 0.25} result="b2" />
				<feBlend in="r2" in2="g" mode="screen" result="rg" />
				<feBlend in="rg" in2="b2" mode="screen" />
			</filter>
		</defs>
	</svg>
);

export const Footage: React.FC<{frame: number; cam: Cam}> = ({frame, cam}) => {
	const t = frame / FPS;
	const intro = prog(t, 0, 0.4, (x) => x);
	const blur = (1 - intro) * 16 + Math.min(10, Math.abs(cam.zVel) * 2.2);
	const split = rgbSplit(t);
	const src = frameSrc(frame);
	// zoom-blur ghosts while the zoom is moving fast (punch-ins)
	const v = cam.zVel;
	const ghosts = Math.abs(v) > 0.35 ? [1, 2, 3] : [];
	return (
		<AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
			<RGBFilterDefs d={split} />
			<div style={{position: 'absolute', inset: 0, filter: split > 0.4 ? 'url(#rgbsplit)' : undefined}}>
				<div
					style={{
						position: 'absolute',
						width: W,
						height: H,
						transformOrigin: '0 0',
						transform: camTransform(cam),
						filter: blur > 0.3 ? `blur(${blur.toFixed(2)}px)` : undefined,
					}}
				>
					<Img src={src} style={{width: W, height: H, display: 'block'}} />
				</div>
				{ghosts.map((i) => (
					<div
						key={i}
						style={{
							position: 'absolute',
							width: W,
							height: H,
							transformOrigin: '0 0',
							transform: camTransform(cam, 1 + i * clamp(v, -3, 3) * 0.018),
							opacity: 0.28 / i,
						}}
					>
						<Img src={src} style={{width: W, height: H, display: 'block'}} />
					</div>
				))}
			</div>
		</AbsoluteFill>
	);
};

/** the subject, cut out, on top of "behind" graphics; optional rim glow */
export const Person: React.FC<{frame: number; cam: Cam; glow?: string; opacity?: number}> = ({frame, cam, glow, opacity = 1}) => (
	<AbsoluteFill style={{overflow: 'hidden', opacity, filter: glow}}>
		<div style={{position: 'absolute', width: W, height: H, transformOrigin: '0 0', transform: camTransform(cam)}}>
			<Img src={personSrc(frame)} style={{width: W, height: H, display: 'block'}} />
		</div>
	</AbsoluteFill>
);
