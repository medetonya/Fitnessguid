import { ArrowLeft, ChevronRight, House, Sparkles, Utensils } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll'
import { useLanguage } from '../hooks/useLanguage'

export default function NutritionBasicsPage() {
  const { language } = useLanguage()
  const isRussian = language === 'ru'
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isGymRoute = pathname.includes('/workouts/gym/')
  const basePath = isGymRoute ? '/workouts/gym/nutrition' : '/workouts/home/nutrition'
  useRevealOnScroll()

  return (
    <div className="premium-nutrition-shell min-h-screen">
      <main className="mx-auto max-w-4xl px-5 py-7 md:px-6 md:py-10">
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(isGymRoute ? '/workouts/gym' : '/workouts/home')}
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
          <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[#e8e8e8]/70 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-[#efefef]/90 blur-2xl" />
          <div className="relative z-10">
            <div className="premium-chip mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={14} />
              {isRussian ? 'Система питания' : 'Nutrition System'}
            </div>
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#2c2f33] shadow-sm">
              <Utensils size={24} />
            </div>
            <h1 className="font-serif text-4xl leading-tight text-slate-900 md:text-6xl">
              {isGymRoute ? (isRussian ? 'Питание для зала' : 'Nutrition for Gym Training') : (isRussian ? 'Основы питания' : 'Nutrition Basics')}
            </h1>
            <p className="mt-3 text-lg text-slate-600 md:text-2xl">
              {isGymRoute ? (isRussian ? 'Поддержка прогресса в тренировках' : 'Support your workout progress') : (isRussian ? 'Питайся так, чтобы тренировки давали результат' : 'Eat in a way that makes training effective')}
            </p>
          </div>
        </section>

        <section className="space-y-5 pb-10">
          <article className="premium-card premium-reveal p-6 md:p-7" data-reveal>
            <h2 className="font-serif text-4xl text-[#2c2f33] md:text-6xl">{isRussian ? 'Калории решают' : 'Calories Matter'}</h2>
            <p className="mt-3 text-base leading-relaxed text-gray-500 md:text-xl">
              {isRussian ? 'Энергетический баланс определяет результат.' : 'Energy balance determines your result.'}
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-gray-200 bg-[#f5f5f5] px-4 py-3 text-base leading-relaxed text-gray-700 md:text-xl">
                {isRussian ? (
                  <>
                    Для снижения жира — необходим <span className="font-semibold text-[#2c2f33]">дефицит</span> калорий
                  </>
                ) : (
                  <>
                    For fat loss: you need a calorie <span className="font-semibold text-[#2c2f33]">deficit</span>
                  </>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-[#f5f5f5] px-4 py-3 text-base leading-relaxed text-gray-700 md:text-xl">
                {isRussian ? (
                  <>
                    Для набора мышц — небольшой <span className="font-semibold text-[#2c2f33]">профицит</span>
                  </>
                ) : (
                  <>
                    For muscle gain: a small calorie <span className="font-semibold text-[#2c2f33]">surplus</span>
                  </>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-[#f5f5f5] px-4 py-3 text-base leading-relaxed text-gray-700 md:text-xl">
                {isRussian ? (
                  <>
                    Для <span className="font-semibold text-[#2c2f33]">рекомпозиции</span> — уровень поддержки с повышенным потреблением белка
                  </>
                ) : (
                  <>
                    For <span className="font-semibold text-[#2c2f33]">recomposition</span>: maintenance calories with higher protein intake
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-[#efefef] p-4 md:p-5">
              <p className="text-base leading-relaxed text-gray-700 md:text-xl"><span className="premium-term">{isRussian ? 'Дефицит' : 'Deficit'}</span> — {isRussian ? 'вы потребляете меньше, чем тратите' : 'you consume less than you burn'}</p>
              <hr className="my-3 border-gray-300" />
              <p className="text-base leading-relaxed text-gray-700 md:text-xl"><span className="premium-term">{isRussian ? 'Профицит' : 'Surplus'}</span> — {isRussian ? 'вы потребляете больше, чем тратите' : 'you consume more than you burn'}</p>
            </div>
          </article>

          <article className="premium-card premium-card-soft premium-reveal p-6 md:p-7" data-reveal>
            <h2 className="font-serif text-4xl text-[#2c2f33] md:text-5xl">{isRussian ? 'Белки, жиры, углеводы' : 'Protein, Fats, Carbs'}</h2>
            <p className="mt-3 text-base leading-relaxed text-gray-500 md:text-xl">
              {isRussian ? 'Баланс макронутриентов определяет качество прогресса.' : 'Macronutrient balance defines the quality of progress.'}
            </p>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <p className="text-base leading-relaxed text-gray-700 md:text-xl"><span className="font-semibold text-[#2c2f33]">{isRussian ? 'Белок' : 'Protein'}</span></p>
                <p className="mt-1 text-base leading-relaxed text-gray-600 md:text-lg">{isRussian ? 'необходим для восстановления и роста мышц' : 'needed for recovery and muscle growth'}</p>
                <p className="mt-1 text-base leading-relaxed text-gray-600 md:text-lg">{isRussian ? 'ориентир: 1.6–2.2 г на кг массы тела' : 'target: 1.6-2.2 g per kg body weight'}</p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <p className="text-base leading-relaxed text-gray-700 md:text-xl"><span className="font-semibold text-[#2c2f33]">{isRussian ? 'Жиры' : 'Fats'}</span></p>
                <p className="mt-1 text-base leading-relaxed text-gray-600 md:text-lg">{isRussian ? 'важны для гормонального фона и насыщения' : 'important for hormones and satiety'}</p>
                <p className="mt-1 text-base leading-relaxed text-gray-600 md:text-lg">{isRussian ? 'не опускайте слишком низко — минимум 0.8 г на кг' : 'do not go too low - minimum 0.8 g per kg'}</p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <p className="text-base leading-relaxed text-gray-700 md:text-xl"><span className="font-semibold text-[#2c2f33]">{isRussian ? 'Углеводы' : 'Carbs'}</span></p>
                <p className="mt-1 text-base leading-relaxed text-gray-600 md:text-lg">{isRussian ? 'основной источник энергии для тренировок' : 'main energy source for training'}</p>
                <p className="mt-1 text-base leading-relaxed text-gray-600 md:text-lg">{isRussian ? 'подбираются в зависимости от активности и цели' : 'adjust according to activity and goal'}</p>
              </div>
            </div>
          </article>

          <article className="premium-card premium-reveal p-6 md:p-7" data-reveal>
            <h2 className="font-serif text-4xl text-[#2c2f33] md:text-5xl">{isRussian ? 'Стабильность важнее идеала' : 'Consistency Beats Perfection'}</h2>
            <p className="mt-3 text-base leading-relaxed text-gray-500 md:text-xl">
              {isRussian ? 'Результат создаётся системой, а не отдельными днями.' : 'Results come from the system, not single days.'}
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-gray-200 bg-[#f5f5f5] px-4 py-3 text-base leading-relaxed text-gray-700 md:text-xl">
                {isRussian ? 'Один идеальный день не даёт результата' : 'One perfect day does not create results'}
              </div>
              <div className="rounded-2xl border border-gray-200 bg-[#f5f5f5] px-4 py-3 text-base leading-relaxed text-gray-700 md:text-xl">
                {isRussian ? 'Один неудачный день не рушит прогресс' : 'One bad day does not destroy progress'}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-gray-200 bg-[#efefef] px-4 py-3">
              <p className="text-base leading-relaxed text-[#2c2f33] md:text-xl">{isRussian ? 'Важно то, что вы делаете регулярно' : 'What matters is what you do consistently'}</p>
            </div>
          </article>

          <article className="premium-card premium-card-soft premium-reveal p-6 md:p-7" data-reveal>
            <h2 className="font-serif text-4xl text-[#2c2f33] md:text-5xl">{isRussian ? 'Принцип 80/20' : '80/20 Principle'}</h2>
            <p className="mt-3 text-base leading-relaxed text-gray-500 md:text-xl">
              {isRussian ? 'Гибкость делает систему устойчивой.' : 'Flexibility makes the system sustainable.'}
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base leading-relaxed text-gray-700 md:text-xl">
                {isRussian ? 'Стремитесь к 80% цельных и питательных продуктов' : 'Aim for 80% whole and nutrient-dense foods'}
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base leading-relaxed text-gray-700 md:text-xl">
                {isRussian ? 'Оставляйте 20% на любимую еду и социальные ситуации' : 'Leave 20% for favorite foods and social situations'}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-gray-200 bg-[#efefef] px-4 py-3">
              <p className="text-base leading-relaxed text-[#2c2f33] md:text-xl">{isRussian ? 'Это помогает сохранять баланс без жёстких ограничений и формирует долгосрочные привычки' : 'This helps keep balance without rigid restrictions and builds long-term habits'}</p>
            </div>
          </article>

          <article className="premium-card premium-reveal p-6 md:p-7" data-reveal>
            <h2 className="font-serif text-4xl text-[#2c2f33] md:text-5xl">{isRussian ? 'Питание должно помогать тренировкам' : 'Nutrition Should Support Training'}</h2>
            <div className="mt-5 rounded-2xl border border-gray-200 bg-[#f5f5f5] p-4 md:p-5">
              <p className="text-base leading-relaxed text-gray-700 md:text-xl">
                {isRussian ? 'Питание - это топливо для результата и восстановления. Это не наказание за еду и не награда за тренировку.' : 'Nutrition is fuel for performance and recovery. It is not punishment for eating and not a reward for training.'}
              </p>
            </div>
          </article>

          <Link
            to={`${basePath}/calorie-macro-formulas`}
            className="premium-link-card premium-reveal block p-6 md:p-7"
            data-reveal
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-3xl font-semibold text-[#2c2f33] md:text-4xl">{isRussian ? 'Формулы калорий и БЖУ' : 'Calories and Macros Formulas'}</h3>
                <p className="mt-2 text-xl text-gray-600 md:text-2xl">{isRussian ? 'Рассчитать дневную норму' : 'Calculate daily targets'}</p>
              </div>
              <ChevronRight className="text-[#2c2f33]" size={24} />
            </div>
          </Link>

          <Link
            to={`${basePath}/harvard-plate`}
            className="premium-link-card premium-reveal block p-6 md:p-7"
            data-reveal
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-3xl font-semibold text-[#2c2f33] md:text-4xl">{isRussian ? 'Тарелка Гарварда' : 'Harvard Plate'}</h3>
                <p className="mt-2 text-xl text-gray-600 md:text-2xl">{isRussian ? 'Простая схема сбалансированного приема пищи' : 'Simple balanced meal framework'}</p>
              </div>
              <ChevronRight className="text-[#2c2f33]" size={24} />
            </div>
          </Link>
        </section>
      </main>
    </div>
  )
}
