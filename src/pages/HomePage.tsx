import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import { Link, Navigate } from 'react-router-dom'
import heroFallback from '../assets/hero.png'
import LegalLinks from '../components/LegalLinks'

export default function HomePage() {
  const { user, loading, signout } = useAuth()
  const { t } = useLanguage()
  const [heroImage, setHeroImage] = useState('/user-photos/gym-main.jpg')

  if (loading) {
    return (
      <div className="flex-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-5xl leading-none animate-pulse">🍑</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#111111]">
        <img
          src={heroImage}
          onError={() => setHeroImage(heroFallback)}
          alt="Fitness Studio"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="mx-auto max-w-2xl text-center text-white">
            <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-7xl">{t('home.title')}</h1>
            <p className="mb-10 text-lg text-zinc-200 md:text-2xl">{t('home.subtitle')}</p>

            <div className="mx-auto flex w-full max-w-md flex-col gap-3">
              <Link
                to="/signin"
                className="rounded-xl bg-white px-8 py-3 text-base font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                {t('home.signIn')}
              </Link>
              <Link
                to="/signup"
                className="rounded-xl border border-white/70 px-8 py-3 text-base font-semibold text-white transition hover:bg-white/10"
              >
                {t('home.signUp')}
              </Link>
            </div>

            <LegalLinks tone="dark" className="mt-7" />
          </div>
        </div>
      </div>
    )
  }

  if (user.status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f5f5] to-[#ebebeb] flex-center">
        <div className="card max-w-md border-[#d4d4d8] shadow-lg">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('home.awaitingApprovalTitle')}</h1>
            <p className="text-gray-600 mb-4">
              {t('home.awaitingApprovalMessage')}
            </p>
            <p className="text-sm text-gray-500">{t('home.emailLabel')}: {user.email}</p>
            <button
              onClick={() => {
                signout()
              }}
              className="btn-secondary mt-6 w-full"
            >
              {t('home.signOut')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <Navigate to="/dashboard" replace />
}
