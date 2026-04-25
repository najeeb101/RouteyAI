# RouteyAI Infrastructure & Architecture

## Overview

RouteyAI is an AI-powered school bus routing and student tracking platform. This document outlines the hosting infrastructure and third-party services selected to support real-time parent tracking, role-based access, and our AI routing engine.

Our architecture is split into decoupled services to ensure high availability for end-users while dedicating the necessary compute power for route optimization algorithms (K-Means clustering and TSP heuristics).

---

## Tech Stack & Hosting

### 1. Frontend: Vercel / Cloudflare Pages

The user-facing application (built with React/Vite via Lovable) handles the role-based interfaces for admins, drivers, and parents.

- **Why this platform:** Provides zero-config GitHub deployments, instant cache invalidation, and global edge networks. This ensures the heavy Mapbox visual components load instantly for users without stuttering.
- **Cost Strategy:** Generous free tiers with unlimited bandwidth (Cloudflare) keep startup overhead low.

### 2. Database & Real-Time State: Supabase

Serves as the central data store and handles real-time state synchronization.

- **Why this platform:** Supabase provides a robust PostgreSQL database natively integrated with built-in authentication for secure role-based access.
- **Real-time Tracking:** Utilizes Supabase "Realtime" (websockets) to instantly broadcast GPS coordinate updates from the driver's device directly to the parent's tracking app with zero lag.

### 3. Backend & AI Routing Engine: Railway / Render

Dedicated compute environments for running the intensive probabilistic modeling and routing algorithms.

- **Why this platform:** Unlike serverless functions that suffer from cold starts and execution time limits, Railway/Render allows for persistent background workers (Python/Node.js). This is crucial for running continuous route optimization and maintaining active websocket connections for fleet tracking.

---

## Mapping & Location Provider

RouteyAI utilizes **Mapbox** as its core mapping and routing data provider over Google Maps.

### Rationale for Mapbox:

1. **Cost-Effective Scaling:** Offers up to 50,000 monthly web loads and 25,000 active mobile users on the free tier, protecting the startup from unpredictable API bill shocks during initial growth phases.
2. **Custom Visual Branding (Mapbox Studio):** Allows for complete control over the map's UI. We can match RouteyAI's brand identity, hide distracting POIs, and cleanly highlight school zones and designated stops.
3. **Logistics-First Tooling:**
   - **Matrix API:** Crucial for feeding precise travel times and distances into our K-Means clustering and TSP solvers.
   - **Navigation SDK:** Enables in-app, turn-by-turn navigation for drivers without kicking them out to a third-party app.
4. **Offline Reliability:** Superior offline tile support ensures drivers don't lose their route guidance in areas with spotty cellular coverage.
