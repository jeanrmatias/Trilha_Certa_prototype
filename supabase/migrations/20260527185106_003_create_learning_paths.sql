/*
  # Create Learning Paths Tables

  1. New Tables
    - `learning_paths`: Learning resources (trilhas)
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `area` (text: 'exatas','humanas','biologicas','tecnologia','artes')
      - `image_url` (text)
      - `content` (jsonb, array of resources)
      - `duration_hours` (integer)
      - `difficulty` (text)
      - `is_free` (boolean)
      - `provider` (text)
      - `created_at` (timestamp)
    
    - `saved_paths`: User's saved learning paths
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `path_id` (uuid, references learning_paths)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Learning paths are publicly readable
    - Users can only manage their own saved paths

  3. Important Notes
    - Content stored as JSON array with {title, url, type, description}
*/

CREATE TABLE IF NOT EXISTS learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  area text NOT NULL,
  image_url text DEFAULT '',
  content jsonb DEFAULT '[]'::jsonb,
  duration_hours integer DEFAULT 0,
  difficulty text DEFAULT 'iniciante',
  is_free boolean DEFAULT true,
  provider text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  path_id uuid NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, path_id)
);

ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view learning paths"
  ON learning_paths FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own saved paths"
  ON saved_paths FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved paths"
  ON saved_paths FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved paths"
  ON saved_paths FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);