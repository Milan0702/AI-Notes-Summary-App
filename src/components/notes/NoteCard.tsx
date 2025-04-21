'use client'

import { Note } from '@/types'
import { format } from 'date-fns'
import { MoreHorizontal } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  onSummarize: (note: Note) => void
}

export function NoteCard({ note, onEdit, onDelete, onSummarize }: NoteCardProps) {
  // Format the timestamp for readability
  const formattedDate = format(new Date(note.updated_at), 'MMM d, yyyy')
  
  // Truncate content for preview
  const contentPreview = note.content 
    ? note.content.length > 100 
      ? `${note.content.substring(0, 100)}...` 
      : note.content 
    : 'No content'
  
  return (
    <Card className="h-full flex flex-col hover:shadow-md hover:border-primary/20 transition-all duration-200">
      <CardHeader className="pb-2 flex flex-row justify-between items-start space-y-0">
        <div>
          <CardTitle className="text-xl font-bold line-clamp-1">{note.title || 'Untitled Note'}</CardTitle>
          <CardDescription className="text-xs">{formattedDate}</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(note)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSummarize(note)}>
              Summarize ✨
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(note.id)} 
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <p className="text-muted-foreground text-sm line-clamp-4">{contentPreview}</p>
      </CardContent>
      <CardFooter className="pt-2 border-t flex justify-between items-center">
        <span className="text-xs text-muted-foreground font-mono">#{note.id.substring(0, 8)}</span>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs rounded-full hover:bg-primary/10"
            onClick={() => onEdit(note)}
          >
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs rounded-full hover:bg-primary/10"
            onClick={() => onSummarize(note)}
          >
            Summarize
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 