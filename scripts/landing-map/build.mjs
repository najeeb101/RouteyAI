/**
 * Builds the route-planner map on the landing page ("How it works") from real OpenStreetMap data
 * around Aspire Park, Doha. Map data © OpenStreetMap contributors, available under the ODbL; the page credits it.
 *
 *   node scripts/landing-map/build.mjs [--osm cached.json] [--preview preview.png]
 *
 * What it does:
 *  1. Downloads roads, parks, water and buildings from the Overpass API (or reads a cached download).
 *  2. Picks a school and 27 homes on real residential streets in three neighbourhoods.
 *  3. Groups the homes with the same K-Means steps the demo animates, then orders each group's stops
 *     (nearest next stop by drive time) and routes them along the road network to the school, respecting one-way streets.
 *  4. Draws the base map as light and dark SVGs and renders them to WebP with headless Chrome
 *     (public/assets/maps/aspire-{light,dark}.webp).
 *  5. Writes the overlay data to src/components/landing/optimizeDemoData.ts.
 *
 * Needs Node 22+ and Chrome (set CHROME_PATH if it is not in the default Windows location).
 */
import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, i, all) => (arg.startsWith('--') ? [...pairs, [arg.slice(2), all[i + 1]]] : pairs), [])
)

// ---------------------------------------------------------------- configuration

/** South, west, north, east. About 3.0 km by 2.2 km, the same shape as the 540 x 400 map. */
const BBOX = { s: 25.255, w: 51.425, n: 25.275, e: 51.455 }
const W = 540
const H = 400
/** Where to put the school, and the three neighbourhoods the homes come from (map units). */
const SCHOOL_TARGET = { x: 262, y: 236 }
const NEIGHBOURHOODS = [
  { x: 55, y: 255, r: 48 },
  { x: 300, y: 48, r: 42 },
  { x: 495, y: 190, r: 44 },
]
const HOMES_PER_NEIGHBOURHOOD = 9
/** Deliberately poor starting centres, so the demo shows them moving into place. */
const INITIAL_CENTROIDS = [
  { x: 200, y: 110 },
  { x: 250, y: 210 },
  { x: 330, y: 290 },
]
const LABELLED_ROADS = ['Al Furousiya Street', 'Al Waab Street', 'Khaleeji 23 Street', 'Asiad 2006 Street', 'Baaya Street']
/** Rough driving speeds (km/h) per road class, so routes prefer main roads like a real drive-time matrix would. */
const SPEED = { trunk: 80, primary: 60, secondary: 50, tertiary: 40, unclassified: 30, residential: 25, living_street: 15 }

const STYLES = {
  light: {
    land: '#EDF1F6', green: '#D3EACD', pitch: '#C2E0BB', water: '#B9D5F0', building: '#DCE2EB',
    service: '#FFFFFF', casing: ['#CDD5E1', '#C3CDDC', '#BAC5D7'], fill: ['#FFFFFF', '#FFFFFF', '#FFFFFF'],
    label: '#66748D', halo: '#EDF1F6', parkLabel: '#4A7A46',
  },
  dark: {
    land: '#0B1430', green: '#0F2A2C', pitch: '#123530', water: '#0C2A4E', building: '#131D3A',
    service: '#18244A', casing: ['#070D22', '#060B1E', '#050A1A'], fill: ['#1C2A4B', '#23345C', '#2B3F6D'],
    label: '#8492B1', halo: '#0B1430', parkLabel: '#5FA08C',
  },
}

// ---------------------------------------------------------------- helpers

const px = lon => ((lon - BBOX.w) / (BBOX.e - BBOX.w)) * W
const py = lat => ((BBOX.n - lat) / (BBOX.n - BBOX.s)) * H
const round1 = n => Math.round(n * 10) / 10
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
/** Metres per map unit, from the box width at this latitude. */
const METERS_PER_UNIT = ((BBOX.e - BBOX.w) * 111320 * Math.cos((((BBOX.n + BBOX.s) / 2) * Math.PI) / 180)) / W

