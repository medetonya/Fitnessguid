import { Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function SubscriptionExpiredPage() {
  const { user, signout } = useAuth()

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#d4d4d8] bg-white p-6 shadow-sm">
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#efefef] text-[#111111]">
          <Clock3 size={22} />
        </div>

        <h1 className="text-center text-2xl font-bold text-[#111111]">Access Expired</h1>
        <p className="mt-3 text-center text-sm text-[#52525b]">
          Your 30-day access period has ended.
          Contact support to renew access.
        </p>

        {user?.email && (
          <p className="mt-2 text-center text-xs text-[#71717a]">Account: {user.email}</p>
        )}

        <div className="mt-6 grid gap-2">
          <a
            href="mailto:supportmedetolab@gmail.com"
            className="inline-flex items-center justify-center rounded-xl bg-[#111111] px-4 py-2 text-sm font-semibold text-white"
          >
            Contact Support
          </a>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-[#d4d4d8] bg-white px-4 py-2 text-sm font-semibold text-[#111111]"
          >
            Back to Home
          </Link>
          <button
            type="button"
            onClick={() => {
              signout()
            }}
            className="inline-flex items-center justify-center rounded-xl border border-[#d4d4d8] bg-white px-4 py-2 text-sm font-semibold text-[#111111]"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
