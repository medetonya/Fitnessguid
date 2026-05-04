# Video Import Guide (Home / Gym)

This project now supports context-aware video mapping for exercises:
- `home`
- `gym`
- `shared` fallback

## How to prepare files

Create your video files in `public/videos/`.

Recommended naming pattern:
- `home-<exercise-slug>.mp4`
- `gym-<exercise-slug>.mp4`

Examples:
- `public/videos/home-bodyweight-squat.mp4`
- `public/videos/gym-leg-press.mp4`

## Slug rule

Use lowercase and dashes:
- `Bodyweight Squat` -> `bodyweight-squat`
- `Lat Pulldown (wide grip)` -> `lat-pulldown-wide-grip`

## How mapping works

Lookup order for an exercise:
1. Context-specific map (`home` or `gym`)
2. Shared map

This means one shared video can be reused unless a context override exists.

## Your workflow

1. Add/rename video files in `public/videos/`.
2. Send me the list in this format:

```txt
home | Bodyweight Squat | /videos/home-bodyweight-squat.mp4
gym  | Leg Press        | /videos/gym-leg-press.mp4
shared | Plank           | /videos/shared-plank.mp4
```

3. I will insert them into `src/data/exerciseVideoLibrary.ts` safely in one patch.

## Safety

- Adding video mappings does not change routing or business logic.
- Unknown names simply fall back to no video (no crash).
