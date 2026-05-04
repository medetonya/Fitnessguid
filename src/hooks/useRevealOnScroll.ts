import { useEffect } from 'react'

export function useRevealOnScroll(selector = '[data-reveal]') {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const elements = Array.from(document.querySelectorAll<HTMLElement>(selector))
    if (elements.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -8% 0px',
      }
    )

    elements.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index * 60, 300)}ms`
      observer.observe(element)
    })

    return () => {
      observer.disconnect()
    }
  }, [selector])
}
