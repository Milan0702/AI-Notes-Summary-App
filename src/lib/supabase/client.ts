import { createBrowserClient } from '@supabase/ssr'

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (supabaseClient) {
    return supabaseClient;
  }
  
  try {
    // Create a supabase client on the browser with project's credentials
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    return supabaseClient;
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    // Return a minimal client that won't break the app
    // This will be replaced on next call if the error was temporary
    supabaseClient = null;
    throw new Error('Failed to initialize authentication client');
  }
} 