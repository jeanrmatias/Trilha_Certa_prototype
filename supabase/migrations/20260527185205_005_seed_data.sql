/*
  # Seed Initial Data

  1. Quiz Questions
    - 8 questions for skill mapping
    - Each option contributes points to different areas
    
  2. Learning Paths
    - Sample trilhas for different areas
    
  3. Jobs
    - Sample vagas for students

  4. Important Notes
    - All IDs are generated automatically
    - Questions have order_index for sequential display
*/

INSERT INTO quiz_questions (question_text, options, order_index) VALUES
(
  'Quando você tem um tempo livre, o que você mais gosta de fazer?',
  '[
    {"text": "Resolver quebra-cabeças ou jogos de lógica", "scores": {"exact_sciences": 20, "technology": 15}},
    {"text": "Ler livros ou escrever histórias", "scores": {"humanities": 25}},
    {"text": "Desenhar, pintar ou criar coisas com as mãos", "scores": {"arts_creative": 25}},
    {"text": "Cuidar de plantas ou animais", "scores": {"biological": 25}}
  ]'::jsonb,
  1
),
(
  'Em um trabalho em grupo, qual papel você costuma assumir?',
  '[
    {"text": "O organizador que planeja tudo", "scores": {"exact_sciences": 15, "technology": 10}},
    {"text": "O comunicador que apresenta as ideias", "scores": {"humanities": 20, "arts_creative": 10}},
    {"text": "O pesquisador que busca informações", "scores": {"biological": 15, "humanities": 10}},
    {"text": "O criativo que propõe soluções inovadoras", "scores": {"technology": 20, "arts_creative": 15}}
  ]'::jsonb,
  2
),
(
  'Qual matéria você mais gosta na escola?',
  '[
    {"text": "Matemática ou Física", "scores": {"exact_sciences": 25, "technology": 10}},
    {"text": "Português, História ou Geografia", "scores": {"humanities": 25}},
    {"text": "Biologia ou Química", "scores": {"biological": 25, "technology": 5}},
    {"text": "Artes ou Educação Física", "scores": {"arts_creative": 25}}
  ]'::jsonb,
  3
),
(
  'Se você pudesse aprender algo novo, o que escolheria?',
  '[
    {"text": "Programação ou robótica", "scores": {"technology": 25}},
    {"text": "Um novo idioma ou literatura", "scores": {"humanities": 20}},
    {"text": "Técnicas de desenho ou design", "scores": {"arts_creative": 25}},
    {"text": "Primeiros socorros ou nutrição", "scores": {"biological": 25}}
  ]'::jsonb,
  4
),
(
  'Como você prefere resolver problemas?',
  '[
    {"text": "Usando lógica e números", "scores": {"exact_sciences": 25}},
    {"text": "Conversando e entendendo as pessoas", "scores": {"humanities": 20}},
    {"text": "Pesquisando e analisando dados", "scores": {"biological": 15, "technology": 10}},
    {"text": "Criando soluções visuais ou práticas", "scores": {"arts_creative": 20, "technology": 10}}
  ]'::jsonb,
  5
),
(
  'O que te motiva mais em uma carreira?',
  '[
    {"text": "Resolver problemas complexos", "scores": {"exact_sciences": 20, "technology": 15}},
    {"text": "Ajudar e entender as pessoas", "scores": {"humanities": 20, "biological": 15}},
    {"text": "Criar coisas novas e inovadoras", "scores": {"arts_creative": 20, "technology": 15}},
    {"text": "Descobrir como as coisas funcionam", "scores": {"biological": 15, "technology": 20}}
  ]'::jsonb,
  6
),
(
  'Em qual ambiente você se sente melhor?',
  '[
    {"text": "Laboratório ou ambiente técnico", "scores": {"biological": 15, "technology": 20}},
    {"text": "Biblioteca ou sala de estudos", "scores": {"humanities": 20, "exact_sciences": 10}},
    {"text": "Ateliê ou estúdio criativo", "scores": {"arts_creative": 25}},
    {"text": "Espaço aberto ou natureza", "scores": {"biological": 20}}
  ]'::jsonb,
  7
),
(
  'O que você considera seu maior talento?',
  '[
    {"text": "Raciocínio lógico e matemático", "scores": {"exact_sciences": 25, "technology": 10}},
    {"text": "Comunicação e escrita", "scores": {"humanities": 25}},
    {"text": "Criatividade e expressão artística", "scores": {"arts_creative": 25}},
    {"text": "Observação e cuidado com outros", "scores": {"biological": 25}}
  ]'::jsonb,
  8
);

