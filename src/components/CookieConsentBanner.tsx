import { useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'

const cookieConsentKey = 'cookie-consent-v1'

type CookieConsentValue = {
  essential: true
  analytics: boolean
  marketing: boolean
  decidedAt: string
}

const hasStoredConsent = () => {
  if (typeof window === 'undefined') {
    return false
  }

  const saved = window.localStorage.getItem(cookieConsentKey)
  return Boolean(saved)
}

export default function CookieConsentBanner() {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(() => !hasStoredConsent())
  const [showPreferences, setShowPreferences] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false)
  const [marketingEnabled, setMarketingEnabled] = useState(false)

  const saveConsent = (value: CookieConsentValue) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(cookieConsentKey, JSON.stringify(value))
      window.localStorage.setItem('cookie-consent-at', new Date().toISOString())
    }
    setVisible(false)
    setShowPreferences(false)
  }

  const acceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
      decidedAt: new Date().toISOString(),
    })
  }

  const rejectNonEssential = () => {
    saveConsent({
      essential: true,
      analytics: false,
      marketing: false,
      decidedAt: new Date().toISOString(),
    })
  }

  const savePreferences = () => {
    saveConsent({
      essential: true,
      analytics: analyticsEnabled,
      marketing: marketingEnabled,
      decidedAt: new Date().toISOString(),
    })
  }

  if (!visible) {
    return null
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#d4d4d8] bg-white p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-[#27272a]">
          {t('cookieBanner.message')}{' '}
          {t('cookieBanner.readPolicyPrefix')}{' '}
          <a href="/cookie-policy" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#111111] underline">
            {t('cookieBanner.policyLink')}
          </a>
          .
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={rejectNonEssential}
            className="rounded-xl border border-[#d4d4d8] bg-white px-4 py-2 text-sm font-semibold text-[#111111]"
          >
            {t('cookieBanner.rejectNonEssential')}
          </button>
          <button
            type="button"
            onClick={() => setShowPreferences(true)}
            className="rounded-xl border border-[#d4d4d8] bg-white px-4 py-2 text-sm font-semibold text-[#111111]"
          >
            {t('cookieBanner.managePreferences')}
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="rounded-xl bg-[#111111] px-4 py-2 text-sm font-semibold text-white"
          >
            {t('cookieBanner.acceptAll')}
          </button>
        </div>
      </div>

      {showPreferences && (
        <div className="mx-auto mt-3 max-w-6xl rounded-2xl border border-[#d4d4d8] bg-[#fafafa] p-4">
          <p className="text-sm font-semibold text-[#111111]">{t('cookieBanner.manageTitle')}</p>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <label className="rounded-xl border border-[#d4d4d8] bg-white p-3 text-sm text-[#111111]">
              <span className="font-semibold">{t('cookieBanner.essentialLabel')}</span>
              <div className="mt-2 text-xs text-gray-500">On</div>
            </label>

            <label className="rounded-xl border border-[#d4d4d8] bg-white p-3 text-sm text-[#111111]">
              <span className="font-semibold">{t('cookieBanner.analyticsLabel')}</span>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(event) => setAnalyticsEnabled(event.target.checked)}
                />
              </div>
            </label>

            <label className="rounded-xl border border-[#d4d4d8] bg-white p-3 text-sm text-[#111111]">
              <span className="font-semibold">{t('cookieBanner.marketingLabel')}</span>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={marketingEnabled}
                  onChange={(event) => setMarketingEnabled(event.target.checked)}
                />
              </div>
            </label>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setShowPreferences(false)}
              className="rounded-xl border border-[#d4d4d8] bg-white px-4 py-2 text-sm font-semibold text-[#111111]"
            >
              {t('cookieBanner.cancel')}
            </button>
            <button
              type="button"
              onClick={savePreferences}
              className="rounded-xl bg-[#111111] px-4 py-2 text-sm font-semibold text-white"
            >
              {t('cookieBanner.savePreferences')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
