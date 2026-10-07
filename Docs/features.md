# RouteyAI — Feature Catalog

Features organized by user role. For build order, see `Claude.md` Section 6 (Build Phases).

## 🔁 Two runs a day (the core of every role)

Every bus does a **morning run** (homes to school) and an **afternoon run** (school to homes, the same stops in reverse), every school day. Routes never change by themselves: new children slot in, and re-planning is a proposal the school admin applies only if it is clearly better. Rules: [Claude.md §1.1](Claude.md); plan: [plans/two-runs-a-day.md](plans/two-runs-a-day.md).

| Role | What changes with two runs |
|---|---|
| School admin | Morning / Afternoon route per bus, run status per bus, children not yet dropped off flagged, Update / Re-plan / Re-plan all, absences show which rides |
| Driver | Starts the morning or the afternoon run; morning pickups, afternoon boarding at school and drop-offs in reverse order |
| Parent | A card for every moment of the day, drop-off notification, absences for the morning, the afternoon or both |

---

## 🏢 Platform Admin (Superadmin)

The highest access tier — used by RouteyAI owners to manage the SaaS.

| Feature | Description |
|---|---|
| Multi-Tenant School Management | Create, edit, and disable schools on the platform |
| School Admin Assignment | Invite and assign admin accounts to schools |
| Global Analytics | Macro stats across all schools (total buses, students, active routes) |
| Demo Requests | Leads submitted from the landing page "Book a demo" form (`demo_requests`) |

---

## 🏫 School Admin Dashboard

Manages the full transportation ecosystem for a single school.

### Fleet & Students
| Feature | Description |
|---|---|
| Bus Management | Add/edit/remove buses, set capacity (default 40), assign drivers |
| Student Roster | Register students with geocoded home addresses via Mapbox |
| Smart Placement | Auto-assign new students to the nearest existing route cluster |
| Push Announcements | Send alerts to all drivers or a specific bus |

### Visibility & Analytics
| Feature | Description |
|---|---|
| Live Fleet Map | See exact real-time positions of all active buses on one map |
| Route Visualization | Color-coded routes per bus with stop markers and school pin |
| Cluster View | Geographic groupings showing which students share route segments |
| Analytics Panel | Capacity utilization, student counts, active bus stats |

---

## 🚌 Bus Driver Interface (Mobile-First)

Designed for one-handed use on a phone while managing a route.

| Feature | Description |
|---|---|
| Next Stop Card | Shows the next student's name and address in route order (pickups in the morning, drop-offs in reverse in the afternoon); advances as students are marked |
| Two Runs a Day | The driver starts the morning run (homes to school) or the afternoon run (school to homes); ending the afternoon with a child still on board asks first |
| Start Route / GPS Broadcast | Sends the phone's real GPS position (`expo-location`) every 10 seconds while the route is active |
| Passenger Manifest | Ordered stop list with student names per stop |
| Digital Attendance | Tap to mark each student as Boarded or Absent, and in the afternoon Dropped off |
| Send Parent Announcements | Push quick updates to parents on that specific bus |
| Receive School Alerts | Read announcements from the School Admin |

---

## 👨‍👩‍👧 Parent Tracking Portal (Mobile-First)

Focused entirely on peace of mind. Zero admin UI.

| Feature | Description |
|---|---|
| Live Bus Tracking | Real-time bus position on Mapbox via Supabase Realtime WebSockets |
| ETA Countdown | Estimated arrival time at their child's specific stop |
| Stop Highlight | Child's stop is visually highlighted on the map |
| Driver Announcements | See real-time updates pushed by the bus driver |
| Attendance Confirmation | Know instantly when their child boarded the bus |
| Push Notifications | Alerts when their child boards or is marked absent, and when the bus is close |
| Secure Isolation | RLS enforces parents can only see their own child's bus — nothing else |

---

## 🧠 AI Routing Engine

The background logic that powers route assignment and optimization.

| Feature | Algorithm | Details |
|---|---|---|
| Geographic Clustering | K-Means | Groups student addresses into logical stop zones per bus |
| Route Ordering | Nearest-Neighbor TSP Heuristic | Orders clustered stops for shortest travel distance |
| Distance Calculation | Mapbox Matrix API | Uses real road network times, not straight-line distances |
| Smart Placement | Nearest Cluster Assignment | New students auto-assigned to closest viable bus without exceeding capacity |
| Capacity Enforcement | Hard limit | Blocks assignment if bus exceeds set capacity (default 40) |
| Stable Routes | Admin-triggered | Adding, moving or removing a student never re-plans a route; the student shows "Not on route" until the admin recalculates that bus |
| Upgrade Path | Google OR-Tools / OSRM | Planned for v2 when scale demands higher optimization quality |

---

## 🌐 Marketing Site (Landing Page)

Public page at `/`. Plan: `plans/landing-page-launch.md`.

| Feature | Description |
|---|---|
| Product overview | Hero, how it works, admin dashboard and mobile app showcases, features, safety & privacy |
| Pricing | Plans by fleet size with "Contact us" |
| Book a demo | Form saved to `demo_requests` (anyone can submit; only platform admins can read) |
| Legal | `/privacy` and `/terms` pages (also linked from app store listings) |
