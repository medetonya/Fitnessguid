import { ArrowLeft, Scale } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'

export default function TermsOfUsePage() {
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
            <Scale size={14} />
            {t('legalPages.terms.badge')}
          </div>
          <h1 className="font-serif text-4xl text-[#111111] md:text-5xl">{t('legalPages.terms.title')}</h1>
          <p className="mt-2 text-sm text-gray-500">{t('legalPages.common.lastUpdated')}</p>

          <div className="mt-6 space-y-5 text-sm leading-relaxed text-[#27272a]">
            <section>
              <h2 className="text-base font-semibold text-[#111111]">{t('legalPages.terms.ownerTitle')}</h2>
              <p className="mt-1">{t('legalPages.terms.ownerBody')}</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111111]">{t('legalPages.terms.useTitle')}</h2>
              <p className="mt-1">{t('legalPages.terms.useBody')}</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111111]">{t('legalPages.terms.ageTitle')}</h2>
              <p className="mt-1">{t('legalPages.terms.ageBody')}</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111111]">{t('legalPages.terms.ipTitle')}</h2>
              <p className="mt-1">{t('legalPages.terms.ipBody')}</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111111]">{t('legalPages.terms.liabilityTitle')}</h2>
              <p className="mt-1">{t('legalPages.terms.liabilityBody')}</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111111]">{t('legalPages.terms.accountTitle')}</h2>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>{t('legalPages.terms.accountItem1')}</li>
                <li>{t('legalPages.terms.accountItem2')}</li>
                <li>{t('legalPages.terms.accountItem3')}</li>
                <li>{t('legalPages.terms.accountItem4')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111111]">{t('legalPages.terms.saleTitle')}</h2>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>{t('legalPages.terms.saleItem1')}</li>
                <li>{t('legalPages.terms.saleItem2')}</li>
                <li>{t('legalPages.terms.saleItem3')}</li>
                <li>{t('legalPages.terms.saleItem4')}</li>
                <li>{t('legalPages.terms.saleItem5')}</li>
                <li>{t('legalPages.terms.saleItem6')}</li>
              </ul>
            </section>
          </div>
        </article>
      </main>
    </div>
  )
}
