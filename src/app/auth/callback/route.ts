import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
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
    // Create a response to use for setting cookies
    const response = NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
    
    // Get the cookie store - IMPORTANT: await is required in Next.js 14+
    const cookieStore = await cookies()
    
    // Create the Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            const cookie = cookieStore.get(name)
            return cookie?.value
          },
          set(name, value, options) {
            // Set cookies on the response
            cookieStore.set(name, value, options)
            response.cookies.set(name, value, options)
          },
          remove(name, options) {
            // Remove cookies from the response
            cookieStore.set(name, '', { ...options, maxAge: 0 })
            response.cookies.set(name, '', { ...options, maxAge: 0 })
          },
        },
      }
    )
    
    console.log('🔄 Exchanging code for session...')
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
    
    console.log('✅ Exchange successful, redirecting to dashboard')
    
    // We don't need to check the session as the exchange will throw if it fails
    return response
  } catch (error) {
    console.error('❌ Error in auth callback:', error)
    return NextResponse.redirect(new URL('/login?error=auth_exchange_failed', requestUrl.origin))
  }
} 