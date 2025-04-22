'use client'

import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { User, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface AppHeaderProps {
  showAuthButtons?: boolean
}

export function AppHeader({ showAuthButtons = true }: AppHeaderProps) {
  const { user, logout, isLoggedIn } = useUser()
  
  return (
    <header className="border-b px-4 py-3 flex justify-between items-center backdrop-blur-sm bg-background/90 fixed top-0 left-0 right-0 h-[64px] z-50 shadow-sm app-header">
      <Link href={isLoggedIn ? '/dashboard' : '/'} className="text-xl font-bold hover:text-primary transition-colors">
        Smart Notes
      </Link>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[60]">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              {user?.email && (
                <>
                  <span className="px-2 py-1 text-xs text-muted-foreground block truncate max-w-[200px]">
                    {user.email}
                  </span>
                  <DropdownMenuSeparator />
                </>
              )}
              <Link href="/" passHref>
                <DropdownMenuItem className="cursor-pointer">
                  Home
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : showAuthButtons ? (
          <div className="flex gap-2">
            <Link href="/login" passHref>
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link href="/signup" passHref>
              <Button variant="default" size="sm">Sign Up</Button>
            </Link>
          </div>
        ) : null}
      </div>
    </header>
  )
} 