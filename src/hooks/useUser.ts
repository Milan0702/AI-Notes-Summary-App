'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { User } from '@supabase/supabase-js'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const refreshUser = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Error refreshing user:', error)
        setUser(null)
        return null
      }
      
      setUser(user)
      return user
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
    
    // Setup auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, _session) => {
        console.log('Auth state change detected:', event)
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const { data: { user } } = await supabase.auth.getUser()
          setUser(user)
        } else if (event === 'SIGNED_OUT') {
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