# Mobile app UI refresh

**Goal:** make the parent and driver apps look designed by a person, not generated: one type system shared with the
landing page, a restrained palette, a small set of shapes and spacings, and patterns borrowed from transport apps people
already trust. Light mode first; dark mode follows once the light screens are final.

## Why it reads as generated

Measured in `mobile/src` (28 files with styles, ~3,900 lines) on 2026-10-05:

| Tell | Where |
|---|---|
| Emoji used as icons | Login (🚌 logo, ✉️ 🔒 in the fields, 🙈/👁️ password toggle, ⚠️), invite screen (✉️ ⛔ 👨‍👩‍👧), dev shortcuts |
| Neon cyan glow | `#00D4FF` accent with coloured shadows on the login logo and the hero card; two-tone "Routey**AI**" wordmark |
| Weight inflation | Inter 800 used 25 times for titles and numbers; five Inter weights in total |
| Shape soup | 14 different corner radii (3 to 32 plus 999); cards with a border *and* a shadow |
| Size soup | 16 font sizes including 10.5, 11.5, 12.5, 13.5, 14.5 |
| Colour drift | 69 hard-coded hex colours (18 distinct) and 70 `rgba()` values outside `lib/colors.ts` |
| Tiny uppercase labels | 11 uses of 9–11 px uppercase text with wide letter spacing ("YOUR CHILDREN", stat labels) |
| Icon in a tinted rounded square | Account rows, cards on Home |
| Decoration without meaning | Fake pagination dots and the "Smart routing · Real-time tracking" tagline on login, glowing progress bar, "Good evening" greeting on every Home |
| Same dark navy bar on every screen | `ScreenHeader` with an 11 px, 40% white subtitle |

## Direction

Calm, confident transport app: white and light grey surfaces, deep blue only where you can act, colour reserved for
status, big honest numbers for what matters (minutes until the bus, students boarded), and system-like lists for
everything else.

| Reference | What we borrow |
|---|---|
| Karwa Journey Planner, Qatar Rail | Deep blue brand, signage clarity, room for Arabic later |
| Citymapper, Transit | One huge countdown number, the route colour as the hero, minimal chrome |
| Apple Maps, Google Maps | Map with a single bottom card or sheet, one primary action |
| iOS Settings, Wallet | Large titles, grouped inset lists, hairline separators, no icon boxes |
| Uber (Base) | Restraint: one accent, generous spacing, flat surfaces |

## Design tokens

All in one new file, `mobile/src/lib/theme.ts` (replaces `lib/colors.ts`), so screens never use raw values. Screens and
components read colours through a `useTheme()` hook, never a static import, and no style object that uses a colour lives
at module level. During the light-mode work the hook always returns the light palette; dark mode later only adds a second
palette and switches on the phone's setting (see "Dark mode" below).

### Type (same families as the landing page)

