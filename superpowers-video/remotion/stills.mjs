import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import path from 'node:path';
const frames = process.argv.slice(2).map(Number);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const browser = await openBrowser('chrome', {browserExecutable: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', chromiumOptions: {gl: 'swangle'}});
const composition = await selectComposition({serveUrl, id: 'Main', puppeteerInstance: browser});
for (const f of frames) {
  const t0 = Date.now();
  await renderStill({composition, serveUrl, frame: f, output: `stills/${String(f).padStart(4,'0')}.png`, puppeteerInstance: browser, chromiumOptions: {gl: 'swangle'}});
  console.log('frame', f, (Date.now()-t0)+'ms');
}
await browser.close({silent: true});
