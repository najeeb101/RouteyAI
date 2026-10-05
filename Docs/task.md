# RouteyAI - Task Tracker

Stack: Next.js 14 | TypeScript | Tailwind CSS | shadcn/ui | Supabase | Mapbox GL JS | Vercel  
Mobile: Expo (React Native) | React Native styles | Mapbox RN | EAS

---

## Current Status Snapshot (2026-10-05)

- Completed: Phases 1–10. Supabase restored; all migrations through `0015` are on production (2026-10-02).
- Nearly done: Phase 11 (custom domain left), plus the Edge Function caller checks found on 2026-10-05.
- In progress: Phase 13 — landing page live at https://routeyai.vercel.app; launch placeholders in `src/lib/siteConfig.ts`; no Mapbox token on Vercel yet, so student addresses aren't geocoded on the live site.
- In progress: Phase 12 (store submission). Expo SDK 57, EAS profiles, OTA updates, icons, Play graphics and store copy are done; next are the device test, the Mapbox `pk.` token, `eas login` and the first EAS builds.
- Phase 14 (parent and driver app upgrade) done apart from checks on a real phone.

## Phase 1: Project Setup and Landing Page

- [x] Initialize Next.js 14 project with TypeScript and pnpm
- [x] Configure Tailwind CSS and shadcn/ui
- [x] Set up absolute imports (`@/` -> `src/`)
- [x] Configure `.env.local` and `.env.example`
- [x] Initialize Supabase project
- [x] Set up Supabase browser and server clients (`src/lib/supabase/`)
- [x] Configure Mapbox (`src/lib/mapbox/config.ts`)
- [x] Build landing page: Hero, Features, Pricing, CTA, Footer
- [x] Add responsive navbar: Logo, Features, Pricing, Login, Sign Up
- [x] Deploy to Vercel and connect GitHub repo

## Phase 2: Authentication and Role System

- [x] Enable Supabase Auth (email/password)
- [x] Create `user_roles` table with RLS
- [x] Build Login page (`/login`)
- [x] Build Signup page (`/signup`) with role selection
- [x] Implement auth middleware (`src/lib/supabase/middleware.ts`) for route protection
- [x] Post-login redirect based on role (`platform_admin`, `school_admin`, `driver`, `parent`)
- [x] Build auth hooks (`useAuth.ts`)

## Phase 3: Database Schema

- [x] Enable PostGIS extension in Supabase
- [x] Run migrations for core entities
- [x] Write and apply RLS policies per role
- [x] Create indexes (`idx_bus_locations_bus_id`)
- [x] Generate TypeScript types from Supabase schema (`src/types/database.ts`)
- [x] Add seed data for development (`supabase/seed.sql`)

## Phase 4: Platform Admin Dashboard

- [x] Dashboard shell: Sidebar and TopBar layout (`/admin`)
- [x] Stats cards: total schools, total buses, total students
- [x] Schools CRUD table
- [x] Assign School Admins to schools
- [x] Platform-wide analytics charts

## Phase 5: School Admin Dashboard

- [x] Sidebar nav: Overview, Buses, Students, Routes, Analytics
- [x] Bus management table and add/edit flows
- [x] Assign driver to bus
- [x] Student management table and add student flow with geocoding
- [x] Smart Placement: auto-assign new student to nearest cluster/bus
- [x] Route visualization with map markers
- [x] Push announcements to drivers/buses
- [x] Analytics panel: capacity, student counts, fleet stats
- [x] Live fleet mini-map on overview page

## Phase 6: AI Route Optimization

- [x] Supabase Edge Function at `supabase/functions/optimize-route/index.ts`
- [x] Implement K-Means clustering on student coordinates
- [x] Implement Nearest-Neighbor TSP heuristic for stop ordering
- [x] Integrate Mapbox Matrix API for road-network distances
- [x] Capacity checks for bus limits
- [x] Trigger recalculation on student add/remove
- [x] Save optimized waypoints to `routes` table

## Phase 7: Expo App - Setup and Infrastructure

