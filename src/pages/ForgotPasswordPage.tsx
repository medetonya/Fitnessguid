import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import LegalLinks from '../components/LegalLinks'

interface ForgotPasswordFormData {
  email: string
}

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    mode: 'onBlur',
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError(null)
      setLoading(true)

      await resetPassword(data.email)
      setSubmitted(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('forgotPassword.genericError')
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e8e8e8] to-[#d4d4d8] flex-center py-12 px-4">
        <div className="card max-w-md w-full shadow-lg text-center">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('forgotPassword.checkEmailTitle')}</h1>
          <p className="text-gray-600 mb-6">
            {t('forgotPassword.checkEmailBody')}
          </p>
          <button
            type="button"
            onClick={() => navigate('/signin')}
            className="btn-primary inline-block"
          >
            {t('forgotPassword.back')}
          </button>

          <LegalLinks className="mt-6" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8e8e8] to-[#d4d4d8] flex-center py-12 px-4">
      <div className="card max-w-md w-full shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('forgotPassword.title')}</h1>
          <p className="text-gray-600">{t('forgotPassword.subtitle')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">{t('forgotPassword.emailLabel')}</label>
            <input
              {...register('email', {
                required: t('forgotPassword.emailRequired'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('forgotPassword.emailInvalid'),
                },
              })}
              type="email"
              placeholder={t('forgotPassword.emailPlaceholder')}
              className="input-field"
            />
            {errors.email && <p className="error-message">{errors.email.message}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-6"
          >
            {loading ? t('forgotPassword.loading') : t('forgotPassword.submit')}
          </button>
        </form>

        {/* Back link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            <button
              type="button"
              onClick={() => navigate('/signin')}
              className="text-[#111111] hover:text-[#111111] font-medium"
            >
              {t('forgotPassword.back')}
            </button>
          </p>
        </div>

        <LegalLinks className="mt-6" />
      </div>
    </div>
  )
}
