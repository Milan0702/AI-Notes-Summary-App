# AI Notes App

A modern note-taking application featuring AI-powered summarization capabilities. Built with Next.js, Supabase, and integrating advanced AI models through OpenRouter.

## Description

AI Notes App is a full-featured notes application that allows users to create, manage, and enhance their notes with AI summarization. The app features a clean, responsive UI built with TailwindCSS and Shadcn UI components, with a robust backend powered by Supabase for authentication and data storage.

## Features

- **Authentication System**
  - Email/password authentication
  - Google OAuth integration
  - Protected routes with middleware
  - User profile management

- **Notes Management**
  - Create, read, update, and delete notes
  - Rich text content
  - Automatic timestamps
  - User-specific note collections

- **AI-Powered Summarization**
  - Generate concise summaries of note content
  - Uses OpenRouter API to access advanced language models
  - Optimized prompt engineering for better results
  - Error handling for API limits and other edge cases

## Tech Stack

- **Frontend**
  - [Next.js 15](https://nextjs.org/) - React framework with App Router
  - [TypeScript](https://www.typescriptlang.org/) - Type safety
  - [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS
  - [Shadcn UI](https://ui.shadcn.com/) - Component library
  - [React Query](https://tanstack.com/query/latest) - Data fetching and caching

- **Backend & Data**
  - [Supabase](https://supabase.com/) - Auth, PostgreSQL database, Row-Level Security
  - [OpenRouter API](https://openrouter.ai/) - AI model access (LLMs)

- **DevOps**
  - [ESLint](https://eslint.org/) - Code linting
  - [Prettier](https://prettier.io/) - Code formatting

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Supabase account
- OpenRouter API account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-notes-app.git
   cd ai-notes-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables by creating a `.env.local` file:
   ```
   # Supabase credentials
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # OpenRouter API
   OPENROUTER_API_KEY=your_openrouter_api_key
   OPENROUTER_API_MODEL=openai/gpt-3.5-turbo  # or your preferred model
   
   # Application info (optional)
   APP_NAME=AI Notes App
   ```

### Supabase Setup

1. Create a new Supabase project
2. Run the following SQL in the SQL editor to create your notes table:

```sql
-- Create notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX notes_user_id_idx ON notes(user_id);

-- Set up Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own notes
CREATE POLICY "Users can only access their own notes" 
ON notes FOR ALL 
USING (auth.uid() = user_id);

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notes_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

3. Set up authentication providers:
   - Enable Email/Password authentication
   - Configure Google OAuth provider with correct redirect URIs

### Running Locally

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

The application can be easily deployed on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure the same environment variables you used locally
3. Deploy the application

For Supabase, make sure to:
- Update your site URL in the Supabase dashboard to match your production URL
- Configure authentication redirect URLs for production

## License

[MIT](LICENSE) 