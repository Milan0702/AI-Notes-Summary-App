import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/auth/callback']

export async function middleware(request: NextRequest) {
  // Update the session
  const response = await updateSession(request)

  // Check if the user is authenticated
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Get the pathname from the URL
  const { pathname } = request.nextUrl

  // Skip authentication check for public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return response
  }

  // Check the session
  const authCookie = request.cookies.get('sb-access-token')?.value
  
  // If no session and trying to access a protected route, redirect to login
  if (!authCookie && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public/assets (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 