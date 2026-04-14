# RouteyAI UI/UX Methodology

This document provides a practical UI/UX blueprint for RouteyAI, focused on clear user flows, role-based dashboards, and mobile-first tracking experiences.

## 1. Design System (Foundation)

Before building screens, define the design system.

### Style Direction

- Theme: Safety + Transportation + Trust
- Feel: Clean, calm, modern (not flashy)

### Colors

- Primary: Deep Blue (`#1E3A8A`) for trust
- Secondary: Green (`#10B981`) for safety
- Accent: Light Blue (`#38BDF8`) for tracking

### Typography

- Headings: Bold and simple (Inter or Poppins)
- Body: Clean and readable

## 2. Platform Structure (UX Flow)

Design separate experiences for four user roles.

### Main Flow

1. Landing page
2. Login or signup
3. Redirect based on role
4. Role-specific dashboard

## 3. Dashboard Layout (Admin Consistency)

Use a consistent shell for admin-facing screens.

### Layout Structure

```text
[ Sidebar ] | [ Top Bar ]
                        |
                        |  Content Area
```

### Sidebar (Left)

- Logo (RouteyAI)
- Overview
- Buses
- Students
- Routes
- Analytics
- Settings

### Top Bar

- Search (optional)
- Notifications
- Profile dropdown

Keep the dashboard simple and avoid overcrowding.

## 4. School Admin Dashboard (Main UI)

### Overview Page

Components:

- Stats cards:
    - Total students
    - Active buses
    - Routes today
- Mini map (live buses)
- Alerts (example: "Bus #3 overloaded")

### Bus Management

UI includes:

- Table columns:
    - Bus name
    - Driver
    - Capacity
- Actions:
    - Edit
    - Assign driver

Use modal popups for edit and assign flows instead of new pages.

### Student Management

UI includes an Add Student form with:

- Name
- Address
- Map picker (Mapbox)

UX tip: Autofill coordinates after address input.

### Route Visualization (Core Feature)

UI includes:

- Full-width map
- Colored routes per bus
- Markers:
    - School
    - Stops
    - Live bus position

This should be the most visually impactful screen.

## 5. Bus Driver Interface (Mobile)

### Driver View

UI includes:

- Large "Start Route" button
- Map with active route
- Next stop card with:
    - Student name
    - ETA

Design principles:

- Large tappable controls
- Minimal text
- No visual clutter

## 6. Parent Tracking Screen (Critical UX)

### Parent View

UI includes:

- Full-screen live map
- Moving bus indicator
- Bottom info card:
    - Child name
    - ETA
    - Status (example: "Arriving")

Add a route progress bar to improve predictability.

## 7. Landing Page

### Marketing UI Sections

- Hero: "Smart School Bus Routing and Tracking"
- CTA: Get Started
- Features:
    - AI routing
    - Live tracking
    - School dashboard
- Pricing
- Footer

## 8. UX Rules to Enforce

- Keep it simple: one main action per screen.
- Always show feedback:
    - Loading state
    - Success message
    - Error message
- Use color meaningfully:
    - Green = success
    - Red = issue
    - Blue = informational
- Use a mobile-first approach for driver and parent interfaces.

## 9. Recommended Design Tools

- Figma (recommended)
- Framer
- Adobe XD

## 10. Execution Plan

Do not design everything at once.

1. Start with dashboard and map screen.
2. Build driver UI and parent UI.
3. Polish and refine interaction details.