import { useLanguage } from '../hooks/useLanguage'

interface LegalLinksProps {
  tone?: 'light' | 'dark'
  className?: string
}

export default function LegalLinks({ tone = 'light', className = '' }: LegalLinksProps) {
  const { t } = useLanguage()
  const palette = tone === 'dark'
    ? 'text-zinc-200/90 hover:text-white'
    : 'text-gray-500 hover:text-gray-800'

  const links = [
    { label: t('legal.privacyPolicy'), href: '/privacy-policy' },
    { label: t('legal.termsOfUse'), href: '/terms' },
    { label: t('legal.disclaimer'), href: '/disclaimer' },
    { label: t('legal.refundPolicy'), href: '/refund-policy' },
    { label: t('legal.cookiePolicy'), href: '/cookie-policy' },
  ]

  return (
    <nav className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs ${className}`} aria-label={t('legal.ariaLabel')}>
      {links.map((item, index) => (
        <span key={item.href} className="inline-flex items-center gap-4">
          {index > 0 && <span className={tone === 'dark' ? 'text-zinc-400' : 'text-gray-400'} aria-hidden="true">•</span>}
          <a href={item.href} target="_blank" rel="noopener noreferrer" className={`transition ${palette}`}>
            {item.label}
          </a>
        </span>
      ))}
    </nav>
  )
}
