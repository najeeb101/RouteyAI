// Builds the Google Play store graphics.
//
//   node scripts/store-graphics/build.mjs
//
// Writes to mobile/store/:
//   feature-graphic.jpg  1024 × 500, the banner at the top of the Play listing (JPEG, so no alpha channel)
//   play-icon.png        512 × 512, Play's hi-res icon, scaled down from mobile/assets/icon.png
// The banner puts the logo and two lines of copy over the landing page's Aspire map, with a route to Aspire Academy
// drawn along real streets. Uses the "R" mark from the temp logo and Inter from the mobile app's fonts; re-run when
// the logo changes. Rendering runs in headless Chrome or Edge (canvas), like scripts/app-icons/build.mjs.

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const OUT = join(ROOT, 'mobile/store')
const LOGO = join(ROOT, 'public/assets/brand/RouteyAI logo temp.png')
const MAP = join(ROOT, 'public/assets/maps/aspire-light-c0dda3e0.webp')
const ICON = join(ROOT, 'mobile/assets/icon.png')
const FONTS = join(ROOT, 'mobile/node_modules/@expo-google-fonts/inter')

const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
]

const b64 = (path) => readFileSync(path).toString('base64')
const font = (weight, file) => `new FontFace('Inter', 'url(data:font/ttf;base64,${b64(join(FONTS, file))})', { weight: '${weight}' })`

// Map placement: the 2160 × 1600 map drawn at MAP_SCALE with its top-left corner at MAP_X, MAP_Y.
const MAP_SCALE = 0.5
const MAP_X = 278
const MAP_Y = -90
// Route in map pixels, along the streets west of Aspire Academy: up the park road, west along the park's edge,
// north on Baaya Street, then east on Khaleeji 23 Street to the school.
const ROUTE = [
  [1102, 1180], [1102, 956], [864, 956], [864, 394], [972, 397], [1080, 416], [1210, 443], [1345, 480],
]
const STOPS = [[1102, 1080], [980, 956], [864, 700]]
const BUS = [864, 520]
const SCHOOL = ROUTE[ROUTE.length - 1]

