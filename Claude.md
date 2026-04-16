# RouteyAI — Project System Prompt

> **Purpose of this file**: This is the single source of truth for any AI assistant (Claude, Copilot, Gemini, etc.) working on this codebase. Read this file completely before writing any code.

---

## 1. Project Overview

**RouteyAI** is an AI-powered school bus routing and parent tracking SaaS platform.
It optimizes bus routes for schools and gives parents real-time GPS tracking of their child's bus — similar in design language to **Karwa Journey Planner** and **Qatar Rail / Metro Link** apps (clean, map-centric, blue-and-white, transport-grade UI).

### Core Value Proposition
- Schools add students → AI assigns them to buses and optimizes routes automatically.
- Drivers follow optimized routes with a mobile-first interface.
- Parents track their child's bus in real time with ETA.
- Platform supports multiple schools (multi-tenant).

---

## 2. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) | SSR, API routes, file-based routing, optimized for Vercel |
| **Language** | TypeScript (strict mode) | Type safety across the entire stack |
| **Styling** | Tailwind CSS 3 | Rapid, responsive, utility-first — matches the clean transport UI aesthetic |
| **UI Components** | shadcn/ui | Accessible, composable, beautifully styled with Radix primitives |
| **Backend / DB** | Supabase (PostgreSQL + PostGIS) | Auth, RLS, Realtime subscriptions, Edge Functions, hosted Postgres |
| **Maps** | Mapbox GL JS | Custom map styles, Directions API, Geocoding API, real-time markers |
| **State Management** | Zustand (or React Context for simple cases) | Lightweight, no boilerplate |
| **Forms** | React Hook Form + Zod | Validation, type inference, performance |
| **Deployment** | Vercel | Automatic CI/CD from GitHub, edge functions, custom domains |
| **Package Manager** | pnpm | Fast, disk-efficient |

### Key API Keys (stored in `.env.local`, never committed)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
```

---

## 3. Design System

The visual identity is inspired by **Karwa** (Qatar) and **Metro Link** — premium public transport apps with a clean, calm, trustworthy aesthetic.

### 3.1 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--primary` | `#1E3A8A` (Deep Blue) | Headers, primary buttons, sidebar, trust |
| `--primary-light` | `#3B82F6` (Blue 500) | Hover states, active indicators |
| `--secondary` | `#10B981` (Emerald) | Success states, safety indicators, "on-time" |
| `--accent` | `#38BDF8` (Sky 400) | Tracking highlights, live indicators, links |
| `--warning` | `#F59E0B` (Amber) | Delayed, approaching capacity |
| `--danger` | `#EF4444` (Red 500) | Overloaded, errors, alerts |
| `--bg-primary` | `#FFFFFF` | Main background |
| `--bg-secondary` | `#F8FAFC` (Slate 50) | Card backgrounds, sidebar |
| `--bg-dark` | `#0F172A` (Slate 900) | Dark mode background |
| `--text-primary` | `#0F172A` (Slate 900) | Primary text |
| `--text-secondary` | `#64748B` (Slate 500) | Secondary text, labels |
| `--border` | `#E2E8F0` (Slate 200) | Borders, dividers |

### 3.2 Typography
- **Font Family**: `Inter` (Google Fonts) — clean, modern, excellent readability
- **Headings**: `font-bold`, sizes: `text-3xl` → `text-lg`
- **Body**: `text-sm` / `text-base`, `font-normal`
- **Monospace** (data/numbers): `font-mono`

### 3.3 Design Principles
1. **Map-Centric**: Maps are the hero element on every tracking/route screen. Full-width or full-screen wherever possible.
2. **Clean & Calm**: White space is intentional. No visual clutter. One primary action per screen.
3. **Transport-grade UI**: Think airport/metro signage — clear, bold, scannable at a glance.
4. **Mobile-first for drivers and parents**: These interfaces must work flawlessly on phones.
5. **Desktop-first for admin dashboards**: School and platform admins use full desktop layouts.
6. **Consistent feedback**: Every action shows a loading state, success toast, or error message.
7. **Subtle animations**: Smooth transitions with `transition-all duration-200`. No jarring jumps.
8. **Color-coded routes**: Each bus gets a unique color on the map for instant differentiation.

### 3.4 Component Patterns
- **Cards**: `rounded-xl shadow-sm border bg-white p-6` — elevated, soft corners
- **Buttons**: Primary = solid deep blue; Secondary = outlined; Danger = red
- **Modals**: Use for create/edit flows — avoid navigating to new pages for simple forms
- **Tables**: Striped, hoverable rows, sort/filter in headers
- **Sidebar**: Fixed left, collapsible on mobile, icons + labels
- **Top Bar**: Breadcrumbs, search (optional), notification bell, profile avatar dropdown

---

## 4. Project Structure

