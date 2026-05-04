import { ArrowLeft, Heart, House } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'

export default function HowNotToQuitPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()

  const tips = [
    {
      title: t('howNotToQuit.tip1Title'),
      text: t('howNotToQuit.tip1Text'),
      icon: '🎯',
    },
    {
      title: t('howNotToQuit.tip2Title'),
      text: t('howNotToQuit.tip2Text'),
      icon: '📅',
    },
    {
      title: t('howNotToQuit.tip3Title'),
      text: t('howNotToQuit.tip3Text'),
      icon: '✨',
    },
    {
      title: t('howNotToQuit.tip4Title'),
      text: t('howNotToQuit.tip4Text'),
      icon: '🎵',
    },
    {
      title: t('howNotToQuit.tip5Title'),
      text: t('howNotToQuit.tip5Text'),
      icon: '✔',
    },
    {
      title: t('howNotToQuit.tip6Title'),
      text: t('howNotToQuit.tip6Text'),
      icon: '⏰',
    },
    {
      title: t('howNotToQuit.tip7Title'),
      text: t('howNotToQuit.tip7Text'),
      icon: '📊',
    },
  ]

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="mx-auto max-w-3xl px-6 py-8 md:py-10">
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/workouts/home')}
            className="inline-flex items-center gap-2 text-base font-medium text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            {t('howNotToQuit.back')}
          </button>

          <Link
            to="/dashboard"
            className="hidden items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm text-gray-500 shadow-sm"
          >
            <House size={16} />
            {t('howNotToQuit.home')}
          </Link>
        </div>

        <section className="mb-8">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8e8e8] text-[#111111]">
            <Heart size={24} />
          </div>
          <h1 className="font-serif text-5xl leading-tight text-[#1f2328] md:text-6xl">{t('howNotToQuit.title')}</h1>
          <p className="mt-3 text-xl text-gray-600 md:text-2xl">{t('howNotToQuit.subtitle')}</p>
        </section>

        <section className="space-y-5 pb-10">
          {tips.map((tip) => (
            <article key={tip.title} className="rounded-[28px] border border-[#dad8d7] bg-white p-7 shadow-sm">
              <h2 className="font-serif text-4xl text-[#2c2f33] md:text-5xl">
                <span className="mr-2">{tip.icon}</span>
                {tip.title}
              </h2>
              <p className="mt-4 text-xl leading-relaxed text-gray-600 md:text-2xl">{tip.text}</p>
            </article>
          ))}

          <article className="rounded-[28px] border border-[#f0d8ba] bg-[#fff8ee] p-7 shadow-sm">
            <h3 className="text-3xl font-semibold text-gray-700 md:text-4xl">💛 {t('howNotToQuit.rememberTitle')}</h3>
            <p className="mt-3 text-xl leading-relaxed text-gray-700 md:text-2xl">
              {t('howNotToQuit.rememberText')}
            </p>
          </article>
        </section>
      </main>
    </div>
  )
}
