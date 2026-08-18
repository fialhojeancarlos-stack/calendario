/**
 * Types and Interfaces for Jira Delivery Calendar
 */

export type CalendarViewMode = 'month' | 'week' | 'day';

export interface JiraProject {
  key: string;        // e.g., 'PAT30'
  name: string;       // e.g., 'Patrimônio Mobiliário'
  active: boolean;
}

export interface JiraAssignee {
  accountId?: string;
  displayName: string;
  avatarUrl?: string;
}

export interface JiraIssue {
  issue_key: string;       // e.g., 'PAT30-1234'
  issue_id?: string;
  summary: string;
  issue_type: 'História' | 'Solicitação de Melhoria' | 'Story' | string;
  status: string;
  status_category: 'To Do' | 'In Progress' | 'Done' | string;
  assignee_name?: string;
  assignee_avatar?: string;
  project_key: string;
  project_name: string;    // Display name (never key)
  client?: string;
  sprint_id?: string;
  sprint_name?: string;
  due_date: string;        // YYYY-MM-DD from customfield_10224
  created_at_jira?: string; // YYYY-MM-DD or ISO string from Jira created field
  url: string;             // https://aztecnologia.atlassian.net/browse/{issue_key}
  raw?: Record<string, unknown>;
  synced_at?: string;
}

export interface FilterState {
  projects: string[];  // Project keys
  clients: string[];   // Client names
  sprints: string[];   // Sprint names
  viewMode: CalendarViewMode;
  searchQuery?: string;
}

export interface FieldMapping {
  logical_name: 'due_date' | 'sprint' | 'client';
  field_id: string;
  updated_at?: string;
}

export interface SyncLog {
  id?: number;
  started_at: string;
  finished_at?: string;
  range_start: string;
  range_end: string;
  pages_fetched: number;
  issues_fetched: number;
  status: 'success' | 'partial' | 'error';
  error_message?: string;
}

export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  isConfigured: boolean;
  dueDateFieldId: string;   // default customfield_10224
  sprintFieldId: string;    // default customfield_10020
  clientFieldId?: string;   // customfield ID or auto-discovered
  isDemoMode: boolean;
  lastSyncTimestamp?: string | null;
}

export interface CalendarDay {
  date: Date;
  dateString: string;       // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  issues: JiraIssue[];
}

export interface CalendarWeek {
  days: CalendarDay[];
}

export type UserRole = 'ADMINISTRADOR' | 'GESTOR' | 'VISUALIZADOR';

export type SystemScopeCode = 'menu_dashboard' | 'menu_eventos' | 'menu_relatorios' | 'menu_configuracoes';

export interface SystemScope {
  id?: string;
  nome_escopo: SystemScopeCode | string;
  descricao: string;
  rotulo: string;
}

export interface UserProfileRecord {
  id: string;
  nome: string;
  email: string;
  perfil: UserRole;
  status: 'ATIVO' | 'INATIVO';
  created_at?: string;
  updated_at?: string;
  escopos: string[];
}

