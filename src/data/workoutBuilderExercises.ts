import type { BuilderExercise, BuilderExerciseTag, ExerciseLevel } from '../components/ExerciseBuilderScreen'
import { getExerciseInfo } from './exerciseInfoLibrary'
import { getExerciseVideoUrl } from './exerciseVideoLibrary'

type BuilderSection = 'home' | 'gym'
type BuilderGoal = 'fat-loss' | 'tone'
type BuilderSplit = 'full-body' | 'upper-body' | 'lower-body'

type ExerciseTypeLabel = BuilderExerciseTag

interface PoolExercise {
  name: string
  tag: ExerciseTypeLabel
  levels?: ExerciseLevel[]
  icon?: string
}

interface PoolCategory {
  category: string
  exercises: PoolExercise[]
}

const upperCategories = new Set(['Chest', 'Back', 'Shoulders', 'Arms - Biceps', 'Arms - Triceps', 'Core / Abs'])
const lowerCategories = new Set(['Legs / Glutes', 'Hamstrings', 'Calves', 'Core / Abs'])
const accessoryOnlyCategories = new Set(['Shoulders', 'Arms - Biceps', 'Arms - Triceps'])
const normalizeBuilderExerciseName = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ')

const familyModifierTokens = new Set([
  'assisted',
  'arm',
  'bar',
  'barbell',
  'bb',
  'bodyweight',
  'bottle',
  'cable',
  'chair',
  'close',
  'db',
  'decline',
  'door',
  'dumbbell',
  'ez',
  'flat',
  'forward',
  'grip',
  'gym',
  'handle',
  'home',
  'incline',
  'knee',
  'kneeling',
  'loaded',
  'low',
  'machine',
  'neutral',
  'one',
  'overhand',
  'plate',
  'playground',
  'reverse',
  'ring',
  'rope',
  'seated',
  'single',
  'smith',
  'sofa',
  'standing',
  'supported',
  'towel',
  'trx',
  'underhand',
  'v',
  'variation',
  'wide',
])

const normalizeFamilyAliases = (familyKey: string) => {
  const tokens = familyKey.split(' ').filter(Boolean)
  const hasUpToken = tokens.includes('up') || tokens.includes('ups')
  const hasPullToken = tokens.includes('pull') || tokens.includes('pullup') || tokens.includes('pullups')
  const hasChinToken = tokens.includes('chin') || tokens.includes('chinup') || tokens.includes('chinups')

  if (hasUpToken && (hasPullToken || hasChinToken)) {
    return 'pull ups'
  }

  return familyKey
}

const getExerciseFamilyKey = (value: string) => {
  const normalized = normalizeBuilderExerciseName(value)
  const familyKey = normalized
    .split(' ')
    .filter(Boolean)
    .filter((token) => !familyModifierTokens.has(token))
    .join(' ')

  return normalizeFamilyAliases(familyKey.length > 0 ? familyKey : normalized)
}

const compareExerciseNames = (left: string, right: string) => {
  const leftFamily = getExerciseFamilyKey(left)
  const rightFamily = getExerciseFamilyKey(right)
  const familyCompare = leftFamily.localeCompare(rightFamily)
  if (familyCompare !== 0) {
    return familyCompare
  }

  return normalizeBuilderExerciseName(left).localeCompare(normalizeBuilderExerciseName(right))
}

const tagOrder: Record<BuilderExerciseTag, number> = {
  'Main exercise': 1,
  Isolation: 2,
  Accessory: 3,
  'Core exercise': 4,
  Cardio: 5,
}

const compareBuilderExercises = (left: BuilderExercise, right: BuilderExercise) => {
  const tagCompare = tagOrder[left.tag] - tagOrder[right.tag]
  if (tagCompare !== 0) {
    return tagCompare
  }

  return compareExerciseNames(left.name, right.name)
}

const forcedTagByExerciseName: Partial<Record<string, BuilderExerciseTag>> = {
  [normalizeBuilderExerciseName('Leg Slides (towel leg curls)')]: 'Isolation',
  [normalizeBuilderExerciseName('Cable Hip Abduction')]: 'Isolation',
}

