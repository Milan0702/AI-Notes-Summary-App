'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

type AuthFormProps = {
  mode: 'login' | 'signup'
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const supabase = createClient()
  
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) throw error
        
        toast.success('Login successful', {
          description: 'Redirecting to your dashboard...',
        })
        
        // Ensure synchronous redirect happens
        window.location.href = '/dashboard'
      } else {
        console.log('Starting signup process for:', email)
        
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        
        console.log('Signup response:', { 
          user: data?.user ? `ID: ${data.user.id}` : null,
          session: !!data?.session,
          confirmationSent: data?.user?.identities?.[0]?.identity_data?.email_confirmed_at ? 'Already confirmed' : 'Pending',
          error: error?.message
        })
        
        if (error) throw error
        
        if (data?.user?.identities?.length === 0) {
          toast.error('Account already exists', {
            description: 'Please login instead or use a different email.',
          })
        } else {
          toast.success('Account created', {
            description: `Verification email sent to ${email}. Please check your inbox and spam folder.`,
            duration: 6000,
          })
          
          // Clear form after successful signup
          setEmail('')
          setPassword('')
        }
        
        // If auto-confirmation is enabled (development environments)
        if (data?.session) {
          console.log('Auto-confirmation detected - redirecting to dashboard')
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 2000)
        }
      }
    } catch (err: unknown) {
      let errorMessage = 'An error occurred during authentication'
      
      if (err instanceof Error) {
        errorMessage = err.message
        console.error(`Auth error (${mode}):`, err)
      } else {
        console.error(`Unknown auth error (${mode}):`, err)
      }
      
      toast.error(`${mode === 'login' ? 'Login' : 'Signup'} failed`, {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleGoogleAuth = async () => {
    setIsLoading(true)
    
    try {
      console.log('Starting Google OAuth flow with explicit options')
      
      // Clear any existing session first
      await supabase.auth.signOut()
      
      // Use full absolute URL for the redirect
      const redirectUrl = `${window.location.origin}/auth/callback`
      console.log(`Setting redirect URL: ${redirectUrl}`)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            // Explicitly request a refresh token
            access_type: 'offline',
            // Always show account selection even if the user is already signed in
            prompt: 'select_account'
          },
          // Make sure cookies are set in the browser
          skipBrowserRedirect: false
        }
      })
      
      if (error) throw error
      
      // Redirect is handled by Supabase now so we won't reach this point
      // But add a toast just in case
      toast.info('Redirecting to Google authentication...')
    } catch (err: unknown) {
      setIsLoading(false)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during Google authentication'
      toast.error('Google authentication failed', {
        description: errorMessage,
      })
      console.error('Google auth error:', err)
    }
  }
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">
          {mode === 'login' ? 'Login to your account' : 'Create an account'}
        </CardTitle>
        <CardDescription>
          {mode === 'login' 
            ? 'Enter your email and password to access your notes' 
            : 'Fill in the details below to create your account'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password"
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading 
              ? 'Processing...' 
              : mode === 'login' ? 'Login' : 'Sign Up'
            }
          </Button>
        </form>
        
        <div className="mt-6 flex items-center">
          <Separator className="flex-1" />
          <span className="mx-4 text-xs text-muted-foreground">OR</span>
          <Separator className="flex-1" />
        </div>
        
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={handleGoogleAuth}
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          Sign in with Google
        </Button>
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <div className="text-sm text-muted-foreground">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </>
          )}
        </div>
      </CardFooter>
      <div className="text-center text-sm text-muted-foreground mt-4">
        By continuing, you agree to our{' '}
        <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </Link>{' '}
        &amp;{' '}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </Link>
        .
      </div>
    </Card>
  )
} 