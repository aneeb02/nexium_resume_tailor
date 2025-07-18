'use client'

import { useState } from 'react'
import { AuthForm } from '@/components/AuthForm'
import { MagicLinkForm } from '@/components/MagicLinkForm'

type AuthMode = 'signin' | 'signup' | 'magic-link'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin')

  const handleMagicLinkClick = () => {
    setMode('magic-link')
  }

  const handleBackToAuth = () => {
    setMode('signin')
  }

  if (mode === 'magic-link') {
    return <MagicLinkForm onBackToAuth={handleBackToAuth} />
  }

  return (
    <AuthForm 
      mode={mode as 'signin' | 'signup'} 
      onModeChange={(newMode) => setMode(newMode)} 
      onMagicLinkClick={handleMagicLinkClick}
    />
  )
}
