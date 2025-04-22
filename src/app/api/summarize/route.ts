import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Input validation schema
const summarizeSchema = z.object({
  noteId: z.string().uuid(),
});

// Define the OpenRouter API endpoint
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
// Default to a generally available model if not specified
const OPENROUTER_MODEL = process.env.OPENROUTER_API_MODEL || "openai/gpt-3.5-turbo";

export async function POST(request: Request) {
  try {
    // Create the Supabase client with the awaited cookies API
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              console.warn(`Warn: cookieStore.set failed in Route Handler: ${error}`);
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options, maxAge: 0 });
            } catch (error) {
              console.warn(`Warn: cookieStore.remove failed in Route Handler: ${error}`);
            }
          },
        },
      }
    );

    // 1. Check Authentication & Authorization using Server Client
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and Validate Input
    const body = await request.json();
    const parseResult = summarizeSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: parseResult.error.errors }, { status: 400 });
    }
    const { noteId } = parseResult.data;

    // 3. Fetch Note Content from Supabase (check ownership again via RLS implicitly)
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('content, title') // Also select title for context if needed
      .eq('id', noteId)
      // .eq('user_id', user.id) // RLS should handle this, but explicit check is safer
      .single();

    if (fetchError || !note) {
      if (fetchError && fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Note not found or access denied' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch note content' }, { status: 500 });
    }

    const contentToSummarize = note.content?.trim();

    if (!contentToSummarize) {
      return NextResponse.json({ summary: 'Note content is empty, nothing to summarize.' });
    }

    // 4. Call OpenRouter API
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!openrouterApiKey) {
      return NextResponse.json({ error: 'AI Service not configured' }, { status: 500 });
    }

    // Prepare the payload for OpenRouter API (following OpenAI format)
    const payload = {
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes text concisely. Provide the summary directly without any introductory phrases like 'Here is the summary:'."
        },
        {
          role: "user",
          content: `Summarize the following note content (Original Title: "${note.title || 'Untitled Note'}"):\n\n${contentToSummarize}`
        }
      ],
      temperature: 0.3,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    };

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openrouterApiKey}`,
        'HTTP-Referer': process.env.NODE_ENV === 'production'
          ? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://notes-app.example.com')
          : 'http://localhost:3000',
        'X-Title': process.env.APP_NAME || 'AI Notes App'
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorText = '';
      let errorJson = null;
      
      try {
        // Try to get the error as JSON first
        errorJson = await response.json();
        errorText = JSON.stringify(errorJson);
      } catch {
        // If that fails, get it as text
        errorText = await response.text();
      }
      
      // Handle specific error codes
      if (response.status === 402) {
        return NextResponse.json({ 
          error: 'API usage limit reached or payment required. Please check your OpenRouter account.' 
        }, { status: 402 });
      }
      
      if (response.status === 400) {
        // Provide more detailed error for 400 Bad Request
        return NextResponse.json({ 
          error: `Invalid request to AI service: ${errorJson?.error?.message || errorText}` 
        }, { status: 400 });
      }
      
      throw new Error(`AI service request failed (Status: ${response.status}, Details: ${errorText})`);
    }

    const result = await response.json();

    // Extract the summary from OpenRouter response
    const summary = result.choices?.[0]?.message?.content?.trim() || 'Could not generate summary.';

    // 5. Return Summary
    return NextResponse.json({ summary });
  } catch (error: unknown) {
    console.error("Error in /api/summarize:", error);
    
    // Determine a safer client error message based on error type
    let clientErrorMessage = 'An unexpected error occurred during summarization.';
    
    if (error instanceof Error) {
      // Provide specific messages for known error types
      if (error.message.includes('API usage limit') || error.message.includes('payment required')) {
        clientErrorMessage = 'AI service usage limit reached. Please try again later.';
      } else if (error.message.includes('AI service')) {
        clientErrorMessage = error.message; // Pass through AI service specific errors
      } else if (error.message.includes('Unauthorized') || error.message.includes('auth')) {
        clientErrorMessage = 'Authentication error. Please log in again.';
      }
    }
    
    return NextResponse.json({ error: clientErrorMessage }, { status: 500 });
  }
} 