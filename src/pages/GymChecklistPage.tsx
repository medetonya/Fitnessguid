import { ArrowLeft, CheckCircle2, ClipboardCheck, House, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'

export default function GymChecklistPage() {
  const { language } = useLanguage()
  const isRussian = language === 'ru'
  const navigate = useNavigate()

  const checklistItems = isRussian
    ? [
        'Я знаю, какие мышцы тренирую сегодня?',
        'У меня есть базовое упражнение (многосуставное)?',
        'У меня есть изолирующие упражнения?',
        'У меня не больше 8 упражнений?',
        'Я понимаю технику всех упражнений?',
      ]
    : [
        'Do I know which muscles I train today?',
        'Do I have a base exercise (compound movement)?',
        'Do I have isolation exercises?',
        'Do I have no more than 8 exercises?',
        'Do I understand the technique of all exercises?',
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

        <section className="relative mb-6 overflow-hidden rounded-3xl border border-[#f3d0e1] bg-gradient-to-br from-white via-[#fff7fb] to-[#ffeef5] p-7 shadow-sm">
          <div className="pointer-events-none absolute -right-10 -top-8 h-28 w-28 rounded-full bg-[#fbcfe8]/60 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-[#fce7f3]/70 blur-2xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f3d0e1] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#be185d]">
              <Sparkles size={14} />
              {isRussian ? 'Фокус-режим' : 'Focus Mode'}
            </div>
            <h1 className="mt-4 font-serif text-6xl leading-[0.95] text-gray-900 md:text-7xl">{isRussian ? 'Чек-лист перед тренировкой' : 'Pre-gym checklist'}</h1>
            <p className="mt-3 text-2xl text-gray-600">{isRussian ? 'Быстрая проверка готовности к тренировке' : 'Quick workout validation checklist'}</p>
          </div>
        </section>

        <article className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#f3d0e1] bg-[#fdf2f8] text-[#be185d]">
              <ClipboardCheck size={20} />
            </div>
            <p className="text-xl leading-relaxed text-gray-600">{isRussian ? 'Ответь на эти 5 вопросов перед каждой тренировкой:' : 'Answer these 5 questions before every gym session:'}</p>
          </div>

          <ol className="space-y-3 text-gray-700">
            {checklistItems.map((item, index) => (
              <li key={item} className="flex items-start gap-3 rounded-2xl border border-[#ececec] bg-[#fafafa] px-4 py-3">
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#111111] text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span className="pt-0.5 text-lg leading-relaxed">{item}</span>
              </li>
            ))}
          </ol>
        </article>

        <article className="mt-5 rounded-3xl border border-[#f3d0e1] bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 text-[#be185d]" size={18} />
            <p className="text-base leading-relaxed text-[#52525b]">
              {isRussian
                ? 'Если на все вопросы ответ «да», ты готов(а) к качественной тренировке с фокусом и четкой структурой.'
                : 'If all answers are yes, you are ready for a high-quality training session with focus and clear structure.'}
            </p>
          </div>
        </article>
      </main>
    </div>
  )
}
