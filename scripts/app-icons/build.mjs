// Builds the mobile app icons and splash image from the brand logo.
//
//   node scripts/app-icons/build.mjs
//
// Takes the "R" mark from public/assets/brand/RouteyAI logo temp.png (the wordmark underneath is left out), turns
// its white background transparent, and writes to mobile/assets/:
//   icon.png               1024 × 1024, mark on white (App Store icons can't be transparent)
//   adaptive-icon.png      1024 × 1024, transparent, mark inside Android's adaptive-icon safe circle
//   splash-icon.png        1024 × 1024, transparent, mark only (expo-splash-screen centres it on the background)
//   notification-icon.png  96 × 96, white silhouette (Android draws notification icons in one colour)
// Rendering runs in headless Chrome or Edge (canvas), so nothing needs installing. Re-run when the logo changes.

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const SOURCE = join(ROOT, 'public/assets/brand/RouteyAI logo temp.png')
const OUT = join(ROOT, 'mobile/assets')
/** The mark sits above this line in the source; the wordmark is below it. */
const MARK_MAX_Y = 0.6

const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
]

// [file, canvas size, mark box size (fits inside), background or null, white silhouette]
const OUTPUTS = [
  ['icon.png', 1024, 600, '#FFFFFF', false],
  ['adaptive-icon.png', 1024, 440, null, false],
  ['splash-icon.png', 1024, 900, null, false],
  ['notification-icon.png', 96, 80, null, true],
]

const page = `<!doctype html><html><body><script>
const outputs = ${JSON.stringify(OUTPUTS)};
const img = new Image();
img.onload = () => {
  const W = img.width, H = img.height;
  const src = document.createElement('canvas');
  src.width = W; src.height = H;
  const sctx = src.getContext('2d');
  sctx.drawImage(img, 0, 0);
  const data = sctx.getImageData(0, 0, W, H);
  const px = data.data;

  // White to transparent: the smallest alpha that explains each pixel as a colour drawn over white.
  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const r = px[i], g = px[i + 1], b = px[i + 2];
    let a = Math.max(255 - r, 255 - g, 255 - b) / 255;
    if (a < 0.06 || y > H * ${MARK_MAX_Y}) a = 0;
    if (a > 0) {
      px[i] = 255 - (255 - r) / a; px[i + 1] = 255 - (255 - g) / a; px[i + 2] = 255 - (255 - b) / a;
      if (a > 0.5) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
    }
    px[i + 3] = Math.round(a * 255);
  }
  sctx.putImageData(data, 0, 0);
  const mw = maxX - minX + 1, mh = maxY - minY + 1;

  for (const [name, size, box, bg, silhouette] of outputs) {
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, size, size); }
    const scale = box / Math.max(mw, mh);
    const dw = mw * scale, dh = mh * scale;
    ctx.drawImage(src, minX, minY, mw, mh, (size - dw) / 2, (size - dh) / 2, dw, dh);
    if (silhouette) { ctx.globalCompositeOperation = 'source-in'; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, size, size); }
    const pre = document.createElement('pre');
    pre.id = name;
    pre.textContent = c.toDataURL('image/png').split(',')[1];
    document.body.appendChild(pre);
  }
  document.body.setAttribute('data-done', mw + 'x' + mh);
};
img.src = 'data:image/png;base64,${readFileSync(SOURCE).toString('base64')}';
</script></body></html>`

const browser = BROWSERS.find((path) => existsSync(path))
if (!browser) throw new Error('Chrome or Edge not found')

const work = join(tmpdir(), `routeyai-icons-${process.pid}`)
mkdirSync(work, { recursive: true })
const html = join(work, 'icons.html')
writeFileSync(html, page)

const result = spawnSync(
  browser,
  ['--headless=new', '--disable-gpu', `--user-data-dir=${join(work, 'profile')}`, '--virtual-time-budget=20000', '--dump-dom', `file:///${html.replace(/\\/g, '/')}`],
  { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
)
rmSync(work, { recursive: true, force: true })

const dom = result.stdout ?? ''
if (!dom.includes('data-done')) throw new Error(`Rendering failed: ${result.stderr || dom.slice(0, 500)}`)

mkdirSync(OUT, { recursive: true })
for (const [name] of OUTPUTS) {
  const match = dom.match(new RegExp(`<pre id="${name.replace('.', '\\.')}">([^<]+)</pre>`))
  if (!match) throw new Error(`Missing ${name}`)
  writeFileSync(join(OUT, name), Buffer.from(match[1], 'base64'))
  console.log(`mobile/assets/${name}`)
}
