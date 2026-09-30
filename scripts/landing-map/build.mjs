/**
 * Builds the route-planner map on the landing page ("How it works") from real OpenStreetMap data
 * around Aspire Park, Doha. Map data © OpenStreetMap contributors, available under the ODbL; the page credits it.
 *
 *   node scripts/landing-map/build.mjs [--osm cached.json] [--preview preview.png] [--plan-only]
 *
 * What it does:
 *  1. Downloads roads, parks, water and buildings from the Overpass API (or reads a cached download).
 *  2. Picks a school and 27 homes on real residential streets in three neighbourhoods.
 *  3. Groups the homes with the same K-Means steps the demo animates, then orders each group's stops
 *     (nearest next stop by drive time) and routes them along the road network to the school, respecting one-way streets.
 *  4. Draws the base map as light and dark SVGs and renders them to WebP with headless Chrome
 *     (public/assets/maps/aspire-{light,dark}.webp).
 *  5. Writes the overlay data to src/components/landing/optimizeDemoData.ts.
 *  6. Renders close-up maps of Bus 3 for the phone mockups (public/assets/maps/phone-{driver,parent}.webp) and
 *     writes their data to src/components/landing/appMapData.ts.
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
/**
 * Close-up maps for the landing-page phones. `route` is the planner route (0 = Bus 1), stops are indexes into its
 * stop order, width/height the CSS size of the map in the mockup, and focusY where the stretch sits vertically
 * (the mockups cover the bottom of the map with a card).
 */
const PHONE_VIEWS = [
  // Driver app route screen (Bus 1, Khalid): the stop behind, the current stop and the next two.
  { name: 'driver', route: 0, fromStop: 3, toStop: 5, width: 252, height: 132, focusY: 0.42, pad: 8 },
  // Parent app live map (Bus 3): the bus coming from the stop before up to the child's stop.
  { name: 'parent', route: 2, fromStop: 6, toStop: 7, width: 252, height: 476, focusY: 0.36, pad: 16 },
]
/** Street names on the phone maps, in CSS pixels. */
const PHONE_LABEL_PX = 8.5

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

/** English street name, if OSM has one (name:en, or a name already in Latin letters). */
function englishName(tags = {}) {
  if (tags['name:en']) return tags['name:en']
  return tags.name && /^[ -~]+$/.test(tags.name) ? tags.name : null
}

/** The street a stop is on, or the nearest named street (drivers and parents know stops by street). */
function streetName(nodes, n) {
  const own = [...n.names][0]
  if (own) return own
  let best = null
  let bestD = 30
  for (const m of nodes.values()) {
    if (!m.names.size) continue
    const d = dist(n, m)
    if (d < bestD) {
      bestD = d
      best = [...m.names][0]
    }
  }
  return best
}

function roadClass(highway) {
  const base = highway.replace(/_link$/, '')
  if (base === 'motorway') return 'trunk'
  return SPEED[base] ? base : null
}

function buildGraph(ways) {
  const nodes = new Map() // id -> { x, y, out: [[to, seconds]], in: [[from, seconds]], residential, degree }
  const node = (id, p) => {
    let n = nodes.get(id)
    if (!n) nodes.set(id, (n = { id, x: px(p.lon), y: py(p.lat), out: [], in: [], residential: false, neighbours: new Set(), names: new Set() }))
    return n
  }
  const inside = n => n.x > 1 && n.x < W - 1 && n.y > 1 && n.y < H - 1
  for (const way of ways) {
    const cls = roadClass(way.tags.highway)
    if (!cls) continue
    const oneway = way.tags.oneway === 'yes' || way.tags.oneway === '1' || way.tags.junction === 'roundabout' || way.tags.highway.startsWith('motorway')
    const reverse = way.tags.oneway === '-1'
    const speed = (SPEED[cls] * 1000) / 3600
    const name = englishName(way.tags)
    for (let i = 0; i < way.nodes.length - 1; i++) {
      const a = node(way.nodes[i], way.geometry[i])
      const b = node(way.nodes[i + 1], way.geometry[i + 1])
      if (name) a.names.add(name), b.names.add(name)
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
    const legs = []
    while (remaining.length) {
      const from = order[order.length - 1]
      const { time, prev } = dijkstra(nodes, from.id)
      remaining.sort((a, b) => (time.get(a.id) ?? Infinity) - (time.get(b.id) ?? Infinity))
      const next = remaining.shift()
      legs.push(pathBetween(prev, from.id, next.id))
      order.push(next)
    }
    const last = order[order.length - 1]
    legs.push(pathBetween(dijkstra(nodes, last.id).prev, last.id, school.id))
    // Simplify leg by leg so every stop stays an exact vertex, and record how far along the line each stop is.
    const line = []
    const stopDistances = [0]
    let length = 0
    for (const leg of legs) {
      const pts = simplify(leg.map(id => nodes.get(id)), 0.35)
      for (let i = line.length ? 1 : 0; i < pts.length; i++) {
        if (line.length) length += dist(line[line.length - 1], pts[i])
        line.push(pts[i])
      }
      stopDistances.push(round1(length))
    }
    stopDistances.pop() // the last entry is the school
    return {
      path: toPath(line),
      points: line.map(p => [round1(p.x), round1(p.y)]),
      length: round1(length),
      stops: order.map((n, i) => ({ x: round1(n.x), y: round1(n.y), at: stopDistances[i], street: streetName(nodes, n) })),
      start: { x: round1(order[0].x), y: round1(order[0].y) },
    }
  })

  return { school: { x: round1(school.x), y: round1(school.y) }, points, history, routes }
}

