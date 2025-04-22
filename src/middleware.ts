// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  console.log('===== Middleware running for path:', pathname, '=====');
  
  // Special handling for auth callback - log but don't interfere
  if (pathname === '/auth/callback') {
    console.log('🔄 Auth callback detected - passing through without auth check');
    return NextResponse.next();
  }
  
  // Check for special auth param coming from our callback
  const isAuthCallback = searchParams.get('auth') === 'callback';
  if (isAuthCallback) {
    console.log('🔄 Auth callback redirect detected - bypassing middleware checks');
    const cleanUrl = new URL(request.nextUrl.pathname, request.url);
    return NextResponse.redirect(cleanUrl);
  }
  
  // Create a response object that we'll modify and return
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create a Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          // Debug auth cookies
          if (name.includes('auth')) {
            console.log(`Cookie check: ${name} exists:`, !!request.cookies.get(name)?.value);
          }
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          // Debug auth cookies being set
          if (name.includes('auth')) {
            console.log(`Setting cookie: ${name}`);
          }
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          if (name.includes('auth')) {
            console.log(`Removing cookie: ${name}`);
          }
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

  // Try to get the session directly
  const { data: { session } } = await supabase.auth.getSession();
  
  // More detailed session logging
  if (session) {
    console.log('🔐 Session found:', true, 'User ID:', session.user?.id?.substring(0, 8), 'Provider:', session.user?.app_metadata?.provider);
  } else {
    console.log('🔐 No active session found');
    
    // Check if there are any auth tokens
    const hasAuthToken = request.cookies.get('sb-access-token')?.value || 
                         request.cookies.get('sb-refresh-token')?.value ||
                         request.cookies.get(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`)?.value;
                         
    if (hasAuthToken) {
      console.log('⚠️ Auth tokens exist but no session found - possible token issue');
    }
  }

  // Define public paths that don't require authentication
  const publicPaths = ['/', '/login', '/signup'];

  // Check if the current path requires authentication
  const isProtectedRoute = !publicPaths.includes(pathname) && !pathname.startsWith('/_next/');
  console.log('🛡️ Is protected route:', isProtectedRoute);

  // If user is not logged in and trying to access a protected route, redirect to login
  if (!session && isProtectedRoute) {
    console.log('⚠️ Redirecting unauthenticated user to login');
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  // If user IS logged in and trying to access landing, login or signup, redirect to dashboard
  if (session && (pathname === '/' || pathname === '/login' || pathname === '/signup')) {
    console.log('✅ Redirecting authenticated user to dashboard');
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  console.log('✨ Continuing with normal response');
  return response;
}

// Config remains the same
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}