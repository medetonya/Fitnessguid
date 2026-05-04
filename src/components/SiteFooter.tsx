const footerLinks = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Use', href: '/terms' },
  { label: 'Disclaimer', href: '/disclaimer' },
  { label: 'Refund Policy', href: '/refund-policy' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
]

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#d4d4d8] bg-white/90 px-4 py-5">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-[#52525b]">
        {footerLinks.map((item) => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-[#111111]"
          >
            {item.label}
          </a>
        ))}
      </div>
    </footer>
  )
}
