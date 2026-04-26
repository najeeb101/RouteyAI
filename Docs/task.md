# RouteyAI — Task Tracker

Stack: Next.js 14 · TypeScript · Tailwind CSS · shadcn/ui · Supabase · Mapbox GL JS · Vercel

---

## Phase 1: Project Setup & Landing Page
- [ ] Initialize Next.js 14 project with TypeScript and pnpm
- [ ] Configure Tailwind CSS + shadcn/ui
- [ ] Set up absolute imports (`@/` → `src/`)
- [ ] Configure `.env.local` and `.env.example`
- [ ] Initialize Supabase project (get URL + keys)
- [ ] Set up Supabase browser and server clients (`src/lib/supabase/`)
- [ ] Configure Mapbox (`src/lib/mapbox/config.ts`)
- [ ] Build landing page: Hero, Features, Pricing, CTA, Footer
- [ ] Add responsive navbar: Logo, Features, Pricing, Login, Sign Up
- [ ] Deploy to Vercel and connect GitHub repo

## Phase 2: Authentication & Role System
- [ ] Enable Supabase Auth (email/password)
- [ ] Create `user_roles` table with RLS
- [ ] Build Login page (`/login`)
- [ ] Build Signup page (`/signup`) with role selection
- [ ] Implement auth middleware (`src/lib/supabase/middleware.ts`) for route protection
- [ ] Post-login redirect based on role (`platform_admin`, `school_admin`, `driver`, `parent`)
- [ ] Build auth hooks (`useAuth.ts`)

## Phase 3: Database Schema
- [ ] Enable PostGIS extension in Supabase
- [ ] Run migrations: `schools`, `user_roles`, `buses`, `students`, `routes`, `bus_locations`, `announcements`, `attendance`
- [ ] Write and apply all RLS policies per role
- [ ] Create indexes (`idx_bus_locations_bus_id`)
- [ ] Generate TypeScript types from Supabase schema (`src/types/database.ts`)
- [ ] Add seed data for development (`supabase/seed.sql`)

## Phase 4: Platform Admin Dashboard
- [ ] Dashboard shell: Sidebar + TopBar layout (`/admin`)
- [ ] Stats cards: total schools, total buses, total students
- [ ] Schools CRUD table (create, edit, delete schools)
- [ ] Assign School Admins to schools
- [ ] Platform-wide analytics charts

## Phase 5: School Admin Dashboard
- [ ] Sidebar nav: Overview, Buses, Students, Routes, Analytics
- [ ] Bus management table + Add/Edit modals
- [ ] Assign driver to bus
- [ ] Student management table + Add Student form with Mapbox geocoding
- [ ] Smart Placement: auto-assign new student to nearest cluster/bus
- [ ] Route visualization: color-coded routes on Mapbox with stop and school markers
- [ ] Push announcements: send to all drivers or specific bus
- [ ] Analytics panel: capacity, student counts, fleet stats
- [ ] Live fleet mini-map on overview page

## Phase 6: AI Route Optimization
- [ ] Supabase Edge Function: `supabase/functions/optimize-route/index.ts`
- [ ] Implement K-Means clustering on student coordinates
- [ ] Implement Nearest-Neighbor TSP heuristic for stop ordering
- [ ] Integrate Mapbox Matrix API for real road-network distances
- [ ] Capacity check: block assignment if bus > capacity limit
- [ ] Trigger recalculation on student add/remove
- [ ] Save optimized waypoints to `routes` table

## Phase 7: Bus Driver Interface
- [ ] Mobile-first driver layout (`/driver`)
- [ ] Show assigned route on Mapbox map
- [ ] Passenger manifest: ordered stop list with student names
- [ ] Digital attendance: tap to mark Boarded / Absent (writes to `attendance` table)
- [ ] "Start Route" button — begins simulated GPS broadcasting via `setInterval`
- [ ] GPS broadcast: write to `bus_locations` table on interval
- [ ] Send announcement to parents on that bus
- [ ] Receive announcements from School Admin

## Phase 8: Parent Tracking View
- [ ] Mobile-first parent layout (`/parent`)
- [ ] Full-screen Mapbox map with live bus marker
- [ ] Supabase Realtime subscription to `bus_locations` for live updates
- [ ] Child's stop highlighted on map
- [ ] ETA countdown to child's stop
- [ ] Bottom card: child name, bus number, ETA, status
- [ ] Display driver announcements in real time
- [ ] Attendance confirmation (boarded/absent status)

## Phase 9: Polish & Production
- [ ] Dark mode support
- [ ] Notification system: bus arriving, delays
- [ ] `loading.tsx` and `error.tsx` for all route segments
- [ ] Toast notifications for all user actions (shadcn Sonner)
- [ ] Error boundaries and custom 404 page
- [ ] Lazy load Mapbox with `next/dynamic` and `ssr: false`
- [ ] SEO meta tags on all pages
- [ ] Performance audit (Lighthouse)
- [ ] Connect custom domain on Vercel
