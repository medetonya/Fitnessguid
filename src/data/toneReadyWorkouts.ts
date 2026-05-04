import { getExerciseVideoUrl } from './exerciseVideoLibrary'

export type ExerciseTag = 'Main exercise' | 'Accessory' | 'Isolation' | 'Core exercise'

export interface WorkoutExercise {
  name: string
  icon: string
  tag: ExerciseTag
  zone: string
  sets: string
  reps: string
  videoUrl?: string
}

export interface ToneReadyWorkoutDay {
  id: 'day-1' | 'day-2' | 'day-3'
  dayNumber: 1 | 2 | 3
  title: string
  focus?: string
  duration: string
  format: string
  exercises: WorkoutExercise[]
}

type ToneReadyWorkoutSource = 'home' | 'gym'

const homeToneReadyWorkoutDaysRaw: ToneReadyWorkoutDay[] = [
  {
    id: 'day-1',
    dayNumber: 1,
    title: 'Legs + Glutes (Shape Focus)',
    focus: 'Mandatory warm-up before every workout. Slow tempo and strong muscle connection.',
    duration: '50-60 minutes',
    format: '4 sets x 10-15 reps (exercise-specific targets listed below).',
    exercises: [
      { name: 'Bodyweight Squat', icon: '🏋️', tag: 'Main exercise', zone: 'Legs / Glutes', sets: '4', reps: '15' },
      { name: 'Romanian Deadlift (Bottle/Backpack)', icon: '🏋️', tag: 'Main exercise', zone: 'Hamstrings', sets: '4', reps: '12' },
      { name: 'Reverse Lunges', icon: '🦵', tag: 'Accessory', zone: 'Legs / Glutes', sets: '4', reps: '10 each leg' },
      { name: 'Bulgarian Split Squat', icon: '🏋️', tag: 'Main exercise', zone: 'Legs / Glutes', sets: '4', reps: '10 each leg' },
      { name: 'Glute Bridge', icon: '🍑', tag: 'Isolation', zone: 'Legs / Glutes', sets: '4', reps: '15' },
      { name: 'Side Leg Raises', icon: '🦵', tag: 'Isolation', zone: 'Legs / Glutes', sets: '4', reps: '10 each leg' },
    ],
  },
  {
    id: 'day-2',
    dayNumber: 2,
    title: 'Upper Body + Abs',
    focus: 'Mandatory warm-up before every workout. Upper-body control with core stability.',
    duration: '50-60 minutes',
    format: '4 sets x 10-12 reps; plank 3 x 40 sec; scissors 4 x 30 sec.',
    exercises: [
      { name: 'Push-ups with pause', icon: '💪', tag: 'Main exercise', zone: 'Chest', sets: '4', reps: '10' },
      { name: 'door/bodyweight row', icon: '💪', tag: 'Accessory', zone: 'Back', sets: '4', reps: '12' },
      { name: 'Band Pull-Aparts', icon: '💪', tag: 'Isolation', zone: 'Shoulders', sets: '4', reps: '10' },
      { name: 'Crunches', icon: '🧘', tag: 'Core exercise', zone: 'Core / Abs', sets: '3', reps: '40 sec' },
      { name: 'Arnold Press (Home Version)', icon: '💪', tag: 'Isolation', zone: 'Shoulders', sets: '4', reps: '10' },
      { name: 'Crunches', icon: '🧘', tag: 'Core exercise', zone: 'Core / Abs', sets: '4', reps: '10' },
      { name: 'Crunches', icon: '🧘', tag: 'Core exercise', zone: 'Core / Abs', sets: '4', reps: '30 sec' },
    ],
  },
  {
    id: 'day-3',
    dayNumber: 3,
    title: 'Full Body (Control + Shape)',
    focus: 'Mandatory warm-up before every workout. Full-body control and shape focus.',
    duration: '50-60 minutes',
    format: '4 sets x 10-15 reps; plank 3 x 40 sec.',
    exercises: [
      { name: 'Bodyweight Squat', icon: '🏋️', tag: 'Main exercise', zone: 'Legs / Glutes', sets: '4', reps: '15' },
      { name: 'Romanian Deadlift (Bottle/Backpack)', icon: '🏋️', tag: 'Main exercise', zone: 'Hamstrings', sets: '4', reps: '12' },
      { name: 'Band Pull-Aparts', icon: '💪', tag: 'Isolation', zone: 'Shoulders', sets: '4', reps: '10' },
      { name: 'Crunches', icon: '🧘', tag: 'Core exercise', zone: 'Core / Abs', sets: '3', reps: '40 sec' },
      { name: 'Arnold Press (Home Version)', icon: '💪', tag: 'Isolation', zone: 'Shoulders', sets: '4', reps: '10' },
    ],
  },
]

