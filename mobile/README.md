# RouteyAI Mobile App

This folder is the Expo / React Native app for mobile driver and parent workflows. It mirrors the product hierarchy from `Docs/Claude.md`, adapted for Expo Router.

## Structure

```txt
mobile/
  src/
    app/
      (auth)/
        login.tsx
      invite/
        [code].tsx
      (dashboard)/
        driver/
          index.tsx
          route.tsx
          messages.tsx
        parent/
          index.tsx
          map.tsx
          notifications.tsx
    components/
      navigation/
      primitives/
      route/
    features/
      auth/screens/
      driver/
        context/          # DriverDataContext
        hooks/            # useDriverData (Supabase queries, attendance, GPS)
        screens/
      parent/
        context/          # ParentDataContext
        screens/          # includes useParentData (Realtime + ETA)
    lib/
      navigation/
      supabase.ts
    types/
```

## Notes

- Route files stay thin and import screens from `features/*/screens`.
- Shared UI lives in `components/primitives`, `components/navigation`, and `components/route`.
- Driver and parent screens read live Supabase data (no demo data left).
- Styling uses React Native styles with shared tokens in `lib/colors` (NativeWind is not installed).
- The driver app sends GPS every 10 seconds while a route is active, also with the screen locked: `features/driver/gpsTask.ts` runs `expo-location` background updates (`expo-task-manager`) as an Android foreground service. It needs a native build (`npx expo run:android`), not Expo Go.
- Push tokens are registered on launch (`expo-notifications`) and saved to `user_roles.push_token`.
- `/login`, `/driver`, and `/parent` are the stable app paths used by navigation.

## Environment

Copy `.env.example` to `.env.local`. The map needs one Mapbox token:

- `EXPO_PUBLIC_MAPBOX_TOKEN`: a **public** `pk.` token. It ships inside the app, so never put a secret `sk.` token here. For EAS cloud builds, add it with `eas env:create --name EXPO_PUBLIC_MAPBOX_TOKEN --visibility plaintext`.

Building no longer needs a secret download token: since `@rnmapbox/maps` 10.3 the Mapbox SDK downloads without one.

## Commands

```bash
npm run start
npm run typecheck
```

## Over-the-air updates

`expo-updates` lets a JavaScript-only fix reach installed apps without a store release. Each EAS build profile has a channel of the same name (`development`, `preview`, `production`), and `runtimeVersion` follows the app `version` in `app.json`, so an update only goes to builds with the same version.

```bash
npx eas-cli update --channel production --message "Fix ETA rounding"
```

Native changes (a new library, a permission, an `app.json` plugin) still need a new build and store release; bump `version` in `app.json` when you make one.

## Trying the app in Expo Go

Without an EAS build (for example on an iPhone before there is an Apple Developer account), run `npx expo start` in `mobile/` and scan the QR code with the phone's camera; it opens in the Expo Go app. Phone and laptop must be on the same Wi-Fi (otherwise `npx expo start --tunnel`). Expo Go has no Mapbox or background-location native code, so the map screens show a placeholder (`src/lib/mapbox.ts`) and the driver's GPS only runs while the app is open. Everything else works.
