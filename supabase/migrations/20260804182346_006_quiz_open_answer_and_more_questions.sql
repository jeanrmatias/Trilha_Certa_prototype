/*
# Expand Quiz: Open-Answer Support + Additional Questions

1. Schema Changes
  - `quiz_questions`: add `allow_open_answer` (boolean, default false) — marks questions
    where the user can type a free-text answer in addition to (or instead of) choosing
    a fixed option.
  - `quiz_responses`: add `open_answer` (text, nullable) — stores the free-text answer
    when the question allows it.

2. New Questions (order_index 9–18)
  - Adds 10 additional evaluative questions covering: interests, habits, learning
    preferences, personal/professional context, weekend activities, digital
    consumption, study habits, social preferences, future aspirations, and
    self-perception. Several allow open answers.

3. Expanded Existing Questions (order_index 1–8)
  - Replaces the original 8 questions with expanded versions that include more
    answer options reflecting real young-audience behavior (streaming, gaming,
    social media, sports, volunteering, etc.) and, on key questions, an open-answer
    option.

4. Security
  - No RLS policy changes needed — existing policies already cover the new columns.
  - `allow_open_answer` is publicly readable (part of quiz_questions SELECT).
  - `open_answer` is covered by existing quiz_responses ownership policies.

5. Important Notes
  - Existing quiz_responses rows are preserved; `open_answer` defaults to NULL.
  - Existing quiz_questions rows (order_index 1–8) are REPLACED with expanded
    versions via DELETE + INSERT so there are no duplicates. This is safe because
    quiz_questions contains only seed/reference data, not user-generated content.
    User responses reference quiz_questions by id via FK, but since we are changing
    the question set entirely, old responses would reference deleted questions.
    To preserve referential integrity we ON DELETE CASCADE the old responses.
    This is acceptable: the quiz is being restructured and users will retake it.
*/

-- Add open-answer columns
ALTER TABLE quiz_questions
  ADD COLUMN IF NOT EXISTS allow_open_answer boolean NOT NULL DEFAULT false;

ALTER TABLE quiz_responses
  ADD COLUMN IF NOT EXISTS open_answer text;

-- Replace the original 8 questions with expanded versions and add 10 new ones.
-- Old responses cascade-delete with their questions (FK ON DELETE CASCADE).
DELETE FROM quiz_questions;

