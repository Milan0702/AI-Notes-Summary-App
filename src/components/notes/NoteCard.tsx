'use client'

import { Note } from '@/types'
import { format } from 'date-fns'
import { Eye, MoreHorizontal, Pencil, Trash, Sparkles } from 'lucide-react'
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
  onView: (note: Note) => void
}

export function NoteCard({ note, onEdit, onDelete, onSummarize, onView }: NoteCardProps) {
  // Format the timestamp for readability
  const formattedDate = format(new Date(note.updated_at), 'MMM d, yyyy')
  
  // Truncate content for preview
  const contentPreview = note.content 
    ? note.content.length > 100 
      ? `${note.content.substring(0, 100)}...` 
      : note.content 
    : 'No content'
  
  // Handle view click with a nice ripple effect
  const handleViewClick = (e: React.MouseEvent) => {
    // Create ripple effect
    const ripple = document.createElement('div');
    ripple.classList.add('ripple-effect');
    
    // Position at click coordinates
    ripple.style.top = `${e.clientY}px`;
    ripple.style.left = `${e.clientX}px`;
    
    document.body.appendChild(ripple);
    
    // Remove ripple after animation completes
    setTimeout(() => {
      document.body.removeChild(ripple);
      onView(note);
    }, 300);
  }
  
  return (
    <Card className="h-full flex flex-col group relative overflow-hidden
      shadow-md hover:shadow-xl transition-all duration-300
      bg-gradient-to-br from-card to-card/90 hover:from-card/95 hover:to-card
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/0 before:to-primary/5 before:opacity-0
      hover:before:opacity-100 before:transition-opacity before:duration-500 before:pointer-events-none
      transform hover:-translate-y-1.5 active:translate-y-0 active:shadow-md
      after:absolute after:inset-0 after:rounded-lg after:border-2 after:border-primary/0 after:transition-all
      hover:after:border-primary/20 after:opacity-0 hover:after:opacity-100"
    >
      <CardHeader className="pb-2 flex flex-row justify-between items-start space-y-0">
        <div>
          <CardTitle 
            className="text-xl font-bold line-clamp-1 group-hover:text-primary/90 transition-colors duration-300"
          >
            {note.title || 'Untitled Note'}
          </CardTitle>
          <CardDescription className="text-xs">{formattedDate}</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2 opacity-70 hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onView(note)} className="cursor-pointer">
              <Eye className="h-4 w-4 mr-2" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(note)} className="cursor-pointer">
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSummarize(note)} className="cursor-pointer">
              <Sparkles className="h-4 w-4 mr-2" /> Summarize
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(note.id)} 
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <Trash className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent 
        className="py-2 flex-grow cursor-pointer" 
        onClick={handleViewClick}
      >
        <p className="text-muted-foreground text-sm line-clamp-4 group-hover:text-foreground/90 transition-colors duration-300">
          {contentPreview}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-start pt-2 pb-4 space-y-2">
        <span className="text-xs text-muted-foreground/70 font-mono">#{note.id.substring(0, 8)}</span>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs rounded-full hover:bg-primary/10 flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
            onClick={handleViewClick}
          >
            <Eye className="h-3 w-3" />
            View
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs rounded-full hover:bg-primary/10 flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
            onClick={() => onEdit(note)}
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs rounded-full hover:bg-primary/10 flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
            onClick={() => onSummarize(note)}
          >
            <Sparkles className="h-3 w-3" />
            Summarize
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 