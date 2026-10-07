# Feature Catalog

What RouteyAI does, grouped by who uses it. Build status is in [task.md](task.md); how it works is in [Claude.md](Claude.md).

## Two runs a day

The core of every role. Every bus does a **morning run** (homes to school) and an **afternoon run** (school to homes, the same stops in reverse), every school day. Routes never change by themselves: new children slot in, and re-planning is a proposal the school admin applies only if it is clearly better. Rules: [Claude.md §1.1](Claude.md#11-two-runs-a-day-the-core-rule); plan: [plans/two-runs-a-day.md](plans/two-runs-a-day.md).

| Role | What changes with two runs |
|---|---|
| School admin | A Morning and an Afternoon route per bus, run status per bus, children not yet dropped off flagged, Update / Re-plan / Re-plan all, absences show which rides they cover |
| Driver | Starts the morning or the afternoon run; morning pickups, afternoon boarding at school and drop-offs in reverse order |
| Parent | A card for every moment of the day, a drop-off notification, absences for the morning, the afternoon or both |

---

## Platform admin

Used by the RouteyAI team to manage the service.

| Feature | Description |
|---|---|
| School management | Create, edit and delete schools |
| School admin invites | Create a one-time invite link that makes the invitee that school's admin |
| Platform analytics | Schools, buses, students and seats taken across all schools |
| Demo requests | Leads from the landing page's "Book a demo" form |

---

## School admin dashboard

Manages the transport for one school (web, desktop-first).

| Area | Feature | Description |
|---|---|---|
| Overview | Today | Runs, check-ins and who has not been dropped off (flagged in red), updating live |
| Overview | Live fleet map | Every bus on one map, with its route and position |
| Routes | Morning and Afternoon | A map and the stops in driving order for each bus and run |
| Routes | Update | Slots changes into a route without moving anyone else |
| Routes | Re-plan, Re-plan all | A proposal you apply or keep; it only offers a change when it is clearly shorter |
| Students | Roster | Add, edit, change bus, invite a parent, remove; home addresses are geocoded with Mapbox |
| Students | Smart Placement | A new student goes to the nearest bus with free seats and their stop slots into its route |
| Fleet | Buses and drivers | Add, edit and remove buses, set capacity, assign and invite drivers, see each bus's run today |
| Absences | Parent reports | Today, coming up and the last 30 days, with the rides each report covers |
| Analytics | Real figures | Rides per school day, run times and seats taken over the last 28 days |
| Announcements | Messages | Send to one bus or the whole school |

---

## Driver app

Designed for one-handed use on a phone.

| Feature | Description |
|---|---|
| Run picker | Start the morning run, or the afternoon run from 11:00 |
| Next stop card | The next student's name and address in the run's order; advances as students are marked |
| Passenger manifest | The ordered stop list with each student |
| Digital attendance | Morning: Boarded or Absent. Afternoon: Boarded at school, then Dropped off at each stop |
| Safety check | Ending the afternoon with a child still on board asks first |
| GPS broadcast | Sends the phone's real position (`expo-location`) every 10 seconds while a run is open, including with the screen locked |
| Messages | Updates to the parents on the bus, a running-late notice in one tap, the school's announcements |
| Absent students | Children whose parents reported them absent count as done at their stop |
| Summary | A recap of who rode when a run ends |

---

## Parent app

Focused on peace of mind, with no admin screens.

| Feature | Description |
|---|---|
| Live tracking | The bus on a map in real time (Supabase Realtime), with the child's own stop highlighted |
| Arrival time | A countdown to the child's stop, and in the morning to school |
| Day card | One card for the moment of the day: waiting, on the bus, at school, dropped off or absent |
| Notifications | When the child boards, is dropped off or is marked absent, and when the bus is about 5 minutes away |
| Absence reports | Report an absence for the morning, the afternoon or both, and cancel it; the driver sees it |
| History | The last 30 days, per run |
| Several children | Every child on one account, with a switcher |
| Privacy | Parents only ever see their own child's bus, and never the stops of other children |

---

## Route planning

The logic behind assigning children to buses and ordering stops (Edge Function `optimize-route`, pure functions in `supabase/functions/_shared/`).

| Feature | How |
|---|---|
| Geographic clustering | K-means groups student addresses into one cluster per bus |
| Stop order | A nearest-neighbour heuristic over real road travel times from the Mapbox Directions API |
| Both runs | The same chain is the morning order, and reversed it is the afternoon order |
| Capacity | A bus is never given more students than seats (default 40) |
| Smart Placement | A new student goes to the nearest bus with free seats |
| Slot-in updates | Adding, moving or removing a student changes only their own stop; every other stop keeps its place |
| Proposals | A full re-plan is shown to the school admin and applied only if it is clearly better and nothing changed meanwhile |
| Upgrade path | Google OR-Tools or OSRM, if scale needs better solutions |

---

## Landing page

Public page at `/`. Plan: [plans/landing-page-launch.md](plans/landing-page-launch.md).

| Feature | Description |
|---|---|
| Product overview | Hero, how it works, dashboard and app showcases, features, safety and privacy |
| Pricing | Plans by fleet size, with "Contact us" |
| Book a demo | A form saved to `demo_requests` (anyone can submit; only platform admins can read) |
| Legal | `/privacy` and `/terms`, also linked from the store listings |
