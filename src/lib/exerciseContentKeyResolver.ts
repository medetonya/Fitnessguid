const normalizeExerciseName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

const exerciseContentAliases: Record<string, string> = {
  [normalizeExerciseName('Goblet Squat')]: normalizeExerciseName('Goblet Squat with dumbbell'),
  [normalizeExerciseName('Reverse / Forward Lunges')]: normalizeExerciseName('Lunges'),
  [normalizeExerciseName('Leg Adduction Machine')]: normalizeExerciseName('Adduction Machine / Adductors'),
  [normalizeExerciseName('Cable Hip Abduction')]: normalizeExerciseName('Abduction Machine / Abductors'),
  [normalizeExerciseName('Plate-loaded Hip Abduction')]: normalizeExerciseName('Abduction Machine / Abductors'),
  [normalizeExerciseName('Hip Abduction Machine')]: normalizeExerciseName('Abduction Machine / Abductors'),
  [normalizeExerciseName('Good Mornings')]: normalizeExerciseName('Good Mornings (Bodyweight/Band)'),
  [normalizeExerciseName('Nordic Curl')]: normalizeExerciseName('Leg Curl'),
  [normalizeExerciseName('Pendlay Row')]: normalizeExerciseName('Barbell Row (underhand grip)'),
  [normalizeExerciseName('Ring Rows')]: normalizeExerciseName('Inverted Rows'),
  [normalizeExerciseName('Seal Row')]: normalizeExerciseName('Chest-supported Dumbbell Row'),
  [normalizeExerciseName('High Row (cable)')]: normalizeExerciseName('Seated Cable Row (V-bar)'),
  [normalizeExerciseName('Sissy Squats')]: normalizeExerciseName('Leg Extension Machine'),
  [normalizeExerciseName('Jefferson Deadlift')]: normalizeExerciseName('Deadlift with dumbbell/barbell/Smith'),
  [normalizeExerciseName('Snatch Grip Deadlift')]: normalizeExerciseName('Deadlift with dumbbell/barbell/Smith'),
  [normalizeExerciseName('Lat Pulldown (close grip)')]: normalizeExerciseName('Underhand Lat Pulldown'),
  [normalizeExerciseName('Single-arm Lat Pulldown')]: normalizeExerciseName('Underhand Lat Pulldown'),
  [normalizeExerciseName('Hip Thrust Machine')]: normalizeExerciseName('Machine Hip Thrust'),
  [normalizeExerciseName('Bridge Machine')]: normalizeExerciseName('Machine Hip Thrust'),
  [normalizeExerciseName('Bulgarian Squats with dumbbell')]: normalizeExerciseName('Bulgarian Split Squat (Gym)'),
  [normalizeExerciseName('Incline Bench Crunches')]: normalizeExerciseName('Bench Crunches'),
  [normalizeExerciseName('Push-ups (knee, wall, or floor variation based on your level)')]: normalizeExerciseName('Push-Ups'),
  [normalizeExerciseName('Face Pull')]: normalizeExerciseName('Face Pulls'),
  [normalizeExerciseName('Seated Smith Machine Shoulder Press')]: normalizeExerciseName('Machine Shoulder Press'),
  [normalizeExerciseName('Chest Supported Row')]: normalizeExerciseName('Chest-supported Dumbbell Row'),
  [normalizeExerciseName('stand Dumbbell/Bottle Row')]: normalizeExerciseName('stend Dumbbell/Bottle Row'),
}

export function resolveExerciseContentKey(name: string): string {
  const normalized = normalizeExerciseName(name)
  return exerciseContentAliases[normalized] ?? normalized
}
