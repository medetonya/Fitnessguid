import { MessageCircleQuestion, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'

const hiddenPaths = ['/signin', '/signup', '/forgot-password', '/reset-password']
const SUPPORT_EMAIL = 'supportmedetolab@gmail.com'
const SUPPORT_EMAIL_LINK = `mailto:${SUPPORT_EMAIL}?subject=MEDETOLAB%20Support%20Request&body=Hello%20MEDETOLAB%20team%2C%0A%0AI%20need%20help%20with%3A%20`

export default function SupportFab() {
  const { pathname } = useLocation()
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)

  const isHidden = useMemo(() => {
    if (hiddenPaths.includes(pathname)) {
      return true
    }

    // Training screens have primary bottom controls and should stay unobstructed on mobile.
    return pathname.includes('/training/') || pathname.includes('/workout-builder')
  }, [pathname])

  if (isHidden) {
    return null
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#d4d4d8] bg-white text-[#111111] shadow-lg transition hover:bg-[#f5f5f5] hover:shadow-xl"
        aria-label={t('support.openSupport')}
      >
        <MessageCircleQuestion size={24} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-3xl border border-[#d4d4d8] bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#0f0f10]">{t('support.title')}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d4d4d8] text-[#111111]"
                aria-label={t('support.closeSupport')}
              >
                <X size={18} />
              </button>
            </div>

            <p className="mb-4 text-sm text-[#52525b]">{t('support.description')}</p>

            <div className="space-y-3">
              <a
                href="https://wa.me/79181856768"
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl bg-[#111111] px-4 py-3 text-center text-sm font-semibold text-white"
              >
                {t('support.whatsapp')}
              </a>
              <a
                href={SUPPORT_EMAIL_LINK}
                className="block rounded-2xl border border-[#f3d0e1] bg-[#fdf7fa] px-4 py-3 text-center text-sm font-semibold text-[#9d174d]"
              >
                {t('support.email')}
              </a>

              <a href={SUPPORT_EMAIL_LINK} className="block text-center text-xs font-medium text-[#9d174d] underline underline-offset-4">
                {SUPPORT_EMAIL}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
