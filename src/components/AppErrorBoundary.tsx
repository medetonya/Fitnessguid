import { Component, type ErrorInfo, type ReactNode } from 'react'

interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  hasError: boolean
}

export default class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Keep stack trace visible for production diagnostics.
    console.error('AppErrorBoundary caught runtime error', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] p-6">
          <div className="max-w-md rounded-2xl border border-[#d4d4d8] bg-white p-6 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-[#111111]">Something went wrong</h1>
            <p className="mt-2 text-sm text-[#52525b]">
              Please reload the page. If auto-translation is enabled in your browser, turn it off for this site.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex rounded-xl bg-[#111111] px-4 py-2 text-sm font-semibold text-white"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
