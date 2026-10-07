# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Source of Truth

[Docs/Claude.md](Docs/Claude.md) is the canonical reference for the full database schema, RLS policies, color tokens, and design principles. When this file and Docs/Claude.md disagree, Docs/Claude.md wins.

Current build status: **Phases 1–10 complete; Phase 11 nearly done. Phase 13 (landing page launch) in progress** — live at https://routeyai.vercel.app (auto-deploys from `main`). Phase 12 (store submission) not started. See [Docs/task.md](Docs/task.md) for the full checklist and [Docs/plans/landing-page-launch.md](Docs/plans/landing-page-launch.md) for the landing page plan.

## Stack

**Web**: Next.js 14 App Router · TypeScript strict · Tailwind · shadcn/ui · Supabase · Mapbox GL JS · Zustand · React Hook Form + Zod · pnpm · Vercel

**Mobile**: Expo SDK 57 (React Native 0.86, new architecture) · React Native styles (tokens in `mobile/src/lib/theme.ts`, read with `useTheme()` and `<Txt variant>`; `npm run check:design` guards it; NativeWind is not installed) · `@rnmapbox/maps` · `expo-router` · `expo-location` · `expo-notifications` · EAS — lives in `mobile/`

## Commands

```bash
# Web (root)
pnpm dev              # Next.js dev server
pnpm build
pnpm lint
pnpm typecheck        # tsc --noEmit
pnpm db:types         # regenerate src/types/database.ts from Supabase schema
pnpm db:reset         # supabase db reset (runs all migrations + seed)
pnpm db:push          # push local migrations to remote Supabase
pnpm test:logic       # route planning rules (supabase/functions/_shared/*.test.ts, Node's test runner)

# Mobile (cd mobile/)
npx expo start        # start Expo dev server
npx expo start --android
npx expo start --ios
```

## Project Structure

```
routeyai/
├── src/
│   ├── app/
│   │   ├── (auth)/           # login, signup, invite/[code]
│   │   ├── (dashboard)/
│   │   │   ├── admin/        # platform admin: overview, schools, analytics
│   │   │   ├── school/       # school admin: overview, buses, students, absences, routes, analytics
│   │   │   ├── driver/       # web driver view
│   │   │   └── parent/       # web parent view
│   │   ├── privacy/, terms/  # legal pages
│   │   └── page.tsx          # landing page (Server Component)
│   ├── components/
│   │   ├── ui/               # shadcn/ui primitives
│   │   ├── auth/             # AuthShell, AuthInput, MobileAppNotice (login, signup, invite)
│   │   ├── dashboard/        # DashboardShell (SideNav, TopBar), PageHeader, Panel, StatsCard, SignatureCard, Modal, ActionButton, …
│   │   ├── maps/             # FleetMap (Mapbox GL, load via DynamicFleetMap), ParentMapSvg
│   │   └── landing/          # landing page sections + client islands (nav, modal, demo form)
│   ├── hooks/useAuth.ts
│   ├── lib/
│   │   ├── supabase/         # client.ts, server.ts, middleware.ts
│   │   └── mapbox/config.ts
│   └── types/database.ts     # Supabase schema types — hand-maintained to match migrations (every table needs `Relationships`, every RPC must be listed); replace with `pnpm db:types` output when the DB is reachable
├── mobile/
│   └── src/
│       ├── app/              # expo-router file-based routes
│       │   ├── (auth)/       # login screen
│       │   ├── (dashboard)/  # driver/ and parent/ stacks
│       │   └── invite/[code].tsx
│       ├── features/
│       │   ├── driver/       # screens/, hooks/useDriverData, context/DriverDataContext
│       │   └── parent/       # screens/ (incl. useParentData), context/ParentDataContext
│       ├── components/primitives/  # Txt, Button, Card, List, ScreenHeader, SheetModal, … (see Docs/plans/mobile-ui-refresh.md)
│       ├── components/brand/       # BrandMark, SignatureCard (navy card), RouteLine, LivePill
│       └── lib/supabase.ts
├── supabase/
│   ├── migrations/           # 0001_schema.sql … 0019_auth_email_text.sql
│   ├── tests/                # SQL checks per migration, run against the local database
│   ├── functions/
│   │   ├── optimize-route/index.ts     # Edge Function: route planner (update; optimize as a proposal)
│   │   └── send-notification/index.ts  # Edge Function: Expo push
│   └── seed.sql
└── Docs/                     # architecture, schema, feature catalog, task tracker
```

## Critical Architectural Rules

1. **Multi-tenancy lives in the DB.** Every table except `schools`/`user_roles` is scoped by `school_id`. RLS policies (Docs/Claude.md §5) use `get_user_role()` / `get_user_school_id()` helpers. Never bypass RLS in application code.

2. **Two Supabase clients — never mixed.**
   - `src/lib/supabase/server.ts` → Server Components, Server Actions, API routes.
   - `src/lib/supabase/client.ts` → Client Components only.
   - `SUPABASE_SERVICE_ROLE_KEY` is server-side only; it bypasses RLS.

3. **Mapbox is client-only.** Lazy-load with `next/dynamic` + `ssr: false`. Use `mapbox-gl` directly, not `react-map-gl`. Clean up map instances in `useEffect` return.

4. **Server Components by default.** Add `'use client'` only for interactivity, hooks, or browser APIs.

5. **Route planning = Edge Function only.** `supabase/functions/optimize-route/index.ts` keeps each bus's stop order and slots changes in; re-planning (nearest-neighbor stop order, K-means across buses) is only a proposal a school admin applies. Mapbox Directions per run. The logic is in `supabase/functions/_shared/`. Not a Next.js API route.

6. **Real-time tracking hot path:** driver writes to `bus_locations` → Supabase Realtime → parent map update. The `idx_bus_locations_bus_id` index on `(bus_id, timestamp DESC)` is critical for this path.

## Roles

`platform_admin` · `school_admin` · `driver` · `parent`

Post-login redirect is role-based. RLS policies differ per role per table — see Docs/Claude.md §5.

## Design System

Karwa / Qatar Metro aesthetic — deep blue `#1E3A8A` primary, white/slate backgrounds, Inter font, map-centric layouts. Mobile-first for driver and parent; desktop-first for admin dashboards. Full token table in Docs/Claude.md §3.1.

The admin dashboards (`/school`, `/admin`) use the mobile app's tokens (`mobile/src/lib/theme.ts`) as Tailwind colours (`ink`, `ink-2`, `canvas`, `line`, `brand`, `night`, `live`, `ok` / `warn` / `bad` with `-text` and `-tint`), Schibsted Grotesk headings (`font-display`) and the components in `src/components/dashboard/`. One navy `SignatureCard` per page, flat white cards, status as a coloured dot plus words, no uppercase labels, the landing page's easing (`ease-swift`, `animate-rise`). The map uses the apps' style (`src/lib/mapStyle.ts`, a copy of the mobile one).

## Conventions

- Absolute imports via `@/` → `src/` (web); same alias in mobile.
- PascalCase for component files; camelCase for utilities.
- One component per file, named exports.
- `cn()` from shadcn for conditional classes; never edit shadcn source files.
- Always destructure `{ data, error }` from Supabase calls and handle `error`.
- Mobile screens live under `mobile/src/features/<role>/screens/`. Route files in `mobile/src/app/` are thin — they just import and render the feature screen.

## What Not to Commit

`.env.local` (gitignored). Required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_MAPBOX_TOKEN`. See `mobile/.env.example` for mobile-specific vars.
