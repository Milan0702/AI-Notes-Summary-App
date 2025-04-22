'use client'

import { AuthForm } from '@/components/auth/AuthForm'
import { AppHeader } from '@/components/AppHeader'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <div className="flex-1 flex items-center justify-center p-4 mt-[64px]">
        <AuthForm mode="login" />
      </div>
    </div>
  )
} 