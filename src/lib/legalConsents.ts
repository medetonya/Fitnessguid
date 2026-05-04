import { supabase } from './supabase'

export type LegalConsentType = 'terms_privacy' | 'refund_waiver'

export interface LegalConsentInput {
  userId?: string
  consentType: LegalConsentType
  acceptedAt: string
  source: string
  context?: string
}

const localStorageKey = 'legal-consents-v1'

export const saveLegalConsentLocal = (consent: LegalConsentInput) => {
  if (typeof window === 'undefined') {
    return
  }

  const raw = window.localStorage.getItem(localStorageKey)
  const current = raw ? (JSON.parse(raw) as LegalConsentInput[]) : []
  const next = [...current, consent]
  window.localStorage.setItem(localStorageKey, JSON.stringify(next))
}

export const tryLogLegalConsent = async (consent: LegalConsentInput) => {
  saveLegalConsentLocal(consent)

  if (!consent.userId) {
    return
  }

  const { error } = await supabase.from('legal_consents').insert({
    user_id: consent.userId,
    consent_type: consent.consentType,
    accepted_at: consent.acceptedAt,
    source: consent.source,
    context: consent.context ?? null,
  })

  if (error) {
    // DB logging is best-effort; local logging remains in place.
    console.warn('Legal consent logging skipped:', error.message)
  }
}
