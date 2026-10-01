# RouteyAI - Task Tracker

Stack: Next.js 14 | TypeScript | Tailwind CSS | shadcn/ui | Supabase | Mapbox GL JS | Vercel  
Mobile: Expo (React Native) | React Native styles | Mapbox RN | EAS

---

## Current Status Snapshot (2026-09-29)

- Completed: Phases 1–10.
- Nearly done: Phase 11 (custom domain left).
- Landing page redesign on branch `landing-redesign` (not deployed yet): photo hero with live cards, scroll-story "How it works", light and dark mode, coded app screens. Merge to `main` to deploy.
- In progress: Phase 13 — landing page live at https://routeyai.vercel.app; Supabase project paused; launch placeholders in `src/lib/siteConfig.ts`.
- Phase 14 (parent and driver app upgrade) built on `landing-redesign`; migrations `0013` and `0014` (RLS fixes, see Docs/Claude.md §5) not yet applied to Supabase.
- Not started: Phase 12 (store submission).

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

## Phase 12: App Store and Play Store Submission

- [x] Mapbox secret token out of git: `app.json`/`eas.json` → `RNMAPBOX_MAPS_DOWNLOAD_TOKEN` in `mobile/.env.local`, read by `mobile/app.config.js` (2026-10-01)
- [ ] **Rotate the Mapbox secret token** — it sat in `app.json`/`eas.json` in the public repo since Phase 7, so it is still in git history
- [ ] Public Mapbox `pk.` token for `EXPO_PUBLIC_MAPBOX_TOKEN` (the app uses the secret one locally until then); EAS secret `RNMAPBOX_MAPS_DOWNLOAD_TOKEN` for cloud builds
- [ ] Configure EAS build profiles in `eas.json`
- [ ] Add app icons and splash assets (`mobile/assets/`)
- [ ] iOS bundle ID and signing setup
- [ ] Android `applicationId` and keystore setup
- [ ] Run production builds (`eas build --platform all --profile production`)
- [ ] Internal testing via TestFlight and Play internal track
- [ ] Prepare App Store listing copy and screenshots
- [ ] Prepare Play Store listing copy and screenshots
- [ ] Submit to App Store review
- [ ] Submit to Google Play review
- [ ] Configure OTA updates via `eas update`

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
- [ ] Restore paused Supabase project (host no longer resolves), then test demo form end to end
- [ ] Add real `NEXT_PUBLIC_MAPBOX_TOKEN` (`.env.local` has the placeholder) locally and on Vercel
- [x] Set `NEXT_PUBLIC_APP_URL=https://routeyai.vercel.app` on Vercel (production)
- [ ] Launch placeholders in `src/lib/siteConfig.ts`: set `NEXT_PUBLIC_CONTACT_EMAIL` (routeyai.com has no DNS/MX yet), legal review then `LEGAL_REVIEWED = true`, fill `PLAN_SUPPORT`
- [ ] Lighthouse ≥ 90 on mobile: re-check on the live site after deploying. Local runs of the 2026-10-01 redesign: accessibility, best practices and SEO 100; performance 56–85, swinging with load on the dev laptop (layout cost cut from ~3.8 s to ~1.2 s at 4x CPU throttle)

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
- [ ] Apply `0013` and `0014` to Supabase (`pnpm db:push`) after the project is restored
- [x] Tested on an Android emulator against the local stack (2026-10-01): parent (two children, switch, report and cancel absence, history, alerts, account, live map following GPS) and driver (start route, GPS every 10 s, delay notice, check-in with a parent-reported absence, end-of-route summary, sign out)
- [x] Fixes from that test: Android build (`@rnmapbox/maps` 10.0.12 → 10.1.33 and `RNMapboxMapsImpl: mapbox`), seed users could not sign in, app now stays signed in, dev shortcuts only in dev builds, Start route hung when location was already allowed, stale GPS shown as live, ETA now follows the remaining stops, keyboard covered the absence sheet
- [ ] **Background location**: GPS stops as soon as the driver's app is in the background (screen locked or another app open). Needs `expo-location` background updates with a foreground service, "Allow all the time" and a Play Store declaration
- [x] Map style from the user's Google Maps reference: `mobile/src/lib/mapStyle.ts` (light and dark, follows the phone setting; `userInterfaceStyle: automatic` + `expo-system-ui`), landing maps re-rendered in the same palette with named places and Arabic names
- [ ] Check the new app map style on a phone in light and dark (previewed with MapLibre; the emulator session had ended)
- [ ] Test on a real phone with push notifications (needs an EAS build)
- [x] School admin dashboard: Absences page (`/school/absences`: today, coming up, past 30 days)
