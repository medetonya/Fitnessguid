import ExerciseBuilderScreen from '../components/ExerciseBuilderScreen'
import { getWorkoutBuilderGroups } from '../data/workoutBuilderExercises'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'

export default function WorkoutBuilderFullBodyPage() {
  const { t } = useLanguage()
  const { pathname } = useLocation()
  const isGymRoute = pathname.includes('/workouts/gym/')
  const builderPath = isGymRoute ? '/workouts/gym/goal/fat-loss/workout-builder' : '/workouts/home/goal/fat-loss/workout-builder'
  const trainingPath = isGymRoute
    ? '/workouts/gym/goal/fat-loss/workout-builder/training'
    : '/workouts/home/goal/fat-loss/workout-builder/training'
  const groups = getWorkoutBuilderGroups(isGymRoute ? 'gym' : 'home', 'fat-loss', 'full-body')

  return (
    <ExerciseBuilderScreen
      title={t('workoutBuilder.screenTitle')}
      subtitle={t('workoutBuilder.screenSubtitle')}
      backTo={builderPath}
      groups={groups}
      trainingPath={trainingPath}
      storageKey={`${isGymRoute ? 'gym' : 'home'}-fat-loss-full-body`}
      modePreset="fat-loss"
      useGuidedFullBodyFlow
    />
  )
}