```
routeyai/
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── images/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth group (no layout chrome)
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/              # Protected dashboard group
│   │   │   ├── admin/                # Platform Admin pages
│   │   │   │   ├── page.tsx          # Overview
│   │   │   │   ├── schools/page.tsx
│   │   │   │   └── analytics/page.tsx
│   │   │   ├── school/               # School Admin pages
│   │   │   │   ├── page.tsx          # Overview
│   │   │   │   ├── buses/page.tsx
│   │   │   │   ├── students/page.tsx
│   │   │   │   ├── routes/page.tsx
│   │   │   │   └── analytics/page.tsx
│   │   │   ├── driver/               # Bus Driver pages
│   │   │   │   └── page.tsx
│   │   │   ├── parent/               # Parent pages
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx            # Dashboard shell (sidebar + topbar)
│   │   ├── api/                      # API routes
│   │   │   └── optimize-route/route.ts
│   │   ├── page.tsx                  # Landing page
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── maps/                     # Mapbox components
│   │   │   ├── MapView.tsx
│   │   │   ├── BusMarker.tsx
│   │   │   ├── StopMarker.tsx
│   │   │   └── RouteLayer.tsx
│   │   ├── dashboard/                # Dashboard components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   └── DataTable.tsx
│   │   ├── forms/                    # Form components
│   │   │   ├── AddStudentForm.tsx
│   │   │   ├── AddBusForm.tsx
│   │   │   └── AddSchoolForm.tsx
│   │   └── landing/                  # Landing page sections
│   │       ├── Hero.tsx
│   │       ├── Features.tsx
│   │       ├── Pricing.tsx
│   │       └── Footer.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── server.ts             # Server client
│   │   │   └── middleware.ts         # Auth middleware
│   │   ├── mapbox/
│   │   │   └── config.ts
│   │   ├── utils.ts                  # General utilities
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useRealtime.ts            # Supabase realtime subscription
│   │   ├── useBusLocation.ts
│   │   └── useRouteOptimizer.ts
│   ├── types/
│   │   ├── database.ts               # Supabase generated types
│   │   ├── mapbox.ts
│   │   └── index.ts
│   └── store/                        # Zustand stores (if needed)
│       └── useAppStore.ts
├── supabase/
│   ├── migrations/                   # SQL migrations
│   ├── functions/                    # Edge Functions
│   │   └── optimize-route/
│   │       └── index.ts
│   └── seed.sql                      # Seed data for development
├── .env.local                        # Local env vars (NOT committed)
├── .env.example                      # Template for env vars
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 5. Database Schema (Supabase / PostgreSQL)

### Tables

```sql
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Schools
CREATE TABLE schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  starting_point GEOGRAPHY(POINT, 4326) NOT NULL,  -- School location
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Roles
CREATE TABLE user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('platform_admin', 'school_admin', 'driver', 'parent')),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,  -- NULL for platform_admin
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, school_id)
);

-- Buses
CREATE TABLE buses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,                    -- e.g., "Bus #3"
  capacity INTEGER DEFAULT 40,
  driver_id UUID REFERENCES auth.users(id),
  color TEXT DEFAULT '#3B82F6',          -- Map route color
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES auth.users(id),
  home_address TEXT NOT NULL,
  home_location GEOGRAPHY(POINT, 4326) NOT NULL,  -- Geocoded coordinates
  bus_id UUID REFERENCES buses(id) ON DELETE SET NULL,
  stop_order INTEGER,                    -- Order in the route
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Routes (optimized, calculated by AI)
CREATE TABLE routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  bus_id UUID REFERENCES buses(id) ON DELETE CASCADE NOT NULL,
  waypoints JSONB NOT NULL,              -- Ordered array of {lat, lng, student_id, eta}
  total_distance_km DECIMAL,
  total_duration_min DECIMAL,
  optimized_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bus Locations (real-time tracking)
