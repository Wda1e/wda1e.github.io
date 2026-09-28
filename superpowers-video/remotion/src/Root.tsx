import React from 'react';
import {Composition, continueRender, delayRender, staticFile} from 'remotion';
import {FPS, H, TL, W} from './lib';
import {Main} from './Main';

const FONTS: [string, string, string][] = [
	['Inter', 'fonts/Inter.ttf', '100 900'],
	['Anton', 'fonts/Anton.ttf', '400'],
	['JetBrains Mono', 'fonts/JetBrainsMono.ttf', '100 800'],
	['Space Grotesk', 'fonts/SpaceGrotesk.ttf', '300 700'],
];

if (typeof document !== 'undefined') {
	const handle = delayRender('Loading fonts');
	Promise.all(
		FONTS.map(([family, file, weight]) =>
			new FontFace(family, `url(${staticFile(file)})`, {weight}).load().then((f) => {
				document.fonts.add(f);
			}),
		),
	)
		.then(() => continueRender(handle))
		.catch((err) => {
			console.error(err);
			continueRender(handle);
		});
}

export const Root: React.FC = () => (
	<Composition id="Main" component={Main} durationInFrames={TL.durationInFrames} fps={FPS} width={W} height={H} />
);
