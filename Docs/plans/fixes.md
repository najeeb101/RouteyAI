# Fixes

Status: all three fixed and live (2026-10-07). 1A and 2 merged in PR #5; 1B and 3 went out with two runs a day (PR #6),
and 0020 (PR #9) removed the parent's direct read of `routes`. Three problems found while planning [two runs a day](two-runs-a-day.md),
all older than that work. Only the demo school uses production and no real parents have the app, so none of them has
reached anyone yet.

| # | Problem | Fix | When |
|---|---|---|---|
| 1 | Adding, moving or removing one child reshuffles every route in the school | Stop the automatic re-plan now (1A); slot new children in with two runs (1B) | 1A now; 1B with two-runs steps 2 and 5 |
| 2 | Editing a child's address doesn't move their stop | Save the new map location with the address | Now, with 1A |
| 3 | A parent can read the home location of every child on their child's bus | Parents get only the road line and their own child's stop | With two-runs step 4, before the first real parent |

## 1. The Students page reshuffles every route

**What happens.** After every child added, moved to another bus or removed, the Students page calls `optimize-route`
for the whole school (`triggerOptimization`, `src/app/(dashboard)/school/students/StudentsTable.tsx:156`, called at
:191, :221 and :233). With a `school_id`, the function re-runs the bus assignment for every child in the school
(K-means, `supabase/functions/optimize-route/index.ts:285`), then re-plans every bus from scratch. So one new child can:

- reorder the stops on every bus,
- move other children to different buses,
- undo a "Change bus" the admin just made, because the assignment puts the child back.

That breaks the rule that routes never change by themselves.

**1A, now (website only).**

- The Students page stops calling `optimize-route`. Adding, moving or removing a child changes only that child.
- "Change bus" also clears the child's `stop_order`, so their place on the old bus doesn't drop them into the middle
  of the new bus's list.
- A child with no stop shows "Not on the route yet" on the Students page, and the toast says what to do next:
  "Omar added to Bus 3. Press Recalculate on the Routes page to add the stop."
- Until then the driver app lists that child after the last stop, as it already does for a child with no stop
  (`mobile/src/features/driver/hooks/useDriverData.ts:188`), and their parent sees no stop or arrival time. A removed
  child leaves the driver's list straight away; their point stays on the saved map line until the next Recalculate.
- "Optimize all" on the Routes page asks first: "This can move children to other buses and changes every route.
  Drivers will see the new routes." Today it runs on one click.
- Recalculate (one bus) stays as it is: the admin chose it. Its dialog now says it only touches that bus.
- Buses without a route are listed on the Routes page with "Plan route". Without it, a new bus (or a new school) could
  only get a route through Optimize all, now that the Students page no longer plans routes.
- The landing page FAQ and `Docs/features.md` no longer say routes are recalculated automatically.

**1B, with two runs (steps 2 and 5).** Built in step 2: the new `update` action slots a new child in where they add the least driving,
without moving anyone else, and re-planning becomes a proposal the admin applies only if it is clearly better. The
Students page then calls `update` for the buses it touched, and "Not on the route yet" only shows if that fails.
Details: [two-runs-a-day.md](two-runs-a-day.md#route-planner-optimize-route-and-the-stability-rule).

**Check.** On the local database with the seed data: add a child to a bus, move another child to a different bus,
remove a third, and compare every other child's bus and `stop_order` before and after (nothing changes). The moved
child stays on the bus the admin picked. Recalculate puts the new child on the route. `pnpm typecheck` and `pnpm lint`.

## 2. Editing an address doesn't move the stop

**What happens.** "Edit student" saves the new address text but not its map location (`handleEdit`,
`StudentsTable.tsx:195`), so `home_location` keeps the old point. The route, the driver's order and the parent's stop
all stay at the old house, and nothing tells the admin.

**Fix, now (website only, no migration).**

- When the address text changed, geocode it with the same `geocodeAddress` the Add form uses and save `home_location`
  in the same update (`SRID=4326;POINT(lng lat)`; school admins can already update their own students).
- Clear the child's `stop_order` as well, so they show "Not on the route yet" like a new child (1A) until the admin
  recalculates the bus. With two runs, `update` spots the house move and re-slots only that child.
- If the address can't be found, save nothing and say so: "We couldn't find that address. Try adding the area or
  street." The Add form falls back to the centre of Doha; for an edit that would move a correct stop to a wrong one.
- Adding a student whose address isn't found now shows a warning. The old warning sat in the Add dialog, which had
  already closed.

**Needs the Mapbox token on the live site.** [task.md](../task.md) notes that Vercel has no Mapbox token yet, so on
the live site no address can be geocoded: new children are saved at the centre of Doha, and with this fix every
address edit would be refused. Add `NEXT_PUBLIC_MAPBOX_TOKEN` (the public `pk.` token) in the Vercel project settings
and redeploy. Any child added on the live site before then sits at the centre of Doha; editing their address fixes it.

**Check.** Locally: edit an address and confirm `home_location` moved (`ST_AsText`) and `stop_order` is empty; edit
only the name and confirm the location and stop stay; an address Mapbox can't find saves nothing and shows the message.

## 3. A parent can read every home on the bus

**What happens.** Parents can read their child's bus route (`parent: read child's bus route`,
`supabase/migrations/0014_fix_rls.sql:93`), and the route's `waypoints` hold the map location of every child's stop.
Checked on the local database: a parent of 3 children could read 26 homes. The apps only draw the parent's own stop,
but anyone with a parent's login can ask the database for the whole list. Other children's names and addresses are
already hidden; only the locations leak.

**What reads it today.** The mobile parent app (`mobile/src/features/parent/screens/useParentData.ts:264`) uses every
stop to draw the line and to measure the arrival time stop by stop (:358). The web parent page
(`src/app/(dashboard)/parent/page.tsx:62`) lists every stop in its timeline.

**Fix (built 2026-10-06, `supabase/migrations/0018_parent_route.sql`, live 2026-10-07).**

- `get_parent_route(p_student_id, p_run)` checks that the caller is that child's parent and returns only the road line,
  the child's own stop, how many stops come before it and in total, and the school. SECURITY DEFINER with the 0016
  treatment (`REVOKE ALL … FROM PUBLIC, anon`, then granted to `authenticated`).
- `get_parent_bus_progress(p_student_id)` does what the app used to do with every stop, in the database: from the
  bus's latest GPS point on the running run, the stops before the child's and the minutes to their stop (and in the
  morning to school), at 25 km/h along the stops. Changed from the plan, which measured along the line in the app:
  that couldn't say how many stops are left without knowing where the other stops are.
- Stops are counted by address, as the driver app groups them, so children at one address are one stop.
- No line when the route has no road line from Mapbox: the fallback is drawn straight from stop to stop, so its corners
  are the homes. The parent then sees the bus, the school and their own stop only.
- Both parent apps use them; the web parent page numbers the other stops without naming them.
- Migration 0020 (the clean-up) removes the parent's read access to `routes`. `bus_runs.stops` already holds only
  student ids and their order, never homes.

**When.** With the new parent app in two-runs step 4: that rebuild changes the same screens, and the function needs the
run. 0018 goes to production with the new apps; 0020 must be on production before the first real parent is invited,
so it blocks store submission (Phase 12).

**Check.** `supabase/tests/0018_parent_route.sql` (11 checks, pass locally): the parent gets the line, their own stop
and counts, and no other child's id or home; stops are counted by address; another parent, a driver and anonymous
callers are refused; progress is live only with a recent GPS point and a running run. 0020 (live) also made a
parent reading `routes` get no rows.

## Order

1. Branch `fixes` from `main` with 1A and fix 2 (the Students page, plus the confirm on Optimize all). Checked locally,
   then merged to `main`, which deploys the website. No database change.
2. You add the Mapbox token on Vercel, before or right after that merge.
3. 1B and fix 3 were built as part of two runs a day (steps 2, 4 and 5). The `two-runs` branch took `main` in first,
   so the Students page changes don't clash.
