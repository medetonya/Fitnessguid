import { ArrowLeft, Cookie } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'

export default function CookiePolicyPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="mx-auto max-w-3xl px-6 py-8 md:py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} />
          {t('legalPages.common.back')}
        </Link>

        <article className="mt-6 overflow-hidden rounded-3xl border border-[#f3d0e1] bg-gradient-to-br from-white via-[#fff7fb] to-[#ffeef5] p-6 shadow-sm md:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f3d0e1] bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#be185d]">
            <Cookie size={14} />
            {t('legalPages.cookie.badge')}
          </div>
          <h1 className="font-serif text-4xl text-[#111111] md:text-5xl">{t('legalPages.cookie.title')}</h1>
          <p className="mt-2 text-sm text-gray-500">{t('legalPages.common.lastUpdated')}</p>

          <div className="mt-6 space-y-5 text-sm leading-relaxed text-[#27272a]">
            <section>
              <h2 className="text-base font-semibold text-[#111111]">{t('legalPages.cookie.techTitle')}</h2>
              <p className="mt-1">{t('legalPages.cookie.techBody')}</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111111]">{t('legalPages.cookie.categoriesTitle')}</h2>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>{t('legalPages.cookie.categoriesItem1')}</li>
                <li>{t('legalPages.cookie.categoriesItem2')}</li>
                <li>{t('legalPages.cookie.categoriesItem3')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111111]">{t('legalPages.cookie.disableTitle')}</h2>
              <p className="mt-1">{t('legalPages.cookie.disableBody')}</p>
            </section>
          </div>
        </article>
      </main>
    </div>
  )
}
