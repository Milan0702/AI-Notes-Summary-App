// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
// REMOVE: import { createServerClient } from '@supabase/ssr' - No longer needed here

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('Middleware running for path:', pathname);
  
  // Update session and get the user and response object
  const { response, user } = await updateSession(request);
  console.log('Middleware user state:', !!user, 'User ID:', user?.id?.substring(0, 8));

  // *** REMOVE the redundant Supabase client creation and getUser call here ***
  /*
  const supabase = createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser();
  */

  // Define public paths that don't require authentication
  const publicPaths = ['/', '/login', '/signup', '/auth/callback'];

  // Check if the current path requires authentication
  const isProtectedRoute = !publicPaths.includes(pathname) && !pathname.startsWith('/_next/');
  console.log('Is protected route:', isProtectedRoute);

  // If user is not logged in and trying to access a protected route, redirect to login
  if (!user && isProtectedRoute) {
    console.log('Redirecting unauthenticated user to login');
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname); // Optional: Add redirect info
    // Redirect using a new NextResponse object
    return NextResponse.redirect(url);
  }

  // If user IS logged in and trying to access landing, login or signup, redirect to dashboard
  if (user && (pathname === '/' || pathname === '/login' || pathname === '/signup')) {
    console.log('Redirecting authenticated user to dashboard');
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    // Redirect using a new NextResponse object
    return NextResponse.redirect(url);
  }

  console.log('Continuing with normal response');
  // Otherwise, continue with the response potentially modified by updateSession
  return response;
}

// Config remains the same
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}