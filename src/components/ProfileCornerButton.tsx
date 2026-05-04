import { Dumbbell, Home, LayoutGrid, LogOut, Menu, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'

interface ProfileCornerButtonProps {
  inline?: boolean
}

export default function ProfileCornerButton({ inline = false }: ProfileCornerButtonProps) {
  const { user, signout } = useAuth()
  const { t } = useLanguage()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (!target) {
        return
      }

      if (menuRef.current?.contains(target)) {
        return
      }

      setOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  if (!user || pathname === '/signin' || pathname === '/signup' || pathname === '/forgot-password' || pathname === '/reset-password') {
    return null
  }

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 px-4 py-3 text-[15px] font-medium leading-5 transition ${
      active ? 'bg-[#fdf7fa] text-[#be185d]' : 'text-[#111111] hover:bg-[#f5f5f5]'
    }`

  const isProfileActive = pathname.startsWith('/profile')
  const isDashboardActive = pathname === '/dashboard'
  const isHomeWorkoutActive = pathname.startsWith('/workouts/home')
  const isGymWorkoutActive = pathname.startsWith('/workouts/gym')

  return (
    <div
      ref={menuRef}
      className={inline ? 'relative z-40' : 'fixed right-4 top-[max(0.75rem,env(safe-area-inset-top))] z-40'}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={t('navigation.openMenu')}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e4e4e7] bg-white/95 text-[#111111] shadow-[0_4px_14px_rgba(17,17,17,0.12)] transition-all duration-200 hover:-translate-y-[1px] hover:border-[#f3d0e1] hover:bg-[#fdf7fa] hover:shadow-[0_8px_20px_rgba(17,17,17,0.14)]"
      >
        <Menu size={17} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-[#d4d4d8] bg-white shadow-xl">
          <div className="border-b border-[#ececec] px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-[#71717a]">
            {t('navigation.sectionTitle')}
          </div>
          <Link onClick={() => setOpen(false)} to="/profile" className={linkClass(isProfileActive)}>
            <UserRound size={16} />
            {t('navigation.profile')}
          </Link>
          <Link onClick={() => setOpen(false)} to="/dashboard" className={linkClass(isDashboardActive)}>
            <LayoutGrid size={16} />
            {t('navigation.mainMenu')}
          </Link>
          <Link onClick={() => setOpen(false)} to="/workouts/home" className={linkClass(isHomeWorkoutActive)}>
            <Home size={16} />
            {t('navigation.homeWorkout')}
          </Link>
          <Link onClick={() => setOpen(false)} to="/workouts/gym" className={linkClass(isGymWorkoutActive)}>
            <Dumbbell size={16} />
            {t('navigation.gymWorkout')}
          </Link>
          <button
            type="button"
            onClick={async () => {
              setOpen(false)
              await signout()
            }}
            className="flex w-full items-center gap-3 border-t border-[#ececec] px-4 py-3 text-left text-[15px] font-medium leading-5 text-[#b91c1c] transition hover:bg-[#fef2f2]"
          >
            <LogOut size={16} />
            {t('navigation.signOut')}
          </button>
        </div>
      )}
    </div>
  )
}