const page = `<!doctype html><html><head><meta charset="utf-8"></head><body><script>
const W = 1024, H = 500;
const ROUTE = ${JSON.stringify(ROUTE)}, STOPS = ${JSON.stringify(STOPS)}, BUS = ${JSON.stringify(BUS)}, SCHOOL = ${JSON.stringify(SCHOOL)};
const at = ([x, y]) => [x * ${MAP_SCALE} + ${MAP_X}, y * ${MAP_SCALE} + ${MAP_Y}];
const load = (src) => new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fail; i.src = src; });

function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

async function main() {
  for (const f of [${font(500, 'Inter_500Medium.ttf')}, ${font(700, 'Inter_700Bold.ttf')}, ${font(800, 'Inter_800ExtraBold.ttf')}]) {
    document.fonts.add(await f.load());
  }
  const [logo, map, icon] = await Promise.all([
    load('data:image/png;base64,${b64(LOGO)}'),
    load('data:image/webp;base64,${b64(MAP)}'),
    load('data:image/png;base64,${b64(ICON)}'),
  ]);

  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingQuality = 'high';

  // Map, then a navy panel on the left that fades into it.
  ctx.fillStyle = '#0B1F4D'; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(map, ${MAP_X}, ${MAP_Y}, map.width * ${MAP_SCALE}, map.height * ${MAP_SCALE});
  const fade = ctx.createLinearGradient(0, 0, W, 0);
  fade.addColorStop(0, 'rgba(11,31,77,1)');
  fade.addColorStop(0.44, 'rgba(15,40,100,0.97)');
  fade.addColorStop(0.62, 'rgba(30,58,138,0.25)');
  fade.addColorStop(0.75, 'rgba(30,58,138,0)');
  ctx.fillStyle = fade; ctx.fillRect(0, 0, W, H);

  // Route: white casing under a navy line, like the app map.
  const path = () => { ctx.beginPath(); ROUTE.map(at).forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); };
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  path(); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 11; ctx.stroke();
  path(); ctx.strokeStyle = '#1E3A8A'; ctx.lineWidth = 6; ctx.stroke();

  for (const s of STOPS) {
    const [x, y] = at(s);
    ctx.beginPath(); ctx.arc(x, y, 7.5, 0, Math.PI * 2); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    ctx.lineWidth = 3.5; ctx.strokeStyle = '#1E3A8A'; ctx.stroke();
  }

  // School: navy pin with a white dot.
  { const [x, y] = at(SCHOOL);
    ctx.save(); ctx.shadowColor = 'rgba(15,23,42,0.35)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
    ctx.beginPath(); ctx.arc(x, y - 22, 13, Math.PI * 0.82, Math.PI * 0.18); ctx.lineTo(x, y); ctx.closePath();
    ctx.fillStyle = '#1E3A8A'; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(x, y - 22, 5, 0, Math.PI * 2); ctx.fillStyle = '#FFFFFF'; ctx.fill(); }

  // Live bus: sky halo, white ring, navy dot.
  { const [x, y] = at(BUS);
    ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fillStyle = 'rgba(56,189,248,0.28)'; ctx.fill();
    ctx.save(); ctx.shadowColor = 'rgba(15,23,42,0.35)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
    ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fillStyle = '#1E3A8A'; ctx.fill();

    // ETA card beside the bus.
    const cx = x + 26, cy = y - 30, cw = 178, ch = 60;
    ctx.save(); ctx.shadowColor = 'rgba(15,23,42,0.22)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
    roundRect(ctx, cx, cy, cw, ch, 14); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(cx + 18, cy + 21, 4.5, 0, Math.PI * 2); ctx.fillStyle = '#10B981'; ctx.fill();
    ctx.fillStyle = '#64748B'; ctx.font = '500 13px Inter'; ctx.fillText('Bus 3 · On time', cx + 30, cy + 25.5);
    ctx.fillStyle = '#0F172A'; ctx.font = '800 20px Inter'; ctx.fillText('4 min away', cx + 14, cy + 49); }

  // Logo tile: the "R" mark, cut from the temp logo (above the wordmark), on a white rounded square.
  const src = document.createElement('canvas'); src.width = logo.width; src.height = logo.height;
  const sctx = src.getContext('2d'); sctx.drawImage(logo, 0, 0);
  const px = sctx.getImageData(0, 0, logo.width, logo.height).data;
  let minX = logo.width, minY = logo.height, maxX = 0, maxY = 0;
  for (let y = 0; y < logo.height * 0.6; y++) for (let x = 0; x < logo.width; x++) {
    const i = (y * logo.width + x) * 4;
    if (Math.max(255 - px[i], 255 - px[i + 1], 255 - px[i + 2]) > 128) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
  }
  const tx = 64, ty = 118, ts = 84;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 4;
  roundRect(ctx, tx, ty, ts, ts, 20); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.restore();
  { const mw = maxX - minX + 1, mh = maxY - minY + 1, s = 52 / Math.max(mw, mh);
    ctx.drawImage(logo, minX, minY, mw, mh, tx + (ts - mw * s) / 2, ty + (ts - mh * s) / 2, mw * s, mh * s); }

  // Wordmark and copy.
  ctx.font = '800 58px Inter'; ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Routey', 62, 268);
  const routey = ctx.measureText('Routey').width;
  ctx.fillStyle = '#38BDF8'; ctx.fillText('AI', 62 + routey + 1, 268);
  ctx.font = '500 25px Inter'; ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.fillText('Smarter school bus routes.', 64, 318);
  ctx.fillText('Live bus tracking for parents.', 64, 352);

  const out = (id, data) => { const pre = document.createElement('pre'); pre.id = id; pre.textContent = data.split(',')[1]; document.body.appendChild(pre); };
  out('feature-graphic.jpg', c.toDataURL('image/jpeg', 0.92));

  const ic = document.createElement('canvas'); ic.width = 512; ic.height = 512;
  const ictx = ic.getContext('2d'); ictx.imageSmoothingQuality = 'high'; ictx.drawImage(icon, 0, 0, 512, 512);
  out('play-icon.png', ic.toDataURL('image/png'));
  document.body.setAttribute('data-done', '1');
}
main().catch((e) => { document.body.setAttribute('data-done', 'error'); document.body.textContent = 'ERROR ' + e; });
</script></body></html>`

const browser = BROWSERS.find((path) => existsSync(path))
if (!browser) throw new Error('Chrome or Edge not found')

const work = join(tmpdir(), `routeyai-store-${process.pid}`)
mkdirSync(work, { recursive: true })
const html = join(work, 'store.html')
writeFileSync(html, page)

const result = spawnSync(
  browser,
  ['--headless=new', '--disable-gpu', `--user-data-dir=${join(work, 'profile')}`, '--virtual-time-budget=20000', '--dump-dom', `file:///${html.replace(/\\/g, '/')}`],
  { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
)
rmSync(work, { recursive: true, force: true })

const dom = result.stdout ?? ''
if (!dom.includes('data-done="1"')) throw new Error(`Rendering failed: ${result.stderr || dom.slice(0, 500)}`)

mkdirSync(OUT, { recursive: true })
for (const name of ['feature-graphic.jpg', 'play-icon.png']) {
  const match = dom.match(new RegExp(`<pre id="${name.replace('.', '\\.')}">([^<]+)</pre>`))
  if (!match) throw new Error(`Missing ${name}`)
  writeFileSync(join(OUT, name), Buffer.from(match[1], 'base64'))
  console.log(`mobile/store/${name}`)
}
