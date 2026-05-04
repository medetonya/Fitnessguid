import { ArrowLeft, ChevronRight, Clock3, House, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import heroFallback from '../assets/hero.png'
import { useLanguage } from '../hooks/useLanguage'

interface GoalCard {
  title: string
  subtitle: string
  icon: 'fat-loss' | 'muscle-tone'
  accent?: 'plum' | 'rose'
  to?: string
}

const getIcon = (icon: GoalCard['icon']) => {
  if (icon === 'fat-loss') {
    return <Clock3 size={20} />
  }

  return <TrendingUp size={20} />
}

const getAccent = (accent?: GoalCard['accent']) => {
  if (accent === 'plum') {
    return 'text-[#52525b] bg-[#e8e8e8]'
  }

  return 'text-[#111111] bg-[#ececec]'
}

export default function ChooseGoalPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [heroImage, setHeroImage] = useState('/user-photos/goal-hero.jpg')

  const goals: GoalCard[] = [
    {
      title: t('chooseGoal.fatLossTitle'),
      subtitle: t('chooseGoal.fatLossSubtitle'),
      icon: 'fat-loss',
      accent: 'rose',
      to: '/workouts/home/goal/fat-loss',
    },
    {
      title: t('chooseGoal.muscleToneTitle'),
      subtitle: t('chooseGoal.muscleToneSubtitle'),
      icon: 'muscle-tone',
      accent: 'plum',
      to: '/workouts/home/goal/muscle-tone',
    },
  ]

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="mx-auto max-w-4xl px-6 py-8 md:py-10">
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/workouts/home')}
            className="inline-flex items-center gap-2 text-base font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            {t('chooseGoal.back')}
          </button>

          <Link
            to="/dashboard"
            className="hidden items-center gap-2 rounded-xl bg-[#efefef] px-4 py-2 text-sm text-gray-600 shadow-sm"
          >
            <House size={16} />
            {t('chooseGoal.menu')}
          </Link>
        </div>

        <section className="mb-6 md:mb-8">
          <h1 className="font-serif text-6xl leading-[0.95] text-gray-900 md:text-7xl">{t('chooseGoal.title')}</h1>
          <p className="mt-4 text-2xl text-gray-700">{t('chooseGoal.subtitle')}</p>
        </section>

        <section className="aesthetic-hero mb-6 rounded-[30px] border border-[#d4d4d8] bg-white shadow-sm">
          <img
            src={heroImage}
            onError={() => setHeroImage(heroFallback)}
            alt={t('chooseGoal.heroAlt')}
            className="h-[300px] w-full object-cover md:h-[340px]"
          />
        </section>

        <section className="space-y-4 pb-10">
          {goals.map((goal) => (
            goal.to ? (
              <Link
                key={goal.title}
                to={goal.to}
                className={`block w-full rounded-3xl border bg-white px-5 py-5 text-left shadow-sm transition hover:shadow ${goal.accent === 'plum' ? 'border-[#d4d4d8]' : 'border-[#d4d4d8]'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-full ${getAccent(goal.accent)}`}>
                      {getIcon(goal.icon)}
                    </div>
                    <div>
                      <p className="text-4xl font-semibold text-gray-900">
                        {goal.title}
                      </p>
                      <p className="mt-1 text-2xl text-gray-600">{goal.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className={goal.accent === 'plum' ? 'text-[#52525b]' : 'text-[#111111]'} />
                </div>
              </Link>
            ) : (
              <button
                key={goal.title}
                type="button"
                className={`w-full rounded-3xl border bg-white px-5 py-5 text-left shadow-sm transition hover:shadow ${goal.accent === 'plum' ? 'border-[#d4d4d8]' : 'border-[#d4d4d8]'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-full ${getAccent(goal.accent)}`}>
                      {getIcon(goal.icon)}
                    </div>
                    <div>
                      <p className="text-4xl font-semibold text-gray-900">{goal.title}</p>
                      <p className="mt-1 text-2xl text-gray-600">{goal.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className={goal.accent === 'plum' ? 'text-[#52525b]' : 'text-[#111111]'} />
                </div>
              </button>
            )
          ))}
        </section>
      </main>
    </div>
  )
}
