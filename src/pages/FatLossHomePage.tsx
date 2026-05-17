import { ArrowLeft, CalendarDays, ChevronRight, CircleCheck, Clock3, House, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import heroFallback from '../assets/hero.png'
import { useLanguage } from '../hooks/useLanguage'
import { navigateBackWithFallback } from '../lib/navigation'

interface ActionCard {
  title: string
  subtitle: string
  icon: 'ready' | 'builder' | 'example'
  to?: string
}

const getCardIcon = (icon: ActionCard['icon']) => {
  if (icon === 'ready') {
    return <CircleCheck size={22} />
  }

  if (icon === 'builder') {
    return <SlidersHorizontal size={22} />
  }

  return <CalendarDays size={22} />
}

export default function FatLossHomePage() {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [heroImage, setHeroImage] = useState('/user-photos/fat-loss-home-hero.jpg')
  const { pathname } = useLocation()
  const isGymRoute = pathname.includes('/workouts/gym/')
  const isRussian = language === 'ru'
  const goalBasePath = isGymRoute ? '/workouts/gym/goal/fat-loss' : '/workouts/home/goal/fat-loss'
  const cardTitleClass = isRussian ? 'text-[1.75rem] leading-tight tracking-tight md:text-5xl' : 'text-5xl'
  const cardSubtitleClass = isRussian ? 'mt-1 text-[1.02rem] leading-snug text-gray-600 md:text-2xl' : 'mt-1 text-2xl text-gray-600'

  const actionCards: ActionCard[] = [
    {
      title: t('fatLossGoal.cardReadyTitle'),
      subtitle: t('fatLossGoal.cardReadySubtitle'),
      icon: 'ready',
      to: `${goalBasePath}/ready-scheme`,
    },
    {
      title: t('fatLossGoal.cardBuilderTitle'),
      subtitle: t('fatLossGoal.cardBuilderSubtitle'),
      icon: 'builder',
      to: `${goalBasePath}/workout-builder`,
    },
    {
      title: t('fatLossGoal.cardExampleTitle'),
      subtitle: t('fatLossGoal.cardExampleSubtitle'),
      icon: 'example',
      to: `${goalBasePath}/ready-workout`,
    },
  ]

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-10">
        <div className="mb-6 flex items-center justify-between md:mb-8">
          <button
            type="button"
            onClick={() => navigateBackWithFallback(navigate, isGymRoute ? '/workouts/gym/goal' : '/workouts/home/goal')}
            className="inline-flex items-center gap-2 text-base font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            {t('fatLossGoal.back')}
          </button>

          <Link
            to="/dashboard"
            className="hidden items-center gap-2 rounded-xl bg-[#efefef] px-4 py-2 text-sm text-gray-600 shadow-sm"
          >
            <House size={16} />
            {t('fatLossGoal.menu')}
          </Link>
        </div>

        <section className="mb-6 md:mb-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#ececec] text-[#111111] md:mb-4 md:h-16 md:w-16">
            <Clock3 size={isRussian ? 22 : 30} />
          </div>
          <h1 className={`font-serif text-gray-900 ${isRussian ? 'text-[1.95rem] leading-[1.06] tracking-tight md:text-6xl' : 'text-6xl leading-[0.95] md:text-7xl'}`}>
            {isGymRoute ? t('fatLossGoal.titleGym') : t('fatLossGoal.titleHome')}
          </h1>
          <p className={`${isRussian ? 'mt-2 max-w-3xl text-[0.98rem] leading-snug text-gray-700 md:mt-4 md:text-2xl' : 'mt-4 text-2xl text-gray-700'}`}>{t('fatLossGoal.subtitle')}</p>
        </section>

        <section className="aesthetic-hero mb-5 rounded-[20px] border border-[#d4d4d8] bg-white shadow-sm md:mb-6 md:rounded-[24px]">
          <img
            src={heroImage}
            onError={() => setHeroImage(heroFallback)}
            alt={t('fatLossGoal.heroAlt')}
            className="h-[220px] w-full object-cover md:h-[280px]"
          />
        </section>

        <section className={`mb-5 rounded-[20px] border border-[#d4d4d8] bg-white shadow-sm md:mb-6 md:rounded-[24px] ${isRussian ? 'p-4.5 md:p-8' : 'p-8'}`}>
          <h2 className={`font-serif text-gray-900 ${isRussian ? 'text-[1.6rem] leading-tight tracking-tight md:text-5xl' : 'text-5xl'}`}>{t('fatLossGoal.whenTitle')}</h2>
          <p className={`${isRussian ? 'mt-2.5 text-[1.03rem] leading-[1.46] text-gray-600 md:mt-5 md:text-2xl' : 'mt-5 text-2xl leading-relaxed text-gray-600'}`}>
            {t('fatLossGoal.whenBody')}
          </p>
        </section>

        <section className={`mb-5 rounded-[20px] border border-[#d4d4d8] bg-white shadow-sm md:mb-6 md:rounded-[24px] ${isRussian ? 'p-4.5 md:p-8' : 'p-8'}`}>
          <h2 className={`font-serif text-gray-900 ${isRussian ? 'text-[1.6rem] leading-tight tracking-tight md:text-5xl' : 'text-5xl'}`}>{t('fatLossGoal.principlesTitle')}</h2>
          <ul className={`${isRussian ? 'mt-2.5 space-y-2 text-[1.03rem] leading-[1.46] text-gray-600 md:mt-5 md:text-2xl' : 'mt-5 space-y-3 text-2xl leading-relaxed text-gray-600'}`}>
            <li className={isRussian ? 'flex items-start gap-2.5' : undefined}>
              {isRussian && <span className="mt-[0.6em] h-1.5 w-1.5 rounded-full bg-[#9d174d]" />}
              <span>{t('fatLossGoal.principle1')}</span>
            </li>
            <li className={isRussian ? 'flex items-start gap-2.5' : undefined}>
              {isRussian && <span className="mt-[0.6em] h-1.5 w-1.5 rounded-full bg-[#9d174d]" />}
              <span>{t('fatLossGoal.principle2')}</span>
            </li>
            <li className={isRussian ? 'flex items-start gap-2.5' : undefined}>
              {isRussian && <span className="mt-[0.6em] h-1.5 w-1.5 rounded-full bg-[#9d174d]" />}
              <span>{t('fatLossGoal.principle3')}</span>
            </li>
            <li className={isRussian ? 'flex items-start gap-2.5' : undefined}>
              {isRussian && <span className="mt-[0.6em] h-1.5 w-1.5 rounded-full bg-[#9d174d]" />}
              <span>{t('fatLossGoal.principle4')}</span>
            </li>
            <li className={isRussian ? 'flex items-start gap-2.5' : undefined}>
              {isRussian && <span className="mt-[0.6em] h-1.5 w-1.5 rounded-full bg-[#9d174d]" />}
              <span>{t('fatLossGoal.principle5')}</span>
            </li>
          </ul>
        </section>

        <section className={`mb-6 rounded-[20px] border border-[#d4d4d8] bg-white shadow-sm md:mb-8 md:rounded-[24px] ${isRussian ? 'p-4.5 md:p-8' : 'p-8'}`}>
          <h2 className={`font-serif text-gray-900 ${isRussian ? 'text-[1.6rem] leading-tight tracking-tight md:text-5xl' : 'text-5xl'}`}>{t('fatLossGoal.notesTitle')}</h2>
          <p className={`${isRussian ? 'mt-2.5 text-[1.03rem] leading-[1.46] text-gray-600 md:mt-5 md:text-2xl' : 'mt-5 text-2xl leading-relaxed text-gray-600'}`}>
            {t('fatLossGoal.notesBody1')}
          </p>
          <p className={`${isRussian ? 'mt-2 text-[1.03rem] leading-[1.46] text-gray-600 md:mt-3 md:text-2xl' : 'mt-3 text-2xl leading-relaxed text-gray-600'}`}>
            {t('fatLossGoal.notesBody2')}
          </p>
        </section>

        <section className="space-y-3.5 pb-7 md:space-y-4 md:pb-8">
          {actionCards.map((card) => (
            card.to ? (
              <Link
                key={card.title}
                to={card.to}
                className="block w-full rounded-3xl border border-[#d4d4d8] bg-white px-4 py-4 text-left shadow-sm transition hover:shadow md:px-5 md:py-5"
              >
                <div className="flex items-center justify-between gap-2.5 md:gap-3">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#efefef] text-[#111111] md:h-14 md:w-14">
                      {getCardIcon(card.icon)}
                    </div>
                    <div>
                      <p className={`${cardTitleClass} font-semibold text-gray-900`}>{card.title}</p>
                      <p className={`${cardSubtitleClass} text-gray-600`}>{card.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-500 md:h-6 md:w-6" />
                </div>
              </Link>
            ) : (
              <button
                key={card.title}
                type="button"
                className="w-full rounded-3xl border border-[#d4d4d8] bg-white px-4 py-4 text-left shadow-sm transition hover:shadow md:px-5 md:py-5"
              >
                <div className="flex items-center justify-between gap-2.5 md:gap-3">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#efefef] text-[#111111] md:h-14 md:w-14">
                      {getCardIcon(card.icon)}
                    </div>
                    <div>
                      <p className={`${cardTitleClass} font-semibold text-gray-900`}>{card.title}</p>
                      <p className={`${cardSubtitleClass} text-gray-600`}>{card.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-500 md:h-6 md:w-6" />
                </div>
              </button>
            )
          ))}
        </section>
      </main>
    </div>
  )
}
