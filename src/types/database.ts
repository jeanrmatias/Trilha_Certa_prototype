export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  state: string;
  city: string;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  question_text: string;
  options: QuizOption[];
  order_index: number;
  allow_open_answer: boolean;
  created_at: string;
}

export interface QuizOption {
  text: string;
  scores: {
    exact_sciences?: number;
    humanities?: number;
    biological?: number;
    technology?: number;
    arts_creative?: number;
  };
}

export interface QuizResponse {
  id: string;
  user_id: string;
  question_id: string;
  selected_option_index: number;
  open_answer: string | null;
  created_at: string;
}

export interface SkillProfile {
  id: string;
  user_id: string;
  exact_sciences: number;
  humanities: number;
  biological: number;
  technology: number;
  arts_creative: number;
  completed_at: string;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  area: string;
  image_url: string;
  content: LearningResource[];
  duration_hours: number;
  difficulty: 'iniciante' | 'intermediario' | 'avancado';
  is_free: boolean;
  provider: string;
  created_at: string;
}

export interface LearningResource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'book' | 'interactive' | 'exercise';
  description: string;
}

export interface SavedPath {
  id: string;
  user_id: string;
  path_id: string;
  created_at: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string;
  location: string;
  state: string;
  work_type: 'presencial' | 'remoto' | 'hibrido';
  job_type: 'estagio' | 'jovem_aprendiz' | 'clt';
  area: string;
  salary_range: string;
  application_url: string;
  deadline: string;
  created_at: string;
}

export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  created_at: string;
}

export type AreaKey = 'exact_sciences' | 'humanities' | 'biological' | 'technology' | 'arts_creative';

export const AREA_LABELS: Record<AreaKey, string> = {
  exact_sciences: 'Exatas',
  humanities: 'Humanas',
  biological: 'Biologicas',
  technology: 'Tecnologia',
  arts_creative: 'Artes e Criatividade'
};

export const AREA_COLORS: Record<AreaKey, string> = {
  exact_sciences: 'bg-blue-500',
  humanities: 'bg-orange-500',
  biological: 'bg-green-500',
  technology: 'bg-cyan-500',
  arts_creative: 'bg-pink-500'
};
