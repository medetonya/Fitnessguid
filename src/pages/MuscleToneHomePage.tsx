import { ArrowLeft, CalendarDays, ChevronRight, CircleCheck, House, SlidersHorizontal, TrendingUp } from 'lucide-react'
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

export default function MuscleToneHomePage() {
  const { language } = useLanguage()
  const isRussian = language === 'ru'
  const navigate = useNavigate()
  const [heroImage, setHeroImage] = useState('/user-photos/tone-hero.jpg')
  const { pathname } = useLocation()
  const isGymRoute = pathname.includes('/workouts/gym/')
  const goalBasePath = isGymRoute ? '/workouts/gym/goal/muscle-tone' : '/workouts/home/goal/muscle-tone'

  const actionCards: ActionCard[] = [
    {
      title: isRussian ? 'Готовая схема' : 'Ready scheme',
      subtitle: isRussian ? 'Пошаговая структура тренировки' : 'Step-by-step workout structure',
      icon: 'ready',
      to: `${goalBasePath}/ready-scheme`,
    },
    {
      title: isRussian ? 'Конструктор тренировок' : 'Workout builder',
      subtitle: isRussian ? 'Собери свою тренировку на тонус' : 'Build your own tone workout',
      icon: 'builder',
      to: `${goalBasePath}/workout-builder`,
    },
    {
      title: isRussian ? 'Пример готовой тренировки' : 'Ready workout example',
      subtitle: isRussian ? 'Полная программа на 3 дня' : 'Complete 3-day program',
      icon: 'example',
      to: `${goalBasePath}/ready-workout`,
    },
  ]

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="mx-auto max-w-5xl px-6 py-8 md:py-10">
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigateBackWithFallback(navigate, isGymRoute ? '/workouts/gym/goal' : '/workouts/home/goal')}
            className="inline-flex items-center gap-2 text-base font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            {isRussian ? 'Назад' : 'Come back'}
          </button>

          <Link
            to="/dashboard"
            className="hidden items-center gap-2 rounded-xl bg-[#efefef] px-4 py-2 text-sm text-gray-600 shadow-sm"
          >
            <House size={16} />
            {isRussian ? 'Меню' : 'Menu'}
          </Link>
        </div>

        <section className="mb-8">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ececec] text-[#111111]">
            <TrendingUp size={30} />
          </div>
          <h1 className="font-serif text-6xl leading-[0.95] text-gray-900 md:text-7xl">
            {isGymRoute
              ? isRussian
                ? 'Набор мышц / тонус в зале'
                : 'Muscle Gain / Tone in the Gym'
              : isRussian
                ? 'Тонус мышц дома'
                : 'Muscle Tone at Home'}
          </h1>
          <p className="mt-4 text-2xl text-gray-700">{isRussian ? 'Сформируй рельеф и тонус мышц' : 'Shape and define your muscles'}</p>
        </section>

        <section className="aesthetic-hero mb-6 rounded-[24px] border border-[#d4d4d8] bg-white shadow-sm">
          <img
            src={heroImage}
            onError={() => setHeroImage(heroFallback)}
            alt={isRussian ? 'Тренировка на тонус' : 'Toning workout'}
            className="h-[220px] w-full object-cover md:h-[280px]"
          />
        </section>

        <section className="mb-6 rounded-[24px] border border-[#d4d4d8] bg-white p-8 shadow-sm">
          <h2 className="font-serif text-5xl text-gray-900">{isRussian ? 'Когда выбирать эту цель' : 'When to choose this goal'}</h2>
          <p className="mt-5 text-2xl leading-relaxed text-gray-600">
            {isRussian
              ? 'Выбирай эту цель, если хочешь улучшить рельеф мышц, подтянуть форму и сделать тело более выраженным.'
              : 'Choose this when you want to build muscle definition, improve body shape, and create a toned appearance.'}
          </p>
          <p className="mt-3 text-2xl leading-relaxed text-gray-600">
            {isRussian
              ? 'Подходит для поддержания текущего веса при улучшении композиции тела.'
              : 'Perfect for maintaining current weight while improving body composition.'}
          </p>
        </section>

        <section className="mb-6 rounded-[24px] border border-[#d4d4d8] bg-white p-8 shadow-sm">
          <h2 className="font-serif text-5xl text-gray-900">{isRussian ? 'Принципы тренинга' : 'Training principles'}</h2>
          <ul className="mt-5 max-w-2xl space-y-3 text-2xl leading-relaxed text-gray-600">
            <li>{isRussian ? 'Более медленный и контролируемый темп' : 'Slower and more controlled tempo'}</li>
            <li>{isRussian ? 'Больше объема на одну целевую зону за тренировку' : 'More work for one target zone per session'}</li>
            <li>{isRussian ? 'Более длинные паузы отдыха' : 'Longer rest periods'}</li>
            <li>{isRussian ? 'Максимальная кардио-интенсивность не обязательна' : 'No need for maximal cardio intensity'}</li>
            <li>{isRussian ? 'Фокус на ощущении работы мышц' : 'Focus on feeling the muscle work'}</li>
            <li>{isRussian ? 'Связь мозг-мышца имеет решающее значение' : 'Mind-muscle connection is key'}</li>
          </ul>
        </section>

        <section className="mb-8 rounded-[24px] border border-[#d4d4d8] bg-white p-8 shadow-sm">
          <h2 className="font-serif text-5xl text-gray-900">{isRussian ? 'Важные заметки' : 'Important notes'}</h2>
          <p className="mt-5 text-2xl leading-relaxed text-gray-600">{isRussian ? 'Баланс белков, жиров и углеводов имеет ключевое значение.' : 'A balanced intake of protein, fats, and carbohydrates is essential.'}</p>
          <p className="mt-3 text-2xl leading-relaxed text-gray-600">
            {isRussian
              ? 'Регулярность дает заметный результат. Прогрессивная нагрузка (постепенное усложнение) необходима для дальнейшего прогресса.'
              : 'Consistency brings visible results. Progressive overload (gradually increasing difficulty) is essential for continued progress.'}
          </p>
        </section>

        <section className="space-y-4 pb-8">
          {actionCards.map((card) =>
            card.to ? (
              <Link
                key={card.title}
                to={card.to}
                className="block w-full rounded-3xl border border-[#d4d4d8] bg-white px-5 py-5 text-left shadow-sm transition hover:shadow"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#efefef] text-[#111111]">
                      {getCardIcon(card.icon)}
                    </div>
                    <div>
                      <p className="text-5xl font-semibold text-gray-900">{card.title}</p>
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
                className="w-full rounded-3xl border border-[#d5e3c0] bg-white px-5 py-5 text-left shadow-sm transition hover:shadow"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#efefef] text-[#111111]">
                      {getCardIcon(card.icon)}
                    </div>
                    <div>
                      <p className="text-5xl font-semibold text-gray-900">{card.title}</p>
                      <p className="mt-1 text-2xl text-gray-600">{card.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-gray-500" />
                </div>
              </button>
            )
          )}
        </section>
      </main>
    </div>
  )
}
