import ExerciseBuilderScreen from '../components/ExerciseBuilderScreen'
import { getWorkoutBuilderGroups } from '../data/workoutBuilderExercises'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'

export default function WorkoutBuilderToneFullBodyPage() {
  const { t } = useLanguage()
  const { pathname } = useLocation()
  const isGymRoute = pathname.includes('/workouts/gym/')
  const builderPath = isGymRoute ? '/workouts/gym/goal/muscle-tone/workout-builder' : '/workouts/home/goal/muscle-tone/workout-builder'
  const trainingPath = isGymRoute
    ? '/workouts/gym/goal/muscle-tone/workout-builder/training'
    : '/workouts/home/goal/muscle-tone/workout-builder/training'
  const groups = getWorkoutBuilderGroups(isGymRoute ? 'gym' : 'home', 'tone', 'full-body')

  return (
    <ExerciseBuilderScreen
      title={t('workoutBuilder.screenTitleTone')}
      subtitle={t('workoutBuilder.screenSubtitleTone')}
      backTo={builderPath}
      groups={groups}
      trainingPath={trainingPath}
      storageKey={`${isGymRoute ? 'gym' : 'home'}-tone-full-body`}
      modePreset="tone"
      useGuidedFullBodyFlow
    />
  )
}
