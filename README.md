# Trilha Certa

Plataforma web que ajuda estudantes de escolas publicas a descobrirem suas habilidades, receberem recomendacoes de trilhas de estudo/carreira e visualizarem vagas de emprego ou estagio compativeis.

---

## Sumario

- [Sobre o Projeto](#sobre-o-projeto)
- [Publico-Alvo](#publico-alvo)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Modelo de Dados](#modelo-de-dados)
- [Fluxo do Usuario](#fluxo-do-usuario)
- [Instalacao e Execucao](#instalacao-e-execucao)
- [Variaveis de Ambiente](#variaveis-de-ambiente)
- [Telas da Aplicacao](#telas-da-aplicacao)
- [Design e Acessibilidade](#design-e-acessibilidade)
- [Seguranca](#seguranca)
- [Roadmap](#roadmap)

---

## Sobre o Projeto

O **Trilha Certa** e um prototipo funcional (MVP) desenvolvido para validar a proposta de valor de uma plataforma de orientacao profissional para jovens estudantes. A plataforma oferece um quiz interativo de mapeamento de habilidades, recomendações personalizadas de trilhas de aprendizado e um catalogo de vagas de estagio e jovem aprendiz.

O objetivo principal e conectar estudantes a oportunidades que fazem sentido para o perfil de cada um, reduzindo a distancia entre a escola e o mercado de trabalho.

---

## Publico-Alvo

Estudantes do ensino medio de escolas publicas brasileiras, com idades entre 14 e 18 anos, que estao comecando a pensar no futuro profissional. A plataforma foi projetada para ser simples e inclusiva, considerando diferentes niveis de acesso digital.

---

## Funcionalidades

### Mapeamento de Habilidades
- Quiz interativo com 8 perguntas de multipla escolha
- Cada resposta contribui pontos para areas especificas (Exatas, Humanas, Biologicas, Tecnologia, Artes)
- Resultado normalizado em porcentagem (0-100%) por area
- Possibilidade de refazer o mapeamento

### Recomendacao de Trilhas
- Trilhas de aprendizado organizadas por area de interesse
- Cada trilha contem recursos externos gratuitos (videos, artigos, livros, exercicios)
- Filtros por area e nivel de dificuldade
- Busca textual por nome ou descricao
- Possibilidade de salvar trilhas favoritas

### Catalogo de Vagas
- Vagas de estagio, jovem aprendiz e primeiro emprego
- Filtros por area, tipo de vaga e modalidade (presencial/remoto/hibrido)
- Indicadores de urgencia para prazos proximos
- Link externo para candidatura
- Favoritacao de vagas

### Area do Usuario
- Perfil editavel (nome)
- Visualizacao do perfil de habilidades com barras de progresso
- Lista de trilhas salvas e vagas favoritadas
- Historico do mapeamento de habilidades

---

## Tecnologias

| Tecnologia | Uso |
|---|---|
| React 18 | Interface do usuario |
| TypeScript | Tipagem estatica |
| Vite | Build e dev server |
| Tailwind CSS | Estilizacao utilitaria |
| Lucide React | Icones SVG |
| React Router DOM | Navegacao SPA |
| Supabase | Banco de dados, autenticacao e RLS |

---

## Estrutura do Projeto

```
src/
  App.tsx                  # Rotas e layout de protecao
  main.tsx                 # Ponto de entrada
  index.css                # Estilos globais e variaveis CSS
  vite-env.d.ts            # Tipos do Vite

  components/
    Layout.tsx             # Layout principal com header, nav e footer

  contexts/
    AuthContext.tsx         # Contexto de autenticacao (signup, signin, signout, profile)

  lib/
    supabase.ts            # Cliente Supabase singleton

  pages/
    Onboarding.tsx         # Tela de apresentacao da plataforma
    Login.tsx              # Tela de login
    Register.tsx           # Tela de cadastro
    Home.tsx               # Dashboard principal
    Quiz.tsx               # Quiz de mapeamento de habilidades
    QuizResults.tsx        # Resultado do mapeamento
    Trilhas.tsx            # Lista de trilhas de aprendizado
    TrilhaDetail.tsx       # Detalhe de uma trilha
    Vagas.tsx              # Lista de vagas
    VagaDetail.tsx         # Detalhe de uma vaga
    Profile.tsx            # Perfil do usuario

  types/
    database.ts            # Tipos TypeScript e constantes do banco

supabase/
  migrations/
    001_initial_schema.sql
    001_create_profiles.sql
    002_create_quiz_tables.sql
    003_create_learning_paths.sql
    004_create_jobs.sql
    005_seed_data.sql
```

---

## Modelo de Dados

### `profiles`
| Coluna | Tipo | Descricao |
|---|---|---|
| id | uuid (PK, FK auth.users) | Identificador do usuario |
| name | text | Nome de exibicao |
| email | text (unique) | Email do usuario |
| avatar_url | text | URL do avatar (opcional) |
| created_at | timestamptz | Data de criacao |
| updated_at | timestamptz | Data de atualizacao |

### `quiz_questions`
| Coluna | Tipo | Descricao |
|---|---|---|
| id | uuid (PK) | Identificador da pergunta |
| question_text | text | Texto da pergunta |
| options | jsonb | Array de opcoes com pontuacao por area |
| order_index | integer | Ordem de exibicao |
| created_at | timestamptz | Data de criacao |

### `quiz_responses`
| Coluna | Tipo | Descricao |
|---|---|---|
| id | uuid (PK) | Identificador da resposta |
| user_id | uuid (FK profiles) | Usuario que respondeu |
| question_id | uuid (FK quiz_questions) | Pgunta respondida |
| selected_option_index | integer | Indice da opcao selecionada |
| created_at | timestamptz | Data da resposta |

### `skill_profiles`
| Coluna | Tipo | Descricao |
|---|---|---|
| id | uuid (PK) | Identificador do perfil |
| user_id | uuid (unique, FK profiles) | Usuario vinculado |
| exact_sciences | integer | Pontuacao em Exatas (0-100) |
| humanities | integer | Pontuacao em Humanas (0-100) |
| biological | integer | Pontuacao em Biologicas (0-100) |
| technology | integer | Pontuacao em Tecnologia (0-100) |
| arts_creative | integer | Pontuacao em Artes (0-100) |
| completed_at | timestamptz | Data de conclusao |

### `learning_paths`
| Coluna | Tipo | Descricao |
|---|---|---|
| id | uuid (PK) | Identificador da trilha |
| name | text | Nome da trilha |
| description | text | Descricao |
| area | text | Area (exatas, humanas, biologicas, tecnologia, artes) |
| image_url | text | URL da imagem de capa |
| content | jsonb | Array de recursos educacionais |
| duration_hours | integer | Carga horaria estimada |
| difficulty | text | Nivel (iniciante, intermediario, avancado) |
| is_free | boolean | Se e gratuito |
| provider | text | Provedor do conteudo |
| created_at | timestamptz | Data de criacao |

### `jobs`
| Coluna | Tipo | Descricao |
|---|---|---|
| id | uuid (PK) | Identificador da vaga |
| title | text | Titulo da vaga |
| company | text | Empresa |
| description | text | Descricao |
| requirements | text | Requisitos |
| location | text | Localizacao |
| work_type | text | Presencial, remoto ou hibrido |
| job_type | text | Estagio, jovem_aprendiz ou clt |
| area | text | Area da vaga |
| salary_range | text | Faixa salarial |
| application_url | text | Link para candidatura |
| deadline | date | Prazo de candidatura |
| created_at | timestamptz | Data de criacao |

### `saved_paths`
| Coluna | Tipo | Descricao |
|---|---|---|
| id | uuid (PK) | Identificador |
| user_id | uuid (FK profiles) | Usuario |
| path_id | uuid (FK learning_paths) | Trilha salva |
| created_at | timestamptz | Data |

### `saved_jobs`
| Coluna | Tipo | Descricao |
|---|---|---|
| id | uuid (PK) | Identificador |
| user_id | uuid (FK profiles) | Usuario |
| job_id | uuid (FK jobs) | Vaga salva |
| created_at | timestamptz | Data |

---

## Fluxo do Usuario

```
Onboarding (apresentacao)
    |
    v
Cadastro / Login
    |
    v
Home (dashboard)
    |
    +---> Mapeamento de Habilidades (quiz)
    |         |
    |         v
    |     Resultado do Mapeamento
    |         |
    |         v
    |     Trilhas Recomendadas
    |
    +---> Trilhas de Aprendizado
    |         |
    |         v
    |     Detalhe da Trilha
    |
    +---> Vagas e Oportunidades
    |         |
    |         v
    |     Detalhe da Vaga
    |
    +---> Perfil (trilhas salvas, vagas favoritas, habilidades)
```

---

## Instalacao e Execucao

### Prerequisitos

- Node.js 18+
- npm 9+

### Passos

```bash
# Clone o repositorio
git clone <url-do-repositorio>
cd trilha-certa

# Instale as dependencias
npm install

# Configure as variaveis de ambiente (ver secao abaixo)
cp .env.example .env
# Edite o .env com suas credenciais do Supabase

# Execute o projeto em modo de desenvolvimento
npm run dev

# Para build de producao
npm run build

# Para previsualizar o build
npm run preview
```

---

## Variaveis de Ambiente

| Variavel | Descricao | Obrigatorio |
|---|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | Sim |
| `VITE_SUPABASE_ANON_KEY` | Chave anonima do Supabase | Sim |

Essas variaveis sao configuradas no arquivo `.env` na raiz do projeto. O Supabase ja provê essas credenciais no dashboard do projeto, em Settings > API.

---

## Telas da Aplicacao

### Onboarding
Apresentacao da plataforma com carrossel de 3 slides explicando as funcionalidades principais. Botoes para "Comecar Agora" (cadastro) e "Entrar" (login).

### Cadastro
Formulario com nome, email, senha e confirmacao de senha. Inclui indicador visual de forca da senha e validacao em tempo real.

### Login
Formulario com email e senha. Opcao de visualizar/ocultar senha. Link para cadastro caso o usuario nao tenha conta.

### Home (Dashboard)
Visao geral com saudacao personalizada, atalhos rapidos para as funcionalidades, resumo do perfil de habilidades (se o quiz ja foi respondido), trilhas recomendadas e vagas recentes.

### Mapeamento de Habilidades (Quiz)
8 perguntas de multipla escolha com barra de progresso. Navegacao livre entre perguntas. Indicadores visuais de quais perguntas ja foram respondidas. Botao de enviar disponivel apenas quando todas as perguntas estao respondidas.

### Resultado do Mapeamento
Grafico de barras horizontais mostrando pontuacao por area. Destaque para a area principal. Trilhas recomendadas com base na area de maior pontuacao. Opcao de refazer o mapeamento.

### Trilhas de Aprendizado
Lista de cards com imagem, nome, descricao, duracao, dificuldade e tag de gratuito. Filtros por area e dificuldade. Busca textual. Botao de salvar em cada card.

### Detalhe da Trilha
Imagem de capa, tags de area/dificuldade/gratuito, descricao completa, lista de recursos educacionais com links externos (video, artigo, livro, exercicio, interativo). Botao de salvar/remover.

### Vagas e Oportunidades
Lista de vagas com titulo, empresa, localizacao, tipo, modalidade e faixa salarial. Filtros por area, tipo (estagio/jovem aprendiz/CLT) e modalidade. Indicadores de urgencia. Busca textual. Botao de favoritar.

### Detalhe da Vaga
Descricao completa, requisitos, informacoes de localizacao e salario. Link externo para candidatura. Aviso visual quando o prazo esta proximo ou encerrado. Botao de favoritar/remover.

### Perfil
Foto/avatar com inicial do nome, nome editavel, email. Contadores de trilhas salvas e vagas favoritadas. Grafico de habilidades. Abas com lista de trilhas salvas e vagas favoritadas (com opcao de remover). Botao de sair da conta.

---

## Design e Acessibilidade

### Design Universal
- Cores contrastantes: azul escuro (#1d4ed8) como primario e amarelo/dourado (#facc15) como destaque
- Fonte Inter com tamanho minimo de 16px para textos de corpo
- Espacamento baseado em multiplos de 8px
- Pesos de fonte limitados a 3: regular (400), medio (500), bold (600/700)

### Layout Responsivo
- Mobile-first com breakpoints em 640px (sm), 768px (md) e 1024px (lg)
- Grid adaptativo: 1 coluna em mobile, 2 em tablet, 3 em desktop
- Menu colapsavel em mobile com botao hamburger

### Acessibilidade
- Todos os elementos interativos sao focaveis via teclado (`focus-visible`)
- Outline visivel (2px azul) em foco de teclado
- `aria-label` em icones e botoes de acao
- `alt` descritivo em imagens
- Navegacao logica por tab
- Labels associados a campos de formulario

### Feedback Visual
- Transicoes suaves em hover e troca de estado (300ms)
- Loading spinners durante operacoes assincronas
- Skeletons placeholders durante carregamento de dados
- Mensagens de erro contextuais e amigaveis
- Indicadores de progresso em barras visuais

---

## Seguranca

### Autenticacao
- Supabase Auth com email e senha
- Sessao persistida automaticamente com refresh de token
- Rotas protegidas com redirect para onboarding quando nao autenticado
- Confirmacao de email desabilitada (fluxo simplificado para MVP)

### Row Level Security (RLS)
Todas as tabelas possuem RLS habilitado com politicas restritivas:

| Tabela | Politicas |
|---|---|
| `profiles` | Usuarios leem e editam apenas o proprio perfil |
| `quiz_questions` | Leitura publica para usuarios autenticados |
| `quiz_responses` | Usuarios acessam apenas suas proprias respostas |
| `skill_profiles` | Usuarios acessam apenas seu proprio perfil de habilidades |
| `learning_paths` | Leitura publica para usuarios autenticados |
| `saved_paths` | Usuarios gerenciam apenas suas proprias trilhas salvas |
| `jobs` | Leitura publica para usuarios autenticados |
| `saved_jobs` | Usuarios gerenciam apenas suas proprias vagas salvas |

### Boas Praticas Adicionais
- Nenhuma politica usa `USING (true)` (acesso irrestrito)
- Policias separadas por operacao (SELECT, INSERT, UPDATE, DELETE)
- Verificacao de `auth.uid()` em todas as politicas
- Chave anonima do Supabase usada apenas no frontend (sem service role key exposta)

---

## Roadmap

Funcionalidades planejadas para versoes futuras:

- [ ] Confirmacao de email no cadastro
- [ ] Login com Google (OAuth)
- [ ] Upload de foto de perfil
- [ ] Notificacoes de novas vagas por area
- [ ] Comparacao de perfil com requisitos de vagas
- [ ] Sistema de progresso nas trilhas (marcar conteudos como concluidos)
- [ ] Compartilhamento de resultado do mapeamento
- [ ] Painel administrativo para gestores cadastrarem vagas e trilhas
- [ ] Integracao com APIs de vagas (LinkedIn, Gupy, etc.)
- [ ] Chatbot para orientacao profissional
- [ ] Modo offline (PWA)
- [ ] Internacionalizacao (i18n)
