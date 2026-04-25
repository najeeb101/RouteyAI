# RouteyAI: AI-Powered School Bus Routing and Tracking Platform

## Overview

Build a full SaaS platform with a landing page, authentication, and role-based dashboards for school bus route optimization and parent tracking, using Mapbox for maps and Supabase for backend services.

## Phase 1: Landing Page and Branding

- Marketing landing page with hero section, feature highlights (AI routing, real-time tracking, school management), pricing tiers, and CTA.
- Branding: Clean, modern design with a transportation and safety theme using blues and greens.
- Navigation: Logo, Features, Pricing, Login, and Sign Up buttons.

## Phase 2: Authentication and Role System

- Supabase Auth with email/password signup and login.
- Four user roles stored in a `user_roles` table:
	- Platform Admin: Manages all schools on the platform.
	- School Admin: Manages buses, students, and routes for their school.
	- Bus Driver: Assigned to buses and shares GPS location.
	- Parent: Tracks their child's bus in real time.
- Role-based route protection and post-login redirects.
- Onboarding flow: Platform Admin creates schools, School Admins are invited, Parents receive tracking links.

## Phase 3: Database Schema

- `schools`: name, address, starting point coordinates, `created_by`.
- `buses`: `school_id`, name/number, capacity (default 40), assigned driver.
- `students`: `school_id`, name, `parent_id`, home address, coordinates, assigned bus.
- `routes`: `school_id`, `bus_id`, waypoints (ordered stops), estimated times.
- `bus_locations`: `bus_id`, latitude/longitude, timestamp (for simulated tracking).
- Full RLS policies per role.

## Phase 4: Platform Admin Dashboard

- Overview of all schools, total buses, and total students.
- Create, edit, and delete schools.
- Assign School Admins to schools.
- Platform-wide analytics.

## Phase 5: School Admin Dashboard

- Sidebar navigation: Overview, Buses, Students, Routes, Analytics.
- Bus management: Add/edit buses, set capacity, assign drivers.
- Student management: Add students with home address (geocoded via Mapbox).
- Smart Placement: Automatically assign new students to the nearest geographical route cluster.
- Route visualization: Color-coded active routes, clusters, and stop markers on Mapbox.
- Communications: Push out announcements to drivers natively.
- Analytics Panel: Macro metrics of active buses, student counts, and vehicle load.

## Phase 6: AI Route Optimization (Edge Function)

- Edge function takes student locations and calculates geospatial clusters.
- Uses routing algorithms to order the clustered stops logically.
- Recalculates dynamically when new students are placed.
- Formulates the persistent route for drivers to simply follow turn-by-turn.

## Phase 7: Bus Driver View

- Mobile-friendly page showing the exact navigational path dictated by the DB.
- Digital Attendance: Tap to mark a student as Boarded or Absent.
- Push Announcements: Send rapid updates to parents on that bus string.
- "Start Route" button begins simulated GPS broadcasting along the path.

## Phase 8: Parent Tracking View

- Clean mobile-first interface with a Mapbox map.
- Real-time bus position via Supabase Realtime subscription to `bus_locations`.
- Child's stop highlighted with ETA.
- Bus route line displayed on map.
- Access through secure link (MVP: optional no-login access, or parent login).

## Phase 9: Mapbox Integration

- Mapbox GL JS for all map views.
- Geocoding API for address-to-coordinate conversion.
- Directions API for route line rendering.
- Custom markers for bus stops, school, and live bus position.

## Technical Notes

- Mapbox API key stored as a secret.
- Simulated GPS uses `setInterval` to move bus along route waypoints.
- Supabase Realtime channels for live bus position updates.
- Responsive design: desktop for admin dashboards, mobile-optimized for driver and parent views.