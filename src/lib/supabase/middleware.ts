// src/lib/supabase/middleware.ts
import { createServerClient,  } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { type User } from '@supabase/supabase-js' // Import User type

// Update return type
export async function updateSession(request: NextRequest): Promise<{ response: NextResponse; user: User | null }> {
  // Create a response that we'll modify later
  const response = NextResponse.next({ // Use let as we might reassign
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
          // *** Important: Clone response when setting cookies ***
          // Create a mutable clone of the request headers if needed (though less common to modify request here)
          // request.headers are read-only, clone if mutation is needed
          // response.cookies.set can directly modify the response object

          // Re-assign response to ensure modifications are captured if needed within loop/callbacks
          // but setting cookies on the original response object should work directly
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          // *** Important: Clone response when removing cookies ***
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

  // IMPORTANT: Refresh session AND get user data
  const { data: { user } } = await supabase.auth.getUser(); // This call updates cookies via set/remove above

  // Return both the response and the user object
  return { response, user };
}