# Landing Page Launch Plan

> Supersedes [2026-04-28-landing-page-enhancements.md](2026-04-28-landing-page-enhancements.md) (Framer Motion, mockups and the final CTA from that plan are already shipped).
> Tracked as **Phase 13** in [task.md](../task.md).

**Goal:** Turn the existing landing page (`src/app/page.tsx`) into a launch-ready marketing site: every claim true, every button working, fast enough to pass Lighthouse, and deployable on Vercel.

---

## Current State (2026-09-29)

`src/app/page.tsx` (556 lines, entirely `'use client'`) renders:

Nav → Hero (dashboard screenshot) → `AdminOrchestrator` → `MobileAppsSection` → Features grid → Final CTA → FAQ → `FeedbackSection` → Footer, plus an `AppDownloadModal`.

Assets (at the time): `public/assets/dashboard-screenshot.png`, `public/assets/mockups/{driver,parent}-app.png` (both since removed), `public/assets/brand/` (temporary logo files).

### Problems

**Copy that isn't true**
- Features grid says GPS updates "every 2 seconds". The driver app sends a location every **10 seconds** (`mobile/src/features/driver/screens/DriverHomeScreen.tsx`).
- FAQ promises turn-by-turn navigation, QR-code check-ins and SIS integration. None exist.
- Footer says apps are "Available now". They are not in the stores yet (Phase 12).
- Phone number and social links are placeholders.

**Dead ends**
- "Request a Demo" button has no handler.
- Footer links (Pricing, Help Center, Privacy, Terms, Cookies) all point to `#`.
- `FeedbackSection` only fires a toast and stores nothing. Rating a product you haven't used is also odd on a marketing page.
- No Pricing section, although `Docs/Claude.md` Phase 1 calls for one.

**Technical**
- Whole page is a Client Component, which hurts first load and SEO.
- The fake QR code uses `Math.random()` during render, which causes a hydration mismatch.
- On phones the nav links are hidden and there is no menu button.
- Everything is in one file. `src/components/DashboardPreview.tsx` is unused.

---

## Page Structure (redesign, 2026-09-30)

The first rebuild had 12 sections and read as a generic AI-generated template (numbered section labels, slogan headlines, four simulated "live" widgets, dark tech styling). The redesign cuts it to seven sections with plain, specific copy.

| # | Section | Component | Notes |
|---|---|---|---|
| 1 | Nav | `LandingNav` | Floats over the hero photo, turns solid on scroll. How it works, Drivers & parents, Privacy, Pricing, FAQ · theme switch · Log in · **Book a demo** · mobile menu |
| 2 | Hero | `Hero`, `HeroLiveCards`, `WordReveal` | Full-width photo of a school bus on the Doha Corniche; headline animates in word by word (CSS only); "Bus 3" tag pinned to the bus; parent ETA card counts down and the real push notifications arrive |
| 3 | How it works | `HowItWorks`, `OptimizeDemo` | Scroll story: on wide screens the route planner stays pinned and changes with each step (home pins, K-Means grouping, routes drawn along the roads, drivers assigned, buses driving the routes); on phones it plays through the steps. The map is real OpenStreetMap data around Aspire Park (see below) |
| 4 | Drivers & parents | `MobileAppsSection`, `AppShowcase`, `DriverAppScreen`, `ParentAppScreen` | Photo plus a live coded phone screen for each app (driver checks a student in; parent ETA counts down, then the boarding notification arrives); "Parent or driver?" row with Log in / Get the app |
| 5 | Student data and privacy | `SafetyPrivacy` | Navy band with the students photo filling the right half; per-school isolation (RLS), role-scoped access; links to `/privacy` |
| 6 | Pricing | `Pricing` | Plan sizes plus one "Included in every plan" list |
| 7 | FAQ | `Faq` | Every answer describes shipped features |
| 8 | Book a demo | `FinalCta`, `DemoRequestForm` | Navy band with the demo request form |
| 9 | Footer | `Footer`, `ThemeSelect` | Real links, `/privacy`, `/terms`; three-way theme choice (device, light, dark) |

