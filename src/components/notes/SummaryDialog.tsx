'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, AlertTriangle } from 'lucide-react'

interface SummaryDialogProps {
  isOpen: boolean
  onClose: () => void
  noteTitle: string | null
  summary: string | null
  isLoading: boolean
}

export function SummaryDialog({
  isOpen,
  onClose,
  noteTitle,
  summary,
  isLoading
}: SummaryDialogProps) {
  // Check if the summary contains an error message
  const isError = summary?.startsWith('Error:');
  const isApiLimitError = summary?.includes('API usage limit') || summary?.includes('quota exceeded');
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl line-clamp-1">
            {noteTitle ? `Summary: ${noteTitle}` : 'Summary'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 overflow-y-auto flex-grow">
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Generating summary...</span>
            </div>
          ) : isApiLimitError ? (
            <div className="flex flex-col items-center justify-center text-center p-4 space-y-3">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <h3 className="font-medium">AI Service Limit Reached</h3>
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              <p className="text-sm text-muted-foreground">
                We&apos;ve reached the usage limit for our AI service. Please try again later.
              </p>
            </div>
          ) : isError ? (
            <div className="text-sm whitespace-pre-wrap rounded-md bg-destructive/10 p-4 text-destructive">
              {summary?.replace('Error: ', '') || 'An error occurred while generating the summary.'}
            </div>
          ) : (
            <div className="text-sm whitespace-pre-wrap rounded-md bg-muted/50 p-4">
              {summary || 'No summary available'}
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 