const gymToneReadyWorkoutDaysRaw: ToneReadyWorkoutDay[] = [
  {
    id: 'day-1',
    dayNumber: 1,
    title: 'Legs + Glutes (Shape Focus)',
    focus: 'Mandatory warm-up before every workout. Slow tempo and strong muscle connection.',
    duration: '50-60 minutes',
    format: '4 sets x 10-12 reps (exercise-specific targets listed below).',
    exercises: [
      { name: 'Goblet Squat with dumbbell', icon: '🏋️', tag: 'Main exercise', zone: 'Legs / Glutes', sets: '4', reps: '12' },
      { name: 'Bulgarian Split Squat (Gym)', icon: '🏋️', tag: 'Main exercise', zone: 'Legs / Glutes', sets: '4', reps: '10 each leg' },
      { name: 'Hip Thrust Machine', icon: '🏋️', tag: 'Main exercise', zone: 'Legs / Glutes', sets: '4', reps: '12' },
      { name: 'Lying Leg Curls', icon: '🏋️', tag: 'Isolation', zone: 'Hamstrings', sets: '4', reps: '12' },
      { name: 'Seated Leg Curls', icon: '🏋️', tag: 'Isolation', zone: 'Hamstrings', sets: '4', reps: '12' },
      { name: 'Incline Bench Crunches', icon: '🧘', tag: 'Core exercise', zone: 'Core / Abs', sets: '4', reps: '12' },
      { name: 'Seated Hip Abduction', icon: '🏋️', tag: 'Isolation', zone: 'Legs / Glutes', sets: '4', reps: '12' },
    ],
  },
  {
    id: 'day-2',
    dayNumber: 2,
    title: 'Upper Body + Core',
    focus: 'Mandatory warm-up before every workout. Upper-body strength and core control.',
    duration: '50-60 minutes',
    format: '4 sets x 10-12 reps.',
    exercises: [
      { name: 'Lat Pulldown', icon: '🏋️', tag: 'Main exercise', zone: 'Back', sets: '4', reps: '12' },
      { name: 'Seated Cable Row', icon: '🏋️', tag: 'Accessory', zone: 'Back', sets: '4', reps: '12' },
      { name: 'Seated Chest Press', icon: '🏋️', tag: 'Main exercise', zone: 'Chest', sets: '4', reps: '12' },
      { name: 'Push-ups (knee, wall, or floor variation based on your level)', icon: '💪', tag: 'Accessory', zone: 'Chest', sets: '4', reps: '10' },
      { name: 'Face Pull', icon: '🏋️', tag: 'Isolation', zone: 'Shoulders', sets: '4', reps: '10' },
      { name: 'Machine Crunch', icon: '🧘', tag: 'Core exercise', zone: 'Core / Abs', sets: '4', reps: '10' },
    ],
  },
  {
    id: 'day-3',
    dayNumber: 3,
    title: 'Full Body',
    focus: 'Mandatory warm-up before every workout. Full-body control and technique focus.',
    duration: '50-60 minutes',
    format: '4 sets x 10-12 reps.',
    exercises: [
      { name: 'Walking Lunges', icon: '🦵', tag: 'Accessory', zone: 'Legs / Glutes', sets: '4', reps: '10 each side' },
      { name: 'Dumbbell Deadlift', icon: '🏋️', tag: 'Main exercise', zone: 'Hamstrings', sets: '4', reps: '10' },
      { name: 'Chest Supported Row', icon: '🏋️', tag: 'Accessory', zone: 'Back', sets: '4', reps: '12' },
      { name: 'Dumbbell Bench Press', icon: '🏋️', tag: 'Main exercise', zone: 'Chest', sets: '4', reps: '10' },
      { name: 'Cable Kickbacks', icon: '🦵', tag: 'Isolation', zone: 'Legs / Glutes', sets: '4', reps: '10' },
      { name: 'Seated Smith Machine Shoulder Press', icon: '🏋️', tag: 'Main exercise', zone: 'Shoulders', sets: '4', reps: '10' },
    ],
  },
]

const withVideoUrls = (days: ToneReadyWorkoutDay[], source: ToneReadyWorkoutSource): ToneReadyWorkoutDay[] => days.map((day) => ({
  ...day,
  exercises: day.exercises.map((exercise) => ({
    ...exercise,
    videoUrl: getExerciseVideoUrl(exercise.name, source),
  })),
}))

export const toneReadyWorkoutDays: ToneReadyWorkoutDay[] = withVideoUrls(homeToneReadyWorkoutDaysRaw, 'home')
export const toneGymReadyWorkoutDays: ToneReadyWorkoutDay[] = withVideoUrls(gymToneReadyWorkoutDaysRaw, 'gym')

export function getToneReadyWorkoutDays(source: ToneReadyWorkoutSource = 'home') {
  return source === 'gym' ? toneGymReadyWorkoutDays : toneReadyWorkoutDays
}

export function getToneReadyWorkoutDay(dayId?: string, source: ToneReadyWorkoutSource = 'home') {
  return getToneReadyWorkoutDays(source).find((day) => day.id === dayId)
}