function mulberry32(seed) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

class MinHeap {
  items = []
  push(item) {
    const a = this.items
    a.push(item)
    let i = a.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (a[p][0] <= a[i][0]) break
      ;[a[p], a[i]] = [a[i], a[p]]
      i = p
    }
  }
  pop() {
    const a = this.items
    const top = a[0]
    const last = a.pop()
    if (a.length > 0 && last) {
      a[0] = last
      let i = 0
      for (;;) {
        const l = 2 * i + 1
        const r = l + 1
        let m = i
        if (l < a.length && a[l][0] < a[m][0]) m = l
        if (r < a.length && a[r][0] < a[m][0]) m = r
        if (m === i) break
        ;[a[m], a[i]] = [a[i], a[m]]
        i = m
      }
    }
    return top
  }
  get size() {
    return this.items.length
  }
}

/** Ramer-Douglas-Peucker line simplification. */
function simplify(points, tolerance) {
  if (points.length < 3) return points
  const keep = new Array(points.length).fill(false)
  keep[0] = keep[points.length - 1] = true
  const stack = [[0, points.length - 1]]
  while (stack.length) {
    const [s, e] = stack.pop()
    let max = 0
    let index = -1
    const a = points[s]
    const b = points[e]
    const len = dist(a, b) || 1
    for (let i = s + 1; i < e; i++) {
      const p = points[i]
      const d = Math.abs((b.x - a.x) * (a.y - p.y) - (a.x - p.x) * (b.y - a.y)) / len
      if (d > max) {
        max = d
        index = i
      }
    }
    if (max > tolerance && index > 0) {
      keep[index] = true
      stack.push([s, index], [index, e])
    }
  }
  return points.filter((_, i) => keep[i])
}

const toPath = points => points.map((p, i) => `${i ? 'L' : 'M'}${round1(p.x)} ${round1(p.y)}`).join(' ')

// ---------------------------------------------------------------- 1. OSM data

async function loadOsm() {
  if (args.osm) return JSON.parse(readFileSync(args.osm, 'utf8'))
  const b = `${BBOX.s},${BBOX.w},${BBOX.n},${BBOX.e}`
  const query = `[out:json][timeout:90];(
    way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link|service)$"](${b});
    way["leisure"~"^(park|pitch|garden)$"](${b});
    way["landuse"~"^(grass|recreation_ground)$"](${b});
    way["natural"~"^(water|coastline)$"](${b});
    way["building"](${b});
  );out geom;`
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'User-Agent': 'RouteyAI-landing-map/1.0', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  })
  if (!res.ok) throw new Error(`Overpass request failed: ${res.status}`)
  return res.json()
}

// ---------------------------------------------------------------- 2. road graph

function roadClass(highway) {
  const base = highway.replace(/_link$/, '')
  if (base === 'motorway') return 'trunk'
  return SPEED[base] ? base : null
}

function buildGraph(ways) {
  const nodes = new Map() // id -> { x, y, out: [[to, seconds]], in: [[from, seconds]], residential, degree }
  const node = (id, p) => {
    let n = nodes.get(id)
    if (!n) nodes.set(id, (n = { id, x: px(p.lon), y: py(p.lat), out: [], in: [], residential: false, neighbours: new Set() }))
    return n
  }
  const inside = n => n.x > 1 && n.x < W - 1 && n.y > 1 && n.y < H - 1
  for (const way of ways) {
    const cls = roadClass(way.tags.highway)
    if (!cls) continue
    const oneway = way.tags.oneway === 'yes' || way.tags.oneway === '1' || way.tags.junction === 'roundabout' || way.tags.highway.startsWith('motorway')
    const reverse = way.tags.oneway === '-1'
    const speed = (SPEED[cls] * 1000) / 3600
    for (let i = 0; i < way.nodes.length - 1; i++) {
      const a = node(way.nodes[i], way.geometry[i])
      const b = node(way.nodes[i + 1], way.geometry[i + 1])
      if (cls === 'residential' || cls === 'living_street') a.residential = b.residential = true
      if (!inside(a) || !inside(b)) continue
      a.neighbours.add(b.id)
      b.neighbours.add(a.id)
      const seconds = (dist(a, b) * METERS_PER_UNIT) / speed
      if (!reverse) {
        a.out.push([b.id, seconds])
        b.in.push([a.id, seconds])
      }
      if (!oneway || reverse) {
        b.out.push([a.id, seconds])
        a.in.push([b.id, seconds])
      }
    }
  }
  return nodes
}