// ---------------------------------------------------------------- 4. base map

/** Street labels for a zoomed-in phone map: each named street's longest stretch inside the box that fits its name. */
function localStreetLabels(osm, box, fontSize) {
  const inset = fontSize * 1.2
  const inside = p => p.x > box.x + inset && p.x < box.x + box.w - inset && p.y > box.y + inset && p.y < box.y + box.h - inset
  const best = new Map() // name -> { pts, length, tier }
  for (const e of osm.elements) {
    const name = e.tags?.highway && e.geometry && englishName(e.tags)
    const cls = name && roadClass(e.tags.highway)
    if (!cls) continue
    const tier = cls === 'trunk' || cls === 'primary' ? 2 : cls === 'secondary' || cls === 'tertiary' ? 1 : 0
    // Densify so long straight segments that cross the box still count.
    const pts = []
    e.geometry.forEach((g, i) => {
      const p = { x: px(g.lon), y: py(g.lat) }
      const prev = pts[pts.length - 1]
      if (prev) {
        const steps = Math.floor(dist(prev, p) / fontSize)
        for (let k = 1; k < steps; k++) pts.push({ x: prev.x + ((p.x - prev.x) * k) / steps, y: prev.y + ((p.y - prev.y) * k) / steps })
      }
      pts.push(p)
    })
    // Stretches inside the box, split wherever the street turns more than 40 degrees, so text never bends round a corner.
    let run = []
    const runs = []
    let heading = null
    const close = () => {
      if (run.length > 1) runs.push(run)
      run = []
      heading = null
    }
    for (const p of pts) {
      if (!inside(p)) {
        close()
        continue
      }
      const prev = run[run.length - 1]
      if (prev && dist(prev, p) > 0.01) {
        const h = Math.atan2(p.y - prev.y, p.x - prev.x)
        if (heading === null) heading = h
        const turn = Math.abs(((h - heading + 3 * Math.PI) % (2 * Math.PI)) - Math.PI)
        if (turn > (40 * Math.PI) / 180) {
          close()
          run.push(prev)
          heading = h
        }
      }
      run.push(p)
    }
    close()
    for (const r of runs) {
      const length = r.reduce((sum, p, i) => sum + (i ? dist(p, r[i - 1]) : 0), 0)
      const current = best.get(name)
      if (!current || length > current.length) best.set(name, { pts: r, length, tier })
    }
  }
  const placed = []
  const labels = []
  const candidates = [...best.entries()].sort((a, b) => b[1].tier - a[1].tier || b[1].length - a[1].length)
  for (const [name, { pts, length }] of candidates) {
    if (length < name.length * fontSize * 0.55 * 1.15) continue
    // Keep only the middle stretch the text needs, so a bent street doesn't wrap the text around a corner.
    const mid = pts[Math.floor(pts.length / 2)]
    if (placed.some(q => dist(q, mid) < fontSize * 5)) continue
    placed.push(mid)
    // Text reads left to right; a street close to vertical reads bottom to top.
    let ordered = pts[0].x > pts[pts.length - 1].x ? [...pts].reverse() : pts
    const dx = ordered[ordered.length - 1].x - ordered[0].x
    const dy = ordered[ordered.length - 1].y - ordered[0].y
    if (Math.abs(dx) < Math.abs(dy) * 0.3 && dy > 0) ordered = [...ordered].reverse()
    labels.push({ name, d: toPath(ordered) })
    if (labels.length >= 7) break
  }
  return labels
}

