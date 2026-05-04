import { getExerciseVideoUrl } from './exerciseVideoLibrary'

export type FatLossExerciseTag = 'Main exercise' | 'Accessory' | 'Isolation' | 'Core exercise' | 'Cardio'

export interface FatLossWorkoutExercise {
  name: string
  icon: string
  tag: FatLossExerciseTag
  zone: string
  sets: string
  reps: string
  videoUrl?: string
}

export interface FatLossReadyWorkoutDay {
  id: 'day-1' | 'day-2' | 'day-3'
  dayNumber: 1 | 2 | 3
  title: string
  structure?: string
  duration: string
  format: string
  exercises: FatLossWorkoutExercise[]
}

type FatLossReadyWorkoutSource = 'home' | 'gym'

const homeFatLossReadyWorkoutDaysRaw: FatLossReadyWorkoutDay[] = [
  {
    id: 'day-1',
    dayNumber: 1,
    title: 'Legs + Glutes + Shoulders + Chest + Core + Dynamic',
    structure: 'warm-up -> main block -> cardio finisher -> cool-down',
    duration: '50-60 minutes',
    format: '3 rounds x 40 sec work per exercise; 1.5 min rest after each full round',
    exercises: [
      { name: 'Bodyweight Squat', icon: '🏋️', tag: 'Main exercise', zone: 'Legs / Glutes', sets: '3', reps: '40 sec' },
      { name: 'Glute Bridge', icon: '🍑', tag: 'Isolation', zone: 'Legs / Glutes', sets: '3', reps: '40 sec' },
      { name: 'Push-Ups', icon: '💪', tag: 'Main exercise', zone: 'Chest', sets: '3', reps: '40 sec' },
      { name: 'Alternating Biceps Curl', icon: '💪', tag: 'Accessory', zone: 'Arms - Biceps', sets: '3', reps: '40 sec' },
      { name: 'Burpees', icon: '🔥', tag: 'Cardio', zone: 'Cardio', sets: '3', reps: '40 sec' },
      { name: 'Fast Plank Steps', icon: '🧘', tag: 'Core exercise', zone: 'Core / Abs', sets: '3', reps: '40 sec' },
    ],
  },
  {
    id: 'day-2',
    dayNumber: 2,
    title: 'Hamstrings + Arms + Back + Core + Dynamic',
    structure: 'warm-up -> circular main block -> cardio finisher -> cool-down',
    duration: '50-60 minutes',
    format: '3 rounds x 40 sec work per exercise; 1.5 min rest after each full round',
    exercises: [
      { name: 'Romanian Deadlift (Bottle/Backpack)', icon: '🏋️', tag: 'Main exercise', zone: 'Hamstrings', sets: '3', reps: '40 sec' },
      { name: 'Leg Slides (towel leg curls)', icon: '🏋️', tag: 'Isolation', zone: 'Hamstrings', sets: '3', reps: '40 sec' },
      { name: 'Band Pull-Aparts', icon: '💪', tag: 'Accessory', zone: 'Shoulders', sets: '3', reps: '40 sec' },
      { name: 'Resistance Band Rows', icon: '💪', tag: 'Accessory', zone: 'Back', sets: '3', reps: '40 sec' },
      { name: 'Crunches', icon: '🧘', tag: 'Core exercise', zone: 'Core / Abs', sets: '3', reps: '40 sec' },
      { name: 'Jump Squat', icon: '🦵', tag: 'Accessory', zone: 'Legs / Glutes', sets: '3', reps: '40 sec' },
    ],
  },
  {
    id: 'day-3',
    dayNumber: 3,
    title: 'Legs + Hamstrings + Back + Chest + Core + Dynamic',
    structure: 'warm-up -> circular main block -> cardio finisher -> cool-down',
    duration: '50-60 minutes',
    format: '3 rounds x 40 sec work per exercise; 1.5 min rest after each full round',
    exercises: [
      { name: 'Bulgarian Split Squat', icon: '🏋️', tag: 'Main exercise', zone: 'Legs / Glutes', sets: '3', reps: '40 sec' },
      { name: 'Single-Leg RDL', icon: '🏋️', tag: 'Main exercise', zone: 'Hamstrings', sets: '3', reps: '40 sec' },
      { name: 'Incline Push-Ups', icon: '💪', tag: 'Accessory', zone: 'Chest', sets: '3', reps: '40 sec' },
      { name: 'stend Dumbbell/Bottle Row', icon: '💪', tag: 'Accessory', zone: 'Back', sets: '3', reps: '40 sec' },
      { name: 'Single Leg Raises', icon: '🧘', tag: 'Core exercise', zone: 'Core / Abs', sets: '3', reps: '40 sec' },
      { name: 'Burpees', icon: '🔥', tag: 'Cardio', zone: 'Cardio', sets: '3', reps: '40 sec' },
      { name: 'High Knees', icon: '🏃', tag: 'Cardio', zone: 'Cardio', sets: '3', reps: '40 sec' },
    ],
  },
]

