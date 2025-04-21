import { createClient } from '@/lib/supabase/client'; // Use client component client
import { Note } from '@/types'; // Import the Note type

const supabase = createClient();

// Define a standard query string for notes
const NOTE_COLUMNS = 'id, user_id, title, content, created_at, updated_at';

// Type for Note data used in creation/update (omit id, user_id, timestamps)
export type NotePayload = Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// Fetch all notes for the current user
export const fetchNotes = async (): Promise<Note[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('notes')
    .select(NOTE_COLUMNS)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false }); // Show newest first

  if (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }
  return data || [];
};

// Create a new note
export const createNote = async (noteData: NotePayload): Promise<Note> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    try {
        // Explicitly include user_id to avoid relying only on RLS
        const { data, error } = await supabase
          .from('notes')
          .insert({
              user_id: user.id, // Explicitly set the user_id
              title: noteData.title || 'Untitled Note', // Default title
              content: noteData.content || ''
          })
          .select(NOTE_COLUMNS)
          .single(); // Expect a single row back

        if (error) {
          console.error('Error creating note:', error);
          throw error;
        }
        
        if (!data) {
            throw new Error("Failed to create note, no data returned.");
        }
        
        return data;
    } catch (error: unknown) {
        console.error('Error creating note:', error);
        // Ensure the error has a message property for the toast
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to create note. Please try again.');
    }
};

// Update an existing note
export const updateNote = async ({ id, ...noteData }: Pick<Note, 'id'> & Partial<NotePayload>): Promise<Note> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notes')
      .update({
        ...noteData,
        updated_at: new Date().toISOString(), // Manually update timestamp or let trigger handle it
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns the note
      .select(NOTE_COLUMNS)
      .single();

    if (error) {
      console.error('Error updating note:', error);
      throw error;
    }
     if (!data) {
        throw new Error("Failed to update note, no data returned.");
    }
    return data;
};

// Delete a note
export const deleteNote = async (id: string): Promise<{ id: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user owns the note

    if (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
    // Return the id so we know which note was deleted for cache updates
    return { id };
}; 