- [x] Initialize Expo project in `mobile/` directory (TypeScript)
- [x] ~~Configure NativeWind~~ — dropped: not installed; screens use React Native styles with `mobile/src/lib/colors`
- [x] Set up navigation stacks/routes
- [x] Set up Supabase client for React Native
- [x] Configure `@rnmapbox/maps` with Mapbox token
- [x] Configure deep linking for invite links (`/invite/[code]`)
- [x] Build shared auth screens (login)
- [x] Role-based navigation guard: driver and parent stacks
- [x] Add migration `0011_push_tokens.sql` with `push_token` in `user_roles`
- [x] Register and save `expo-notifications` device token on app launch
- [x] EAS project setup (`eas.json`, `app.json`, link to expo.dev)

## Phase 8: Expo - Driver Interface

- [x] Driver home screen
- [x] Passenger manifest (inside route screen)
- [x] Connect driver screens to real Supabase data (replace demo data)
- [x] Next pickup card: student name + address, auto-advances on attendance mark
- [x] Progress indicator: "X of Y students picked up" at top of screen
- [x] GPS broadcast status badge ("Live" indicator while route is active)
- [x] Bus capacity bar: seats filled vs. total capacity
- [x] Attendance writes to `attendance` (Boarded / Absent per student)
- [x] Start Route GPS broadcasting with `expo-location`
- [x] GPS writes to `bus_locations`
- [x] Stop Route flow and bus status update
- [x] Driver announcements to parents
- [x] Realtime subscription to School Admin announcements
- [x] Remove the last demo data: `LiveMapPreview.tsx` was unused, deleted with `data/demoRoute.ts`

## Phase 9: Expo - Parent Interface

- [x] Parent home screen
- [x] Full-screen map with live bus marker and child stop
- [x] Realtime tracking subscription for child bus
- [x] ETA calculation to child stop
- [x] Bottom sheet with child/bus/ETA/attendance
- [x] Realtime announcements feed
- [x] Attendance confirmation state

## Phase 10: Push Notifications

- [x] Edge function `supabase/functions/send-notification/index.ts`
- [x] Parent notification on boarded/absent
- [x] Driver notification on admin announcement
- [x] Parent ETA threshold alerts
- [x] Handle Expo push receipts and invalid token cleanup

## Phase 11: Web Polish and Production

- [x] Dark mode support (web)
- [x] `loading.tsx` and `error.tsx` for route segments
- [x] Toast notifications for all user actions (shadcn Sonner)
- [x] Error boundaries and custom 404 page
- [x] Lazy load Mapbox with `next/dynamic` and `ssr: false` (N/A — web uses SVG maps, no mapbox-gl imports)
- [x] SEO meta tags on all pages
- [x] Performance audit (Lighthouse) — home page, mobile, local production build (2026-09-30): Performance 92, Accessibility 100, Best Practices 100, SEO 100
- [ ] Connect custom domain on Vercel
- [x] **Edge Functions check the caller** (found and fixed 2026-10-05, deployed). Both ran with the service role key and only required a valid JWT, and the public anon key is one: anyone with the web app's public key could push any text to every parent of a school (`send-notification`, `type: announcement`) or re-optimize every bus in every school (`optimize-route` with no `bus_id`). Now `supabase/functions/_shared/caller.ts` identifies the caller: the service role (database triggers, scripts; a token claiming it is confirmed against the Auth admin API, because the runtime's `SUPABASE_SERVICE_ROLE_KEY` is not the same string as the legacy key), or a signed-in user with their roles. `optimize-route`: platform admin, service role, or the school admin of that bus's school. `send-notification`: attendance and announcements only from the service role; `eta_alert` only from the child's parent. Also fixed: "Optimize all" for one school re-planned every school's buses. Tested on production: anon key and a forged service-role JWT get 401, the service key works. Not yet tested with a signed-in school admin or parent (needs the review accounts)
- [ ] **Apply `0016_lock_optimization_helpers.sql` to production (`pnpm db:push`)**. The four route-optimization helpers from 0009 are SECURITY DEFINER with no caller checks and executable by anon: with only the public key, `get_route_optimization_payload` returns every bus with its students' home coordinates (checked on production 2026-10-05: 13 rows). 0016 makes them service-role only; only the Edge Function uses them. Claude's push was blocked by the auto-mode safety check, so run it yourself
- [ ] `redeem_invite(p_code, p_user_id)` trusts `p_user_id` instead of `auth.uid()`. Low risk (needs a valid unused invite code), but it can't simply require `auth.uid()`: production has email confirmation on, so the invite page calls it before the new user has a session. Option: allow `p_user_id = auth.uid()`, or a user created in the last few minutes who has no role yet

