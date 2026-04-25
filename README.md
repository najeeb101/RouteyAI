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
- ✅ **Driver Utility** — Turn-by-turn navigation and digital attendance (boarded/absent) manifest
- 📱 **Mobile-First** — Driver and parent interfaces optimized for phones
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
| Deployment | Vercel |
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
│   │   ├── (auth)/               # Login, Signup pages
│   │   ├── (dashboard)/
│   │   │   ├── admin/            # Platform Admin pages
│   │   │   ├── school/           # School Admin pages
│   │   │   ├── driver/           # Driver mobile interface
│   │   │   └── parent/           # Parent tracking view
│   │   ├── api/
│   │   │   └── optimize-route/   # Route optimization API
│   │   └── page.tsx              # Landing page
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── maps/                 # Mapbox components
│   │   ├── dashboard/            # Sidebar, TopBar, StatsCard
│   │   ├── forms/                # AddStudentForm, AddBusForm
│   │   └── landing/              # Hero, Features, Pricing, Footer
│   ├── lib/
│   │   ├── supabase/             # Browser + server clients, middleware
│   │   └── mapbox/               # Mapbox config
│   ├── hooks/                    # useAuth, useRealtime, useBusLocation
│   ├── types/                    # Supabase generated types, Mapbox types
│   └── store/                    # Zustand stores
├── supabase/
│   ├── migrations/               # SQL schema migrations
│   ├── functions/
│   │   └── optimize-route/       # Edge Function (K-Means + TSP)
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
| `task.md` | Phase-by-phase task checklist |

## Design Inspiration

The UI is inspired by **Karwa Journey Planner** and **Qatar Rail** apps — clean, professional, map-centric, transport-grade interfaces with a deep blue and white palette that communicates trust and safety.

## License

MIT

---

Built with ❤️ for safer school transportation.