const withDefaults = (exercise: PoolExercise, category: string, section: BuilderSection): BuilderExercise => {
  const normalizedExerciseName = normalizeBuilderExerciseName(exercise.name)
  const forcedTag = forcedTagByExerciseName[normalizedExerciseName]
  const normalizedTag: BuilderExerciseTag =
    forcedTag ?? (section === 'gym' && accessoryOnlyCategories.has(category) ? 'Accessory' : exercise.tag)
  const normalizedLevels: ExerciseLevel[] = section === 'home' ? ['Beginner'] : (exercise.levels ?? [])
  const info = getExerciseInfo(exercise.name, category, normalizedTag)
  const zone =
    normalizedExerciseName === normalizeBuilderExerciseName('Close-Grip Bench Press')
      ? 'Triceps / Chest'
      : normalizedExerciseName === normalizeBuilderExerciseName('Reverse Pec Deck') ||
          normalizedExerciseName === normalizeBuilderExerciseName('Face Pulls')
        ? 'Back / Shoulders'
        : category

  return {
    ...exercise,
    tag: normalizedTag,
    levels: normalizedLevels,
    icon: exercise.icon ?? '🏋️',
    zone,
    sets: '3-4',
    reps: '10-12',
    videoUrl: getExerciseVideoUrl(exercise.name, section),
    muscles: info.muscles,
    technique: info.technique,
  }
}