## Phase 12: App Store and Play Store Submission

- [x] Mapbox secret token out of git: `app.json`/`eas.json` → `RNMAPBOX_MAPS_DOWNLOAD_TOKEN` in `mobile/.env.local`, read by `mobile/app.config.js` (2026-10-01)
- [ ] **Revoke the Mapbox secret token** in the Mapbox account (Tokens page): it sat in `app.json`/`eas.json` in the public repo since Phase 7, so it is still in git history. Nothing uses it any more: the public token replaced it everywhere and it was removed from `mobile/.env.local` (2026-10-05)
- [x] Public Mapbox `pk.` token (2026-10-05): `EXPO_PUBLIC_MAPBOX_TOKEN` in `mobile/.env.local`, `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env.local` and on Vercel (production and preview, type config), `MAPBOX_ACCESS_TOKEN` secret for the Edge Functions (real road distances in route optimization). EAS environment variable `EXPO_PUBLIC_MAPBOX_TOKEN` (development, preview, production) for cloud builds
- [x] **Expo SDK 51 → 57** (2026-10-02): React Native 0.86, React 19.2, new architecture, `@rnmapbox/maps` 10.3.5 (Mapbox dropped the download token, so `app.config.js` is gone), Reanimated 4.5.1 / Worklets 0.10.1 pinned (Expo Router 57 pulls them in), `babel.config.js` removed (Expo applies its preset). `expo-doctor` 21/21, typecheck clean, `assembleDebug` builds; every native library is 16 KB aligned (`zipalign -P 16` and ELF LOAD segments). Unused storage and overlay permissions blocked. Google Maps was considered instead of Mapbox but needs a Google Cloud billing account
- [ ] **Test the SDK 57 app on a device**: the JS started on a 16 KB-page Android 16 emulator, but the emulator ran out of memory (dev laptop at ~0.4 GB free RAM) before the first screen. Re-test login, parent map, driver start/end route and background GPS, absence report, Delete account. Close other apps first or use a real phone
- [ ] Play Console: declare the location foreground service (`FOREGROUND_SERVICE_LOCATION`) with a short video of the driver starting a route
- [x] EAS build profiles in `eas.json`: shared Supabase env, preview builds an APK, remote app versions, Play internal track (2026-10-02). Validated with `eas config` (2026-10-05). The CLI signs in with `EXPO_TOKEN` in `mobile/.env.local` (an Expo access token from expo.dev → Account settings → Access tokens)
- [x] App icon, Android adaptive and notification icons, splash (`mobile/assets/`, built by `scripts/app-icons/build.mjs` from the temp logo; re-run when the final logo lands) (2026-10-02)
- [ ] iOS bundle ID and signing setup
- [x] Android keystore: created and stored by EAS on the first build (2026-10-05). `applicationId` / iOS bundle ID are `com.routeyai.app`
- [ ] First Android preview build (APK) started 2026-10-05: https://expo.dev/accounts/najeeb101/projects/routeyai/builds/0fcf0610-968c-4747-89a8-bc0d0f3ec971
- [ ] Run production builds (`eas build --platform all --profile production`)
- [ ] Internal testing via TestFlight and Play internal track
- [x] **Account deletion in the app** (Apple 5.1.1(v), Google Play): Account tab → Delete account calls `delete_my_account()` (`0015_delete_account.sql`, tested on the local database for parent, driver and platform admin); web deletion page for Play: `/privacy#delete-account` (2026-10-02). Applied to production
- [x] Store listing copy for both stores, review notes and privacy answers: [store-listing.md](store-listing.md) (2026-10-02)
- [x] Play feature graphic and 512 px Play icon: `mobile/store/`, built by `scripts/store-graphics/build.mjs` (2026-10-05)
- [ ] App Store and Play screenshots
- [ ] Demo reviewer accounts (parent + driver) on the production database: `scripts/review-accounts/setup.mjs` is written (demo school, parent with two children, Bus 1 driver, school admin; re-runnable after reviewers delete an account) but not run against production yet
- [ ] Submit to App Store review
- [ ] Submit to Google Play review
- [x] OTA updates: `expo-updates`, a channel per EAS build profile, `runtimeVersion` follows the app version (2026-10-05). Publishing needs `eas login`; see `mobile/README.md`

