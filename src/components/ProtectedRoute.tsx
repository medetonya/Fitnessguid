import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const getNowTimestamp = () => Date.now()

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'user' | 'admin'
  requireApproved?: boolean
}

export default function ProtectedRoute({
  children,
  requiredRole = 'user',
  requireApproved = false,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  const isAccessExpired = Boolean(
    user
    && user.role !== 'admin'
    && user.status === 'approved'
    && user.accessExpiresAt
    && new Date(user.accessExpiresAt).getTime() < getNowTimestamp()
  )

  if (loading) {
    return (
      <div className="flex-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-5xl leading-none animate-pulse">🍑</div>
        </div>
      </div>
    )
  }

  // User not authenticated
  if (!user) {
    return <Navigate to="/signin" replace />
  }

  // Check if user needs to be approved
  if (requireApproved && user.status !== 'approved') {
    return <Navigate to="/" replace />
  }

  if (requireApproved && isAccessExpired) {
    return <Navigate to="/subscription-expired" replace />
  }

  // Check user role
  if (requiredRole === 'admin' && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