const homeFatLossPool: PoolCategory[] = [
  {
    category: 'Legs / Glutes',
    exercises: [
      { name: 'Bodyweight Squat', tag: 'Main exercise', icon: '🏋️' },
      { name: 'Jump Squat', tag: 'Accessory', icon: '🦵' },
      { name: 'Wall Sit', tag: 'Accessory', icon: '🦵' },
      { name: 'Step-Ups', tag: 'Main exercise', icon: '🦵' },
      { name: 'Bulgarian Split Squat', tag: 'Main exercise', icon: '🏋️' },
      { name: 'Reverse Lunges', tag: 'Main exercise', icon: '🦵' },
      { name: 'Forward Lunges', tag: 'Main exercise', icon: '🦵' },
      { name: 'Walking Lunges', tag: 'Main exercise', icon: '🦵' },
      { name: 'Sumo Squat', tag: 'Main exercise', icon: '🏋️' },
      { name: 'Glute Bridge', tag: 'Main exercise', icon: '🍑' },
      { name: 'Single-Leg Glute Bridge', tag: 'Isolation', icon: '🍑' },
      { name: 'Hip Thrust (Chair/Sofa)', tag: 'Main exercise', icon: '🍑' },
      { name: 'Donkey Kicks', tag: 'Isolation', icon: '🦵' },
      { name: 'Fire Hydrants', tag: 'Isolation', icon: '🦵' },
      { name: 'Side-Lying Leg Raises', tag: 'Isolation', icon: '🦵' },
      { name: 'Clamshells', tag: 'Isolation', icon: '🦵' },
      { name: 'Wall Glute Squeeze (Isometric)', tag: 'Isolation', icon: '🦵' },
      { name: 'Band Squats', tag: 'Main exercise', icon: '🦵' },
      { name: 'Band Lateral Walks', tag: 'Isolation', icon: '🦵' },
    ],
  },
  {
    category: 'Hamstrings',
    exercises: [
      { name: 'Single-Leg RDL', tag: 'Main exercise', icon: '🏋️' },
      { name: 'Romanian Deadlift (Bottle/Backpack)', tag: 'Main exercise', icon: '🏋️' },
      { name: 'Good Mornings (Bodyweight/Band)', tag: 'Accessory', icon: '🏋️' },
      { name: 'Leg Slides (towel leg curls)', tag: 'Isolation', icon: '🦵' },
    ],
  },
  {
    category: 'Chest',
    exercises: [
      { name: 'Push-Ups', tag: 'Main exercise', icon: '💪' },
      { name: 'Knee Push-Ups', tag: 'Main exercise', icon: '💪' },
      { name: 'Incline Push-Ups', tag: 'Main exercise', icon: '💪' },
      { name: 'Decline Push-Ups', tag: 'Main exercise', icon: '💪' },
      { name: 'Wide Push-Ups', tag: 'Main exercise', icon: '💪' },
      { name: 'Diamond Push-Ups', tag: 'Main exercise', icon: '💪' },
      { name: 'Bottle Floor Press', tag: 'Main exercise', icon: '💪' },
      { name: 'Resistance Band Chest Press', tag: 'Main exercise', icon: '💪' },
    ],
  },
  {
    category: 'Back',
    exercises: [
      { name: 'Resistance Band Rows', tag: 'Main exercise', icon: '💪' },
      { name: 'stend Dumbbell/Bottle Row', tag: 'Main exercise', icon: '💪' },
      { name: 'Renegade Row', tag: 'Accessory', icon: '💪' },
      { name: 'Superman', tag: 'Isolation', icon: '💪' },
      { name: 'Band Pull-Aparts', tag: 'Isolation', icon: '💪' },
      { name: 'door/bodyweight row', tag: 'Isolation', icon: '💪' },
    ],
  },
  {
    category: 'Shoulders',
    exercises: [
      { name: 'Pike Push-Ups', tag: 'Main exercise', icon: '💪' },
      { name: 'Arnold Press (Home Version)', tag: 'Isolation', icon: '💪' },
      { name: 'Lateral Raises (DB/Bottle/Band)', tag: 'Main exercise', icon: '💪' },
      { name: 'Front Raises (DB/Bottle/Band)', tag: 'Isolation', icon: '💪' },
      { name: 'Band Face Pulls', tag: 'Main exercise', icon: '💪' },
    ],
  },
  {
    category: 'Arms - Biceps',
    exercises: [
      { name: 'Alternating Biceps Curl', tag: 'Isolation', icon: '💪' },
      { name: 'Resistance Band Curl single arm', tag: 'Isolation', icon: '💪' },
      { name: 'Concentration Curl', tag: 'Isolation', icon: '💪' },
    ],
  },
  {
    category: 'Arms - Triceps',
    exercises: [
      { name: 'Bench/Chair Dips', tag: 'Isolation', icon: '💪' },
      { name: 'Overhead Triceps Extension (Bottle/DB/Band)', tag: 'Isolation', icon: '💪' },
      { name: 'Triceps Kickbacks', tag: 'Isolation', icon: '💪' },
    ],
  },
  {
    category: 'Core / Abs',
    exercises: [
      { name: 'Crunches', tag: 'Core exercise', icon: '🧘' },
      { name: 'Reverse Crunches', tag: 'Core exercise', icon: '🧘' },
      { name: 'Dead Bug', tag: 'Core exercise', icon: '🧘' },
      { name: 'Bicycle Crunches', tag: 'Core exercise', icon: '🧘' },
      { name: 'Scissors', tag: 'Core exercise', icon: '🧘' },
      { name: 'Heel Touches', tag: 'Core exercise', icon: '🧘' },
      { name: 'Seated Knee Tucks', tag: 'Core exercise', icon: '🧘' },
      { name: 'Reverse Plank', tag: 'Core exercise', icon: '🧘' },
      { name: 'Bench Crunches', tag: 'Core exercise', icon: '🧘' },
      { name: 'Side Crunches on Bench', tag: 'Core exercise', icon: '🧘' },
      { name: 'Bench Reverse Crunch', tag: 'Core exercise', icon: '🧘' },
      { name: 'Single Leg Raises', tag: 'Core exercise', icon: '🧘' },
      { name: 'Plank', tag: 'Core exercise', icon: '🧘' },
      { name: 'Plank with steps', tag: 'Core exercise', icon: '🧘' },
      { name: 'Fast Plank Steps', tag: 'Core exercise', icon: '🧘' },
      { name: 'Cat Plank / Knee-to-chest plank', tag: 'Core exercise', icon: '🧘' },
    ],
  },
  {
    category: 'Cardio',
    exercises: [
      { name: 'Burpees', tag: 'Accessory', icon: '🔥' },
      { name: 'Mountain Climbers', tag: 'Accessory', icon: '🔥' },
      { name: 'Squat to Knee squat', tag: 'Accessory', icon: '🔥' },
      { name: 'Lunge Jumps', tag: 'Accessory', icon: '🔥' },
      { name: 'Skater Jumps', tag: 'Accessory', icon: '🔥' },
      { name: 'Tuck Jumps', tag: 'Accessory', icon: '🔥' },
      { name: 'Inchworms', tag: 'Accessory', icon: '🔥' },
      { name: 'Jumping Jacks', tag: 'Cardio', icon: '🏃' },
      { name: 'High Knees', tag: 'Cardio', icon: '🏃' },
    ],
  },
]

