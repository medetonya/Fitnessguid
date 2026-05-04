import { ArrowLeft, Circle, House, ListChecks, PlayCircle, RotateCcw } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getToneReadyWorkoutDay, type ExerciseTag } from '../data/toneReadyWorkouts'
import { useLanguage } from '../hooks/useLanguage'
import { localizeExerciseName, localizeExerciseZone, localizeRepsText } from '../lib/exerciseTextLocalization'

const tagClasses: Record<ExerciseTag, string> = {
  'Main exercise': 'bg-[#e8e8e8] text-[#111111] border-[#d4d4d8]',
  Accessory: 'bg-[#e8e8e8] text-[#52525b] border-[#d4d4d8]',
  Isolation: 'bg-[#f2f2f2] text-[#111111] border-[#d4d4d8]',
  'Core exercise': 'bg-[#f1f7e6] text-[#111111] border-[#d4d4d8]',
}

export default function ToneWorkoutSheetPage() {
  const { language } = useLanguage()
  const isRussian = language === 'ru'
  const navigate = useNavigate()
  const { dayId } = useParams()
  const { pathname } = useLocation()
  const isGymRoute = pathname.includes('/workouts/gym/')
  const goalBasePath = isGymRoute ? '/workouts/gym/goal/muscle-tone' : '/workouts/home/goal/muscle-tone'
  const day = getToneReadyWorkoutDay(dayId, isGymRoute ? 'gym' : 'home')

  const getLocalizedDayTitle = (dayNumber: number, title: string) => {
    if (!isRussian) {
      return title
    }

    if (!isGymRoute) {
      if (dayNumber === 1) return 'Ноги + ягодицы (акцент на форму)'
      if (dayNumber === 2) return 'Верх тела + пресс'
      if (dayNumber === 3) return 'Фулбоди (контроль + форма)'
    } else {
      if (dayNumber === 1) return 'Ноги + ягодицы (акцент на форму)'
      if (dayNumber === 2) return 'Верх тела + кор'
      if (dayNumber === 3) return 'Фулбоди'
    }

    return title
  }

  const tagLabels: Record<ExerciseTag, string> = {
    'Main exercise': isRussian ? 'Основное упражнение' : 'Main exercise',
    Accessory: isRussian ? 'Вспомогательное' : 'Accessory',
    Isolation: isRussian ? 'Изолирующее' : 'Isolation',
    'Core exercise': isRussian ? 'Упражнение на кор' : 'Core exercise',
  }

  if (!day) {
    return <Navigate to={`${goalBasePath}/ready-workout`} replace />
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="mx-auto max-w-5xl px-6 py-8 md:py-10">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(`${goalBasePath}/ready-workout`)}
            className="inline-flex items-center gap-2 text-base font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            {isRussian ? 'Назад' : 'Come back'}
          </button>

          <Link
            to="/dashboard"
            className="hidden items-center gap-2 rounded-xl bg-[#efefef] px-4 py-2 text-sm text-gray-600 shadow-sm"
          >
            <House size={16} />
            {isRussian ? 'Меню' : 'Menu'}
          </Link>
        </div>

        <section className="mb-7">
          <span className="inline-block rounded-full border border-[#d4d4d8] bg-[#ececec] px-4 py-1 text-xs font-semibold uppercase tracking-wide text-[#111111]">
            {isRussian ? 'Лист тренировки' : 'Training Sheet'}
          </span>

          <div className="mb-4 mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#ececec] text-[#111111]">
            <ListChecks size={30} />
          </div>

          <h1 className="font-serif text-6xl text-gray-900 md:text-7xl">{isRussian ? 'Твоя тренировка' : 'Your Workout'}</h1>
          <p className="mt-3 text-2xl text-gray-700">{isRussian ? 'Готово к началу тренировки' : 'Ready to start training'}</p>

          <div className="mt-5 inline-flex items-center gap-3">
            <span className="rounded-full border border-[#d4d4d8] bg-[#e8e8e8] px-4 py-1 text-xl font-semibold text-[#52525b]">
              {getLocalizedDayTitle(day.dayNumber, day.title)}
            </span>
            <span className="text-xl text-gray-600">{day.exercises.length} {isRussian ? 'упражнений' : 'exercises'}</span>
          </div>
        </section>

        <section className="space-y-4 pb-8">
          {day.exercises.map((exercise, index) => (
            <article key={exercise.name} className="rounded-[22px] border border-[#d4d4d8] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#ededed] text-xl font-semibold text-[#52525b]">
                    {index + 1}
                  </span>

                  <div>
                    <p className="text-4xl font-semibold text-gray-900">
                      {exercise.icon} {localizeExerciseName(exercise.name, language)}
                    </p>
                    <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${tagClasses[exercise.tag]}`}>
                      {tagLabels[exercise.tag]}
                    </span>

                    <p className="mt-3 text-xl font-semibold uppercase tracking-wide text-gray-500">{localizeExerciseZone(exercise.zone, language)}</p>

                    <div className="mt-2 flex items-center gap-6 text-xl text-gray-700">
                      <span>{isRussian ? 'Подходы' : 'Sets'}: <strong>{exercise.sets}</strong></span>
                      <span>{isRussian ? 'Повторения' : 'Reps'}: <strong>{localizeRepsText(exercise.reps, language)}</strong></span>
                    </div>
                  </div>
                </div>

                <Circle size={28} className="mt-1 text-gray-300" />
              </div>
            </article>
          ))}
        </section>

        <section className="space-y-4 pb-12">
          <Link
            to={`${goalBasePath}/ready-workout/training/${day.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#111111] px-6 py-4 text-2xl font-semibold text-white transition hover:bg-[#111111]"
          >
            <PlayCircle size={22} />
            {isRussian ? 'Начать режим тренировки' : 'Start Training Mode'}
          </Link>

          <Link
            to={`${goalBasePath}/workout-builder`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#d4d4d8] bg-white px-6 py-4 text-2xl font-semibold text-gray-800 transition hover:bg-gray-50"
          >
            <RotateCcw size={22} />
            {isRussian ? 'Собрать другую тренировку' : 'Build Another Workout'}
          </Link>
        </section>
      </main>
    </div>
  )
}
