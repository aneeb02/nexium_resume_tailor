'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'

interface AuthFormProps {
  mode: 'signin' | 'signup'
  onModeChange: (mode: 'signin' | 'signup') => void
  onMagicLinkClick: () => void
}

// Custom input component with the new design
const FormInput = ({ 
  id, 
  type, 
  placeholder, 
  icon, 
  value, 
  onChange, 
  autoComplete,
  required = true 
}: {
  id: string
  type: string
  placeholder: string
  icon: React.ReactNode
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  autoComplete?: string
  required?: boolean
}) => (
  <div className="relative mb-4">
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
      {icon}
    </div>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      required={required}
      className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-black focus:outline-none focus:border-black transition-colors"
      placeholder={placeholder}
    />
  </div>
)

export function AuthForm({ mode, onModeChange, onMagicLinkClick }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { signIn, signUp, user } = useAuth()
  const router = useRouter()

  // Redirect to dashboard if user is authenticated
  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password, name)
        if (error) {
          setError(error.message)
        } else {
          setSuccess('Account created successfully! Please check your email for verification.')
          // Reset form
          setEmail('')
          setPassword('')
          setName('')
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          // Success - the auth state change will handle the redirect
          setSuccess('Sign in successful! Redirecting...')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-block px-6 py-2 border-2 border-black rounded-full bg-white font-bold text-lg shadow-[4px_4px_0px_0px_#000]">
            {mode === 'signup' ? 'CREATE ACCOUNT' : 'WELCOME BACK'}
          </div>
        </div>

        {/* Main form card */}
        <div className="bg-white border-2 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_#000]">
          <h2 className="text-3xl font-bold text-center mb-2 text-black">
            {mode === 'signup' ? 'Get Started' : 'Login to your Account'}
          </h2>
          <p className="text-cente mb-8 text-black">
            {mode === 'signup'
              ? 'Join our community of creators!'
              : 'Access your creative dashboard.'}
          </p>

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border-2 border-green-200 text-green-600 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <FormInput
                id="name"
                type="text"
                placeholder="Full Name"
                icon={<User size={20} />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            )}
            
            <FormInput
              id="email"
              type="email"
              placeholder="Email Address"
              icon={<Mail size={20} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            
            <FormInput
              id="password"
              type="password"
              placeholder="Password"
              icon={<Lock size={20} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />

            {mode === 'signin' && (
              <button
                type="button"
                onClick={onMagicLinkClick}
                className="text-sm text-orange-600 hover:underline block text-right mb-6"
              >
                Use Magic Link instead
              </button>
            )}
            
            {mode === 'signup' && (
              <div className="h-6"></div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg border-2 border-black flex items-center justify-center group hover:bg-orange-600 transition-all transform active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : mode === 'signup' ? 'Create Account' : 'Login'}
              <ArrowRight
                size={20}
                className="ml-2 transform group-hover:translate-x-1 transition-transform"
              />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-black">
              {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => onModeChange(mode === 'signup' ? 'signin' : 'signup')}
                className="font-bold text-blue-600 hover:underline ml-2"
              >
                {mode === 'signup' ? 'Login' : 'Sign Up'}
              </button>
            </p>
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
