# App Store and Google Play Listing

Copy for both stores, written from what the app does today (same claims as the landing page: GPS every 10 seconds, no turn-by-turn, free for parents and drivers). English first; an Arabic listing follows with the Arabic app (after launch).

Character limits are checked: App Store name and subtitle 30, promotional text 170, keywords 100; Play title 30, short description 80, full description 4,000.

## Name and short lines

| Field | Text |
|---|---|
| App name (both stores) | RouteyAI: School Bus Tracker |
| App Store subtitle | Live school bus tracking |
| Play short description | Follow your child's school bus live and know the moment they get on board. |
| App Store promotional text | Follow your child's bus on a live map, know the moment they board and get home, and tell the driver when they're staying home. Free for parents and drivers. |
| App Store keywords | school bus,bus tracker,school transport,parent,driver,student,attendance,qatar,doha,live map |
| Category | Education (App Store secondary: Navigation; Play: Education) |
| Age rating | 4+ / Everyone. The app is for parents and drivers, not children. |

## Description (both stores)

```
RouteyAI keeps parents, drivers and schools in step on every school bus ride.

RouteyAI is used by schools. Your school sends you a personal invite link that sets up your account.

FOR PARENTS
• See the bus on a live street map while the route is running
• Arrival time for your stop, and an alert when the bus is close
• A notification when your child boards, is dropped off at home or is marked absent
• Every child on one account, one tap to switch
• Report an absence for the morning, the afternoon or both, so the bus doesn't wait
• Each child's past rides and absences

FOR DRIVERS
• Stops in the planned order: pickups in the morning, drop-offs in reverse in the afternoon
• One tap to mark a student boarded, absent or dropped off
• See which students are staying home, as reported by their parents
• Tell every parent on the bus at once when you're running late
• Shares the bus location every 10 seconds while the route is running
• A summary of who rode when the route ends

PRIVACY
The bus location is shared only while the driver's route is running, and only with the school and the parents of children on that bus. Parents see their own children and nobody else's. Sharing stops when the route ends.

Free for parents and drivers. Schools can book a demo at routeyai.vercel.app.
```

## Notes for app review

Both stores need a working sign-in. `node scripts/review-accounts/setup.mjs` creates "RouteyAI Demo School" on the database in `.env.local` with a parent (`demo-parent@example.com`, two children on Bus 1) and the Bus 1 driver (`demo-driver@example.com`), plus a school admin for the web dashboard. The shared password is `REVIEW_ACCOUNTS_PASSWORD` in `.env.local` (generated on the first run; never commit it, the repo is public). Re-run the script after a review: reviewers may try Delete account, and the script recreates the user and relinks the children. Give reviewers:

```
RouteyAI is used by schools: accounts are created from an invite sent by the school, so please use these demo accounts.

Parent: <email> / <password>
Driver: <email> / <password>

To see live tracking: sign in as the driver, open Route and tap Start route. The bus location is shared every 10 seconds while the route is running. Then sign in as the parent on a second device and open the Map tab.

Location: only the driver app uses location, only while a route is running, and only with "While using the app" permission. On Android this runs as a foreground service with a visible "Route in progress" notification so tracking continues when the screen locks; it stops when the driver ends the route.
```

## Privacy answers (App Privacy on Apple, Data safety on Play)

Draft for the legal review; confirm before submitting.

| Data | Who | Why | Shared with |
|---|---|---|---|
| Precise location | Drivers only, while a route is running | Show the bus to parents and the school | The school and parents on that bus |
| Name, email address | Parents, drivers | Account | The school |
| Student name and home stop address | Entered by the school | Route planning, showing the right stop | The school, the child's parents, the bus driver |
| Absence reason (sick, appointment, travel, other) | Parents | Tell the driver and school | The school and the bus driver. "Sick" may count as health information |
| Push token (device ID) | Parents, drivers | Notifications | Nobody |

No ads, no tracking across apps, nothing sold. Data is encrypted in transit.

## Blocking before submission

- Account deletion (Apple 5.1.1(v), Google Play) is built: Account tab → Delete account. Play's "delete account URL" is `https://<domain>/privacy#delete-account`. Needs migration `0015` on the production database.
- Demo reviewer accounts on the production database (above).
- A real support email and privacy policy URL (`NEXT_PUBLIC_CONTACT_EMAIL`, `/privacy` on the final domain).

## Graphics

| Asset | Size |
|---|---|
| iPhone screenshots (6.9") | 1320 × 2868, 3 to 10 |
| Play phone screenshots | 1080 × 1920 or larger 9:16, 2 to 8 |
| Play feature graphic | 1024 × 500: `mobile/store/feature-graphic.jpg` (`node scripts/store-graphics/build.mjs`) |
| App icon | 1024 × 1024, no transparency (App Store, from `mobile/assets/icon.png`); 512 × 512 (Play): `mobile/store/play-icon.png` |

Suggested screenshot order: parent live map, child boarded notification, report an absence, driver route with stops, driver check-in, end-of-route summary.
