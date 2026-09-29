# Landing Page Launch Plan

> Supersedes [2026-04-28-landing-page-enhancements.md](2026-04-28-landing-page-enhancements.md) (Framer Motion, mockups and the final CTA from that plan are already shipped).
> Tracked as **Phase 13** in [task.md](../task.md).

**Goal:** Turn the existing landing page (`src/app/page.tsx`) into a launch-ready marketing site: every claim true, every button working, fast enough to pass Lighthouse, and deployable on Vercel.

---

## Current State (2026-09-29)

`src/app/page.tsx` (556 lines, entirely `'use client'`) renders:

Nav → Hero (dashboard screenshot) → `AdminOrchestrator` → `MobileAppsSection` → Features grid → Final CTA → FAQ → `FeedbackSection` → Footer, plus an `AppDownloadModal`.

Assets: `public/assets/dashboard-screenshot.png`, `public/assets/mockups/{driver,parent}-app.png`, `public/assets/brand/` (temporary logo files).

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

## Target Page Structure

| # | Section | Status | Notes |
|---|---|---|---|
| 1 | Nav | Update | Features, How it works, Pricing, FAQ · Log in · primary **Book a demo** · mobile menu |
| 2 | Hero | Update | Keep headline + screenshot; CTAs → "Book a demo" / "See how it works" |
| 3 | Trust strip | New | "Built for Qatar's schools"; pilot school logos or real stats when available |
| 4 | Problem → outcome | New | Manual route planning and "where's the bus?" calls vs. what RouteyAI changes |
| 5 | How it works | New | 3 steps: add students → AI builds routes → drivers & parents go live |
| 6 | Intelligent Orchestrator | Keep | `AdminOrchestrator` |
| 7 | Driver & parent apps | Keep | `MobileAppsSection` |
| 8 | Features grid | Update | Corrected copy (10s GPS, no invented features) |
| 9 | Safety & privacy | New | Per-school data isolation (RLS), boarded/absent alerts, parents see only their child |
| 10 | Pricing | New | Per-bus tiers or "Contact us" (see open decisions) |
| 11 | FAQ | Update | Placed after the demo section on the page; Rewrite so every answer describes shipped features |
| 12 | Final CTA + demo form | Update | Real demo-request form; replaces `FeedbackSection` |
| 13 | Footer | Update | Real links, `/privacy`, `/terms`, real contact details |

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
