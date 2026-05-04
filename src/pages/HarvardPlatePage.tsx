import { ArrowLeft, House, Sparkles } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll'
import { useLanguage } from '../hooks/useLanguage'

export default function HarvardPlatePage() {
  const { language } = useLanguage()
  const isRussian = language === 'ru'
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isGymRoute = pathname.includes('/workouts/gym/')
  const plateImage = isRussian ? '/user-photos/harvard-plate-ru.jpg' : '/user-photos/harvard-plate-en.jpg'
  const fallbackImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Harvard-healthy-eating-plate.svg/1200px-Harvard-healthy-eating-plate.svg.png'
  const plateFrameClass = isRussian
    ? 'mx-auto mt-6 aspect-square w-full max-w-[520px] overflow-hidden rounded-full border-2 border-[#d4d4d8] bg-white shadow-sm md:max-w-[620px]'
    : 'mx-auto mt-6 w-full max-w-[520px] overflow-hidden rounded-2xl border-2 border-[#d4d4d8] bg-white shadow-sm md:max-w-[700px]'
  const plateImageClass = isRussian
    ? 'h-full w-full rounded-full object-cover object-center'
    : 'block h-auto w-full object-contain'
  useRevealOnScroll()

  return (
    <div className="premium-nutrition-shell min-h-screen">
      <main className="mx-auto max-w-4xl px-5 py-7 md:px-6 md:py-10">
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(isGymRoute ? '/workouts/gym/nutrition' : '/workouts/home/nutrition')}
            className="premium-nav-btn inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-base font-medium text-slate-600"
          >
            <ArrowLeft size={18} />
            {isRussian ? 'Назад' : 'Back'}
          </button>

          <Link
            to="/dashboard"
            className="premium-nav-btn hidden items-center gap-2 rounded-2xl px-4 py-2 text-sm text-slate-600 sm:inline-flex"
          >
            <House size={16} />
            {isRussian ? 'Меню' : 'Menu'}
          </Link>
        </div>

        <section className="premium-hero premium-reveal relative mb-8 overflow-hidden rounded-[28px] p-6 md:p-7" data-reveal>
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-sky-200/60 blur-2xl" />
          <div className="relative z-10">
            <div className="premium-chip mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={14} />
              {isRussian ? 'Метод тарелки' : 'Plate Method'}
            </div>
            <h1 className="font-serif text-4xl leading-tight text-slate-900 md:text-6xl">{isRussian ? 'Тарелка Гарварда' : 'Harvard Plate'}</h1>
            <p className="mt-3 text-lg text-slate-600 md:text-2xl">{isRussian ? 'Простая визуальная схема сбалансированного питания' : 'A simple visual framework for balanced meals'}</p>
          </div>
        </section>

        <section className="space-y-5 pb-10">
          <article className="premium-card premium-card-soft premium-reveal p-6 md:p-7" data-reveal>
            <p className="text-xl leading-relaxed text-gray-600 md:text-2xl">
              {isRussian ? 'Тарелка здорового питания Гарварда - удобный способ собрать сбалансированный прием пищи без постоянного подсчета калорий.' : 'The Harvard Healthy Eating Plate is a practical way to build balanced meals without constant calorie counting.'}
            </p>

            <div className={plateFrameClass}>
              <img
                src={plateImage}
                onError={(event) => {
                  event.currentTarget.onerror = null
                  event.currentTarget.src = fallbackImage
                }}
                alt={isRussian ? 'Тарелка здорового питания Гарварда' : 'Harvard healthy eating plate'}
                className={plateImageClass}
              />
            </div>
          </article>

          <article className="premium-card premium-reveal p-6 md:p-7" data-reveal>
            <h2 className="font-serif text-4xl text-[#2c2f33] md:text-5xl">{isRussian ? 'Как делить тарелку' : 'How to Split the Plate'}</h2>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-[#f3d0e1] bg-[#fff7fb] p-4">
                <p className="text-lg font-semibold text-[#111111]">{isRussian ? '1/2 Овощи и фрукты' : '1/2 Vegetables and Fruits'}</p>
                <p className="mt-1 text-base leading-relaxed text-gray-600">{isRussian ? 'Разные цвета и виды. Овощей больше, чем фруктов.' : 'Choose different colors and types. More vegetables than fruits.'}</p>
              </div>
              <div className="rounded-2xl border border-[#d4d4d8] bg-[#fafafa] p-4">
                <p className="text-lg font-semibold text-[#111111]">{isRussian ? '1/4 Белок' : '1/4 Protein'}</p>
                <p className="mt-1 text-base leading-relaxed text-gray-600">{isRussian ? 'Рыба, курица, бобовые, орехи, яйца, нежирное мясо.' : 'Fish, chicken, legumes, nuts, eggs, lean meat.'}</p>
              </div>
              <div className="rounded-2xl border border-[#d4d4d8] bg-[#fafafa] p-4">
                <p className="text-lg font-semibold text-[#111111]">{isRussian ? '1/4 Цельнозерновые' : '1/4 Whole Grains'}</p>
                <p className="mt-1 text-base leading-relaxed text-gray-600">{isRussian ? 'Бурый рис, киноа, цельнозерновой хлеб, овсянка, бобовые.' : 'Brown rice, quinoa, whole-grain bread, oats, legumes.'}</p>
              </div>
            </div>
          </article>

          <article className="premium-card premium-card-soft premium-reveal p-6 md:p-7" data-reveal>
            <h2 className="font-serif text-4xl text-[#2c2f33] md:text-5xl">{isRussian ? 'Дополнительные рекомендации' : 'Additional Recommendations'}</h2>
            <ul className="mt-4 space-y-2 text-xl leading-relaxed text-gray-600 md:text-2xl">
              <li>{isRussian ? 'Используй полезные масла умеренно (оливковое, авокадо)' : 'Use healthy oils in moderation (olive, avocado)'}</li>
              <li>{isRussian ? 'Пей воду, кофе или чай (без сладких напитков)' : 'Drink water, coffee, or tea (avoid sugary drinks)'}</li>
              <li>{isRussian ? 'Молочные продукты: 1-2 порции в день' : 'Dairy: 1-2 servings per day'}</li>
              <li>{isRussian ? 'Старайся быть активной в течение дня' : 'Stay active throughout the day'}</li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  )
}
