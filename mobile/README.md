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

Copy `.env.example` to `.env.local`. Two Mapbox tokens are needed:

- `EXPO_PUBLIC_MAPBOX_TOKEN`: a **public** `pk.` token. It ships inside the app.
- `RNMAPBOX_MAPS_DOWNLOAD_TOKEN`: a **secret** `sk.` token with the `DOWNLOADS:READ` scope, read by `app.config.js` at build time to download the Mapbox SDK. Keep it out of `app.json` and `eas.json`; for EAS cloud builds store it with `eas env:create --name RNMAPBOX_MAPS_DOWNLOAD_TOKEN --visibility secret`.

## Commands

```bash
npm run start
npm run typecheck
```
