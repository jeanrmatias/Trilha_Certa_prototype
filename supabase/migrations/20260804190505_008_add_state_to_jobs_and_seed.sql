/*
# Add State Column to Jobs and Seed Vagas from Multiple States

1. Modified Tables
  - `jobs`
    - `state` (text, nullable) — Brazilian state abbreviation (UF) for filtering by state.
    - A CHECK constraint is NOT added to keep it flexible (remote jobs may have empty state).

2. New Data
  - Inserts ~14 new job postings across multiple Brazilian states:
    - SP, RJ, MG, RS, PR, SC, CE, BA, PE, DF, GO, AM
  - Covers all 5 area categories: exatas, humanas, biologicas, tecnologia, artes
  - Mix of job types: estagio, jovem_aprendiz, clt
  - Mix of work types: presencial, remoto, hibrido

3. Security
  - No RLS changes. Jobs remain publicly readable to authenticated users.
  - The new `state` column inherits existing table-level privileges.

4. Important Notes
  - The `state` column is nullable so existing jobs without a state value still work.
  - Existing jobs are updated with state values based on their location text.
  - New jobs cover states from all regions of Brazil.
*/

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS state text DEFAULT '';

-- Update existing jobs with state based on their location
UPDATE jobs SET state = 'SP' WHERE location LIKE '%SP%' AND state = '';
UPDATE jobs SET state = 'RJ' WHERE location LIKE '%RJ%' AND state = '';
UPDATE jobs SET state = 'PR' WHERE location LIKE '%PR%' AND state = '';
UPDATE jobs SET state = '' WHERE location ILIKE '%remoto%' AND state = '';

