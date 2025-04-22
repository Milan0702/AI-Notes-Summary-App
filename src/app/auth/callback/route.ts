import { NextResponse } from 'next/server'
<<<<<<< HEAD
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
=======

>>>>>>> 81d56dd (Fixed unused code issues)

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
<<<<<<< HEAD
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      await supabase.auth.exchangeCodeForSession(code)
      
      // Get the current session to verify authentication
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Session established successfully, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
      }
    } catch (error) {
      console.error('Error in auth callback:', error)
      // If there's an error in the auth flow, redirect to login
      return NextResponse.redirect(new URL('/login', requestUrl.origin))
    }
=======
    // Await createClient as it's now an async function
    const supabase = await createClient()
    // exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
>>>>>>> 81d56dd (Fixed unused code issues)
  }

  // Fallback redirect if no code or session
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
} 