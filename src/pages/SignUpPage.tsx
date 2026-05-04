import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import LegalLinks from '../components/LegalLinks'

interface SignUpFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptTermsPrivacy: boolean
  acceptRefundWaiver: boolean
  acceptMedicalNotice: boolean
}

const mapSignUpError = (message: string, t: (key: string) => string) => {
  const normalized = message.toLowerCase()

  if (normalized.includes('user already registered')) {
    return t('signUp.errors.userAlreadyRegistered')
  }

  if (normalized.includes('rate limit')) {
    return t('signUp.errors.rateLimit')
  }

  if (normalized.includes('invalid') && normalized.includes('email')) {
    return t('signUp.errors.invalidEmail')
  }

  return message
}

export default function SignUpPage() {
  const { signup } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({
    mode: 'onBlur',
  })

  const password = watch('password')

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setError(null)
      setLoading(true)

      if (data.password !== data.confirmPassword) {
        setError(t('signUp.passwordsMismatch'))
        return
      }

      const acceptedAt = new Date().toISOString()

      await signup(data.email, data.password, data.name, {
        termsAcceptedAt: acceptedAt,
        refundWaiverAcceptedAt: acceptedAt,
      })
      navigate('/')
    } catch (err) {
      const rawError = err instanceof Error ? err.message : t('signUp.genericError')
      setError(mapSignUpError(rawError, t))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8e8e8] to-[#d4d4d8] flex-center py-12 px-4">
      <div className="card max-w-md w-full shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('signUp.title')}</h1>
          <p className="text-gray-600">{t('signUp.subtitle')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <div className="form-group">
            <label className="form-label">{t('signUp.fullNameLabel')}</label>
            <input
              {...register('name', {
                required: t('signUp.fullNameRequired'),
                minLength: { value: 2, message: t('signUp.fullNameMin') },
              })}
              type="text"
              placeholder={t('signUp.fullNamePlaceholder')}
              className="input-field"
            />
            {errors.name && <p className="error-message">{errors.name.message}</p>}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">{t('signUp.emailLabel')}</label>
            <input
              {...register('email', {
                required: t('signUp.emailRequired'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('signUp.emailInvalid'),
                },
              })}
              type="email"
              placeholder={t('signUp.emailPlaceholder')}
              className="input-field"
            />
            {errors.email && <p className="error-message">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label">{t('signUp.passwordLabel')}</label>
            <input
              {...register('password', {
                required: t('signUp.passwordRequired'),
                minLength: { value: 8, message: t('signUp.passwordMin') },
              })}
              type="password"
              placeholder={t('signUp.passwordPlaceholder')}
              className="input-field"
            />
            {errors.password && <p className="error-message">{errors.password.message}</p>}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label className="form-label">{t('signUp.confirmPasswordLabel')}</label>
            <input
              {...register('confirmPassword', {
                required: t('signUp.confirmPasswordRequired'),
                validate: (value) => value === password || t('signUp.passwordsMismatch'),
              })}
              type="password"
              placeholder={t('signUp.passwordPlaceholder')}
              className="input-field"
            />
            {errors.confirmPassword && (
              <p className="error-message">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="rounded-lg border border-[#d4d4d8] bg-[#f8f8f8] p-3">
            <label className="flex items-start gap-2 text-sm text-[#27272a]">
              <input
                {...register('acceptTermsPrivacy', {
                  required: t('signUp.termsRequired'),
                })}
                type="checkbox"
                className="mt-0.5"
              />
              <span>
                {t('signUp.termsPrefix')}{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                  {t('signUp.termsLink')}
                </a>,{' '}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                  {t('signUp.privacyLink')}
                </a>,{' '}
                <a href="/refund-policy" target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                  {t('signUp.refundPolicyLink')}
                </a>{' '}
                {t('signUp.termsAnd')}{' '}
                <a href="/disclaimer" target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                  {t('signUp.disclaimerLink')}
                </a>
                {t('signUp.termsSuffix')}
              </span>
            </label>
            {errors.acceptTermsPrivacy && <p className="error-message mt-2">{errors.acceptTermsPrivacy.message}</p>}
          </div>

          <div className="rounded-lg border border-[#d4d4d8] bg-[#f8f8f8] p-3">
            <label className="flex items-start gap-2 text-sm text-[#27272a]">
              <input
                {...register('acceptRefundWaiver', {
                  required: t('signUp.refundRequired'),
                })}
                type="checkbox"
                className="mt-0.5"
              />
              <span>
                {t('signUp.refundTextBefore')}{' '}
                <a href="/refund-policy" target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                  {t('signUp.refundLink')}
                </a>
                {t('signUp.refundSuffix')}
              </span>
            </label>
            {errors.acceptRefundWaiver && <p className="error-message mt-2">{errors.acceptRefundWaiver.message}</p>}
          </div>

          <div className="rounded-lg border border-[#d4d4d8] bg-[#f8f8f8] p-3">
            <label className="flex items-start gap-2 text-sm text-[#27272a]">
              <input
                {...register('acceptMedicalNotice', {
                  required: t('signUp.medicalRequired'),
                })}
                type="checkbox"
                className="mt-0.5"
              />
              <span>{t('signUp.medicalText')}</span>
            </label>
            {errors.acceptMedicalNotice && <p className="error-message mt-2">{errors.acceptMedicalNotice.message}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-6"
          >
            {loading ? t('signUp.loading') : t('signUp.submit')}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            {t('signUp.alreadyAccount')}{' '}
            <Link to="/signin" className="text-[#111111] hover:text-[#111111] font-medium">
              {t('signUp.signInLink')}
            </Link>
          </p>
        </div>

        <LegalLinks className="mt-6" />
      </div>
    </div>
  )
}
