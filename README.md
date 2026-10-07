# RouteyAI

**Smarter school bus routes, and live bus tracking for parents.**

**Website:** [routeyai.vercel.app](https://routeyai.vercel.app)

---

## What is RouteyAI?

RouteyAI helps schools run their buses and lets parents follow the bus on their phone.

- **Schools** add their buses and students. RouteyAI works out the best route for each bus.
- **Drivers** follow that route on their phone, stop by stop.
- **Parents** watch the bus on a map in real time and know when it will reach their stop.

**Every bus does two runs every school day.** In the **morning** it picks students up at home and ends at the school. In the **afternoon** it leaves the school and drops them off at the same stops in reverse. Once a route is made it stays the same, so drivers can learn it.

No more waiting at the bus stop guessing, and no more planning routes by hand.

---

## How it helps each person

### Parents

- See your child's bus moving on a map, live
- Know how many minutes until it reaches your stop
- Get a notification when your child gets on the bus, is dropped off at home, or is marked absent
- Let the school know your child won't ride, for the morning, the afternoon or both
- Read updates from the driver and the school

### Drivers

- Start the morning or the afternoon run, and see the next stop in the right order for it
- Tap to mark each student as on board or absent, and in the afternoon as dropped off
- The phone shares the bus location while the route is running, so parents can follow along
- Send quick updates to parents, such as "running 10 minutes late"

### Schools

- Add buses, drivers and students in one place
- Let RouteyAI plan the routes, instead of drawing them by hand, and keep them steady: a new student slots in without moving anyone else
- See every bus and every run on one live map, and who has not yet been dropped off
- Send announcements to drivers and parents
- Check reports on how full each bus is and how many students ride

---

## How route planning works

1. **The school adds each student's home address.**
2. **RouteyAI groups nearby homes into stops** and shares them out between the buses, without putting more students on a bus than it has seats.
3. **It puts the stops in the shortest order**, using real driving times on real roads, not straight lines on a map.
4. **The same stops make both runs.** The morning follows the order and ends at the school; the afternoon drives it in reverse.
5. **When a new student joins**, RouteyAI adds them to the nearest bus that still has room and slots their stop into the route without moving anyone else's. Re-planning a whole route is only ever offered to the school admin as a proposal, and only when it would be clearly shorter.

---

## Privacy and safety

- **Parents only see their own child's bus.** They can't see other students or other buses.
- **Each school's information is kept separate.** One school can never see another school's data.
- **The bus location is only shared while a route is running**, not all day.
- **Anyone can delete their account** from inside the app.

Read more in the [privacy policy](https://routeyai.vercel.app/privacy).

---

## Where the project is today

| Part | Status |
|---|---|
| Website | Live |
| School dashboard (on the web) | Live: routes, students, fleet, absences and analytics |
| Phone app for parents and drivers | Working; being prepared for the App Store and Google Play |

---

## For developers

Everything below is for people who want to run or work on the code.

### What it's built with

| Part | Technology |
|---|---|
| Website and dashboards | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Database, sign-in and live updates | Supabase (PostgreSQL, Auth, Realtime, Edge Functions) |
| Maps | Mapbox (GL JS, Geocoding and Directions APIs) |
| Phone app | Expo SDK 57 (React Native 0.86), expo-router, @rnmapbox/maps |
| State and forms | Zustand, React Hook Form + Zod |
| Hosting | Vercel (website), EAS (phone app) |
| Package manager | pnpm |

### Account types

| Role | What they can do |
|---|---|
| **Platform Admin** | The RouteyAI team. Adds schools and invites each school's admin |
| **School Admin** | Manages buses, students, routes and reports for one school |
| **Driver** | Runs their assigned route, shares GPS, marks attendance |
| **Parent** | Follows their own child's bus. No access to anyone else's data |

Access rules are enforced inside the database (Postgres row-level security), not just in the app.

### Run it on your computer

You need **Node.js 18.17 or newer**, **pnpm**, a **Supabase** project and a **Mapbox** account.

```bash
# 1. Get the code
git clone https://github.com/najeeb101/RouteyAI.git
cd RouteyAI

# 2. Install packages
pnpm install

# 3. Add your keys
cp .env.example .env.local
# then open .env.local and fill in your Supabase and Mapbox keys

# 4. Start the website
pnpm dev
# open http://localhost:3000
```

The keys `.env.local` needs:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # server only, never send this to the browser
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

**Phone app:** see [mobile/README.md](mobile/README.md). In short:

```bash
cd mobile
npm install
cp .env.example .env.local   # Supabase keys and a public Mapbox pk. token
npx expo run:android         # builds the app; Expo Go can't run the Mapbox map
```

### Useful commands

```bash
pnpm dev         # start the website locally
pnpm build       # production build
pnpm lint        # check code style
pnpm typecheck   # check TypeScript types
pnpm test:logic   # route planning, notification wording and run rules
pnpm db:reset    # rebuild the local database from migrations + seed data
pnpm db:push     # apply new migrations to the live Supabase project
```

### Where the code lives

```
RouteyAI/
├── src/                     # Website (Next.js)
│   ├── app/                 # Pages: landing page, sign-in, dashboards, legal pages
│   ├── components/          # Reusable UI pieces
│   ├── lib/                 # Supabase and Mapbox setup
│   └── types/               # Database types
├── mobile/                  # Phone app for drivers and parents (Expo)
├── deck/                    # Pitch deck (HTML, open deck/index.html)
├── supabase/
│   ├── migrations/          # Database changes, in order (0001 to 0020)
│   ├── functions/           # Server functions: route planning, push notifications
│   └── seed.sql             # Sample data for local testing
└── Docs/                    # Project documentation
```

### Documentation

| File | What's in it |
|---|---|
| [Docs/README.md](Docs/README.md) | The index of all the documentation |
| [Docs/Claude.md](Docs/Claude.md) | Main technical reference: the two-runs rules, database, access rules, design system, conventions |
| [Docs/Architecture.md](Docs/Architecture.md) | Why the project uses Vercel, Supabase and Mapbox, with a diagram |
| [Docs/features.md](Docs/features.md) | Every feature, grouped by account type |
| [Docs/busflow.md](Docs/busflow.md) | How students, stops, buses and drivers connect |
| [Docs/task.md](Docs/task.md) | Progress checklist and open work |
| [Docs/CHANGELOG.md](Docs/CHANGELOG.md) | Dated notes on what was built and decided |
| [Docs/plans/](Docs/plans/) | Plans for bigger pieces of work |

---

## Design

The look is inspired by the **Karwa Journey Planner** and **Qatar Rail** apps: clean, map-first screens in deep blue and white, a palette that feels trustworthy and safe. The landing page, the phone apps (light and dark) and the dashboards share one design system, described in [Docs/Claude.md](Docs/Claude.md#3-design-system).

## License

MIT
