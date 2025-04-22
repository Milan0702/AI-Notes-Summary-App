'use client'

import { Plus } from 'lucide-react'
import {
  Card,
  CardContent,
  CardFooter
} from '@/components/ui/card'

interface NewNoteCardProps {
  onClick: () => void
}

export function NewNoteCard({ onClick }: NewNoteCardProps) {
  return (
    <Card 
      onClick={onClick}
      className="h-full flex flex-col group relative overflow-hidden cursor-pointer
        shadow-md hover:shadow-xl transition-all duration-300
        bg-gradient-to-br from-card to-card/90 hover:from-primary/10 hover:to-primary/5
        before:absolute before:inset-0 before:bg-primary/0 before:opacity-0
        hover:before:opacity-10 before:transition-opacity before:duration-500 before:pointer-events-none
        transform hover:-translate-y-1.5 active:translate-y-0 active:shadow-md
        after:absolute after:inset-0 after:rounded-lg after:border-2 after:border-dashed after:border-primary/40 after:transition-all
        hover:after:border-primary/70 after:opacity-80 hover:after:opacity-100
        border-dashed border-primary/20"
    >
      <CardContent className="p-8 flex items-center justify-center flex-col h-full gap-3 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <Plus className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-medium text-primary/90">Create New Note</h3>
        <p className="text-sm text-muted-foreground">
          Start writing a new note with AI-powered summary
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 opacity-70 flex justify-center">
        <span className="text-xs text-muted-foreground">Click to create</span>
      </CardFooter>
    </Card>
  )
} 