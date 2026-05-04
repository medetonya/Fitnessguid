# Builder Audit Checklist (Home/Gym)

## Status Summary
- Centralized datasets: implemented
- Split filtering (Full/Upper/Lower): implemented
- Card UI requirements (name/category/type/select/info): implemented
- Min 5 exercises before start: implemented
- Training mode data handoff hardening: implemented
- Build status: passing

## 1) Dataset Source of Truth
- File: `src/data/workoutBuilderExercises.ts`
- Implemented datasets:
  - Home / Fat Loss
  - Home / Tone
  - Gym / Gain-Sculpt (mapped to `tone` goal in code)
  - Gym / Fat-Loss-Tone (mapped to `fat-loss` goal in code)

## 2) Filtering Rules
Implemented in `getWorkoutBuilderGroups(section, goal, split)`:
- Full Body: all categories
- Upper Body: Chest, Back, Shoulders, Arms, Core / Abs
- Lower Body: Legs / Glutes, Hamstrings, Core / Abs

## 3) Builder Page Wiring
All builder pages now use `getWorkoutBuilderGroups(...)` and do not store local hardcoded pools:
- `src/pages/WorkoutBuilderFullBodyPage.tsx`
- `src/pages/WorkoutBuilderUpperBodyPage.tsx`
- `src/pages/WorkoutBuilderLowerBodyPage.tsx`
- `src/pages/WorkoutBuilderToneFullBodyPage.tsx`
- `src/pages/WorkoutBuilderToneUpperBodyPage.tsx`
- `src/pages/WorkoutBuilderToneLowerBodyPage.tsx`

## 4) Card Requirements
Implemented in `src/components/ExerciseBuilderScreen.tsx`:
- Exercise name: shown
- Category: shown as `Category: ...`
- Type label under title: shown (`main/accessory/isolation/core/cardio`)
- Selected state: shown (check + selected card state)
- Info/technique button: shown

## 5) Selection and Start Rules
Implemented in `src/components/ExerciseBuilderScreen.tsx`:
- Minimum selected exercises = 5
- Start button disabled until threshold met
- Selected exercises persisted into localStorage key `builder-workout:{storageKey}`

## 6) Training Mode Data Handoff
Implemented in `src/pages/BuilderTrainingModePage.tsx`:
- Parses stored payload
- Validates `selectedExercises` is non-empty array
- Normalizes fallback values for mode/sourcePath/createdAt
- Renders exercise name, label, sets, reps, next/previous, timer

## 7) Validation Result
- `npm run build`: pass
- `npm run lint`: pass

## 8) Manual QA Still Needed
1. Home / Fat Loss / Full, Upper, Lower: verify expected category visibility and no forbidden categories.
2. Home / Tone / Full, Upper, Lower: same verification.
3. Gym / both goals / Full, Upper, Lower: same verification.
4. Selection flow: select 5+, start training, verify not redirected to dashboard and no empty session behavior.
5. Mobile touch checks: tap select/unselect + info modal + start transition.

## 9) Launch Order (Video Last)
Priority is changed: video content is the final release step.

Phase A - Core Release Readiness (now)
1. Auth and access QA: signup/signin/reset + pending/approved user states.
2. Navigation QA: no overlapping controls, all key routes reachable on mobile and desktop.
3. Workout flows QA: ready plans, builder flows, finish/restart behavior, progress updates.
4. Notes QA: create/update notes in training and verify display in progress tracking.

Phase A progress update
- Completed: static audit of auth/route guards and admin route wiring.
- Completed: lint blockers fixed in training pages (hook ordering + state handling).
- Completed: baseline validation (`npm run lint && npm run build` passes).
- Completed: preview route smoke-check (core public/protected paths return HTTP 200 in production preview).
- Pending manual QA: real sign-up/sign-in/reset flow in browser and role transitions in Supabase.

Phase B - Production Safety
1. Verify Supabase policies for users/admin access and progress data.
2. Confirm env setup for Vercel and Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
3. Run final build + preview smoke test before deploy.

Phase B notes
- RLS and policies are already present in `supabase-migrations.sql`.
- Setup docs must reference `supabase-migrations.sql` (single source) to avoid confusion.
- Production preview smoke-check passed (`npm run preview -- --host 127.0.0.1 --port 4173`).

Phase C - Deploy Candidate
1. Deploy to preview/staging.
2. Run short regression pass with real accounts (user + admin).
3. Approve production release.

Phase D - Video (final step)
1. Fill `src/data/exerciseVideoLibrary.ts` with links.
2. Verify videos in:
  - Info panel in builder (`src/components/ExerciseBuilderScreen.tsx`)
  - Live training screens (`BuilderTrainingModePage`, `FatLossTrainingModePage`, `ToneTrainingModePage`)
3. Final visual check for load speed and mobile rendering.

## 10) Phase A Rapid Manual QA (12 Steps)
Target time: 15-20 minutes

Prep
1. Run app: `npm run dev`.
2. Open app on desktop and phone viewport.
3. Keep Supabase SQL Editor open with `ADMIN_COMMANDS.sql`.

Auth and Access
4. Sign up with a fresh test email. Expected: redirect to `/` with "Awaiting Approval".
5. Sign out and sign in with same test account. Expected: still "Awaiting Approval".
6. In SQL, set `status='approved'` for test account. Refresh app. Expected: protected routes open.
7. In SQL, set `role='admin'` + `status='approved'`. Open `/admin`. Expected: admin page loads.
8. Revert test account to `role='user'`. Open `/admin`. Expected: redirect away from admin page.

Navigation and Layout
9. Check top-right controls on key pages (`/dashboard`, `/workouts/home`, `/workouts/gym`, training pages). Expected: no overlap with content.
10. Verify route links from dashboard to Home/Gym/Progress and back. Expected: no dead routes.

Workout and Notes Flow
11. Open builder workout, select >=5 exercises, start training, finish workout. Expected: no redirect glitches, finish screen appears.
12. Add notes on 2-3 exercises, open progress tracking. Expected: latest notes are visible and ordered by date.

Pass Criteria for Phase A
- Auth flow works (signup/signin/reset links, pending/approved behavior).
- Role gating works (`/admin` only for admin).
- No blocking UI overlaps on mobile/desktop in top navigation zones.
- Workout completion and notes flow works end-to-end.
