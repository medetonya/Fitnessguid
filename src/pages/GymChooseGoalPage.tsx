import { ArrowLeft, ChevronRight, Clock3, House, Sparkles, TrendingUp } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'

export default function GymChooseGoalPage() {
  const { language } = useLanguage()
  const isRussian = language === 'ru'
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="mx-auto max-w-4xl px-6 py-8 md:py-10">
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/workouts/gym')}
            className="inline-flex items-center gap-2 text-base font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            {isRussian ? 'Назад' : 'Back'}
          </button>
          <Link to="/dashboard" className="hidden items-center gap-2 rounded-xl bg-[#efefef] px-4 py-2 text-sm text-gray-600 shadow-sm">
            <House size={16} />
            {isRussian ? 'Меню' : 'Menu'}
          </Link>
        </div>

        <section className="relative mb-8 overflow-hidden rounded-[28px] border border-[#f3d0e1] bg-gradient-to-br from-white via-[#fff7fb] to-[#ffeef5] p-7 shadow-sm">
          <div className="pointer-events-none absolute -right-10 -top-8 h-24 w-24 rounded-full bg-[#fbcfe8]/60 blur-2xl" />
          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#f3d0e1] bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#be185d]">
              <Sparkles size={14} />
              {isRussian ? 'Выбор цели в зале' : 'Gym Goal Select'}
            </div>
            <h1 className="font-serif text-6xl leading-[0.95] text-gray-900 md:text-7xl">{isRussian ? 'Выбери цель' : 'Choose your goal'}</h1>
            <p className="mt-4 text-2xl text-gray-700">{isRussian ? 'Выбери цель своей тренировки в зале' : 'Select your gym training objective'}</p>
          </div>
        </section>

        <section className="space-y-4 pb-10">
          <Link to="/workouts/gym/goal/fat-loss" className="block rounded-3xl border border-[#f3d0e1] bg-gradient-to-r from-white to-[#fff7fb] px-5 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#e8e8e8] text-[#111111]"><Clock3 size={20} /></span>
                <div>
                  <p className="text-3xl font-semibold text-gray-900">{isRussian ? 'Снижение жира' : 'Fat Loss'}</p>
                  <p className="mt-1 text-xl text-gray-600">{isRussian ? 'Больше объема, короче отдых, умеренные веса' : 'Higher volume, shorter rest, moderate weights'}</p>
                </div>
              </div>
              <ChevronRight className="text-[#be185d]" />
            </div>
          </Link>

          <Link to="/workouts/gym/goal/muscle-tone" className="block rounded-3xl border border-[#f3d0e1] bg-gradient-to-r from-white to-[#fff7fb] px-5 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#e8e8e8] text-[#52525b]"><TrendingUp size={20} /></span>
                <div>
                  <p className="text-3xl font-semibold text-gray-900">{isRussian ? 'Набор мышц / Тонус / Рекомпозиция' : 'Muscle Gain / Tone / Recomposition'}</p>
                  <p className="mt-1 text-xl text-gray-600">{isRussian ? 'Прогрессивная нагрузка и акцентная работа по зонам' : 'Progressive overload and targeted training'}</p>
                </div>
              </div>
              <ChevronRight className="text-[#be185d]" />
            </div>
          </Link>
        </section>
      </main>
    </div>
  )
}
