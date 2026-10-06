# Two runs a day: morning pickup and afternoon drop-off

Status: plan, waiting for approval (2026-10-06). Builds on the mobile UI refresh (branch `mobile-ui-refresh`).

## The rule

Every bus does exactly two runs every school day, always both:

- **Morning run:** homes → school. The driver picks students up stop by stop and ends at the school.
- **Afternoon run:** school → homes. Every student boards at the school, and the driver drops them off in the
  **reverse order** of the morning: the last morning stop is the first afternoon stop.

There is no setting for this and nothing for the driver to choose. A bus with a route has both runs.

## What the code does today

The whole system assumes one run a day:

1. **Check-ins:** `attendance` allows one record per student per day (`UNIQUE(student_id, date)`), and the Route
   screen replaces that record when the driver taps. An afternoon tap would overwrite the morning's.
2. **Driver screen:** says "Morning run" everywhere. After the morning, every stop already shows as done.
3. **Parent screen and notifications:** only "boarded" and "absent". The arrival time only counts while waiting for a
   pickup, never on the way home.
4. **Absence reports:** one per child per day, always the whole day.
5. **The morning order is backwards.** `optimize-route` builds the stop list starting at the school and moving
   outwards (nearest stop first). The driver app follows that list, so the morning run starts next to the school, ends
   at the stop farthest away, and then drives all the way back with every child on board. The route line and the
   arrival times also leave out that drive back to school. That order is the right one for the afternoon
   (leaving school), so the fix and the new afternoon run come from the same change.

## Routing

The optimizer keeps building **one stop sequence per bus**, as it does now (nearest stop to the school first, then the
nearest unvisited stop each time). That sequence is used in both directions:

| | Order | Map line drawn | Arrival times count from |
|---|---|---|---|
| Afternoon | School → nearest stop → … → farthest stop | School + stops in that order | Leaving school |
| Morning | Farthest stop → … → nearest stop → School | Stops in reverse order + school at the end | The first pickup |

- **Two map lines, not one line reversed.** The optimizer asks Mapbox Directions once per direction (two requests per
  bus). Doha has one-way streets and divided roads, so the road path back is not the road path out drawn backwards.
- **Better arrival times.** Each stop's minutes come from Mapbox's own times between stops (`legs[].duration`) instead
  of the current straight-line estimate at 30 km/h. The straight-line estimate stays as the fallback when Mapbox
  can't be reached or a bus has more than 24 stops (Mapbox's limit with the school included).
