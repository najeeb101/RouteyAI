# RouteyAI: Task Tracker

The live checklist. Technical details are in [Claude.md](Claude.md); dated notes and the reasoning behind decisions are in the [engineering log](CHANGELOG.md); bigger pieces of work have a plan in [plans/](plans/).

Legend: `[x]` done, `[ ]` open.

---

## Status (2026-10-07)

| Phase | Scope | Status |
|---|---|---|
| 1 | Project setup and landing page | Done |
| 2 | Authentication and roles | Done |
| 3 | Database schema | Done |
| 4 | Platform admin dashboard | Done |
| 5 | School admin dashboard | Done |
| 6 | Route optimization | Done |
| 7 | Expo app setup | Done |
| 8 | Driver interface | Done |
| 9 | Parent interface | Done |
| 10 | Push notifications | Done |
| 11 | Web polish and production | Custom domain left |
| 12 | App Store and Play Store submission | Not started |
| 13 | Landing page launch | In progress |
| 14 | Parent and driver app upgrade | Done; real-device checks open |
| 15 | Mobile UI refresh (light and dark) | Done; iPhone check of dark mode open |
| 16 | Two runs a day | Done and live (2026-10-07) |

Everything through migration `0020` is on production, together with both Edge Functions and the website at https://routeyai.vercel.app.

---

## Open work

In rough priority order.

### Security and clean-up

- [ ] **Revoke the Mapbox secret token** in the Mapbox account (Tokens page). It sat in `app.json` and `eas.json` in the public repo from phase 7 until 2026-10-01, so it is still in git history. Nothing uses it any more.
- [ ] `redeem_invite` (migration `0022`, written, not yet checked locally or pushed): the target must be an account created in the last 15 minutes with no role, and must be the caller if signed in. Run `supabase/tests/0022_redeem_invite_caller.sql` against the local database (needs Docker), then `pnpm db:push` and try one real invite.
- [ ] Test the Edge Function caller checks with a signed-in school admin and parent.

### Store submission (Phase 12)

- [ ] Test the SDK 57 app on a real device: login, parent map, driver start and end of a run, background GPS, absence report, Delete account.
- [ ] iOS: bundle ID and signing setup (Apple Developer account needed).
- [ ] Run the production builds (`eas build --platform all --profile production`) and a first Android preview build (APK).
- [ ] Internal testing through TestFlight and the Play internal track.
- [ ] Play Console: declare the location foreground service (`FOREGROUND_SERVICE_LOCATION`) with a short video of a driver starting a route.
- [ ] Demo reviewer accounts on production: `scripts/review-accounts/setup.mjs` exists (demo school, a parent with two children, a Bus 1 driver, a school admin) and is re-runnable.
- [ ] App Store and Play screenshots, in light and (if wanted) dark.
- [ ] Submit to App Store review and to Google Play review.

### Web (Phases 11 and 13)

- [ ] Connect the custom domain on Vercel.
- [ ] Launch placeholders in `src/lib/siteConfig.ts`: set `NEXT_PUBLIC_CONTACT_EMAIL` (routeyai.com has no DNS or MX yet), get a legal review and then set `LEGAL_REVIEWED = true`, fill `PLAN_SUPPORT`. Also set `NEXT_PUBLIC_BUSINESS_*` and `REFUND_TERMS`, and work through the open items in [plans/legal-and-accessibility.md](plans/legal-and-accessibility.md).
- [ ] Landing page Lighthouse performance 90 or more on mobile (local runs 2026-10-10 on a production build: performance 80, 87 and 88 when warm, with total blocking time 40 to 250 ms and LCP about 3.8 s; accessibility, best practices and SEO 100. Scores swing by up to 15 points between runs, so check the live site on PageSpeed Insights before changing code).
- [ ] Redraw the landing page's phone mockups in the new style and in dark.

### Real-device checks

