import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  const resetScrollTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }

  useEffect(() => {
    if (!('scrollRestoration' in window.history)) {
      return
    }

    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'

    return () => {
      window.history.scrollRestoration = previous
    }
  }, [])

  useLayoutEffect(() => {
    // Immediate reset for route transition.
    resetScrollTop()

    // Extra reset on next frame for pages with delayed layout/content.
    const frame = window.requestAnimationFrame(() => {
      resetScrollTop()
    })

    // Final fallback after paint for mobile browsers.
    const timeout = window.setTimeout(() => {
      resetScrollTop()
    }, 0)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timeout)
    }
  }, [pathname, search, hash])

  return null
}
