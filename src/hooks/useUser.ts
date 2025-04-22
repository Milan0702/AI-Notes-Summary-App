'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const refreshUser = useCallback(async () => {
    setIsLoading(true)
    try {
      console.log('Refreshing user session...')
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Error refreshing user:', error)
        setUser(null)
        return null
      }
      
      if (user) {
        console.log('User session refreshed successfully', user.id)
        setUser(user)
        return user
      } else {
        console.log('No user found during refresh')
        setUser(null)
        return null
      }
    } catch (error) {
      console.error('Unexpected error refreshing user:', error)
      setUser(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [supabase.auth])

  useEffect(() => {
    // Load user on mount
    refreshUser()
    
    // Setup auth state change listener with proper types
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state change detected:', event, 'Session exists:', !!session)
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            console.log('Setting user from session:', session.user.id)
            setUser(session.user)
          } else {
            // If no user in the session, try to get it directly
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
              console.log('Retrieved user directly:', user.id)
              setUser(user)
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out')
          setUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, refreshUser])

  const logout = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      router.push('/login')
      toast.success('Logged out successfully')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error signing out:', error)
      toast.error(`Failed to log out: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    user,
    isLoading,
    isLoggedIn: !!user,
    refreshUser,
    logout
  }
} 