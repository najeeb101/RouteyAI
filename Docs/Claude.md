# RouteyAI: Technical Reference

> The single source of truth for the codebase: read it before changing anything. It is written for engineers and for AI coding assistants. Where another document disagrees with this one, this one wins. Last reviewed 2026-10-07.

**Contents**

1. [Product overview](#1-product-overview), including [two runs a day](#11-two-runs-a-day-the-core-rule)
2. [Tech stack](#2-tech-stack)
3. [Design system](#3-design-system)
4. [Project structure](#4-project-structure)
5. [Database and backend](#5-database-and-backend)
6. [Build phases and app rules](#6-build-phases-and-app-rules)
7. [Coding conventions and testing](#7-coding-conventions-and-testing)
8. [UX rules](#8-ux-rules)
9. [Operations](#9-operations)
10. [References](#10-references)

---

## 1. Product overview

**RouteyAI** is a multi-tenant school bus platform. Schools add students, RouteyAI plans a stop order for each bus, drivers run the route from a phone app, and parents follow the bus live. The look and feel follows the **Karwa Journey Planner** and **Qatar Rail / Metro Link** apps: clean, map-first, deep blue and white.

| Role | Uses | Does |
|---|---|---|
| Platform admin | Web | Adds schools, invites each school's admin |
| School admin | Web dashboard | Manages buses, drivers, students, routes, absences and announcements for one school |
| Driver | Phone app (and a web page) | Starts and ends runs, marks students, shares GPS |
| Parent | Phone app (and a web page) | Follows their children's bus, reports absences |

### 1.1 Two runs a day: the core rule

Plan, decisions and history: [plans/two-runs-a-day.md](plans/two-runs-a-day.md). Live since 2026-10-07. Every new feature must respect these five rules.

1. **Always two runs.** Every bus does a **morning run** (homes to school: pick up stop by stop, end at the school) and an **afternoon run** (school to homes: every student boards at the school and is dropped off in the **reverse** order, so the last morning stop is the first afternoon stop). There is no setting. The driver only chooses which run to start; the afternoon is offered from 11:00 Qatar time.
2. **One stop order per bus, kept.** `students.stop_order` is the chain in morning order and the afternoon is the same chain reversed. `routes` has a morning and an afternoon row per bus; its `plan_version` goes up only when the order changes. **Routes never change by themselves.** A new, moved or removed child is slotted in or out (`optimize-route` action `update`, called by the Students page) and every other stop keeps its place. A full re-plan (`optimize`) is only ever a **proposal** a school admin applies, and only if it is clearly better.
3. **Runs are records.** `bus_runs` (one per bus, Qatar day and run, written only by `start_run` / `end_run`), `attendance` per student, day and run (`boarded`, `absent`, `dropped_off`, written through `mark_attendance`), and `absence_reports.runs` (`both`, `morning`, `afternoon`).
4. **What each role sees.** Driver: the run's stops in driving order; board or absent in the morning; board at school and drop off at each stop in the afternoon; ending the afternoon with a child still on board asks first. Parent: a card for every moment of the day (waiting, on the bus, at school, dropped off, absent), the arrival time, and "Which rides?" when reporting an absence. School admin: run status per bus, children not yet dropped off (flagged in red), Morning and Afternoon routes with Update, Re-plan and Re-plan all.
5. **Privacy.** A parent never reads `routes`. `get_parent_route` and `get_parent_bus_progress` return only the road line, their own child's stop and counts.

---

## 2. Tech stack

| Layer | Technology | Notes |
|---|---|---|
| Web framework | Next.js 14 (App Router) | Server Components by default; deployed on Vercel from `main` |
| Language | TypeScript (strict) | No `any` |
| Styling | Tailwind CSS 3, shadcn/ui, Radix | Dashboard kit in `src/components/dashboard/` |
| Database and backend | Supabase: PostgreSQL + PostGIS, Auth, Realtime, Edge Functions (Deno) | Access rules live in the database (RLS) |
| Maps | Mapbox: GL JS (web), `@rnmapbox/maps` (app), Directions, Geocoding | `mapbox-gl` directly, never `react-map-gl` |
| Phone app | Expo SDK 57, React Native 0.86, expo-router | In `mobile/`; styles from `mobile/src/lib/theme.ts`; EAS builds |
| State and forms | Zustand, React Hook Form, Zod | |
| Package managers | pnpm (web), npm (mobile) | |

Environment variables (`.env.local`, never committed; templates in `.env.example` and `mobile/.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server only; bypasses RLS
NEXT_PUBLIC_MAPBOX_TOKEN=       # public pk. token
```

---

## 3. Design system

One design everywhere: the landing page, the phone apps and the admin dashboards. The source of truth for tokens is `mobile/src/lib/theme.ts`; the web dashboard maps the same tokens to Tailwind colours in `tailwind.config.ts`, and the landing page uses the matching shadcn tokens in `globals.css`.

### 3.1 Colour tokens

| Token (web / app) | Light | Dark (app) | Use |
|---|---|---|---|
| `ink` | `#0F172A` | `#F1F5F9` | Primary text |
| `ink-2` / `inkSecondary` | `#64748B` | `#94A3B8` | Secondary text |
| `ink-3` / `inkTertiary` | `#94A3B8` | `#64748B` | Placeholders, disabled |
| `canvas` | `#F6F7F9` | `#020617` | Screen background |
| `surface` | `#FFFFFF` | `#0B1220` | Cards, lists |
| `surfaceRaised` (app) | `#FFFFFF` | `#131C2E` | Sheets and cards floating over the map |
| `line` / `separator` | `#E5E7EB` | white at 8% | Hairlines |
| `brand` | `#1E3A8A` | `#3B82F6` | Things you can act on: buttons, links, selected states |
| `night` | `#0A1430` | `#0A1430` | The navy signature card, sidebar and login panel |
| `live` | `#38BDF8` | `#38BDF8` | The pulsing live dot only |
| `ok` / `warn` / `bad` | `#10B981` / `#F59E0B` / `#EF4444` | same | Status dots and fills; `-text` and `-tint` variants for words and banners |

Text shades for status pass 4.5:1 on their surface (`#047857`, `#B45309`, `#B91C1C` on light; lighter shades on dark). Never use raw hex in components: the app's `npm run check:design` fails on it.

### 3.2 Typography, shape and motion

- **Type:** Schibsted Grotesk 700 for headings and big numbers (`font-display`), Inter 400/500/600 for text. No uppercase micro-labels and nothing under 12 px.
- **Radii:** 6 (badges), 12 (cards, inputs, buttons), 20 (dialogs, sheets, the signature card).
- **Spacing:** a 4 pt grid; 20 px gutters on phones.
- **Depth:** cards are flat white on the grey canvas, with no border and no shadow. The app's one soft shadow is only for things floating over the map; in dark mode they use a lighter surface instead.
- **Motion:** the landing page's easing (`ease-swift`, `cubic-bezier(0.22, 1, 0.36, 1)`), content that settles in (`animate-rise`), counting numbers, sliding highlights and map lines that draw in. All of it stops with the reduced-motion setting.

### 3.3 Identity and principles

- One navy **signature card** per screen (a soft blue glow, white text), a pulsing cyan **Live** pill, and status shown as a coloured dot plus words, not tinted pills.
- **Map-centric:** the map is the hero wherever a route or a bus appears. **One primary action per screen.** Mobile-first for drivers and parents, desktop-first for admin dashboards. Every action shows a loading state, a success toast or an error.
- **Dark mode:** the phone app follows the phone's appearance (`useTheme()`, `useIsDark()`, `useFloatingShadow()`). The landing page has a light and dark theme with a switch. The admin dashboards are light only.

### 3.4 Component kit

| Where | Components |
|---|---|
| Dashboards (`src/components/dashboard/`) | `DashboardShell`, `SideNav`, `TopBar`, `PageHeader`, `Panel`, `StatsCard`, `SignatureCard`, `LivePill`, `StatusText` / `Badge`, `Notice`, `Modal`, `ActionButton`, `Field`, `SegmentedControl`, `EmptyState`, `CountUp`, `Rise` |
| Sign-in screens (`src/components/auth/`) | `AuthShell`, `AuthInput`, `MobileAppNotice` |
| Phone app (`mobile/src/components/`) | Primitives (`Txt`, `Button`, `Card`, `List`, `Banner`, `Chip`, `SegmentedControl`, `SheetModal`, `TextField`, `Stat`, `StatusText`, `ProgressBar`, `ScreenHeader`) and brand pieces (`BrandMark`, `SignatureCard`, `RouteLine`, `LivePill`) |
| Landing page (`src/components/landing/`) | Sections and client islands (nav, app modal, FAQ, demo form) |

### 3.5 Maps

One Google Maps-like palette everywhere: grey land, white (light) or charcoal (dark) roads, soft green parks, blue water, category-coloured place dots, English names with Arabic underneath. App: `mobile/src/lib/mapStyle.ts` (Mapbox Streets data, follows the phone's setting). Web dashboard: `src/lib/mapStyle.ts`, a copy of it (keep the two in step). Landing page: `scripts/landing-map/build.mjs` renders OpenStreetMap data with the same colours. Route lines are bus-coloured with a white casing; on dark maps the default line is `#8AB4F8`.

---

## 4. Project structure

```
RouteyAI/
├── src/                          Web app (Next.js)
│   ├── app/
│   │   ├── (auth)/               login, signup, invite/[code]
│   │   ├── (dashboard)/
│   │   │   ├── admin/            platform admin: overview, schools, analytics
│   │   │   ├── school/           school admin: overview, routes, students, absences, buses (fleet), analytics
│   │   │   ├── driver/           web driver page
│   │   │   └── parent/           web parent page
│   │   ├── privacy/, terms/      legal pages (also used for store listings)
│   │   └── page.tsx              landing page (Server Component)
│   ├── components/
│   │   ├── ui/                   shadcn/ui primitives (never edit)
│   │   ├── dashboard/, auth/     dashboard and sign-in kits (section 3.4)
│   │   ├── maps/                 FleetMap (Mapbox GL, load via DynamicFleetMap), ParentMapSvg
│   │   └── landing/              landing page sections and client islands
│   ├── lib/
│   │   ├── supabase/             client.ts, server.ts, middleware.ts
│   │   ├── dashboard/            today.ts (live day data), planner.ts and plannerText.ts (optimize-route calls and their wording)
│   │   ├── runs.ts, geo.ts, mapStyle.ts, mapbox/, constants.ts, siteConfig.ts
│   │   └── actions/, validations/
│   ├── hooks/useAuth.ts
│   └── types/database.ts         hand-maintained to match the migrations
├── mobile/                       Expo app for drivers and parents (mobile/README.md)
│   └── src/
│       ├── app/                  expo-router routes (thin: import a feature screen)
│       ├── features/             auth/, account/, driver/, parent/ (screens, hooks, context)
│       ├── components/           primitives/, brand/, navigation/
│       └── lib/                  theme.ts, runs.ts, mapStyle.ts, supabase.ts, push.ts
├── supabase/
│   ├── migrations/               0001 to 0021 (section 5.6)
│   ├── functions/
│   │   ├── optimize-route/       route planner
│   │   ├── send-notification/    Expo push
│   │   └── _shared/              pure planning and wording logic, with Node tests
│   ├── tests/                    SQL checks for 0017, 0018, 0020 and 0021
│   └── seed.sql                  demo data for local development
├── scripts/                      app-icons/, landing-map/, review-accounts/ (demo accounts), store-graphics/
├── deck/                         pitch deck (HTML)
└── Docs/                         this documentation (index: Docs/README.md)
```

`src/lib/runs.ts` and `mobile/src/lib/runs.ts` hold the same run rules (which run, stop order, bus status); keep them in step. Both are covered by `pnpm test:logic`.

---

## 5. Database and backend

### 5.1 Tables

All in `public`, all with RLS on, all scoped by `school_id` except `schools` and `user_roles`. PostGIS `GEOGRAPHY(POINT, 4326)` columns come back from the API as hex EWKB; parse them with `parsePoint` (`src/lib/geo.ts`, `mobile/src/lib/geo.ts`).

| Table | Purpose and key columns |
|---|---|
| `schools` | `name`, `address`, `starting_point` (the school's location), `created_by` |
| `user_roles` | `user_id`, `role` (`platform_admin`, `school_admin`, `driver`, `parent`), `school_id` (NULL for platform admins), `push_token` |
| `buses` | `school_id`, `name`, `capacity`, `driver_id`, `color` (route colour), `is_active` (true while a run is open) |
| `students` | `school_id`, `name`, `parent_id`, `home_address`, `home_location`, `bus_id`, `stop_order` (the bus's chain, morning order) |
| `routes` | One row per bus **and run** (`UNIQUE(bus_id, run)`): `run`, `waypoints` (`{lat, lng, student_id, stop_order, eta_offset_min}`), `total_distance_km`, `total_duration_min`, `encoded_polyline` (Mapbox road line; NULL means straight lines), `plan_version`, `suggestion` ("re-planning would save N min"), `optimized_at` |
| `bus_runs` | One per bus, Qatar day and run: `school_id`, `date`, `run`, `stops` (student ids in driving order at start, never homes), `plan_version`, `started_at`, `ended_at` |
| `attendance` | Per student, day and run (`UNIQUE(student_id, date, run)`): `status` (`boarded`, `absent`, `dropped_off`), `run`, `dropped_off_at`; `created_at` is the boarding time |
| `absence_reports` | A parent's report ahead of time (one per child per day): `reason`, `note`, `runs` (`both`, `morning`, `afternoon`), `reported_by`; `school_id` is set by a trigger |
| `bus_locations` | Driver GPS: `bus_id`, `location`, `heading`, `speed`, `timestamp`. Index `idx_bus_locations_bus_id (bus_id, timestamp DESC)` is critical for live tracking |
| `announcements` | `school_id`, `bus_id` (NULL = whole school), `sender_id`, `message` |
| `invites` | One-time codes: `code`, `role`, `school_id`, `bus_id`, `student_ids`, `expires_at`, `used_at` |
| `demo_requests` | Leads from the landing page's "Book a demo" form |

Foreign keys to `auth.users` other than `user_roles` are `ON DELETE SET NULL`, so deleting an account leaves school records intact (migration 0015).

### 5.2 Row level security

Access is decided in the database, never only in the app. Helpers (all `SECURITY DEFINER`): `get_user_role()`, `get_user_school_id()`, and `auth_driver_bus_ids()`, `auth_driver_student_ids()`, `auth_parent_bus_ids()`, `auth_parent_student_ids()`. The last four exist because policies that subquery `buses` and `students` from each other recursed ("infinite recursion detected in policy"). Every `school_admin` policy also checks `get_user_role() = 'school_admin'`, because parents and drivers have a `school_id` too.

| Role | Can read | Can write |
|---|---|---|
| Platform admin | Everything | Schools, buses, students, routes, invites, user roles |
| School admin | Own school's rows | Own school's buses, students, routes, announcements, invites (never `attendance` or `bus_runs`) |
| Driver | Own bus, its students, its route, its runs and marks, absence reports for its bus, announcements for its bus or school | `bus_locations` for own bus, announcements for own bus, and (through functions only) runs and attendance |
| Parent | Own children, their bus, runs, marks, location and absence reports, announcements for their bus or school | Absence reports for own children (today or later: create and cancel); everything else through functions. **No read access to `routes`** |
| Anyone signed out | Nothing | One demo request |

Invites can't be listed; the invite page calls `get_invite(code)`.

### 5.3 Functions (RPC)

Called with `supabase.rpc(...)`. Functions marked service-only are for the Edge Functions. A new `SECURITY DEFINER` function without its own role check must `REVOKE ALL ... FROM PUBLIC, anon, authenticated` (Supabase grants those roles execute on new functions by default).

| Group | Functions |
|---|---|
| Runs (drivers) | `start_run(run)`, `end_run()`, `mark_attendance(student, status)`; run, step and bus are checked inside |
| Parents | `get_parent_route(student, run)`, `get_parent_bus_progress(student)`, `set_push_token(token)`, `delete_my_account()` |
| School admin | `create_bus`, `add_student`, `send_announcement`, `get_buses_with_drivers`, `get_students_with_bus`, `get_school_info`, `get_recent_announcements`, `generate_driver_invite`, `generate_parent_invite` |
| Platform admin | `create_school`, `generate_school_admin_invite`, `get_schools_with_admins`, `get_platform_stats` |
| Invites and sign-up | `get_invite(code)`, `redeem_invite(code, user)` |
| Planner (service-only) | `get_route_plan_payload`, `save_route_plan`, `run_stops`, `get_school_optimization_payload`, `save_student_bus_assignments`, `get_route_optimization_payload` |
| Helpers | `qatar_today()`, `get_user_role()`, `get_user_school_id()`, the four `auth_*_ids()` helpers, `parent_route_child` and `parent_route_place` (service-only) |

Triggers: `attendance_notify_parent` and `announcements_notify_parent` (call `send-notification`), `absence_reports_defaults`, and `updated_at` triggers on schools, buses and students.

### 5.4 Realtime

Published tables: `bus_locations` (the hot path: driver writes, parents' maps update), `bus_runs`, `attendance`, `absence_reports`, `announcements`. The attendance trigger sends `run` and `previous_status`, skips undo taps, and sends drop-offs as type `drop_off`.

### 5.5 Edge Functions

Both in `supabase/functions/`, importing `npm:@supabase/supabase-js@2.117.2` (not esm.sh, which failed on unpinned types). The gateway's `verify_jwt` accepts the public anon key, so each function checks its caller itself with `_shared/caller.ts`: the service role (database triggers, scripts), or a signed-in user and their roles.

**`optimize-route`.** Allowed for platform admins, the service role, and the school admin of the bus's school. The planning logic is pure functions in `_shared/` (`busPlanner`, `routePlan`, `routeGeometry`, `directions`, `busAssignment`) with Node tests.

| Request | Effect |
|---|---|
| `{ action: 'update', bus_id \| school_id }` (also any request with no `action`) | Keeps each bus's order, slots newcomers and movers in, drops leavers, leaves a bus with no changes alone. Never reorders |
| `{ action: 'optimize', bus_id }` | A **proposal**: a fresh plan for one bus. `apply: true` with a `chain` saves it only if it is still clearly better and nothing changed since |
| `{ action: 'optimize', school_id }` | A proposal of new bus assignments for the school; `apply: true` with `assignments` saves them |
| `{ action: 'update', reverse: true }` | Service role only, once: flips routes planned before two runs so the morning ends at the school |

Mapbox Directions per run (split above 24 stops); without a token it falls back to straight lines at 30 km/h.

**`send-notification`.** Attendance and announcement pushes come from the database triggers (service role). The only thing an app may ask for is the `eta_alert` ("bus almost there") for the caller's own child, and it goes out only on the running run (morning: the child is still waiting; afternoon: the child is on board). Wording per run comes from `_shared/notifications.ts`; `dry_run: true` (service role) returns the messages without sending.

### 5.6 Migrations

Run in order with `pnpm db:push`. Types in `src/types/database.ts` are maintained by hand to match (every table needs `Relationships`, every RPC must be listed).

| # | Adds |
|---|---|
| 0001 to 0004 | Schema, invites, RLS, realtime |
| 0005 to 0009 | Admin, school and route helper functions, Smart Placement, route-optimization helpers |
| 0010 to 0012 | Routes with `school_id`, push tokens, notification triggers |
| 0013 | Absence reports |
| 0014 | RLS fixes: non-recursive policies, role checks, invite lookup |
| 0015 | In-app account deletion (`delete_my_account`) and `SET NULL` foreign keys |
| 0016 | Route-optimization helpers made service-only |
| 0017 | **Two runs a day**: `bus_runs`, per-run attendance and routes, `start_run`, `end_run`, `mark_attendance`, `save_route_plan` |
| 0018 | Parent route without other homes (`get_parent_route`, `get_parent_bus_progress`) |
| 0019 | Email columns cast to text in `get_buses_with_drivers` and `get_schools_with_admins` (they failed on Postgres 17) |
| 0020 | Clean-up: drops `set_bus_active`, `save_optimized_route`, drivers' direct attendance writes and the parent policy on `routes` |
| 0021 | Drops the unused `recalculate_route`, `get_routes_with_buses` and `get_school_stats` |

SQL checks for 0017, 0018 and 0020 are in `supabase/tests/` (section 7.3).

---

## 6. Build phases and app rules

### 6.1 Phases

Numbering matches [task.md](task.md), which holds the live checklist.

| Phase | Scope | Status (2026-10-07) |
|---|---|---|
| 1 | Project setup and first landing page | Done |
| 2 | Auth and role system | Done |
| 3 | Database schema, PostGIS, RLS, seed | Done |
| 4 | Platform admin dashboard | Done |
| 5 | School admin dashboard | Done |
| 6 | Route optimization Edge Function | Done |
| 7 | Expo app setup | Done |
| 8 | Driver interface | Done |
| 9 | Parent interface | Done |
| 10 | Push notifications | Done |
| 11 | Web polish and production | Custom domain left |
| 12 | App Store and Play Store submission | Not started |
| 13 | Landing page launch | In progress |
| 14 | Parent and driver app upgrade (child switcher, absence reports, history, delay notices, trip summary) | Done |
| 15 | Mobile UI refresh: one design everywhere, light and dark mode | Done (dark mode still to check on an iPhone) |
| 16 | **Two runs a day**, stable routes, drop-offs, the redesigned school dashboard (section 1.1) | Done and live |

### 6.2 Driver

- Mobile-first and one-handed. No turn-by-turn navigation: drivers know their roads.
- Home: the run to start (morning, or the afternoon from 11:00), the next stop as the signature card, "X of Y picked up" (or "dropped off") always visible.
- Route: stops in the run's driving order. Morning: Board or Absent per student. Afternoon: Board at school, then Drop off at each stop. Students reported absent by their parents count as done. Ending the afternoon with a child still on board asks first.
- GPS: starting a run sends the phone's location to `bus_locations` every 10 seconds, including with the screen locked (background task in `mobile/src/features/driver/gpsTask.ts`). There is no simulated GPS.
- Messages to the parents on the bus, a running-late notice in one tap, an end-of-run summary, and an Account tab.

### 6.3 Parent

- Home: a card for the moment of the day (waiting, on the bus, at school, dropped off, absent), the arrival time, and "Which rides?" when reporting an absence.
- Track: the full-screen map with the live bus (Supabase Realtime on `bus_locations`), the child's own stop and the ETA. Only the child's own stop is ever shown.
- Every child on the account with a switcher, 30-day history per run, alerts, and an Account tab (push switch, privacy, sign out, delete account).

### 6.4 School admin dashboard

- **Overview:** today at a glance (runs, check-ins, who has not been dropped off, flagged in red), a live fleet map, bus status and announcements. Follows the day live through Realtime.
- **Routes:** a card per bus with a Morning / Afternoon switch, map and stops in driving order. **Update** slots changes in. **Re-plan** and **Re-plan all** show a proposal to apply or keep; a bus that can't save enough says "Your route is already good".
- **Students:** add, edit, change bus, invite parent, remove. Each change calls `update` for the buses it touched, so the route is up to date straight away; a changed address is geocoded first.
- **Fleet, Absences, Analytics:** buses and drivers with run status, parent-reported absences with the rides they cover, and real figures from the last 28 days.
- Platform admins have Overview, Schools and Analytics.

### 6.5 Landing page

- Every claim must describe a shipped feature (no invented integrations). Plan: [plans/landing-page-launch.md](plans/landing-page-launch.md).
- The primary call to action is **Book a demo** (writes to `demo_requests`); parents and drivers join through invite links.
- A Server Component; only the nav menu, app modal, FAQ accordion and demo form are client islands.

---

## 7. Coding conventions and testing

### 7.1 General

- TypeScript everywhere. Functional components, named exports, one component per file.
- PascalCase for components and their files (`StatsCard.tsx`), camelCase for functions, variables and utility files, SCREAMING_SNAKE for constants.
- Absolute imports with `@/` (`src/` on the web, `mobile/src/` in the app).
- Mobile route files in `mobile/src/app/` stay thin: they render a feature screen from `mobile/src/features/<role>/`.

### 7.2 Web, Supabase and Mapbox

- Server Components by default; `'use client'` only for interactivity, hooks or browser APIs. Give each route segment a `loading.tsx` and `error.tsx`.
- **Two Supabase clients, never mixed:** `src/lib/supabase/server.ts` in Server Components, Server Actions and API routes; `client.ts` in Client Components. The service role key is server-side only and bypasses RLS: never use it in client-facing code.
- Always destructure `{ data, error }` from Supabase calls and handle `error`. Show friendly messages (toasts) and never expose raw database errors.
- **Route planning lives in the Edge Function**, not in a Next.js API route.
- **Mapbox is client-only:** lazy-load with `next/dynamic` and `ssr: false`, use `mapbox-gl` directly, and clean up the map in the `useEffect` return.
- Tailwind utilities, shadcn components as the base (customise with Tailwind, never edit shadcn source), `cn()` for conditional classes. Use the tokens in section 3.1.

### 7.3 Testing

| Command | What it checks |
|---|---|
| `pnpm typecheck`, `pnpm lint` | Web types and lint |
| `pnpm test:logic` | Route planning, notification wording, run rules and planner text (Node's test runner) |
| `cd mobile && npx tsc --noEmit && npm run check:design` | App types, and that no component bypasses the design tokens |
| `docker exec -i supabase_db_RouteyAI psql -U postgres -v ON_ERROR_STOP=1 -q < supabase/tests/<file>.sql` | SQL checks for a migration against the local database; each runs in a rolled-back transaction and prints `ok: ...` per check |

Always test with several roles: platform admin, school admin, driver and parent. Demo accounts for production and local development are set up by `scripts/review-accounts/` and `supabase/seed.sql`.

---

## 8. UX rules

1. One primary action per screen.
2. Always show feedback: loading states, success toasts, error messages.
3. Colour means something: green is on time or success, amber is a warning, red is an error or a child not accounted for, blue is information or tracking.
4. Mobile-first for drivers and parents: large tap targets, minimal text. Desktop-first for admins: data-rich tables, sidebar navigation.
5. Maps are the hero: full width, loaded fast, interactive.
6. Quick add and edit forms open in dialogs, not new pages.
7. Real-time should feel instant: Realtime subscriptions plus optimistic updates.
8. It must feel like a transport app (Karwa, Metro Link), not a generic SaaS dashboard: clean, blue, map-first, trustworthy.

---

## 9. Operations

| Task | How |
|---|---|
| Deploy the website | Merge to `main`; Vercel builds and deploys |
| Change the database | Add a migration, run it locally (`pnpm db:reset`), then `pnpm db:push` |
| Deploy the Edge Functions | `npx supabase functions deploy optimize-route send-notification` |
| Build the phone app | EAS (`mobile/eas.json`); JS-only changes can go out as over-the-air updates |
| Work on features | Branch from `main`, open a pull request, merge when checked |

Notes:

- Never commit `.env.local`. The Mapbox token needs the Geocoding, Directions and GL JS scopes, and must also be set in Vercel as `NEXT_PUBLIC_MAPBOX_TOKEN`.
- `mobile/.env.local` points at the live Supabase project so a phone can reach it; the local stack at `127.0.0.1:54321` is only reachable from an emulator or the web preview.
- Expo Go can't draw Mapbox maps (it shows a placeholder); the map needs a development or store build.
- Route planning uses a nearest-neighbour heuristic over Mapbox travel times; an upgrade to Google OR-Tools or OSRM is planned if scale needs it.

---

## 10. References

[Next.js](https://nextjs.org/docs) · [Supabase](https://supabase.com/docs) · [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) · [Expo](https://docs.expo.dev) · [shadcn/ui](https://ui.shadcn.com) · [Tailwind CSS](https://tailwindcss.com/docs) · [Zustand](https://zustand-demo.pmnd.rs/) · [React Hook Form](https://react-hook-form.com/) · [Zod](https://zod.dev/)
