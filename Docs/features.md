# RouteyAI Features Breakdown

This document catalogs all the current and planned features for the **RouteyAI** platform. Features are organized by the specific user role or system layer they belong to. This serves as a quick-reference guide for all capabilities.

---

## 1. 🏫 School Admin Dashboard

The School Admin manages the transportation ecosystem for a single school.

### Core Features
- **Fleet Management**: Add, edit, and remove buses. Set capacity limits (default 40 seats) and assign drivers.
- **Student Roster**: Register students with their home addresses via geocoded coordinates (Mapbox API).
- **Smart Student Placement**: When a new student joins, the system automatically identifies the nearest existing bus route or cluster and assigns them to that specific route without arbitrary placement.
- **Route Management**: View AI-generated routes visually on the map, including the exact sequence of stops and estimated travel times.
- **Push Announcements**: Instantly send broad announcements to all Bus Drivers or specific routes natively from the dashboard.

### Analytics & Tracking (New)
- **Bird’s-Eye Dashboard**: Real-time stats on total students, active bus drivers, and operational buses.
- **Live Fleet Tracking**: See the exact live locations of all active buses on a single master map.
- **Cluster Visualization**: View geographic "clusters" (e.g., specific streets or grouped neighborhoods). If a new student lives near an active cluster, their assignment to the corresponding route is highlighted.

---

## 2. 🚌 Bus Driver Interface (Mobile-First)

The Driver app emphasizes turn-by-turn simplicity, ensuring any driver can hop in and drive seamlessly.

### Core Features
- **Route Execution**: Start the assigned route, which automatically begins broadcasting GPS coordinates (simulated GPS for MVP/Demo, real GPS later).
- **Turn-by-Turn Navigation**: Routes are permanently saved to the database. New or replacement drivers don't need to "learn" routes—they simply follow the exact mapping guidance on the screen.
- **Passenger Manifest & Attendance**: View the ordered list of stops and specific students. Includes a digital checklist to quickly tap and mark students as "Boarded" or "Absent" so parents and schools immediately know who got on the bus.

### Communication (New)
- **Parent Announcements**: Drivers can push quick update announcements to the parents of children assigned to their specific bus (e.g., "Bus delayed 10 minutes due to traffic", "Approaching destination").
- **Receive School Alerts**: Drivers can read announcements and updates pushed directly from the School Admin.

---

## 3. 👨‍👩‍👧 Parent / Student Tracking Portal (Mobile-First)

The Parent portal focuses entirely on real-time tracking, peace of mind, and communication.

### Core Features
- **Live Bus Tracking**: Observe the bus moving in real-time over the Mapbox GL JS map using WebSockets (Supabase Realtime).
- **ETA & Stop Highlights**: See exactly when the bus is estimated to arrive at their child's specific stop.
- **Secure Access**: Each parent only sees the route and bus associated with their own child (forced via Row Level Security).

### Communication (New)
- **Receive Driver Updates**: Instantly see announcements posted by their bus driver.

---

## 4. 🧠 Core AI & System Engine

This is the background math and logic that powers the platform.

- **K-Means Clustering**: Addresses are grouped dynamically. If two distinct neighborhoods or streets logistically cluster together, the AI merges them into a streamlined stop-zone.
- **TSP Route Optimization**: The Nearest-Neighbor heuristic (upgradeable to Google OR-Tools) ensures the route taken between clustered stops is the shortest distance possible via Mapbox Matrix API.
- **Capacity Enforcement**: The system strictly prevents a single bus route from exceeding its set capacity limit (e.g., 40 students).

---

## 5. 🏢 Platform Admin (Superadmin)

The highest tier of access, used by the RouteyAI creators/owners.

- **Multi-Tenant Management**: Create, edit, and disable entirely new schools on the SaaS platform.
- **School Admin Assignment**: Assign the initial School Admin accounts out to clients.
- **Global Analytics**: See macro numbers across all schools using the software.