const homeTonePool: PoolCategory[] = [
  {
    category: 'Legs / Glutes',
    exercises: [
      { name: 'Bodyweight Squat', tag: 'Main exercise', icon: '🏋️' },
      { name: 'Jump Squat', tag: 'Accessory', icon: '🦵' },
      { name: 'Wall Sit', tag: 'Accessory', icon: '🦵' },
      { name: 'Step-Ups', tag: 'Main exercise', icon: '🦵' },
      { name: 'Bulgarian Split Squat', tag: 'Main exercise', icon: '🏋️' },
      { name: 'Reverse Lunges', tag: 'Main exercise', icon: '🦵' },
      { name: 'Forward Lunges', tag: 'Main exercise', icon: '🦵' },
      { name: 'Walking Lunges', tag: 'Main exercise', icon: '🦵' },
      { name: 'Sumo Squat', tag: 'Main exercise', icon: '🏋️' },
      { name: 'Glute Bridge', tag: 'Main exercise', icon: '🍑' },
      { name: 'Single-Leg Glute Bridge', tag: 'Isolation', icon: '🍑' },
      { name: 'Hip Thrust (Chair/Sofa)', tag: 'Main exercise', icon: '🍑' },
      { name: 'Donkey Kicks', tag: 'Isolation', icon: '🦵' },
      { name: 'Fire Hydrants', tag: 'Isolation', icon: '🦵' },
      { name: 'Side-Lying Leg Raises', tag: 'Isolation', icon: '🦵' },
      { name: 'Clamshells', tag: 'Isolation', icon: '🦵' },
      { name: 'Wall Glute Squeeze (Isometric)', tag: 'Isolation', icon: '🦵' },
      { name: 'Band Squats', tag: 'Main exercise', icon: '🦵' },
      { name: 'Band Lateral Walks', tag: 'Isolation', icon: '🦵' },
    ],
  },
  {
    category: 'Hamstrings',
    exercises: [
      { name: 'Single-Leg RDL', tag: 'Main exercise', icon: '🏋️' },
      { name: 'Romanian Deadlift (Bottle/Backpack)', tag: 'Main exercise', icon: '🏋️' },
      { name: 'Good Mornings (Bodyweight/Band)', tag: 'Accessory', icon: '🏋️' },
      { name: 'Leg Slides (towel leg curls)', tag: 'Isolation', icon: '🦵' },
    ],
  },
  {
    category: 'Chest',
    exercises: [
      { name: 'Push-Ups', tag: 'Main exercise', icon: '💪' },
      { name: 'Knee Push-Ups', tag: 'Main exercise', icon: '💪' },
      { name: 'Incline Push-Ups', tag: 'Main exercise', icon: '💪' },
      { name: 'Decline Push-Ups', tag: 'Main exercise', icon: '💪' },
      { name: 'Wide Push-Ups', tag: 'Main exercise', icon: '💪' },
      { name: 'Diamond Push-Ups', tag: 'Main exercise', icon: '💪' },
      { name: 'Bottle Floor Press', tag: 'Main exercise', icon: '💪' },
      { name: 'Resistance Band Chest Press', tag: 'Main exercise', icon: '💪' },
    ],
  },
  {
    category: 'Back',
    exercises: [
      { name: 'Resistance Band Rows', tag: 'Main exercise', icon: '💪' },
      { name: 'stend Dumbbell/Bottle Row', tag: 'Main exercise', icon: '💪' },
      { name: 'Renegade Row', tag: 'Accessory', icon: '💪' },
      { name: 'Superman', tag: 'Isolation', icon: '💪' },
      { name: 'Band Pull-Aparts', tag: 'Isolation', icon: '💪' },
      { name: 'door/bodyweight row', tag: 'Isolation', icon: '💪' },
    ],
  },
  {
    category: 'Shoulders',
    exercises: [
      { name: 'Pike Push-Ups', tag: 'Main exercise', icon: '💪' },
      { name: 'Arnold Press (Home Version)', tag: 'Isolation', icon: '💪' },
      { name: 'Lateral Raises (DB/Bottle/Band)', tag: 'Main exercise', icon: '💪' },
      { name: 'Front Raises (DB/Bottle/Band)', tag: 'Isolation', icon: '💪' },
      { name: 'Band Face Pulls', tag: 'Main exercise', icon: '💪' },
    ],
  },
  {
    category: 'Arms - Biceps',
    exercises: [
      { name: 'Alternating Biceps Curl', tag: 'Isolation', icon: '💪' },
      { name: 'Resistance Band Curl single arm', tag: 'Isolation', icon: '💪' },
      { name: 'Concentration Curl', tag: 'Isolation', icon: '💪' },
    ],
  },
  {
    category: 'Arms - Triceps',
    exercises: [
      { name: 'Bench/Chair Dips', tag: 'Isolation', icon: '💪' },
      { name: 'Overhead Triceps Extension (Bottle/DB/Band)', tag: 'Isolation', icon: '💪' },
      { name: 'Triceps Kickbacks', tag: 'Isolation', icon: '💪' },
    ],
  },
  {
    category: 'Core / Abs',
    exercises: [
      { name: 'Crunches', tag: 'Core exercise', icon: '🧘' },
      { name: 'Reverse Crunches', tag: 'Core exercise', icon: '🧘' },
      { name: 'Dead Bug', tag: 'Core exercise', icon: '🧘' },
      { name: 'Bicycle Crunches', tag: 'Core exercise', icon: '🧘' },
      { name: 'Scissors', tag: 'Core exercise', icon: '🧘' },
      { name: 'Heel Touches', tag: 'Core exercise', icon: '🧘' },
      { name: 'Seated Knee Tucks', tag: 'Core exercise', icon: '🧘' },
      { name: 'Reverse Plank', tag: 'Core exercise', icon: '🧘' },
      { name: 'Bench Crunches', tag: 'Core exercise', icon: '🧘' },
      { name: 'Side Crunches on Bench', tag: 'Core exercise', icon: '🧘' },
      { name: 'Bench Reverse Crunch', tag: 'Core exercise', icon: '🧘' },
      { name: 'Single Leg Raises', tag: 'Core exercise', icon: '🧘' },
      { name: 'Plank', tag: 'Core exercise', icon: '🧘' },
      { name: 'Plank with steps', tag: 'Core exercise', icon: '🧘' },
      { name: 'Fast Plank Steps', tag: 'Core exercise', icon: '🧘' },
      { name: 'Cat Plank / Knee-to-chest plank', tag: 'Core exercise', icon: '🧘' },
    ],
  },
  {
    category: 'Cardio',
    exercises: [
      { name: 'Burpees', tag: 'Accessory', icon: '🔥' },
      { name: 'Mountain Climbers', tag: 'Accessory', icon: '🔥' },
      { name: 'Squat to Knee squat', tag: 'Accessory', icon: '🔥' },
      { name: 'Lunge Jumps', tag: 'Accessory', icon: '🔥' },
      { name: 'Skater Jumps', tag: 'Accessory', icon: '🔥' },
      { name: 'Tuck Jumps', tag: 'Accessory', icon: '🔥' },
      { name: 'Inchworms', tag: 'Accessory', icon: '🔥' },
      { name: 'Jumping Jacks', tag: 'Cardio', icon: '🏃' },
      { name: 'High Knees', tag: 'Cardio', icon: '🏃' },
    ],
  },
]

