import type { NavigateFunction } from 'react-router-dom'

export const navigateBackWithFallback = (navigate: NavigateFunction, fallbackPath: string) => {
  if (typeof window !== 'undefined') {
    const state = window.history.state as { idx?: number } | null
    if (typeof state?.idx === 'number' && state.idx > 0) {
      navigate(-1)
      return
    }
  }

  navigate(fallbackPath)
}