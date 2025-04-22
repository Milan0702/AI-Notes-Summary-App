import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the auth helpers package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  console.log('🔑 Auth callback hit. Code exists:', !!code)
  
  try {
    if (code) {
      // Create a Supabase client using the auth-helpers package for route handlers
      // We need to pass the cookies function itself not the result of calling it
      const supabase = createRouteHandlerClient({ cookies })
    
      console.log('🔄 Attempting code exchange...')
      await supabase.auth.exchangeCodeForSession(code)
      console.log('✅ Code exchange completed')
      
      // Return directly to dashboard to avoid middleware check issues
      console.log('🚀 Redirecting to dashboard after successful auth')
      return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
    }
  } catch (error) {
    console.error('❌ Error in auth callback:', error)
    // Continue to redirect even if there's an error
  }
  
  // If there's no code or an error occurred, redirect to login
  console.log('⚠️ No code or error occurred, redirecting to login')
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
} 