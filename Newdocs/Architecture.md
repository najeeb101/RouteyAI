# RouteyAI Infrastructure & Architecture

## Overview

RouteyAI is an AI-powered school bus routing and student tracking platform. This document outlines the hosting infrastructure and third-party services selected to support real-time parent tracking, role-based access, and the AI routing engine.

The architecture is built on three tightly integrated services that handle all platform needs without requiring a separate backend server.

---

## Hosting & Deployment: Vercel

The Next.js application is deployed on **Vercel** — the platform built by the same team behind Next.js.

- **Why Vercel:** Zero-config GitHub integration with automatic CI/CD on every push. Perfect Next.js compatibility (App Router, Server Components, Server Actions, Edge Middleware all work out of the box).
- **Cost:** Free tier covers the entire development and early launch phase. Scales with revenue.
- **Edge Functions:** Vercel's edge network handles API routes and middleware with no cold start issues for typical SaaS workloads.

> The AI route optimization runs as a **Supabase Edge Function** — not a separate backend server — keeping the stack lean and cost-free.

---

## Database, Auth & Real-Time: Supabase

Supabase serves as the central data store, authentication provider, and real-time engine.

- **PostgreSQL + PostGIS:** Handles all relational data with native geospatial support for distance calculations and location queries.
- **Supabase Auth:** Email/password authentication with role-based access enforced via Row Level Security (RLS) policies directly in the database.
- **Supabase Realtime:** WebSocket subscriptions broadcast GPS coordinate updates from the driver's device directly to the parent's tracking screen with zero additional infrastructure.
- **Edge Functions:** Deno-based serverless functions run the K-Means clustering and TSP route optimization logic on demand.
- **Cost:** Free tier includes 500MB database, 2GB bandwidth, and 500K Edge Function invocations per month — sufficient for MVP and early launch.

---

## Maps & Location: Mapbox

RouteyAI uses **Mapbox** as its core mapping and routing provider.

### Why Mapbox over Google Maps

1. **Cost-Effective Free Tier:** 50,000 monthly map loads and 100,000 geocoding requests free — protects against unpredictable API bills during early growth.
2. **Custom Map Styling (Mapbox Studio):** Full control over the map's visual identity. Routes, school zones, and bus stops can be styled to match RouteyAI's brand without distracting POIs.
3. **Logistics-First APIs:**
   - **Matrix API:** Feeds precise travel times and distances into the K-Means + TSP solvers for accurate route optimization.
   - **Directions API:** Renders real road-network route lines on the map (not straight lines).
   - **Navigation SDK:** Enables in-app turn-by-turn guidance for drivers without redirecting to an external app.
4. **Offline Tile Support:** Drivers retain route guidance in areas with poor cellular coverage.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                   VERCEL (CDN)                  │
│          Next.js 14 App (TypeScript)            │
│   Admin Dashboard │ Driver View │ Parent View   │
└────────────────────┬────────────────────────────┘
                     │ API Routes / Server Actions
          ┌──────────▼──────────┐
          │      SUPABASE        │
          │  ┌───────────────┐   │
          │  │  PostgreSQL   │   │
          │  │  + PostGIS    │   │
          │  └───────────────┘   │
          │  ┌───────────────┐   │
          │  │  Auth + RLS   │   │
          │  └───────────────┘   │
          │  ┌───────────────┐   │
          │  │   Realtime    │◄──┼── Driver GPS broadcast
          │  │  WebSockets   │───┼──► Parent live tracking
          │  └───────────────┘   │
          │  ┌───────────────┐   │
          │  │ Edge Functions│   │ ◄── Route optimization
          │  └───────────────┘   │
          └─────────────────────┘
                     │
          ┌──────────▼──────────┐
          │       MAPBOX         │
          │  Maps │ Geocoding    │
          │  Directions │ Matrix │
          └─────────────────────┘
```

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Server-side only, never exposed to client
NEXT_PUBLIC_MAPBOX_TOKEN=
```

All secrets stored in `.env.local` (never committed). See `.env.example` for the template.
