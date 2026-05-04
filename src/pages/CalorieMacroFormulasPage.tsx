import { ArrowLeft, Calculator, House, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll'
import { useLanguage } from '../hooks/useLanguage'

type Gender = 'male' | 'female'
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extreme'
type Goal = 'fat_loss' | 'tone' | 'muscle_gain'

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extreme: 1.9,
}

const goalAdjustments: Record<Goal, number> = {
  fat_loss: -400,
  tone: 0,
  muscle_gain: 250,
}

const macroTargets: Record<Goal, { proteinPct: number; fatsPct: number; carbsPct: number }> = {
  fat_loss: { proteinPct: 35, fatsPct: 25, carbsPct: 40 },
  tone: { proteinPct: 30, fatsPct: 25, carbsPct: 45 },
  muscle_gain: { proteinPct: 30, fatsPct: 25, carbsPct: 45 },
}

const round = (value: number) => Math.round(value)

export default function CalorieMacroFormulasPage() {
  const { language } = useLanguage()
  const isRussian = language === 'ru'
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isGymRoute = pathname.includes('/workouts/gym/')
  const gramsUnit = isRussian ? 'г' : 'g'
  const caloriesUnit = isRussian ? 'ккал' : 'kcal'
  const [gender, setGender] = useState<Gender>('female')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [age, setAge] = useState('')
  const [activity, setActivity] = useState<ActivityLevel>('moderate')
  const [goal, setGoal] = useState<Goal>('fat_loss')

  const weightValue = Number.parseFloat(weight)
  const heightValue = Number.parseFloat(height)
  const ageValue = Number.parseFloat(age)
  const hasValidBodyMetrics = weightValue > 0 && heightValue > 0 && ageValue > 0

  const bmr = useMemo(() => {
    if (!hasValidBodyMetrics) {
      return 0
    }

    const base = 10 * weightValue + 6.25 * heightValue - 5 * ageValue
    return gender === 'male' ? base + 5 : base - 161
  }, [gender, weightValue, heightValue, ageValue, hasValidBodyMetrics])

  const tdee = useMemo(() => {
    return bmr * activityMultipliers[activity]
  }, [bmr, activity])

  const suggestedTargets = useMemo(() => {
    if (!hasValidBodyMetrics) {
      return [] as Array<{ key: Goal; label: string; calories: number }>
    }

    return [
      { key: 'fat_loss' as const, label: isRussian ? 'Снижение жира' : 'Fat loss', calories: Math.max(1200, round(tdee + goalAdjustments.fat_loss)) },
      { key: 'tone' as const, label: isRussian ? 'Тонус / рекомпозиция' : 'Tone / recomposition', calories: Math.max(1200, round(tdee + goalAdjustments.tone)) },
      { key: 'muscle_gain' as const, label: isRussian ? 'Набор мышц' : 'Muscle gain', calories: Math.max(1200, round(tdee + goalAdjustments.muscle_gain)) },
    ]
  }, [hasValidBodyMetrics, isRussian, tdee])

  const selectedGoalTarget = useMemo(() => {
    const selected = suggestedTargets.find((item) => item.key === goal)
    return selected?.calories ?? 0
  }, [goal, suggestedTargets])

  const targetCalories = useMemo(() => {
    if (!hasValidBodyMetrics) {
      return 0
    }
    return selectedGoalTarget
  }, [selectedGoalTarget, hasValidBodyMetrics])

  const macros = useMemo(() => {
    if (targetCalories <= 0) {
      return {
        proteinG: 0,
        fatsG: 0,
        carbsG: 0,
        ...macroTargets[goal],
      }
    }

    const macroSplit = macroTargets[goal]
    const proteinCalories = targetCalories * (macroSplit.proteinPct / 100)
    const fatsCalories = targetCalories * (macroSplit.fatsPct / 100)
    const carbsCalories = targetCalories * (macroSplit.carbsPct / 100)

    return {
      proteinG: proteinCalories / 4,
      fatsG: fatsCalories / 9,
      carbsG: carbsCalories / 4,
      ...macroSplit,
    }
  }, [targetCalories, goal])

  const resetCalculator = () => {
    setGender('female')
    setWeight('')
    setHeight('')
    setAge('')
    setActivity('moderate')
    setGoal('fat_loss')
  }

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
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#f3d0e1]/70 blur-2xl" />
          <div className="relative z-10">
            <div className="premium-chip mb-3 inline-flex items-center gap-2 rounded-full border-[#f3d0e1] bg-[#fff7fb] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#be185d]">
              <Sparkles size={14} />
              {isRussian ? 'Калькулятор питания' : 'Nutrition Calculator'}
            </div>
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#f3d0e1] bg-[#fff7fb] text-[#be185d] shadow-sm">
              <Calculator size={20} />
            </div>
            <h1 className="font-serif text-4xl leading-tight text-slate-900 md:text-6xl">{isRussian ? 'Формулы калорий и БЖУ' : 'Calories and Macros Formulas'}</h1>
            <p className="mt-3 text-lg text-slate-600 md:text-2xl">{isRussian ? 'Рассчитай дневные потребности в питании' : 'Calculate your daily nutrition needs'}</p>
          </div>
        </section>

        <section className="space-y-5 pb-10">
          <article className="premium-card premium-reveal p-6 md:p-7" data-reveal>
            <h2 className="font-serif text-4xl text-[#2c2f33] md:text-5xl">{isRussian ? 'Формула Миффлина-Сан Жеора' : 'Mifflin-St Jeor Formula'}</h2>
            <p className="mt-4 text-xl leading-relaxed text-gray-600 md:text-2xl">
              {isRussian ? 'Рассчитай базовый обмен веществ (BMR) - калории, которые тратятся в покое.' : 'Calculate your basal metabolic rate (BMR): calories burned at rest.'}
            </p>

            <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-gray-500 md:text-base">{isRussian ? 'Для мужчин' : 'For men'}</p>
            <hr className="my-3 border-gray-200" />
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-lg text-gray-700 md:text-2xl">
              {isRussian ? 'BMR = 10 x вес(кг) + 6.25 x рост(см) - 5 x возраст + 5' : 'BMR = 10 x weight(kg) + 6.25 x height(cm) - 5 x age + 5'}
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-gray-500 md:text-base">{isRussian ? 'Для женщин' : 'For women'}</p>
            <hr className="my-3 border-gray-200" />
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-lg text-gray-700 md:text-2xl">
              {isRussian ? 'BMR = 10 x вес(кг) + 6.25 x рост(см) - 5 x возраст - 161' : 'BMR = 10 x weight(kg) + 6.25 x height(cm) - 5 x age - 161'}
            </div>
          </article>

          <article className="premium-card premium-card-soft premium-reveal p-6 md:p-7" data-reveal>
            <h2 className="font-serif text-4xl text-[#2c2f33] md:text-5xl">{isRussian ? 'Калькулятор калорий' : 'Calorie Calculator'}</h2>
            <p className="mt-4 text-xl leading-relaxed text-gray-600 md:text-2xl">
              {isRussian ? 'Заполни параметры и получи расчет по формуле.' : 'Fill in your metrics and get a formula-based estimate.'}
            </p>

            <div className="mt-5">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#9d174d]">{isRussian ? 'Шаг 1: цель' : 'Step 1: goal'}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setGoal('fat_loss')}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition duration-200 hover:-translate-y-0.5 ${goal === 'fat_loss' ? 'border-[#be185d] bg-[#fff1f7] text-[#be185d]' : 'border-[#d4d4d8] bg-white text-[#52525b]'}`}
                >
                  {isRussian ? 'Снижение жира' : 'Fat loss'}
                </button>
                <button
                  type="button"
                  onClick={() => setGoal('tone')}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition duration-200 hover:-translate-y-0.5 ${goal === 'tone' ? 'border-[#be185d] bg-[#fff1f7] text-[#be185d]' : 'border-[#d4d4d8] bg-white text-[#52525b]'}`}
                >
                  {isRussian ? 'Тонус / рекомпозиция' : 'Tone / recomposition'}
                </button>
                <button
                  type="button"
                  onClick={() => setGoal('muscle_gain')}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition duration-200 hover:-translate-y-0.5 ${goal === 'muscle_gain' ? 'border-[#be185d] bg-[#fff1f7] text-[#be185d]' : 'border-[#d4d4d8] bg-white text-[#52525b]'}`}
                >
                  {isRussian ? 'Набор мышц' : 'Muscle gain'}
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold uppercase tracking-widest text-gray-500">
                {isRussian ? 'Пол' : 'Sex'}
                <select
                  value={gender}
                  onChange={(event) => setGender(event.target.value as Gender)}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg text-gray-700"
                >
                  <option value="male">{isRussian ? 'Мужской' : 'Male'}</option>
                  <option value="female">{isRussian ? 'Женский' : 'Female'}</option>
                </select>
              </label>

              <label className="text-sm font-semibold uppercase tracking-widest text-gray-500">
                {isRussian ? 'Уровень активности' : 'Activity level'}
                <select
                  value={activity}
                  onChange={(event) => setActivity(event.target.value as ActivityLevel)}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg text-gray-700"
                >
                  <option value="sedentary">{isRussian ? 'Сидячий (x1.2)' : 'Sedentary (x1.2)'}</option>
                  <option value="light">{isRussian ? 'Легкая активность (x1.375)' : 'Light activity (x1.375)'}</option>
                  <option value="moderate">{isRussian ? 'Умеренная активность (x1.55)' : 'Moderate activity (x1.55)'}</option>
                  <option value="very">{isRussian ? 'Высокая активность (x1.725)' : 'High activity (x1.725)'}</option>
                  <option value="extreme">{isRussian ? 'Очень высокая активность (x1.9)' : 'Very high activity (x1.9)'}</option>
                </select>
              </label>

              <label className="text-sm font-semibold uppercase tracking-widest text-gray-500">
                {isRussian ? 'Вес (кг)' : 'Weight (kg)'}
                <input
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  min={30}
                  max={300}
                  type="number"
                  placeholder={isRussian ? 'например 70' : 'for example 70'}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg text-gray-700"
                />
              </label>

              <label className="text-sm font-semibold uppercase tracking-widest text-gray-500">
                {isRussian ? 'Рост (см)' : 'Height (cm)'}
                <input
                  value={height}
                  onChange={(event) => setHeight(event.target.value)}
                  min={120}
                  max={250}
                  type="number"
                  placeholder={isRussian ? 'например 170' : 'for example 170'}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg text-gray-700"
                />
              </label>

              <label className="text-sm font-semibold uppercase tracking-widest text-gray-500">
                {isRussian ? 'Возраст (лет)' : 'Age (years)'}
                <input
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                  min={12}
                  max={100}
                  type="number"
                  placeholder={isRussian ? 'например 30' : 'for example 30'}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg text-gray-700"
                />
              </label>
            </div>

            <div className="mt-5 rounded-2xl border border-[#d4d4d8] bg-white p-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#9d174d]">{isRussian ? 'Шаг 2: калорийность и БЖУ' : 'Step 2: calories and macros'}</p>
              <p className="mt-1 text-sm text-gray-600">{isRussian ? 'Калории подбираются автоматически по выбранной цели.' : 'Calories are selected automatically based on your goal.'}</p>

              <div className="mt-3">
                <div className="rounded-xl border border-[#f3d0e1] bg-[#fff7fb] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#52525b]">{isRussian ? 'Рекомендуемые калории' : 'Suggested calories'}</p>
                  <p className="mt-1 text-2xl font-bold text-[#be185d]">{hasValidBodyMetrics ? selectedGoalTarget : 0} {caloriesUnit}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[#d4d4d8] bg-white p-5">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#9d174d]">{isRussian ? 'Текущие результаты' : 'Current results'}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[#d4d4d8] bg-[#f5f5f5] p-3 text-center transition duration-200 hover:-translate-y-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">BMR</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{round(bmr)}</p>
                </div>
                <div className="rounded-xl border border-[#d4d4d8] bg-[#f5f5f5] p-3 text-center transition duration-200 hover:-translate-y-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">TDEE</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{round(tdee)}</p>
                </div>
                <div className="rounded-xl border border-[#d4d4d8] bg-[#f5f5f5] p-3 text-center transition duration-200 hover:-translate-y-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{isRussian ? 'Целевые ккал' : 'Target kcal'}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{round(targetCalories)}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[#d4d4d8] bg-[#f5f5f5] p-4 text-center transition duration-200 hover:-translate-y-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{isRussian ? 'Белки' : 'Protein'}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{round(macros.proteinG)}{gramsUnit}</p>
                  <p className="text-sm text-gray-500">{macros.proteinPct}%</p>
                </div>
                <div className="rounded-xl border border-[#d4d4d8] bg-[#f5f5f5] p-4 text-center transition duration-200 hover:-translate-y-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{isRussian ? 'Жиры' : 'Fats'}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{round(macros.fatsG)}{gramsUnit}</p>
                  <p className="text-sm text-gray-500">{macros.fatsPct}%</p>
                </div>
                <div className="rounded-xl border border-[#d4d4d8] bg-[#f5f5f5] p-4 text-center transition duration-200 hover:-translate-y-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{isRussian ? 'Углеводы' : 'Carbs'}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{round(macros.carbsG)}{gramsUnit}</p>
                  <p className="text-sm text-gray-500">{macros.carbsPct}%</p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={resetCalculator}
                  className="rounded-xl border border-[#f3d0e1] bg-[#fff7fb] px-4 py-2 text-sm font-semibold text-[#be185d] transition duration-200 hover:-translate-y-0.5 hover:border-[#be185d]"
                >
                  {isRussian ? 'Сбросить калькулятор' : 'Reset calculator'}
                </button>
              </div>
            </div>
          </article>

          <section className="premium-reveal px-1 py-1" data-reveal>
            <h2 className="font-serif text-4xl text-[#2c2f33] md:text-5xl">{isRussian ? 'Коэффициенты активности' : 'Activity Multipliers'}</h2>
            <p className="mt-2 text-base leading-relaxed text-gray-500 md:text-xl">{isRussian ? 'Умножь BMR на уровень активности:' : 'Multiply BMR by your activity level:'}</p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-[#d4d4d8] bg-white">
              <div className="divide-y divide-[#e4e4e7]">
                <div className="flex items-center justify-between gap-4 px-4 py-3 text-base leading-relaxed md:text-xl">
                  <span className="text-gray-700">{isRussian ? 'Сидячий' : 'Sedentary'}</span>
                  <span className="font-semibold text-[#be185d]">BMR x 1.2</span>
                </div>
                <div className="flex items-center justify-between gap-4 px-4 py-3 text-base leading-relaxed md:text-xl">
                  <span className="text-gray-700">{isRussian ? 'Легкая активность' : 'Light activity'}</span>
                  <span className="font-semibold text-[#be185d]">BMR x 1.375</span>
                </div>
                <div className="flex items-center justify-between gap-4 px-4 py-3 text-base leading-relaxed md:text-xl">
                  <span className="text-gray-700">{isRussian ? 'Умеренная активность' : 'Moderate activity'}</span>
                  <span className="font-semibold text-[#be185d]">BMR x 1.55</span>
                </div>
                <div className="flex items-center justify-between gap-4 px-4 py-3 text-base leading-relaxed md:text-xl">
                  <span className="text-gray-700">{isRussian ? 'Высокая активность' : 'High activity'}</span>
                  <span className="font-semibold text-[#be185d]">BMR x 1.725</span>
                </div>
                <div className="flex items-center justify-between gap-4 px-4 py-3 text-base leading-relaxed md:text-xl">
                  <span className="text-gray-700">{isRussian ? 'Очень высокая активность' : 'Very high activity'}</span>
                  <span className="font-semibold text-[#be185d]">BMR x 1.9</span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-lg leading-relaxed text-[#2c2f33] md:text-2xl">{isRussian ? 'Результат = TDEE (общий суточный расход энергии)' : 'Result = TDEE (total daily energy expenditure)'}</p>
          </section>

          <article className="premium-card premium-reveal p-6 md:p-7" data-reveal>
            <h2 className="font-serif text-4xl text-[#2c2f33] md:text-5xl">{isRussian ? 'Коррекция под цель' : 'Goal Adjustment'}</h2>
            <div className="mt-5 space-y-4">
              <div className="border-b border-[#e4e4e7] pb-3 transition duration-200 hover:translate-x-0.5">
                <p className="text-xl font-semibold leading-tight text-[#2c2f33] md:text-2xl">{isRussian ? 'Снижение жира' : 'Fat loss'}</p>
                <p className="mt-1 text-base leading-relaxed text-gray-600 md:text-xl">{isRussian ? 'Умеренный дефицит: TDEE - 300-500 ккал' : 'Moderate deficit: TDEE - 300-500 kcal'}</p>
              </div>

              <div className="border-b border-[#e4e4e7] pb-3 transition duration-200 hover:translate-x-0.5">
                <p className="text-xl font-semibold leading-tight text-[#2c2f33] md:text-2xl">{isRussian ? 'Тонус / рекомпозиция' : 'Tone / recomposition'}</p>
                <p className="mt-1 text-base leading-relaxed text-gray-600 md:text-xl">{isRussian ? 'Около поддержки: TDEE +/- 100 ккал' : 'Near maintenance: TDEE +/- 100 kcal'}</p>
              </div>

              <div className="transition duration-200 hover:translate-x-0.5">
                <p className="text-xl font-semibold leading-tight text-[#2c2f33] md:text-2xl">{isRussian ? 'Набор мышц' : 'Muscle gain'}</p>
                <p className="mt-1 text-base leading-relaxed text-gray-600 md:text-xl">{isRussian ? 'Небольшой профицит: TDEE + 200-300 ккал' : 'Small surplus: TDEE + 200-300 kcal'}</p>
              </div>
            </div>
          </article>

          <article className="premium-reveal rounded-[24px] border border-[#d4d4d8] bg-[#efefef] p-6 md:p-7" data-reveal>
            <h2 className="font-serif text-4xl text-[#2c2f33] md:text-5xl">{isRussian ? 'Пример распределения БЖУ' : 'Sample Macro Split'}</h2>
            <p className="mt-2 text-base leading-relaxed text-gray-600 md:text-xl">{isRussian ? 'Для рациона 2000 ккал:' : 'For a 2000 kcal diet:'}</p>
            <ul className="mt-4 space-y-2 text-base leading-relaxed text-gray-700 md:text-xl">
              <li className="flex items-start gap-3 transition duration-200 hover:translate-x-0.5"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#be185d]" />{isRussian ? 'Белки: 30% (150г) = 600 ккал' : 'Protein: 30% (150g) = 600 kcal'}</li>
              <li className="flex items-start gap-3 transition duration-200 hover:translate-x-0.5"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#be185d]" />{isRussian ? 'Жиры: 25% (56г) = 500 ккал' : 'Fats: 25% (56g) = 500 kcal'}</li>
              <li className="flex items-start gap-3 transition duration-200 hover:translate-x-0.5"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#be185d]" />{isRussian ? 'Углеводы: 45% (225г) = 900 ккал' : 'Carbs: 45% (225g) = 900 kcal'}</li>
            </ul>
            <p className="mt-5 text-lg leading-relaxed text-[#2c2f33] md:text-2xl">
              {isRussian ? 'Корректируй проценты под предпочтения и уровень активности.' : 'Adjust percentages to your preferences and activity level.'}
            </p>
          </article>
        </section>
      </main>
    </div>
  )
}
