-- Supabase Setup SQL

-- Create the songs table
CREATE TABLE IF NOT EXISTS songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  cover_url TEXT,
  audio_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access (so everyone can see and play songs)
CREATE POLICY "Allow public read access" ON songs
  FOR SELECT USING (true);

-- Allow anonymous insert, update, delete for the admin side 
-- (Note: For a simple beginner project without authentication, we allow public access. 
-- In a real production app, you should secure these with Supabase Auth!)
CREATE POLICY "Allow public insert access" ON songs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON songs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON songs FOR DELETE USING (true);
