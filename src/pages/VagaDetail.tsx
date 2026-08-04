import { useEffect, useState } from 'react';
import { Navigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { Job } from '../types/database';
import { ArrowLeft, MapPin, Building2, Clock, Heart, ExternalLink, AlertCircle } from 'lucide-react';

export function VagaDetail() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [togglingSave, setTogglingSave] = useState(false);

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
      if (!id) return;

      try {
        const { data: jobData } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        setJob(jobData);

        if (jobData) {
          const { data: savedData } = await supabase
            .from('saved_jobs')
            .select('id')
            .eq('user_id', user.id)
            .eq('job_id', id)
            .maybeSingle();

          setIsSaved(!!savedData);
        }
      } catch {
        // Error handled silently — no sensitive data logged.
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleToggleSave = async () => {
    if (!job || togglingSave) return;

    setTogglingSave(true);

    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', job.id);
        if (error) throw error;
        setIsSaved(false);
        showToast('Vaga removida dos favoritos.', 'info');
      } else {
        const { error } = await supabase
          .from('saved_jobs')
          .insert({ user_id: user.id, job_id: job.id });
        if (error) throw error;
        setIsSaved(true);
        showToast('Vaga salva nos favoritos!', 'success');
      }
    } catch {
      showToast('Nao foi possivel salvar. Tente novamente.', 'error');
    } finally {
      setTogglingSave(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const typeLabels: Record<string, string> = {
    estagio: 'Estagio',
    jovem_aprendiz: 'Jovem Aprendiz',
    clt: 'CLT',
  };

  const workTypeLabels: Record<string, string> = {
    presencial: 'Presencial',
    remoto: 'Remoto',
    hibrido: 'Hibrido',
  };

  const areaLabels: Record<string, string> = {
    exatas: 'Exatas',
    humanas: 'Humanas',
    biologicas: 'Biologicas',
    tecnologia: 'Tecnologia',
    artes: 'Artes',
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <p className="text-gray-500">Vaga nao encontrada.</p>
          <Link
            to="/vagas"
            className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para vagas
          </Link>
        </div>
      </div>
    );
  }

  const daysLeft = getDaysUntilDeadline(job.deadline);
  const isUrgent = daysLeft !== null && daysLeft <= 7;
  const isExpired = daysLeft !== null && daysLeft < 0;

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/vagas"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700">
              {typeLabels[job.job_type] || job.job_type}
            </span>
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-600">
              {workTypeLabels[job.work_type] || job.work_type}
            </span>
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-amber-100 text-amber-700">
              {areaLabels[job.area] || job.area}
            </span>
            {isUrgent && !isExpired && (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-700">
                Urgente - {daysLeft} dias restantes
              </span>
            )}
            {isExpired && (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-300 text-gray-600">
                Prazo encerrado
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>

          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <Building2 className="w-5 h-5" />
            {job.company}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}
            </div>
            {job.salary_range && (
              <span className="font-semibold text-blue-600">{job.salary_range}</span>
            )}
            {job.deadline && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>
                  {isExpired ? 'Encerrada em' : 'Encerra em'} {formatDate(job.deadline)}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {!isExpired && job.application_url && (
              <a
                href={job.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Candidatar-se
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={handleToggleSave}
              disabled={togglingSave}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                isSaved
                  ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              {togglingSave ? 'Salvando...' : isSaved ? 'Remover' : 'Favoritar'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Descricao da Vaga</h2>
        <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line">
          {job.description}
        </div>
      </div>

      {job.requirements && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Requisitos</h2>
          <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line">
            {job.requirements}
          </div>
        </div>
      )}

      {isExpired && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-amber-800 text-sm">
            O prazo para candidatura desta vaga ja foi encerrado.
          </p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <Link
          to="/vagas"
          className="flex-1 text-center py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Ver Outras Vagas
        </Link>
        <Link
          to="/trilhas"
          className="flex-1 text-center py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Ver Trilhas de Aprendizado
        </Link>
      </div>
    </div>
  );
}
