import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Profile, SkillProfile, LearningPath, Job } from '../types/database';
import { Compass, ClipboardList, TrendingUp, Briefcase, ChevronRight, Star, Clock, MapPin } from 'lucide-react';

export function Home() {
  const { user, profile, loading: authLoading } = useAuth();
  const [skillProfile, setSkillProfile] = useState<SkillProfile | null>(null);
  const [recommendedPaths, setRecommendedPaths] = useState<LearningPath[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const { data: skillData } = await supabase
          .from('skill_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        setSkillProfile(skillData);

        const { data: paths } = await supabase
          .from('learning_paths')
          .select('*')
          .limit(3);

        setRecommendedPaths(paths || []);

        const { data: jobs } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        setRecentJobs(jobs || []);
      } catch {
        // Error handled silently — no sensitive data logged.
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getTopArea = () => {
    if (!skillProfile) return null;
    const areas = [
      { key: 'exact_sciences', value: skillProfile.exact_sciences, label: 'Exatas' },
      { key: 'humanities', value: skillProfile.humanities, label: 'Humanas' },
      { key: 'biological', value: skillProfile.biological, label: 'Biologicas' },
      { key: 'technology', value: skillProfile.technology, label: 'Tecnologia' },
      { key: 'arts_creative', value: skillProfile.arts_creative, label: 'Artes' },
    ];
    return areas.sort((a, b) => b.value - a.value)[0];
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Ola, {profile?.name || 'Estudante'}!</h1>
            <p className="text-blue-100 mt-1">Continue sua jornada de aprendizado</p>
          </div>
          <div className="hidden sm:block">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to={skillProfile ? '/resultado' : '/mapeamento'}
          className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-gray-900">Mapeamento de Habilidades</h3>
          <p className="text-sm text-gray-500 mt-1">
            {skillProfile ? 'Ver seu perfil' : 'Descubra suas habilidades'}
          </p>
        </Link>

        <Link
          to="/trilhas"
          className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-gray-900">Trilhas de Aprendizado</h3>
          <p className="text-sm text-gray-500 mt-1">Cursos e conteudos para voce</p>
        </Link>

        <Link
          to="/vagas"
          className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-amber-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-gray-900">Vagas e Oportunidades</h3>
          <p className="text-sm text-gray-500 mt-1">Estagio, jovem aprendiz e mais</p>
        </Link>
      </div>

      {skillProfile && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Seu Perfil de Habilidades</h2>
            <Link
              to="/resultado"
              className="text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              Ver detalhes
            </Link>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Area Principal</p>
              <p className="text-xl font-bold text-gray-900">{getTopArea()?.label}</p>
            </div>
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">{getTopArea()?.value}%</span>
            </div>
          </div>

          <div className="space-y-2">
            {['exact_sciences', 'humanities', 'biological', 'technology', 'arts_creative'].map((area) => {
              const value = skillProfile[area as keyof SkillProfile] as number;
              const labels: Record<string, string> = {
                exact_sciences: 'Exatas',
                humanities: 'Humanas',
                biological: 'Biologicas',
                technology: 'Tecnologia',
                arts_creative: 'Artes',
              };
              const colors: Record<string, string> = {
                exact_sciences: 'bg-blue-500',
                humanities: 'bg-orange-500',
                biological: 'bg-green-500',
                technology: 'bg-cyan-500',
                arts_creative: 'bg-pink-500',
              };
              return (
                <div key={area} className="flex items-center gap-3">
                  <span className="w-20 text-sm text-gray-600">{labels[area]}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[area]} transition-all duration-500`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className="w-10 text-sm font-medium text-gray-900">{value}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Trilhas Recomendadas</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Carregando...</div>
            ) : recommendedPaths.length > 0 ? (
              recommendedPaths.map((path) => (
                <Link
                  key={path.id}
                  to={`/trilhas/${path.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {path.image_url ? (
                      <img src={path.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Compass className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{path.name}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {path.duration_hours}h
                    </p>
                  </div>
                  {path.is_free && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Gratis
                    </span>
                  )}
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">Nenhuma trilha disponivel</div>
            )}
          </div>
          <Link
            to="/trilhas"
            className="block p-4 text-center text-blue-600 font-medium hover:bg-blue-50 transition-colors border-t border-gray-100"
          >
            Ver todas as trilhas
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Vagas Recentes</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Carregando...</div>
            ) : recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/vagas/${job.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{job.title}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full capitalize">
                    {job.job_type === 'jovem_aprendiz' ? 'Jovem Aprendiz' : job.job_type}
                  </span>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">Nenhuma vaga disponivel</div>
            )}
          </div>
          <Link
            to="/vagas"
            className="block p-4 text-center text-blue-600 font-medium hover:bg-blue-50 transition-colors border-t border-gray-100"
          >
            Ver todas as vagas
          </Link>
        </div>
      </div>
    </div>
  );
}