- **Stop numbers follow the run.** In the morning Stop 1 is the first pickup; in the afternoon Stop 1 is the first
  drop-off (the morning's last). `students.stop_order` keeps the morning order; the afternoon is worked out by
  reversing it, so the two can never disagree.
- **Where the bus starts in the morning** (depot, driver's home) is not known, so the morning route starts at the first
  pickup, as today.
- **Existing routes:** after the update, each bus is re-optimized once so it gets both runs in the right direction (one
  call to `optimize-route` for every bus; school admins can also press Re-optimize on the Routes page).

## Database (one migration, `0017_two_runs.sql`)

No app is in the stores yet, so the database can change without keeping old app versions working. The web pages that
read these tables are updated in the same change.

**New table `bus_runs`** (which run a bus is on, and when it started and ended)

```sql
CREATE TABLE bus_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  date DATE NOT NULL,                                   -- Qatar date
  run TEXT NOT NULL CHECK (run IN ('morning', 'afternoon')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  UNIQUE (bus_id, date, run)
);
```

- Today the only sign that a bus is on the road is `buses.is_active` plus a recent GPS point, which can't say which run
  it is. Parents need to know the run to show the right status, the right line on the map and the right arrival time;
  the school dashboard and history use it too.
- Drivers never write the table directly. `start_run(p_run)` and `end_run()` (SECURITY DEFINER, own bus only) replace
  `set_bus_active` and still keep `buses.is_active` in step, because the school dashboard reads it. Starting the
  afternoon run ends a morning run that was left open. The date is set in the database in Qatar time.
- Read access: the driver for their bus, parents for their children's buses, school admins for their school, platform
  admins for everything. Added to the realtime publication so the parent app sees a run start and end.

**`attendance`** (one record per student, per day, per run)

- New `run` column (`'morning'` for existing rows); the unique rule becomes `(student_id, date, run)`.
- New status `dropped_off` and a `dropped_off_at` time. A record goes `boarded` → `dropped_off`; `created_at` stays the
  boarding time, so history can show both times.
  - Afternoon: the driver taps **Drop off** at each stop.
  - Morning: ending the run marks everyone still on board as `dropped_off`, meaning "arrived at school" (see the
    decisions below).
- Undoing a mistaken drop-off puts the record back to `boarded` without sending parents a second "boarded" alert.

**`absence_reports`**

- New `runs` column: `'both'` (default, and every existing report), `'morning'` or `'afternoon'`. Lets a parent say
  "only the afternoon" when they collect their child from school themselves. Still one report per child per day.

**`routes`**

- New `run` column; the unique rule becomes `(bus_id, run)`, so each bus has a morning row and an afternoon row, each
  with its own stops, map line, distance and duration.
- `save_optimized_route` gets a `p_run` argument. Because that is a new function signature, the migration repeats
  0016's lock (`REVOKE ALL … FROM PUBLIC, anon, authenticated`, `GRANT EXECUTE … TO service_role`).

**Notification trigger**: sends the run and the previous status to `send-notification`, so the message can say
"on the bus home" or "dropped off" and skip undo taps.

`src/types/database.ts`, Docs/Claude.md §5 and CLAUDE.md are updated with the new columns, table and functions.

## Driver app

- **The app picks the run itself.** It shows the morning run until the morning run is ended, then the afternoon run.
  If the morning run never happened (forgotten, substitute driver), it switches to the afternoon at 11:00.
- **Home:** "Morning run · 5 stops · 6 students" or "Afternoon run · …", "Ready for the afternoon run?", and a stop line
  that runs in that run's direction.
- **Afternoon Route screen:**
  - A first section, **At school**, lists every student on the bus with Board and Absent (the same buttons as the
    morning).
  - The stops follow in reverse order, each student with one **Drop off** button (tap again to undo).
  - Students who didn't board at school, or whose parent reported the afternoon, show as "Not on the bus" and count
    as done.
- **Ending the afternoon run is a safety check:** if anyone boarded but was never dropped off, the driver sees their
  names ("Lina is still marked on the bus") with "Go to Route" or "End anyway". "End anyway" keeps them flagged in
  the trip summary and on the school dashboard; it never tells parents their child was dropped off.
- **Trip summary** per run. GPS works as today; the saved running trip also remembers which run it is.

## Parent app

The arrival card follows the child through the day:

| Moment | Card says | Arrival time |
|---|---|---|
| Morning, bus coming | "6 min", 2 stops before yours | To your stop |
| Morning, picked up | "On the bus", boarded at 6:52 | To school |
| Morning run ended | "At school", arrived at 7:25 | — |
| Afternoon, boarded at school | "On the way home", 3 stops before yours | To your stop |
| Afternoon, dropped off | "Home", dropped off at 2:05 | — |
| Absent or reported | As today, for that run | — |

- The map shows the line of the run in progress, in its direction, and counts "stops before yours" the same way.
- **Past rides:** each day shows both rides ("Morning: boarded 6:52 · at school 7:25", "Afternoon: boarded 1:35 ·
  home 2:05").
- **Report an absence:** a "Which rides?" choice (Both · Morning · Afternoon), set to Both.

## Notifications

| When | Title | Body |
|---|---|---|
| Morning, bus ~5 min away | Bus arriving in ~5 minutes | Get Lina ready - the bus is almost at your stop. (unchanged) |
| Morning, boarded | Lina has boarded | Lina is on the bus and on the way to school. (unchanged) |
| Morning run ended | Lina arrived at school | The bus reached the school at 7:25. |
| Morning, absent | Lina marked absent | Lina was not on the bus this morning. ("today" now would be ambiguous) |
| Afternoon, boarded at school | Lina is on the bus home | The bus left school at 1:35. |
| Afternoon, absent at school | Lina isn't on the bus home | The driver marked Lina absent at school. Contact the school if you didn't expect this. |
| Afternoon, bus ~5 min from home | Lina is almost home | The bus is about 5 minutes from your stop. |
| Afternoon, dropped off | Lina was dropped off | Lina got off at Al Waab, Doha at 2:05. |

## School dashboard (web)

- Bus status shows the run ("On the morning run", "On the afternoon run", "Finished for today").
- Routes page: a Morning / Afternoon switch for each bus's map line and stop order.
- Absences page: shows which rides each report covers.
- The older web driver and parent pages (`src/app/(dashboard)/driver`, `parent`) follow the same rules, since they
  read the same tables.

## Order of work and testing

1. Migration 0017, checked on the local database (`pnpm db:reset`) with the seed data, plus RLS checks for each role.
   You run `supabase db push` for production, as with 0016.
2. `optimize-route` (both directions, Mapbox times) and `send-notification` (new texts). Deployed, then every bus
   re-optimized once.
3. Driver app, then parent app, checked in the browser preview with the demo accounts through a full day: morning
   start, pickups, end, afternoon start, school boarding, drop-offs, end.
4. School dashboard pages.
5. You test on the iPhone in Expo Go. GPS sends from the driver app while it is open; while you drive the demo bus
   on the phone, I can follow it as the demo parent in the browser preview and check the arrival times.
6. Docs: task.md (new phase), Docs/Claude.md schema, store listing and landing page copy if they only mention
   mornings.

## Decisions for you

1. **"Arrived at school" alert** when the driver ends the morning run? Recommended: yes. Parents get the same
   reassurance in the morning as "dropped off" gives them in the afternoon.
2. **Morning-only or afternoon-only absence reports?** Recommended: yes, with Both preselected so nothing changes
   for most parents.
3. **Switching to the afternoon at 11:00** when the morning run never happened? Recommended: yes (fixed for now; a
   per-school time later only if a school needs it).
4. **Boarding at school:** the driver taps each child, as in the morning. Recommended over a single "everyone
   boarded" button, because the tap is the record that a child is on the bus.

## Out of scope

Bus depots or a start point before the first pickup, more than two runs, different stops in the afternoon (for example
a child going to another address), and a better optimizer than nearest-neighbor. The plan leaves room for each
later.
