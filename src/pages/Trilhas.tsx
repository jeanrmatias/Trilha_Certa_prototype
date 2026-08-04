import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { LearningPath } from '../types/database';
import { Clock, Star, Filter, Search, ChevronDown } from 'lucide-react';

export function Trilhas() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [filteredPaths, setFilteredPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [savedPathIds, setSavedPathIds] = useState<string[]>([]);

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
        const { data: pathsData } = await supabase
          .from('learning_paths')
          .select('*')
          .order('created_at', { ascending: false });

        setPaths(pathsData || []);
        setFilteredPaths(pathsData || []);

        const { data: savedData } = await supabase
          .from('saved_paths')
          .select('path_id')
          .eq('user_id', user.id);

        setSavedPathIds(savedData?.map(s => s.path_id) || []);
      } catch {
        // Error handled silently — no sensitive data logged.
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    let filtered = paths;

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (areaFilter !== 'all') {
      filtered = filtered.filter((p) => p.area === areaFilter);
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter((p) => p.difficulty === difficultyFilter);
    }

    setFilteredPaths(filtered);
  }, [search, areaFilter, difficultyFilter, paths]);

  const areaLabels: Record<string, string> = {
    exatas: 'Exatas',
    humanas: 'Humanas',
    biologicas: 'Biologicas',
    tecnologia: 'Tecnologia',
    artes: 'Artes',
  };

  const difficultyLabels: Record<string, string> = {
    iniciante: 'Iniciante',
    intermediario: 'Intermediario',
    avancado: 'Avancado',
  };

  const areaColors: Record<string, string> = {
    exatas: 'text-blue-600 bg-blue-50',
    humanas: 'text-orange-600 bg-orange-50',
    biologicas: 'text-green-600 bg-green-50',
    tecnologia: 'text-cyan-600 bg-cyan-50',
    artes: 'text-pink-600 bg-pink-50',
  };

  const handleSavePath = async (pathId: string) => {
    if (savedPathIds.includes(pathId)) {
      const { error } = await supabase
        .from('saved_paths')
        .delete()
        .eq('user_id', user.id)
        .eq('path_id', pathId);

      if (error) {
        showToast('Nao foi possivel remover. Tente novamente.', 'error');
        return;
      }
      setSavedPathIds(prev => prev.filter(id => id !== pathId));
      showToast('Trilha removida do seu perfil.', 'info');
    } else {
      const { error } = await supabase
        .from('saved_paths')
        .insert({ user_id: user.id, path_id: pathId });

      if (error) {
        showToast('Nao foi possivel salvar. Tente novamente.', 'error');
        return;
      }
      setSavedPathIds(prev => [...prev, pathId]);
      showToast('Trilha salva no seu perfil!', 'success');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Trilhas de Aprendizado</h1>
        <p className="text-gray-500 mt-1">Cursos e conteudos gratuitos para sua jornada</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar trilhas..."
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
              <label className="block text-sm text-gray-600 mb-1">Dificuldade</label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="all">Todos os niveis</option>
                {Object.entries(difficultyLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="h-40 skeleton"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 skeleton rounded w-3/4"></div>
                <div className="h-3 skeleton rounded w-full"></div>
                <div className="h-3 skeleton rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredPaths.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPaths.map((path) => (
            <div
              key={path.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <Link to={`/trilhas/${path.id}`}>
                <div className="h-40 overflow-hidden bg-gray-100">
                  {path.image_url ? (
                    <img
                      src={path.image_url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Star className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${areaColors[path.area] || 'bg-gray-100 text-gray-600'}`}>
                    {areaLabels[path.area] || path.area}
                  </span>
                  {path.is_free && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                      Gratis
                    </span>
                  )}
                </div>

                <Link to={`/trilhas/${path.id}`}>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {path.name}
                  </h3>
                </Link>

                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{path.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {path.duration_hours}h
                  </div>
                  <span className="capitalize">{difficultyLabels[path.difficulty]}</span>
                </div>

                <button
                  onClick={() => handleSavePath(path.id)}
                  className={`mt-3 w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                    savedPathIds.includes(path.id)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {savedPathIds.includes(path.id) ? 'Salva' : 'Salvar Trilha'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma trilha encontrada com os filtros selecionados.</p>
        </div>
      )}
    </div>
  );
}
