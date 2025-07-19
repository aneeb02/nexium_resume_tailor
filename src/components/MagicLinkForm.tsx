'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react'

interface MagicLinkFormProps {
  onBackToAuth: () => void
}

export function MagicLinkForm({ onBackToAuth }: MagicLinkFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { signInWithMagicLink } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await signInWithMagicLink(email)
      
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="inline-block px-6 py-2 border-2 border-black rounded-full bg-white font-bold text-lg shadow-[4px_4px_0px_0px_#000]">
              CHECK YOUR EMAIL
            </div>
          </div>

          {/* Main card */}
          <div className="bg-white border-2 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_#000]">
            <div className="text-center mb-6">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_#000] mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-center mb-2">
                Magic Link Sent!
              </h2>
              <p className="text-center text-gray-500 mb-4">
                We've sent a magic link to <span className="font-medium text-orange-600">{email}</span>
              </p>
              <p className="text-center text-gray-500">
                Click the link in the email to sign in to your account.
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={onBackToAuth}
                className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg border-2 border-black flex items-center justify-center group hover:bg-orange-600 transition-all transform active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_#000]"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Sign In
              </button>
              
              <div className="text-center">
                <button
                  onClick={() => {
                    setSuccess(false)
                    setEmail('')
                  }}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Try a different email
                </button>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="text-center mt-4">
            <div className="inline-block px-4 py-1 border-2 border-black rounded-full bg-white font-semibold text-sm shadow-[2px_2px_0px_0px_#000]">
              2025
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-block px-6 py-2 border-2 border-black rounded-full bg-white font-bold text-lg shadow-[4px_4px_0px_0px_#000]">
            MAGIC LINK
          </div>
        </div>

        {/* Main form card */}
        <div className="bg-white border-2 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_#000]">
          <h2 className="text-3xl font-bold text-center mb-2">
            Sign in with Magic Link
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Enter your email and we'll send you a magic link to sign in
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Mail size={20} />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-black focus:outline-none focus:border-black transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg border-2 border-black flex items-center justify-center group hover:bg-orange-600 transition-all transform active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending magic link...
                  </div>
                ) : (
                  <>
                    Send Magic Link
                    <ArrowRight size={20} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={onBackToAuth}
                className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg border-2 border-black flex items-center justify-center hover:bg-gray-300 transition-all transform active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_#000]"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Sign In
              </button>
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-4">
          <div className="inline-block px-4 py-1 border-2 border-black rounded-full bg-white font-semibold text-sm shadow-[2px_2px_0px_0px_#000]">
            2025
          </div>
        </div>
      </div>
    </div>
  )
}