const gymFatLossReadyWorkoutDaysRaw: FatLossReadyWorkoutDay[] = [
  {
    id: 'day-1',
    dayNumber: 1,
    title: 'Legs + Back + Chest + Core + Dynamic',
    structure: 'warm-up -> main block -> cardio finisher -> cool-down (Cardio finisher: 15 min elliptical, stair climber, or bike)',
    duration: '50-60 minutes',
    format: '3 rounds x 40 sec work per exercise; 1.5 min rest after each full round',
    exercises: [
      { name: 'Goblet Squat', icon: '🏋️', tag: 'Main exercise', zone: 'Legs / Glutes', sets: '3', reps: '40 sec' },
      { name: 'Walking Lunges', icon: '🏋️', tag: 'Main exercise', zone: 'Legs / Glutes', sets: '3', reps: '40 sec' },
      { name: 'Lat Pulldown (wide grip)', icon: '🏋️', tag: 'Main exercise', zone: 'Back', sets: '3', reps: '40 sec' },
      { name: 'Pec Deck Machine', icon: '🏋️', tag: 'Isolation', zone: 'Chest', sets: '3', reps: '40 sec' },
      { name: 'Bench Crunches', icon: '🧘', tag: 'Core exercise', zone: 'Core / Abs', sets: '3', reps: '40 sec' },
      { name: 'Burpees', icon: '🔥', tag: 'Cardio', zone: 'Cardio', sets: '3', reps: '40 sec' },
    ],
  },
  {
    id: 'day-2',
    dayNumber: 2,
    title: 'Hamstrings + Glutes + Arms + Core + Dynamic',
    structure: 'warm-up -> circular main block -> cardio finisher -> cool-down (Cardio finisher: 15 min elliptical, stair climber, or bike)',
    duration: '50-60 minutes',
    format: '3 rounds x 40 sec work per exercise; 1.5 min rest after each full round',
    exercises: [
      { name: 'Machine Hip Thrust', icon: '🏋️', tag: 'Main exercise', zone: 'Legs / Glutes', sets: '3', reps: '40 sec' },
      { name: 'Romanian Deadlift with dumbbell/barbell', icon: '🏋️', tag: 'Main exercise', zone: 'Hamstrings', sets: '3', reps: '40 sec' },
      { name: 'Dumbbell Biceps Curl', icon: '💪', tag: 'Accessory', zone: 'Arms', sets: '3', reps: '40 sec' },
      { name: 'Triceps Pushdown (Cable)', icon: '💪', tag: 'Accessory', zone: 'Arms', sets: '3', reps: '40 sec' },
      { name: 'Crunches', icon: '🧘', tag: 'Core exercise', zone: 'Core / Abs', sets: '3', reps: '40 sec' },
      { name: 'High Knees', icon: '🏃', tag: 'Cardio', zone: 'Cardio', sets: '3', reps: '40 sec' },
    ],
  },
  {
    id: 'day-3',
    dayNumber: 3,
    title: 'Legs + Glutes + Back + Shoulders + Core + Dynamic',
    structure: 'warm-up -> circular main block -> cardio finisher -> cool-down (Cardio finisher: 15 min elliptical, stair climber, or bike)',
    duration: '50-60 minutes',
    format: '3 rounds x 40 sec work per exercise; 1.5 min rest after each full round',
    exercises: [
      { name: 'Leg Press', icon: '🏋️', tag: 'Main exercise', zone: 'Legs / Glutes', sets: '3', reps: '40 sec' },
      { name: 'Bulgarian Split Squat (Gym)', icon: '🏋️', tag: 'Main exercise', zone: 'Legs / Glutes', sets: '3', reps: '10 each leg' },
      { name: 'Cable Kickback', icon: '🦵', tag: 'Isolation', zone: 'Legs / Glutes', sets: '3', reps: '40 sec' },
      { name: 'T-Bar Row', icon: '🏋️', tag: 'Main exercise', zone: 'Back', sets: '3', reps: '40 sec' },
      { name: 'Face Pulls', icon: '🏋️', tag: 'Isolation', zone: 'Shoulders', sets: '3', reps: '40 sec' },
      { name: 'Plank', icon: '🧘', tag: 'Core exercise', zone: 'Core / Abs', sets: '3', reps: '40 sec' },
      { name: 'Jumping Jacks', icon: '🏃', tag: 'Cardio', zone: 'Cardio', sets: '3', reps: '40 sec' },
    ],
  },
]

const withVideoUrls = (days: FatLossReadyWorkoutDay[], source: FatLossReadyWorkoutSource): FatLossReadyWorkoutDay[] => days.map((day) => ({
  ...day,
  exercises: day.exercises.map((exercise) => ({
    ...exercise,
    videoUrl: getExerciseVideoUrl(exercise.name, source),
  })),
}))

export const fatLossReadyWorkoutDays: FatLossReadyWorkoutDay[] = withVideoUrls(homeFatLossReadyWorkoutDaysRaw, 'home')
export const fatLossGymReadyWorkoutDays: FatLossReadyWorkoutDay[] = withVideoUrls(gymFatLossReadyWorkoutDaysRaw, 'gym')

export function getFatLossReadyWorkoutDays(source: FatLossReadyWorkoutSource = 'home') {
  return source === 'gym' ? fatLossGymReadyWorkoutDays : fatLossReadyWorkoutDays
}

export function getFatLossReadyWorkoutDay(dayId?: string, source: FatLossReadyWorkoutSource = 'home') {
  return getFatLossReadyWorkoutDays(source).find((day) => day.id === dayId)
}
