'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/AppHeader'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 mt-[64px]">
        <div className="max-w-2xl w-full space-y-8 text-center">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">AI Notes App</h1>
            <p className="text-xl text-muted-foreground">
              Create, organize, and enhance your notes with the power of AI. 
              Take notes smarter, not harder.
            </p>
          </div>
          
          <div className="pt-6">
            <p className="text-muted-foreground pb-4">
              Your personal AI-powered knowledge management system
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" passHref>
                <Button size="lg" variant="default" className="w-full sm:w-auto">
                  Login
                </Button>
              </Link>
              <Link href="/signup" passHref>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="mt-10 pt-10 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Powered by Next.js, Supabase, and Groq LLM
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
