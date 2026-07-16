# ZS-BRAIN (Vue 3)

Web rewrite of the Flutter [zs-brain](https://github.com/) brain-training app. This repo mirrors the Flutter project's feature-first layout and routes while games and data layers are migrated incrementally.

## Stack

| Capability | Choice |
|------------|--------|
| UI | Vue 3 + Vite |
| State | Pinia |
| Routing | Vue Router |
| i18n | vue-i18n (zh / en / ko) |
| Preferences | @capacitor/preferences |
| Structured storage | localforage (IndexedDB) |
| Scoring | `packages/scoring` (TypeScript port of Flutter `packages/scoring`) |
| Mobile packaging | Capacitor (iOS / Android) |

## Prerequisites

- Node.js `^22.18.0` or `>=24.12.0` (see `package.json` engines)
- npm 10+

## Commands

```bash
npm install
npm run dev          # local dev server
npm run build        # production build to dist/
npm run test:unit    # Vitest (app + scoring package)
npm run lint         # oxlint + eslint
./scripts/verify.sh  # lint + test + build
```

## Capacitor (mobile)

Build the web app first, then add native platforms:

```bash
npm run build
npx cap add ios
npx cap add android
npx cap sync
npx cap open ios     # or android
```

Configuration: [`capacitor.config.ts`](capacitor.config.ts) (`appId: com.zsbrain.app`, `webDir: dist`).

## Project layout

```
src/
  app/          # router, theme, settings store
  core/         # storage, auth stub
  features/     # home, category, today, calendar, analytics, family, settings, games
  locales/         # vue-i18n messages
packages/
  scoring/      # pure scoring logic (shared with games)
```

Routes align with the Flutter app (`/`, `/training`, `/today-training`, `/calendar`, `/analytics`, `/family`, `/settings`, game paths).

## Mapping from Flutter

| Flutter | This repo |
|---------|-----------|
| `flutter_riverpod` | Pinia (`useAppSettingsStore`) |
| `go_router` | Vue Router (`src/app/router`) |
| `AppLocalizations` + ARB | `src/locales/*.json` |
| `SharedPreferences` | Capacitor Preferences |
| `Hive` | localforage |
| `packages/scoring` (Dart) | `packages/scoring` (TS) |

## Senior mode

Toggle in Settings (`长者模式`). When enabled, root `font-size` scales by 1.18 via `--font-scale` in [`src/app/theme/app-theme.css`](src/app/theme/app-theme.css).

## Next migration steps

1. Category catalog + `game_registry` metadata
2. Simple games (number-compare, color-tap)
3. Complex games (whack-a-mole, position-flip-board)
4. Canvas runner (t-rex-runner)
5. Today / calendar / analytics / family data layers
