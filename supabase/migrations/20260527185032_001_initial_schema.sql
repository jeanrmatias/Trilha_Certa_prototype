/*
  # Trilha Certa - Initial Database Schema

  1. New Tables
    - `profiles`: User profile information
      - `id` (uuid, primary key, references auth.users)
      - `name` (text, user's name)
      - `email` (text, user's email)
      - `avatar_url` (text, optional profile picture)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `quiz_questions`: Quiz questions for skill mapping
      - `id` (uuid, primary key)
      - `question_text` (text)
      - `options` (jsonb, array of options with scores per area)
      - `order` (integer, question order)
    
    - `quiz_responses`: User's quiz answers
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `question_id` (uuid, references quiz_questions)
      - `selected_option` (integer)
      - `created_at` (timestamp)
    
    - `skills_profiles`: User's skill assessment results
      - `id` (uuid, primary key)
      - `user_id` (uuid, unique, references profiles)
      - `exact_sciences` (integer, score for Math/Physics area)
      - `humanities` (integer, score for Languages/Social Sciences)
      - `biological` (integer, score for Biology/Health)
      - `technology` (integer, score for Tech/Engineering)
      - `arts_creative` (integer, score for Arts/Creative fields)
      - `completed_at` (timestamp)
    
    - `learning_paths`: Learning paths (trilhas)
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `area` (text, category: 'exatas', 'humanas', 'biologicas', 'tecnologia', 'artes')
      - `image_url` (text, cover image)
      - `content` (jsonb, array of learning resources)
      - `duration_hours` (integer, estimated completion time)
      - `difficulty` (text, 'iniciante', 'intermediario', 'avancado')
      - `is_free` (boolean, whether it's free)
      - `provider` (text, course provider)
      - `created_at` (timestamp)
    
    - `jobs`: Job opportunities (vagas)
      - `id` (uuid, primary key)
      - `title` (text)
      - `company` (text)
      - `description` (text)
      - `requirements` (text)
      - `location` (text)
      - `work_type` (text, 'presencial', 'remoto', 'hibrido')
      - `job_type` (text, 'estagio', 'jovem_aprendiz', 'clt')
      - `area` (text, job category)
      - `salary_range` (text)
      - `application_url` (text, external link)
      - `deadline` (date, application deadline)
      - `created_at` (timestamp)
    
    - `saved_paths`: User's saved learning paths
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `path_id` (1. New Tables
    - `saved_paths`: User's saved learning paths
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `created_at` (table, referenced by learning_paths)
      - `priority` (integer for saved learning paths
      - `created_at` (timestamp)
      - `created_at` (timestamp) in learning_paths
      - `created_at` (timestamp)
      - `created_at` (timestamp)
      - `created_at` (timestamp)
      - `path_id` (uuid, references learning_paths)
      - `created_at` (timestamp)
      - `path_id` (uuid, references learning_paths)
      - `saved_paths`: User's saved learning paths
        - `id` (uuid, primary key)
        - `user_id` (uuid, references profiles)
        - `created_at` (timestamp)
        - `path_id` (uuid, reference learning paths)
      
    - `saved_jobs`: User's saved jobs
      - `id` (uuid, primary key, for saved jobs)
      - `user_id` (uuid, references profiles)
      - `jobs_id` (uuid, reference jobs)
      - `created_at` (timestamp for saved jobs)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Public read access for quiz_questions, learning_paths, jobs (for browsing)

  3. Important Notes
    - All timestamps use DEFAULT now() for automatic creation tracking
    - `saved_jobs` links users to favorited jobs
*/