Rules for this page:
- Light and dark (redesign 2026-10-01): follows the device setting, with a switch in the nav (in the menu on phones) and a device/light/dark choice in the footer. Landing and legal pages wrap their content in `.landing`, which sets navy-tinted tokens in `globals.css`; dark mode uses a light blue primary with navy text. `bg-brand` / `bg-brand-ink` stay the same in both themes (navy bands, photo washes). Phone mockups use `.force-light`.
- Headings use Schibsted Grotesk bold (`font-display`, `src/components/landing/fonts.ts`, 700 only); body text stays Inter.
- Don't use `text-wrap: balance` (`text-balance`) here: it roughly tripled layout time on page load. `noOrphan()` in `SectionHeading` keeps the last two words of a heading together instead.
- Plain section headings. No eyebrow labels (the hero's "For schools in Qatar" is the only one), slogans or em dashes in copy.
- Lead with what schools get; don't pitch "AI".
- Removed: `LiveBoard`, `ProblemOutcome`, `ProductShot` (its screenshot showed an empty dashboard), `Features` and its animated visuals.
- Animations (restored 2026-09-30 at the user's request; the hero map was replaced by the photo and live cards on 2026-10-01): word-by-word headline, scroll reveals (`Reveal`, a plain IntersectionObserver + CSS, far cheaper than Framer Motion components), phone parallax, nav scroll-progress bus, live phone screens (`useStepLoop`). All respect reduced motion. Keep new animations off the hydration path: the Framer Motion version of `Reveal` dropped Lighthouse performance to 63.
- Visual style (2026-09-30) takes cues from Qatar Post's [Connected](https://connected.qa/en/): real photos, product screens on devices, brand-coloured circles around photos, round icon badges.
- Photos are AI-generated for Qatar (Higgsfield, Nano Banana Pro, approved by the user 2026-09-30); see `src/components/landing/photos.ts`. Replace with real photos from pilot schools when available. The hero photo (`hero-corniche.jpg`) had nonsense Arabic lettering on the bus, which was painted out; check any new generated photo for fake text.
- No invented proof: no school logos, numbers or quotes until real ones exist (user confirmed 2026-10-01 there are none yet).
- Route planner map (2026-10-01): `node scripts/landing-map/build.mjs` downloads OpenStreetMap data around Aspire Park, places the school and 27 homes on real residential streets, runs K-Means, routes each bus along the road network (one-way streets respected) and writes `public/assets/maps/aspire-{light,dark}.webp` plus `src/components/landing/optimizeDemoData.ts`. Re-run it to change the area or the homes; don't edit the data file by hand. The map must keep its "© OpenStreetMap contributors" credit (ODbL).
- The phone screens are HTML redrawn from the real Expo screens (`DriverRouteScreen`, `ParentHomeScreen`), so they stay sharp and only show shipped features. The old AI-generated mockup images (garbled map labels, a "Start Navigation" button the app does not have) and the empty dashboard screenshot were deleted. Update the coded screens if the app UI changes.

---

## Build Order

### Step 1: Restructure (no visual change)
- Split sections into `src/components/landing/` (`LandingNav`, `Hero`, `Features`, `Faq`, `FinalCta`, `Footer`, `AppDownloadModal`, …). Move `AdminOrchestrator`, `MobileApps` and `FeedbackSection` there too.
- Make `src/app/page.tsx` a Server Component. Keep client islands only for: app modal, mobile menu, FAQ accordion, demo form, scroll-reveal wrapper.
- Replace the random QR with a static placeholder (real QR once store links exist).
- Add a mobile nav menu.
- Delete unused `DashboardPreview.tsx`.

### Step 2: Copy fixes
- Correct features grid and FAQ; mark apps as "Coming soon" until Phase 12 ships.
- Switch primary CTA per the decision below.
- Remove `FeedbackSection`.

### Step 3: New sections
- Problem → outcome, How it works, Safety & privacy, Pricing.

### Step 4: Demo requests
- No migration needed: `demo_requests (id, full_name, school_name, email, phone, notes, created_at)` already exists (`0001_schema.sql`), with RLS in `0003_rls.sql` (anyone may `INSERT`, only `platform_admin` may `SELECT`). Types are already in `src/types/database.ts`.
- Server Action (`src/lib/actions/submitDemoRequest.ts`) validates with Zod and inserts via the server client. Fleet size is stored in `notes`. Toast on success/error.
- Later: email notification per request, and a list in the platform admin dashboard.

### Step 5: Legal pages and SEO
- `/privacy` and `/terms` pages. A privacy policy URL is also **required for App Store and Play Store submission** (Phase 12).
- `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx`.
- JSON-LD `SoftwareApplication` on the landing page.
- Per-page `metadata` exports.

### Step 6: Performance and deploy
- Lighthouse pass (target ≥ 90 on all four scores, mobile).
- Deploy to Vercel and connect the custom domain (open Phase 1 / Phase 11 tasks).

---

## Decisions (2026-09-29)

- **Pricing:** plans by fleet size (Starter / Growth / Enterprise) with "Contact us" — no public prices yet.
- **Primary CTA:** "Book a demo" (sales-led). `/signup` stays reachable from the login page; parents and drivers join via invite links.
- **Arabic / RTL:** after launch.
- **Real content:** placeholder phone number and social links removed until real ones exist. Add pilot school logos and testimonials when available.
- **Contact email:** `routeyai.com` has no DNS or MX records, so no address is shown. Set `NEXT_PUBLIC_CONTACT_EMAIL` once an inbox exists; until then contact links point to the demo form.
- **Legal pages:** `/privacy` and `/terms` ship as plain-language drafts with a visible "Draft" notice and no specific retention or deletion periods. Set `LEGAL_REVIEWED = true` in `src/lib/siteConfig.ts` after legal review.
- **Pricing support tiers:** not shown until filled in via `PLAN_SUPPORT` in `src/lib/siteConfig.ts`. "Multiple campuses" removed (a school admin covers one school).