INSERT INTO learning_paths (name, description, area, image_url, content, duration_hours, difficulty, is_free, provider) VALUES
(
  'Introdução à Programação',
  'Aprenda os fundamentos da programação com Python, uma das linguagens mais usadas no mundo.',
  'tecnologia',
  'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?w=400',
  '[{"title": "Curso Python para Iniciantes", "url": "https://www.cursoemvideo.com/curso/python-3-mundo-1/", "type": "video", "description": "Curso completo e gratuito do Guanabara"}, {"title": "Codecademy Python", "url": "https://www.codecademy.com/learn/learn-python-3", "type": "interactive", "description": "Exercícios práticos interativos"}, {"title": "Automatize Tarefas com Python", "url": "https://automatetheboringstuff.com/", "type": "book", "description": "Livro gratuito online"}]'::jsonb,
  40,
  'iniciante',
  true,
  'Curso em Video'
),
(
  'Matemática para Vestibular',
  'Domine os principais tópicos de matemática para o ENEM e vestibulares.',
  'exatas',
  'https://images.pexels.com/photos/3769220/pexels-photo-3769220.jpeg?w=400',
  '[{"title": "Matemática Básica - Khan Academy", "url": "https://pt.khanacademy.org/math", "type": "video", "description": "Aulas interativas gratuitas"}, {"title": "Me Salva! Matemática", "url": "https://www.mesalva.com/", "type": "video", "description": "Videoaulas para ENEM"}, {"title": "Lista de Exercícios", "url": "https://brasilescola.uol.com.br/matematica/", "type": "exercise", "description": "Exercícios comentados"}]'::jsonb,
  60,
  'intermediario',
  true,
  'Khan Academy'
),
(
  'Redação para ENEM',
  'Aprenda a escrever textos dissertativo-argumentativos de alta nota.',
  'humanas',
  'https://images.pexels.com/photos/261762/pexels-photo-261762.jpeg?w=400',
  '[{"title": "Curso de Redação", "url": "https://www.poliedro.com.br/", "type": "video", "description": "Técnicas de redação"}, {"title": "Redação Nota 1000", "url": "https://www.todamateria.com.br/redacao/", "type": "article", "description": "Exemplos de redações nota máxima"}, {"title": "Pratique Redação Online", "url": "https://exame.com/redacao-enem/", "type": "interactive", "description": "Simulados e correções"}]'::jsonb,
  30,
  'iniciante',
  true,
  'Poli'
),
(
  'Design Gráfico para Iniciantes',
  'Explore o mundo do design visual e aprenda a criar peças profissionais.',
  'artes',
  'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?w=400',
  '[{"title": "Curso Canva Básico", "url": "https://www.canva.com/designschool/", "type": "interactive", "description": "Design gráfico gratuito online"}, {"title": "Teoria das Cores", "url": "https://www.mundodoadm.com.br/teoria-das-cores/", "type": "article", "description": "Fundamentos do uso de cores"}, {"title": "Figma para Iniciantes", "url": "https://www.figma.com/resources/learn-design/", "type": "video", "description": "Design de interfaces"}]'::jsonb,
  25,
  'iniciante',
  true,
  'Canva'
),
(
  'Biologia e Saúde',
  'Entenda os fundamentos da biologia e prepare-se para carreiras na saúde.',
  'biologicas',
  'https://images.pexels.com/photos/2280570/pexels-photo-2280570.jpeg?w=400',
  '[{"title": "Biologia Geral - Khan Academy", "url": "https://pt.khanacademy.org/science/biology", "type": "video", "description": "Fundamentos de biologia"}, {"title": "Biologia Total", "url": "https://biologiatotal.com/", "type": "video", "description": "Videoaulas para ENEM"}, {"title": "Primeiros Socorros", "url": "https://www.sbans.org.br/primeiros-socorros/", "type": "article", "description": "Noções básicas"}]'::jsonb,
  50,
  'iniciante',
  true,
  'Khan Academy'
),
(
  'Introdução à Análise de Dados',
  'Aprenda a trabalhar com dados e descobrir insights valiosos.',
  'tecnologia',
  'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?w=400',
  '[{"title": "Data Science com Python", "url": "https://www.coursera.org/learn/python-data-analysis", "type": "video", "description": "Curso gratuito da USP"}, {"title": "Excel Avançado", "url": "https://www.spreadsheeto.com/excel/", "type": "interactive", "description": "Tutoriais práticos"}, {"title": "SQL para Iniciantes", "url": "https://www.sqlbolt.com/", "type": "interactive", "description": "Aprenda SQL interativamente"}]'::jsonb,
  35,
  'intermediario',
  true,
  'Coursera'
);

