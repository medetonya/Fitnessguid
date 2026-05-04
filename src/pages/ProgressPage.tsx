import { ArrowLeft, CalendarCheck2, House, Sparkles, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'

export default function ProgressPage() {
  const { language } = useLanguage()
  const isRussian = language === 'ru'

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="app-shell">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-base font-medium text-gray-600 hover:text-gray-900">
            <ArrowLeft size={18} />
            {isRussian ? 'Назад' : 'Back'}
          </Link>
          <Link to="/dashboard" className="hidden items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
            <House size={16} />
            {isRussian ? 'Меню' : 'Menu'}
          </Link>
        </div>

        <section className="app-hero fade-up mb-4">
          <div className="pointer-events-none absolute -right-10 -top-8 h-24 w-24 rounded-full bg-[#fbcfe8]/60 blur-2xl" />
          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#f3d0e1] bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#be185d]">
              <Sparkles size={14} />
              {isRussian ? 'Прогресс' : 'Progress'}
            </div>
            <h1 className="font-serif text-5xl text-gray-900 md:text-6xl">{isRussian ? 'Прогресс' : 'Progress'}</h1>
            <p className="mt-3 text-xl text-gray-600 md:text-2xl">{isRussian ? 'Отслеживай регулярность и завершенные тренировки.' : 'Track consistency and completed workouts.'}</p>
          </div>
        </section>

        <section className="app-kpi-grid gap-3">
          <article className="app-kpi fade-up">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf3ff] text-[#2d6fe5]"><CalendarCheck2 size={20} /></div>
            <p className="text-sm uppercase tracking-wider text-gray-500">{isRussian ? 'Завершено тренировок' : 'Completed Workouts'}</p>
            <p className="mt-2 text-4xl font-bold text-gray-900">0</p>
          </article>

          <article className="app-kpi fade-up">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1f7] text-[#be185d]"><Trophy size={20} /></div>
            <p className="text-sm uppercase tracking-wider text-gray-500">{isRussian ? 'Текущая серия' : 'Current Streak'}</p>
            <p className="mt-2 text-4xl font-bold text-gray-900">0</p>
          </article>
        </section>

        <section className="app-card fade-up mt-3">
          <p className="text-sm text-[#52525b]">{isRussian ? 'Пока нет записей. Заверши первую тренировку, чтобы открыть личную историю прогресса.' : 'No records yet. Complete your first workout to unlock your personal progress history.'}</p>
        </section>
      </main>
    </div>
  )
}
