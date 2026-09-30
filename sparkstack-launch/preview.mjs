// Render a list of times at preview resolution into a contact sheet folder.
// node preview.mjs outdir "0,1.2,2.4" [w h aa]
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
import fs from 'node:fs';
const [,, outdir, times, w = '960', h = '540', aa = 'none', shadow = '2048'] = process.argv;
fs.mkdirSync(outdir, { recursive: true });
const { url, close } = await serve();
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('[console]', m.text()); });
await page.goto(url + '/index.html');
await page.waitForFunction(() => typeof window.init === 'function');
await page.evaluate((o) => window.init(o), { width: +w, height: +h, aa, shadowSize: +shadow });
for (const t of times.split(',').map(Number)) {
  const data = await page.evaluate((t) => window.renderAt(t, 'image/jpeg'), t);
  fs.writeFileSync(`${outdir}/t${t.toFixed(2).padStart(5, '0')}.jpg`, Buffer.from(data.split(',')[1], 'base64'));
}
await browser.close(); close();
