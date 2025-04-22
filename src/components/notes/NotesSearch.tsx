'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface NotesSearchProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export function NotesSearch({ onSearch, placeholder = "Search notes...", className = "" }: NotesSearchProps) {
  const [query, setQuery] = useState('')
  
  useEffect(() => {
    // Debounce search to avoid too many updates
    const timeout = setTimeout(() => {
      onSearch(query)
    }, 300)
    
    return () => clearTimeout(timeout)
  }, [query, onSearch])
  
  const clearSearch = () => {
    setQuery('')
    onSearch('')
  }
  
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-9 pr-9 bg-background/50 focus:bg-background transition-colors"
      />
      {query && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0.5 text-muted-foreground"
          onClick={clearSearch}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  )
} 