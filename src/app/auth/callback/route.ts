import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the auth helpers package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  console.log('Auth callback hit. Code exists:', !!code)
  
  if (code) {
    try {
      console.log('Attempting code exchange...')
      const supabase = createRouteHandlerClient({ cookies })
      await supabase.auth.exchangeCodeForSession(code)
      console.log('Code exchange successful')
    } catch (error) {
      console.error('Error during code exchange:', error)
      // Still redirect to dashboard - middleware will redirect back to login if needed
    }
  }

  console.log('Redirecting to dashboard...')
  // Always redirect to dashboard after auth - middleware will handle redirection if no valid session
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
} 