INSERT INTO jobs (title, company, description, requirements, location, work_type, job_type, area, salary_range, application_url, deadline) VALUES
(
  'Jovem Aprendiz - Administrativo',
  'Banco do Brasil',
  'Programa de aprendizagem com foco em atividades administrativas e atendimento ao cliente. Inclui capacitação e desenvolvimento profissional.',
  'Ensino médio completo ou cursando. Disponibilidade de 4-6 horas diárias. Desejável conhecimento básico em informática.',
  'São Paulo, SP',
  'presencial',
  'jovem_aprendiz',
  'humanas',
  'R$ 800 - R$ 1.200',
  'https://www.bb.com.br/portalbb/home.html',
  '2026-12-31'
),
(
  'Estágio em TI',
  'Tech Solutions',
  'Estágio em desenvolvimento de software com mentoria de profissionais experientes. Oportunidade de aprendizado prático.',
  'Cursando ensino superior ou técnico em TI. Conhecimento básico em programação. Vontade de aprender.',
  'São Paulo, SP',
  'hibrido',
  'estagio',
  'tecnologia',
  'R$ 1.500 - R$ 2.000',
  'https://example.com/jobs/estagio-ti',
  '2026-08-30'
),
(
  'Jovem Aprendiz - Farmácia',
  'Drogaria Popular',
  'Atendimento ao cliente e auxílio nas atividades da farmácia. Aprendizado sobre produtos farmacêuticos.',
  'Ensino médio completo. Interesse em área da saúde. Boa comunicação.',
  'Rio de Janeiro, RJ',
  'presencial',
  'jovem_aprendiz',
  'biologicas',
  'R$ 900 - R$ 1.100',
  'https://example.com/jobs/aprendiz-farmacia',
  '2026-07-15'
),
(
  'Estágio em Design',
  'Agência Criativa',
  'Auxiliar na criação de peças visuais para redes sociais e materiais impressos. Aprendizado com designers experientes.',
  'Cursando design ou áreas correlatas. Conhecimento em Canva ou Adobe. Portfólio demonstrando criatividade.',
  'Curitiba, PR',
  'remoto',
  'estagio',
  'artes',
  'R$ 1.200 - R$ 1.800',
  'https://example.com/jobs/estagio-design',
  '2026-09-01'
),
(
  'Jovem Aprendiz - Indústria',
  'Indústria ABC',
  'Atuação em produção industrial com aprendizado técnico. Programa de desenvolvimento com certificação.',
  'Ensino médio completo. Interesse em área industrial. Disponibilidade para trabalhar em turnos.',
  'Santo André, SP',
  'presencial',
  'jovem_aprendiz',
  'exatas',
  'R$ 1.000 - R$ 1.300',
  'https://example.com/jobs/aprendiz-industria',
  '2026-10-20'
),
(
  'Estágio em Marketing Digital',
  'Startup XYZ',
  'Atuação com redes sociais, criação de conteúdo e análise de métricas. Ambiente dinâmico e inovador.',
  'Cursando marketing, publicidade ou áreas correlatas. Conhecimento em redes sociais. Criatividade.',
  'Remoto',
  'remoto',
  'estagio',
  'humanas',
  'R$ 1.300 - R$ 1.700',
  'https://example.com/jobs/estagio-marketing',
  '2026-08-15'
);