/** Drive times from `source` to every node (or to `source` from every node, with `reverse`). */
function dijkstra(nodes, source, reverse = false) {
  const time = new Map([[source, 0]])
  const prev = new Map()
  const heap = new MinHeap()
  heap.push([0, source])
  while (heap.size) {
    const [t, id] = heap.pop()
    if (t > (time.get(id) ?? Infinity)) continue
    for (const [next, cost] of reverse ? nodes.get(id).in : nodes.get(id).out) {
      const nt = t + cost
      if (nt < (time.get(next) ?? Infinity)) {
        time.set(next, nt)
        prev.set(next, id)
        heap.push([nt, next])
      }
    }
  }
  return { time, prev }
}

function pathBetween(prev, from, to) {
  const ids = [to]
  while (ids[0] !== from) {
    const p = prev.get(ids[0])
    if (p === undefined) throw new Error('no path')
    ids.unshift(p)
  }
  return ids
}

// ---------------------------------------------------------------- 3. homes, K-Means, routes

function kMeans(points, initial, maxIterations = 8) {
  const history = []
  let centroids = initial
  for (let iter = 0; iter < maxIterations; iter++) {
    const assignment = points.map(p => {
      const d = centroids.map(c => dist(p, c))
      return d.indexOf(Math.min(...d))
    })
    history.push({ centroids, assignment })
    const next = centroids.map((c, k) => {
      const members = points.filter((_, i) => assignment[i] === k)
      if (!members.length) return c
      return {
        x: round1(members.reduce((s, p) => s + p.x, 0) / members.length),
        y: round1(members.reduce((s, p) => s + p.y, 0) / members.length),
      }
    })
    const settled = next.every((c, k) => dist(c, centroids[k]) < 0.5)
    centroids = next
    if (settled) break
  }
  return history
}

