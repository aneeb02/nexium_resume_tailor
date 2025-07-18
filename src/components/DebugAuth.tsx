'use client'

import { useAuth } from '@/contexts/AuthContext'

export function DebugAuth() {
  const { user, session, loading } = useAuth()

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div>
        <strong>Loading:</strong> {loading ? 'true' : 'false'}
      </div>
      <div>
        <strong>User:</strong> {user ? user.email : 'null'}
      </div>
      <div>
        <strong>Session:</strong> {session ? 'exists' : 'null'}
      </div>
      <div>
        <strong>User ID:</strong> {user?.id || 'null'}
      </div>
    </div>
  )
}
