import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import LegalLinks from '../components/LegalLinks'

interface SignInFormData {
  email: string
  password: string
}

const mapSignInError = (message: string, t: (key: string) => string) => {
  const normalized = message.toLowerCase()

  if (normalized.includes('invalid login credentials')) {
    return t('signIn.errors.invalidCredentials')
  }

  if (normalized.includes('email not confirmed')) {
    return t('signIn.errors.emailNotConfirmed')
  }

  if (normalized.includes('rate limit')) {
    return t('signIn.errors.rateLimit')
  }

  return message
}

export default function SignInPage() {
  const { signin } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    mode: 'onBlur',
  })

  const onSubmit = async (data: SignInFormData) => {
    try {
      setError(null)
      setLoading(true)

      await signin(data.email, data.password)
      navigate('/')
    } catch (err) {
      const rawError = err instanceof Error ? err.message : t('signIn.genericError')
      setError(mapSignInError(rawError, t))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#e8e8e8] to-[#d4d4d8] flex-center py-12 px-4">
      <img
        src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1800&q=80"
        alt="Fitness background"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
      />

      <div className="relative z-10 card max-w-md w-full shadow-lg">
        <div className="text-center mb-7">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('signIn.title')}</h1>
          <p className="text-gray-600">{t('signIn.subtitle')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">{t('signIn.emailLabel')}</label>
            <input
              {...register('email', {
                required: t('signIn.emailRequired'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('signIn.emailInvalid'),
                },
              })}
              type="email"
              placeholder={t('signIn.emailPlaceholder')}
              className="input-field"
            />
            {errors.email && <p className="error-message">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label">{t('signIn.passwordLabel')}</label>
            <input
              {...register('password', {
                required: t('signIn.passwordRequired'),
              })}
              type="password"
              placeholder={t('signIn.passwordPlaceholder')}
              className="input-field"
            />
            {errors.password && <p className="error-message">{errors.password.message}</p>}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-[#111111] hover:text-[#111111]">
              {t('signIn.forgotPassword')}
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-6"
          >
            {loading ? t('signIn.loading') : t('signIn.submit')}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            {t('signIn.noAccount')}{' '}
            <Link to="/signup" className="text-[#111111] hover:text-[#111111] font-medium">
              {t('signIn.createOne')}
            </Link>
          </p>
        </div>

        <LegalLinks className="mt-6" />
      </div>
    </div>
  )
}
