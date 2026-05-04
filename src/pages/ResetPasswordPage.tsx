import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../hooks/useLanguage'
import LegalLinks from '../components/LegalLinks'

interface ResetPasswordFormData {
  password: string
  confirmPassword: string
}

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [submitting, setSubmitting] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    mode: 'onBlur',
  })

  const password = watch('password')

  useEffect(() => {
    const init = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search)
        const tokenHash = searchParams.get('token_hash')
        const type = searchParams.get('type')

        if (tokenHash && type === 'recovery') {
          const { error: verifyOtpError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery',
          })

          if (verifyOtpError) {
            throw verifyOtpError
          }
        }

        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken && refreshToken) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (setSessionError) {
            throw setSessionError
          }
        }

        const code = searchParams.get('code')

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            throw exchangeError
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          setError(t('resetPassword.invalidLink'))
          setSessionReady(false)
          return
        }

        setSessionReady(true)
        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : t('resetPassword.validateLinkFailed')
        setError(message)
        setSessionReady(false)
      }
    }

    void init()
  }, [t])

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setSubmitting(true)
      setError(null)

      if (!sessionReady) {
        throw new Error(t('resetPassword.invalidLink'))
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (updateError) {
        throw updateError
      }

      setSuccess(true)

      setTimeout(() => {
        navigate('/signin', { replace: true })
      }, 1200)
    } catch (err) {
      const message = err instanceof Error ? err.message : t('resetPassword.updateFailed')
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8e8e8] to-[#d4d4d8] flex-center py-12 px-4">
      <div className="card max-w-md w-full shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('resetPassword.title')}</h1>
          <p className="text-gray-600">{t('resetPassword.subtitle')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success ? (
          <div className="text-center p-4 bg-[#efefef] border border-[#d4d4d8] rounded-lg">
            <p className="text-sm text-[#111111]">{t('resetPassword.success')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-group">
              <label className="form-label">{t('resetPassword.passwordLabel')}</label>
              <input
                {...register('password', {
                  required: t('resetPassword.passwordRequired'),
                  minLength: {
                    value: 8,
                    message: t('resetPassword.passwordMin'),
                  },
                })}
                type="password"
                placeholder={t('resetPassword.passwordPlaceholder')}
                className="input-field"
              />
              {errors.password && <p className="error-message">{errors.password.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">{t('resetPassword.confirmPasswordLabel')}</label>
              <input
                {...register('confirmPassword', {
                  required: t('resetPassword.confirmPasswordRequired'),
                  validate: value => value === password || t('resetPassword.passwordsMismatch'),
                })}
                type="password"
                placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                className="input-field"
              />
              {errors.confirmPassword && <p className="error-message">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full mt-6"
            >
              {submitting ? t('resetPassword.loading') : t('resetPassword.submit')}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <p className="text-gray-600">
            <button
              type="button"
              onClick={() => navigate('/signin')}
              className="text-[#111111] hover:text-[#111111] font-medium"
            >
              {t('resetPassword.back')}
            </button>
          </p>
        </div>

        <LegalLinks className="mt-6" />
      </div>
    </div>
  )
}