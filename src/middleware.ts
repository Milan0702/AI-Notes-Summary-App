// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
// REMOVE: import { createServerClient } from '@supabase/ssr' - No longer needed here

export async function middleware(request: NextRequest) {
  // Update session and get the user and response object
  const { response, user } = await updateSession(request); // Destructure the returned object

  // *** REMOVE the redundant Supabase client creation and getUser call here ***
  /*
  const supabase = createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser();
  */

  const { pathname } = request.nextUrl;

  // Define public paths that don't require authentication
  const publicPaths = ['/', '/login', '/signup', '/auth/callback'];

  // Check if the current path requires authentication
  const isProtectedRoute = !publicPaths.includes(pathname) && !pathname.startsWith('/_next/');

  // If user is not logged in and trying to access a protected route, redirect to login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname); // Optional: Add redirect info
    // Redirect using a new NextResponse object
    return NextResponse.redirect(url);
  }

  // If user IS logged in and trying to access landing, login or signup, redirect to dashboard
  if (user && (pathname === '/' || pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
     // Redirect using a new NextResponse object
    return NextResponse.redirect(url);
  }

  // Otherwise, continue with the response potentially modified by updateSession
  return response;
}

// Config remains the same
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}