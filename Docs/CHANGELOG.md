# Engineering Log

Dated notes on what was built, decided and learned, newest first. The checklist is in [task.md](task.md); the technical reference is [Claude.md](Claude.md).

---

## 2026-10-10: Legal and accessibility pass

- New `/cookies` and `/refunds`; `/privacy` and `/terms` expanded; consent boxes on the demo, sign-up and invite forms; AI-image labels; unsupported claims reworded; contrast, keyboard and screen-reader fixes. Details and the open decisions: [plans/legal-and-accessibility.md](plans/legal-and-accessibility.md).
- Web token `ink-2` is now `#5B6B82` (was `#64748B`) so small grey text passes 4.5:1 on the canvas; the phone app's token is unchanged.
- Business details come from `NEXT_PUBLIC_BUSINESS_*` variables and stay hidden until set.

## 2026-10-07: Two runs a day goes live

- **Release.** Migrations 0017 to 0020, both Edge Functions and the existing routes (flipped once so each morning ends at the school) went to production, followed by the website (PRs #6, #8, #9, #10, #11). All four buses have both runs; no run is left open. The iPhone test in Expo Go passed.
- **0019** casts the email columns in `get_buses_with_drivers` and `get_schools_with_admins`; they failed on Postgres 17, so the dashboard showed no buses locally.
- **0020 clean-up** dropped `set_bus_active`, `save_optimized_route`, drivers' direct writes to `attendance` and the parent policy on `routes`. `send-notification` lost its fallback for the old driver app. SQL checks: `supabase/tests/0020_two_runs_cleanup.sql`; the 0017 checks now clear their own local data first.
- **School dashboard** rebuilt on the app and landing page design: navy side bar, signature card, flat cards, Schibsted headings, a real Mapbox map and new animations. Routes page with a Morning / Afternoon switch, Update, Re-plan and Re-plan all as proposals; the Students page slots every change into the route; the Overview follows the day live and flags children not marked dropped off; Fleet shows each bus's run; Absences shows the rides each report covers; Analytics uses real runs and check-ins (the old page showed made-up figures). 13 end-to-end checks on the local stack.
- **Sign-in and platform admin** restyled with the same kit (`src/components/auth/`); platform Analytics now shows real students and seats instead of invented schools.
- **Landing page and store copy** describe the morning and afternoon runs, slotting in new students, and drop-off notifications.
- **Dark mode** for the phone app: a second palette behind `useTheme()`, raised surfaces instead of shadows, a hairline on the navy card, status bar and navigation backgrounds that follow the setting. Checked on every parent and driver screen in the web preview; light mode unchanged. Still to check on an iPhone.
- **Docs** reorganised: the technical reference rebuilt against the real schema, this log split out of the task tracker, `fixes.md` folded into the two-runs plan.
- **Found:** `recalculate_route`, `get_routes_with_buses` and `get_school_stats` were unused; `recalculate_route` randomly nudged a route's distance and time and school admins could call it. Migration `0021` drops all three (written and checked locally; push it with `pnpm db:push`).
- **Pitch deck** (`deck/`) updated for two runs a day: routes stay put and new students slot in, morning pickups and afternoon drop-offs, no more "press Optimize".

## 2026-10-06: Two runs a day built; identity; fixes

- **Plan decided** ([plans/two-runs-a-day.md](plans/two-runs-a-day.md)). Step 1 (`0017_two_runs.sql`, the route rules in `_shared/routePlan.ts`, SQL checks) went to production the same day; nothing changed for users.
- **Step 2:** `optimize-route` with `update` and proposal-style `optimize`, run-aware `send-notification` with `dry_run`. 49 logic tests and 35 local end-to-end checks.
- **Step 4:** the new driver and parent apps (run picker, afternoon boarding and drop-offs, "Which rides?" absences, history per run) and the privacy fix `0018_parent_route.sql`. 22 checks through a simulated day in the web preview, 11 database checks, 59 logic tests.
- **Mobile UI refresh** merged (PR #4): tokens, Schibsted Grotesk and Inter, Lucide icons, and a RouteyAI identity (logo header, navy signature card, stop line, pulsing live pill, navy login) after the first light version felt "white everywhere".
- **Fixes 1A and 2** (PR #5): the Students page stopped re-planning every route after each change, "Optimize all" asks first, buses without a route get "Plan route", and editing an address saves its new map location.
- **Security:** `0016_lock_optimization_helpers.sql` is on production; an anonymous call to a route-optimization helper gets `401`.

## 2026-10-05: Edge Function caller checks, Mapbox tokens, Expo 57 builds, landing performance

- **Edge Functions check their caller.** Both ran with the service role key and only required a valid JWT, and the public anon key is one: anyone with the web app's key could push any text to every parent of a school (`send-notification`, `type: announcement`) or re-optimize every bus in every school (`optimize-route` with no `bus_id`). `supabase/functions/_shared/caller.ts` now identifies the caller: the service role (database triggers, scripts; a token claiming it is confirmed against the Auth admin API, because the runtime's `SUPABASE_SERVICE_ROLE_KEY` is not the same string as the legacy key), or a signed-in user and their roles. `optimize-route` allows a platform admin, the service role, or the school admin of that bus's school; `send-notification` takes attendance and announcements only from the service role and `eta_alert` only from the child's parent. Also fixed: "Optimize all" for one school re-planned every school's buses. Tested on production: the anon key and a forged service-role token get `401`, the service key works. Not yet tested with a signed-in school admin or parent.
- **Mapbox.** A public `pk.` token replaced the secret download token everywhere: `EXPO_PUBLIC_MAPBOX_TOKEN` (app and EAS cloud builds), `NEXT_PUBLIC_MAPBOX_TOKEN` (local and Vercel, production and preview), `MAPBOX_ACCESS_TOKEN` as an Edge Function secret (real road distances). The old secret token had sat in `app.json` and `eas.json` in the public repo until 2026-10-01 (it then moved to an untracked env file and was removed from there on 2026-10-05), so it is still in git history and must be revoked.
- **EAS.** Build profiles validated with `eas config`; the Android keystore was created by EAS on the first build; the application ID and iOS bundle ID are `com.routeyai.app`. OTA updates added: `expo-updates`, a channel per profile, `runtimeVersion` follows the app version (publishing needs `eas login`; see `mobile/README.md`). Play feature graphic and 512 px icon built by `scripts/store-graphics/build.mjs`.
- **Landing page performance.** Hydration was split into short tasks with a `Suspense` boundary per section, the FAQ became native `<details name="faq">` (no Radix, answers in the HTML), parallax became a CSS scroll timeline (no framer-motion measuring), the desktop arrival card is no longer rendered on phones, and `content-visibility: auto` is back on the sections below the hero. Old and new builds run side by side on the dev laptop: performance 49–63 to 55–78, total blocking time 2.5–4.35 s to 0.3–2.75 s, style and layout 5.3–6.4 s to 2.0–4.3 s. Absolute numbers are pessimistic: about 200 ms of every first layout is a cold-start cost of headless Chrome on that laptop, and the local server is HTTP/1.1 without Brotli. Next: measure the live site with PageSpeed Insights; if it is still under 90, the remaining cost is framer-motion (49 kB gzipped; nav, hero cards, phone demos) and the 29 kB Radix/zod chunk from the demo form.

## 2026-10-02: Expo SDK 57, account deletion, production catch-up

- **Expo SDK 51 to 57:** React Native 0.86, React 19.2, new architecture, `@rnmapbox/maps` 10.3.5 (Mapbox dropped the download token, so `app.config.js` went away), Reanimated 4.5.1 and Worklets 0.10.1 pinned, `babel.config.js` removed. `expo-doctor` 21/21, typecheck clean, `assembleDebug` builds, every native library is 16 KB aligned, unused storage and overlay permissions blocked. Google Maps was considered instead of Mapbox but needs a Google Cloud billing account. The JS started on a 16 KB-page Android 16 emulator, which then ran out of memory, so a device test is still open.
- **Account deletion in the app** (Apple 5.1.1(v), Google Play): Account tab, Delete account, `delete_my_account()` (`0015_delete_account.sql`, tested for parent, driver and platform admin). Web page for Play: `/privacy#delete-account`.
- **Production catch-up.** Migrations `0011` to `0015` were applied (the live database had stopped at `0010`, so invite links failed). After the paused Supabase project was restored, the demo form was tested end to end on the live site.

## 2026-10-01: Phase 14 tested on an emulator; background GPS; map style

- Tested on an Android emulator against the local stack: parent (two children, switch, report and cancel an absence, history, alerts, account, a live map following GPS) and driver (start, GPS every 10 s, delay notice, check-in with a parent-reported absence, end-of-route summary, sign out).
- Fixes from that test: Android build (`@rnmapbox/maps` 10.0.12 to 10.1.33 and `RNMapboxMapsImpl: mapbox`), seed users could not sign in, the app now stays signed in, dev shortcuts only in dev builds, "Start route" hung when location was already allowed, stale GPS shown as live, ETA now follows the remaining stops, the keyboard covered the absence sheet.
- **Background location:** `mobile/src/features/driver/gpsTask.ts` runs `expo-location` background updates as an Android foreground service ("Route in progress" notification) and iOS background location, with "while using the app" permission only (no "Allow all the time"). A route still running when the app reopens comes back so it can be ended. On the emulator: rows every 10 s for 90 s with the screen locked, and force-close and reopen resumed the route.
- **Map style** from a Google Maps reference (`mobile/src/lib/mapStyle.ts`, light and dark, follows the phone), with the landing maps re-rendered in the same palette with named places and Arabic names. `0014_fix_rls.sql`, from the same period, fixed the parent and driver apps failing on policy recursion, missing school-admin role checks and invite listing.

## 2026-09-30: Lighthouse baseline

Home page, mobile, local production build: Performance 92, Accessibility 100, Best Practices 100, SEO 100. On the live site (three runs, 2026-10-02) accessibility, best practices and SEO were 100 and performance 62, 71 and 73 (LCP 2.9–3.5 s, total blocking time 0.7–1.2 s, no layout shift). The first two layouts (about 180 and 300 ms) lay out all ~1,250 boxes at once, and at hydration the FAQ accordion and framer-motion forced extra full-document layouts. `content-visibility: auto` was tried and reverted for lack of a measurable gain on a noisy laptop; the 2026-10-05 work above is what finally helped.
