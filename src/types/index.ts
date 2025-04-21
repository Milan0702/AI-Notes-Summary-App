export type Note = {
  id: string; // UUID from Supabase
  user_id: string; // UUID reference to auth.users
  title: string | null;
  content: string | null;
  created_at: string; // ISO timestamp string
  updated_at: string; // ISO timestamp string
}; 