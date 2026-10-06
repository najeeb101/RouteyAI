# Two runs a day: morning pickup and afternoon drop-off

Status: approved 2026-10-06; step 1 (database and route rules) done on branch `two-runs`, waiting for the production push. Builds on the mobile UI refresh (merged in PR #4).

## The rules

1. **Every bus does exactly two runs every school day, always both.** There is no setting for it and nothing for the
   driver to choose.
   - **Morning run:** homes → school. The driver picks students up stop by stop and ends at the school.
   - **Afternoon run:** school → homes. Every student boards at the school, and the driver drops them off in the
     **reverse order** of the morning: the last morning stop is the first afternoon stop.
2. **A route stays the same once it is made.** The system never re-plans a route by itself. The order of stops changes
   only when a school admin chooses to re-plan, and even then only if the new route is clearly better. Small changes
   (a child joins, leaves or moves house) slot in without moving anyone else's stop. Drivers learn a route and keep it.

## What the code does today

1. **One run a day everywhere.** `attendance` allows one record per student per day (`UNIQUE(student_id, date)`) and
   the Route screen replaces it on each tap, so an afternoon tap would overwrite the morning's. The driver screen says
   "Morning run" and shows every stop as done after the morning. Parents only get "boarded" and "absent", and the
   arrival time only counts while waiting for a pickup. Absence reports always cover the whole day.
2. **The morning order is backwards.** `optimize-route` builds the stop list starting at the school and moving outwards
   (nearest stop first). The driver app follows that list, so the morning run starts next to the school, ends at the
   farthest stop, then drives back with every child on board. The map line and arrival times leave out that drive back.
   That order is the right one for the afternoon (leaving school).
3. **Routes already only change on purpose.** The only things that re-plan are the dashboard's Recalculate (one bus)
   and Optimize all (every bus, which can also move children to other buses). Both are pressed by a school admin.
4. **New or moved children have no place.** A child added to a bus gets no stop number and appears at the end of the
   driver's list, with no point on the map, until someone presses Recalculate (which re-plans everyone). A child moved
   to another bus keeps the stop number from the old bus.

## Architecture

### How the pieces fit

```
School dashboard ── Recalculate / Optimize all / child added, moved, removed ──► optimize-route (Edge Function)
                                                                                    │ save_route_plan (one transaction)
                                                                                    ▼
                                                  students.stop_order (the stop chain) + routes (morning row, afternoon row)

Driver app ── start_run / end_run / mark_attendance (database functions) ──► bus_runs, attendance
                                                                                    │ trigger
                                                                                    ▼
                                                                          send-notification ──► parents' phones
Driver app ── GPS every 10 s ──► bus_locations

Parent app ◄── live updates ── bus_runs, attendance, bus_locations, absence_reports
```

Principles:

- **The database is the single source of truth for the day.** Which run is on, who boarded, who was dropped off.
  The apps work everything else out from it, so the driver, the parent and the school always see the same thing.
- **Drivers change state only through database functions**, which check it is their bus, set the date in Qatar time,
  and allow only valid steps (a child can't be dropped off before boarding). Today drivers write `attendance`
  directly.
- **One stop chain per bus, two directions.** The chain is stored once (`students.stop_order`, in morning order); the
  afternoon is the same chain reversed. The two can never drift apart.
- **A run uses the route as it was when the run started.** `start_run` copies that run's stops into the run record. If
  the school changes the route mid-drive, the driver's list doesn't move under them; the change applies from the next
  run, and the driver sees "Your route changed" when it does.
- **The run logic is plain functions with tests.** Which run comes next, the stop order for a run, the parent's card
  for any moment of the day, and where a new child slots in are all written as small pure functions and tested with
  Node's built-in test runner (no new dependency).

### Route planner (`optimize-route`) and the stability rule

The planner gets three modes. Only `optimize` can reorder existing stops, and only a school admin can start it.

| Mode | When | Existing stops | Saved |
|---|---|---|---|
| `refresh` | Once after this update; if Mapbox is changed | Order unchanged | Map lines and times for both runs |
| `update` | Straight after a school admin adds, removes or moves a child, or changes an address | Order unchanged. A new child goes where they add the least driving (or joins an existing stop at the same address); a removed child's stop goes if nobody else uses it | Right away; the dashboard says what changed ("Omar added between stops 3 and 4") |
| `optimize` (one bus) | School admin presses Re-optimize | Re-planned | **Proposal only.** The dashboard shows minutes and km saved and how many stops move. Unless it saves at least 5 minutes a run, or at least 10% and 2 minutes, the current route is kept ("Your route is already good") |
| `optimize` (whole school) | School admin presses Optimize all | Re-planned; children can move between buses | **Proposal only**, listing every child who would change bus, applied only when the admin confirms |

- **Major change hint, never automatic.** After each `update`, the planner also works out what a fresh plan would give.
  If that would save at least 5 minutes a run (or 10% and 2 minutes), the Routes page shows "Re-optimizing would save
  about 6 minutes a run". The admin decides. The 2-minute floor stops a short route from flagging a 1-minute saving.
- **Daily absences never touch the route.** A stop where nobody rides today shows "No one today" and the driver skips
  it; the order stays.
- **Map lines:** the planner asks Mapbox Directions once per direction (two requests per bus), because Doha's one-way
  streets and divided roads mean the way back isn't the way out drawn backwards. Each stop's minutes come from Mapbox's
  times between stops (`legs[].duration`), with today's straight-line estimate as the fallback (no Mapbox, or more than
  24 stops).
- **Both directions are saved in one transaction** (`save_route_plan`): the chain, the morning row and the afternoon
  row, so the two runs can never come from different plans. Service role only, like 0016.

### Run lifecycle

Per bus, per day (Qatar date):

```
not started ──start_run(morning)──► morning running ──end_run──► morning done
     │                                                               │
     └── 11:00 with no morning run ──────────────────────────────────┴──start_run(afternoon)──► afternoon running ──end_run──► done for today
```

- Only one run can be running. Starting the afternoon ends a morning run that was left open.
- `start_run` and `end_run` keep `buses.is_active` in step, because the school dashboard reads it today.
- Ending the morning marks everyone still on board as `dropped_off` (arrived at school), which sends the "arrived at
  school" alert.

Per student, per run:

```
(nothing) ──board──► boarded ──drop off (afternoon only)──► dropped_off
(nothing) ──absent─► absent
```

Every step can be undone by the driver. Undoing a drop-off goes back to `boarded` without a second alert. Morning
drop-offs only come from ending the run.

### Database (migration `0017_two_runs.sql`)

The migration only **adds**: new columns have defaults and the old functions stay, so the current apps keep working
while the rest is rolled out. A later `0018` removes the old pieces once nothing uses them.

**New table `bus_runs`**

```sql
CREATE TABLE bus_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  date DATE NOT NULL,                                   -- Qatar date, set by start_run
  run TEXT NOT NULL CHECK (run IN ('morning', 'afternoon')),
  stops JSONB NOT NULL DEFAULT '[]',                    -- the run's stops when it started
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  UNIQUE (bus_id, date, run)
);
```

Read by the driver (own bus), parents (their children's buses), school admins (own school), platform admins. Written
only by `start_run` / `end_run`. Added to realtime so the parent app sees a run start and end.

**`attendance`:** new `run` column (`'morning'` for existing rows), unique rule `(student_id, date, run)`, new status
`dropped_off` with a `dropped_off_at` time (`created_at` stays the boarding time). Drivers write through
`mark_attendance(p_student_id, p_status)`, which finds the running run. Their direct-write policy goes in 0018.

**`absence_reports`:** new `runs` column: `'both'` (default and every existing report), `'morning'` or
`'afternoon'`. Still one report per child per day.

**`routes`:** new `run` and `plan_version` columns, unique rule `(bus_id, run)`, and a `suggestion` column for the
"re-optimizing would save…" hint.

**Functions:** `start_run(p_run)`, `end_run()`, `mark_attendance(p_student_id, p_status)` (drivers, own bus only),
`save_route_plan(...)` (service role only). Every new SECURITY DEFINER function gets the 0016 treatment
(`REVOKE ALL … FROM PUBLIC, anon`, then granted only to the role that should call it).

**Notification trigger:** also sends `run` and the previous status, so `send-notification` can word the alert for the
run and skip undo taps.

`src/types/database.ts`, Docs/Claude.md §5 and CLAUDE.md are updated with all of this.

**Privacy fix (found in step 1, older than this work):** a parent can read their child's bus route, and its
`waypoints` list the home coordinates of every child on that bus (checked locally: a parent of 3 children could read
26 homes). The app only draws the parent's own stop, but the data is reachable with the parent's login. No real
parents use the app yet. Fix, with the new parent app: parents read the route through a function that returns only
the line, their own child's stop and how many stops come before it; the parent's read access to `routes` is removed
in 0018. `bus_runs.stops` only holds student ids and order, never homes, for the same reason.

### Apps and dashboard

- **Shared run logic:** `mobile/src/lib/runs.ts` with the pure functions above. The web pages use the same rules
  (copied into `src/lib/runs.ts`, since the web and the app don't share code today).
- **Driver app:** loads the stops from the running run (or from the route rows before a run starts), and gets live
  updates of `bus_runs`, `attendance` and `absence_reports` as today. Remembers the run in the saved running trip.
- **Parent app:** loads today's runs for the bus and its child's route through the new parent function (line, own
  stop, stops before it), works out the card from the shared functions, and measures the arrival time along the line.
- **Dashboard:** run shown on each bus, Morning / Afternoon switch on the Routes page, proposals with "Apply" or "Keep
  current route", "Not on the route yet" for any child without a stop.

## What each person sees

**Driver**

- The app picks the run itself: the morning run until it is ended, then the afternoon run (or the afternoon from
  11:00 if the morning never happened).
- Home: "Morning run · 5 stops · 6 students" or "Afternoon run · …", "Ready for the afternoon run?", and a stop line
  running in that run's direction. Stop 1 is always the run's first stop.
- Afternoon Route screen:
  - **At school** first, listing every student on the bus with Board and Absent.
  - Then the stops in reverse order, each student with one **Drop off** button (tap again to undo).
  - Students not on the bus (absent at school, or reported by the parent) show as "Not on the bus" and count as done.
- **Ending the afternoon is a safety check.** If anyone boarded but was never dropped off, the driver sees their names
  with "Go to Route" or "End anyway". "End anyway" keeps them flagged in the trip summary and on the school dashboard;
  it never tells parents their child was dropped off.

**Parent:** the arrival card follows the child through the day.

| Moment | Card says | Arrival time |
|---|---|---|
| Morning, bus coming | "6 min", 2 stops before yours | To your stop |
| Morning, picked up | "On the bus", boarded at 6:52 | To school |
| Morning run ended | "At school", arrived at 7:25 | — |
| Afternoon, boarded at school | "On the way home", 3 stops before yours | To your stop |
| Afternoon, dropped off | "Home", dropped off at 2:05 | — |
| Absent or reported | As today, for that run | — |

The map shows the running run's line in its direction. Past rides show both runs each day. Report an absence gets a
"Which rides?" choice (Both · Morning · Afternoon), set to Both.

**Notifications**

| When | Title | Body |
|---|---|---|
| Morning, bus ~5 min away | Bus arriving in ~5 minutes | Get Lina ready - the bus is almost at your stop. (unchanged) |
| Morning, boarded | Lina has boarded | Lina is on the bus and on the way to school. (unchanged) |
| Morning run ended | Lina arrived at school | The bus reached the school at 7:25. |
| Morning, absent | Lina marked absent | Lina was not on the bus this morning. |
| Afternoon, boarded at school | Lina is on the bus home | The bus left school at 1:35. |
| Afternoon, absent at school | Lina isn't on the bus home | The driver marked Lina absent at school. Contact the school if you didn't expect this. |
| Afternoon, bus ~5 min from home | Lina is almost home | The bus is about 5 minutes from your stop. |
| Afternoon, dropped off | Lina was dropped off | Lina got off at Al Waab, Doha at 2:05. |

**School admin:** the bus list shows which run each bus is on. The Routes page gets a Morning / Afternoon switch,
re-planning as a proposal, and the "would save…" hint. The Absences page shows which rides each report covers. The
older web driver and parent pages follow the same rules.

## Order of work

1. **Database and route logic.** Write 0017 and the pure route functions (chain → morning and afternoon order,
   slotting in a new child, the "clearly better" check) with tests, run the migration on the local database with the
   seed data, and check each role's access. You push 0017 to production; nobody sees a change yet.
2. **Edge Functions.** `optimize-route` (three modes, both directions, one-transaction save) and `send-notification`
   (run-aware alerts, still accepting today's messages). Deployed.
3. **Existing routes.** Run `refresh` on every bus: the same chain of stops, with map lines and times for both runs.
   Nothing is re-planned. Done when the new apps go live, because today's apps read whichever route row is newest.
4. **Driver app, then parent app** (including the privacy fix), checked in the browser preview with the demo
   accounts through a full simulated day.
5. **School dashboard.**
6. **You test on the iPhone** in Expo Go (GPS sends while the app is open; I can follow the demo bus as the demo parent
   in the browser preview while you drive it). Then merge.
7. **Clean-up migration 0018** (old `set_bus_active`, old `save_optimized_route`, drivers' direct attendance writes,
   parents' direct read of `routes`), and
   docs: task.md, Docs/Claude.md, store listing and landing page copy where they only mention mornings.

## Decisions for you

Needed before step 3:

0. **Which way do existing routes run in the morning?** Recommended: **flip the morning once**, so it ends at the
   school (farthest stop first). Each stop keeps the same neighbours; only the direction of the morning changes, and
   the afternoon runs today's order. Kids picked up first no longer ride the whole loop out and back. The other option
   keeps today's morning order and makes the afternoon its reverse, which starts at the farthest stop.

Needed before step 4 (I'll go with the recommendation unless you say otherwise):

1. **"Arrived at school" alert** when the morning run ends: recommended yes.
2. **Morning-only or afternoon-only absence reports**, Both preselected: recommended yes.
3. **Switch to the afternoon at 11:00** if the morning run never happened: recommended yes (one fixed time for now).
4. **At school the driver taps each child as they board**, instead of one "everyone boarded" button: recommended,
   because the tap is the record that a child is on the bus.

## Out of scope

Bus depots or a start point before the first pickup, more than two runs, different afternoon stops (a child going to
another address), and a better optimizer than nearest-neighbor. The design leaves room for each later.
