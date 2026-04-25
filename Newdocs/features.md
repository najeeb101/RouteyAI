# RouteyAI — Feature Catalog

Features organized by user role. For build order, see `Claude.md` Section 6 (Build Phases).

---

## 🏢 Platform Admin (Superadmin)

The highest access tier — used by RouteyAI owners to manage the SaaS.

| Feature | Description |
|---|---|
| Multi-Tenant School Management | Create, edit, and disable schools on the platform |
| School Admin Assignment | Invite and assign admin accounts to schools |
| Global Analytics | Macro stats across all schools (total buses, students, active routes) |

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
| Turn-by-Turn Route | Follow the AI-optimized route saved in DB — no memorization needed |
| Start Route / GPS Broadcast | Triggers simulated GPS broadcasting along waypoints (real GPS in v2) |
| Passenger Manifest | Ordered stop list with student names per stop |
| Digital Attendance | Tap to mark each student as Boarded or Absent |
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
| Dynamic Recalculation | Trigger-based | Route recalculates automatically on student add/remove |
| Upgrade Path | Google OR-Tools / OSRM | Planned for v2 when scale demands higher optimization quality |