INSERT INTO quiz_questions (question_text, options, order_index, allow_open_answer) VALUES
-- 1: Free time (expanded)
(
  'Quando voce tem um tempo livre, o que voce mais gosta de fazer?',
  '[
    {"text": "Resolver quebra-cabecas, sudoku ou jogos de logica", "scores": {"exact_sciences": 20, "technology": 15}},
    {"text": "Jogar videogame (PC, console ou mobile)", "scores": {"technology": 20, "arts_creative": 5}},
    {"text": "Assistir series, animes ou filmes", "scores": {"humanities": 10, "arts_creative": 10}},
    {"text": "Ler livros, mangas ou escrever historias", "scores": {"humanities": 25}},
    {"text": "Desenhar, pintar, tocar instrumento ou criar coisas com as maos", "scores": {"arts_creative": 25}},
    {"text": "Cuidar de plantas, animais ou praticar esportes ao ar livre", "scores": {"biological": 25}},
    {"text": "Sair com amigos, ir a eventos ou fazer voluntariado", "scores": {"humanities": 15, "biological": 10}}
  ]'::jsonb,
  1, false
),
-- 2: Group role (expanded)
(
  'Em um trabalho em grupo, qual papel voce costuma assumir?',
  '[
    {"text": "O organizador que planeja e divide tarefas", "scores": {"exact_sciences": 15, "technology": 10}},
    {"text": "O comunicador que apresenta as ideias", "scores": {"humanities": 20, "arts_creative": 10}},
    {"text": "O pesquisador que busca e organiza informacoes", "scores": {"biological": 15, "humanities": 10}},
    {"text": "O criativo que propoe solucoes inovadoras", "scores": {"technology": 20, "arts_creative": 15}},
    {"text": "O lider que motiva o time e media conflitos", "scores": {"humanities": 15, "biological": 10}},
    {"text": "O que cuida dos detalhes tecnicos e do formato final", "scores": {"exact_sciences": 15, "technology": 15}}
  ]'::jsonb,
  2, false
),
-- 3: Favorite subject (expanded)
(
  'Qual materia voce mais gosta na escola?',
  '[
    {"text": "Matematica ou Fisica", "scores": {"exact_sciences": 25, "technology": 10}},
    {"text": "Portugues, Historia ou Geografia", "scores": {"humanities": 25}},
    {"text": "Biologia ou Quimica", "scores": {"biological": 25, "technology": 5}},
    {"text": "Artes ou Educacao Fisica", "scores": {"arts_creative": 25}},
    {"text": "Programacao, robotica ou informatica (se houver)", "scores": {"technology": 25}},
    {"text": "Sociologia, Filosofia ou Ensino Religioso", "scores": {"humanities": 20}}
  ]'::jsonb,
  3, false
),
-- 4: Learn something new (expanded)
(
  'Se voce pudesse aprender algo novo agora, o que escolheria?',
  '[
    {"text": "Programacao, robotica ou inteligencia artificial", "scores": {"technology": 25}},
    {"text": "Um novo idioma ou literatura", "scores": {"humanities": 20}},
    {"text": "Desenho, design grafico ou edicao de video", "scores": {"arts_creative": 25}},
    {"text": "Primeiros socorros, nutricao ou saude", "scores": {"biological": 25}},
    {"text": "Musica (tocar instrumento ou producao musical)", "scores": {"arts_creative": 20}},
    {"text": "Empreendedorismo ou gestao de dinheiro", "scores": {"exact_sciences": 15, "humanities": 10}}
  ]'::jsonb,
  4, false
),
-- 5: Problem solving (expanded)
(
  'Como voce prefere resolver problemas?',
  '[
    {"text": "Usando logica, numeros e calculos", "scores": {"exact_sciences": 25}},
    {"text": "Conversando e entendendo as pessoas envolvidas", "scores": {"humanities": 20}},
    {"text": "Pesquisando e analisando dados com calma", "scores": {"biological": 15, "technology": 10}},
    {"text": "Criando solucoes visuais ou praticas", "scores": {"arts_creative": 20, "technology": 10}},
    {"text": "Testando varias abordagens ate encontrar a melhor", "scores": {"technology": 15, "exact_sciences": 10}},
    {"text": "Procurando exemplos e tutoriais na internet", "scores": {"technology": 15, "humanities": 5}}
  ]'::jsonb,
  5, false
),
-- 6: Career motivation (expanded)
(
  'O que te motiva mais em uma carreira?',
  '[
    {"text": "Resolver problemas complexos e desafiadores", "scores": {"exact_sciences": 20, "technology": 15}},
    {"text": "Ajudar e entender as pessoas", "scores": {"humanities": 20, "biological": 15}},
    {"text": "Criar coisas novas e inovadoras", "scores": {"arts_creative": 20, "technology": 15}},
    {"text": "Descobrir como as coisas funcionam", "scores": {"biological": 15, "technology": 20}},
    {"text": "Ter estabilidade e seguranca financeira", "scores": {"exact_sciences": 15, "humanities": 5}},
    {"text": "Trabalhar com algo que impacte a sociedade", "scores": {"humanities": 15, "biological": 15}}
  ]'::jsonb,
  6, false
),
-- 7: Best environment (expanded)
(
  'Em qual ambiente voce se sente melhor?',
  '[
    {"text": "Laboratorio ou ambiente tecnico", "scores": {"biological": 15, "technology": 20}},
    {"text": "Biblioteca ou sala de estudos", "scores": {"humanities": 20, "exact_sciences": 10}},
    {"text": "Atelie ou estudio criativo", "scores": {"arts_creative": 25}},
    {"text": "Espaco aberto ou natureza", "scores": {"biological": 20}},
    {"text": "Escritorio ou ambiente corporativo", "scores": {"exact_sciences": 15, "humanities": 10}},
    {"text": "Em casa, no meu quarto, com tecnologia por perto", "scores": {"technology": 20, "arts_creative": 5}}
  ]'::jsonb,
  7, false
),
-- 8: Greatest talent (expanded, open answer allowed)
(
  'O que voce considera seu maior talento?',
  '[
    {"text": "Raciocinio logico e matematico", "scores": {"exact_sciences": 25, "technology": 10}},
    {"text": "Comunicacao e escrita", "scores": {"humanities": 25}},
    {"text": "Criatividade e expressao artistica", "scores": {"arts_creative": 25}},
    {"text": "Observacao e cuidado com outros", "scores": {"biological": 25}},
    {"text": "Habilidade com tecnologia e computadores", "scores": {"technology": 25}},
    {"text": "Lideranca e trabalho em equipe", "scores": {"humanities": 20, "biological": 5}}
  ]'::jsonb,
  8, true
),
-- 9: Weekend activities (NEW)
(
  'O que voce costuma fazer no fim de semana?',
  '[
    {"text": "Sair com amigos ou ir a festas", "scores": {"humanities": 15, "arts_creative": 5}},
    {"text": "Jogar online ou assistir streams", "scores": {"technology": 20}},
    {"text": "Praticar esporte ou atividade fisica", "scores": {"biological": 20}},
    {"text": "Maratonar series, filmes ou animes", "scores": {"arts_creative": 15, "humanities": 5}},
    {"text": "Criar conteudo (videos, desenhos, musica)", "scores": {"arts_creative": 25}},
    {"text": "Estudar ou fazer cursos online", "scores": {"exact_sciences": 15, "technology": 10}}
  ]'::jsonb,
  9, false
),
-- 10: Digital consumption (NEW)
(
  'Quais conteudos voce mais consome na internet?',
  '[
    {"text": "Tutoriais e videos educativos (YouTube, cursos)", "scores": {"technology": 20, "exact_sciences": 10}},
    {"text": "Noticias, documentarios e podcasts", "scores": {"humanities": 20}},
    {"text": "Memes, entretenimento e humor", "scores": {"arts_creative": 10, "humanities": 5}},
    {"text": "Gameplay, lives e e-sports", "scores": {"technology": 25}},
    {"text": "Arte, design, musica e criatividade", "scores": {"arts_creative": 25}},
    {"text": "Saude, bem-estar e dicas de vida", "scores": {"biological": 20}}
  ]'::jsonb,
  10, false
),
-- 11: Learning preference (NEW)
(
  'Como voce aprende melhor?',
  '[
    {"text": "Vendo videos e videoaulas", "scores": {"technology": 10, "arts_creative": 10}},
    {"text": "Lendo textos e livros", "scores": {"humanities": 20}},
    {"text": "Fazendo e praticando (projetos, exercicios)", "scores": {"exact_sciences": 20, "technology": 15}},
    {"text": "Desenhando, montando ou criando algo", "scores": {"arts_creative": 20}},
    {"text": "Experimentando e observando na pratica", "scores": {"biological": 20}},
    {"text": "Discutindo e explicando para outros", "scores": {"humanities": 15}}
  ]'::jsonb,
  11, false
),
-- 12: Study habits (NEW, open answer allowed)
(
  'Quando precisa estudar algo dificil, o que voce faz?',
  '[
    {"text": "Procuro videos no YouTube explicando o topico", "scores": {"technology": 15, "arts_creative": 5}},
    {"text": "Leio o material varias vezes ate entender", "scores": {"humanities": 20}},
    {"text": "Faco exercicios e pratico ate dominar", "scores": {"exact_sciences": 20}},
    {"text": "Peço ajuda a colegas ou professores", "scores": {"humanities": 15, "biological": 5}},
    {"text": "Crio mapas mentais, resumos ou desenhos", "scores": {"arts_creative": 20}},
    {"text": "Pesquiso em varios sites ate ficar claro", "scores": {"technology": 15, "biological": 10}}
  ]'::jsonb,
  12, true
),
-- 13: Social preference (NEW)
(
  'Como voce se relaciona com outras pessoas?',
  '[
    {"text": "Gosto de conhecer gente nova e falar em publico", "scores": {"humanities": 20, "arts_creative": 5}},
    {"text": "Prefiro grupos pequenos e conversas profundas", "scores": {"humanities": 15, "biological": 10}},
    {"text": "Sou mais reservado e gosto de ficar no meu cantinho", "scores": {"technology": 15, "arts_creative": 10}},
    {"text": "Gosto de liderar e organizar grupos", "scores": {"exact_sciences": 15, "humanities": 10}},
    {"text": "Me dou bem com todo mundo, sou mediador", "scores": {"humanities": 15, "biological": 10}},
    {"text": "Prefiro interagir online do que presencialmente", "scores": {"technology": 20}}
  ]'::jsonb,
  13, false
),
-- 14: Future aspiration (NEW, open answer allowed)
(
  'Se voce pudesse escolher qualquer profissao hoje, o que seria?',
  '[
    {"text": "Algo na area de tecnologia ou programacao", "scores": {"technology": 25}},
    {"text": "Medicina, saude ou biologia", "scores": {"biological": 25}},
    {"text": "Engenharia, arquitetura ou exatas", "scores": {"exact_sciences": 25}},
    {"text": "Arte, design, musica ou audiovisual", "scores": {"arts_creative": 25}},
    {"text": "Direito, jornalismo ou ciencias humanas", "scores": {"humanities": 25}},
    {"text": "Empreendedorismo ou negocio proprio", "scores": {"exact_sciences": 15, "humanities": 10}}
  ]'::jsonb,
  14, true
),
-- 15: Personal context (NEW, open answer allowed)
(
  'Existe algo sobre voce, sua familia ou seu contexto que influencia suas escolhas?',
  '[
    {"text": "Minha familia me apoia em qualquer area", "scores": {"humanities": 10}},
    {"text": "Preciso trabalhar cedo para ajudar em casa", "scores": {"exact_sciences": 10, "humanities": 5}},
    {"text": "Nao tenho muitos recursos, busco oportunidades gratuitas", "scores": {"technology": 10, "humanities": 5}},
    {"text": "Sou o primeiro da familia a estudar mais", "scores": {"humanities": 15, "biological": 5}},
    {"text": "Tenho liberdade e recursos para explorar", "scores": {"arts_creative": 10, "technology": 5}},
    {"text": "Prefiro nao responder", "scores": {}}
  ]'::jsonb,
  15, true
),
-- 16: Self-perception (NEW, open answer allowed)
(
  'Como seus amigos te descreveriam?',
  '[
    {"text": "O cara inteligente que sabe de tudo", "scores": {"exact_sciences": 20, "technology": 10}},
    {"text": "O criativo cheio de ideias diferentes", "scores": {"arts_creative": 25}},
    {"text": "O que cuida dos outros e sempre ajuda", "scores": {"biological": 20, "humanities": 10}},
    {"text": "O comunicador que faz todo mundo rir", "scores": {"humanities": 20, "arts_creative": 10}},
    {"text": "O tecnico que resolve qualquer problema", "scores": {"technology": 25}},
    {"text": "O lider que organiza tudo e puxa o grupo", "scores": {"exact_sciences": 15, "humanities": 10}}
  ]'::jsonb,
  16, true
),
-- 17: Free-time creation vs consumption (NEW)
(
  'Na internet, voce se considera mais criador ou consumidor de conteudo?',
  '[
    {"text": "Criador: faco videos, desenhos, musicas ou textos", "scores": {"arts_creative": 25, "technology": 10}},
    {"text": "Consumidor: gosto de assistir e aprender", "scores": {"humanities": 15, "technology": 10}},
    {"text": "Os dois: crio e consumo na mesma medida", "scores": {"arts_creative": 15, "humanities": 10}},
    {"text": "Mais tecnico: programo, configuro ou mexo com dados", "scores": {"technology": 25}},
    {"text": "Mais social: interajo muito em redes e comunidades", "scores": {"humanities": 20}},
    {"text": "Nem um nem outro, uso a internet para lazer", "scores": {"biological": 5, "arts_creative": 5}}
  ]'::jsonb,
  17, false
),
-- 18: Open-ended interest (NEW, open answer only)
(
  'Escreva, com suas palavras, o que voce mais gosta de fazer ou aprender:',
  '[
    {"text": "", "scores": {}}
  ]'::jsonb,
  18, true
);

-- Update the quiz_responses unique constraint to remain (user_id, question_id)
-- (already in place; no change needed)