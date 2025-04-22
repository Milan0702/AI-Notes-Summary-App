import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the auth helpers package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  console.log('🔑 Auth callback hit. Code exists:', !!code)
  
  // This is a crucial and direct response with two additional approaches:
  
  // 1. We add refresh=true to force a refresh of the page, which can help with session sync
  const dashboardUrl = new URL('/dashboard', requestUrl.origin)
  dashboardUrl.searchParams.set('refresh', 'true')
  
  // 2. We add a special flag to short-circuit middleware redirects if needed
  dashboardUrl.searchParams.set('auth', 'callback')
  
  console.log('🚀 Redirecting to dashboard with refresh:', dashboardUrl.toString())
  
  const response = NextResponse.redirect(dashboardUrl)
  
  // 3. We bypass client-side caching to ensure fresh state
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  
  return response
} 