function plan(nodes) {
  const all = [...nodes.values()].filter(n => n.out.length && n.in.length)
  const school = all
    .filter(n => !n.residential || n.neighbours.size >= 2)
    .sort((a, b) => dist(a, SCHOOL_TARGET) - dist(b, SCHOOL_TARGET))[0]
  const toSchool = dijkstra(nodes, school.id, true).time
  const fromSchool = dijkstra(nodes, school.id).time
  const rand = mulberry32(2026)

  const homes = []
  for (const area of NEIGHBOURHOODS) {
    // Only streets you can drive to and from the school, so every stop can reach every other stop.
    const candidates = all.filter(
      n =>
        n.residential &&
        n.neighbours.size === 2 &&
        dist(n, area) < area.r &&
        toSchool.has(n.id) &&
        fromSchool.has(n.id)
    )
    const picked = []
    let guard = 0
    while (picked.length < HOMES_PER_NEIGHBOURHOOD && guard++ < 5000) {
      const c = candidates[Math.floor(rand() * candidates.length)]
      if (c && picked.every(p => dist(p, c) > 11)) picked.push(c)
    }
    if (picked.length < HOMES_PER_NEIGHBOURHOOD) throw new Error(`only ${picked.length} homes found near ${JSON.stringify(area)}`)
    homes.push(...picked)
  }

  const points = homes.map(n => ({ x: round1(n.x), y: round1(n.y) }))
  const history = kMeans(points, INITIAL_CENTROIDS)
  const final = history[history.length - 1]

  const routes = INITIAL_CENTROIDS.map((_, k) => {
    const members = homes.filter((_, i) => final.assignment[i] === k)
    // Start at the stop furthest (by drive time) from school, then always drive to the nearest remaining stop.
    const remaining = [...members].sort((a, b) => toSchool.get(b.id) - toSchool.get(a.id))
    const order = [remaining.shift()]
    let ids = []
    while (remaining.length) {
      const from = order[order.length - 1]
      const { time, prev } = dijkstra(nodes, from.id)
      remaining.sort((a, b) => (time.get(a.id) ?? Infinity) - (time.get(b.id) ?? Infinity))
      const next = remaining.shift()
      ids = ids.concat(pathBetween(prev, from.id, next.id).slice(ids.length ? 1 : 0))
      order.push(next)
    }
    const last = order[order.length - 1]
    const { prev } = dijkstra(nodes, last.id)
    ids = ids.length ? ids.concat(pathBetween(prev, last.id, school.id).slice(1)) : pathBetween(prev, last.id, school.id)
    const line = simplify(ids.map(id => nodes.get(id)), 0.35)
    return { path: toPath(line), stops: order.length, start: { x: round1(order[0].x), y: round1(order[0].y) } }
  })

  return { school: { x: round1(school.x), y: round1(school.y) }, points, history, routes }
}

// ---------------------------------------------------------------- 4. base map

