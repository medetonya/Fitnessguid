import { ArrowLeft, ChevronRight, House, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'

interface StructureCard {
  title: string
  subtitle: string
  badge: string
  borderClass: string
  titleClass: string
  to?: string
}

export default function WorkoutBuilderPage() {
  const { t } = useLanguage()
  const { pathname } = useLocation()
  const isGymRoute = pathname.includes('/workouts/gym/')
  const builderBasePath = isGymRoute ? '/workouts/gym/goal/fat-loss/workout-builder' : '/workouts/home/goal/fat-loss/workout-builder'
  const goalPath = isGymRoute ? '/workouts/gym/goal/fat-loss' : '/workouts/home/goal/fat-loss'

  const structureCards: StructureCard[] = [
    {
      title: t('workoutBuilder.fullBodyTitle'),
      subtitle: t('workoutBuilder.fullBodySubtitle'),
      badge: 'FB',
      borderClass: 'border-[#d4d4d8]',
      titleClass: 'text-[#111111]',
      to: `${builderBasePath}/full-body`,
    },
  ]

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="mx-auto max-w-5xl px-6 py-8 md:py-10">
        <div className="mb-8 flex items-center justify-between">
          <Link
            to={goalPath}
            className="inline-flex items-center gap-2 text-base font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            {t('workoutBuilder.back')}
          </Link>

          <Link
            to="/dashboard"
            className="hidden items-center gap-2 rounded-xl bg-[#efefef] px-4 py-2 text-sm text-gray-600 shadow-sm"
          >
            <House size={16} />
            {t('workoutBuilder.menu')}
          </Link>
        </div>

        <section className="mb-8">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ececec] text-[#111111]">
            <SlidersHorizontal size={30} />
          </div>
          <h1 className="font-serif text-6xl leading-[0.95] text-gray-900 md:text-7xl">{t('workoutBuilder.title')}</h1>
          <p className="mt-4 text-2xl text-gray-700">{t('workoutBuilder.subtitle')}</p>
        </section>

        <section className="space-y-4 pb-8">
          {structureCards.map((card) => (
            card.to ? (
              <Link
                key={card.title}
                to={card.to}
                className={`block w-full rounded-3xl border bg-white px-5 py-5 text-left shadow-sm transition hover:shadow ${card.borderClass}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#efefef] text-sm font-semibold text-[#111111]">
                      {card.badge}
                    </div>
                    <div>
                      <p className={`text-5xl font-semibold ${card.titleClass}`}>{card.title}</p>
                      <p className="mt-1 text-2xl text-gray-600">{card.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-gray-500" />
                </div>
              </Link>
            ) : (
              <button
                key={card.title}
                type="button"
                className={`w-full rounded-3xl border bg-white px-5 py-5 text-left shadow-sm transition hover:shadow ${card.borderClass}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#efefef] text-sm font-semibold text-[#111111]">
                      {card.badge}
                    </div>
                    <div>
                      <p className={`text-5xl font-semibold ${card.titleClass}`}>{card.title}</p>
                      <p className="mt-1 text-2xl text-gray-600">{card.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-gray-500" />
                </div>
              </button>
            )
          ))}
        </section>
      </main>
    </div>
  )
}
