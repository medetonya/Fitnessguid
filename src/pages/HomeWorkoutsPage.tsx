import { ArrowLeft, ChevronRight, Heart, House } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import heroFallback from '../assets/hero.png'
import { useLanguage } from '../hooks/useLanguage'

interface InfoCard {
  title: string
  subtitle: string
  icon: 'goal' | 'mindset'
  accent?: 'green' | 'rose' | 'beige'
  to?: string
}

const getIcon = (icon: InfoCard['icon']) => {
  if (icon === 'goal') {
    return <House size={20} />
  }

  if (icon === 'mindset') {
    return <Heart size={20} />
  }

  return <House size={20} />
}

const getAccent = (accent?: InfoCard['accent']) => {
  if (accent === 'green') {
    return 'text-[#111111] bg-[#ececec]'
  }

  if (accent === 'rose') {
    return 'text-[#111111] bg-[#ececec]'
  }

  if (accent === 'beige') {
    return 'text-[#111111] bg-[#efefef]'
  }

  return 'text-[#111111] bg-[#efefef]'
}

export default function HomeWorkoutsPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [heroImage, setHeroImage] = useState('/user-photos/home-workouts-hero.jpg')

  const cards: InfoCard[] = [
    {
      title: t('homeWorkouts.goalTitle'),
      subtitle: t('homeWorkouts.goalSubtitle'),
      icon: 'goal',
      to: '/workouts/home/goal',
    },
    {
      title: t('homeWorkouts.mindsetTitle'),
      subtitle: t('homeWorkouts.mindsetSubtitle'),
      icon: 'mindset',
      accent: 'rose',
      to: '/workouts/home/how-not-to-quit',
    },
  ]

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="mx-auto max-w-4xl px-6 py-8 md:py-10">
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-base font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            {t('homeWorkouts.back')}
          </button>

          <Link
            to="/dashboard"
            className="hidden items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm text-gray-600 shadow-sm"
          >
            <House size={16} />
            {t('homeWorkouts.menu')}
          </Link>
        </div>

        <section className="mb-6 md:mb-8">
          <h1 className="font-serif text-6xl leading-[0.95] text-gray-900 md:text-7xl">{t('homeWorkouts.title')}</h1>
          <p className="mt-4 text-2xl text-gray-700">{t('homeWorkouts.subtitle')}</p>
        </section>

        <section className="aesthetic-hero mb-6 rounded-[30px] border border-[#d4d4d8] bg-white shadow-sm">
          <img
            src={heroImage}
            onError={() => setHeroImage(heroFallback)}
            alt={t('homeWorkouts.heroAlt')}
            className="h-[300px] w-full object-cover md:h-[340px]"
          />
        </section>

        <section className="space-y-4 pb-10">
          {cards.map((card) => (
            card.to ? (
              <Link
                key={card.title}
                to={card.to}
                className="block w-full rounded-3xl border border-[#d5e3c0] bg-white px-5 py-5 text-left shadow-sm transition hover:shadow"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-full ${getAccent(card.accent)}`}>
                      {getIcon(card.icon)}
                    </div>
                    <div>
                      <p className={`text-4xl font-semibold ${card.accent === 'green' ? 'text-[#111111]' : 'text-gray-800'}`}>
                        {card.title}
                      </p>
                      <p className="mt-1 text-2xl text-gray-600">{card.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className={card.accent === 'green' ? 'text-[#111111]' : 'text-gray-500'} />
                </div>
              </Link>
            ) : (
              <button
                key={card.title}
                type="button"
                className="w-full rounded-3xl border border-[#d5e3c0] bg-white px-5 py-5 text-left shadow-sm transition hover:shadow"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-full ${getAccent(card.accent)}`}>
                      {getIcon(card.icon)}
                    </div>
                    <div>
                      <p className={`text-4xl font-semibold ${card.accent === 'green' ? 'text-[#111111]' : 'text-gray-800'}`}>
                        {card.title}
                      </p>
                      <p className="mt-1 text-2xl text-gray-600">{card.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className={card.accent === 'green' ? 'text-[#111111]' : 'text-gray-500'} />
                </div>
              </button>
            )
          ))}
        </section>
      </main>
    </div>
  )
}