function baseMapSvg(osm, style, scale) {
  const layers = { green: [], pitch: [], water: [], building: [], service: [], roads: [[], [], []] }
  const labelPaths = []
  const shape = g => g.map((p, i) => `${i ? 'L' : 'M'}${round1(px(p.lon))} ${round1(py(p.lat))}`).join('')
  for (const e of osm.elements) {
    if (!e.geometry) continue
    const t = e.tags || {}
    if (t.natural === 'water') layers.water.push(`${shape(e.geometry)}Z`)
    else if (t.leisure === 'pitch') layers.pitch.push(`${shape(e.geometry)}Z`)
    else if (t.leisure || t.landuse) layers.green.push(`${shape(e.geometry)}Z`)
    else if (t.building) layers.building.push(`${shape(e.geometry)}Z`)
    else if (t.highway === 'service') layers.service.push(shape(e.geometry))
    else if (t.highway) {
      const cls = roadClass(t.highway)
      if (!cls) continue
      const tier = cls === 'trunk' || cls === 'primary' ? 2 : cls === 'secondary' || cls === 'tertiary' ? 1 : 0
      layers.roads[tier].push(shape(e.geometry))
    }
  }
  const widths = [
    [3.3, 2.2],
    [4.9, 3.6],
    [6.4, 4.9],
  ]

  // Label each chosen road along its longest piece, drawn left to right so the text is upright.
  for (const name of LABELLED_ROADS) {
    const pieces = osm.elements.filter(e => e.tags?.highway && (e.tags['name:en'] || e.tags.name) === name && e.geometry)
    const longest = pieces
      .map(e => e.geometry.map(p => ({ x: px(p.lon), y: py(p.lat) })).filter(p => p.x > 20 && p.x < W - 20 && p.y > 14 && p.y < H - 14))
      .sort((a, b) => b.reduce((s, p, i) => s + (i ? dist(p, b[i - 1]) : 0), 0) - a.reduce((s, p, i) => s + (i ? dist(p, a[i - 1]) : 0), 0))[0]
    if (!longest || longest.length < 2) continue
    const pts = longest[0].x > longest[longest.length - 1].x ? [...longest].reverse() : longest
    const vertical = Math.abs(pts[0].x - pts[pts.length - 1].x) < Math.abs(pts[0].y - pts[pts.length - 1].y)
    labelPaths.push({ name, d: toPath(vertical && pts[0].y < pts[pts.length - 1].y ? [...pts].reverse() : pts) })
  }
  const park = osm.elements.find(e => e.tags?.leisure === 'park' && /Aspire/.test(e.tags.name || e.tags['name:en'] || ''))
  const parkCentre = park && {
    x: park.geometry.reduce((s, p) => s + px(p.lon), 0) / park.geometry.length,
    y: park.geometry.reduce((s, p) => s + py(p.lat), 0) / park.geometry.length,
  }

  const s = style
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * scale}" height="${H * scale}">
<defs>${labelPaths.map((l, i) => `<path id="road-${i}" d="${l.d}"/>`).join('')}</defs>
<rect width="${W}" height="${H}" fill="${s.land}"/>
<path d="${layers.green.join('')}" fill="${s.green}"/>
<path d="${layers.pitch.join('')}" fill="${s.pitch}"/>
<path d="${layers.water.join('')}" fill="${s.water}"/>
<path d="${layers.building.join('')}" fill="${s.building}"/>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
<path d="${layers.service.join('')}" stroke="${s.service}" stroke-width="0.9"/>
${[0, 1, 2].map(t => `<path d="${layers.roads[t].join('')}" stroke="${s.casing[t]}" stroke-width="${widths[t][0]}"/>`).join('\n')}
${[0, 1, 2].map(t => `<path d="${layers.roads[t].join('')}" stroke="${s.fill[t]}" stroke-width="${widths[t][1]}"/>`).join('\n')}
</g>
<g font-family="Inter, 'Segoe UI', Arial, sans-serif" font-size="6.4" font-weight="500" fill="${s.label}" stroke="${s.halo}" stroke-width="2.2" paint-order="stroke" stroke-linejoin="round">
${labelPaths.map((l, i) => `<text dy="2.2"><textPath href="#road-${i}" startOffset="50%" text-anchor="middle">${l.name}</textPath></text>`).join('\n')}
${parkCentre ? `<text x="${round1(parkCentre.x)}" y="${round1(parkCentre.y + 40)}" text-anchor="middle" font-size="8" font-style="italic" font-weight="600" fill="${s.parkLabel}">Aspire Park</text>` : ''}
</g>
</svg>`
}

// ---------------------------------------------------------------- rendering with headless Chrome

async function renderWebp(svgPath, outPath, width, height) {
  const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  const port = 9400 + Math.floor(Math.random() * 400)
  const chrome = spawn(chromePath, ['--headless=new', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${join(tmpdir(), `landing-map-${port}`)}`, 'about:blank'], { stdio: 'ignore' })
  const sleep = ms => new Promise(r => setTimeout(r, ms))
  let wsUrl
  for (let i = 0; i < 50 && !wsUrl; i++) {
    await sleep(200)
    try {
      wsUrl = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page')?.webSocketDebuggerUrl
    } catch {}
  }
  const ws = new WebSocket(wsUrl)
  await new Promise(r => ws.addEventListener('open', r))
  let id = 0
  const pending = new Map()
  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) pending.get(m.id)(m) || pending.delete(m.id)
  })
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
  // An HTML wrapper so the labels can use Inter from Google Fonts.
  const html = join(dirname(svgPath), `${Date.now()}.html`)
  writeFileSync(html, `<!doctype html><html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600&display=block"><style>html,body{margin:0}</style></head><body>${readFileSync(svgPath, 'utf8')}</body></html>`)
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false })
  await send('Page.enable')
  await send('Page.navigate', { url: `file:///${html.replace(/\\/g, '/')}` })
  await sleep(2500)
  const shot = await send('Page.captureScreenshot', { format: 'webp', quality: 90 })
  writeFileSync(outPath, Buffer.from(shot.result.data, 'base64'))
  ws.close()
  chrome.kill()
}

// ---------------------------------------------------------------- main

