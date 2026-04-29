# RouteyAI - Task Tracker

Stack: Next.js 14 | TypeScript | Tailwind CSS | shadcn/ui | Supabase | Mapbox GL JS | Vercel  
Mobile: Expo (React Native) | NativeWind | Mapbox RN | EAS

---

## Current Status Snapshot (2026-04-29)

- Completed: Phases 1–7 (except push token registration on app launch).
- In progress: Phase 8 (Expo driver interface — screens exist with demo data, Supabase wiring and GPS not yet built).
- Not started: Phases 9–12.

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
- [ ] Deploy to Vercel and connect GitHub repo

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
- [x] Configure NativeWind (Tailwind for React Native)
- [x] Set up navigation stacks/routes
- [x] Set up Supabase client for React Native
- [x] Configure `@rnmapbox/maps` with Mapbox token
- [x] Configure deep linking for invite links (`/invite/[code]`)
- [x] Build shared auth screens (login)
- [x] Role-based navigation guard: driver and parent stacks
- [x] Add migration `0011_push_tokens.sql` with `push_token` in `user_roles`
- [ ] Register and save `expo-notifications` device token on app launch
- [x] EAS project setup (`eas.json`, `app.json`, link to expo.dev)

## Phase 8: Expo - Driver Interface

- [x] Driver home screen (UI only — demo data)
- [x] Passenger manifest screen (UI only — demo data, inside route screen)
- [ ] Connect driver screens to real Supabase data (replace demo data)
- [ ] Route map screen with optimized route polyline and stop markers
- [ ] Attendance writes to `attendance`
- [ ] Start Route GPS broadcasting with `expo-location`
- [ ] GPS writes to `bus_locations`
- [ ] Stop Route flow and bus status update
- [ ] Driver announcements to parents
- [ ] Realtime subscription to School Admin announcements (messages screen exists — demo data)

## Phase 9: Expo - Parent Interface

- [x] Parent home screen
- [ ] Full-screen map with live bus marker and child stop
- [ ] Realtime tracking subscription for child bus
- [ ] ETA calculation to child stop
- [ ] Bottom sheet with child/bus/ETA/attendance
- [ ] Realtime announcements feed
- [ ] Attendance confirmation state

## Phase 10: Push Notifications

- [ ] Edge function `supabase/functions/send-notification/index.ts`
- [ ] Parent notification on boarded/absent
- [ ] Driver notification on admin announcement
- [ ] Parent ETA threshold alerts
- [ ] Handle Expo push receipts and invalid token cleanup

## Phase 11: Web Polish and Production

- [x] Dark mode support (web)
- [ ] `loading.tsx` and `error.tsx` for route segments
- [ ] Toast notifications for all user actions (shadcn Sonner)
- [ ] Error boundaries and custom 404 page
- [ ] Lazy load Mapbox with `next/dynamic` and `ssr: false`
- [ ] SEO meta tags on all pages
- [ ] Performance audit (Lighthouse)
- [ ] Connect custom domain on Vercel

## Phase 12: App Store and Play Store Submission

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
