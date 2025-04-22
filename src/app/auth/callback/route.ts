import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    // Await createClient as it's now an async function
    const supabase = await createClient()
    // exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Fallback redirect if no code or session
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
} 