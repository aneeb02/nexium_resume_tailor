import { Suspense } from 'react'
import AuthCallback from './AuthCallback'

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <AuthCallback />
    </Suspense>
  )
}