const osm = await loadOsm()
const nodes = buildGraph(osm.elements.filter(e => e.tags?.highway && e.nodes && e.geometry))
const result = plan(nodes)

const work = join(tmpdir(), 'routeyai-landing-map')
mkdirSync(work, { recursive: true })
mkdirSync(join(ROOT, 'public/assets/maps'), { recursive: true })
const SCALE = 4
for (const theme of ['light', 'dark']) {
  const svgPath = join(work, `aspire-${theme}.svg`)
  writeFileSync(svgPath, baseMapSvg(osm, STYLES[theme], SCALE))
  await renderWebp(svgPath, join(ROOT, `public/assets/maps/aspire-${theme}.webp`), W * SCALE, H * SCALE)
}

const last = result.history[result.history.length - 1]
const data = `/**
 * Data for the landing-page route planner. Generated by scripts/landing-map/build.mjs; do not edit by hand.
 * Homes and the school sit on real streets around Aspire Park, Doha (map data © OpenStreetMap contributors, ODbL).
 * The K-Means history is a real run from deliberately poor starting centres, and each route follows the road network,
 * one-way streets included, from the first stop to the school.
 */

export interface Point {
  x: number
  y: number
}

export interface KMeansStep {
  centroids: Point[]
  assignment: number[]
}

/** Map units; the base map images use the same 540 x 400 frame. */
export const MAP_WIDTH = ${W}
export const MAP_HEIGHT = ${H}
/** Real-world metres per map unit, for the scale bar. */
export const METERS_PER_UNIT = ${round1(METERS_PER_UNIT)}

export const SCHOOL: Point = ${JSON.stringify(result.school)}
export const CLUSTER_COUNT = ${INITIAL_CENTROIDS.length}

export const HOMES: Point[] = ${JSON.stringify(result.points)}

export const KMEANS_HISTORY: KMeansStep[] = ${JSON.stringify(result.history)}

export const FINAL_SNAPSHOT: KMeansStep = ${JSON.stringify(last)}
export const FINAL_ASSIGNMENT = FINAL_SNAPSHOT.assignment

/** Road-following route for each bus, from its first stop to the school. */
export const ROUTE_PATHS: string[] = ${JSON.stringify(result.routes.map(r => r.path), null, 2)}

/** First stop of each route, where its driver label sits. */
export const ROUTE_STARTS: Point[] = ${JSON.stringify(result.routes.map(r => r.start))}
`
writeFileSync(join(ROOT, 'src/components/landing/optimizeDemoData.ts'), data)

console.log('school', result.school)
console.log('k-means iterations', result.history.length, 'stops per route', result.routes.map(r => r.stops))
console.log('route path lengths (chars)', result.routes.map(r => r.path.length))

// Optional: a quick composite of the light map with homes, routes and school, for checking the layout.
if (args.preview) {
  const colors = ['#3B82F6', '#DB2777', '#0891B2']
  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}">
<image href="file:///${join(ROOT, 'public/assets/maps/aspire-light.webp').replace(/\\/g, '/')}" width="${W}" height="${H}"/>
${result.routes.map((r, k) => `<path d="${r.path}" fill="none" stroke="${colors[k]}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`).join('')}
${result.points.map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="${colors[last.assignment[i]]}" stroke="#fff" stroke-width="1.2"/>`).join('')}
<rect x="${result.school.x - 6}" y="${result.school.y - 6}" width="12" height="12" rx="3" fill="#1E3A8A" stroke="#fff" stroke-width="1.5"/>
${NEIGHBOURHOODS.map(a => `<circle cx="${a.x}" cy="${a.y}" r="${a.r}" fill="none" stroke="#f59e0b" stroke-dasharray="3 3"/>`).join('')}
</svg>`
  const svgPath = join(work, 'preview.svg')
  writeFileSync(svgPath, overlay)
  await renderWebp(svgPath, args.preview, W * 2, H * 2)
  console.log('preview', args.preview)
}
process.exit(0)
