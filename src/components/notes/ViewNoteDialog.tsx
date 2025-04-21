'use client'

import { useState, useEffect, useRef } from 'react'
import { Note } from '@/types'
import { format } from 'date-fns'
import { X, Pencil, Sparkles, ChevronLeft, ChevronRight, FileText, ArrowLeft } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface ViewNoteDialogProps {
  isOpen: boolean
  onClose: () => void
  currentNote: Note | null
  allNotes: Note[]
  onEdit: (note: Note) => void
  onSummarize: (note: Note) => void
  onSelectNote: (note: Note) => void
}

export function ViewNoteDialog({
  isOpen,
  onClose,
  currentNote,
  allNotes,
  onEdit,
  onSummarize,
  onSelectNote
}: ViewNoteDialogProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  
  // Handle smooth closing animation
  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 200)
  }

  useEffect(() => {
    // Reset scroll position when the note changes
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
    
    // Reset closing state when dialog opens
    if (isOpen) {
      setIsClosing(false)
    }
  }, [currentNote?.id, isOpen])

  if (!currentNote) return null

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const formattedDate = format(new Date(currentNote.updated_at), 'MMM d, yyyy h:mm a')

  return (
    <Dialog open={isOpen} onOpenChange={() => handleClose()}>
      <DialogContent 
        className={cn(
          "max-w-6xl w-full h-[85vh] p-0 gap-0 transition-all duration-200",
          isOpen && !isClosing ? "animate-fade-in opacity-100" : "",
          isClosing ? "opacity-0 translate-y-4" : ""
        )}
      >
        <div className="flex h-full">
          {/* Sidebar with note list */}
          <div 
            className={cn(
              "h-full border-r border-border bg-muted/30 transition-all duration-300",
              sidebarCollapsed ? "w-12" : "w-64"
            )}
          >
            <div className="p-3 flex items-center justify-between">
              <h3 className={cn("font-medium text-sm transition-opacity duration-200", 
                sidebarCollapsed ? "opacity-0" : "opacity-100"
              )}>
                Notes
              </h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={toggleSidebar}
              >
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>
            <Separator />
            <ScrollArea className="h-[calc(100%-49px)]">
              {!sidebarCollapsed && (
                <div className="p-2 space-y-1">
                  {allNotes.map((note) => (
                    <div
                      key={note.id}
                      className={cn(
                        "px-3 py-2 rounded-md cursor-pointer text-sm transition-colors duration-200",
                        "hover:bg-muted flex items-center gap-2",
                        note.id === currentNote.id ? "bg-muted text-foreground" : "text-muted-foreground"
                      )}
                      onClick={() => onSelectNote(note)}
                    >
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1 flex-grow">
                        {note.title || 'Untitled Note'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {sidebarCollapsed && (
                <div className="py-2">
                  {allNotes.map((note) => (
                    <div
                      key={note.id}
                      className={cn(
                        "flex items-center justify-center py-2 cursor-pointer transition-colors duration-200",
                        note.id === currentNote.id ? "text-foreground" : "text-muted-foreground"
                      )}
                      onClick={() => onSelectNote(note)}
                      title={note.title || 'Untitled Note'}
                    >
                      <FileText className="h-4 w-4" />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          
          {/* Main note content */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <DialogHeader className="p-6 pb-3 flex flex-row justify-between items-start">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-muted/80 transition-colors"
                  onClick={handleClose}
                  title="Back to dashboard"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back to dashboard</span>
                </Button>
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    {currentNote.title || 'Untitled Note'}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Last updated: {formattedDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => onEdit(currentNote)}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => onSummarize(currentNote)}
                >
                  <Sparkles className="h-4 w-4" />
                  Summarize
                </Button>
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
            </DialogHeader>
            <Separator />
            <div 
              ref={contentRef}
              className="flex-1 p-6 overflow-auto bg-gradient-to-br from-background to-background/95"
            >
              {currentNote.content ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {currentNote.content.split('\n').map((paragraph, i) => (
                    paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">No content</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 