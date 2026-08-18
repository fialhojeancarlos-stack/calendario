-- ============================================================
-- SCRIPT SQL PARA CRIAÇÃO DA TABELA DE ÉPICOS E MELHORIAS
-- BANCO DE DADOS: PostgreSQL / Supabase
-- TABELA: public.jira_epics_unscheduled
-- ============================================================

-- 1. Criação da tabela com a Chave Única (issue_key) como PRIMARY KEY
CREATE TABLE IF NOT EXISTS public.jira_epics_unscheduled (
    issue_key TEXT PRIMARY KEY,
    issue_id TEXT,
    issue_type TEXT NOT NULL,
    summary TEXT NOT NULL,
    project_key TEXT,
    project_name TEXT NOT NULL,
    client TEXT,
    status TEXT NOT NULL,
    status_category TEXT,
    assignee_name TEXT,
    assignee_avatar TEXT,
    created_at_jira DATE,
    url TEXT,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índices de performance para otimização de consultas e relatórios
CREATE INDEX IF NOT EXISTS idx_jira_epics_unscheduled_issue_type ON public.jira_epics_unscheduled(issue_type);
CREATE INDEX IF NOT EXISTS idx_jira_epics_unscheduled_project_name ON public.jira_epics_unscheduled(project_name);
CREATE INDEX IF NOT EXISTS idx_jira_epics_unscheduled_created_at ON public.jira_epics_unscheduled(created_at_jira);

-- 3. Políticas RLS (Row Level Security) - opcional para leitura e gravação
ALTER TABLE public.jira_epics_unscheduled ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública em jira_epics_unscheduled" 
ON public.jira_epics_unscheduled FOR SELECT USING (true);

CREATE POLICY "Permitir inserção/atualização em jira_epics_unscheduled" 
ON public.jira_epics_unscheduled FOR ALL USING (true) WITH CHECK (true);
