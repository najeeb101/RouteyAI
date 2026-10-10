# AGENTS.md

Guidance for Codex and other coding agents working in this repository. It mirrors CLAUDE.md.

## Source of truth

[Docs/Claude.md](Docs/Claude.md) is the canonical technical reference (schema, access rules, design tokens, conventions). Where this file and Docs/Claude.md disagree, Docs/Claude.md wins. The other docs are indexed in [Docs/README.md](Docs/README.md).

**Status (2026-10-07):** phases 1–10 and 14–16 are complete and live at https://routeyai.vercel.app (the website auto-deploys from `main`). Phase 11 (custom domain) is nearly done, phase 13 (landing page launch) is in progress and phase 12 (store submission) has not started. The live checklist is [Docs/task.md](Docs/task.md).

## The core of the product: two runs a day

Every bus does a **morning run** (homes to school) and an **afternoon run** (school to homes, the same stops in reverse), every school day, always both. Treat this as the main idea of the app, not a feature.

- `students.stop_order` is the bus's chain in morning order; the afternoon is the chain reversed. `routes` has one row per bus **and run**; `bus_runs`, `attendance` and `absence_reports.runs` are per run.
- **Routes never change by themselves.** Adding, moving or removing a child slots them in (`optimize-route` action `update`); re-planning is a proposal an admin applies only if it is clearly better.
- Drivers start and end runs with `start_run` / `end_run` and mark students with `mark_attendance` (no direct table writes). Parents read their route only through `get_parent_route`.
- The shared run rules live in `src/lib/runs.ts` and `mobile/src/lib/runs.ts` (keep them in step) and are tested with `pnpm test:logic`.
- Full rules: [Docs/Claude.md §1.1 and §1.2](Docs/Claude.md).

## Stack

- **Web:** Next.js 14 (App Router), TypeScript strict, Tailwind, shadcn/ui, Supabase, Mapbox GL JS, Zustand, React Hook Form + Zod, pnpm, Vercel.
- **Mobile** (`mobile/`): Expo SDK 57 (React Native 0.86, new architecture), React Native styles from `mobile/src/lib/theme.ts` (read with `useTheme()` and `<Txt variant>`; `npm run check:design` guards it; NativeWind is not installed), `@rnmapbox/maps`, expo-router, expo-location, expo-notifications, EAS.

## Commands

```bash
# Web (repo root)
pnpm dev              # Next.js dev server
pnpm build
pnpm lint
pnpm typecheck        # tsc --noEmit
pnpm test:logic       # route planning, notification wording, run rules (Node's test runner)
pnpm db:reset         # rebuild the local database from migrations + seed
pnpm db:push          # push migrations to the remote Supabase project
pnpm db:types         # regenerate src/types/database.ts (the file is otherwise maintained by hand)

# Mobile (cd mobile/)
npx expo start        # dev server (add --android or --ios)
npx tsc --noEmit && npm run check:design
```

SQL checks for a migration run against the local database: see Docs/Claude.md §7.3.

## Architectural rules

1. **Multi-tenancy lives in the database.** Every table except `schools` and `user_roles` is scoped by `school_id`, and RLS policies (Docs/Claude.md §5.2) do the filtering. Never bypass RLS in application code.
2. **Two Supabase clients, never mixed.** `src/lib/supabase/server.ts` in Server Components, Server Actions and API routes; `src/lib/supabase/client.ts` in Client Components only. `SUPABASE_SERVICE_ROLE_KEY` is server-side only: it bypasses RLS.
3. **Mapbox is client-only.** Lazy-load with `next/dynamic` and `ssr: false`, use `mapbox-gl` directly (not `react-map-gl`), and clean up map instances in the `useEffect` return.
4. **Server Components by default.** Add `'use client'` only for interactivity, hooks or browser APIs.
5. **Route planning is an Edge Function, never a Next.js API route.** `supabase/functions/optimize-route` keeps each bus's order and slots changes in; re-planning is only a proposal. The logic is in `supabase/functions/_shared/`.
6. **Live tracking hot path:** the driver writes to `bus_locations`, Supabase Realtime pushes it to the parent's map. The `idx_bus_locations_bus_id` index on `(bus_id, timestamp DESC)` is critical.
7. **Every Edge Function checks its caller** (`supabase/functions/_shared/caller.ts`); the gateway only checks that a key is valid, and the anon key is public.
8. **A new `SECURITY DEFINER` function** needs its own role check, or `REVOKE ALL ... FROM PUBLIC, anon, authenticated`.

## Roles

`platform_admin` · `school_admin` · `driver` · `parent`. The post-login redirect is role-based, and access rules differ per role per table (Docs/Claude.md §5.2).

## Design system

One design for the landing page, the apps and the dashboards: Karwa / Qatar Metro aesthetic, deep blue `#1E3A8A` for things you act on, Schibsted Grotesk headings with Inter text, one navy signature card per screen, flat white cards, status as a coloured dot plus words, no uppercase labels. Tokens and components are listed in Docs/Claude.md §3.

- **Dashboards** (`/school`, `/admin`) use the app's tokens as Tailwind colours (`ink`, `ink-2`, `canvas`, `line`, `brand`, `night`, `live`, `ok` / `warn` / `bad` with `-text` and `-tint`), `font-display`, the landing page's easing (`ease-swift`, `animate-rise`) and the kit in `src/components/dashboard/`. Their map uses `src/lib/mapStyle.ts`, a copy of the app's.
- **The phone app** reads colours through `useTheme()` and follows the phone's light or dark setting. Never use raw hex in components.

## Conventions

- Absolute imports with `@/` (`src/` on the web, `mobile/src/` in the app).
- PascalCase for component files, camelCase for utilities; one component per file, named exports.
- `cn()` from shadcn for conditional classes; never edit shadcn source files.
- Always destructure `{ data, error }` from Supabase calls and handle `error`.
- Mobile route files in `mobile/src/app/` are thin: they render a screen from `mobile/src/features/<role>/screens/`.
- Work on a branch, open a pull request, merge to `main` (which deploys the website) when it is checked.

## What not to commit

`.env.local` (gitignored). Required variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_MAPBOX_TOKEN`; the app's variables are in `mobile/.env.example`.