CREATE TABLE bus_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bus_id UUID REFERENCES buses(id) ON DELETE CASCADE NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  heading DECIMAL,                       -- Direction in degrees
  speed DECIMAL,                         -- km/h
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for real-time queries
CREATE INDEX idx_bus_locations_bus_id ON bus_locations(bus_id, timestamp DESC);
```

### Row Level Security (RLS) Summary
- **Platform Admin**: Full access to all tables.
- **School Admin**: CRUD on their own school's data only (filtered by `school_id`).
- **Driver**: Read-only on their assigned bus and route. Write to `bus_locations`.
- **Parent**: Read-only on their child's bus location and route. No access to other students.

---

## 6. Build Phases (Execution Order)

### Phase 1: Project Setup & Landing Page
- Initialize Next.js + TypeScript + Tailwind + shadcn/ui
- Configure Supabase client
- Build a stunning landing page (Hero, Features, Pricing, CTA, Footer)
- Responsive navigation bar with Logo, Features, Pricing, Login, Sign Up

### Phase 2: Authentication & Role System
- Supabase Auth (email/password)
- Login page, Signup page (role selection during signup)
- Auth middleware for route protection
- Post-login redirect based on role
- `user_roles` table + RLS policies

### Phase 3: Database & Schema
- Run all SQL migrations in Supabase
- Enable PostGIS extension
- Create all tables with proper foreign keys
- Set up RLS policies per role
- Generate TypeScript types from Supabase schema

### Phase 4: Platform Admin Dashboard
- Overview: total schools, buses, students (stat cards)
- Schools CRUD table
- Assign School Admins to schools
- Platform-wide analytics charts

### Phase 5: School Admin Dashboard
- Sidebar navigation (Overview, Buses, Students, Routes, Analytics)
- Bus management (table + modals for add/edit/assign driver)
- Student management (table + add form with Mapbox geocoding)
- Route visualization on Mapbox (color-coded per bus)
- Auto-assignment: suggest bus based on capacity + proximity

### Phase 6: AI Route Optimization
- Supabase Edge Function (or Next.js API route)
- Nearest-neighbor heuristic for MVP (upgradeable to OR-Tools later)
- Accepts student locations + school starting point → returns optimized route
- Recalculates on student add/remove
- Capacity alerts when bus > 40 students

### Phase 7: Bus Driver Interface
- Mobile-first layout
- Show assigned route + stops list
- "Start Route" button → simulated GPS broadcasting
- Simulated movement along route with `setInterval`
- Writes position to `bus_locations` table via Supabase

### Phase 8: Parent Tracking View
- Full-screen Mapbox map (mobile-first)
- Real-time bus position via Supabase Realtime (`bus_locations`)
- Child's stop highlighted with ETA countdown
- Route progress bar
- Bottom card: child name, bus number, ETA, status

### Phase 9: Polish & Production
- Dark mode support
- Notification system (bus arriving, delays)
- Performance optimization (lazy loading, code splitting)
- SEO meta tags on all pages
- Error boundaries and 404 page
- Vercel deployment + custom domain

---

## 7. Coding Conventions

### General
- **Language**: TypeScript everywhere. No `any` types.
- **Components**: Functional components with named exports. One component per file.
- **Naming**: PascalCase for components, camelCase for functions/variables, SCREAMING_SNAKE for constants.
- **File names**: PascalCase for components (`StatsCard.tsx`), camelCase for utilities (`utils.ts`).
- **Imports**: Absolute imports using `@/` alias (mapped to `src/`).

### React / Next.js
- Use **Server Components** by default. Add `'use client'` only when needed (interactivity, hooks, browser APIs).
- Use `loading.tsx` and `error.tsx` for each route segment.
- Data fetching in Server Components via Supabase server client.
- Client-side mutations via Server Actions or API routes.
- Use `Suspense` boundaries for streaming.

### Supabase
- Always use the **server client** in Server Components and API routes.
- Always use the **browser client** in Client Components.
- Always check for errors: `const { data, error } = await supabase.from(...)`.
- Always apply RLS — never bypass with service role key in client-facing code.

### Mapbox
- Wrap Mapbox in a Client Component (it requires `window`).
- Lazy-load the map component with `next/dynamic` and `ssr: false`.
- Use `mapbox-gl` directly (not react-map-gl) for full control.
- Clean up map instances in `useEffect` cleanup functions.

### Styling
- Use Tailwind utility classes. Avoid custom CSS unless absolutely necessary.
- Use shadcn/ui components as the base. Customize via Tailwind, not by editing shadcn source.
- Follow the color tokens defined in Section 3.1.
- Use `cn()` utility (from shadcn) for conditional classes.

### Error Handling
- Always show user-friendly error messages (toasts via shadcn `Sonner` or similar).
- Log technical errors to console in development.
- Never expose raw database errors to users.

---

## 8. Key UX Rules

1. **One primary action per screen** — don't overwhelm users.
2. **Always show feedback** — loading spinners, success toasts, error messages.
3. **Color means something** — Green = on-time/success, Amber = warning/delayed, Red = error/overloaded, Blue = info/tracking.
4. **Mobile-first for driver + parent** — large tap targets, minimal text, no clutter.
5. **Desktop-first for admin** — data-rich tables, sidebar navigation, multi-panel layouts.
6. **Maps are the hero** — full-width, loaded fast, interactive.
7. **Modals for quick actions** — add/edit forms open in modals, not new pages.
8. **Real-time feels instant** — use optimistic updates + Supabase Realtime.

---

## 9. Reference Links

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

---

## 10. Important Notes

- **Never commit `.env.local`** — it's in `.gitignore`.
- **Never use the Supabase service role key on the client** — it bypasses RLS.
- **Always test with multiple roles** — admin, school admin, driver, parent.
- **Mapbox token** must have the correct scopes (Geocoding, Directions, GL JS).
- **Simulated GPS** is for MVP only — real GPS integration comes later.
- **Route optimization** starts with nearest-neighbor heuristic — upgrade path to Google OR-Tools / OSRM is planned.
- **The UI must feel like a transport app** (Karwa/Metro Link), not a generic SaaS dashboard. Clean, blue, map-first, trustworthy.
