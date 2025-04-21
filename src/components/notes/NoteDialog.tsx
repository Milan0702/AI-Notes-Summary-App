'use client'

import { useEffect, useState } from 'react'
import { Note } from '@/types'
import { NotePayload } from '@/lib/notes-api'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface NoteDialogProps {
  isOpen: boolean
  onClose: () => void
  noteToEdit?: Note | null
  onSubmit: (noteData: NotePayload) => void
  isSaving: boolean
}

export function NoteDialog({ 
  isOpen, 
  onClose, 
  noteToEdit, 
  onSubmit, 
  isSaving 
}: NoteDialogProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  // Reset form when dialog opens/closes or noteToEdit changes
  useEffect(() => {
    if (isOpen) {
      // If editing an existing note, populate the form
      if (noteToEdit) {
        setTitle(noteToEdit.title || '')
        setContent(noteToEdit.content || '')
      } else {
        // If creating a new note, reset the form
        setTitle('')
        setContent('')
      }
    }
  }, [isOpen, noteToEdit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title: title.trim() || null,
      content: content.trim() || null
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {noteToEdit ? 'Edit Note' : 'Create Note'}
            </DialogTitle>
            <DialogDescription>
              {noteToEdit 
                ? 'Make changes to your note here.'
                : 'Enter the details of your new note below.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Note title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSaving}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Enter your note content here..."
                className="min-h-[200px] resize-y"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                noteToEdit ? 'Save Changes' : 'Create Note'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 