- [ ] Dark mode on an iPhone (switch the appearance in Control Centre): login, parent Home and Track, driver Route.
- [ ] The app's map style on a phone, in light and dark.
- [ ] End route stops the "Route in progress" notification and the GPS rows; one row per 10 s after reopening mid-route; iOS not tried yet.
- [ ] Push notifications on a real phone (needs an EAS build).

---

## Phase 1: Project setup and landing page

- [x] Next.js 14 with TypeScript and pnpm; Tailwind CSS and shadcn/ui; `@/` imports
- [x] `.env.local` and `.env.example`; Supabase project and browser and server clients; Mapbox config
- [x] Landing page (hero, features, pricing, call to action, footer) and responsive navbar
- [x] Deployed to Vercel from GitHub

## Phase 2: Authentication and roles

- [x] Supabase Auth (email and password); `user_roles` with RLS
- [x] Login and signup pages; auth middleware for route protection
- [x] Role-based redirect after login; `useAuth` hook

## Phase 3: Database schema

- [x] PostGIS enabled; migrations for the core entities; RLS per role
- [x] Index `idx_bus_locations_bus_id`; TypeScript types (`src/types/database.ts`); seed data (`supabase/seed.sql`)

## Phase 4: Platform admin dashboard

- [x] Dashboard shell (sidebar and top bar), stats cards, schools table (create, edit, delete)
- [x] Invite a school admin to a school; platform-wide analytics (real figures since 2026-10-07)

## Phase 5: School admin dashboard

- [x] Navigation: Overview, Routes, Students, Absences, Fleet, Analytics
- [x] Buses (add, edit, assign a driver), students (with address geocoding), Smart Placement into the nearest bus with free seats
- [x] Route visualisation with markers, announcements, analytics, live fleet map on the overview

## Phase 6: Route optimization

- [x] Edge Function `optimize-route`: K-means across buses, nearest-neighbour stop order, Mapbox travel times, capacity checks, waypoints saved to `routes`
- [x] Since phase 16: changes slot into a route and re-planning is a proposal (see phase 16)

## Phase 7: Expo app setup

- [x] Expo project in `mobile/`, navigation, Supabase client, `@rnmapbox/maps`, deep links for invites (`/invite/[code]`), shared login, role-based guards
- [x] Push tokens (`0011_push_tokens.sql`, registered on launch); EAS project set up
- [x] NativeWind dropped on purpose: screens use React Native styles with the tokens in `mobile/src/lib/theme.ts`

## Phase 8: Driver interface

- [x] Home, route and manifest connected to real data; next-stop card and progress indicator; capacity bar
- [x] Attendance (boarded, absent), GPS broadcasting with `expo-location` to `bus_locations`, start and end of a route
- [x] Messages to parents and live school announcements

## Phase 9: Parent interface

- [x] Home; full-screen map with the live bus and the child's stop; realtime tracking; ETA
- [x] Bottom sheet with child, bus, ETA and status; announcements feed; attendance state

## Phase 10: Push notifications

- [x] Edge Function `send-notification`: parent notification on boarded or absent, driver notification on an announcement, parent ETA alerts, Expo push receipts and invalid token cleanup

## Phase 11: Web polish and production

- [x] Dark mode for the landing page; `loading.tsx`, `error.tsx`, custom 404; toasts for every action; SEO meta tags
- [x] Lighthouse baseline (2026-09-30, home page, mobile): Performance 92, Accessibility 100, Best Practices 100, SEO 100
- [x] Edge Functions check their caller (2026-10-05, deployed); `0016` makes the route helpers service-role only
- [ ] Custom domain on Vercel (see Open work)

## Phase 12: App Store and Play Store submission

Done:

- [x] Expo SDK 57 upgrade (2026-10-02); EAS build profiles, remote app versions, Play internal track; OTA updates (`expo-updates`)
- [x] Public Mapbox token everywhere (app, web, Vercel, Edge Functions, EAS); the secret token is out of the code
- [x] App icon, adaptive and notification icons, splash; Play feature graphic and 512 px icon
- [x] Account deletion in the app (`0015`) and on the web (`/privacy#delete-account`); applied to production
- [x] Android keystore (created by EAS); store listing copy, review notes and privacy answers: [store-listing.md](store-listing.md)

