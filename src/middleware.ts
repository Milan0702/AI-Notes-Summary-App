// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Update user's session based on the request
  const response = await updateSession(request);

  // We can't use the server client from @/lib/supabase/server in middleware
  // because it uses the cookies() API which isn't available in middleware
  // Instead, we need to create a client directly with the request cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Define public paths that don't require authentication
  const publicPaths = ['/', '/login', '/signup', '/auth/callback'];

  // If user is not logged in and trying to access a protected route, redirect to login
  if (!user && !publicPaths.includes(pathname) && !pathname.startsWith('/_next/')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname); // Optional: Add redirect info
    return NextResponse.redirect(url);
  }

  // If user is logged in and trying to access landing, login or signup, redirect to dashboard
  if (user && (pathname === '/' || pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response; // Continue processing the request
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 