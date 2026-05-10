import { ArrowLeft, House, Mail, MessageCircle, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'

const SUPPORT_EMAIL = 'supportmedetolab@gmail.com'
const SUPPORT_EMAIL_LINK = `mailto:${SUPPORT_EMAIL}?subject=MEDETOLAB%20Support%20Request&body=Hello%20MEDETOLAB%20team%2C%0A%0AI%20need%20help%20with%3A%20`

export default function SupportPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="mx-auto max-w-3xl px-6 py-8 md:py-10">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-base font-medium text-gray-600 hover:text-gray-900">
            <ArrowLeft size={18} />
            {t('support.back')}
          </Link>
          <Link to="/dashboard" className="hidden items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
            <House size={16} />
            {t('support.home')}
          </Link>
        </div>

        <section className="overflow-hidden rounded-3xl border border-[#f3d0e1] bg-gradient-to-br from-white via-[#fff7fb] to-[#ffeef5] p-6 shadow-sm">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#f3d0e1] bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#be185d]">
            <Sparkles size={14} />
            {t('support.badge')}
          </div>
          <h1 className="font-serif text-5xl text-gray-900 md:text-6xl">{t('support.title')}</h1>
          <p className="mt-3 text-xl text-gray-600 md:text-2xl">{t('support.description')}</p>

          <div className="mt-6 space-y-3">
            <a
              href="https://wa.me/79181856768"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#22c55e] px-5 py-4 text-xl font-semibold text-white shadow-sm"
            >
              <MessageCircle size={20} />
              {t('support.whatsapp')}
            </a>

            <a
              href={SUPPORT_EMAIL_LINK}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#f3d0e1] bg-white px-5 py-4 text-xl font-semibold text-[#be185d]"
            >
              <Mail size={20} />
              {t('support.email')}
            </a>

            <a href={SUPPORT_EMAIL_LINK} className="block text-center text-sm font-medium text-[#9d174d] underline underline-offset-4">
              {SUPPORT_EMAIL}
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}
