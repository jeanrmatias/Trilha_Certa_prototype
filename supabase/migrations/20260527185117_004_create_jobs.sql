/*
  # Create Jobs Tables

  1. New Tables
    - `jobs`: Job opportunities (vagas)
      - `id` (uuid, primary key)
      - `title` (text)
      - `company` (text)
      - `description` (text)
      - `requirements` (text)
      - `location` (text)
      - `work_type` (text: 'presencial','remoto','hibrido')
      - `job_type` (text: 'estagio','jovem_aprendiz','clt')
      - `area` (text)
      - `salary_range` (text)
      - `application_url` (text)
      - `deadline` (date)
      - `created_at` (timestamp)
    
    - `saved_jobs`: User's favorited jobs
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `job_id` (uuid, references jobs)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Jobs are publicly readable
    - Users can only manage their own saved jobs
*/

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  description text NOT NULL,
  requirements text DEFAULT '',
  location text NOT NULL,
  work_type text DEFAULT 'presencial',
  job_type text DEFAULT 'estagio',
  area text NOT NULL,
  salary_range text DEFAULT '',
  application_url text DEFAULT '',
  deadline date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, job_id)
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own saved jobs"
  ON saved_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved jobs"
  ON saved_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved jobs"
  ON saved_jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);