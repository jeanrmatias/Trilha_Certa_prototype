import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Compass, Target, Briefcase, ChevronRight } from 'lucide-react';

export function Onboarding() {
  const { user, loading } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  const slides = [
    {
      icon: Compass,
      title: 'Descubra suas habilidades',
      description: 'Responda perguntas simples e descubra em quais areas voce tem mais talento.',
      image: 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?w=600',
    },
    {
      icon: Target,
      title: 'Receba trilhas personalizadas',
      description: 'Cursos e conteudos gratuitos organizados especialmente para voce.',
      image: 'https://images.pexels.com/photos/5212328/pexels-photo-5212328.jpeg?w=600',
    },
    {
      icon: Briefcase,
      title: 'Encontre oportunidades',
      description: 'Vagas de estagio, jovem aprendiz e primeiro emprego na sua regiao.',
      image: 'https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?w=600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-4 py-8">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-lg">
              <Compass className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-white">Trilha Certa</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="relative h-48 overflow-hidden">
              <img
                src={slides[currentSlide].image}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 text-white">
                  {currentSlide === 0 && <Compass className="w-6 h-6" aria-hidden="true" />}
                  {currentSlide === 1 && <Target className="w-6 h-6" aria-hidden="true" />}
                  {currentSlide === 2 && <Briefcase className="w-6 h-6" aria-hidden="true" />}
                  <h2 className="text-xl font-bold">{slides[currentSlide].title}</h2>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-600 text-base mb-6">
                {slides[currentSlide].description}
              </p>

              <div className="flex justify-center gap-2 mb-6">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? 'bg-blue-600 w-6'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Ir para slide ${index + 1}`}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                {currentSlide < slides.length - 1 ? (
                  <button
                    onClick={() => setCurrentSlide(currentSlide + 1)}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Proximo
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <a
                    href="/cadastro"
                    className="flex-1 bg-amber-400 text-gray-900 py-3 px-4 rounded-xl font-bold hover:bg-amber-500 transition-colors text-center"
                  >
                    Comecar Agora
                  </a>
                )}
                <a
                  href="/login"
                  className="px-4 py-3 border border-gray-300 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Entrar
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
