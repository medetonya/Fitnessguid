import { ArrowLeft, House } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'

function StepBadge({ value }: { value: number }) {
  return (
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#f3d0e1] bg-gradient-to-br from-[#fff7fb] to-[#ffeef5] text-xl font-bold text-[#be185d] shadow-[0_8px_20px_rgba(190,24,93,0.12)]">
      {value}
    </span>
  )
}

export default function ReadySchemeTonePage() {
  const { language } = useLanguage()
  const isRussian = language === 'ru'
  const { pathname } = useLocation()
  const isGymRoute = pathname.includes('/workouts/gym/')
  const useRussian = isRussian
  const goalPath = isGymRoute ? '/workouts/gym/goal/muscle-tone' : '/workouts/home/goal/muscle-tone'

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="mx-auto max-w-5xl px-6 py-8 md:py-10">
        <div className="mb-8 flex items-center justify-between">
          <Link
            to={goalPath}
            className="inline-flex items-center gap-2 text-base font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            {useRussian ? 'Назад' : 'Back'}
          </Link>

          <Link
            to="/dashboard"
            className="hidden items-center gap-2 rounded-xl bg-[#efefef] px-4 py-2 text-sm text-gray-600 shadow-sm"
          >
            <House size={16} />
            {useRussian ? 'Меню' : 'Menu'}
          </Link>
        </div>

        <section className="mb-8">
          <h1 className="font-serif text-6xl leading-[0.95] text-gray-900 md:text-7xl">{useRussian ? 'Готовая схема' : 'Ready Scheme'}</h1>
          <p className="mt-4 text-2xl text-gray-700">{useRussian ? 'Пошаговая структура тренировки на тонус' : 'Step-by-step tone workout structure'}</p>
        </section>

        {isGymRoute && (
          <section className="mb-8 rounded-[22px] border border-[#d4d4d8] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">{useRussian ? 'Маркировка сложности упражнений' : 'Exercise Complexity Markers (Gym)'}</h2>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-700">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d4d4d8] bg-[#f8f8f8] px-3 py-1.5">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                {useRussian ? 'Начальный' : 'Beginner'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d4d4d8] bg-[#f8f8f8] px-3 py-1.5">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" aria-hidden="true" />
                {useRussian ? 'Средний' : 'Intermediate'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d4d4d8] bg-[#f8f8f8] px-3 py-1.5">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden="true" />
                {useRussian ? 'Продвинутый' : 'Advanced'}
              </span>
            </div>
            <p className="mt-4 text-base text-gray-600 md:text-lg">
              {useRussian
                ? 'Новичкам стоит начинать с зелёных и синих упражнений — красные требуют более уверенной техники. Даже при опыте не игнорируйте зелёные: это база, на которой строится прогресс.'
                : 'If you are a beginner, prioritize green and blue exercises first. Red-marked movements usually require stronger technical control.'}
            </p>
          </section>
        )}

        <section className="space-y-5 pb-10">
          <article className="rounded-[24px] border border-[#ead8e3] bg-gradient-to-br from-white to-[#fff8fc] p-8 shadow-[0_10px_30px_rgba(17,17,17,0.06)] md:p-9">
            <div className="mb-5 flex items-center gap-4">
              <StepBadge value={1} />
              <h2 className="font-serif text-4xl text-gray-900 md:text-5xl">{useRussian ? 'Выбери принцип' : 'Choose a principle'}</h2>
            </div>
            <ul className="space-y-3 text-xl text-gray-700 md:text-2xl">
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{useRussian ? 'Тренировки по зонам (день ног, день верха)' : 'Training by zones (legs day, upper body day)'}</li>
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{useRussian ? 'Фулбоди с акцентами (фокус на отдельной зоне в каждом занятии)' : 'Full body with accents (focus area each session)'}</li>
            </ul>
          </article>

          <article className="rounded-[24px] border border-[#ead8e3] bg-gradient-to-br from-white to-[#fff8fc] p-8 shadow-[0_10px_30px_rgba(17,17,17,0.06)] md:p-9">
            <div className="mb-5 flex items-center gap-4">
              <StepBadge value={2} />
              <h2 className="font-serif text-4xl text-gray-900 md:text-5xl">{useRussian ? 'Структура тренировки: выбери 6-8 упражнений' : 'Workout Structure: Choose 6-8 Exercises'}</h2>
            </div>
            <p className="mb-2 text-xl font-semibold uppercase tracking-wider text-gray-500">{useRussian ? 'Вариант 1 - Фулбоди-стиль' : 'Option 1 - Full-Body Style'}</p>
            <hr className="mb-4 border-gray-200" />
            <ul className="mb-6 space-y-3 text-xl text-gray-700 md:text-2xl">
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{useRussian ? '2 упражнения на низ тела' : '2 lower body exercises'}</li>
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{useRussian ? '2 упражнения на верх тела' : '2 upper body exercises'}</li>
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{useRussian ? '1-2 изолирующих упражнения' : '1-2 isolation exercises'}</li>
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{useRussian ? '1 упражнение на кор' : '1 core exercise'}</li>
            </ul>

            <p className="mb-2 text-xl font-semibold uppercase tracking-wider text-gray-500">{useRussian ? 'Вариант 2 - Тренировки по зонам' : 'Option 2 - Training by Zones'}</p>
            <hr className="mb-4 border-gray-200" />
            <ul className="space-y-3 text-xl text-gray-700 md:text-2xl">
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{useRussian ? '2-3 основных упражнения' : '2-3 main exercises'}</li>
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{useRussian ? '1-2 изолирующих упражнения' : '1-2 isolation exercises'}</li>
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{useRussian ? '1-2 вспомогательных упражнения' : '1-2 accessory exercises'}</li>
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{useRussian ? '1 упражнение на кор' : '1 core exercise'}</li>
            </ul>
          </article>

          <article className="rounded-[24px] border border-[#ead8e3] bg-gradient-to-br from-white to-[#fff8fc] p-8 shadow-[0_10px_30px_rgba(17,17,17,0.06)] md:p-9">
            <div className="mb-5 flex items-center gap-4">
              <StepBadge value={3} />
              <h2 className="font-serif text-4xl text-gray-900 md:text-5xl">{useRussian ? 'Формат выполнения - один вариант' : 'Execution Format - Single Option'}</h2>
            </div>
            <ul className="space-y-3 text-xl text-gray-700 md:text-2xl">
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{useRussian ? '1. Выполняй 3-4 подхода' : '1. Complete 3-4 sets'}</li>
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{useRussian ? '2. Делай 8-12 повторений в упражнении' : '2. Perform 8-12 repetitions per exercise'}</li>
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{useRussian ? '3. Отдыхай 1.5-2 минуты между упражнениями' : '3. Rest 1.5-2 minutes between exercises'}</li>
            </ul>
          </article>

          <article className="rounded-[24px] border border-[#ead8e3] bg-gradient-to-br from-white to-[#fff8fc] p-8 shadow-[0_10px_30px_rgba(17,17,17,0.06)] md:p-9">
            <div className="mb-5 flex items-center gap-4">
              <StepBadge value={4} />
              <h2 className="font-serif text-4xl text-gray-900 md:text-5xl">{useRussian ? 'Правила прогрессии' : 'Progression Guidelines'}</h2>
            </div>
            <ul className="space-y-3 text-xl text-gray-700 md:text-2xl">
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{useRussian ? 'Если легко выполняешь 4 подхода по 12 повторений с текущим весом, увеличивай вес' : 'If you can easily complete 4 sets of 12 reps with a given weight, increase the weight'}</li>
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{useRussian ? 'При необходимости увеличивай число подходов, но максимум до 4' : 'Increase the number of sets up to a maximum of 4 as needed'}</li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  )
}
