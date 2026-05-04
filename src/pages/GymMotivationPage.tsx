import { ArrowLeft, Flame, House, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'

export default function GymMotivationPage() {
  const { language } = useLanguage()
  const isRussian = language === 'ru'
  const navigate = useNavigate()

  const cards = isRussian
    ? [
        {
          title: 'Не жди мотивацию',
          text: 'Мотивация быстро пропадает. Результат дают тренировки по системе, а не по настроению.',
        },
        {
          title: 'Сделай тренировку минимально обязательной',
          text: 'Вместо идеальных 90 минут начни хотя бы с 30 минут. Начать важнее, чем сделать идеально.',
        },
        {
          title: 'Привяжи тренировку к привычке',
          text: 'Свяжи зал с уже существующим действием. Например: выпил(а) утренний кофе - поехал(а) в зал.',
        },
        {
          title: 'Убери выбор',
          text: 'Собери сумку с вечера и поставь тренировку в календарь как обязательную встречу.',
        },
        {
          title: 'Думай «продолжить», а не «начать заново»',
          text: 'После паузы не начинай с нуля. Просто продолжай с того места, где остановился(лась).',
        },
      ]
    : [
        {
          title: 'Do not wait for motivation',
          text: 'Motivation fades quickly. Successful people train even when they do not feel like it. They rely on systems, not feelings.',
        },
        {
          title: 'Make training minimally mandatory',
          text: "Instead of a perfect 90-minute session, commit to 30 minutes and start. You can always do more once you're there.",
        },
        {
          title: 'Attach training to a habit anchor',
          text: 'Link workout to an existing habit. Example: after morning coffee, go to the gym.',
        },
        {
          title: 'Remove choice',
          text: 'Pack your gym bag the night before and schedule training in your calendar like a meeting.',
        },
        {
          title: 'Think continue, not restart',
          text: 'Do not start from zero after breaks. Just continue where you left off.',
        },
      ]

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="mx-auto max-w-3xl px-6 py-8 md:py-10">
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/workouts/gym')}
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

        <section className="relative mb-6 overflow-hidden rounded-[28px] border border-[#f3d0e1] bg-gradient-to-br from-white via-[#fff7fb] to-[#ffeef5] p-7 shadow-sm">
          <div className="pointer-events-none absolute -right-10 -top-8 h-24 w-24 rounded-full bg-[#fbcfe8]/60 blur-2xl" />
          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#f3d0e1] bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#be185d]">
              <Sparkles size={14} />
              {isRussian ? 'Настрой' : 'Mindset Boost'}
            </div>
            <h1 className="font-serif text-6xl leading-[0.95] text-gray-900 md:text-7xl">{isRussian ? 'От мотивации к дисциплине' : 'Motivation to Discipline'}</h1>
            <p className="mt-3 text-2xl text-gray-600">{isRussian ? 'Сформируй устойчивую привычку тренироваться' : 'Build lasting training habits'}</p>
          </div>
        </section>

        <section className="space-y-4 pb-10">
          {cards.map((card, index) => (
            <article key={card.title} className="rounded-3xl border border-[#f3d0e1] bg-white p-7 shadow-sm">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#f3d0e1] bg-[#fff7fb] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#be185d]">
                <Flame size={13} />
                {isRussian ? `Совет ${index + 1}` : `Tip ${index + 1}`}
              </div>
              <h2 className="font-serif text-5xl text-gray-900">{card.title}</h2>
              <p className="mt-4 text-2xl leading-relaxed text-gray-600">{card.text}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
