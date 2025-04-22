'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Note } from '@/types'
import { format } from 'date-fns'
import { X, Pencil, Sparkles, ChevronLeft, ChevronRight, FileText, ArrowLeft, Menu, Save, Loader2, AlertTriangle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { NotePayload } from '@/lib/notes-api'

interface NotesLayoutProps {
  isActive: boolean
  currentNote: Note | null
  allNotes: Note[]
  onClose: () => void
  onEdit: (note: Note) => void
  onSummarize: (note: Note) => void
  onSelectNote: (note: Note) => void
  onSaveNote: (id: string, data: NotePayload) => void
  isSaving: boolean
  isSummarizing: boolean
  summary: string | null
  isCreatingNewNote?: boolean
}

export function NotesLayout({
  isActive,
  currentNote,
  allNotes,
  onClose,
  onSummarize,
  onSelectNote,
  onSaveNote,
  isSaving,
  isSummarizing,
  summary,
  isCreatingNewNote = false
}: NotesLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarHidden, setSidebarHidden] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSummaryVisible, setIsSummaryVisible] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('')
  
  const contentRef = useRef<HTMLDivElement>(null)
  const editContentRef = useRef<HTMLTextAreaElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)

  const resetEditState = useCallback(() => {
    if (currentNote) {
      setEditTitle(currentNote.title || '');
      setEditContent(currentNote.content || '');
      setIsEditMode(false);
      setHasUnsavedChanges(false);
    }
  }, [currentNote]);

  const handleSaveClick = useCallback(() => {
    if (currentNote) {
      onSaveNote(currentNote.id, {
        title: editTitle,
        content: editContent
      });
      setHasUnsavedChanges(false);
      setIsEditMode(false);
    }
  }, [currentNote, editTitle, editContent, onSaveNote]);

  const handleCancelEdit = useCallback(() => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        resetEditState();
      }
    } else {
      resetEditState();
    }
  }, [hasUnsavedChanges, resetEditState]);

  // Check screen size on mount and window resize
  useEffect(() => {
    const checkScreenSize = () => {
      const smallScreen = window.innerWidth < 768;
      setIsSmallScreen(smallScreen);
      
      // Auto-collapse sidebar on small screens
      if (smallScreen) {
        // On mobile, don't fully collapse but make it narrow
        setSidebarCollapsed(window.innerWidth < 480);
        
        // Hide sidebar on extra small screens initially
        if (window.innerWidth < 480) {
          setSidebarHidden(true);
        }
      } else {
        setSidebarHidden(false);
      }
    }
    
    // Initial check
    checkScreenSize();
    
    // Listen for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Reset edit mode and summary view when note changes
  useEffect(() => {
    if (currentNote) {
      // Auto-enter edit mode for new notes
      if (isCreatingNewNote) {
        setIsEditMode(true);
      } else {
        setIsEditMode(false);
      }
      
      setIsSummaryVisible(false);
      setEditTitle(currentNote.title || '');
      setEditContent(currentNote.content || '');
      setHasUnsavedChanges(false);
    }
    
    // Reset scroll position when the note changes
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [currentNote, isCreatingNewNote]);

  // Check for unsaved changes
  useEffect(() => {
    if (isEditMode) {
      const titleChanged = editTitle !== (currentNote?.title || '');
      const contentChanged = editContent !== (currentNote?.content || '');
      setHasUnsavedChanges(titleChanged || contentChanged);
    }
  }, [editTitle, editContent, currentNote, isEditMode]);

  // Confirm before closing with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Escape key
      if (e.key === 'Escape') {
        if (isEditMode) {
          handleCancelEdit();
        } else if (isSummaryVisible) {
          setIsSummaryVisible(false);
        } else if (isActive) {
          onClose();
        }
      }
      
      // Handle Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && isEditMode) {
        e.preventDefault();
        handleSaveClick();
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onClose, isEditMode, isSummaryVisible, currentNote, hasUnsavedChanges, handleCancelEdit, handleSaveClick]);

  // Filter notes for sidebar
  const filteredSidebarNotes = useMemo(() => {
    if (!sidebarSearchQuery.trim()) return allNotes;
    
    const query = sidebarSearchQuery.toLowerCase();
    return allNotes.filter(note => 
      (note.title?.toLowerCase().includes(query) || 
       note.content?.toLowerCase().includes(query))
    );
  }, [allNotes, sidebarSearchQuery]);

  if (!currentNote || !isActive) return null;

  const toggleSidebar = () => {
    if (isSmallScreen) {
      setSidebarHidden(!sidebarHidden);
      // When showing sidebar on mobile, always show expanded view
      if (sidebarHidden) {
        setSidebarCollapsed(false);
      }
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  }

  const handleEditClick = () => {
    setIsEditMode(true);
    setIsSummaryVisible(false); // Close summary if open
    
    // Focus the textarea after state update
    setTimeout(() => {
      if (editContentRef.current) {
        editContentRef.current.focus();
      }
    }, 0);
  }

  const handleSummarizeClick = () => {
    setIsSummaryVisible(true);
    if (!summary) {
      onSummarize(currentNote);
    }
  }

  const formattedDate = format(new Date(currentNote.updated_at), 'MMM d, yyyy h:mm a');

  const handleCloseWithCheck = () => {
    if (isEditMode && hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave without saving?')) {
        onClose();
      }
    } else {
      onClose();
    }
  }

  // Handle creating a new note from sidebar
  const handleCreateNewNote = () => {
    // Create an empty note template and pass to parent component
    const newNoteTemplate: Note = {
      id: 'new',
      title: '',
      content: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: currentNote?.user_id || ''
    };
    
    onSelectNote(newNoteTemplate);
  }

  return (
    <div className={cn(
      "fixed inset-0 bg-background z-30 flex flex-col transition-all duration-300",
      isActive ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      {/* Main content area with sidebar and note */}
      <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden mt-[64px]">
        {/* Sidebar with note list */}
        <div 
          className={cn(
            "h-full border-r border-border bg-muted/30 transition-all duration-300 relative z-10",
            sidebarCollapsed ? "w-16" : "w-64 md:w-72 lg:w-80",
            sidebarHidden ? "-translate-x-full absolute" : "translate-x-0",
            isSmallScreen && !sidebarHidden ? "absolute shadow-xl w-[85%] max-w-[300px]" : ""
          )}
        >
          <div className="p-3 flex items-center justify-between relative">
            <h3 className={cn("font-medium text-sm transition-opacity duration-200", 
              sidebarCollapsed ? "opacity-0" : "opacity-100"
            )}>
              Notes
            </h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </Button>
          </div>
          <Separator />
          <ScrollArea className="h-[calc(100%-48px)]">
            {!sidebarCollapsed ? (
              <div className="p-2 space-y-1">
                {/* Search input */}
                <div className="relative mb-3 px-1">
                  <Input
                    type="text"
                    placeholder="Search notes..."
                    value={sidebarSearchQuery}
                    onChange={(e) => setSidebarSearchQuery(e.target.value)}
                    className="bg-background/50 border-muted text-sm"
                  />
                  {sidebarSearchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5"
                      onClick={() => setSidebarSearchQuery('')}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Clear search</span>
                    </Button>
                  )}
                </div>
                
                {/* Create new note button */}
                <div
                  className="px-3 py-2 rounded-md cursor-pointer text-sm transition-colors duration-200
                    bg-primary/10 hover:bg-primary/20 text-primary font-medium flex items-center gap-2 mb-3"
                  onClick={handleCreateNewNote}
                >
                  <Plus className="h-4 w-4 flex-shrink-0" />
                  <span className="line-clamp-1 flex-grow">
                    New Note
                  </span>
                </div>

                {/* Note list items */}
                {filteredSidebarNotes.map((note) => (
                  <div
                    key={note.id}
                    className={cn(
                      "px-3 py-2 rounded-md cursor-pointer text-sm transition-colors duration-200",
                      "hover:bg-muted flex items-center gap-2",
                      note.id === currentNote?.id ? "bg-muted text-foreground" : "text-muted-foreground"
                    )}
                    onClick={() => {
                      onSelectNote(note);
                      if (isSmallScreen) {
                        setSidebarHidden(true);
                      }
                    }}
                  >
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="line-clamp-1 flex-grow">
                      {note.title || 'Untitled Note'}
                    </span>
                  </div>
                ))}
                
                {/* Show empty state if no notes found after search */}
                {allNotes.length > 0 && filteredSidebarNotes.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground text-xs">
                    No notes found matching &quot;{sidebarSearchQuery}&quot;
                  </div>
                )}
              </div>
            ) : (
              <div className="py-2 px-0.5 overflow-hidden">
                {/* Add new note button in collapsed mode */}
                <div
                  className="flex flex-col items-center px-1 py-2 cursor-pointer transition-colors duration-200 text-center mb-3 rounded bg-primary/10 hover:bg-primary/20 text-primary"
                  onClick={handleCreateNewNote}
                  title="New Note"
                >
                  <Plus className="h-4 w-4 mb-1" />
                  <span className="text-[8px] md:text-[9px] font-medium">
                    New
                  </span>
                </div>
                
                {/* Collapsed note list */}
                {filteredSidebarNotes.map((note) => (
                  <div
                    key={note.id}
                    className={cn(
                      "flex flex-col items-center px-1 py-2 cursor-pointer transition-colors duration-200 text-center mb-1 rounded hover:bg-muted",
                      note.id === currentNote?.id ? "bg-muted/70 text-foreground" : "text-muted-foreground"
                    )}
                    onClick={() => onSelectNote(note)}
                    title={note.title || 'Untitled Note'}
                  >
                    <FileText className="h-4 w-4 mb-1" />
                    <span className="text-[8px] md:text-[9px] font-medium line-clamp-1 w-full">
                      {(note.title || 'Untitled').substring(0, 10)}
                      {(note.title || 'Untitled').length > 10 ? '...' : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* Overlay for mobile when sidebar is open */}
        {isSmallScreen && !sidebarHidden && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-0"
            onClick={() => setSidebarHidden(true)}
          />
        )}
        
        {/* Main note content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="p-4 md:p-6 pb-2 md:pb-3 flex flex-row justify-between items-start border-b">
            <div className="flex items-center gap-2">
              {isSmallScreen && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 mr-1 rounded-full shadow-sm border border-border/40 flex items-center justify-center bg-background/80 hover:bg-muted/80"
                  onClick={toggleSidebar}
                  aria-label="Toggle Notes List"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Notes List</span>
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-muted/80 transition-colors"
                onClick={handleCloseWithCheck}
                title="Back to dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to dashboard</span>
              </Button>
              <div className={isEditMode ? "w-full" : ""}>
                {isEditMode ? (
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Note title"
                    className="text-lg md:text-xl font-semibold mb-1"
                    autoFocus
                  />
                ) : (
                  <>
                    <h2 className="text-xl md:text-2xl font-bold line-clamp-1">
                      {isCreatingNewNote ? 'New Note' : (currentNote?.title || 'Untitled Note')}
                    </h2>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {isCreatingNewNote ? 'Not saved yet' : `Last updated: ${formattedDate}`}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditMode ? (
                // Edit mode buttons
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="sm:flex items-center gap-2"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden md:inline">Cancel</span>
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className={cn(
                      "sm:flex items-center gap-2",
                      hasUnsavedChanges ? "animate-pulse-subtle" : ""
                    )}
                    onClick={handleSaveClick}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    <span>Save</span>
                  </Button>
                </>
              ) : (
                // View mode buttons
                <>
                  <Button 
                    variant={isEditMode ? "default" : "outline"}
                    size="sm" 
                    className="hidden sm:flex items-center gap-2"
                    onClick={handleEditClick}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="hidden md:inline">Edit</span>
                  </Button>
                  <Button 
                    variant={isSummaryVisible ? "default" : "outline"}
                    size="sm" 
                    className="hidden sm:flex items-center gap-2"
                    onClick={handleSummarizeClick}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden md:inline">Summarize</span>
                  </Button>
                  {/* Mobile buttons */}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="sm:hidden"
                    onClick={handleEditClick}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="sm:hidden"
                    onClick={handleSummarizeClick}
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={handleCloseWithCheck}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Note content and summary split view */}
          <div className={cn(
            "flex flex-1 w-full h-full split-view-container",
            isSummaryVisible ? "flex-col md:flex-row" : ""
          )}>
            {/* Note Content Area */}
            <div 
              ref={contentRef}
              className={cn(
                "flex-1 overflow-hidden split-view-content",
                isEditMode ? "flex flex-col" : "",
                isSummaryVisible ? "h-1/2 md:h-full" : "h-full"
              )}
            >
              {isEditMode ? (
                <Textarea 
                  ref={editContentRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Write your note content here..."
                  className="flex-1 p-4 md:p-6 resize-none rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 edit-textarea"
                  autoComplete="off"
                  spellCheck="true"
                />
              ) : (
                <div className="flex-1 p-4 md:p-6 overflow-auto bg-gradient-to-br from-background to-background/95 touch-action-manipulation">
                  {currentNote.content ? (
                    <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
                      {currentNote.content.split('\n').map((paragraph, i) => (
                        paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No content</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Summary Area */}
            {isSummaryVisible && (
              <>
                <Separator className="md:hidden shrink-0" />
                <div 
                  ref={summaryRef}
                  className="split-view-summary bg-muted/20 border-t md:border-t-0 md:border-l border-border flex flex-col"
                >
                  <div className="px-4 py-3 border-b flex justify-between items-center bg-muted/30">
                    <h3 className="font-semibold text-sm">Summary</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setIsSummaryVisible(false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex-1 p-4 overflow-auto">
                    {isSummarizing ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                        <p className="text-sm text-muted-foreground">Generating summary...</p>
                      </div>
                    ) : summary ? (
                      summary.startsWith('Error:') ? (
                        <div className="flex flex-col items-center justify-center text-center h-full">
                          <AlertTriangle className="h-8 w-8 text-yellow-500 mb-2" />
                          <h3 className="font-medium">Error</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {summary.replace('Error: ', '')}
                          </p>
                        </div>
                      ) : (
                        <div className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert">
                          {summary}
                        </div>
                      )
                    ) : (
                      <p className="text-muted-foreground italic text-center">No summary available</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile floating action buttons */}
      <div className={cn(
        "fixed bottom-6 right-6 flex flex-col gap-3 items-center sm:hidden",
        (sidebarHidden && !isEditMode) ? "opacity-100" : "opacity-0 pointer-events-none",
        isSummaryVisible ? "bottom-32" : "bottom-6"
      )}>
        {!isEditMode && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="w-12 h-12 rounded-full shadow-lg"
              onClick={handleEditClick}
            >
              <Pencil className="h-5 w-5" />
              <span className="sr-only">Edit Note</span>
            </Button>
            <Button
              variant={isSummaryVisible ? "default" : "secondary"}
              size="icon"
              className="w-12 h-12 rounded-full shadow-lg"
              onClick={handleSummarizeClick}
            >
              <Sparkles className="h-5 w-5" />
              <span className="sr-only">Summarize Note</span>
            </Button>
          </>
        )}
      </div>
    </div>
  )
} 