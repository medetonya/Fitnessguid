import { ArrowLeft, ChevronRight, Dumbbell, House, Sparkles, Target } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import heroFallback from '../assets/hero.png'
import { useLanguage } from '../hooks/useLanguage'

export default function GymWorkoutsPage() {
  const { language } = useLanguage()
  const isRussian = language === 'ru'
  const navigate = useNavigate()
  const [heroImage, setHeroImage] = useState('/user-photos/gym-workouts-hero.jpg')

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="mx-auto max-w-4xl px-6 py-8 md:py-10">
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-base font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            {isRussian ? 'Назад' : 'Back'}
          </button>
          <Link to="/dashboard" className="hidden items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
            <House size={16} />
            {isRussian ? 'Меню' : 'Menu'}
          </Link>
        </div>

        <section className="mb-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8e8e8] text-[#111111]">
            <Dumbbell size={24} />
          </div>
          <h1 className="font-serif text-6xl leading-[0.95] text-gray-900 md:text-7xl">{isRussian ? 'Тренировки в зале' : 'Gym Workouts'}</h1>
          <p className="mt-4 text-2xl text-gray-700">{isRussian ? 'Все, что нужно для тренировок в зале' : 'Everything you need for gym training'}</p>
        </section>

        <section className="aesthetic-hero mb-6 rounded-[24px] border border-[#d4d4d8] bg-white shadow-sm">
          <img
            src={heroImage}
            onError={() => setHeroImage(heroFallback)}
            alt={isRussian ? 'Тренировка в зале' : 'Gym training'}
            className="h-[220px] w-full object-cover md:h-[280px]"
          />
        </section>

        <section className="space-y-4 pb-10">
          <Link to="/workouts/gym/goal" className="block rounded-3xl border border-gray-200 bg-white px-5 py-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#ececec] text-[#111111]"><Target size={20} /></span>
                <div>
                  <p className="text-4xl font-semibold text-gray-900">{isRussian ? 'Выбрать цель' : 'Choose goal'}</p>
                  <p className="mt-1 text-xl text-gray-600">{isRussian ? 'Снижение жира или набор мышечной массы' : 'Fat loss or muscle gain'}</p>
                </div>
              </div>
              <ChevronRight className="text-gray-500" />
            </div>
          </Link>

          <Link to="/workouts/gym/checklist" className="block rounded-3xl border border-gray-200 bg-white px-5 py-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#efefef] text-[#111111]"><Sparkles size={20} /></span>
                <div>
                  <p className="text-4xl font-semibold text-gray-900">{isRussian ? 'Чек-лист перед тренировкой' : 'Pre-gym checklist'}</p>
                  <p className="mt-1 text-xl text-gray-600">{isRussian ? 'Быстрая проверка готовности к тренировке' : 'Quick workout validation checklist'}</p>
                </div>
              </div>
              <ChevronRight className="text-gray-500" />
            </div>
          </Link>

          <Link to="/workouts/gym/motivation" className="block rounded-3xl border border-gray-200 bg-white px-5 py-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#ececec] text-[#111111]"><Sparkles size={20} /></span>
                <div>
                  <p className="text-4xl font-semibold text-gray-900">{isRussian ? 'От мотивации к дисциплине' : 'Motivation to Discipline'}</p>
                  <p className="mt-1 text-xl text-gray-600">{isRussian ? 'Сформируй устойчивую привычку тренироваться' : 'Build lasting training habits'}</p>
                </div>
              </div>
              <ChevronRight className="text-gray-500" />
            </div>
          </Link>

        </section>
      </main>
    </div>
  )
}
