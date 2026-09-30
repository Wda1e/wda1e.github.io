// Render several override states in one browser session: node multi.mjs states.json outprefix
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
import fs from 'node:fs';
const [,, statesFile, prefix, w = '1920', h = '1080', opts = '{}'] = process.argv;
const states = JSON.parse(fs.readFileSync(statesFile, 'utf8'));
const { url, close } = await serve();
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(url + '/index.html');
await page.waitForFunction(() => typeof window.init === 'function');
await page.evaluate(({ w, h, o }) => window.init({ width: w, height: h, ...o }), { w: +w, h: +h, o: JSON.parse(opts) });
for (const [i, st] of states.entries()) {
  const t0 = Date.now();
  const data = await page.evaluate(({ t, ov }) => window.renderAt(t, 'image/png', ov), { t: st.t ?? 0, ov: st.ov ?? null });
  fs.writeFileSync(`${prefix}${i}.png`, Buffer.from(data.split(',')[1], 'base64'));
  console.log(i, 'ms', Date.now() - t0);
}
await browser.close(); close();
