# Phone Balance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a two-axis, calibrated 10-second phone stability game using the browser Device Orientation API.

**Architecture:** Pure metric functions handle angle math and scoring; a focused composable owns permission and orientation events; a Vue view owns calibration, session timing, feedback, and summary. Existing router, home menu, i18n, settings, and game shell provide integration.

**Tech Stack:** Vue 3, TypeScript, Vue Router, Pinia, vue-i18n, Vitest, DeviceOrientationEvent.

## Global Constraints

- Portrait upright grip only.
- Calibration lasts 2 seconds and averages valid `beta`/`gamma` samples.
- Session lasts 10 seconds without pausing on imbalance.
- Stable threshold is 6° normally and 8° in senior mode.
- An imbalance event requires at least 200ms continuously outside the safe zone.
- No new dependency or Capacitor plugin.
- Sensor listeners and timers must stop on back, unmount, and document hide.

---

### Task 1: Pure balance metrics

**Files:**
- Create: `src/features/games/motor/phone-balance/domain/phone-balance-metrics.ts`
- Test: `src/features/games/motor/phone-balance/__tests__/phone-balance-metrics.spec.ts`

**Interfaces:**
- Produces: `orientationDelta(current, center)`, `tiltMagnitude(delta)`, `isWithinBalanceThreshold(delta, threshold)`, `stabilityPercent(stableMs, totalMs)`.

- [ ] Write failing Vitest cases for two-axis delta, Euclidean magnitude, inclusive threshold, and rounded/clamped percentage.
- [ ] Run `npx vitest --run src/features/games/motor/phone-balance` and confirm missing-module failure.
- [ ] Implement the minimal typed pure functions.
- [ ] Rerun the focused test and confirm PASS.

### Task 2: Device orientation adapter

**Files:**
- Create: `src/features/games/motor/phone-balance/use-device-orientation.ts`

**Interfaces:**
- Produces: `useDeviceOrientation()` returning reactive `beta`, `gamma`, `hasSample`, `error`, plus `start()` and `stop()`.

- [ ] Define local TypeScript typing for optional `DeviceOrientationEvent.requestPermission`.
- [ ] Implement permission request only inside `start()` so iOS receives a user gesture.
- [ ] Ignore null/non-finite samples and remove the listener in `stop()`.
- [ ] Expose user-facing-neutral error codes: `unsupported`, `permission-denied`, `unavailable`.

### Task 3: Phone balance game view

**Files:**
- Create: `src/features/games/motor/phone-balance/PhoneBalanceView.vue`
- Reuse: `src/features/games/shared/SplitChoiceGameShell.vue`
- Reuse: `src/features/games/shared/SplitChoiceTimerChip.vue`

**Interfaces:**
- Consumes: metric functions and `useDeviceOrientation()`.
- Produces: setup, calibration, playing, summary, and error UI.

- [ ] Implement setup and a user-gesture「开始校准」button.
- [ ] During calibration, collect valid samples for 2 seconds and average them; timeout with retry if no sample arrives.
- [ ] During the 10-second session, map `gamma` to horizontal ball movement and `beta` to vertical movement, clamped to the board.
- [ ] Accumulate stable milliseconds, maximum tilt, and debounced imbalance entries at a 50ms sampling interval.
- [ ] Show textual「稳定」/「请调整」feedback, top timer, and senior-mode sizing/threshold.
- [ ] Show summary fields: stable seconds, stability percent, imbalance count, maximum tilt; support replay/end.
- [ ] Stop every timer and orientation listener on back, unmount, and document hidden.

### Task 4: App integration and localization

**Files:**
- Modify: `src/app/router/route-names.ts`
- Modify: `src/app/router/index.ts`
- Modify: `src/features/home/HomeView.vue`
- Modify: `src/locales/zh.json`
- Modify: `src/locales/en.json`
- Modify: `src/locales/ko.json`
- Modify: `src/features/home/__tests__/HomeView.spec.ts`

**Interfaces:**
- Produces: `/games/phone-balance` and a third home menu item.

- [ ] Add failing HomeView assertion for「手机平衡」.
- [ ] Run the HomeView test and confirm it fails because the entry is absent.
- [ ] Add `phoneBalance` route constants, lazy route, and home item.
- [ ] Add complete zh/en/ko setup, calibration, play, error, and summary strings.
- [ ] Rerun the HomeView test and confirm PASS.

### Task 5: Verification

**Files:**
- Check all modified files.

- [ ] Run `npm run type-check`.
- [ ] Run `npm run test:unit -- --run`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Check IDE lints for new and modified files.
- [ ] Report browser sensor limitations and the need for HTTPS/Capacitor true-device testing.
