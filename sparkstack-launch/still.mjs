// Quick still renderer: node still.mjs out.png '{"cam":[...]}' [t]
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
import fs from 'node:fs';
const [,, out = 'still.png', ov = 'null', t = '0', w = '1920', h = '1080'] = process.argv;
const { url, close } = await serve();
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
page.on('console', (m) => console.log('[page]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(url + '/index.html');
await page.waitForFunction(() => typeof window.init === 'function');
console.log(await page.evaluate(({ w, h }) => window.init({ width: w, height: h }), { w: +w, h: +h }));
console.log(await page.evaluate(() => { const gl = document.createElement('canvas').getContext('webgl2'); const d = gl.getExtension('WEBGL_debug_renderer_info'); return gl.getParameter(d ? d.UNMASKED_RENDERER_WEBGL : gl.RENDERER); }));
const t0 = Date.now();
const data = await page.evaluate(({ t, ov }) => window.renderAt(t, 'image/png', ov), { t: +t, ov: JSON.parse(ov) });
console.log('render ms', Date.now() - t0);
fs.writeFileSync(out, Buffer.from(data.split(',')[1], 'base64'));
await browser.close(); close();
