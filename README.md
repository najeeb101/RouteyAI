# 🚌 RouteyAI

**AI-Powered School Bus Routing and Parent Tracking SaaS Platform**

> Smart routing. Real-time tracking. Peace of mind for parents.

---

## What is RouteyAI?

RouteyAI is a multi-tenant SaaS platform that uses AI to optimize school bus routes and provides real-time GPS tracking for parents. Schools manage their fleet through an intuitive dashboard, drivers follow optimized routes on mobile, and parents watch their child's bus arrive in real time.

## Key Features

- 🧠 **AI Route Optimization** — K-Means clustering + TSP heuristic calculates the shortest, most efficient routes automatically
- 📍 **Real-Time Tracking** — Parents track their child's bus live on a Mapbox map with ETA via Supabase Realtime WebSockets
- 📢 **Announcements & Alerts** — Push communication between schools, drivers, and parents
- 🏫 **Multi-School Support** — Each school gets its own isolated dashboard and data (multi-tenant)
- 📊 **Advanced Analytics** — Fleet metrics, capacity utilization, and visual route cluster maps
- 🚍 **Fleet Management** — Add buses, assign drivers, manage capacity (default 40 seats)
- 👨‍🎓 **Student Management** — Register students, geocode addresses, auto-assign to the nearest optimal route
- ✅ **Driver Utility** — Ordered pickup list, live GPS broadcast, and digital attendance (boarded/absent)
- 🔔 **Push Notifications** — Parents are alerted on boarding, absence, and approaching ETA
- 📱 **Native Mobile App** — Expo (React Native) app for drivers and parents in `mobile/`
- 🔒 **Role-Based Access** — Platform Admin, School Admin, Driver, and Parent roles with RLS enforcement

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router), TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Backend / DB | Supabase (PostgreSQL + PostGIS + Auth + Realtime + Edge Functions) |
| Maps | Mapbox GL JS (Geocoding, Directions, Matrix APIs) |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Mobile | Expo (React Native), expo-router, @rnmapbox/maps, EAS |
| Deployment | Vercel (web), EAS (mobile) |
| Package Manager | pnpm |

## User Roles

| Role | Access |
|---|---|
| **Platform Admin** | Manages all schools on the platform, assigns School Admins |
| **School Admin** | Manages buses, students, routes, and analytics for their school |
| **Bus Driver** | Follows assigned route, broadcasts GPS, marks attendance |
| **Parent** | Tracks their child's bus in real time — no access to other students |

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- Supabase account
- Mapbox account

### Setup

```bash
# Clone the repository
git clone https://github.com/najeeb101/RouteyAI.git
cd RouteyAI

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Supabase and Mapbox keys

# Run development server
pnpm dev

# Mobile app
cd mobile && npm install && npx expo start
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # Server-side only, never expose to client
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

## Project Structure

```
routeyai/
├── src/
│   ├── app/
│   │   ├── (auth)/               # Login, Signup, invite/[code]
│   │   ├── (dashboard)/
│   │   │   ├── admin/            # Platform Admin pages
│   │   │   ├── school/           # School Admin pages
│   │   │   ├── driver/           # Web driver view
│   │   │   └── parent/           # Web parent view
│   │   ├── privacy/ · terms/     # Legal pages
│   │   └── page.tsx              # Landing page
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── maps/                 # SVG map previews
│   │   ├── dashboard/            # Sidebar, TopBar, StatsCard
│   │   └── landing/              # Landing page sections
│   ├── lib/
│   │   ├── supabase/             # Browser + server clients, middleware
│   │   └── mapbox/               # Mapbox config
│   ├── hooks/                    # useAuth
│   └── types/                    # Supabase generated types
├── mobile/                       # Expo app (drivers + parents)
├── supabase/
│   ├── migrations/               # SQL schema migrations (0001–0012)
│   ├── functions/
│   │   ├── optimize-route/       # Edge Function (K-Means + TSP)
│   │   └── send-notification/    # Edge Function (Expo push)
│   └── seed.sql                  # Dev seed data
├── .env.example
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json
```

## Documentation

All technical documentation lives in `/Docs`:

| File | Contents |
|---|---|
| `Claude.md` | Master reference for AI assistants — tech stack, schema, conventions, build phases |
| `Architecture.md` | Infrastructure decisions, Vercel + Supabase + Mapbox rationale, architecture diagram |
| `features.md` | Full feature catalog organized by user role |
| `task.md` | Phase-by-phase task checklist and current status |
| `busflow.md` | How students, clusters, buses and drivers relate |
| `plans/` | Dated implementation plans (latest: landing page launch) |

## Design Inspiration

The UI is inspired by **Karwa Journey Planner** and **Qatar Rail** apps — clean, professional, map-centric, transport-grade interfaces with a deep blue and white palette that communicates trust and safety.

## License

MIT

---

Built with ❤️ for safer school transportation.