-- Insert new vagas from multiple Brazilian states
INSERT INTO jobs (title, company, description, requirements, location, state, work_type, job_type, area, salary_range, application_url, deadline) VALUES
(
  'Jovem Aprendiz - Atendimento',
  'Lojas Americanas',
  'Programa de aprendizagem com foco em atendimento ao cliente e operação de caixa. Inclui capacitação profissional.',
  'Ensino médio completo ou cursando. Disponibilidade de 4-6 horas diárias. Boa comunicação.',
  'Rio de Janeiro, RJ', 'RJ', 'presencial', 'jovem_aprendiz', 'humanas',
  'R$ 850 - R$ 1.100', 'https://example.com/jobs/aprendiz-rj', '2026-12-31'
),
(
  'Estágio em Recursos Humanos',
  'Empresa RH Brasil',
  'Estágio em RH com foco em recrutamento e seleção. Aprendizado prático com equipe experiente.',
  'Cursando Administração, Psicologia ou áreas correlatas. Conhecimento básico de Excel.',
  'Belo Horizonte, MG', 'MG', 'hibrido', 'estagio', 'humanas',
  'R$ 1.200 - R$ 1.600', 'https://example.com/jobs/estagio-rh-mg', '2026-09-15'
),
(
  'Jovem Aprendiz - Logística',
  'Mercado Livre',
  'Atuação em centro de distribuição com aprendizado em logística e gestão de estoque.',
  'Ensino médio completo. Disponibilidade para trabalho em turnos. Interesse em logística.',
  'Cajamar, SP', 'SP', 'presencial', 'jovem_aprendiz', 'exatas',
  'R$ 1.000 - R$ 1.300', 'https://example.com/jobs/aprendiz-logistica-sp', '2026-11-30'
),
(
  'Estágio em Desenvolvimento Web',
  'TechWave Solutions',
  'Estágio em desenvolvimento front-end com React. Mentoria sênior e ambiente de aprendizado.',
  'Cursando TI ou áreas correlatas. Conhecimento básico de HTML, CSS e JavaScript.',
  'Porto Alegre, RS', 'RS', 'hibrido', 'estagio', 'tecnologia',
  'R$ 1.500 - R$ 2.200', 'https://example.com/jobs/estagio-web-rs', '2026-08-30'
),
(
  'Estágio em Design Gráfico',
  'Studio Visual',
  'Auxiliar na criação de identidade visual, materiais digitais e impressos. Aprendizado com designers sênior.',
  'Cursando Design ou áreas correlatas. Portfólio com trabalhos próprios. Conhecimento de Figma ou Adobe.',
  'Florianópolis, SC', 'SC', 'presencial', 'estagio', 'artes',
  'R$ 1.300 - R$ 1.800', 'https://example.com/jobs/estagio-design-sc', '2026-10-01'
),
(
  'Jovem Aprendiz - Farmácia',
  'Drogasil',
  'Atendimento ao cliente e auxílio em atividades da farmácia. Aprendizado sobre produtos farmacêuticos.',
  'Ensino médio completo. Interesse em área da saúde. Boa comunicação.',
  'Fortaleza, CE', 'CE', 'presencial', 'jovem_aprendiz', 'biologicas',
  'R$ 900 - R$ 1.200', 'https://example.com/jobs/aprendiz-farmacia-ce', '2026-12-15'
),
(
  'Estágio em Contabilidade',
  'Contabilidade Beta',
  'Estágio em departamento contábil com aprendizado em lançamentos e conciliação.',
  'Cursando Ciências Contábeis. Conhecimento básico de Excel. Organização.',
  'Salvador, BA', 'BA', 'presencial', 'estagio', 'exatas',
  'R$ 1.000 - R$ 1.400', 'https://example.com/jobs/estagio-cont-ba', '2026-09-30'
),
(
  'Estágio em Marketing Digital',
  'Agência Digital Norte',
  'Atuação com redes sociais, criação de conteúdo e análise de métricas. Ambiente criativo e dinâmico.',
  'Cursando Marketing, Publicidade ou áreas correlatas. Conhecimento em redes sociais.',
  'Recife, PE', 'PE', 'hibrido', 'estagio', 'humanas',
  'R$ 1.200 - R$ 1.700', 'https://example.com/jobs/estagio-mkt-pe', '2026-08-20'
),
(
  'Jovem Aprendiz - Administrativo',
  'Caixa Econômica Federal',
  'Programa de aprendizagem administrativa em agência bancária. Inclui capacitação e desenvolvimento.',
  'Ensino médio completo. Disponibilidade de 4-6 horas diárias. Desejável informática básica.',
  'Brasília, DF', 'DF', 'presencial', 'jovem_aprendiz', 'humanas',
  'R$ 850 - R$ 1.150', 'https://example.com/jobs/aprendiz-caixa-df', '2026-12-31'
),
(
  'Estágio em Análise de Dados',
  'DataPro Analytics',
  'Estágio em análise de dados com Python e SQL. Aprendizado em BI e visualização de dados.',
  'Cursando TI, Estatística ou áreas correlatas. Conhecimento básico de SQL desejável.',
  'Goiânia, GO', 'GO', 'remoto', 'estagio', 'tecnologia',
  'R$ 1.600 - R$ 2.300', 'https://example.com/jobs/estagio-dados-go', '2026-09-10'
),
(
  'Jovem Aprendiz - Comércio',
  'Magazine Luiza',
  'Atendimento em loja, organização de produtos e aprendizado em vendas. Programa completo de capacitação.',
  'Ensino médio completo. Boa comunicação. Disponibilidade para finais de semana.',
  'Manaus, AM', 'AM', 'presencial', 'jovem_aprendiz', 'humanas',
  'R$ 850 - R$ 1.100', 'https://example.com/jobs/aprendiz-magalu-am', '2026-11-15'
),
(
  'Estágio em Biomedicina',
  'LabLife Diagnósticos',
  'Estágio em laboratório de análises clínicas. Aprendizado em coleta e processamento de amostras.',
  'Cursando Biomedicina, Farmácia ou áreas da saúde. Conhecimento básico de laboratório.',
  'Curitiba, PR', 'PR', 'presencial', 'estagio', 'biologicas',
  'R$ 1.200 - R$ 1.600', 'https://example.com/jobs/estagio-bio-pr', '2026-10-20'
),
(
  'Estágio em Arquitetura',
  'Arquitetura & Design',
  'Auxiliar no desenvolvimento de projetos arquitetônicos e maquetes. Aprendizado com arquitetos experientes.',
  'Cursando Arquitetura e Urbanismo. Conhecimento de AutoCAD ou Revit. Portfólio básico.',
  'São Paulo, SP', 'SP', 'presencial', 'estagio', 'artes',
  'R$ 1.400 - R$ 1.900', 'https://example.com/jobs/estagio-arq-sp', '2026-09-25'
),
(
  'Assistente Administrativo CLT',
  'Grupo Alfa',
  'Atuação em rotina administrativa, controle de documentos e atendimento a clientes.',
  'Ensino médio completo. Experiência com pacote Office. Organização e proatividade.',
  'Porto Alegre, RS', 'RS', 'presencial', 'clt', 'exatas',
  'R$ 1.800 - R$ 2.400', 'https://example.com/jobs/assistente-rs', '2026-08-31'
),
(
  'Estágio em Engenharia Civil',
  'Construtora Horizonte',
  'Estágio em obra e escritório. Acompanhamento de projetos, medições e controle de qualidade.',
  'Cursando Engenharia Civil. Conhecimento de AutoCAD. Disponibilidade para visita a obras.',
  'Salvador, BA', 'BA', 'presencial', 'estagio', 'exatas',
  'R$ 1.500 - R$ 2.000', 'https://example.com/jobs/estagio-civil-ba', '2026-10-31'
),
(
  'Jovem Aprendiz - TI',
  'Instituto Digital',
  'Aprendizagem em suporte técnico, manutenção de computadores e atendimento help desk.',
  'Ensino médio completo. Interesse em TI. Conhecimento básico de informática.',
  'Recife, PE', 'PE', 'presencial', 'jovem_aprendiz', 'tecnologia',
  'R$ 900 - R$ 1.200', 'https://example.com/jobs/aprendiz-ti-pe', '2026-12-20'
);
