import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, ChevronRight, Dumbbell, FolderHeart, House, Sparkles, Utensils } from 'lucide-react'
import heroFallback from '../assets/hero.png'
import { useLanguage } from '../hooks/useLanguage'

export default function DashboardPage() {
  const { t } = useLanguage()
  const [heroImage, setHeroImage] = useState('/user-photos/gym-main.jpg')
  const [homePhoto, setHomePhoto] = useState('/user-photos/home-thumb.jpg')
  const [gymPhoto, setGymPhoto] = useState('/user-photos/gym-thumb.jpg')

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="app-shell app-shell-wide">
        <section className="app-hero fade-up mb-4">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#fbcfe8]/60 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-[#fce7f3]/70 blur-2xl" />

          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#f3d0e1] bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#be185d]">
              <Sparkles size={14} />
              {t('dashboard.badge')}
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
              {t('dashboard.title')}
            </h1>
            <p className="mt-2 text-lg text-gray-600 md:text-xl">{t('dashboard.subtitle')}</p>
          </div>
        </section>

        <section className="aesthetic-hero fade-up mb-4 overflow-hidden rounded-[1.25rem] border border-[#d4d4d8] bg-white shadow-[0_8px_18px_rgba(17,17,17,0.06)]">
          <img
            src={heroImage}
            onError={() => setHeroImage(heroFallback)}
            alt={t('dashboard.altWorkoutEnvironment')}
            className="h-[200px] w-full object-cover md:h-[220px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
          <div className="absolute inset-0 flex items-end justify-start px-5 pb-5 text-left">
            <p className="max-w-xl text-base font-medium text-white md:text-lg">{t('dashboard.heroQuote')}</p>
          </div>
        </section>

        <section className="mb-6 space-y-2.5">
          <Link
            to="/workouts/home"
            className="app-card-soft tap-feedback block w-full text-left"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[#f3d0e1]">
                  <img
                    src={homePhoto}
                    onError={() => setHomePhoto(heroFallback)}
                    alt={t('dashboard.altHomeWorkouts')}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <House size={18} />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-semibold text-gray-900">{t('dashboard.homeTitle')}</h2>
                  <p className="mt-1 text-lg text-gray-600">{t('dashboard.homeSubtitle')}</p>
                </div>
              </div>
              <ChevronRight className="text-[#be185d]" size={24} />
            </div>
          </Link>

          <Link
            to="/workouts/gym"
            className="app-card-soft tap-feedback block w-full text-left"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[#f3d0e1]">
                  <img
                    src={gymPhoto}
                    onError={() => setGymPhoto(heroFallback)}
                    alt={t('dashboard.altGymWorkouts')}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <Dumbbell size={18} />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-semibold text-gray-900">{t('dashboard.gymTitle')}</h2>
                  <p className="mt-1 text-lg text-gray-600">{t('dashboard.gymSubtitle')}</p>
                </div>
              </div>
              <ChevronRight className="text-[#be185d]" size={24} />
            </div>
          </Link>

          <div className="app-kpi-grid sm:grid-cols-2">
            <Link
              to="/workouts/home/progress-tracking"
              className="app-card tap-feedback block text-left"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f2f2] text-[#be185d]">
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">{t('dashboard.progressTitle')}</h2>
                    <p className="mt-1 text-base text-gray-600">{t('dashboard.progressSubtitle')}</p>
                  </div>
                </div>
                <ChevronRight className="text-[#be185d]" size={22} />
              </div>
            </Link>

            <Link
              to="/workouts/home/nutrition"
              className="app-card tap-feedback block text-left"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f2f2] text-[#be185d]">
                    <Utensils size={18} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">{t('dashboard.nutritionTitle')}</h2>
                    <p className="mt-1 text-base text-gray-600">{t('dashboard.nutritionSubtitle')}</p>
                  </div>
                </div>
                <ChevronRight className="text-[#be185d]" size={22} />
              </div>
            </Link>

            <Link
              to="/my-workouts"
              className="app-card tap-feedback block text-left"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f2f2] text-[#be185d]">
                    <FolderHeart size={18} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">{t('dashboard.myWorkoutsTitle')}</h2>
                    <p className="mt-1 text-base text-gray-600">{t('dashboard.myWorkoutsSubtitle')}</p>
                  </div>
                </div>
                <ChevronRight className="text-[#be185d]" size={22} />
              </div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
