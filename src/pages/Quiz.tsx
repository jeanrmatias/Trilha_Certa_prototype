import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { QuizQuestion } from '../types/database';
import { ChevronRight, ChevronLeft, Circle, CheckCircle2, AlertCircle, MapPin, Building2 } from 'lucide-react';

interface Answer {
  selectedOption: number | null;
  openAnswer: string;
}

const BRAZILIAN_STATES = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
];

export function Quiz() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showLocationStep, setShowLocationStep] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [city, setCity] = useState('');

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
    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('quiz_questions')
          .select('*')
          .order('order_index', { ascending: true });

        if (error) throw error;
        setQuestions(data || []);
      } catch {
        // Error handled silently — no sensitive data logged.
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const isQuestionAnswered = (question: QuizQuestion) => {
    const answer = answers[question.id];
    if (!answer) return false;
    const hasOptions = question.options.some((o) => o.text !== '');
    if (!hasOptions) return answer.openAnswer.trim().length > 0;
    return answer.selectedOption !== null;
  };

  const handleSelectOption = (optionIndex: number) => {
    const currentQuestion = questions[currentIndex];
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        selectedOption: optionIndex,
        openAnswer: prev[currentQuestion.id]?.openAnswer ?? '',
      },
    }));
  };

  const handleOpenAnswerChange = (text: string) => {
    const currentQuestion = questions[currentIndex];
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        selectedOption: prev[currentQuestion.id]?.selectedOption ?? null,
        openAnswer: text,
      },
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (showLocationStep) {
      setShowLocationStep(false);
      return;
    }
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!selectedState || !city.trim()) {
      setSubmitError('Selecione seu estado e digite sua cidade.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        setSubmitError('Sessão expirada. Faça login novamente.');
        setSubmitting(false);
        return;
      }

      const payload = {
        answers: questions.map((q) => {
          const answer = answers[q.id];
          const hasOptions = q.options.some((o) => o.text !== '');
          return {
            question_id: q.id,
            selected_option_index: hasOptions ? (answer?.selectedOption ?? 0) : 0,
            open_answer: q.allow_open_answer ? (answer?.openAnswer ?? null) : null,
          };
        }),
        location: {
          state: selectedState,
          city: city.trim(),
        },
      };

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-quiz`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setSubmitError('Não foi possível salvar suas respostas. Tente novamente.');
        setSubmitting(false);
        return;
      }

      const result = await response.json();
      if (!result.success) {
        setSubmitError('Não foi possível salvar suas respostas. Tente novamente.');
        setSubmitting(false);
        return;
      }

      navigate('/resultado');
    } catch {
      setSubmitError('Erro de conexão. Verifique sua internet e tente novamente.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-gray-500">Nenhuma pergunta disponível.</p>
      </div>
    );
  }

  const allAnswered = questions.every(isQuestionAnswered);
  const isLastQuestion = currentIndex === questions.length - 1;

  // Location step
  if (showLocationStep) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Quase lá!</span>
            <span>100% completo</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Onde você mora?</h2>
              <p className="text-sm text-gray-500">Para sugerirmos vagas na sua região</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">Selecione seu estado</option>
                {BRAZILIAN_STATES.map((s) => (
                  <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Cidade</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Digite sua cidade"
                  maxLength={100}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>
          </div>

          {submitError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {submitError}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handlePrevious}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  Ver Resultado
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion.id];
  const progress = ((currentIndex + 1) / (questions.length + 1)) * 100;
  const hasAnsweredCurrent = isQuestionAnswered(currentQuestion);
  const hasOptions = currentQuestion.options.some((o) => o.text !== '');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>Pergunta {currentIndex + 1} de {questions.length}</span>
          <span>{Math.round(progress)}% completo</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {currentQuestion.question_text}
        </h2>

        {hasOptions && (
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectOption(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  currentAnswer?.selectedOption === index
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {currentAnswer?.selectedOption === index ? (
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <span className={`text-base ${
                    currentAnswer?.selectedOption === index ? 'text-gray-900 font-medium' : 'text-gray-700'
                  }`}>
                    {option.text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {currentQuestion.allow_open_answer && (
          <div className="mb-6">
            {!hasOptions && (
              <p className="text-sm text-gray-500 mb-2">
                Escreva sua resposta livre abaixo:
              </p>
            )}
            {hasOptions && (
              <p className="text-sm text-gray-500 mb-2">
                Quer adicionar algo com suas próprias palavras? (opcional)
              </p>
            )}
            <textarea
              value={currentAnswer?.openAnswer ?? ''}
              onChange={(e) => handleOpenAnswerChange(e.target.value)}
              rows={hasOptions ? 2 : 4}
              maxLength={2000}
              placeholder="Digite sua resposta..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-none text-sm"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {(currentAnswer?.openAnswer ?? '').length}/2000
            </p>
          </div>
        )}

        {submitError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {submitError}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          {isLastQuestion ? (
            <button
              onClick={() => setShowLocationStep(true)}
              disabled={!allAnswered}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!hasAnsweredCurrent}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        {questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(idx)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
              idx === currentIndex
                ? 'bg-blue-600 text-white'
                : isQuestionAnswered(q)
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
