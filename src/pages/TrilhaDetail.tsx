import { useEffect, useState } from 'react';
import { Navigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { LearningPath, LearningResource } from '../types/database';
import { Clock, Star, ExternalLink, ArrowLeft, BookOpen, Video, FileText, PlayCircle, CheckCircle } from 'lucide-react';

export function TrilhaDetail() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [path, setPath] = useState<LearningPath | null>(null);
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
        const { data: pathData } = await supabase
          .from('learning_paths')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        setPath(pathData);

        if (pathData) {
          const { data: savedData } = await supabase
            .from('saved_paths')
            .select('id')
            .eq('user_id', user.id)
            .eq('path_id', id)
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
    if (!path || togglingSave) return;

    setTogglingSave(true);

    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_paths')
          .delete()
          .eq('user_id', user.id)
          .eq('path_id', path.id);
        if (error) throw error;
        setIsSaved(false);
        showToast('Trilha removida do seu perfil.', 'info');
      } else {
        const { error } = await supabase
          .from('saved_paths')
          .insert({ user_id: user.id, path_id: path.id });
        if (error) throw error;
        setIsSaved(true);
        showToast('Trilha salva no seu perfil!', 'success');
      }
    } catch {
      showToast('Nao foi possivel salvar. Tente novamente.', 'error');
    } finally {
      setTogglingSave(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'article':
        return FileText;
      case 'book':
        return BookOpen;
      case 'exercise':
        return CheckCircle;
      case 'interactive':
        default:
        return PlayCircle;
    }
  };

  const getResourceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      video: 'Video',
      article: 'Artigo',
      book: 'Livro',
      exercise: 'Exercicio',
      interactive: 'Interativo',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-200 rounded-xl"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <p className="text-gray-500">Trilha nao encontrada.</p>
          <Link
            to="/trilhas"
            className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para trilhas
          </Link>
        </div>
      </div>
    );
  }

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

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/trilhas"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="h-48 sm:h-64 overflow-hidden bg-gray-100">
          {path.image_url ? (
            <img
              src={path.image_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Star className="w-16 h-16 text-gray-300" />
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${areaColors[path.area] || 'bg-gray-100 text-gray-600'}`}>
              {areaLabels[path.area] || path.area}
            </span>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
              {difficultyLabels[path.difficulty]}
            </span>
            {path.is_free && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                Gratis
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{path.name}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            {path.provider && (
              <span>Por: {path.provider}</span>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {path.duration_hours} horas
            </div>
          </div>

          <p className="text-gray-600 mb-6">{path.description}</p>

          <button
            onClick={handleToggleSave}
            disabled={togglingSave}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium transition-colors ${
              isSaved
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
            }`}
          >
            {togglingSave ? 'Salvando...' : isSaved ? 'Salva no Perfil' : 'Salvar Trilha'}
          </button>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Conteudos da Trilha</h2>

        {path.content && path.content.length > 0 ? (
          <div className="space-y-4">
            {path.content.map((resource: LearningResource, index: number) => {
              const Icon = getResourceIcon(resource.type);
              return (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {resource.title}
                      </h3>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{resource.description}</p>
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                      {getResourceTypeLabel(resource.type)}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">Nenhum conteudo disponivel ainda.</p>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          to="/trilhas"
          className="flex-1 text-center py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Ver Outras Trilhas
        </Link>
        <Link
          to="/vagas"
          className="flex-1 text-center py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Ver Vagas Relacionadas
        </Link>
      </div>
    </div>
  );
}