## Phase 13: Landing Page Launch

Full plan: [plans/2026-09-29-landing-page-launch.md](plans/2026-09-29-landing-page-launch.md)

- [x] Decide: primary CTA = "Book a demo"; pricing = fleet-size plans with "Contact us"; Arabic/RTL after launch; placeholder phone/socials removed
- [x] Split `src/app/page.tsx` into `src/components/landing/*`; page becomes a Server Component with client islands
- [x] Fix `Math.random()` QR hydration mismatch; add mobile nav menu; delete unused `DashboardPreview.tsx`
- [x] Correct copy: GPS every 10s (not 2s), remove turn-by-turn/QR/SIS claims, apps "Coming soon"
- [x] Remove `FeedbackSection`
- [x] New sections: Problem → outcome, How it works, Safety & privacy, Pricing
- [x] Server Action + Zod writing to existing `demo_requests` table (created in 0001, RLS in 0003: public insert, platform_admin select)
- [x] Wire "Book a demo" form
- [x] `/privacy` and `/terms` pages (also required for Phase 12)
- [x] `sitemap.ts`, `robots.ts`, `opengraph-image.tsx`, JSON-LD
- [x] Vercel project `routeyai` created and linked to GitHub; production env vars set (`NEXT_PUBLIC_DEMO_MODE=false`)
- [x] Fix Vercel production build (Supabase packages aligned, `database.ts` completed) — live at https://routeyai.vercel.app
- [x] Restore paused Supabase project, then test demo form end to end (2026-10-02: submitted on the live site in headless Chrome, success toast shown, row read back from `demo_requests`; the test row "TEST Claude Code" can be deleted)
- [x] Real `NEXT_PUBLIC_MAPBOX_TOKEN` locally and on Vercel (2026-10-05); live student-address geocoding works after the next deploy
- [x] Set `NEXT_PUBLIC_APP_URL=https://routeyai.vercel.app` on Vercel (production)
- [ ] Launch placeholders in `src/lib/siteConfig.ts`: set `NEXT_PUBLIC_CONTACT_EMAIL` (routeyai.com has no DNS/MX yet), legal review then `LEGAL_REVIEWED = true`, fill `PLAN_SUPPORT`
- [ ] Lighthouse ≥ 90 on mobile. Live site, 3 runs (2026-10-02): accessibility, best practices and SEO 100; performance 62, 71, 73 (LCP 2.9–3.5 s, TBT 0.7–1.2 s, CLS 0). Biggest cost is style and layout on the home page (~2.5 s of main thread), then ~1.9 s of script. Trace findings (2026-10-02, 4x CPU, phone viewport): the first two layouts (≈180 and ≈300 ms) lay out all ~1,250 boxes of the page at once; later re-layouts are cheap (9 ms), so it's the amount of content, not one bad section. At hydration the FAQ accordion (Radix) measures all nine answers and framer-motion measures SVG and parallax targets, forcing extra full-document style/layout (60–70 ms frames). The hero cards animate with framer-motion every 1.6 s, including the arrival card that's hidden on phones. Tried `content-visibility: auto` on sections below the hero (per-section placeholder heights); no measurable gain on the dev laptop (54% background CPU makes local runs too noisy), likely because those hydration-time measurements force the skipped sections to lay out anyway. Reverted. **2026-10-05:** hydration split into short tasks with a `Suspense` boundary per section (the single hydration task was 1.36 s simulated), FAQ is native `<details name="faq">` (no Radix, answers in the HTML), parallax is a CSS scroll timeline (no framer-motion measuring), the desktop arrival card is no longer rendered on phones, and `content-visibility: auto` is back on the sections below the hero (no hydration-time measuring forces them to lay out any more). Old and new production builds run side by side on the dev laptop, alternating, 3–5 runs each: performance 49–63 → 55–78, TBT 2.5–4.35 s → 0.3–2.75 s, style and layout 5.3–6.4 s → 2.0–4.3 s. Absolute numbers are pessimistic: about 200 ms (real) of every first layout is a cold-start cost of headless Chrome on this Windows laptop (the plain `/privacy` page pays it too), and the local server is HTTP/1.1 without Brotli. LCP is the hero photo; it loads in ~0.2 s but in the simulation waits for script evaluation before it's counted. Next: measure the live site with PageSpeed Insights after the deploy (keyless quota was used up again on 2026-10-05). If it's still under 90, the remaining cost is framer-motion (49 kB gz, used by the nav, hero cards and phone demos) and the 29 kB Radix/zod chunk from the demo form

