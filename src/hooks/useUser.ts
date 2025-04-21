'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { User } from '@supabase/supabase-js'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          throw error
        }
        
        setUser(user)
      } catch (error) {
        console.error('Error loading user:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
    
    // Setup auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
      toast.success('Logged out successfully')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error signing out:', error)
      toast.error(`Failed to log out: ${errorMessage}`)
    }
  }

  return {
    user,
    isLoading,
    isLoggedIn: !!user,
    logout
  }
} 