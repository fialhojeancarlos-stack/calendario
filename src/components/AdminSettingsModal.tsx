import React, { useState, useEffect } from 'react';
import {
  X,
  Globe,
  Search,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Database,
  Copy,
  Check,
  Calendar,
  Layers,
  Terminal,
  Info,
  Lock,
  FileCode,
  Settings,
  Server,
  Key,
  Users,
} from 'lucide-react';
import { JiraConfig } from '../types';
import {
  discoverJiraFields,
  fetchSupabaseStatus,
  SupabaseStatusResponse,
} from '../services/apiService';
import { UserManagementView } from './UserManagementView';

export type SettingsTab = 'env_status' | 'jira' | 'supabase' | 'users' | 'general';


interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: JiraConfig;
  onConfigSaved: () => void;
  theme?: 'light' | 'dark';
  initialTab?: SettingsTab;
  currentUserProfile?: import('../types').UserProfileRecord | null;
  isReadOnly?: boolean;
  onUserPermissionsUpdated?: () => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigSaved,
  theme = 'light',
  initialTab = 'env_status',
  currentUserProfile,
  isReadOnly = false,
  onUserPermissionsUpdated,
}) => {
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      loadSupabaseInfo();
    }
  }, [isOpen, initialTab]);

  // Fields Discovery State
  const [dueDateFieldId, setDueDateFieldId] = useState(config?.dueDateFieldId || 'customfield_10224');
  const [sprintFieldId, setSprintFieldId] = useState(config?.sprintFieldId || 'customfield_10020');
  const [clientFieldId, setClientFieldId] = useState(config?.clientFieldId || '');

  // Supabase Status State
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatusResponse | null>(null);
  const [isCopiedSql, setIsCopiedSql] = useState(false);
  const [showSqlDrawer, setShowSqlDrawer] = useState(false);

  const [isDiscovering, setIsDiscovering] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSupabaseInfo();
    }
  }, [isOpen]);

  const loadSupabaseInfo = async () => {
    try {
      const data = await fetchSupabaseStatus();
      setSupabaseStatus(data);
    } catch (e) {
      console.warn('Erro ao carregar status do Supabase', e);
    }
  };

  if (!isOpen) return null;

  const handleDiscoverFields = async () => {
    setIsDiscovering(true);
    setStatusMessage(null);

    try {
      const res = await discoverJiraFields();
      if (res.mappings) {
        if (res.mappings.due_date) setDueDateFieldId(res.mappings.due_date);
        if (res.mappings.sprint) setSprintFieldId(res.mappings.sprint);
        if (res.mappings.client) setClientFieldId(res.mappings.client);
      }
      setStatusMessage({
        type: 'success',
        text: 'Descoberta de campos realizada com sucesso! Mapeamentos detectados no Jira.',
      });
      onConfigSaved();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Erro ao realizar descoberta de campos no Jira. Verifique se o JIRA_EMAIL e JIRA_API_TOKEN estão no .env.',
      });
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleCopySql = () => {
    if (supabaseStatus?.sqlSchema) {
      navigator.clipboard.writeText(supabaseStatus.sqlSchema);
      setIsCopiedSql(true);
      setTimeout(() => setIsCopiedSql(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-[95vw] max-w-6xl xl:max-w-7xl rounded-xl bg-[#0d1117] shadow-2xl border border-[#30363d] flex flex-col overflow-hidden max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1e293b] px-6 py-4 bg-[#0a0c10]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>CONFIGURAÇÕES DO SISTEMA</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Gerenciamento de conexões, variáveis <code className="text-emerald-400 font-mono">.env</code> e parâmetros do aplicativo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-[#21262d] hover:text-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab / Submenu Selector */}
        <div className="flex border-b border-[#1e293b] bg-[#161b22] px-6 pt-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              setActiveTab('env_status');
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
              activeTab === 'env_status'
                ? 'border-blue-500 text-blue-400 bg-[#0d1117]/50 rounded-t-md'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="h-4 w-4" />
            <span>Status do .env</span>
            <span
              className={`h-2 w-2 rounded-full ${
                config?.isConfigured && supabaseStatus?.isConnected
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
              }`}
            />
          </button>

          <button
            onClick={() => {
              setActiveTab('jira');
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
              activeTab === 'jira'
                ? 'border-blue-500 text-blue-400 bg-[#0d1117]/50 rounded-t-md'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Jira Cloud</span>
            {config?.isConfigured && (
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('supabase');
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
              activeTab === 'supabase'
                ? 'border-emerald-500 text-emerald-400 bg-[#0d1117]/50 rounded-t-md'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>Supabase DB</span>
            {supabaseStatus?.isConnected && (
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('users');
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
              activeTab === 'users'
                ? 'border-purple-500 text-purple-400 bg-[#0d1117]/50 rounded-t-md'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4 text-purple-400" />
            <span>Usuários & Permissões</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('general');
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
              activeTab === 'general'
                ? 'border-slate-400 text-slate-200 bg-[#0d1117]/50 rounded-t-md'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="h-4 w-4" />
            <span>Geral</span>
          </button>

        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div className="px-6 pt-4">
            <div
              className={`flex items-center gap-2 rounded-md p-3 text-xs font-semibold ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-800'
                  : 'bg-rose-950/60 text-rose-200 border border-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          </div>
        )}

        {/* SUBMENU 1: STATUS DO .ENV */}
        {activeTab === 'env_status' && (
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            <div className="rounded-lg border border-blue-900/50 bg-blue-950/30 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-bold text-blue-300">
                    Diagnóstico de Variáveis do Arquivo .env
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Ambiente Protegido
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                O arquivo <code className="text-emerald-300 font-mono">.env</code> gerencia com segurança as senhas, tokens e chaves privadas do servidor backend, sem expô-los no navegador do usuário.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-amber-400" />
                <span>Variáveis do Jira Cloud (.env)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-md border border-[#30363d] bg-[#161b22] p-3 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">JIRA_HOST / JIRA_URL</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-200 truncate">
                      {config?.host || 'Não informado'}
                    </span>
                    {config?.host ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                    )}
                  </div>
                </div>

                <div className="rounded-md border border-[#30363d] bg-[#161b22] p-3 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">JIRA_EMAIL</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-200 truncate">
                      {config?.email || 'Não informado'}
                    </span>
                    {config?.email ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                    )}
                  </div>
                </div>

                <div className="rounded-md border border-[#30363d] bg-[#161b22] p-3 space-y-1 sm:col-span-2">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">JIRA_API_TOKEN</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-200 truncate">
                      {config?.hasToken ? '•••••••••••••••••••••••• (Oculto por Segurança)' : 'Ausente no .env'}
                    </span>
                    {config?.hasToken ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                        <CheckCircle className="h-4 w-4" /> Configurado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                        <AlertCircle className="h-4 w-4" /> Não informado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-[#1e293b]">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-emerald-400" />
                <span>Variáveis do Supabase DB (.env)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-md border border-[#30363d] bg-[#161b22] p-3 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">SUPABASE_URL</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-200 truncate">
                      {supabaseStatus?.url || 'Não configurada'}
                    </span>
                    {supabaseStatus?.url ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                    )}
                  </div>
                </div>

                <div className="rounded-md border border-[#30363d] bg-[#161b22] p-3 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">SUPABASE_SERVICE_ROLE_KEY</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-200 truncate">
                      {supabaseStatus?.hasKey ? '•••••••••••• (Service Key Configurada)' : 'Não configurada'}
                    </span>
                    {supabaseStatus?.hasKey ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1e293b] flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-[#21262d] hover:bg-[#30363d] text-slate-200 px-5 py-2 text-xs font-semibold transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: JIRA CONFIGURATION STATUS */}
        {activeTab === 'jira' && (
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Environment Security Card */}
            <div className="rounded-lg border border-blue-900/50 bg-blue-950/30 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-bold text-blue-300">
                    Gerenciamento Seguro via Arquivo .env
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    config?.isConfigured
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      config?.isConfigured ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  {config?.isConfigured ? 'Jira Configurado no .env' : 'Pendente de .env'}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Por padrões de segurança, o e-mail, tokens de API e URLs do Jira são consumidos diretamente das variáveis de ambiente do arquivo <code className="text-emerald-300 font-mono">.env</code> do servidor backend.
              </p>
            </div>

            {/* Read-Only Status Fields */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Valores Atuais Carregados do Server (.env)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-md border border-[#30363d] bg-[#161b22] p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Instância Jira (JIRA_BASE_URL)
                  </span>
                  <div className="text-xs font-mono font-semibold text-slate-200 truncate">
                    {config?.baseUrl || 'Não especificada'}
                  </div>
                </div>

                <div className="rounded-md border border-[#30363d] bg-[#161b22] p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    E-mail do Atlassian (JIRA_EMAIL)
                  </span>
                  <div className="text-xs font-mono font-semibold text-slate-200 truncate">
                    {config?.email || 'Não informado no .env'}
                  </div>
                </div>

                <div className="rounded-md border border-[#30363d] bg-[#161b22] p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    API Token (JIRA_API_TOKEN)
                  </span>
                  <div className="text-xs font-mono font-semibold text-slate-200 flex items-center gap-1.5">
                    {config?.hasToken ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">•••••••••••• (Presente)</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-amber-400">Ausente em .env</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="rounded-md border border-[#30363d] bg-[#161b22] p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Data de Entrega (JIRA_DUE_DATE_FIELD_ID)
                  </span>
                  <div className="text-xs font-mono font-semibold text-slate-200 truncate">
                    {dueDateFieldId}
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Field Discovery Utility */}
            <div className="pt-2 border-t border-[#1e293b] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-200">
                    Descoberta Automática de Campos Customizados
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Consulta a API do Jira via credenciais do .env para identificar os IDs de customfields.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDiscoverFields}
                  disabled={isDiscovering || !config?.isConfigured}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#161b22] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-[#21262d] transition-colors disabled:opacity-40 cursor-pointer shrink-0"
                >
                  <Search className={`h-3.5 w-3.5 text-blue-400 ${isDiscovering ? 'animate-spin' : ''}`} />
                  <span>{isDiscovering ? 'Mapeando...' : 'Detectar Campos'}</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-[#0d1117] p-3 rounded-md border border-[#30363d] text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 block">Previsão:</span>
                  <span className="text-emerald-400 font-bold">{dueDateFieldId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Sprint:</span>
                  <span className="text-emerald-400 font-bold">{sprintFieldId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Cliente:</span>
                  <span className="text-emerald-400 font-bold">{clientFieldId || 'Não Mapeado'}</span>
                </div>
              </div>
            </div>

            {/* .env File Reference Helper */}
            <div className="pt-3 border-t border-[#1e293b] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>Exemplo de Configuração no arquivo .env:</span>
              </div>
              <pre className="p-3 bg-[#0a0c10] rounded-md border border-[#30363d] text-[11px] font-mono text-emerald-300/90 overflow-x-auto">
{`JIRA_BASE_URL="https://aztecnologia.atlassian.net"
JIRA_EMAIL="seu-email@aztecnologia.com.br"
JIRA_API_TOKEN="seu_token_api_atlassian"
JIRA_DUE_DATE_FIELD_ID="customfield_10224"
JIRA_SPRINT_FIELD_ID="customfield_10020"
JIRA_CLIENT_FIELD_ID="customfield_10030"`}
              </pre>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-[#1e293b] flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-[#21262d] hover:bg-[#30363d] text-slate-200 px-5 py-2 text-xs font-semibold transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SUPABASE STATUS & SCHEMAS */}
        {activeTab === 'supabase' && (
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Status Info Card */}
            <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100">Status do Banco Supabase (.env)</h3>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    supabaseStatus?.isConnected
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      supabaseStatus?.isConnected ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  {supabaseStatus?.isConnected ? 'Conectado via .env' : 'Aguardando Credenciais em .env'}
                </span>
              </div>

              {/* Read only parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-[#0d1117] rounded-md border border-[#21262d]">
                  <span className="text-slate-400 text-[10px] font-bold block">URL do Projeto (SUPABASE_URL):</span>
                  <span className="font-mono text-slate-200 font-medium truncate block">
                    {supabaseStatus?.url || 'Não informado no .env'}
                  </span>
                </div>
                <div className="p-2.5 bg-[#0d1117] rounded-md border border-[#21262d]">
                  <span className="text-slate-400 text-[10px] font-bold block">Chave de API (SUPABASE_SERVICE_ROLE_KEY):</span>
                  <span className="font-mono text-slate-200 font-medium truncate block">
                    {supabaseStatus?.hasKey ? '•••••••••••• (Configurada)' : 'Não informada no .env'}
                  </span>
                </div>
              </div>

              {/* History Filter Rule */}
              <div className="flex items-start gap-2 text-xs text-slate-300 bg-[#0d1117] p-3 rounded-md border border-[#1e293b]">
                <Calendar className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">
                    Regra de Gravação do Histórico de Chamados
                  </p>
                  <p className="text-slate-400 mt-0.5">
                    Os chamados com <strong>previsão de entrega a partir de 01/07/2026</strong> são salvos automaticamente na tabela <code className="text-emerald-300 font-mono text-[11px]">jira_issues</code> no Supabase.
                  </p>
                </div>
              </div>

              {/* Count Banner */}
              {supabaseStatus?.isConnected && (
                <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-800/60 rounded-md p-3 text-xs">
                  <span className="text-slate-300">Total de chamados persistidos no Supabase:</span>
                  <span className="text-base font-bold text-emerald-400">
                    {supabaseStatus.persistedIssueCount} chamados
                  </span>
                </div>
              )}
            </div>

            {/* SQL Table Creation Helper */}
            <div className="pt-2 border-t border-[#1e293b] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-bold text-slate-200">
                    Script SQL para Criar Tabelas no Supabase
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSqlDrawer(!showSqlDrawer)}
                    className="text-xs text-blue-400 hover:underline cursor-pointer"
                  >
                    {showSqlDrawer ? 'Ocultar SQL' : 'Ver SQL'}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#161b22] px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-[#21262d] transition-colors cursor-pointer"
                  >
                    {isCopiedSql ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-slate-400" />
                        <span>Copiar SQL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {showSqlDrawer && (
                <div className="relative">
                  <pre className="p-3 bg-[#0d1117] rounded-md border border-[#30363d] text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-48 scrollbar-thin">
                    {supabaseStatus?.sqlSchema}
                  </pre>
                </div>
              )}
            </div>

            {/* .env Supabase Example */}
            <div className="pt-2 border-t border-[#1e293b] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>Exemplo de Configuração do Supabase em .env:</span>
              </div>
              <pre className="p-3 bg-[#0a0c10] rounded-md border border-[#30363d] text-[11px] font-mono text-emerald-300/90 overflow-x-auto">
{`SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_ANON_KEY="sua_chave_anon_supabase"
SUPABASE_SERVICE_ROLE_KEY="sua_chave_service_role_supabase"`}
              </pre>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-[#1e293b] flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-[#21262d] hover:bg-[#30363d] text-slate-200 px-5 py-2 text-xs font-semibold transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* SUBMENU: GESTÃO DE USUÁRIOS E PERMISSIONAMENTO */}
        {activeTab === 'users' && (
          <div className="p-6 max-h-[75vh] overflow-y-auto">
            <UserManagementView
              theme={theme}
              currentUserProfile={currentUserProfile}
              isReadOnly={isReadOnly}
              onUserPermissionsUpdated={onUserPermissionsUpdated}
            />
          </div>
        )}

        {/* SUBMENU 4: GERAL & INFORMAÇÕES DO SISTEMA */}
        {activeTab === 'general' && (

          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            <div className="rounded-lg border border-[#30363d] bg-[#161b22] p-4 space-y-3">
              <div className="flex items-center gap-2 text-slate-200 text-xs font-bold">
                <Info className="h-4 w-4 text-blue-400" />
                <span>Informações do Sistema e Aplicação</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Painel de gestão de entregas sincronizado em tempo real com a API oficial da Atlassian Jira e banco de dados PostgreSQL/Supabase.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Parâmetros do Servidor
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#0d1117] rounded-md border border-[#21262d]">
                  <span className="text-slate-400 text-[10px] block">Versão do App (.env):</span>
                  <span className="font-semibold text-slate-200">
                    Versão: {import.meta.env.VITE_APP_VERSION || import.meta.env.VITE_SYSTEM_VERSION || '1.0.0'}
                  </span>
                </div>
                <div className="p-3 bg-[#0d1117] rounded-md border border-[#21262d]">
                  <span className="text-slate-400 text-[10px] block">Ambiente Node.js:</span>
                  <span className="font-semibold text-emerald-400">Cloud Run Server</span>
                </div>
                <div className="p-3 bg-[#0d1117] rounded-md border border-[#21262d]">
                  <span className="text-slate-400 text-[10px] block">Sincronização Automática:</span>
                  <span className="font-semibold text-blue-400">Ativa (A cada atualização)</span>
                </div>
                <div className="p-3 bg-[#0d1117] rounded-md border border-[#21262d]">
                  <span className="text-slate-400 text-[10px] block">Filtro de Histórico:</span>
                  <span className="font-semibold text-slate-200">Previsões &ge; 01/07/2026</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1e293b] flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-[#21262d] hover:bg-[#30363d] text-slate-200 px-5 py-2 text-xs font-semibold transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