/**
 * Draws the base map. By default the whole 540 x 400 planner map with its fixed road labels. For the phone maps,
 * `box` picks the part to draw and every named street with room for its name inside the box gets a label.
 */
function baseMapSvg(osm, style, { box = { x: 0, y: 0, w: W, h: H }, width, height, fontSize = 6.4, localLabels = false } = {}) {
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
  for (const name of localLabels ? [] : LABELLED_ROADS) {
    const pieces = osm.elements.filter(e => e.tags?.highway && (e.tags['name:en'] || e.tags.name) === name && e.geometry)
    const longest = pieces
      .map(e => e.geometry.map(p => ({ x: px(p.lon), y: py(p.lat) })).filter(p => p.x > 20 && p.x < W - 20 && p.y > 14 && p.y < H - 14))
      .sort((a, b) => b.reduce((s, p, i) => s + (i ? dist(p, b[i - 1]) : 0), 0) - a.reduce((s, p, i) => s + (i ? dist(p, a[i - 1]) : 0), 0))[0]
    if (!longest || longest.length < 2) continue
    const pts = longest[0].x > longest[longest.length - 1].x ? [...longest].reverse() : longest
    const vertical = Math.abs(pts[0].x - pts[pts.length - 1].x) < Math.abs(pts[0].y - pts[pts.length - 1].y)
    labelPaths.push({ name, d: toPath(vertical && pts[0].y < pts[pts.length - 1].y ? [...pts].reverse() : pts) })
  }
  if (localLabels) labelPaths.push(...localStreetLabels(osm, box, fontSize))
  const park = !localLabels && osm.elements.find(e => e.tags?.leisure === 'park' && /Aspire/.test(e.tags.name || e.tags['name:en'] || ''))
  const parkCentre = park && {
    x: park.geometry.reduce((s, p) => s + px(p.lon), 0) / park.geometry.length,
    y: park.geometry.reduce((s, p) => s + py(p.lat), 0) / park.geometry.length,
  }

  const s = style
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.x} ${box.y} ${box.w} ${box.h}" width="${width}" height="${height}">
<defs>${labelPaths.map((l, i) => `<path id="road-${i}" d="${l.d}"/>`).join('')}</defs>
<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" fill="${s.land}"/>
<path d="${layers.green.join('')}" fill="${s.green}"/>
<path d="${layers.pitch.join('')}" fill="${s.pitch}"/>
<path d="${layers.water.join('')}" fill="${s.water}"/>
<path d="${layers.building.join('')}" fill="${s.building}"/>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
<path d="${layers.service.join('')}" stroke="${s.service}" stroke-width="0.9"/>
${[0, 1, 2].map(t => `<path d="${layers.roads[t].join('')}" stroke="${s.casing[t]}" stroke-width="${widths[t][0]}"/>`).join('\n')}
${[0, 1, 2].map(t => `<path d="${layers.roads[t].join('')}" stroke="${s.fill[t]}" stroke-width="${widths[t][1]}"/>`).join('\n')}
</g>
<g font-family="Inter, 'Segoe UI', Arial, sans-serif" font-size="${fontSize}" font-weight="500" fill="${s.label}" stroke="${s.halo}" stroke-width="${round1(fontSize * 0.34)}" paint-order="stroke" stroke-linejoin="round">
${labelPaths.map((l, i) => `<text dy="${round1(fontSize * 0.34)}"><textPath href="#road-${i}" startOffset="50%" text-anchor="middle">${l.name}</textPath></text>`).join('\n')}
${parkCentre ? `<text x="${round1(parkCentre.x)}" y="${round1(parkCentre.y + 40)}" text-anchor="middle" font-size="8" font-style="italic" font-weight="600" fill="${s.parkLabel}">Aspire Park</text>` : ''}
</g>
</svg>`
}

// ---------------------------------------------------------------- phone maps

/** The route line between two distances along it, with the cut points interpolated. */
function pointsBetween(points, from, to) {
  const out = []
  let d = 0
  for (let i = 0; i < points.length; i++) {
    const p = { x: points[i][0], y: points[i][1] }
    if (i) {
      const q = { x: points[i - 1][0], y: points[i - 1][1] }
      const seg = dist(q, p)
      for (const cut of [from, to]) {
        if (cut > d && cut < d + seg) out.push({ x: q.x + ((p.x - q.x) * (cut - d)) / seg, y: q.y + ((p.y - q.y) * (cut - d)) / seg })
      }
      d += seg
    }
    if (d >= from && d <= to) out.push(p)
  }
  return out
}

/** The map box for a phone view: the stretch of route it shows, padded, stretched to the screen's shape, kept on the map. */
function phoneBox(route, view) {
  const pts = pointsBetween(route.points, route.stops[view.fromStop].at, route.stops[view.toStop].at)
  const xs = pts.map(p => p.x)
  const ys = pts.map(p => p.y)
  const pad = view.pad
  const aspect = view.width / view.height
  let w = Math.max(...xs) - Math.min(...xs) + pad * 2
  let h = Math.max(...ys) - Math.min(...ys) + pad * 2
  if (w / h < aspect) w = h * aspect
  else h = w / aspect
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2
  // Leave room for the card over the bottom of the map; never go past the edge of the downloaded data.
  h = Math.max(h, (Math.max(...ys) - Math.min(...ys) + pad * 2) / (2 * Math.min(view.focusY, 1 - view.focusY)))
  w = Math.max(w, h * aspect)
  h = w / aspect
  const x = Math.min(Math.max(cx - w / 2, 0), W - w)
  const y = Math.min(Math.max(cy - h * view.focusY, 0), H - h)
  return { x: round1(x), y: round1(y), w: round1(w), h: round1(h) }
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
if ('plan-only' in args) {
  result.routes.forEach((r, k) => console.log('route', k, 'length', r.length, JSON.stringify(r.stops)))
  process.exit(0)
}

const work = join(tmpdir(), 'routeyai-landing-map')
mkdirSync(work, { recursive: true })
mkdirSync(join(ROOT, 'public/assets/maps'), { recursive: true })
const SCALE = 4
for (const theme of ['light', 'dark']) {
  const svgPath = join(work, `aspire-${theme}.svg`)
  writeFileSync(svgPath, baseMapSvg(osm, STYLES[theme], { width: W * SCALE, height: H * SCALE }))
  await renderWebp(svgPath, join(ROOT, `public/assets/maps/aspire-${theme}.webp`), W * SCALE, H * SCALE)
}

const phoneMaps = {}
for (const view of PHONE_VIEWS) {
  const route = result.routes[view.route]
  const box = phoneBox(route, view)
  const fontSize = round1((PHONE_LABEL_PX * box.w) / view.width)
  const svgPath = join(work, `phone-${view.name}.svg`)
  writeFileSync(svgPath, baseMapSvg(osm, STYLES.light, { box, width: view.width * 2, height: view.height * 2, fontSize, localLabels: true }))
  await renderWebp(svgPath, join(ROOT, `public/assets/maps/phone-${view.name}.webp`), view.width * 2, view.height * 2)
  phoneMaps[view.name] = {
    src: `/assets/maps/phone-${view.name}.webp`,
    box,
    bus: `Bus ${view.route + 1}`,
    route: { points: route.points, length: route.length, stops: route.stops },
  }
}
writeFileSync(
  join(ROOT, 'src/components/landing/appMapData.ts'),
  `/**
 * Street maps for the phone mockups on the landing page. Generated by scripts/landing-map/build.mjs; do not edit by hand.
 * The routes are the "How it works" planner's routes: same homes, same roads (map data © OpenStreetMap contributors, ODbL).
 * Stop street names come from OpenStreetMap.
 */

export interface RouteStop {
  x: number
  y: number
  /** Distance along the route line, in map units. */
  at: number
  street: string | null
}

export interface PhoneMap {
  /** Base map image of the part of the 540 x 400 planner frame in box. */
  src: string
  box: { x: number; y: number; w: number; h: number }
  bus: string
  /** Route line ([x, y] in the planner frame), its length and its stops in driving order. */
  route: { points: [number, number][]; length: number; stops: RouteStop[] }
}

export const PHONE_MAPS: Record<'driver' | 'parent', PhoneMap> = ${JSON.stringify(phoneMaps)}
`,
)

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
console.log('k-means iterations', result.history.length, 'stops per route', result.routes.map(r => r.stops.length))
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
