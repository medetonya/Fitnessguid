import { ArrowLeft, ReceiptText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'

export default function RefundPolicyPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="mx-auto max-w-3xl px-6 py-8 md:py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} />
          {t('legalPages.common.back')}
        </Link>

        <article className="mt-6 overflow-hidden rounded-3xl border border-[#d4d4d8] bg-white p-6 shadow-sm md:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d4d4d8] bg-[#f5f5f5] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#111111]">
            <ReceiptText size={14} />
            {t('legalPages.refund.badge')}
          </div>
          <h1 className="font-serif text-4xl text-[#111111] md:text-5xl">{t('legalPages.refund.title')}</h1>
          <p className="mt-2 text-sm text-gray-500">{t('legalPages.common.lastUpdated')}</p>

          <div className="mt-6 space-y-5 text-sm leading-relaxed text-[#27272a]">
            <section>
              <h2 className="text-base font-semibold text-[#111111]">{t('legalPages.refund.digitalProductTitle')}</h2>
              <p className="mt-1">{t('legalPages.refund.digitalProductBody')}</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111111]">{t('legalPages.refund.withdrawalTitle')}</h2>
              <p className="mt-1">{t('legalPages.refund.withdrawalBody')}</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111111]">{t('legalPages.refund.lossTitle')}</h2>
              <p className="mt-1">{t('legalPages.refund.lossBody')}</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111111]">{t('legalPages.refund.exceptionsTitle')}</h2>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>{t('legalPages.refund.exceptionsItem1')}</li>
                <li>{t('legalPages.refund.exceptionsItem2')}</li>
                <li>{t('legalPages.refund.exceptionsItem3')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111111]">{t('legalPages.refund.procedureTitle')}</h2>
              <p className="mt-1">{t('legalPages.refund.procedureBody')}</p>
            </section>
          </div>
        </article>
      </main>
    </div>
  )
}
