/*
  # Create Quiz Tables

  1. New Tables
    - `quiz_questions`: Questions for skill mapping quiz
      - `id` (uuid, primary key)
      - `question_text` (text, the question)
      - `options` (jsonb, options with area scores)
      - `order_index` (integer, display order)
      - `created_at` (timestamp)
    
    - `quiz_responses`: User answers to quiz
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `question_id` (uuid, references quiz_questions)
      - `selected_option_index` (integer)
      - `created_at` (timestamp)
    
    - `skill_profiles`: Assessment results
      - `id` (uuid, primary key)
      - `user_id` (uuid, unique, references profiles)
      - `exact_sciences` (integer, 0-100 score)
      - `humanities` (integer, 0-100 score)
      - `biological` (integer, 0-100 score)
      - `technology` (integer, 0-100 score)
      - `arts_creative` (integer, 0-100 score)
      - `completed_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Quiz questions are publicly readable
    - Users can only access their own responses and skill profiles
*/

CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  options jsonb NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_option_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, question_id)
);

CREATE TABLE IF NOT EXISTS skill_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exact_sciences integer DEFAULT 0,
  humanities integer DEFAULT 0,
  biological integer DEFAULT 0,
  technology integer DEFAULT 0,
  arts_creative integer DEFAULT 0,
  completed_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quiz questions"
  ON quiz_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own responses"
  ON quiz_responses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own responses"
  ON quiz_responses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own responses"
  ON quiz_responses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own skill profile"
  ON skill_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skill profile"
  ON skill_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skill profile"
  ON skill_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);