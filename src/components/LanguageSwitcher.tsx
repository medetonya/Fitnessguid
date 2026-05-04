import { Languages } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import ProfileCornerButton from './ProfileCornerButton'

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="relative z-30 w-full border-b border-[#ececec] bg-white/95 backdrop-blur" aria-label={t('language.switcherAriaLabel')}>
      <div className="container-max flex items-center justify-end gap-2 py-2 sm:gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#f3d0e1] bg-[#fdf7fa] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9d174d] sm:px-3">
          <Languages size={14} />
          <span className="hidden sm:inline">{t('language.switcherAriaLabel')}</span>
        </div>
        <div className="rounded-full border border-[#d4d4d8] bg-white p-1 shadow-sm">
          <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              language === 'en' ? 'bg-[#111111] text-white shadow-sm' : 'text-[#52525b] hover:bg-[#f5f5f5]'
            }`}
          >
            {t('language.english')}
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ru')}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              language === 'ru' ? 'bg-[#111111] text-white shadow-sm' : 'text-[#52525b] hover:bg-[#f5f5f5]'
            }`}
          >
            {t('language.russian')}
          </button>
          </div>
        </div>
        <ProfileCornerButton inline />
      </div>
    </div>
  )
}
