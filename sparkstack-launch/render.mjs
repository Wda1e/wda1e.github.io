// Final frame renderer: node render.mjs [width height fps outdir start end]
// Renders PNG frames deterministically via window.renderAt(t).
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
import fs from 'node:fs';
import { DURATION } from './timeline.js';
const [,, w = '1920', h = '1080', fps = '30', outdir = 'frames/16x9', start = '0', end = ''] = process.argv;
const total = Math.round(DURATION * +fps);
const last = end === '' ? total : Math.min(total, +end);
fs.mkdirSync(outdir, { recursive: true });
const { url, close } = await serve();
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(url + '/index.html');
await page.waitForFunction(() => typeof window.init === 'function');
console.log(await page.evaluate((o) => window.init(o), { width: +w, height: +h, aa: 'smaa', shadowSize: 4096 }));
const t0 = Date.now();
for (let f = +start; f < last; f++) {
  const file = `${outdir}/f${String(f).padStart(4, '0')}.png`;
  if (fs.existsSync(file)) continue; // resumable
  const data = await page.evaluate((t) => window.renderAt(t, 'image/png'), f / +fps);
  fs.writeFileSync(file + '.tmp', Buffer.from(data.split(',')[1], 'base64'));
  fs.renameSync(file + '.tmp', file);
  if (f % 10 === 0) {
    const done = f - +start + 1, el = (Date.now() - t0) / 1000;
    console.log(`frame ${f}/${last} ${(el / done).toFixed(2)}s/f eta ${((last - f) * el / done / 60).toFixed(1)}min`);
  }
}
await browser.close(); close();
console.log('done');
