# RouteyAI Mobile App

The Expo (React Native) app for drivers and parents. Product rules, the database and the design system are in [Docs/Claude.md](../Docs/Claude.md); this file covers building and running the app.

Every bus does a morning and an afternoon run each school day (Claude.md §1.1). The driver picks the run to start; the parent sees a card for every moment of the day. The shared run rules are in `src/lib/runs.ts` (tested from the repo root with `pnpm test:logic`).

## Structure

```txt
mobile/
  src/
    app/                    expo-router routes (thin: each renders a feature screen)
      (auth)/login.tsx
      invite/[code].tsx
      (dashboard)/driver/   index, route, messages, account
      (dashboard)/parent/   index, map, history, notifications, account
    features/
      auth/screens/         LoginScreen
      account/              AccountScreen
      driver/               screens/, hooks/useDriverData, context/DriverDataContext, gpsTask.ts
      parent/               screens/ (with useParentData and useChildHistory), context/ParentDataContext, components/
    components/
      primitives/           Txt, Button, Card, List, Banner, Chip, SheetModal, TextField, ...
      brand/                BrandMark, SignatureCard, RouteLine, LivePill
      navigation/           TabIcon, tabBarStyle
    lib/                    theme.ts, runs.ts, mapStyle.ts, supabase.ts, push.ts, mapbox.ts
```

## Conventions

- Route files stay thin and import screens from `features/*/screens`.
- Colours come only from `src/lib/theme.ts`, read with `useTheme()` (light and dark palettes, following the phone's setting), and text with `<Txt variant>`. `npm run check:design` fails on raw hex colours or font names in components. NativeWind is not installed.
- Drivers start and end runs with `start_run` / `end_run` and mark students with `mark_attendance`. Parents read their route with `get_parent_route` and `get_parent_bus_progress`, never from the `routes` table.
- While a run is open the driver app sends GPS every 10 seconds, also with the screen locked: `features/driver/gpsTask.ts` runs `expo-location` background updates (`expo-task-manager`) as an Android foreground service. It needs a native build (`npx expo run:android`), not Expo Go.
- Push tokens are registered on launch (`expo-notifications`) and saved to `user_roles.push_token`.
- `/login`, `/driver` and `/parent` are the stable paths used by navigation.

## Environment

Copy `.env.example` to `.env.local`. The map needs one Mapbox token:

- `EXPO_PUBLIC_MAPBOX_TOKEN`: a **public** `pk.` token. It ships inside the app, so never put a secret `sk.` token here. For EAS cloud builds, add it with `eas env:create --name EXPO_PUBLIC_MAPBOX_TOKEN --visibility plaintext`.

Building no longer needs a secret download token: since `@rnmapbox/maps` 10.3 the Mapbox SDK downloads without one.

`.env.local` points at the live Supabase project so a phone can reach it; the local stack (`http://127.0.0.1:54321`) is only reachable from an emulator or the web preview, and its URL is kept as a comment in the file.

## Commands

```bash
npm run start          # Expo dev server
npm run typecheck
npm run check:design   # no raw colours or fonts in components
npm run android        # native build (needed for the map and background GPS)
```

## Over-the-air updates

`expo-updates` lets a JavaScript-only fix reach installed apps without a store release. Each EAS build profile has a channel of the same name (`development`, `preview`, `production`), and `runtimeVersion` follows the app `version` in `app.json`, so an update only goes to builds with the same version.

```bash
npx eas-cli update --channel production --message "Fix ETA rounding"
```

Native changes (a new library, a permission, an `app.json` plugin) still need a new build and store release; bump `version` in `app.json` when you make one.

## Trying the app in Expo Go

Without an EAS build (for example on an iPhone before there is an Apple Developer account), run `npx expo start` in `mobile/` and scan the QR code with the phone's camera; it opens in the Expo Go app. Phone and laptop must be on the same Wi-Fi (otherwise `npx expo start --tunnel`). Expo Go has no Mapbox or background-location native code, so the map screens show a placeholder (`src/lib/mapbox.ts`) and the driver's GPS only runs while the app is open. Everything else works, including dark mode (switch the phone's appearance).

## Web preview (screenshots only)

`npx expo start --web` renders the app in a browser, for quick design checks and screenshots at phone size, in light and dark. It is not a supported way to use the app: maps show the placeholder (`src/lib/mapbox.web.ts`), storage falls back to `localStorage` (`src/lib/storage.web.ts`), and there is no GPS or push.
