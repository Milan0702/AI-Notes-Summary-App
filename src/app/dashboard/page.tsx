'use client'

import { useState, useEffect, Suspense, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Note } from '@/types'
import { NotePayload } from '@/lib/notes-api'
import { useNotes } from '@/hooks/useNotes'
import { useUser } from '@/hooks/useUser'
import { useSummarizeNote } from '@/hooks/useSummarize'
import { NoteCard } from '@/components/notes/NoteCard'
import { NewNoteCard } from '@/components/notes/NewNoteCard'
import { NotesLayout } from '@/components/notes/NotesLayout'
import { DeleteConfirmationDialog } from '@/components/notes/DeleteConfirmationDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppHeader } from '@/components/AppHeader'
import { NotesSearch } from '@/components/notes/NotesSearch'

// Dashboard content component that uses useSearchParams
function DashboardContent() {
  const { user, isLoading: isUserLoading } = useUser()
  const searchParams = useSearchParams()
  const router = useRouter()
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
  const [searchQuery, setSearchQuery] = useState('')
  
  // Summary state
  const [summaryResult, setSummaryResult] = useState<{ 
    noteTitle: string | null, 
    content: string | null, 
    isLoading: boolean 
  } | null>(null)

  // Filtered notes based on search query
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    
    const query = searchQuery.toLowerCase();
    return notes.filter(note => 
      // Only search in the title
      (note.title?.toLowerCase().includes(query))
    );
  }, [notes, searchQuery]);

  // Handle auth callback params
  useEffect(() => {
    // Check for auth callback parameters
    const isAuthCallback = searchParams.get('auth') === 'callback'
    const refresh = searchParams.get('refresh') === 'true'
    
    if (isAuthCallback || refresh) {
      console.log('Detected auth callback parameters, refreshing session...')
      
      // Clean up the URL by removing the parameters
      router.replace('/dashboard')
      
      // Force a refresh of the user session
      const refreshSession = async () => {
        try {
          const supabase = createClient()
          const { data } = await supabase.auth.getSession()
          console.log('Session refresh check:', !!data.session)
          
          // If no session is found after refresh param, redirect to login
          if (!data.session && refresh) {
            console.log('No session found after refresh attempt, redirecting to login')
            router.replace('/login')
          }
        } catch (err) {
          console.error('Error refreshing session:', err)
        }
      }
      
      refreshSession()
    }
  }, [searchParams, router])
  
  // Show loading state while session is being established
  if (isUserLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-pulse rounded-full h-20 w-20 border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-muted-foreground">Loading your notes...</p>
      </div>
    )
  }

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
    console.log('View note clicked:', note.id, 'Title:', note.title);
    
    // Set the viewing note directly to ensure it opens
    setViewingNote(note);
    
    // Also set transitioning for visual effect
    setIsTransitioning(true);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 100);
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
      <AppHeader showAuthButtons={false} />

      <main className={cn(
        "py-8 px-4 flex-1 container transition-opacity duration-200 mt-[64px] app-main",
        viewingNote ? "lg:opacity-0 lg:pointer-events-none" : "opacity-100",
        isTransitioning ? "opacity-50" : ""
      )}>
        {/* Search bar for notes */}
        <div className="mb-6">
          <NotesSearch onSearch={setSearchQuery} placeholder="Search your notes..." />
        </div>
        
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
        ) : (
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in"
            style={{
              animationDuration: '0.5s',
              animationFillMode: 'both',
            }}
          >
            {/* New Note Card - always first in grid */}
            <div 
              className="opacity-0 animate-fade-in" 
              style={{
                animationDelay: '0s',
                animationDuration: '0.5s',
                animationFillMode: 'forwards',
              }}
            >
              <NewNoteCard onClick={handleCreateClick} />
            </div>
            
            {/* Existing Notes */}
            {filteredNotes.map((note, index) => (
              <div
                key={note.id}
                className="opacity-0 animate-fade-in"
                style={{
                  animationDelay: `${(index + 1) * 0.05}s`,
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
            
            {/* Show empty state if no notes found after search */}
            {notes.length > 0 && filteredNotes.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 mb-4 bg-muted rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-xl text-muted-foreground mb-4 text-center">
                  No notes found matching &quot;{searchQuery}&quot;
                </p>
                <Button 
                  onClick={() => setSearchQuery('')} 
                  variant="outline"
                >
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete confirmation dialog - keep this one as it's still useful */}
      <DeleteConfirmationDialog
        isOpen={!!deletingNoteId}
        onClose={() => setDeletingNoteId(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingNote}
      />
      
      {/* Full screen layout for viewing, editing and summarizing notes */}
      {(notes.length > 0 || isCreatingNewNote) && (
        <>
          {console.log('Rendering NotesLayout with viewingNote:', !!viewingNote, viewingNote?.id)}
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
        </>
      )}
    </div>
  )
}

// Loading fallback
function DashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="animate-pulse rounded-full h-20 w-20 border-4 border-primary border-t-transparent"></div>
      <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
    </div>
  );
}

// Main Dashboard component with Suspense boundary
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
} 