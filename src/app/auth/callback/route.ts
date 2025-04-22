import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the auth helpers package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  console.log('🔑 Auth callback hit. Code exists:', !!code)
  
  if (!code) {
    console.log('⚠️ No code provided in callback')
    return NextResponse.redirect(new URL('/login?error=no_code', requestUrl.origin))
  }
  
  try {
    // Use the Supabase route handler client which is optimized for this use case
    const supabase = createRouteHandlerClient({ cookies })
    
    console.log('🔄 Exchanging code for session...')
    await supabase.auth.exchangeCodeForSession(code)
    
    // Verify the session was created
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('🚨 Session error:', error.message)
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin))
    }
    
    if (data?.session) {
      console.log('✅ Session established successfully! User ID:', data.session.user.id)
      
      // Redirect to dashboard
      const response = NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
      response.headers.set('Cache-Control', 'no-store, max-age=0')
      return response
    } else {
      console.log('❌ No session created after code exchange')
      return NextResponse.redirect(new URL('/login?error=session_creation_failed', requestUrl.origin))
    }
  } catch (error) {
    console.error('❌ Error in auth callback:', error)
    return NextResponse.redirect(new URL('/login?error=auth_error', requestUrl.origin))
  }
} 