const gymBasePool: PoolCategory[] = [
  {
    category: 'Legs / Glutes',
    exercises: [
      { name: 'Goblet Squat', tag: 'Main exercise', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Hack Squat', tag: 'Main exercise', levels: ['Intermediate', 'Advanced'], icon: '🏋️' },
      { name: 'Bodyweight Squat', tag: 'Main exercise', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Smith Machine/burbell Squat', tag: 'Main exercise', levels: ['Beginner', 'Intermediate'], icon: '🏋️' },
      { name: 'Sumo Squat with dumbbell / barbell / Smith machine', tag: 'Main exercise', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Leg Press', tag: 'Main exercise', levels: ['Beginner', 'Intermediate'], icon: '🏋️' },
      { name: 'Horizontal Leg Press', tag: 'Main exercise', levels: ['Beginner', 'Intermediate'], icon: '🏋️' },
      { name: 'Vertical Leg Press', tag: 'Main exercise', levels: ['Beginner', 'Intermediate'], icon: '🏋️' },
      { name: 'Walking Lunges', tag: 'Main exercise', levels: ['Beginner'], icon: '🦵' },
      { name: 'Bulgarian Split Squat (Gym)', tag: 'Main exercise', levels: ['Beginner', 'Intermediate'], icon: '🏋️' },
      { name: 'Reverse / Forward Lunges', tag: 'Accessory', levels: ['Beginner'], icon: '🦵' },
      { name: 'Curtsy Lunges with dumbbells', tag: 'Accessory', levels: ['Beginner'], icon: '🦵' },
      { name: 'Hack RDL', tag: 'Main exercise', levels: ['Intermediate', 'Advanced'], icon: '🏋️' },
      { name: 'Step-Ups', tag: 'Main exercise', levels: ['Beginner', 'Intermediate'], icon: '🦵' },
      { name: 'Cable Step-ups', tag: 'Main exercise', levels: ['Intermediate'], icon: '🦵' },
      { name: 'Romanian Deadlift with dumbbell/barbell', tag: 'Main exercise', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'Machine Hip Thrust', tag: 'Main exercise', levels: ['Beginner', 'Intermediate'], icon: '🍑' },
      { name: 'Barbell Hip Thrust', tag: 'Main exercise', levels: ['Beginner', 'Intermediate'], icon: '🍑' },
      { name: 'Lunges', tag: 'Main exercise', levels: ['Beginner'], icon: '🦵' },
      { name: 'Leg Adduction Machine', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Cable Hip Abduction', tag: 'Isolation', levels: ['Beginner'], icon: '🦵' },
      { name: 'Plate-loaded Hip Abduction', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Hip Abduction Machine', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Leg Extension Machine', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Single-Leg Leg Extension', tag: 'Isolation', levels: ['Beginner', 'Intermediate'], icon: '🏋️' },
      { name: 'Leg Curl', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Sissy Squats', tag: 'Accessory', levels: ['Beginner'], icon: '🦵' },
      { name: 'Leg Slides (towel leg curls)', tag: 'Accessory', levels: ['Beginner'], icon: '🦵' },
      { name: 'Cable Kickback', tag: 'Isolation', levels: ['Beginner'], icon: '🦵' },
      { name: 'Standing Cable Kickback', tag: 'Isolation', levels: ['Beginner'], icon: '🦵' },
    ],
  },
  {
    category: 'Hamstrings',
    exercises: [
      { name: 'Back Extensions (Hyperextensions)', tag: 'Accessory', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Romanian Deadlift with dumbbell/barbell', tag: 'Main exercise', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'Nordic Curl', tag: 'Isolation', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'Deadlift with dumbbell/barbell/Smith', tag: 'Main exercise', levels: ['Advanced'], icon: '🏋️' },
      { name: 'Stiff-Leg Deadlift', tag: 'Main exercise', levels: ['Advanced'], icon: '🏋️' },
      { name: 'Sumo Deadlift', tag: 'Main exercise', levels: ['Advanced'], icon: '🏋️' },
      { name: 'Good Morning', tag: 'Main exercise', levels: ['Advanced'], icon: '🏋️' },
      { name: 'Reverse Hyperextensions', tag: 'Accessory', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'Jefferson Deadlift', tag: 'Main exercise', levels: ['Advanced'], icon: '🏋️' },
      { name: 'Snatch Grip Deadlift', tag: 'Main exercise', levels: ['Advanced'], icon: '🏋️' },
      { name: 'Leg Curl Lying', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Leg Curl Sitting', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
    ],
  },
  {
    category: 'Calves',
    exercises: [
      { name: 'Standing Calf Raises (machine / dumbbell)', tag: 'Main exercise', levels: ['Beginner'], icon: '🦵' },
      { name: 'Seated Calf Raises (machine)', tag: 'Main exercise', levels: ['Beginner'], icon: '🦵' },
      { name: 'Single-leg Calf Raises with dumbbell', tag: 'Main exercise', levels: ['Beginner'], icon: '🦵' },
    ],
  },
  {
    category: 'Chest',
    exercises: [
      { name: 'Barbell Bench Press', tag: 'Main exercise', levels: ['Beginner', 'Intermediate'], icon: '🏋️' },
      { name: 'Dumbbell Bench Press', tag: 'Main exercise', levels: ['Beginner', 'Intermediate'], icon: '🏋️' },
      { name: 'Incline Barbell Bench Press', tag: 'Main exercise', levels: ['Beginner', 'Intermediate'], icon: '🏋️' },
      { name: 'Incline Dumbbell Bench Press', tag: 'Main exercise', levels: ['Beginner', 'Intermediate'], icon: '🏋️' },
      { name: 'Decline Barbell Bench Press', tag: 'Main exercise', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'Decline Dumbbell Bench Press', tag: 'Main exercise', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'Close-Grip Bench Press', tag: 'Main exercise', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'Chest Press Machine', tag: 'Main exercise', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Incline Chest Press Machine', tag: 'Main exercise', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Cable Chest Fly (Flat)', tag: 'Isolation', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'Incline Cable Fly', tag: 'Isolation', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'Decline Cable Fly', tag: 'Isolation', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'Incline Dumbbell Fly', tag: 'Main exercise', levels: ['Beginner', 'Intermediate'], icon: '🏋️' },
      { name: 'Pec Deck Machine', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Dumbbell Pullover', tag: 'Isolation', levels: ['Beginner', 'Intermediate'], icon: '🏋️' },
      { name: 'Barbell Pullover', tag: 'Isolation', levels: ['Advanced'], icon: '🏋️' },
      { name: 'Push-Ups', tag: 'Main exercise', levels: ['Intermediate'], icon: '💪' },
      { name: 'Knee Push-Ups', tag: 'Main exercise', levels: ['Beginner'], icon: '💪' },
      { name: 'Incline Push-Ups', tag: 'Main exercise', levels: ['Beginner'], icon: '💪' },
      { name: 'Decline Push-Ups', tag: 'Main exercise', levels: ['Advanced'], icon: '💪' },
      { name: 'Dips (Chest Focus)', tag: 'Main exercise', levels: ['Advanced'], icon: '💪' },
    ],
  },
  {
    category: 'Back',
    exercises: [
      { name: 'Pull-ups', tag: 'Main exercise', levels: ['Advanced'], icon: '🏋️' },
      { name: 'Close-Grip Pull-Ups', tag: 'Main exercise', levels: ['Advanced'], icon: '🏋️' },
      { name: 'Neutral-Grip Pull-Ups', tag: 'Main exercise', levels: ['Advanced'], icon: '🏋️' },
      { name: 'Chin-ups', tag: 'Main exercise', levels: ['Advanced'], icon: '🏋️' },
      { name: 'Assisted Pull-ups (machine)', tag: 'Main exercise', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Lat Pulldown (wide grip)', tag: 'Main exercise', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Lat Pulldown (close grip)', tag: 'Main exercise', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Underhand Lat Pulldown', tag: 'Main exercise', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Single-arm Lat Pulldown', tag: 'Main exercise', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Bent-Over Barbell Row', tag: 'Main exercise', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'Pendlay Row', tag: 'Main exercise', levels: ['Advanced'], icon: '🏋️' },
      { name: 'T-Bar Row', tag: 'Main exercise', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'Seated Cable Row (wide grip)', tag: 'Main exercise', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Seated Cable Row (V-bar)', tag: 'Main exercise', levels: ['Beginner'], icon: '🏋️' },
      { name: 'One-Arm Row', tag: 'Main exercise', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'Chest-supported Dumbbell Row', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Face Pulls', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Reverse Pec Deck', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Barbell Shrugs', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Dumbbell Shrugs', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Cable Shrugs', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Straight-arm Pulldown (rope)', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Superman Raises', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Inverted Rows', tag: 'Main exercise', levels: ['Beginner'], icon: '🏋️' },
      { name: 'TRX Rows', tag: 'Main exercise', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'Ring Rows', tag: 'Main exercise', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'High Row (cable)', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Seated Machine Row (Hammer Strength)', tag: 'Main exercise', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Seal Row', tag: 'Isolation', levels: ['Intermediate'], icon: '🏋️' },
    ],
  },
  {
    category: 'Shoulders',
    exercises: [
      { name: 'Barbell Overhead Press', tag: 'Main exercise', levels: ['Intermediate', 'Advanced'], icon: '🏋️' },
      { name: 'Arnold Press', tag: 'Accessory', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'Machine Shoulder Press', tag: 'Accessory', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Seated Dumbbell Press', tag: 'Main exercise', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Front Raise (DB/Plate/Barbell)', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Lateral Raise (Dumbbell)', tag: 'Main exercise', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'Cable Lateral Raise', tag: 'Isolation', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'Reverse Pec Deck', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Face Pulls', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Rear Delt Cable Fly', tag: 'Isolation', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'Rear Delt Dumbbell Fly', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Upright Row (barbell/dumbbell/cable)', tag: 'Accessory', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Cable Front Raise', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Y-Raises (Incline or Standing)', tag: 'Isolation', levels: ['Advanced'], icon: '🏋️' },
    ],
  },
  {
    category: 'Arms - Biceps',
    exercises: [
      { name: 'Barbell Biceps Curl', tag: 'Isolation', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'Dumbbell Biceps Curl', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Hammer Curl', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Concentration Curl', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Cable Biceps Curl', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Incline Dumbbell Curl', tag: 'Isolation', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'EZ-Bar Curl', tag: 'Isolation', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'Reverse Curl', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
    ],
  },
  {
    category: 'Arms - Triceps',
    exercises: [
      { name: 'Kickbacks (Dumbbell)', tag: 'Accessory', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Triceps Pushdown (Cable)', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Overhead Triceps Extension (DB)', tag: 'Isolation', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'Cable Overhead Extension', tag: 'Isolation', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'Dumbbell Skull Crushers', tag: 'Isolation', levels: ['Beginner', 'Intermediate'], icon: '🏋️' },
      { name: 'Bench Dips', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Single-Arm Pushdown', tag: 'Isolation', levels: ['Intermediate'], icon: '🏋️' },
      { name: 'Rope Pushdown', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
      { name: 'Machine Triceps Extension', tag: 'Isolation', levels: ['Beginner'], icon: '🏋️' },
    ],
  },
  {
    category: 'Core / Abs',
    exercises: [
      { name: 'Crunch', tag: 'Core exercise', levels: ['Beginner'], icon: '🧘' },
      { name: 'Cable Crunch', tag: 'Core exercise', levels: ['Beginner'], icon: '🧘' },
      { name: 'Machine Crunch', tag: 'Core exercise', levels: ['Beginner'], icon: '🧘' },
      { name: 'Reverse Crunch', tag: 'Core exercise', levels: ['Beginner'], icon: '🧘' },
      { name: 'Dead Bug', tag: 'Core exercise', levels: ['Beginner'], icon: '🧘' },
      { name: 'Heel Touches', tag: 'Core exercise', levels: ['Beginner'], icon: '🧘' },
      { name: 'Seated Knee Tucks', tag: 'Core exercise', levels: ['Beginner'], icon: '🧘' },
      { name: 'Reverse Plank', tag: 'Core exercise', levels: ['Beginner'], icon: '🧘' },
      { name: 'Bench Crunches', tag: 'Core exercise', levels: ['Beginner'], icon: '🧘' },
      { name: 'Side Crunches on Bench', tag: 'Core exercise', levels: ['Beginner'], icon: '🧘' },
      { name: 'Bench Reverse Crunch', tag: 'Core exercise', levels: ['Beginner'], icon: '🧘' },
      { name: 'Single Leg Raises', tag: 'Core exercise', levels: ['Beginner'], icon: '🧘' },
      { name: 'Hanging Knee Raises', tag: 'Core exercise', levels: ['Beginner'], icon: '🧘' },
      { name: 'Hanging Leg Raises', tag: 'Core exercise', levels: ['Beginner'], icon: '🧘' },
      { name: 'Plank', tag: 'Core exercise', levels: ['Beginner'], icon: '🧘' },
      { name: 'Side Plank', tag: 'Core exercise', levels: ['Beginner'], icon: '🧘' },
      { name: 'Woodchopper / Rotation Cable', tag: 'Core exercise', levels: ['Beginner'], icon: '🧘' },
    ],
  },
]

const homeFatLossCardioCategory = homeFatLossPool.find((entry) => entry.category === 'Cardio')

const gymFatLossOnlyCardioCategory: PoolCategory = {
  category: 'Cardio',
  exercises: homeFatLossCardioCategory ? homeFatLossCardioCategory.exercises.map((exercise) => ({ ...exercise })) : [],
}

const gymGainSculptPool: PoolCategory[] = gymBasePool
const gymFatLossTonePool: PoolCategory[] = [
  ...gymBasePool,
  ...(gymFatLossOnlyCardioCategory.exercises.length > 0 ? [gymFatLossOnlyCardioCategory] : []),
]

const getDataset = (section: BuilderSection, goal: BuilderGoal): PoolCategory[] => {
  if (section === 'home') {
    return goal === 'fat-loss' ? homeFatLossPool : homeTonePool
  }

  return goal === 'fat-loss' ? gymFatLossTonePool : gymGainSculptPool
}

const shouldIncludeCategory = (section: BuilderSection, goal: BuilderGoal, split: BuilderSplit, category: string) => {
  if (split === 'full-body') {
    return true
  }

  if (category === 'Cardio' && (section === 'home' || (section === 'gym' && goal === 'fat-loss'))) {
    return true
  }

  if (split === 'upper-body') {
    return upperCategories.has(category)
  }

  return lowerCategories.has(category)
}

export function getWorkoutBuilderGroups(section: BuilderSection, goal: BuilderGoal, split: BuilderSplit) {
  const dataset = getDataset(section, goal)
  const seenExerciseKeys = new Set<string>()

  return dataset
    .filter((entry) => shouldIncludeCategory(section, goal, split, entry.category))
    .map((entry) => {
      const dedupedExercises = entry.exercises
        .map((exercise) => withDefaults(exercise, entry.category, section))
        .filter((exercise) => {
          const key = normalizeBuilderExerciseName(exercise.name)
          if (seenExerciseKeys.has(key)) {
            return false
          }

          seenExerciseKeys.add(key)
          return true
        })
        .sort(compareBuilderExercises)

      return {
        category: entry.category,
        exercises: dedupedExercises,
      }
    })
    .filter((entry) => entry.exercises.length > 0)
    .map((entry, index) => ({
      title: `Group ${index + 1} - ${entry.category}`,
      exercises: entry.exercises,
    }))
}
