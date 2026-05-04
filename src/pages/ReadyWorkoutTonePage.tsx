import { ArrowLeft, PlayCircle, House } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { getToneReadyWorkoutDays } from '../data/toneReadyWorkouts'
import { useLanguage } from '../hooks/useLanguage'
import { localizeExerciseName } from '../lib/exerciseTextLocalization'

export default function ReadyWorkoutTonePage() {
  const { language } = useLanguage()
  const isRussian = language === 'ru'
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isGymRoute = pathname.includes('/workouts/gym/')
  const useRussian = isRussian
  const goalBasePath = isGymRoute ? '/workouts/gym/goal/muscle-tone' : '/workouts/home/goal/muscle-tone'
  const days = getToneReadyWorkoutDays(isGymRoute ? 'gym' : 'home')
  const subtitle = useRussian
    ? '3 дня • обязательная разминка перед каждой тренировкой • фокус на контроле и технике'
    : '3 days • mandatory warm-up before every workout • control and technique focus'

  const getLocalizedDayTitle = (dayNumber: number, title: string) => {
    if (!useRussian) {
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

  const getLocalizedFocus = (focus?: string) => {
    if (!focus || !useRussian) {
      return focus
    }

    return focus
      .replace('Mandatory warm-up before every workout.', 'Обязательная разминка перед каждой тренировкой.')
      .replace('Slow tempo and strong muscle connection.', 'Медленный темп и сильная связь мозг-мышца.')
      .replace('Upper-body control with core stability.', 'Контроль верха тела и стабильность кора.')
      .replace('Full-body control and shape focus.', 'Контроль всего тела и акцент на форму.')
      .replace('Upper-body strength and core control.', 'Сила верха тела и контроль кора.')
      .replace('Full-body control and technique focus.', 'Контроль всего тела и акцент на технику.')
  }

  const getLocalizedFormat = (format: string) => {
    if (!useRussian) {
      return format
    }

    return format
      .replace('4 sets x 10-12 reps (exercise-specific targets listed below).', '4 подхода x 10-12 повторений (точные цели указаны ниже).')
      .replace('4 sets x 10-15 reps (exercise-specific targets listed below).', '4 подхода x 10-15 повторений (точные цели указаны ниже).')
      .replace('4 sets x 10-12 reps; plank 3 x 40 sec; scissors 4 x 30 sec.', '4 подхода x 10-12 повторений; планка 3 x 40 сек; ножницы 4 x 30 сек.')
      .replace('4 sets x 10-15 reps; plank 3 x 40 sec.', '4 подхода x 10-15 повторений; планка 3 x 40 сек.')
      .replace('4 sets x 10-12 reps.', '4 подхода x 10-12 повторений.')
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="mx-auto max-w-5xl px-6 py-8 md:py-10">
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(goalBasePath)}
            className="inline-flex items-center gap-2 text-base font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            {useRussian ? 'Назад' : 'Come back'}
          </button>

          <Link
            to="/dashboard"
            className="hidden items-center gap-2 rounded-xl bg-[#efefef] px-4 py-2 text-sm text-gray-600 shadow-sm"
          >
            <House size={16} />
            {useRussian ? 'Меню' : 'Menu'}
          </Link>
        </div>

        <section className="mb-8">
          <h1 className="font-serif text-6xl leading-[0.95] text-gray-900 md:text-7xl">{useRussian ? 'Готовый план на тонус / форму' : 'Ready Tone / Shape Plan'}</h1>
          <p className="mt-4 text-2xl text-gray-700">{subtitle}</p>
        </section>

        <section className="space-y-6 pb-12">
          {days.map((day) => (
            <article key={day.id} className="rounded-[22px] border border-[#d5d8d3] bg-white p-6 shadow-sm md:p-8">
              <h2 className="font-serif text-4xl leading-tight text-gray-900 md:text-5xl">{useRussian ? 'День' : 'Day'} {day.dayNumber} - {getLocalizedDayTitle(day.dayNumber, day.title)}</h2>
              {day.focus ? <p className="mt-3 text-lg leading-relaxed text-gray-600 md:text-xl">{useRussian ? 'Фокус' : 'Focus'}: {getLocalizedFocus(day.focus)}</p> : null}

              <p className="mt-6 mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">{useRussian ? 'Упражнения' : 'Exercises'}</p>
              <hr className="mb-5 border-gray-200" />

              <ol className="space-y-2 text-xl leading-relaxed text-gray-700 md:text-2xl">
                {day.exercises.map((exercise, index) => (
                  <li key={exercise.name}>{index + 1}. {localizeExerciseName(exercise.name, language)}</li>
                ))}
              </ol>

              <p className="mt-5 text-lg leading-relaxed text-gray-600 md:text-xl">{useRussian ? 'Формат' : 'Format'}: {getLocalizedFormat(day.format)}</p>

              <Link
                to={`${goalBasePath}/ready-workout/sheet/${day.id}`}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#111111] px-6 py-4 text-2xl font-semibold text-white transition hover:bg-[#111111]"
              >
                <PlayCircle size={22} />
                {useRussian ? `Начать день ${day.dayNumber}` : `Start Day ${day.dayNumber}`}
              </Link>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
