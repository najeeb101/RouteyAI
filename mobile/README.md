# RouteyAI Mobile App

This folder is the Expo / React Native app for mobile driver and parent workflows. It mirrors the product hierarchy from `Docs/Claude.md`, adapted for Expo Router.

## Structure

```txt
mobile/
  src/
    app/
      (auth)/
        login.tsx
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
      demoRoute.ts
    features/
      auth/screens/
      driver/screens/
      parent/screens/
    lib/
      navigation/
      supabase.ts
    types/
```

## Notes

- Route files stay thin and import screens from `features/*/screens`.
- Shared UI lives in `components/primitives`, `components/navigation`, and `components/route`.
- Demo data is centralized in `data/demoRoute.ts` so it can later be replaced by Supabase queries.
- `/login`, `/driver`, and `/parent` are the stable app paths used by navigation.

## Commands

```bash
npm run start
npm run typecheck
```
