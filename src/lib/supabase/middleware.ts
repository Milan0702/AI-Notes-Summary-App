// src/lib/supabase/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Create a response that we'll modify later
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          // Set the cookie in the request (for logging purposes)
          request.cookies.set({
            name,
            value,
            ...options,
          })
          
          // Set the cookie in the response (for browser)
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          // Remove the cookie from request
          request.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          })
          
          // Remove the cookie from response
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          })
        },
      },
    }
  )

  // IMPORTANT: Refresh session to ensure it's up-to-date
  await supabase.auth.getUser()

  return response
} 