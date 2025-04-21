import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotes, createNote, updateNote, deleteNote, NotePayload } from '@/lib/notes-api';
import { Note } from '@/types';
import { toast } from 'sonner';

const NOTES_QUERY_KEY = 'notes';

export const useNotes = () => {
  const queryClient = useQueryClient();

  // Query to fetch all notes
  const { data: notes = [], isLoading: isLoadingNotes, error: fetchError } = useQuery<Note[], Error>({
    queryKey: [NOTES_QUERY_KEY],
    queryFn: fetchNotes,
  });

  // Mutation to create a note
  const { mutate: addNote, isPending: isCreatingNote } = useMutation<Note, Error, NotePayload>({
    mutationFn: createNote,
    onSuccess: (newNote) => {
      toast.success('Note created!');
      // Invalidate and refetch the notes list to show the new note
      // Or, for optimistic updates:
      queryClient.setQueryData<Note[]>([NOTES_QUERY_KEY], (oldNotes = []) => [newNote, ...oldNotes]);
      // Optionally invalidate if optimistic update might miss something:
      // queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] });
    },
    onError: (error) => {
      console.error("Error creating note:", error);
      toast.error(`Failed to create note: ${error.message || 'Unknown error'}`);
      // Optionally invalidate to ensure UI consistency
      queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] });
    },
  });

  // Mutation to update a note
  const { mutate: editNote, isPending: isUpdatingNote } = useMutation<Note, Error, Pick<Note, 'id'> & Partial<NotePayload>>({
    mutationFn: updateNote,
    onSuccess: (updatedNote) => {
        toast.success('Note updated!');
      // Optimistically update the note in the cache
      queryClient.setQueryData<Note[]>([NOTES_QUERY_KEY], (oldNotes = []) =>
        oldNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
      );
      // Optionally invalidate if needed
      // queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] });
    },
     onError: (error) => {
        console.error("Error updating note:", error);
      toast.error(`Failed to update note: ${error.message}`);
      // Optionally invalidate to roll back optimistic update
       queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] });
    },
  });

  // Mutation to delete a note
  const { mutate: removeNote, isPending: isDeletingNote } = useMutation<{ id: string }, Error, string>({
    mutationFn: deleteNote,
    onSuccess: (data) => {
       toast.success('Note deleted!');
      // Remove the deleted note from the cache
      queryClient.setQueryData<Note[]>([NOTES_QUERY_KEY], (oldNotes = []) =>
        oldNotes.filter((note) => note.id !== data.id)
      );
      // Optionally invalidate if needed
      // queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] });
    },
     onError: (error) => {
         console.error("Error deleting note:", error);
       toast.error(`Failed to delete note: ${error.message}`);
        // Optionally invalidate to ensure UI consistency
       queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] });
    },
  });

  return {
    notes,
    isLoadingNotes,
    fetchError,
    addNote,
    isCreatingNote,
    editNote,
    isUpdatingNote,
    removeNote,
    isDeletingNote,
  };
}; 