Open: see "Store submission" under Open work.

## Phase 13: Landing page launch

Rules: [Claude.md §6.5](Claude.md).

- [x] Decisions: the main call to action is "Book a demo", pricing is by fleet size with "Contact us", Arabic and right-to-left after launch
- [x] Page split into `src/components/landing/*` (Server Component with client islands); copy corrected to what ships; new sections (problem, how it works, safety and privacy, pricing)
- [x] "Book a demo" form (Server Action, Zod, `demo_requests`); `/privacy` and `/terms`; `sitemap.ts`, `robots.ts`, `opengraph-image.tsx`, JSON-LD
- [x] Vercel project linked to GitHub with production variables; live at https://routeyai.vercel.app; demo form tested end to end (2026-10-02)
- [x] Mapbox token and `NEXT_PUBLIC_APP_URL` set on Vercel (2026-10-05); copy updated for two runs a day (2026-10-07)
- [ ] Launch placeholders, Lighthouse and phone mockups (see Open work)

## Phase 14: Parent and driver app upgrade

- [x] `0013_absence_reports.sql` (table, trigger, RLS, realtime) and `set_push_token()`
- [x] Parent: every child on one account with a switcher; report and cancel absences; 30-day history; live map that follows the bus; Account tab
- [x] Driver: running-late notice; students staying home count as done; end-of-route confirmation and summary; Account tab
- [x] Bus locations read as hex EWKB (the live bus never showed before); the landing page phones redrawn from the new screens
- [x] Local test stack (`supabase/config.toml`, `pnpm db:reset` replays everything); `0014_fix_rls.sql`; `0011` to `0015` applied to production
- [x] Tested on an Android emulator against the local stack; background location for drivers (details in the [engineering log](CHANGELOG.md))
- [x] School admin Absences page (`/school/absences`)
- [x] App map style from a Google Maps reference (light and dark)

Real-device checks: see Open work.

## Phase 15: Mobile UI refresh

Rules: [Claude.md §3](Claude.md).

- [x] Decisions (2026-10-05): Lucide icons, large-title headers, rounded-rectangle buttons, dark mode after light
- [x] Foundations (`theme.ts`, Schibsted Grotesk and Inter, `Txt`, `check:design`) and every screen moved to the tokens
- [x] Checked on the iPhone; RouteyAI identity added (logo header, navy signature card, stop line, live pill, navy login); merged in PR #4 (2026-10-06)
- [x] Dark mode (2026-10-07), checked in the web preview; iPhone check open

## Phase 16: Two runs a day

The rules: [Claude.md §1.1 and §1.2](Claude.md). Every bus does a morning run and an afternoon run (the same stops in reverse), and routes never change by themselves.

- [x] Step 1: `0017_two_runs.sql` (`bus_runs`, attendance per run with `dropped_off`, absence reports per run, a route per bus and run, `start_run`, `end_run`, `mark_attendance`, `save_route_plan`), the route rules with tests, SQL checks per role
- [x] Step 2: `optimize-route` (`update`; `optimize` as a proposal; both directions) and run-aware `send-notification`
- [x] Step 3: existing routes flipped once so the morning ends at the school (production, 2026-10-07; all four buses have both runs)
- [x] Step 4: the new driver and parent apps, and the privacy fix `0018_parent_route.sql`
- [x] Step 5: the redesigned school dashboard (Routes proposals, Students slot-in, run status, Absences rides, real Analytics, web driver page); `0019_auth_email_text.sql`
- [x] Step 6: went live; the iPhone test in Expo Go passed; merged in PR #6
- [x] Step 7: clean-up migration `0020_two_runs_cleanup.sql` and `send-notification` on production (PR #9); docs, store listing and landing copy updated

Older problems fixed along the way (details in the plan): the Students page re-planning every route (1A and 1B), an edited address not moving the stop (2), and a parent being able to read every home on the bus (3). All live.