Headings in **Schibsted Grotesk 700** (`@expo-google-fonts/schibsted-grotesk`, the landing page's `font-display`), body
in **Inter 400 / 500 / 600**. Inter 700 and 800 are dropped. A `Txt` component takes a variant instead of `fontFamily`
and `fontSize`:

| Variant | Font | Size / line height | Use |
|---|---|---|---|
| `display` | Schibsted 700, tabular numbers | 40 / 44 | ETA minutes, boarded count |
| `largeTitle` | Schibsted 700, −0.4 tracking | 28 / 34 | Screen titles |
| `title` | Schibsted 700 | 20 / 26 | Card and sheet titles |
| `headline` | Inter 600 | 17 / 22 | Row titles, button labels |
| `body` | Inter 400 | 15 / 22 | Text |
| `subhead` | Inter 500 | 13 / 18 | Section headers (sentence case, secondary colour), metadata |
| `caption` | Inter 400 | 12 / 16 | Timestamps, footnotes |

No uppercase labels and nothing under 12 pt except the tab bar badge. Text respects the phone's text size setting, capped
so layouts hold.

### Colour (landing page palette, toned down)

| Token | Value | Use |
|---|---|---|
| `ink` | `#0F172A` | Primary text (landing `foreground`) |
| `inkSecondary` | `#64748B` | Secondary text (landing `muted-foreground`) |
| `inkTertiary` | `#94A3B8` | Disabled, placeholders only |
| `canvas` | `#F6F7F9` | Screen background (neutral, not the current blue-tinted `#F0F4F8`) |
| `surface` | `#FFFFFF` | Cards, lists, sheets |
| `separator` | `#E5E7EB` | Hairlines |
| `brand` | `#1E3A8A` | Primary buttons, selected states, links (landing `primary`) |
| `brandPressed` | `#172E6E` | Pressed state |
| `brandTint` | `#1E3A8A` at 8% | Secondary buttons, selected rows |
| `live` | `#38BDF8` | Only the "live GPS" dot (landing `accent`; replaces neon `#00D4FF`) |
| `success` / `warning` / `danger` | dots and fills `#10B981` / `#F59E0B` / `#EF4444`; text `#047857` / `#B45309` / `#B91C1C` | Status only. Text shades pass 4.5:1 on white; the fill shades don't |

The bus's own route colour (from the dashboard) stays the hero colour on maps and the ETA card. No coloured shadows.

### Shape, spacing, depth

- **Radii:** 6 (badges), 12 (cards, inputs, buttons, chips), 20 (sheets and cards floating on the map), full (avatars,
  status dots) — four values instead of fourteen.
- **Spacing:** 4-pt grid (4, 8, 12, 16, 20, 24, 32, 40). Screen gutter 20, card padding 16, 24–32 between sections.
- **Depth:** cards on `canvas` are flat white (no border, no shadow). One soft shadow, only for things floating over the
  map (bottom card, chips, sheets).
- **Touch:** 44 pt minimum targets; pressed states darken; light haptic on Board, Absent, Start and End route
  (`expo-haptics`).

### Icons

Switch from Ionicons to **Lucide** (`lucide-react-native` + `react-native-svg`), the set the landing page already uses:
one outline style, 1.75 stroke, 22 pt in lists and 24 pt in the tab bar. Every emoji goes; the login logo becomes the real
"R" mark from `mobile/assets/splash-icon.png`.

## Components

| Now | After |
|---|---|
| `ScreenHeader` (dark navy bar, tiny subtitle) | Large title on the canvas; plain chevron back button; actions as icon buttons |
| `Card` (border + shadow, radius 20) | Flat white, radius 12; `FloatingCard` (radius 20, one shadow) for map overlays |
| `PrimaryButton` (Inter 700) | `Button`: primary (brand fill), secondary (brand tint), plain (text), destructive; 50 pt, `headline` label |
| Account rows with tinted icon squares | `ListSection` + `ListRow`: grouped inset list, plain icon, chevron / switch / value accessory |
| `StatusPill` (tinted pill everywhere) | `StatusText`: coloured dot + text; tinted background only when it needs attention |
| `MetricCard` (colour strip, 9 px uppercase label) | `Stat`: `display` number with a `subhead` label underneath |
| `ProgressBar` (glow, colour changes at 60%) | 6 pt bar, brand colour, success colour at 100%, no glow |
| `Banner` (border, Inter 600 12.5) | Tinted background, no border, radius 12, `subhead` text, text-button action |
| `Chip` (radius 14, 1.5 border) | Radius 12, 1 pt border, brand fill when selected |
| `ChildSwitcher` | Segmented control (two to four children) |
| Tab bar (pill bubble behind the active icon) | Lucide icons, active in brand colour with a filled variant, no bubble |
| Login fields (emoji icons) | Label above the field, 50 pt, radius 12, brand focus ring, "Show" / "Hide" text button |

## Screens

- **Login and invite:** light screen, "R" mark plus the wordmark in Schibsted (one colour), no tagline or dots, fields
  as above. Dev shortcuts become a small grey "Preview screens without signing in" link.
- **Parent Home:** large title is the child's name with today's date under it (no greeting). The ETA card is white:
  `display` minutes, "Bus 1 · On time" as `StatusText`, a secondary "Track bus" button. Then today's timeline and
  announcements as flat cards.
- **Parent Track (map):** chips and the bottom card become `FloatingCard`s with the new type; ETA in `display`.
- **History and Alerts:** grouped lists by day; plain empty states (one line of text, one icon).
- **Account (both apps):** iOS-style grouped settings: profile row with initials avatar, children, notifications switch,
  privacy and terms, sign out as a destructive plain button, delete account at the bottom.
- **Driver Home:** next stop as the hero card (name and address in `title`), "5 of 11 boarded" as a `Stat`, Start
  route as the only primary button.
- **Driver Route:** Board / Absent as a two-button segmented control with icons (no "✓ Boarded" text glyphs); manifest
  as a list; map strip keeps the route colour.
- **Messages, delay sheet, trip summary:** new `Txt` variants and `Stat`s; sheets get the `title` variant.

## Order of work

Each step lands as its own commit on a `mobile-ui-refresh` branch and is checked with `npx tsc --noEmit`, an
`npx expo export` bundle, and a look on the iPhone in Expo Go (all new libraries are included in Expo Go).

1. **Before screenshots** of every screen (iPhone in Expo Go, signed in with the demo accounts) for comparison.
2. **Foundations:** `theme.ts`, fonts loaded in `app/_layout.tsx`, `Txt`, Lucide, and a `check:design` script that
   fails on raw hex colours or `fontFamily` strings outside `theme.ts` so the system doesn't drift back.
3. **Components** from the table above.
4. **Screens:** parent first (Home, Track, History, Alerts, Account), then driver, then login and invite.
5. **Polish:** haptics, pressed states, contrast and text-size checks, 44 pt targets.
6. **Follow-ups outside the app:** redraw the landing page phone mockups (`src/components/landing/ParentAppScreen.tsx`,
   `DriverAppScreen.tsx`) in the new style so the website matches, then take the store screenshots.

## Decisions (2026-10-05)

1. **Icons:** Lucide, matching the landing page.
2. **Header:** light, iOS-style large titles.
3. **Primary button shape:** rounded rectangle, radius 12.
4. **Dark mode:** planned below, built after the light mode is final.

## Identity (2026-10-06)

After checking the light screens on the iPhone, the user liked the fonts and layout but found the app "white
everywhere" with no RouteyAI signature. The identity comes from the logo (a route line through stop rings, blue to cyan)
and the landing page (navy footer and safety section, pulsing cyan live dot). The palette itself stays as it is.

| Piece | Where | Code |
|---|---|---|
| Logo and name ("Routey" ink, "AI" brand blue, Schibsted Grotesk, like the landing nav) | Above the large title on both Home tabs; logo above the version on Account | `components/brand/BrandMark.tsx`, `ScreenHeader brand` |
| Navy signature card (`night` #0A1430 with a soft blue glow from the top right) | One per screen: driver's current stop while the route runs, "Ready for the morning run?" before it, route complete; parent's arrival card | `components/brand/SignatureCard.tsx` |
| Stops on a line (filled when reached, heavier ring for the current stop or the parent's stop) | Inside the signature cards | `components/brand/RouteLine.tsx` |
| Pulsing cyan "Live" (navy pill on the canvas or map, dot and word on navy) | Driver current stop card, driver Route map, parent arrival card, parent map | `components/brand/LivePill.tsx` |
| Navy login panel with the logo, white "Routey" + cyan "AI", and the logo's route line drawn beside it | Login | `RouteMotif` in `SignatureCard.tsx` |
| Stop numbers in rings, filled brand blue when done | Driver Route | `StopBadge` |
| Navy splash background | Store builds only (Expo Go doesn't show it) | `app.json` |

Rules: one signature card per screen, so it stays special. Text on navy uses `onNight` tones and buttons the `onNight`
variant (white). The route drawing is only used on the login panel: inside cards it collided with the text.

## Dark mode (built 2026-10-07)

Built after the light screens were checked on the iPhone. Because everything already went through `useTheme()`, it was a
second palette, a few platform settings and a screen-by-screen check. What was built is described below; the iPhone
check and the dark landing mockups are still open.

**Behaviour:** follows the phone's light/dark setting, like the map already does (`userInterfaceStyle: automatic`,
`lib/mapStyle.ts`). An in-app override (System / Light / Dark under Account, like the landing page's theme switch) only if
testers ask for it.

**Palette** (same token names, values from the landing page's `.dark` theme):

| Token | Dark value | Note |
|---|---|---|
| `canvas` | `#020617` | Landing dark `background` (slate 950) |
| `surface` | `#0B1220` | Landing dark `card` |
| `surfaceRaised` | `#131C2E` | New, dark only: sheets and cards floating over the map, which use a lighter surface instead of a shadow |
| `separator` | white at 8% | |
| `ink` / `inkSecondary` / `inkTertiary` | `#F1F5F9` / `#94A3B8` / `#64748B` | |
| `brand` | `#3B82F6` | Landing dark `primary`, lifted so it reads on dark surfaces; `brandPressed` `#2563EB`, `brandTint` `#3B82F6` at 16% |
| `live` | `#38BDF8` | Unchanged |
| status text | `#34D399` / `#FBBF24` / `#F87171` | Lighter shades so status text still passes 4.5:1 |
| route line | `#8AB4F8` | Already used on the dark map (`ROUTE_LINE.dark`) |

**Platform pieces:**
- `useTheme()` picks the palette from `useColorScheme()`; the status bar switches between dark and light content.
- Expo Router / React Navigation theme set from the same palette, so screens and transitions don't flash white.
- Splash screen dark variant (`expo-splash-screen` `dark` options: canvas background, same "R" mark).
- Optional: iOS 18 dark and tinted app icon variants.
- Shadows are dropped in dark; depth comes from `surfaceRaised`.
- Identity pieces: the navy signature card would vanish on the near-black canvas, so in dark it keeps `night` but adds a
  1 pt `nightLine` border and a stronger glow; the login panel and live pill stay as they are; the "AI" in the header
  lockup uses the lifted brand blue.

**Built:** `dark` palette and `useIsDark()` / `useFloatingShadow()` in `lib/theme.ts`; `surfaceRaised` for sheets, floating
cards, the selected segment and map controls; the navy `SignatureCard` and `LivePill` get a `nightLine` hairline in
dark; `StatusBar style="auto"`; the root view and both stacks use the canvas colour so nothing flashes white; text fields
use the dark keyboard. No splash change was needed (it is already navy), and the in-app override and iOS dark icon were
left out. Checked in the web preview (emulated dark and light) on login and every parent and driver screen.

**Still to check:** every screen in both modes on the iPhone (switch in Control Centre), contrast of text and status colours,
the map overlays over the dark map style, sheets and the keyboard. Then redraw the dark landing mockups
(`phone-*-dark.webp` already exist for the map backgrounds) and take dark store screenshots if wanted.

## Out of scope

Behaviour and data (no feature changes), the web dashboards, Arabic/RTL (the layout choices above leave room for it).
