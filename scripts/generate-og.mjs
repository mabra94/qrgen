// Generates the Open Graph share image (public/og.png): a real, scannable QR
// code with the letters "QR" in the centre, on the app's dark background.
//
// Run with:  npm run og
// Requires the Playwright Chromium browser (npx playwright install chromium).
// The QR uses the same qrcode-generator engine as the app, so the image is a
// genuine code that resolves to the site.

import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const require = createRequire(import.meta.url);
const qrcode = require('qrcode-generator');

const DATA = 'https://qr.mbrk.eu/';
const OUT = 'public/og.png';
const WIDTH = 1200;
const HEIGHT = 630;

// Error correction H survives the centre hole; the letters cover ~24% of the
// width, comfortably inside the ~30% H can recover.
const qr = qrcode(0, 'H');
qr.addData(DATA);
qr.make();
const count = qr.getModuleCount();
const qz = 4; // quiet zone, in modules
const total = count + qz * 2;
const center = Math.max(6, Math.round(count * 0.24));

let modules = '';
for (let row = 0; row < count; row++) {
  for (let col = 0; col < count; col++) {
    if (qr.isDark(row, col)) {
      modules += `<rect x="${col + qz}" y="${row + qz}" width="1" height="1"/>`;
    }
  }
}

const cx = qz + (count - center) / 2;
const font = "'DejaVu Sans', 'Liberation Sans', Arial, sans-serif";

const svg = `<svg viewBox="0 0 ${total} ${total}" width="420" height="420" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
  <rect width="${total}" height="${total}" fill="#ffffff"/>
  <g fill="#0f172a">${modules}</g>
  <g shape-rendering="geometricPrecision">
    <rect x="${cx}" y="${cx}" width="${center}" height="${center}" rx="${(center * 0.16).toFixed(2)}" fill="#ffffff"/>
    <text x="${total / 2}" y="${total / 2 + center * 0.02}" fill="#0f172a" font-family="${font}" font-size="${(center * 0.5).toFixed(2)}" font-weight="800" text-anchor="middle" dominant-baseline="central" letter-spacing="-0.05">QR</text>
  </g>
</svg>`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${WIDTH}px;height:${HEIGHT}px}
  body{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;
    background:radial-gradient(circle at 50% 38%, #101c33 0%, #080d17 68%);font-family:${font}}
  .plate{background:#fff;border-radius:30px;padding:22px;line-height:0;box-shadow:0 24px 70px rgba(0,0,0,.55)}
  .caption{color:#8fa3ba;font-size:25px;font-weight:700;letter-spacing:.3px}
  .caption b{color:#dce7f5}
  .caption span{color:#5eead4}
</style></head><body>
  <div class="plate">${svg}</div>
  <p class="caption"><b>QR Code Generator</b> &nbsp;&middot;&nbsp; <span>qr.mbrk.eu</span></p>
</body></html>`;

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.screenshot({ path: OUT });

// Decode the finished PNG to prove the QR still scans.
const dataUrl = 'data:image/png;base64,' + readFileSync(OUT).toString('base64');
await page.addScriptTag({ content: readFileSync('node_modules/jsqr/dist/jsQR.js', 'utf8') });
const decoded = await page.evaluate(async (src) => {
  const img = new Image();
  img.src = src;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const px = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const found = window.jsQR(px.data, px.width, px.height);
  return found ? found.data : null;
}, dataUrl);

await browser.close();

console.log(`Wrote ${OUT} (${WIDTH}x${HEIGHT}), QR modules: ${count}x${count}`);
console.log(`Decoded: ${decoded ?? 'FAILED to decode'}`);
if (decoded !== DATA) {
  console.error(`Expected the QR to decode to "${DATA}"`);
  process.exit(1);
}
