import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Profile, SkillProfile, LearningPath, Job } from '../types/database';
import { User, Mail, Edit2, Trash2, Heart, Star, TrendingUp, Briefcase, LogOut } from 'lucide-react';

export function ProfilePage() {
  const { user, profile, loading: authLoading, signOut, updateProfile } = useAuth();
  const [skillProfile, setSkillProfile] = useState<SkillProfile | null>(null);
  const [savedPaths, setSavedPaths] = useState<(LearningPath & { saved_id: string })[]>([]);
  const [savedJobs, setSavedJobs] = useState<(Job & { saved_id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'paths' | 'jobs'>('paths');

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    setEditName(profile.name);
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    try {
      const { data: skillData } = await supabase
        .from('skill_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setSkillProfile(skillData);

      const { data: savedPathsData } = await supabase
        .from('saved_paths')
        .select('id, path_id, learning_paths(*)')
        .eq('user_id', user.id);

      if (savedPathsData) {
        const paths = savedPathsData
          .filter((item): item is { id: string; path_id: string; learning_paths: LearningPath } => item.learning_paths !== null)
          .map((item) => ({
            ...item.learning_paths,
            saved_id: item.id,
          }));
        setSavedPaths(paths);
      }

      const { data: savedJobsData } = await supabase
        .from('saved_jobs')
        .select('id, job_id, jobs(*)')
        .eq('user_id', user.id);

      if (savedJobsData) {
        const jobs = savedJobsData
          .filter((item): item is { id: string; job_id: string; jobs: Job } => item.jobs !== null)
          .map((item) => ({
            ...item.jobs,
            saved_id: item.id,
          }));
        setSavedJobs(jobs);
      }
    } catch {
      // Error handled silently — no sensitive data logged.
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (editName.trim() === '') return;

    setSaving(true);
    const { error } = await updateProfile({ name: editName.trim() });
    if (!error) {
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handleRemovePath = async (savedId: string) => {
    const { error } = await supabase
      .from('saved_paths')
      .delete()
      .eq('id', savedId);

    if (!error) {
      setSavedPaths(prev => prev.filter(p => p.saved_id !== savedId));
    }
  };

  const handleRemoveJob = async (savedId: string) => {
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('id', savedId);

    if (!error) {
      setSavedJobs(prev => prev.filter(j => j.saved_id !== savedId));
    }
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

  const formatDate = (date: string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const typeLabels: Record<string, string> = {
    estagio: 'Estagio',
    jovem_aprendiz: 'Jovem Aprendiz',
    clt: 'CLT',
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-white">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Seu nome"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={saving}
                      className="px-3 py-1.5 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                    >
                      {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditName(profile.name);
                      }}
                      className="px-3 py-1.5 text-white/80 hover:text-white"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <h1 className="text-xl font-bold">{profile.name}</h1>
                )}
                <p className="text-blue-100 flex items-center gap-1 mt-1">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </p>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Editar perfil"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{savedPaths.length}</p>
              <p className="text-sm text-gray-500">Trilhas Salvas</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{savedJobs.length}</p>
              <p className="text-sm text-gray-500">Vagas Favoritas</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {skillProfile ? getTopArea()?.label : '-'}
              </p>
              <p className="text-sm text-gray-500">Area Principal</p>
            </div>
          </div>
        </div>
      </div>

      {skillProfile && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Perfil de Habilidades
            </h2>
            {skillProfile.completed_at && (
              <span className="text-sm text-gray-500">
                Atualizado em {formatDate(skillProfile.completed_at)}
              </span>
            )}
          </div>

          <div className="space-y-3">
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

          <Link
            to="/resultado"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver detalhes completos
          </Link>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('paths')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'paths'
                ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Star className="w-4 h-4" />
              Trilhas Salvas ({savedPaths.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'jobs'
                ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Heart className="w-4 h-4" />
              Vagas Favoritas ({savedJobs.length})
            </span>
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center text-gray-400 py-8">Carregando...</div>
          ) : activeTab === 'paths' ? (
            savedPaths.length > 0 ? (
              <div className="space-y-4">
                {savedPaths.map((path) => (
                  <div
                    key={path.saved_id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      {path.image_url ? (
                        <img src={path.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Star className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/trilhas/${path.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {path.name}
                      </Link>
                      <p className="text-sm text-gray-500">{path.duration_hours} horas</p>
                    </div>
                    <button
                      onClick={() => handleRemovePath(path.saved_id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Remover trilha"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">Nenhuma trilha salva ainda.</p>
                <Link
                  to="/trilhas"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Explorar Trilhas
                </Link>
              </div>
            )
          ) : savedJobs.length > 0 ? (
            <div className="space-y-4">
              {savedJobs.map((job) => (
                <div
                  key={job.saved_id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="w-14 h-14 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/vagas/${job.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {job.title}
                    </Link>
                    <p className="text-sm text-gray-500">{job.company}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveJob(job.saved_id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Remover vaga"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Nenhuma vaga favoritada ainda.</p>
              <Link
                to="/vagas"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Ver Vagas
              </Link>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={signOut}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sair da Conta
      </button>
    </div>
  );
}
