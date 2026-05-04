import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'

export default function PrivacyPolicyPage() {
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
            <ShieldCheck size={14} />
            {t('legalPages.privacy.badge')}
          </div>
          <h1 className="font-serif text-4xl text-[#111111] md:text-5xl">{t('legalPages.privacy.title')}</h1>
          <p className="mt-2 text-sm text-gray-500">{t('legalPages.common.lastUpdated')}</p>

          <div className="mt-6 space-y-5 text-sm leading-relaxed text-[#27272a]">
            <section>
              <h2 className="text-base font-semibold text-[#111111]">{t('legalPages.privacy.dataCollectTitle')}</h2>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>{t('legalPages.privacy.dataCollectItem1')}</li>
                <li>{t('legalPages.privacy.dataCollectItem2')}</li>
                <li>{t('legalPages.privacy.dataCollectItem3')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111111]">{t('legalPages.privacy.purposesTitle')}</h2>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>{t('legalPages.privacy.purposesItem1')}</li>
                <li>{t('legalPages.privacy.purposesItem2')}</li>
                <li>{t('legalPages.privacy.purposesItem3')}</li>
                <li>{t('legalPages.privacy.purposesItem4')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111111]">{t('legalPages.privacy.retentionTitle')}</h2>
              <p className="mt-1">{t('legalPages.privacy.retentionBody')}</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111111]">{t('legalPages.privacy.thirdPartyTitle')}</h2>
              <p className="mt-1">{t('legalPages.privacy.thirdPartyBody')}</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111111]">{t('legalPages.privacy.rightsTitle')}</h2>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>{t('legalPages.privacy.rightsItem1')}</li>
                <li>{t('legalPages.privacy.rightsItem2')}</li>
                <li>{t('legalPages.privacy.rightsItem3')}</li>
                <li>{t('legalPages.privacy.rightsItem4')}</li>
                <li>{t('legalPages.privacy.rightsItem5')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111111]">{t('legalPages.privacy.legalBasisTitle')}</h2>
              <p className="mt-1">{t('legalPages.privacy.legalBasisBody')}</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111111]">{t('legalPages.privacy.contactTitle')}</h2>
              <p className="mt-1">{t('legalPages.privacy.contactBody')}</p>
            </section>
          </div>
        </article>
      </main>
    </div>
  )
}
