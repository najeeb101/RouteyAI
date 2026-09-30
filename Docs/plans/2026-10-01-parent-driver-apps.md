# Parent and Driver App Upgrade

> Tracked as **Phase 14** in [task.md](../task.md). Requested 2026-10-01: parents can move between their children and have more options; drivers get more options too; the landing page phones show the result.

## Decisions (user, 2026-10-01)

- Build it in the real Expo apps first, then redraw the landing-page phones from the new screens. The web `/parent` and `/driver` views are not part of this round.
- Parents: switch between children, report an absence, trip history, settings and profile, full-screen live map.
- Drivers: tell parents about a delay, see reported absences, settings and sign out, end-of-route summary.

## Database: `0013_absence_reports.sql`

| Change | Why |
|---|---|
| New table `absence_reports (student_id, school_id, date, reason, note, reported_by)`, one row per child per day | A parent's report is separate from `attendance`, which is what the driver recorded at the stop |
| Trigger fills `school_id` (from the student) and `reported_by` (`auth.uid()`) | The app only sends `student_id`, `date`, `reason`, `note` |
| RLS: parents read their children's reports, insert or delete them for today or later; drivers read reports for students on their bus; school admins read their school's; platform admin full access | Same scoping pattern as `attendance` |
| Added to `supabase_realtime` | The driver's route updates when a parent reports an absence mid-route |
| `set_push_token(p_token)` (SECURITY DEFINER) | `user_roles` has no UPDATE policy for parents and drivers, so the app's token save always failed and push never reached them. An UPDATE policy would also let users change their own role |

Reasons are `sick`, `appointment`, `travel`, `other`. "Sick" is health information: the privacy page lists absence reports and who can see them.

## Parent app

Tabs: **Home · Track · History · Alerts · Account**.

- `useParentData` loads every child linked to the account (it used to take the first one), with today's attendance and absence reports for all of them. The selected child's bus drives the route, live location and ETA.
- `ChildSwitcher`: one chip per child with a live status (waiting, on the bus, absent, staying home). On Home, History and the map.
- Home: status and ETA card ("6 min", "3 stops before yours", "Boarded at 6:52 AM", "Staying home"), Report absence and Trip history shortcuts, upcoming absences with Cancel, bus details, updates.
- Track: full-screen map that follows the bus (stops following when the parent pans; a button re-centres), the child's stop, and a card with the ETA and stops left. Other children's stops are not drawn.
- `ReportAbsenceSheet`: child, one or more of the next eight school days (Sunday to Thursday), reason, optional note.
- History: last 30 days per child (rode, absent, stayed home), counts, and upcoming reports.
- Account: profile, children, push notification switch (remembered on the phone so it isn't turned back on at launch), privacy and terms links, sign out (clears the push token first).

Fix found on the way: Supabase returns `GEOGRAPHY` columns as hex EWKB, but the app parsed WKT, so the live bus never appeared. `mobile/src/lib/geo.ts` `parsePoint` reads EWKB, WKT and GeoJSON.

## Driver app

Tabs: **Home · Route · Messages · Account**.

- Trip state (`useTrip`) moved into the driver context: start, end, 10-second GPS updates, start and end times.
- Home: big Start route button; while live, "last update" time and End route (asks first, and warns if students aren't checked in); students staying home today; boarding progress; current stop; Running late and Messages shortcuts.
- `DelaySheet`: 5 to 30 minutes plus an optional reason; inserts an announcement ("Bus 3 is running about 10 minutes late."), which the existing trigger pushes to parents.
- Route: students reported absent show "Staying home · reason" and count as done, so a stop where nobody is waiting can be skipped; the driver can still board them.
- `TripSummary` after ending: times and duration, rode / absent / reported, stops completed, and a warning for students never checked in.
- Account: name, bus, seats, route size, school, push switch, links, sign out.

## Landing page phones

`scripts/landing-map/build.mjs` now also renders close-up OpenStreetMap crops for the two phones (`public/assets/maps/phone-{driver,parent}.webp`, data in `src/components/landing/appMapData.ts`) with street names placed for each crop. Stops are exact vertices of the route line, so the bus drives stop to stop.

- Driver phone: Bus 1's route screen; a student staying home (reported sick) at the current stop; the bus drives to the next stop.
- Parent phone: the Track tab; Aisha and Yousef chips (Yousef staying home); Bus 3 drives to Aisha's stop while the ETA counts down, then the boarding notification.

## Still to do

- Apply `0013_absence_reports.sql` to the Supabase project once it is restored (`pnpm db:push`), then test on a phone: report an absence as a parent, see it on the driver's route, send a delay notice, end a route.
- Show absence reports in the school admin dashboard.
- Web `/parent` and `/driver` views, if they should match the apps.
