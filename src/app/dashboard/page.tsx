'use client'

import { useState } from 'react'
import { Note } from '@/types'
import { NotePayload } from '@/lib/notes-api'
import { useNotes } from '@/hooks/useNotes'
import { useUser } from '@/hooks/useUser'
import { useSummarizeNote } from '@/hooks/useSummarize'
import { NoteCard } from '@/components/notes/NoteCard'
import { NotesLayout } from '@/components/notes/NotesLayout'
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
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { user, logout } = useUser()
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
  const { summarizeNote } = useSummarizeNote()

  // State management
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)
  const [viewingNote, setViewingNote] = useState<Note | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isCreatingNewNote, setIsCreatingNewNote] = useState(false)
  
  // Summary state
  const [summaryResult, setSummaryResult] = useState<{ 
    noteTitle: string | null, 
    content: string | null, 
    isLoading: boolean 
  } | null>(null)

  // Handlers
  const handleCreateClick = () => {
    // Create an empty note template
    const newNoteTemplate: Note = {
      id: 'new',
      title: '',
      content: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: user?.id || ''
    };
    
    setViewingNote(newNoteTemplate);
    setIsCreatingNewNote(true);
  }

  const handleEditClick = (note: Note) => {
    setViewingNote(note);
  }

  const handleViewClick = (note: Note) => {
    setIsTransitioning(true);
    // Small delay to allow for smooth transition
    setTimeout(() => {
      setViewingNote(note);
      setIsTransitioning(false);
    }, 50);
  }
  
  const handleCloseViewNote = () => {
    setIsTransitioning(true);
    setIsCreatingNewNote(false);
    setTimeout(() => {
      setViewingNote(null);
      setIsTransitioning(false);
    }, 250);
  }

  const handleDeleteClick = (id: string) => {
    setDeletingNoteId(id);
  }

  const handleConfirmDelete = () => {
    if (deletingNoteId) {
      // If we're deleting the currently viewed note, close it
      if (viewingNote && viewingNote.id === deletingNoteId) {
        setViewingNote(null);
      }
      
      removeNote(deletingNoteId, {
        onSuccess: () => setDeletingNoteId(null)
      });
    }
  }

  const handleSaveNote = (id: string, data: NotePayload) => {
    if (isCreatingNewNote) {
      // Creating a new note
      addNote(data, {
        onSuccess: (newNote) => {
          setIsCreatingNewNote(false);
          // Update the viewing note with the newly created note
          setViewingNote(newNote);
        }
      });
    } else {
      // Updating an existing note
      editNote({ id, ...data });
    }
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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-background via-background to-background/90 stacking-context">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="border-b px-4 py-3 flex justify-between items-center backdrop-blur-sm bg-background/90 fixed top-0 left-0 right-0 h-[64px] z-50 shadow-sm app-header">
        <h1 className="text-xl font-bold">Smart Notes</h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCreateClick}
            variant="default"
            className="shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Note</span>
            <span className="sm:hidden">New</span>
          </Button>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[60]">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className={cn(
        "py-8 px-4 flex-1 container transition-opacity duration-200 mt-[64px] app-main",
        viewingNote ? "lg:opacity-0 lg:pointer-events-none" : "opacity-100",
        isTransitioning ? "opacity-50" : ""
      )}>
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
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in"
            style={{
              animationDuration: '0.5s',
              animationFillMode: 'both',
            }}
          >
            {notes.map((note, index) => (
              <div
                key={note.id}
                className="opacity-0 animate-fade-in"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  animationDuration: '0.5s',
                  animationFillMode: 'forwards',
                }}
              >
                <NoteCard
                  note={note}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onSummarize={(note) => {
                    setViewingNote(note);
                    
                    // Set initial state to show loading
                    setSummaryResult({
                      noteTitle: note.title || 'Untitled Note',
                      content: null,
                      isLoading: true
                    });
                    
                    // Call the API
                    summarizeNote({ noteId: note.id }, {
                      onSuccess: (data) => {
                        setSummaryResult(prev => ({
                          ...prev!,
                          content: data.summary,
                          isLoading: false
                        }));
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
                        }));
                      }
                    });
                  }}
                  onView={handleViewClick}
                />
              </div>
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
            <Button 
              onClick={handleCreateClick} 
              className="shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Note
            </Button>
          </div>
        )}
      </main>

      {/* Mobile Floating Action Button */}
      <Button
        onClick={handleCreateClick}
        className={cn(
          "fixed bottom-6 right-6 rounded-full shadow-lg w-14 h-14 p-0 md:hidden z-20",
          "animate-pulse-subtle bg-primary hover:bg-primary/90 transition-all",
          viewingNote ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">New Note</span>
      </Button>

      {/* Delete confirmation dialog - keep this one as it's still useful */}
      <DeleteConfirmationDialog
        isOpen={!!deletingNoteId}
        onClose={() => setDeletingNoteId(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingNote}
      />
      
      {/* Full screen layout for viewing, editing and summarizing notes */}
      {(notes.length > 0 || isCreatingNewNote) && (
        <NotesLayout
          isActive={!!viewingNote}
          currentNote={viewingNote}
          allNotes={notes}
          onClose={handleCloseViewNote}
          onEdit={handleEditClick}
          onSummarize={(note) => {
            // Set initial state to show loading
            setSummaryResult({
              noteTitle: note.title || 'Untitled Note',
              content: null,
              isLoading: true
            });
            
            // Call the API
            summarizeNote({ noteId: note.id }, {
              onSuccess: (data) => {
                setSummaryResult(prev => ({
                  ...prev!,
                  content: data.summary,
                  isLoading: false
                }));
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
                }));
              }
            });
          }}
          onSelectNote={setViewingNote}
          onSaveNote={handleSaveNote}
          isSaving={isCreatingNote || isUpdatingNote}
          isSummarizing={summaryResult?.isLoading || false}
          summary={summaryResult?.content || null}
          isCreatingNewNote={isCreatingNewNote}
        />
      )}
    </div>
  )
} 