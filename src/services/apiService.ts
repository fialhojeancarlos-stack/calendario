import { JiraIssue, JiraProject, JiraConfig, FieldMapping, SyncLog } from '../types';
import { supabase, configureSupabase, getSupabase } from './supabaseClient';

export { supabase, configureSupabase, getSupabase };


export interface SyncApiResponse {
  success: boolean;
  issuesFetched: number;
  pagesFetched: number;
  status: 'success' | 'partial' | 'error';
  warning?: string;
  data?: JiraIssue[];
  error?: string;
}

export async function fetchJiraIssues(rangeStart: string, rangeEnd: string, projectKeys: string[] = []): Promise<JiraIssue[]> {
  let url = `/api/jira/issues?start=${encodeURIComponent(rangeStart)}&end=${encodeURIComponent(rangeEnd)}`;
  if (projectKeys.length > 0) {
    url += `&projects=${encodeURIComponent(projectKeys.join(','))}`;
  }
  const res = await fetch(url);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Erro ao carregar chamados (${res.status})`);
  }
  const data = await res.json();
  return data.issues || [];
}

export async function fetchJiraProjects(): Promise<JiraProject[]> {
  const res = await fetch('/api/jira/projects');
  if (!res.ok) return [];
  const data = await res.json();
  return data.projects || [];
}

export async function syncJiraIssues(
  rangeStart: string,
  rangeEnd: string,
  projectKeys: string[] = [],
  forceRefresh = false
): Promise<SyncApiResponse> {
  const res = await fetch('/api/jira/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rangeStart, rangeEnd, projectKeys, forceRefresh }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Erro ao sincronizar com o Jira (${res.status})`);
  }
  return data;
}

export async function fetchJiraConfig(): Promise<JiraConfig> {
  const res = await fetch('/api/jira/config');
  if (!res.ok) {
    return {
      baseUrl: 'https://aztecnologia.atlassian.net',
      email: '',
      apiToken: '',
      isConfigured: false,
      dueDateFieldId: 'customfield_10224',
      sprintFieldId: 'customfield_10020',
      isDemoMode: true,
    };
  }
  return await res.json();
}

export async function saveJiraConfig(config: Partial<JiraConfig>): Promise<{ success: boolean; config: JiraConfig }> {
  const res = await fetch('/api/jira/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha ao salvar configurações do Jira');
  }
  return await res.json();
}

export async function discoverJiraFields(): Promise<{ mappings: Record<string, string> }> {
  const res = await fetch('/api/jira/discover-fields', { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha na descoberta automática de campos do Jira');
  }
  return await res.json();
}

export interface SupabaseStatusResponse {
  url: string;
  hasKey: boolean;
  isConnected: boolean;
  cutoffDate: string;
  persistedIssueCount: number;
  sqlSchema: string;
  lastError?: string;
}

export async function fetchSupabaseStatus(): Promise<SupabaseStatusResponse> {
  const res = await fetch('/api/supabase/status');
  if (!res.ok) {
    return {
      url: '',
      hasKey: false,
      isConnected: false,
      cutoffDate: '2026-07-01',
      persistedIssueCount: 0,
      sqlSchema: '',
    };
  }
  return await res.json();
}

export async function saveSupabaseConfig(supabaseUrl: string, supabaseKey: string) {
  const res = await fetch('/api/supabase/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ supabaseUrl, supabaseKey }),
  });
  if (!res.ok) {
    throw new Error('Falha ao salvar configurações do Supabase');
  }
  return await res.json();
}

export async function fetchUnscheduledEpics(): Promise<{
  success: boolean;
  data: JiraIssue[];
  lastSyncTimestamp: string | null;
  isDemoMode: boolean;
}> {
  const res = await fetch('/api/jira/unscheduled-epics');
  if (!res.ok) {
    throw new Error('Falha ao carregar Épicos e Melhorias sem data.');
  }
  return await res.json();
}

export async function syncUnscheduledEpics(): Promise<{
  success: boolean;
  data: JiraIssue[];
  lastSyncTimestamp: string;
  isDemoMode: boolean;
  warning?: string;
}> {
  const res = await fetch('/api/jira/sync-unscheduled-epics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha ao sincronizar Épicos e Melhorias.');
  }
  return await res.json();
}

export async function fetchUsersList(): Promise<{ users: import('../types').UserProfileRecord[]; source: string; warning?: string }> {
  const res = await fetch('/api/users');
  if (!res.ok) {
    throw new Error('Falha ao carregar lista de usuários');
  }
  return await res.json();
}

export async function updateUserPermissions(
  userId: string,
  perfil: 'ADMINISTRADOR' | 'GESTOR' | 'VISUALIZADOR',
  escopos: string[],
  email?: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/users/${userId}/permissions`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ perfil, escopos, email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha ao atualizar permissões do usuário');
  }
  return await res.json();
}

export async function createNewUser(userData: {
  nome: string;
  email: string;
  perfil: 'ADMINISTRADOR' | 'GESTOR' | 'VISUALIZADOR';
  escopos: string[];
}): Promise<{ success: boolean; user: import('../types').UserProfileRecord }> {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha ao criar usuário');
  }
  return await res.json();
}

export async function fetchUsersSqlScripts(): Promise<{ sql: string }> {
  const res = await fetch('/api/users/sql-scripts');
  if (!res.ok) {
    throw new Error('Falha ao obter scripts SQL do Supabase');
  }
  return await res.json();
}

export async function resolveEpicSprintsAPI(): Promise<{ success: boolean; message: string; data: any }> {
  const res = await fetch('/api/jira/resolve-epic-sprints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao executar o serviço de validação de Sprints para Épicos.');
  }
  return await res.json();
}

export async function fetchIssueStoriesAPI(issueKey: string): Promise<{
  success: boolean;
  epic_key: string;
  storiesCount: number;
  stories: Array<{
    issue_key: string;
    epic_key: string;
    summary: string;
    issue_type: string;
    status: string;
    status_category?: string;
    assignee_name?: string;
    url?: string;
  }>;
}> {
  const res = await fetch(`/api/jira/issue-stories/${encodeURIComponent(issueKey)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha ao buscar histórias vinculadas ao chamado.');
  }
  return await res.json();
}


