/* RouteyAI pitch deck: scaling, navigation, chrome and the animated slides. No dependencies.
 *
 * Keys: → / Space / PageDown next · ← / PageUp previous · Home / End · F full screen.
 * Click (or tap) the slide to go forward, Shift+click to go back, swipe on touch screens.
 * The URL hash keeps the slide number (#5), so a reload or a shared link opens the same slide.
 */
(() => {
  'use strict'

  const W = 1920
  const H = 1080
  const WIPE_MS = 950
  const SVGNS = 'http://www.w3.org/2000/svg'
  const MAP = window.ROUTEY_MAP
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const stage = document.getElementById('stage')
  const slides = Array.from(stage.querySelectorAll('.slide'))

  /* ------------------------------------------------------------ helpers */

  function fit() {
    stage.style.setProperty('--s', Math.min(window.innerWidth / W, window.innerHeight / H))
  }

  function svg(tag, attrs, parent) {
    const node = document.createElementNS(SVGNS, tag)
    for (const k in attrs) node.setAttribute(k, attrs[k])
    if (parent) parent.appendChild(node)
    return node
  }

  function icon(id, x, y, size, parent) {
    const use = svg('use', { x, y, width: size, height: size }, parent)
    use.setAttribute('href', `#${id}`)
    return use
  }

  const pathFrom = points => points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ')

  /** The point `d` map units along a polyline (same as the landing page's phone maps). */
  function pointAlong(points, d) {
    let walked = 0
    for (let i = 1; i < points.length; i++) {
      const [ax, ay] = points[i - 1]
      const [bx, by] = points[i]
      const seg = Math.hypot(bx - ax, by - ay)
      if (walked + seg >= d && seg > 0) {
        const t = (d - walked) / seg
        return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t }
      }
      walked += seg
    }
    const [lx, ly] = points[points.length - 1]
    return { x: lx, y: ly }
  }

  const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
  const easeOut = t => 1 - Math.pow(1 - t, 3)
  const clamp01 = t => Math.max(0, Math.min(1, t))

  /** Timers and animation frames owned by one slide, cleared together when the slide is left. */
  function scope() {
    let timers = []
    let loops = []
    return {
      at(ms, fn) {
        timers.push(window.setTimeout(fn, ms))
      },
      loop(fn) {
        const handle = { id: 0 }
        let start = null
        const tick = now => {
          if (start === null) start = now
          if (fn(now - start) === false) return
          handle.id = requestAnimationFrame(tick)
        }
        handle.id = requestAnimationFrame(tick)
        loops.push(handle)
      },
      clear() {
        timers.forEach(t => window.clearTimeout(t))
        loops.forEach(h => cancelAnimationFrame(h.id))
        timers = []
        loops = []
      },
    }
  }

  function formatCount(value, format) {
    return format === 'comma' ? Math.round(value).toLocaleString('en-US') : String(Math.round(value))
  }

  function countUp(slide, s, final = false) {
    slide.querySelectorAll('[data-count]').forEach(node => {
      const target = Number(node.dataset.count)
      const format = node.dataset.format
      if (final || reduceMotion) {
        node.textContent = formatCount(target, format)
        return
      }
      node.textContent = formatCount(0, format)
      s.at(500, () =>
        s.loop(t => {
          const p = clamp01(t / 1500)
          node.textContent = formatCount(target * easeOut(p), format)
          return p < 1
        }),
      )
    })
  }

  /* ------------------------------------------------------------ slide hooks */

  const hooks = {}

  // 01 Cover: the route line draws itself, then a bus runs it stop by stop.
  hooks.cover = (() => {
    const path = document.getElementById('coverPath')
    const bus = document.getElementById('coverBus')
    const stops = Array.from(document.querySelectorAll('.cover-stops circle'))
    const len = path.getTotalLength()
    const stopAt = stops.map(c => Number(c.getAttribute('cx')) - 10)

    function place(d) {
      const p = path.getPointAtLength(Math.max(0, Math.min(len, d)))
      bus.setAttribute('transform', `translate(${p.x} ${p.y})`)
      stops.forEach((c, i) => c.classList.toggle('passed', d >= stopAt[i] - 2))
    }

    return {
      enter(s) {
        path.style.transition = 'none'
        path.style.strokeDasharray = `${len}`
        path.style.strokeDashoffset = `${len}`
        bus.style.opacity = '0'
        place(0)
        void path.getBoundingClientRect()
        s.at(650, () => {
          path.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(.45,0,.2,1)'
          path.style.strokeDashoffset = '0'
        })
        s.at(2300, () => {
          bus.style.opacity = '1'
          const cycle = 7600
          s.loop(t => {
            const local = t % cycle
            place(len * easeInOut(clamp01(local / 6400)))
          })
        })
      },
      final() {
        path.style.transition = 'none'
        path.style.strokeDashoffset = '0'
        bus.style.opacity = '1'
        place(stopAt[2])
      },
    }
  })()

  // 02 Problem: the parents' group chat fills up.
  hooks.problem = (() => {
    const bubbles = Array.from(document.querySelectorAll('.s-problem .bubble'))
    return {
      enter(s) {
        bubbles.forEach(b => b.classList.remove('show'))
        bubbles.forEach((b, i) => s.at(1300 + i * 850, () => b.classList.add('show')))
      },
      final() {
        bubbles.forEach(b => b.classList.add('show'))
      },
    }
  })()

  // 05 How it works: the real K-Means run from the landing page, then road routes, then buses.
  hooks.kmeans = (() => {
    const COLORS = ['#60A5FA', '#F472B6', '#2DD4BF']
    const NEUTRAL = '#E5E7EB'
    const homesG = document.getElementById('kmHomes')
    const centG = document.getElementById('kmCentroids')
    const routesG = document.getElementById('kmRoutes')
    const schoolG = document.getElementById('kmSchool')
    const busesG = document.getElementById('kmBuses')
    const caption = document.getElementById('kmCaption')
    const legend = document.getElementById('kmLegend')
    const steps = Array.from(document.querySelectorAll('#kmSteps li'))
    const stepsList = document.getElementById('kmSteps')
    const replay = document.getElementById('kmReplay')

    const homes = MAP.homes.map(h => svg('circle', { cx: h.x, cy: h.y, r: 4.2 }, homesG))
    const cents = COLORS.map(c => {
      const g = svg('g', {}, centG)
      svg('circle', { r: 15, stroke: c, opacity: 0.35 }, g)
      svg('circle', { r: 9, stroke: c }, g)
      svg('path', { d: 'M-4 0H4M0-4V4', stroke: c }, g)
      g.style.opacity = '0'
      return g
    })
    const routes = MAP.routes.map((d, i) => {
      const casing = svg('path', { d, class: 'case' }, routesG)
      const line = svg('path', { d, class: 'line', stroke: COLORS[i] }, routesG)
      return { casing, line, len: 0 }
    })
    const school = svg('g', { transform: `translate(${MAP.school.x} ${MAP.school.y})` }, schoolG)
    svg('rect', { x: -25, y: -27, width: 50, height: 16, rx: 4 }, school)
    const label = svg('text', { x: 0, y: -16, 'text-anchor': 'middle' }, school)
    label.textContent = 'SCHOOL'
    svg('circle', { r: 3.6, fill: '#FFC21A', stroke: '#14161F', 'stroke-width': 1.4 }, school)

    const buses = COLORS.map(() => {
      const g = svg('g', {}, busesG)
      svg('circle', { r: 8.5, fill: '#FFC21A' }, g)
      const u = icon('i-bus', -5.2, -5.2, 10.4, g)
      u.style.stroke = '#14161F'
      u.style.strokeWidth = '2.6'
      g.style.opacity = '0'
      return g
    })

    let current = null

    function setStep(i) {
      stepsList.classList.add('playing')
      steps.forEach((li, j) => li.classList.toggle('on', j === i))
    }

    function color(assignment) {
      homes.forEach((c, i) => (c.style.fill = COLORS[assignment[i]]))
    }

    function moveCentroids(centroids, instant) {
      cents.forEach((g, i) => {
        g.style.transition = instant ? 'none' : ''
        g.style.transform = `translate(${centroids[i].x}px, ${centroids[i].y}px)`
      })
    }

    function measure() {
      routes.forEach(r => {
        if (!r.len) r.len = r.line.getTotalLength()
      })
    }

    function hideRoutes() {
      measure()
      routes.forEach(r => {
        for (const p of [r.casing, r.line]) {
          p.style.transition = 'none'
          p.style.strokeDasharray = `${r.len}`
          p.style.strokeDashoffset = `${r.len}`
        }
      })
    }

    function placeBus(i, p) {
      const r = routes[i]
      const pt = r.line.getPointAtLength(r.len * p)
      buses[i].setAttribute('transform', `translate(${pt.x} ${pt.y})`)
    }

    function reset() {
      homes.forEach(c => {
        c.classList.remove('in')
        c.style.fill = NEUTRAL
      })
      cents.forEach(g => (g.style.opacity = '0'))
      buses.forEach(g => (g.style.opacity = '0'))
      legend.classList.remove('show')
      hideRoutes()
    }

    function finalState() {
      measure()
      homes.forEach(c => c.classList.add('in'))
      color(MAP.kmeans[MAP.kmeans.length - 1].assignment)
      cents.forEach(g => (g.style.opacity = '0'))
      routes.forEach(r => {
        for (const p of [r.casing, r.line]) {
          p.style.transition = 'none'
          p.style.strokeDasharray = 'none'
          p.style.strokeDashoffset = '0'
        }
      })
      legend.classList.add('show')
      buses.forEach((g, i) => {
        g.style.opacity = '1'
        placeBus(i, [0.42, 0.6, 0.5][i])
      })
      caption.textContent = '3 buses on the road, parents following live'
      stepsList.classList.remove('playing')
    }

    function run(s) {
      s.clear()
      reset()
      setStep(0)
      caption.textContent = `${MAP.homes.length} home addresses on the map`

      s.at(450, () => homes.forEach((c, i) => s.at(i * 30, () => c.classList.add('in'))))

      MAP.kmeans.forEach((step, k) => {
        s.at(1900 + k * 1000, () => {
          if (k === 0) {
            setStep(1)
            moveCentroids(step.centroids, true)
            void centG.getBoundingClientRect()
            cents.forEach(g => (g.style.opacity = '1'))
          } else {
            moveCentroids(step.centroids, false)
          }
          color(step.assignment)
          caption.textContent = `Grouping homes by area · pass ${k + 1} of ${MAP.kmeans.length}`
        })
      })

      const routeAt = 1900 + MAP.kmeans.length * 1000
      s.at(routeAt, () => {
        setStep(2)
        caption.textContent = 'Ordering the stops along real roads…'
        cents.forEach(g => (g.style.opacity = '0'))
        routes.forEach((r, i) => {
          for (const p of [r.casing, r.line]) {
            p.style.transition = `stroke-dashoffset 2.4s cubic-bezier(.45,0,.2,1) ${i * 0.25}s`
            p.style.strokeDashoffset = '0'
          }
        })
      })

      s.at(routeAt + 3000, () => {
        caption.textContent = '3 routes ready · no bus over its seat count'
        legend.classList.add('show')
      })

      s.at(routeAt + 3900, () => {
        setStep(3)
        caption.textContent = '3 buses on the road, parents following live'
        buses.forEach((g, i) => {
          placeBus(i, 0)
          g.style.opacity = '1'
        })
        const drive = 9000
        const cycle = 10400
        s.loop(t => {
          buses.forEach((g, i) => {
            const local = (t + cycle - i * 500) % cycle
            placeBus(i, easeInOut(clamp01(local / drive)))
            g.style.opacity = local > cycle - 500 ? '0' : '1'
          })
        })
      })
    }

    return {
      enter(s) {
        current = s
        if (reduceMotion) finalState()
        else run(s)
      },
      leave() {
        current = null
        stepsList.classList.remove('playing')
      },
      final: finalState,
      init() {
        replay.addEventListener('click', e => {
          e.stopPropagation()
          if (current && !reduceMotion) run(current)
        })
      },
    }
  })()

  // 06 Parent app: the bus drives to Aisha's stop, the arrival time counts down, then she boards.
  hooks.parent = (() => {
    const map = MAP.phones.parent
    const pts = map.route.points
    const HOME = 7
    const FROM = map.route.stops[HOME - 1].at
    const TO = map.route.stops[HOME].at
    const stop = map.route.stops[HOME]
    const stopName = (stop.street || 'Street').replace(/ Street$/, ' St')

    const d = pathFrom(pts)
    document.getElementById('pRouteCase').setAttribute('d', d)
    document.getElementById('pRoute').setAttribute('d', d)

    const home = document.getElementById('pHome')
    home.setAttribute('transform', `translate(${stop.x} ${stop.y})`)
    svg('rect', { x: -10.8, y: -10.9, width: 21.6, height: 4.9, rx: 1.4 }, home)
    const t = svg('text', { x: 0, y: -7.55 }, home)
    t.textContent = 'Aisha’s stop'
    svg('circle', { r: 2.6 }, home)
    icon('i-home', -1.35, -1.35, 2.7, home)

    const bus = document.getElementById('pBus')
    const eta = document.getElementById('pEta')
    const unit = document.getElementById('pEtaUnit')
    const sub = document.getElementById('pSub')
    const pill = document.getElementById('pPill')
    const bar = document.getElementById('pBar')
    const notif = document.getElementById('pNotif')

    function placeBus(at) {
      const p = pointAlong(pts, at)
      bus.setAttribute('transform', `translate(${p.x} ${p.y})`)
    }

    function waiting() {
      eta.textContent = '6'
      eta.parentNode.classList.remove('done')
      unit.textContent = 'min'
      sub.textContent = `to Aisha’s stop · ${stopName}`
      pill.textContent = 'Waiting'
      pill.className = 'pill wait'
      bar.style.transition = 'none'
      bar.style.width = '0%'
      notif.classList.remove('show')
      placeBus(FROM)
    }

    function boarded() {
      eta.textContent = 'Boarded'
      eta.parentNode.classList.add('done')
      unit.textContent = ''
      sub.textContent = 'at 6:53 AM · on the way to school'
      pill.textContent = 'On the bus'
      pill.className = 'pill on'
      bar.style.width = '100%'
    }

    function cycle(s) {
      waiting()
      const DRIVE = 7200
      s.at(500, () => {
        bar.style.transition = ''
        s.loop(time => {
          const p = clamp01(time / DRIVE)
          placeBus(FROM + (TO - FROM) * easeInOut(p))
          const mins = Math.max(1, Math.ceil(6 * (1 - p)))
          eta.textContent = String(mins)
          bar.style.width = `${Math.round(p * 100)}%`
          if (mins === 1) sub.textContent = 'Your stop is next'
          return p < 1
        })
      })
      s.at(500 + DRIVE + 300, boarded)
      s.at(500 + DRIVE + 700, () => notif.classList.add('show'))
      s.at(500 + DRIVE + 4200, () => notif.classList.remove('show'))
      s.at(500 + DRIVE + 4600, () =>
        s.loop(time => {
          const p = clamp01(time / 2200)
          placeBus(TO + 70 * easeInOut(p))
          return p < 1
        }),
      )
      s.at(500 + DRIVE + 7400, () => cycle(s))
    }

    return {
      enter(s) {
        if (reduceMotion) this.final()
        else cycle(s)
      },
      final() {
        placeBus(TO)
        boarded()
        notif.classList.add('show')
      },
    }
  })()

  // 07 Driver app: two students board, the stop is done, the bus moves on.
  hooks.driver = (() => {
    const map = MAP.phones.driver
    const pts = map.route.points
    const CURRENT = 4
    const NEXT = 5
    const total = map.route.stops.length

    const d = pathFrom(pts)
    document.getElementById('dRouteCase').setAttribute('d', d)
    document.getElementById('dRoute').setAttribute('d', d)
    const stopsG = document.getElementById('dStops')
    const stopDots = map.route.stops.map(st => svg('circle', { cx: st.x, cy: st.y, r: 1.3 }, stopsG))

    const bus = document.getElementById('dBus')
    const kid1 = document.getElementById('dKid1')
    const kid2 = document.getElementById('dKid2')
    const count = document.getElementById('dCount')
    const cardNow = document.getElementById('dCardNow')
    const cardNext = document.getElementById('dCardNext')
    const tagNow = document.getElementById('dTagNow')
    const tagNext = document.getElementById('dTagNext')
    const progLabel = document.getElementById('dProgLabel')
    const bar = document.getElementById('dBar')

    function placeBus(at) {
      const p = pointAlong(pts, at)
      bus.setAttribute('transform', `translate(${p.x} ${p.y})`)
    }

    function markStop(i) {
      stopDots.forEach((c, j) => c.classList.toggle('cur', j === i))
      progLabel.textContent = `Stop ${i + 1} of ${total}`
      bar.style.width = `${Math.round(((i + 1) / total) * 100)}%`
    }

    function reset() {
      ;[kid1, kid2].forEach(k => k.classList.remove('boarded'))
      count.textContent = '0/2 boarded'
      cardNow.className = 'stop-card now'
      cardNext.className = 'stop-card next'
      tagNow.textContent = 'Now'
      tagNext.textContent = 'Next'
      bar.style.transition = 'none'
      markStop(CURRENT)
      void bar.offsetWidth
      bar.style.transition = ''
      placeBus(map.route.stops[CURRENT].at)
    }

    function board(kid, n) {
      const btn = kid.querySelector('.board')
      btn.classList.add('press')
      setTimeout(() => btn.classList.remove('press'), 180)
      setTimeout(() => {
        kid.classList.add('boarded')
        count.textContent = `${n}/2 boarded`
      }, 200)
    }

    function cycle(s) {
      reset()
      s.at(1500, () => board(kid1, 1))
      s.at(2700, () => board(kid2, 2))
      s.at(3700, () => {
        cardNow.className = 'stop-card finished'
        tagNow.textContent = 'Done'
        cardNext.className = 'stop-card now'
        tagNext.textContent = 'Now'
        const from = map.route.stops[CURRENT].at
        const to = map.route.stops[NEXT].at
        s.loop(time => {
          const p = clamp01(time / 2200)
          placeBus(from + (to - from) * easeInOut(p))
          return p < 1
        })
        s.at(2200, () => markStop(NEXT))
      })
      s.at(9200, () => cycle(s))
    }

    return {
      enter(s) {
        if (reduceMotion) this.final()
        else cycle(s)
      },
      final() {
        reset()
        kid1.classList.add('boarded')
        count.textContent = '1/2 boarded'
      },
    }
  })()

  // 08 School dashboard: every bus moving on the live fleet map.
  hooks.fleet = (() => {
    const COLORS = ['#2563EB', '#DB2777', '#0891B2']
    const START = [0.5, 0.58, 0.42]
    const routesG = document.getElementById('fRoutes')
    const busesG = document.getElementById('fBuses')
    const routes = MAP.routes.map((d, i) => {
      svg('path', { d, class: 'case' }, routesG)
      return { line: svg('path', { d, class: 'line', stroke: COLORS[i] }, routesG), len: 0 }
    })
    const buses = COLORS.map(c => {
      const g = svg('g', {}, busesG)
      svg('circle', { r: 9, fill: c }, g)
      const u = icon('i-bus', -5.5, -5.5, 11, g)
      u.style.stroke = '#fff'
      u.style.strokeWidth = '2.4'
      return g
    })

    function place(i, p) {
      const r = routes[i]
      if (!r.len) r.len = r.line.getTotalLength()
      const pt = r.line.getPointAtLength(r.len * p)
      buses[i].setAttribute('transform', `translate(${pt.x} ${pt.y})`)
    }

    return {
      enter(s) {
        buses.forEach((_, i) => place(i, START[i]))
        if (reduceMotion) return
        s.loop(t => {
          buses.forEach((_, i) => place(i, Math.min(0.97, START[i] + (t / 60000) * (1 - START[i]))))
        })
      },
      final() {
        buses.forEach((_, i) => place(i, START[i]))
      },
    }
  })()

  /* ------------------------------------------------------------ chrome */

  const chNow = document.getElementById('chNow')
  const chTotal = document.getElementById('chTotal')
  const chFill = document.getElementById('chFill')
  const chBus = document.getElementById('chBus')
  const chStations = document.getElementById('chStations')
  const pad2 = n => String(n).padStart(2, '0')

  chTotal.textContent = pad2(slides.length)
  const stations = slides.map((slide, i) => {
    const b = document.createElement('button')
    b.className = 'ch-station'
    b.type = 'button'
    b.style.left = `${(i / (slides.length - 1)) * 100}%`
    b.setAttribute('aria-label', `Go to slide ${i + 1}: ${slide.dataset.title}`)
    const tip = document.createElement('span')
    tip.className = 'tip'
    tip.textContent = slide.dataset.title
    b.appendChild(tip)
    b.addEventListener('click', e => {
      e.stopPropagation()
      go(i)
    })
    chStations.appendChild(b)
    return b
  })

  let themeTimer = 0
  function updateChrome(delay = 0) {
    const pct = (cur / (slides.length - 1)) * 100
    chNow.textContent = pad2(cur + 1)
    chFill.style.width = `${pct}%`
    chBus.style.left = `${pct}%`
    stations.forEach((b, i) => b.classList.toggle('past', i < cur))
    // The wipe uncovers the new slide from the right, so switch the chrome's colours part-way through it.
    const dark = slides[cur].classList.contains('dark')
    window.clearTimeout(themeTimer)
    themeTimer = window.setTimeout(() => {
      stage.classList.toggle('theme-dark', dark)
      stage.classList.toggle('theme-light', !dark)
      stage.classList.toggle('on-cover', cur === 0)
    }, delay)
  }

  /* ------------------------------------------------------------ navigation */

  let cur = -1
  let cleanup = null
  const scopes = new Map(slides.map(s => [s, scope()]))
  const hookOf = slide => hooks[slide.dataset.hook] || null

  function enter(slide) {
    const s = scopes.get(slide)
    s.clear()
    countUp(slide, s)
    const h = hookOf(slide)
    if (h && h.enter) requestAnimationFrame(() => h.enter(s))
  }

  function leave(slide) {
    scopes.get(slide).clear()
    const h = hookOf(slide)
    if (h && h.leave) h.leave()
  }

  function go(n, instant = false) {
    n = Math.max(0, Math.min(slides.length - 1, n))
    if (n === cur) return
    const prev = cur >= 0 ? slides[cur] : null
    const next = slides[n]
    const dir = n > cur ? 'fwd' : 'back'
    const quick = instant || reduceMotion || !prev

    if (cleanup) cleanup()

    next.classList.remove('is-leaving', 'fwd', 'back')
    next.style.transition = 'none'
    next.style.transform = 'none'
    next.style.zIndex = '3'
    next.style.clipPath = quick ? 'inset(0 0 0 0)' : dir === 'fwd' ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)'
    next.classList.add('is-active')
    void next.offsetWidth
    next.style.transition = ''
    next.style.clipPath = 'inset(0 0 0 0)'

    if (prev) {
      prev.style.zIndex = '2'
      if (!quick) prev.classList.add('is-leaving', dir)
    }

    const finish = () => {
      window.clearTimeout(timer)
      cleanup = null
      if (prev) {
        prev.classList.remove('is-active', 'is-leaving', 'fwd', 'back')
        prev.style.zIndex = ''
        leave(prev)
      }
      next.style.zIndex = ''
      next.style.transform = ''
    }
    const timer = window.setTimeout(finish, quick ? 0 : WIPE_MS + 50)
    cleanup = finish

    cur = n
    updateChrome(quick ? 0 : WIPE_MS * 0.6)
    enter(next)
    if (window.location.hash !== `#${n + 1}`) history.replaceState(null, '', `#${n + 1}`)
    hideHint()
  }

  const nextSlide = () => go(cur + 1)
  const prevSlide = () => go(cur - 1)

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen()
    else document.documentElement.requestFullscreen?.()
  }

  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
      case 'Enter':
        e.preventDefault()
        nextSlide()
        break
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
      case 'Backspace':
        e.preventDefault()
        prevSlide()
        break
      case 'Home':
        go(0)
        break
      case 'End':
        go(slides.length - 1)
        break
      case 'f':
      case 'F':
        toggleFullscreen()
        break
    }
  })

  stage.addEventListener('click', e => {
    if (e.target.closest('button, a')) return
    if (e.shiftKey) prevSlide()
    else nextSlide()
  })

  let touchX = null
  let touchY = null
  stage.addEventListener('touchstart', e => {
    touchX = e.touches[0].clientX
    touchY = e.touches[0].clientY
  }, { passive: true })
  stage.addEventListener('touchend', e => {
    if (touchX === null) return
    const dx = e.changedTouches[0].clientX - touchX
    const dy = e.changedTouches[0].clientY - touchY
    touchX = null
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault()
      if (dx < 0) nextSlide()
      else prevSlide()
    }
  })

  window.addEventListener('hashchange', () => {
    const n = parseInt(window.location.hash.slice(1), 10)
    if (!Number.isNaN(n)) go(n - 1)
  })

  const hint = document.getElementById('hint')
  let hintTimer = window.setTimeout(hideHint, 5000)
  function hideHint() {
    window.clearTimeout(hintTimer)
    hint.classList.add('gone')
  }

  // Printing (Save as PDF) shows every slide at once, so put the animated ones in a finished state first.
  window.addEventListener('beforeprint', () => {
    slides.forEach(slide => {
      scopes.get(slide).clear()
      countUp(slide, scopes.get(slide), true)
      const h = hookOf(slide)
      if (h && h.final) h.final()
    })
  })
  window.addEventListener('afterprint', () => enter(slides[cur]))

  /* ------------------------------------------------------------ start */

  window.addEventListener('resize', fit)
  fit()
  Object.values(hooks).forEach(h => h.init && h.init())
  const start = parseInt(window.location.hash.slice(1), 10)
  go(Number.isNaN(start) ? 0 : start - 1, true)
  if (new URLSearchParams(window.location.search).has('print')) {
    window.dispatchEvent(new Event('beforeprint'))
  }
})()
