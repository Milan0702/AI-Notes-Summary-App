'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Note } from '@/types'
import { NotePayload } from '@/lib/notes-api'
import { useNotes } from '@/hooks/useNotes'
import { useUser } from '@/hooks/useUser'
import { useSummarizeNote } from '@/hooks/useSummarize'
import { NoteCard } from '@/components/notes/NoteCard'
import { NoteDialog } from '@/components/notes/NoteDialog'
import { SummaryDialog } from '@/components/notes/SummaryDialog'
import { DeleteConfirmationDialog } from '@/components/notes/DeleteConfirmationDialog'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, User, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading: isLoadingUser, logout } = useUser()
  const {
    notes,
    isLoadingNotes,
    fetchError,
    addNote,
    isCreatingNote,
    editNote,
    isUpdatingNote,
    removeNote,
    isDeletingNote
  } = useNotes()
  const { summarizeNote, isSummarizing } = useSummarizeNote()

  // State for dialogs
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)
  
  // Summary state
  const [summaryResult, setSummaryResult] = useState<{ 
    noteTitle: string | null, 
    content: string | null, 
    isLoading: boolean 
  } | null>(null)

  // Handlers
  const handleCreateClick = () => {
    setEditingNote(null)
    setIsDialogOpen(true)
  }

  const handleEditClick = (note: Note) => {
    setEditingNote(note)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setDeletingNoteId(id)
  }

  const handleNoteSubmit = (noteData: NotePayload) => {
    if (editingNote) {
      editNote({ id: editingNote.id, ...noteData }, {
        onSuccess: () => setIsDialogOpen(false)
      })
    } else {
      addNote(noteData, {
        onSuccess: () => setIsDialogOpen(false)
      })
    }
  }

  const handleConfirmDelete = () => {
    if (deletingNoteId) {
      removeNote(deletingNoteId, {
        onSuccess: () => setDeletingNoteId(null)
      })
    }
  }

  const handleSummarizeClick = (note: Note) => {
    // Set initial state to show loading
    setSummaryResult({
      noteTitle: note.title || 'Untitled Note',
      content: null,
      isLoading: true
    })
    
    // Call the API
    summarizeNote({ noteId: note.id }, {
      onSuccess: (data) => {
        setSummaryResult(prev => ({
          ...prev!,
          content: data.summary,
          isLoading: false
        }))
      },
      onError: (err) => {
        let errorMessage = err.message;
        
        // Handle API limit errors specifically
        if (errorMessage.includes('API usage limit') || 
            errorMessage.includes('quota exceeded') || 
            errorMessage.includes('payment required')) {
          errorMessage = 'API usage limit reached. The summarization feature is temporarily unavailable.';
        }
        
        setSummaryResult(prev => ({
          ...prev!,
          content: `Error: ${errorMessage}`,
          isLoading: false
        }))
      }
    })
  }

  // Skeleton loader component for notes
  const NoteCardSkeleton = () => (
    <div className="h-full flex flex-col space-y-2 border rounded-lg p-4 shadow-sm">
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-28 w-full flex-1" />
      <div className="flex justify-end space-x-1 pt-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  )

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 max-w-7xl">
      <header className="sticky top-0 z-10 bg-background pb-4 pt-2 border-b">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Notes</h1>
            <p className="text-muted-foreground mt-1">
              Organize and manage your thoughts and ideas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleCreateClick} size="sm" className="shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Button>
              
            <ThemeToggle />
              
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="shadow-sm">
                  <User className="h-4 w-4" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                {user && (
                  <DropdownMenuLabel className="font-normal text-xs truncate max-w-[200px]">
                    {user.email}
                  </DropdownMenuLabel>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="py-4">
        {isLoadingNotes ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <NoteCardSkeleton key={i} />
            ))}
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-destructive mb-4">Error loading notes: {fetchError.message}</p>
            <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
          </div>
        ) : notes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onSummarize={handleSummarizeClick}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 mb-4 bg-muted rounded-full flex items-center justify-center">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xl text-muted-foreground mb-4 text-center">
              No notes yet. Create your first one!
            </p>
            <Button onClick={handleCreateClick} className="shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Note
            </Button>
          </div>
        )}
      </main>

      {/* Dialog for creating/editing notes */}
      <NoteDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        noteToEdit={editingNote}
        onSubmit={handleNoteSubmit}
        isSaving={isCreatingNote || isUpdatingNote}
      />

      {/* Dialog for confirming note deletion */}
      <DeleteConfirmationDialog
        isOpen={!!deletingNoteId}
        onClose={() => setDeletingNoteId(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingNote}
      />
      
      {/* Dialog for displaying note summaries */}
      <SummaryDialog
        isOpen={!!summaryResult}
        onClose={() => setSummaryResult(null)}
        noteTitle={summaryResult?.noteTitle || null}
        summary={summaryResult?.content || null}
        isLoading={summaryResult?.isLoading || false}
      />
    </div>
  )
} 