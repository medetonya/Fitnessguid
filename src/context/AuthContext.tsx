import React, { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { tryLogLegalConsent } from '../lib/legalConsents'
import type { User } from '../types/index'
import { AuthContext } from './AuthContextValue'

const APP_URL = (import.meta.env.VITE_APP_URL as string | undefined)?.trim()
const PRIMARY_ADMIN_EMAIL = ((import.meta.env.VITE_PRIMARY_ADMIN_EMAIL as string | undefined) ?? 'apavlovna166@gmail.com')
  .trim()
  .toLowerCase()

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const isPrimaryAdminEmail = (email: string) => normalizeEmail(email) === PRIMARY_ADMIN_EMAIL

const getAccessExpiryInDays = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

const getResetRedirectUrl = () => {
  const baseUrl = (APP_URL && APP_URL.length > 0 ? APP_URL : window.location.origin).replace(/\/+$/, '')
  return `${baseUrl}/reset-password`
}

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error && err.message) {
    return err.message
  }

  if (typeof err === 'object' && err !== null && 'message' in err) {
    const maybeMessage = (err as { message?: unknown }).message
    if (typeof maybeMessage === 'string' && maybeMessage.length > 0) {
      return maybeMessage
    }
  }

  return fallback
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          // Get user profile from database
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError) {
            console.error('Error fetching user profile:', profileError)
          } else if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              avatarUrl: profile.avatar_url ?? null,
              preferredLanguage: profile.preferred_language ?? null,
              role: profile.role || 'user',
              status: profile.status || 'pending',
              createdAt: profile.created_at,
              accessExpiresAt: profile.access_expires_at ?? null,
            })
          }
        }
      } catch (err) {
        console.error('Error checking user:', err)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  const signup = async (
    email: string,
    password: string,
    name: string,
    consent: {
      termsAcceptedAt: string
      refundWaiverAcceptedAt: string
    }
  ) => {
    try {
      setError(null)
      setLoading(true)

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      if (authData.user) {
        const isPrimaryAdmin = isPrimaryAdminEmail(email)

        // Create user profile in database
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          email,
          name,
          role: isPrimaryAdmin ? 'admin' : 'user',
          status: isPrimaryAdmin ? 'approved' : 'pending',
          access_expires_at: isPrimaryAdmin ? getAccessExpiryInDays(30) : null,
        })

        if (profileError) {
          throw profileError
        }

        setUser({
          id: authData.user.id,
          email,
          name,
          avatarUrl: null,
          preferredLanguage: null,
          role: isPrimaryAdmin ? 'admin' : 'user',
          status: isPrimaryAdmin ? 'approved' : 'pending',
          createdAt: new Date().toISOString(),
          accessExpiresAt: isPrimaryAdmin ? getAccessExpiryInDays(30) : null,
        })

        await Promise.all([
          tryLogLegalConsent({
            userId: authData.user.id,
            consentType: 'terms_privacy',
            acceptedAt: consent.termsAcceptedAt,
            source: 'signup',
            context: 'User accepted Terms of Use, Privacy Policy, Refund Policy, and Disclaimer during account registration.',
          }),
          tryLogLegalConsent({
            userId: authData.user.id,
            consentType: 'refund_waiver',
            acceptedAt: consent.refundWaiverAcceptedAt,
            source: 'signup',
            context: 'User acknowledged digital content immediate access and refund limitation statement.',
          }),
        ])
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Sign up failed')
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const signin = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      if (data.user) {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError
        }

        if (!profile) {
          const profileEmail = data.user.email ?? email
          const isPrimaryAdmin = isPrimaryAdminEmail(profileEmail)

          const { data: createdProfile, error: createProfileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: profileEmail,
              name: data.user.user_metadata?.name ?? null,
              role: isPrimaryAdmin ? 'admin' : 'user',
              status: isPrimaryAdmin ? 'approved' : 'pending',
              access_expires_at: isPrimaryAdmin ? getAccessExpiryInDays(30) : null,
            })
            .select('*')
            .single()

          if (createProfileError) {
            throw createProfileError
          }

          setUser({
            id: createdProfile.id,
            email: createdProfile.email,
            name: createdProfile.name,
            avatarUrl: createdProfile.avatar_url ?? null,
            preferredLanguage: createdProfile.preferred_language ?? null,
            role: createdProfile.role || 'user',
            status: createdProfile.status || 'pending',
            createdAt: createdProfile.created_at,
            accessExpiresAt: createdProfile.access_expires_at ?? null,
          })
        } else {
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            avatarUrl: profile.avatar_url ?? null,
            preferredLanguage: profile.preferred_language ?? null,
            role: profile.role || 'user',
            status: profile.status || 'pending',
            createdAt: profile.created_at,
            accessExpiresAt: profile.access_expires_at ?? null,
          })
        }
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Sign in failed')
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const signout = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      setUser(null)
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Sign out failed')
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setError(null)

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getResetRedirectUrl(),
      })

      if (error) {
        throw error
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Password reset failed')
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signup,
        signin,
        signout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
