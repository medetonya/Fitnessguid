import { ArrowLeft, PlayCircle, House } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { getFatLossReadyWorkoutDays } from '../data/fatLossReadyWorkouts'
import { useLanguage } from '../hooks/useLanguage'
import { localizeExerciseName } from '../lib/exerciseTextLocalization'

export default function ReadyWorkoutFatLossPage() {
  const { language } = useLanguage()
  const isRussian = language === 'ru'
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isGymRoute = pathname.includes('/workouts/gym/')
  const useRussian = isRussian
  const goalBasePath = isGymRoute ? '/workouts/gym/goal/fat-loss' : '/workouts/home/goal/fat-loss'
  const days = getFatLossReadyWorkoutDays(isGymRoute ? 'gym' : 'home')
  const subtitle = useRussian
    ? isGymRoute
      ? '3 дня • 50-60 минут + 15-минутный кардио-финишер • круговой формат'
      : '3 дня • по 50-60 минут • круговой формат'
    : isGymRoute
      ? '3 days • 50-60 minutes + 15-minute cardio finisher • circuit format'
      : '3 days • 50-60 minutes each • circular format'

  const getLocalizedDayTitle = (dayNumber: number, title: string) => {
    if (!useRussian) {
      return title
    }

    if (!isGymRoute) {
      if (dayNumber === 1) return 'Ноги + ягодицы + плечи + грудь + кор + динамика'
      if (dayNumber === 2) return 'Бицепс бедра + руки + спина + кор + динамика'
      if (dayNumber === 3) return 'Ноги + бицепс бедра + спина + грудь + кор + динамика'
    } else {
      if (dayNumber === 1) return 'Ноги + спина + грудь + кор + динамика'
      if (dayNumber === 2) return 'Бицепс бедра + ягодицы + руки + кор + динамика'
      if (dayNumber === 3) return 'Ноги + ягодицы + спина + плечи + кор + динамика'
    }

    return title
  }

  const getLocalizedStructure = (dayNumber: number, structure?: string) => {
    if (!useRussian || !structure) {
      return structure
    }

    if (!isGymRoute) {
      return 'разминка -> основной блок -> кардио-финишер -> заминка'
    }

    if (dayNumber === 1 || dayNumber === 2 || dayNumber === 3) {
      return 'разминка -> круговой основной блок -> кардио-финишер -> заминка (кардио-финишер: 15 минут на эллипсе, степпере или велотренажере)'
    }

    return structure
  }

  const getLocalizedFormat = (format: string) => {
    if (!useRussian) {
      return format
    }

    return format
      .replace('3 rounds x 40 sec work per exercise; 1.5 min rest after each full round', '3 круга по 40 сек работы на упражнение; 1.5 мин отдыха после каждого полного круга')
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
          <h1 className="font-serif text-6xl leading-[0.95] text-gray-900 md:text-7xl">{useRussian ? 'Готовый план для похудения' : 'Ready Fat Loss Plan'}</h1>
          <p className="mt-4 text-2xl text-gray-700">{subtitle}</p>
        </section>

        <section className="space-y-6 pb-12">
          {days.map((day) => (
            <article key={day.id} className="rounded-[22px] border border-[#d5d8d3] bg-white p-6 shadow-sm md:p-8">
              <h2 className="font-serif text-4xl leading-tight text-gray-900 md:text-5xl">{useRussian ? 'День' : 'Day'} {day.dayNumber} - {getLocalizedDayTitle(day.dayNumber, day.title)}</h2>
              {day.structure ? <p className="mt-3 text-lg leading-relaxed text-gray-600 md:text-xl">{useRussian ? 'Структура' : 'Structure'}: {getLocalizedStructure(day.dayNumber, day.structure)}</p> : null}

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
