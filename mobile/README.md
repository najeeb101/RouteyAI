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
    data/
      demoRoute.ts        # leftover — only LiveMapPreview still uses it
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
- Driver and parent screens read live Supabase data. The only remaining demo data is `data/demoRoute.ts`, used by `components/route/LiveMapPreview.tsx`.
- Styling uses React Native styles with shared tokens in `lib/colors` (NativeWind is not installed).
- The driver app sends GPS every 10 seconds while a route is active (`expo-location`).
- Push tokens are registered on launch (`expo-notifications`) and saved to `user_roles.push_token`.
- `/login`, `/driver`, and `/parent` are the stable app paths used by navigation.

## Commands

```bash
npm run start
npm run typecheck
```
