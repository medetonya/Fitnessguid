# Fitnessguide Agent Context

## 1) Project Snapshot
- App type: fitness training web app (mobile-first), with auth, workout flows, nutrition, support, progress, and admin.
- Frontend: React + TypeScript + Vite + Tailwind.
- Backend/auth: Supabase.
- Current state: many pages are implemented visually, build is passing, but core workout-builder interaction is partially disconnected from active routes.

## 2) Actual Runtime Stack (from package.json)
- React: 19.2.4
- React DOM: 19.2.4
- React Router DOM: 7.13.1
- TypeScript: 5.9.x
- Vite: 8.x
- Supabase JS: 2.99.x
- Tailwind CSS: 4.2.x

Note: README still mentions React 18 + Router v6 (documentation drift).

## 3) Run and Validate
- Install: npm install
- Desktop dev: npm run dev
- Mobile LAN dev: npm run dev:mobile
- Build check: npm run build
- Lint: npm run lint

Environment:
- Required vars in .env.local:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
- Optional but used by auth flow:
  - VITE_APP_URL
  - VITE_PRIMARY_ADMIN_EMAIL

## 4) Routing and Flow Overview
Main route map is centralized in src/App.tsx.

Important groups:
- Public: /, /signup, /signin, /forgot-password, /reset-password
- Protected dashboard: /dashboard
- Home workouts branch: /workouts/home/*
- Gym workouts branch: /workouts/gym/*
- Nutrition parity routes exist for both home and gym.
- Progress and support routes exist.

Protection:
- src/components/ProtectedRoute.tsx enforces:
  - auth presence
  - optional approval (requireApproved)
  - optional role check (admin)

## 5) Auth/Supabase State
Auth context:
- src/context/AuthContext.tsx

What is already implemented:
- signup/signin/signout
- resetPassword email dispatch with redirectTo = APP_URL or origin + /reset-password
- auto-seeding admin role for PRIMARY_ADMIN_EMAIL on signup and missing-profile signin path

Supabase client:
- src/lib/supabase.ts
- throws immediately when env keys are missing

Reset page:
- src/pages/ResetPasswordPage.tsx handles multiple token styles:
  - token_hash + type=recovery (verifyOtp)
  - access_token/refresh_token in URL hash (setSession)
  - code in query (exchangeCodeForSession)

## 6) Critical Functional Gap (Highest Priority)
Symptom reported by user:
- Exercises cannot be selected; Start Workout cannot proceed.

Root cause found in codebase:
1. Interactive builder component exists:
   - src/components/ExerciseBuilderScreen.tsx
   - Contains selectable cards, selectedCount, minimum 5 gate, localStorage persistence under prefix builder-workout:, and navigation with key query param.
2. Training mode expects that persisted payload:
   - src/pages/BuilderTrainingModePage.tsx reads localStorage key builder-workout:{key}
3. BUT active route pages are static/non-interactive versions:
   - src/pages/WorkoutBuilderFullBodyPage.tsx
   - src/pages/WorkoutBuilderUpperBodyPage.tsx
   - src/pages/WorkoutBuilderLowerBodyPage.tsx
   - src/pages/WorkoutBuilderToneFullBodyPage.tsx
   - src/pages/WorkoutBuilderToneUpperBodyPage.tsx
   - src/pages/WorkoutBuilderToneLowerBodyPage.tsx
- These pages render exercise cards as plain buttons with no selection state and disabled Start button.
- So BuilderTrainingModePage receives no stored workout and cannot represent intended flow.

Impact:
- Core workout builder flow is blocked on both desktop and mobile.

## 7) Nutrition Status
- Nutrition branch pages are present for both Home and Gym.
- Live calorie/macro calculator exists in src/pages/CalorieMacroFormulasPage.tsx.
- Path parity is handled by reading pathname and selecting basePath.

## 8) Suggested Next Implementation Order
1. Replace static builder pages with wrappers around ExerciseBuilderScreen.
2. For each builder route, pass explicit props:
   - groups data
   - storageKey (unique per mode/body split and branch if needed)
   - trainingPath (current BuilderTrainingMode route)
   - modePreset
   - backTo path
3. Verify full flow end-to-end:
   - select >= 5 exercises
   - Start Workout enabled
   - data persisted in localStorage
   - training screen loads selected exercises
4. Keep Home/Gym parity and avoid duplicated dead UI implementations.
5. After fix, run mobile + desktop manual checks for tap/click behavior.

## 9) Known Drift / Risks
- Documentation drift:
  - README stack versions do not match actual dependencies.
- Tooling assumption drift:
  - ripgrep (rg) is not available in current shell; use grep or VS Code search tools.
- Possible UX/perf drift:
  - many large page files with repeated structures increase regression risk.

## 10) Quick Verification Checklist for Next Agent
- Build passes: npm run build
- Each builder page allows selecting and deselecting cards
- Counter updates correctly
- Start button unlocks only at 5+
- Training mode shows non-empty selected exercises
- Back navigation from training returns to correct builder page
- Home and Gym paths both behave identically
- Mobile tap interaction works (no click-only assumptions)

## 11) Most Relevant Files to Start With
- src/components/ExerciseBuilderScreen.tsx
- src/pages/BuilderTrainingModePage.tsx
- src/pages/WorkoutBuilderFullBodyPage.tsx
- src/pages/WorkoutBuilderUpperBodyPage.tsx
- src/pages/WorkoutBuilderLowerBodyPage.tsx
- src/pages/WorkoutBuilderToneFullBodyPage.tsx
- src/pages/WorkoutBuilderToneUpperBodyPage.tsx
- src/pages/WorkoutBuilderToneLowerBodyPage.tsx
- src/App.tsx
- src/context/AuthContext.tsx
- src/pages/ResetPasswordPage.tsx

## 12) Short Handoff Summary
The app is structurally rich and compiles cleanly, but the most important user flow (custom workout builder) is broken because the interactive selection component is not wired into the active route pages. Fixing this wiring should be treated as immediate priority before further feature expansion.
