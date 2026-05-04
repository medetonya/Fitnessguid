import { ArrowLeft, House } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'

function StepBadge({ value }: { value: number }) {
  return (
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#f3d0e1] bg-gradient-to-br from-[#fff7fb] to-[#ffeef5] text-xl font-bold text-[#be185d] shadow-[0_8px_20px_rgba(190,24,93,0.12)]">
      {value}
    </span>
  )
}

export default function ReadySchemePage() {
  const { t } = useLanguage()
  const { pathname } = useLocation()
  const isGymRoute = pathname.includes('/workouts/gym/')
  const goalPath = isGymRoute ? '/workouts/gym/goal/fat-loss' : '/workouts/home/goal/fat-loss'

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="mx-auto max-w-5xl px-6 py-8 md:py-10">
        <div className="mb-8 flex items-center justify-between">
          <Link
            to={goalPath}
            className="inline-flex items-center gap-2 text-base font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            {t('readyScheme.back')}
          </Link>

          <Link
            to="/dashboard"
            className="hidden items-center gap-2 rounded-xl bg-[#efefef] px-4 py-2 text-sm text-gray-600 shadow-sm"
          >
            <House size={16} />
            {t('readyScheme.menu')}
          </Link>
        </div>

        <section className="mb-8">
          <h1 className="font-serif text-6xl leading-[0.95] text-gray-900 md:text-7xl">{t('readyScheme.title')}</h1>
          <p className="mt-4 text-2xl text-gray-700">{t('readyScheme.subtitle')}</p>
        </section>

        {isGymRoute && (
          <section className="mb-8 rounded-[22px] border border-[#d4d4d8] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">{t('readyScheme.complexityTitle')}</h2>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-700">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d4d4d8] bg-[#f8f8f8] px-3 py-1.5">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                {t('readyScheme.beginner')}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d4d4d8] bg-[#f8f8f8] px-3 py-1.5">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" aria-hidden="true" />
                {t('readyScheme.intermediate')}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d4d4d8] bg-[#f8f8f8] px-3 py-1.5">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden="true" />
                {t('readyScheme.advanced')}
              </span>
            </div>
            <p className="mt-4 text-base text-gray-600 md:text-lg">
              {t('readyScheme.complexityNote')}
            </p>
          </section>
        )}

        <section className="space-y-5 pb-10">
          <article className="rounded-[24px] border border-[#ead8e3] bg-gradient-to-br from-white to-[#fff8fc] p-8 shadow-[0_10px_30px_rgba(17,17,17,0.06)] md:p-9">
            <div className="mb-5 flex items-center gap-4">
              <StepBadge value={1} />
              <h2 className="font-serif text-4xl text-gray-900 md:text-5xl">{t('readyScheme.step1Title')}</h2>
            </div>
            <ul className="space-y-3 text-xl text-gray-700 md:text-2xl">
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{t('readyScheme.step1Item1')}</li>
            </ul>
          </article>

          <article className="rounded-[24px] border border-[#ead8e3] bg-gradient-to-br from-white to-[#fff8fc] p-8 shadow-[0_10px_30px_rgba(17,17,17,0.06)] md:p-9">
            <div className="mb-5 flex items-center gap-4">
              <StepBadge value={2} />
              <h2 className="font-serif text-4xl text-gray-900 md:text-5xl">{t('readyScheme.step2Title')}</h2>
            </div>
            <p className="mb-3 text-2xl font-semibold text-gray-700">{t('readyScheme.distributionRule')}</p>
            <ul className="space-y-3 text-xl text-gray-700 md:text-2xl">
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{t('readyScheme.step2Item1')}</li>
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{t('readyScheme.step2Item2')}</li>
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{t('readyScheme.step2Item3')}</li>
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{t('readyScheme.step2Item4')}</li>
            </ul>
          </article>

          <article className="rounded-[24px] border border-[#ead8e3] bg-gradient-to-br from-white to-[#fff8fc] p-8 shadow-[0_10px_30px_rgba(17,17,17,0.06)] md:p-9">
            <div className="mb-5 flex items-center gap-4">
              <StepBadge value={3} />
              <h2 className="font-serif text-4xl text-gray-900 md:text-5xl">{t('readyScheme.step3Title')}</h2>
            </div>

            <p className="mb-2 text-xl font-semibold uppercase tracking-wider text-gray-500">{t('readyScheme.option1')}</p>
            <hr className="mb-4 border-gray-200" />
            <ul className="mb-6 space-y-3 text-xl text-gray-700 md:text-2xl">
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{t('readyScheme.option1Item1')}</li>
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{t('readyScheme.option1Item2')}</li>
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{t('readyScheme.option1Item3')}</li>
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{t('readyScheme.option1Item4')}</li>
            </ul>

            <p className="mb-2 text-xl font-semibold uppercase tracking-wider text-gray-500">{t('readyScheme.option2')}</p>
            <hr className="mb-4 border-gray-200" />
            <ul className="space-y-3 text-xl text-gray-700 md:text-2xl">
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{t('readyScheme.option2Item1')}</li>
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{t('readyScheme.option2Item2')}</li>
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{t('readyScheme.option2Item3')}</li>
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{t('readyScheme.option2Item4')}</li>
            </ul>
          </article>

          <article className="rounded-[24px] border border-[#ead8e3] bg-gradient-to-br from-white to-[#fff8fc] p-8 shadow-[0_10px_30px_rgba(17,17,17,0.06)] md:p-9">
            <div className="mb-5 flex items-center gap-4">
              <StepBadge value={4} />
              <h2 className="font-serif text-4xl text-gray-900 md:text-5xl">{t('readyScheme.step4Title')}</h2>
            </div>
            <p className="mb-4 text-xl text-gray-700 md:text-2xl">
              {t('readyScheme.step4Intro')}
            </p>
            <ul className="space-y-3 text-xl text-gray-700 md:text-2xl">
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{t('readyScheme.step4Item1')}</li>
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{t('readyScheme.step4Item2')}</li>
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{t('readyScheme.step4Item3')}</li>
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{t('readyScheme.step4Item4')}</li>
              <li className="rounded-2xl border border-[#ece4ea] bg-white/80 px-4 py-3">{t('readyScheme.step4Item5')}</li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  )
}
