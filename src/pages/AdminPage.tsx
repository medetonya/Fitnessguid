import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface AdminUserRow {
  id: string
  email: string
  name: string | null
  role: 'user' | 'admin'
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  access_expires_at?: string | null
}

const plusDaysIso = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

const formatExpiry = (iso?: string | null) => {
  if (!iso) {
    return 'not set'
  }

  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) {
    return 'invalid'
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingUserId, setSavingUserId] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: usersError } = await supabase
        .from('users')
        .select('id, email, name, role, status, created_at, access_expires_at')
        .order('created_at', { ascending: false })

      if (usersError) {
        throw usersError
      }

      setUsers((data ?? []) as AdminUserRow[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const updateUser = async (
    userId: string,
    payload: Partial<Pick<AdminUserRow, 'status' | 'role' | 'access_expires_at'>>
  ) => {
    try {
      setSavingUserId(userId)
      setError(null)

      const { error: updateError } = await supabase.from('users').update(payload).eq('id', userId)

      if (updateError) {
        throw updateError
      }

      setUsers((prev) => prev.map((row) => (row.id === userId ? { ...row, ...payload } : row)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    } finally {
      setSavingUserId(null)
    }
  }

  const pendingUsers = users.filter((user) => user.status === 'pending')

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container-max py-10">
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">Approve new users and manage access roles.</p>
        </section>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Pending Approvals</h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
              {pendingUsers.length} pending
            </span>
          </div>

          {loading ? (
            <p className="text-gray-600">Loading users...</p>
          ) : pendingUsers.length === 0 ? (
            <p className="text-gray-600">No pending users right now.</p>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map((user) => (
                <article key={user.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name || user.email}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateUser(user.id, { status: 'approved', access_expires_at: plusDaysIso(30) })}
                        disabled={savingUserId === user.id}
                        className="btn-primary"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateUser(user.id, { status: 'rejected' })}
                        disabled={savingUserId === user.id}
                        className="btn-secondary"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-gray-900">All Users</h2>

          {loading ? (
            <p className="text-gray-600">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-600">No users yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-600">
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Role</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Access Until</th>
                    <th className="py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100">
                      <td className="py-3 pr-4 text-gray-800">{user.email}</td>
                      <td className="py-3 pr-4 text-gray-700">{user.name || '-'}</td>
                      <td className="py-3 pr-4 capitalize text-gray-700">{user.role}</td>
                      <td className="py-3 pr-4 capitalize text-gray-700">{user.status}</td>
                      <td className="py-3 pr-4 text-gray-700">{formatExpiry(user.access_expires_at)}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => updateUser(user.id, { role: 'admin', status: 'approved', access_expires_at: plusDaysIso(30) })}
                            disabled={savingUserId === user.id}
                            className="btn-secondary px-3 py-1 text-xs"
                          >
                            Make admin
                          </button>
                          <button
                            onClick={() => updateUser(user.id, { role: 'user' })}
                            disabled={savingUserId === user.id}
                            className="btn-secondary px-3 py-1 text-xs"
                          >
                            Make user
                          </button>
                          <button
                            onClick={() => updateUser(user.id, { access_expires_at: plusDaysIso(30), status: 'approved' })}
                            disabled={savingUserId === user.id}
                            className="btn-secondary px-3 py-1 text-xs"
                          >
                            Extend +30d
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
