import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    // Await cookies() as it's now an async function in Next.js 15
    const cookieStore = await cookies()
    // Await createClient as it's now an async function
    const supabase = await createClient()
    // exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}/dashboard`)
} 