## Phase 14: Parent and Driver App Upgrade

Full plan: [plans/2026-10-01-parent-driver-apps.md](plans/2026-10-01-parent-driver-apps.md)

- [x] Migration `0013_absence_reports.sql`: `absence_reports` table, trigger, RLS, realtime; `set_push_token()` so parents and drivers can save push tokens
- [x] Parent: all children on one account, child switcher on Home, History and the map
- [x] Parent: report an absence (one or more school days, reason, note) and cancel it
- [x] Parent: History tab (last 30 days, upcoming reports)
- [x] Parent: full-screen live map that follows the bus, stops before yours, only the child's own stop drawn
- [x] Parent and driver: Account tab (profile, push switch, privacy and terms, sign out)
- [x] Fix: read bus locations as hex EWKB (the live bus never showed before)
- [x] Driver: running-late notice to all parents on the bus
- [x] Driver: students staying home on Home and Route; they count as done for the stop
- [x] Driver: trip state in context, End route confirmation, end-of-route summary
- [x] Landing page phones redrawn from the new screens on real OpenStreetMap close-ups (`build.mjs` → `phone-*.webp`, `appMapData.ts`)
- [x] Local test stack: `supabase/config.toml` added; `pnpm db:reset` now replays all migrations and the seed (seeded users can sign in)
- [x] `0014_fix_rls.sql`: policy recursion (parent/driver apps could not load), missing school_admin role checks, invite listing, `set_bus_active()`
- [x] Apply `0011`–`0015` to Supabase (`pnpm db:push`, 2026-10-02). The production database had stopped at `0010`, so live invite links failed until then
- [x] Tested on an Android emulator against the local stack (2026-10-01): parent (two children, switch, report and cancel absence, history, alerts, account, live map following GPS) and driver (start route, GPS every 10 s, delay notice, check-in with a parent-reported absence, end-of-route summary, sign out)
- [x] Fixes from that test: Android build (`@rnmapbox/maps` 10.0.12 → 10.1.33 and `RNMapboxMapsImpl: mapbox`), seed users could not sign in, app now stays signed in, dev shortcuts only in dev builds, Start route hung when location was already allowed, stale GPS shown as live, ETA now follows the remaining stops, keyboard covered the absence sheet
- [x] **Background location** (2026-10-01): `mobile/src/features/driver/gpsTask.ts` runs `expo-location` background updates (`expo-task-manager`) as an Android foreground service ("Route in progress" notification) / iOS background location. Only "while using the app" permission: no "Allow all the time", no `ACCESS_BACKGROUND_LOCATION`. A route still running when the app reopens comes back so it can be ended. Emulator: rows every 10 s for 90 s with the screen locked; force-close and reopen resumed the route
- [ ] Check on a phone: End route stops the "Route in progress" notification and the GPS rows (the emulator ran out of memory before this was tested); one row per 10 s after reopening mid-route; iOS not tried yet
- [x] Map style from the user's Google Maps reference: `mobile/src/lib/mapStyle.ts` (light and dark, follows the phone setting; `userInterfaceStyle: automatic` + `expo-system-ui`), landing maps re-rendered in the same palette with named places and Arabic names
- [ ] Check the new app map style on a phone in light and dark (previewed with MapLibre; the emulator session had ended)
- [ ] Test on a real phone with push notifications (needs an EAS build)
- [x] School admin dashboard: Absences page (`/school/absences`: today, coming up, past 30 days)

## Phase 15: Mobile UI Refresh

Full plan: [plans/2026-10-05-mobile-ui-refresh.md](plans/2026-10-05-mobile-ui-refresh.md)

- [x] Decided (2026-10-05): Lucide icons, light large-title headers, rounded-rectangle buttons, dark mode after the light mode is final
- [ ] Foundations: `theme.ts`, Schibsted Grotesk + Inter, `Txt`, Lucide, `check:design`
- [ ] Components, then parent, driver and login screens
- [ ] Landing page phone mockups and store screenshots in the new style
- [ ] Dark mode (planned in the same document; starts when the light screens are final)
