/*
  # Initial Schema Setup for Notes Management System

  1. Tables
    - users (managed by Supabase Auth)
    - notes
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - title (text)
      - content (text)
      - is_archived (boolean)
      - created_at (timestamp)
      - updated_at (timestamp)
    - tags
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - name (text)
      - created_at (timestamp)
    - note_tags
      - note_id (uuid, foreign key)
      - tag_id (uuid, foreign key)
      - Primary key (note_id, tag_id)

  2. Security
    - Enable RLS on all tables
    - Add policies for user-based access control
*/

-- Notes table
CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text,
  is_archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tags table
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Note Tags junction table
CREATE TABLE note_tags (
  note_id uuid REFERENCES notes(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;

-- Notes policies
CREATE POLICY "Users can manage their own notes"
  ON notes
  USING (auth.uid() = user_id);

-- Tags policies
CREATE POLICY "Users can manage their own tags"
  ON tags
  USING (auth.uid() = user_id);

-- Note tags policies
CREATE POLICY "Users can manage their own note tags"
  ON note_tags
  USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = note_id
      AND notes.user_id = auth.uid()
    )
  );

-- Indexes for better performance
CREATE INDEX notes_user_id_idx ON notes(user_id);
CREATE INDEX notes_is_archived_idx ON notes(is_archived);
CREATE INDEX tags_user_id_idx ON tags(user_id);
CREATE INDEX note_tags_note_id_idx ON note_tags(note_id);
CREATE INDEX note_tags_tag_id_idx ON note_tags(tag_id);