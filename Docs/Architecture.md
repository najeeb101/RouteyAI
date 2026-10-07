# Architecture

How RouteyAI is hosted and why. For the schema, access rules and conventions see [Claude.md](Claude.md).

## Overview

RouteyAI runs on three managed services and needs no backend server of its own:

| Service | Role |
|---|---|
| **Vercel** | Hosts the Next.js website and dashboards |
| **Supabase** | PostgreSQL + PostGIS, authentication, access rules, realtime updates and the Edge Functions that plan routes and send notifications |
| **Mapbox** | Maps, address search and road directions |

The phone app (Expo, in `mobile/`) talks to Supabase directly and is built and shipped with EAS.

```
┌─────────────────────────────────────────────────┐
│                  VERCEL (CDN)                   │
│            Next.js 14 (TypeScript)              │
│  Landing page │ Platform admin │ School admin   │
└────────────────────┬────────────────────────────┘
                     │ Server Actions          ┌─────────────────────┐
                     │                         │  EXPO APP (mobile/) │
                     │                         │  Driver │ Parent    │
                     │                         └──────────┬──────────┘
                     │                                    │ supabase-js
          ┌──────────▼────────────────────────────────────▼─┐
          │                    SUPABASE                     │
          │  PostgreSQL + PostGIS   Auth + row level security│
          │  Realtime (WebSockets): driver GPS ──► parent map│
          │  Edge Functions: route planning, push messages  │
          └──────────────────────────┬──────────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │       MAPBOX        │
                          │ Maps │ Geocoding    │
                          │ Directions          │
                          └─────────────────────┘
```

## Hosting: Vercel

- **Why:** zero-configuration GitHub integration with automatic deploys on every merge to `main`, and complete Next.js support (App Router, Server Components, Server Actions, middleware).
- **Cost:** the free tier covers development and the early launch; it scales with revenue.
- **No separate backend:** route planning runs as a Supabase Edge Function, not a server of our own, which keeps the stack lean.

## Data, auth and realtime: Supabase

- **PostgreSQL + PostGIS** holds all relational data with native geospatial support (stop locations, distances).
- **Auth** is email and password. Access is enforced by **row level security** policies in the database, so the rules hold no matter which client asks (website, app or a script).
- **Realtime** broadcasts the driver's GPS rows, run and attendance changes over WebSockets to parents' screens and the school dashboard, with no extra infrastructure.
- **Edge Functions** (Deno) are `optimize-route`, which keeps each bus's route and slots changes in (and proposes re-plans), and `send-notification`, which sends push messages through Expo. Each checks its caller itself.
- **Cost:** the free tier (500 MB database, 2 GB bandwidth, 500K function calls a month) is enough for the MVP and early launch.

## Maps: Mapbox

1. **Cost:** 50,000 map loads and 100,000 geocoding requests a month are free, which protects against surprise bills during early growth.
2. **Custom styling:** full control over the map's look; the project uses one Google Maps-like style everywhere (see Claude.md §3.5).
3. **APIs in use:**
   - **Directions:** real road lines and leg times for each run (the planner calls it per run, in batches above 24 stops).
   - **Geocoding:** turns a student's home address into a map location.
   - **GL JS** (web) and **`@rnmapbox/maps`** (app) draw the maps.
4. **Not used:** the Navigation SDK. The driver app deliberately has no map or turn-by-turn guidance, because drivers know their roads.

## Phone app: Expo

Drivers and parents use a native app built with **Expo (React Native)** and shipped with **EAS**; JavaScript-only changes can go out as over-the-air updates.

- **Driver:** starts the morning or afternoon run, sends the phone's GPS position (`expo-location`) to `bus_locations` every 10 seconds while the run is open, and records attendance through `mark_attendance`.
- **Parent:** follows the bus over Supabase Realtime, drawn with `@rnmapbox/maps`, and reads its route only through `get_parent_route`.
- **Push notifications:** device tokens live in `user_roles.push_token`; the `send-notification` function sends through the Expo push service (boarded, absent and dropped-off messages, announcements, "bus almost there" alerts).

## Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server only, never exposed to the browser
NEXT_PUBLIC_MAPBOX_TOKEN=
```

Secrets live in `.env.local`, which is never committed; `.env.example` is the template. The phone app's variables are in `mobile/.env.example`.
