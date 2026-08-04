import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { Job } from '../types/database';
import { Briefcase, MapPin, Clock, Heart, Filter, Search, ChevronDown } from 'lucide-react';

const BRAZILIAN_STATES: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia',
  CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
  MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais',
  PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul',
  RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo',
  SE: 'Sergipe', TO: 'Tocantins',
};

export function Vagas() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [workTypeFilter, setWorkTypeFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

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
      try {
        const { data: jobsData } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false });

        setJobs(jobsData || []);
        setFilteredJobs(jobsData || []);

        const { data: savedData } = await supabase
          .from('saved_jobs')
          .select('job_id')
          .eq('user_id', user.id);

        setSavedJobIds(savedData?.map(s => s.job_id) || []);
      } catch {
        // Error handled silently — no sensitive data logged.
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    let filtered = jobs;

    if (search) {
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(search.toLowerCase()) ||
          j.company.toLowerCase().includes(search.toLowerCase()) ||
          j.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (areaFilter !== 'all') {
      filtered = filtered.filter((j) => j.area === areaFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((j) => j.job_type === typeFilter);
    }

    if (workTypeFilter !== 'all') {
      filtered = filtered.filter((j) => j.work_type === workTypeFilter);
    }

    if (stateFilter !== 'all') {
      if (stateFilter === 'remote') {
        filtered = filtered.filter((j) => j.work_type === 'remoto' || (j.state || '') === '');
      } else {
        filtered = filtered.filter((j) => (j.state || '') === stateFilter);
      }
    }

    setFilteredJobs(filtered);
  }, [search, areaFilter, typeFilter, workTypeFilter, stateFilter, jobs]);

  const areaLabels: Record<string, string> = {
    exatas: 'Exatas',
    humanas: 'Humanas',
    biologicas: 'Biologicas',
    tecnologia: 'Tecnologia',
    artes: 'Artes',
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

  const handleSaveJob = async (jobId: string) => {
    if (savedJobIds.includes(jobId)) {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', user.id)
        .eq('job_id', jobId);

      if (error) {
        showToast('Nao foi possivel remover. Tente novamente.', 'error');
        return;
      }
      setSavedJobIds(prev => prev.filter(id => id !== jobId));
      showToast('Vaga removida dos favoritos.', 'info');
    } else {
      const { error } = await supabase
        .from('saved_jobs')
        .insert({ user_id: user.id, job_id: jobId });

      if (error) {
        showToast('Nao foi possivel salvar. Tente novamente.', 'error');
        return;
      }
      setSavedJobIds(prev => [...prev, jobId]);
      showToast('Vaga salva nos favoritos!', 'success');
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getDaysUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vagas e Oportunidades</h1>
        <p className="text-gray-500 mt-1">Estagio, jovem aprendiz e primeiro emprego</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar vagas..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
              showFilters ? 'bg-gray-50 border-gray-300' : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-gray-600 mb-1">Area</label>
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="all">Todas as areas</option>
                {Object.entries(areaLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-gray-600 mb-1">Tipo</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="all">Todos os tipos</option>
                {Object.entries(typeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-gray-600 mb-1">Modalidade</label>
              <select
                value={workTypeFilter}
                onChange={(e) => setWorkTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="all">Todas as modalidades</option>
                {Object.entries(workTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-gray-600 mb-1">Estado</label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="all">Todos os estados</option>
                <option value="remote">Remoto / Nacional</option>
                {Object.entries(BRAZILIAN_STATES).map(([uf, name]) => (
                  <option key={uf} value={uf}>{name} ({uf})</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="animate-pulse space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const daysLeft = getDaysUntilDeadline(job.deadline);
            const isUrgent = daysLeft !== null && daysLeft <= 7;
            const isExpired = daysLeft !== null && daysLeft < 0;

            return (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                        {typeLabels[job.job_type] || job.job_type}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                        {workTypeLabels[job.work_type] || job.work_type}
                      </span>
                      {isUrgent && !isExpired && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                          Urgente
                        </span>
                      )}
                      {isExpired && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-300 text-gray-600">
                          Encerrada
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/vagas/${job.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {job.title}
                    </Link>
                    <p className="text-sm text-gray-500">{job.company}</p>
                  </div>

                  <button
                    onClick={() => handleSaveJob(job.id)}
                    className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                      savedJobIds.includes(job.id)
                        ? 'bg-red-50 text-red-500 hover:bg-red-100'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    aria-label={savedJobIds.includes(job.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  >
                    <Heart className={`w-5 h-5 ${savedJobIds.includes(job.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{job.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  {job.salary_range && (
                    <span className="font-medium text-blue-600">{job.salary_range}</span>
                  )}
                  {job.deadline && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(job.deadline)}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-3">
                  <Link
                    to={`/vagas/${job.id}`}
                    className="flex-1 text-center py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Ver Detalhes
                  </Link>
                  {!isExpired && job.application_url && (
                    <a
                      href={job.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Candidatar-se
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma vaga encontrada com os filtros selecionados.</p>
        </div>
      )}
    </div>
  );
}
