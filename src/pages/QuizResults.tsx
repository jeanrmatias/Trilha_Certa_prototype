import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { SkillProfile, LearningPath, Job, AreaKey, AREA_LABELS } from '../types/database';
import { Brain, ArrowRight, RefreshCw, TrendingUp, Briefcase, MapPin, Clock, Heart, Building2, MapPinned, ChevronDown } from 'lucide-react';

const AREA_TO_JOB_AREA: Record<AreaKey, string> = {
  exact_sciences: 'exatas',
  humanities: 'humanas',
  biological: 'biologicas',
  technology: 'tecnologia',
  arts_creative: 'artes',
};

const WORK_TYPE_LABELS: Record<string, string> = {
  presencial: 'Presencial',
  remoto: 'Remoto',
  hibrido: 'Hibrido',
};

const JOB_TYPE_LABELS: Record<string, string> = {
  estagio: 'Estagio',
  jovem_aprendiz: 'Jovem Aprendiz',
  clt: 'CLT',
};

const STATE_NAMES: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia',
  CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
  MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais',
  PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul',
  RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo',
  SE: 'Sergipe', TO: 'Tocantins',
};

export function QuizResults() {
  const { user, loading: authLoading } = useAuth();
  const [skillProfile, setSkillProfile] = useState<SkillProfile | null>(null);
  const [recommendedPaths, setRecommendedPaths] = useState<LearningPath[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [userState, setUserState] = useState<string>('');
  const [userCity, setUserCity] = useState<string>('');
  const [showOtherStates, setShowOtherStates] = useState(false);
  const [otherStateJobs, setOtherStateJobs] = useState<Job[]>([]);
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

        const { data: profileData } = await supabase
          .from('profiles')
          .select('state, city')
          .eq('id', user.id)
          .maybeSingle();

        const state = profileData?.state || '';
        const city = profileData?.city || '';
        setUserState(state);
        setUserCity(city);

        if (skillData) {
          const sortedAreas = getSortedAreas(skillData);
          const topAreaKey = sortedAreas[0].key as AreaKey;
          const secondAreaKey = sortedAreas[1].key as AreaKey;

          const topJobArea = AREA_TO_JOB_AREA[topAreaKey];
          const secondJobArea = AREA_TO_JOB_AREA[secondAreaKey];

          const { data: paths } = await supabase
            .from('learning_paths')
            .select('*')
            .eq('area', topJobArea)
            .limit(3);

          setRecommendedPaths(paths || []);

          // Fetch jobs matching user's top areas
          const { data: topJobs } = await supabase
            .from('jobs')
            .select('*')
            .eq('area', topJobArea)
            .limit(10);

          const { data: secondJobs } = await supabase
            .from('jobs')
            .select('*')
            .eq('area', secondJobArea)
            .limit(5);

          const allJobs = [...(topJobs || []), ...(secondJobs || [])];
          const uniqueJobs = allJobs.filter((job, index, self) =>
            index === self.findIndex((j) => j.id === job.id)
          );

          // Filter by user's state: show jobs from their state + remote jobs
          if (state) {
            const inState = uniqueJobs.filter(
              (j) => (j.state || '') === state || j.work_type === 'remoto'
            );
            setRecommendedJobs(inState.slice(0, 4));
          } else {
            setRecommendedJobs(uniqueJobs.slice(0, 4));
          }
        }
      } catch {
        // Error handled silently — no sensitive data logged.
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getSortedAreas = (profile: SkillProfile) => {
    const areas = [
      { key: 'exact_sciences', value: profile.exact_sciences, label: 'Exatas', color: 'bg-blue-500' },
      { key: 'humanities', value: profile.humanities, label: 'Humanas', color: 'bg-orange-500' },
      { key: 'biological', value: profile.biological, label: 'Biologicas', color: 'bg-green-500' },
      { key: 'technology', value: profile.technology, label: 'Tecnologia', color: 'bg-cyan-500' },
      { key: 'arts_creative', value: profile.arts_creative, label: 'Artes', color: 'bg-pink-500' },
    ];
    return areas.sort((a, b) => b.value - a.value);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!skillProfile) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Comece seu Mapeamento</h2>
          <p className="text-gray-500 mb-6">
            Responda algumas perguntas para descobrir suas habilidades e receber recomendacoes personalizadas.
          </p>
          <Link
            to="/mapeamento"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Iniciar Mapeamento
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const sortedAreas = getSortedAreas(skillProfile);
  const topAreaLabel = sortedAreas[0].label;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Seu Perfil de Habilidades</h1>
            <p className="text-blue-100">Veja suas areas de destaque</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Resultado por Area</h2>

        <div className="space-y-4">
          {sortedAreas.map((area, index) => (
            <div key={area.key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {index === 0 && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                      Principal
                    </span>
                  )}
                  <span className="text-sm font-medium text-gray-700">{area.label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{area.value}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${area.color} transition-all duration-500 rounded-full`}
                  style={{ width: `${area.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trilhas Recomendadas</h2>

        {recommendedPaths.length > 0 ? (
          <div className="space-y-4">
            {recommendedPaths.map((path) => (
              <Link
                key={path.id}
                to={`/trilhas/${path.id}`}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  {path.image_url ? (
                    <img src={path.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{path.name}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">{path.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Nenhuma trilha recomendada ainda.</p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Vagas para sua area
          </h2>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
            {topAreaLabel}
          </span>
        </div>

        {userState && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <MapPinned className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800">
              Mostrando vagas em <strong>{STATE_NAMES[userState] || userState}</strong>
              {userCity && ` (${userCity})`} e oportunidades remotas.
            </p>
          </div>
        )}

        {recommendedJobs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendedJobs.map((job) => (
              <Link
                key={job.id}
                to={`/vagas/${job.id}`}
                className="group p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {job.title}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {job.company}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-600">
                    <MapPin className="w-3 h-3" />
                    {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-600">
                    <Clock className="w-3 h-3" />
                    {WORK_TYPE_LABELS[job.work_type] || job.work_type}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-600">
                    {JOB_TYPE_LABELS[job.job_type] || job.job_type}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{job.salary_range}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium group-hover:gap-2 transition-all">
                    Ver vaga
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Nenhuma vaga disponivel para sua area ainda.</p>
        )}

        {userState && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={async () => {
                if (!showOtherStates && otherStateJobs.length === 0) {
                  const sortedAreas = getSortedAreas(skillProfile!);
                  const topAreaKey = sortedAreas[0].key as AreaKey;
                  const secondAreaKey = sortedAreas[1].key as AreaKey;
                  const topJobArea = AREA_TO_JOB_AREA[topAreaKey];
                  const secondJobArea = AREA_TO_JOB_AREA[secondAreaKey];

                  const { data: topJobs } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('area', topJobArea)
                    .limit(10);

                  const { data: secondJobs } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('area', secondJobArea)
                    .limit(5);

                  const allJobs = [...(topJobs || []), ...(secondJobs || [])];
                  const uniqueJobs = allJobs.filter((job, index, self) =>
                    index === self.findIndex((j) => j.id === job.id)
                  );
                  const otherJobs = uniqueJobs.filter(
                    (j) => (j.state || '') !== userState && j.work_type !== 'remoto'
                  );
                  setOtherStateJobs(otherJobs.slice(0, 4));
                }
                setShowOtherStates(!showOtherStates);
              }}
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showOtherStates ? 'Ocultar vagas de outros estados' : 'Ver vagas de outros estados'}
              <ChevronDown className={`w-4 h-4 transition-transform ${showOtherStates ? 'rotate-180' : ''}`} />
            </button>

            {showOtherStates && otherStateJobs.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {otherStateJobs.map((job) => (
                  <Link
                    key={job.id}
                    to={`/vagas/${job.id}`}
                    className="group p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {job.title}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {job.company}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-600">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        {WORK_TYPE_LABELS[job.work_type] || job.work_type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{job.salary_range}</span>
                      <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium group-hover:gap-2 transition-all">
                        Ver vaga
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {showOtherStates && otherStateJobs.length === 0 && (
              <p className="mt-4 text-sm text-gray-500">Nenhuma vaga de outro estado disponivel para sua area.</p>
            )}
          </div>
        )}

        {recommendedJobs.length > 0 && (
          <Link
            to="/vagas"
            className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver todas as vagas
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/trilhas"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Ver Todas as Trilhas
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/mapeamento"
          className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refazer Mapeamento
        </Link>
      </div>
    </div>
  );
}
