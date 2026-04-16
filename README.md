# 🚌 RouteyAI

**AI-Powered School Bus Routing and Parent Tracking SaaS Platform**

> Smart routing. Real-time tracking. Peace of mind for parents.

---

## What is RouteyAI?

RouteyAI is a SaaS platform that uses AI to optimize school bus routes and provides real-time GPS tracking for parents. Schools manage their fleet through an intuitive dashboard, drivers follow optimized routes on mobile, and parents watch their child's bus arrive in real time.

## Key Features

- 🧠 **AI Route Optimization** — Automatically calculate the shortest, most efficient bus routes
- 📍 **Real-Time Tracking** — Parents track their child's bus live on a map with ETA
- 🏫 **Multi-School Support** — Each school gets its own dashboard and management tools
- 🚍 **Fleet Management** — Add buses, assign drivers, manage capacity
- 👨‍🎓 **Student Management** — Register students, geocode addresses, auto-assign to buses
- 📱 **Mobile-First** — Driver and parent interfaces optimized for phones
- 🔒 **Role-Based Access** — Platform Admin, School Admin, Driver, and Parent roles

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+ (App Router), TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Supabase (PostgreSQL + PostGIS + Auth + Realtime) |
| Maps | Mapbox GL JS |
| Deployment | Vercel |

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- Supabase account
- Mapbox account

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/RouteyAI.git
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
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

## User Roles

| Role | Access |
|---|---|
| **Platform Admin** | Manages all schools, creates school admin accounts |
| **School Admin** | Manages buses, students, routes for their school |
| **Bus Driver** | Views assigned route, broadcasts GPS location |
| **Parent** | Tracks their child's bus in real time |

## Project Structure

```
src/
├── app/           # Next.js App Router pages
├── components/    # Reusable UI components
├── lib/           # Supabase clients, utilities
├── hooks/         # Custom React hooks
├── types/         # TypeScript type definitions
└── store/         # State management
```

## Design Inspiration

The UI is inspired by **Karwa Journey Planner** and **Qatar Rail** apps — clean, professional, map-centric, transport-grade interfaces with a blue and white color palette that communicates trust and safety.

## License

MIT

---

Built with ❤️ for safer school transportation.
