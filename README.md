# ZS-BRAIN (Vue 3)

Simplified Vue rewrite of the Flutter [zs-brain](https://github.com/) brain-training app. Home screen offers two games: **Number Compare** and **Color Tap**, plus Settings.

## Stack

| Capability | Choice |
|------------|--------|
| UI | Vue 3 + Vite |
| State | Pinia |
| Routing | Vue Router |
| i18n | vue-i18n (zh / en / ko) |
| Preferences | @capacitor/preferences |
| Mobile packaging | Capacitor (iOS / Android) |

## Prerequisites

- Node.js `^22.18.0` or `>=24.12.0` (see `package.json` engines)
- npm 10+

## Commands

```bash
npm install
npm run dev          # local dev server
npm run build        # production build to dist/
npm run test:unit    # Vitest
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
  features/     # home, settings, games (number-compare, color-tap)
  locales/      # vue-i18n messages
```

Routes: `/`, `/settings`, `/games/number-compare`, `/games/color-tap`.

## Mapping from Flutter

| Flutter | This repo |
|---------|-----------|
| `flutter_riverpod` | Pinia (`useAppSettingsStore`) |
| `go_router` | Vue Router (`src/app/router`) |
| `AppLocalizations` + ARB | `src/locales/*.json` |
| `SharedPreferences` | Capacitor Preferences |

## Senior mode

Toggle in Settings (`长者模式`). When enabled, root `font-size` scales by 1.18 via `--font-scale` in [`src/app/theme/app-theme.css`](src/app/theme/app-theme.css).
