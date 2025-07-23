'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null; data?: unknown }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (name: string, avatarUrl?: string) => Promise<{ error: Error | string | null }>
}


const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  
  const signUp = async (
  email: string,
  password: string,
  name?: string
): Promise<{ error: Error | null; data?: unknown }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { name: name || '' },
      },
    })

    return {
      error: error ? (error as Error) : null,
      data,
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}




  const signIn = async (
  email: string,
  password: string
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { error: error ? (error as Error) : null }
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}



  const signInWithMagicLink = async (
  email: string
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    return { error: error ? (error as Error) : null }
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}



  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    }
  }

  // const updateProfile = async (name: string, avatarUrl?: string) => {
  //   try {
  //     if (!user) {
  //       return { error: 'No user found' }
  //     }

  //     // First try to update the profile
  //     const { error: updateError } = await supabase
  //       .from('profiles')
  //       .update({
  //         name,
  //         avatar_url: avatarUrl || '',
  //         updated_at: new Date().toISOString()
  //       })
  //       .eq('id', user.id)

  //     // If the update failed because the profile doesn't exist, create it
  //     if (updateError && updateError.code === 'PGRST116') {
  //       const { error: insertError } = await supabase
  //         .from('profiles')
  //         .insert({
  //           id: user.id,
  //           name,
  //           avatar_url: avatarUrl || '',
  //           created_at: new Date().toISOString(),
  //           updated_at: new Date().toISOString()
  //         })
        
  //       return { error: insertError }
  //     }

  //     return { error: updateError }
  //   } catch (error) {
  //     console.error('Profile update error:', error)
  //     return { error }
  //   }
  // }

  const updateProfile = async (
  name: string,
  avatarUrl?: string
): Promise<{ error: Error | string | null }> => {
  try {
    if (!user) return { error: 'No user found' }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        name,
        avatar_url: avatarUrl || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError?.code === 'PGRST116') {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          name,
          avatar_url: avatarUrl || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      return { error: insertError ? (insertError as Error) : null }
    }

    return { error: updateError ? (updateError as Error) : null }
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}


  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithMagicLink,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
