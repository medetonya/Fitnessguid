import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { tForLanguage, type Language } from '../i18n/translations'
import { supabase } from '../lib/supabase'
import { LanguageContext } from './LanguageContextValue'

const storageKey = 'fitnessguide-language-v1'

const isLanguage = (value: string): value is Language => value === 'en' || value === 'ru'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') {
      return 'en'
    }

    const saved = window.localStorage.getItem(storageKey)
    return saved && isLanguage(saved) ? saved : 'en'
  })
  const [authedUserId, setAuthedUserId] = useState<string | null>(null)

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage)
  }, [])

  const t = useCallback((key: string) => tForLanguage(language, key), [language])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, language)
    }

    if (!authedUserId) {
      return
    }

    void supabase
      .from('users')
      .update({ preferred_language: language })
      .eq('id', authedUserId)
  }, [authedUserId, language])

  useEffect(() => {
    let cancelled = false

    const syncLanguageFromProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const userId = session?.user?.id ?? null
      if (cancelled) {
        return
      }

      setAuthedUserId(userId)
      if (!userId) {
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('preferred_language')
        .eq('id', userId)
        .maybeSingle()

      if (cancelled || error) {
        return
      }

      const preferred = data?.preferred_language
      if (preferred === 'en' || preferred === 'ru') {
        setLanguageState(preferred)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(storageKey, preferred)
        }
      }
    }

    void syncLanguageFromProfile()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user?.id ?? null
      setAuthedUserId(userId)
    })

    return () => {
      cancelled = true
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    document.documentElement.lang = language
    document.documentElement.setAttribute('data-language', language)
  }, [language])

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
