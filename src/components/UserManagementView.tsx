import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Eye,
  Key,
  CheckCircle,
  AlertCircle,
  Search,
  Plus,
  Copy,
  Check,
  FileCode,
  X,
  Lock,
  Layers,
  Calendar,
  ListFilter,
  Settings,
  Database,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { UserProfileRecord, UserRole } from '../types';
import {
  fetchUsersList,
  updateUserPermissions,
  createNewUser,
  fetchUsersSqlScripts,
} from '../services/apiService';

const SYSTEM_SCOPES = [
  {
    code: 'menu_dashboard',
    label: 'Dashboard Calendário',
    description: 'Calendário de Previsões e Entregas do Jira',
    icon: Calendar,
  },
  {
    code: 'menu_eventos',
    label: 'Épicos & Melhorias',
    description: 'Gestão e Triagem de Épicos sem data prevista',
    icon: Layers,
  },
  {
    code: 'menu_relatorios',
    label: 'Lista & Relatórios',
    description: 'Visualização tabular de entregas e exportação',
    icon: ListFilter,
  },
  {
    code: 'menu_configuracoes',
    label: 'Configurações',
    description: 'Gestão de conexões, .env, banco e permissões de usuários',
    icon: Settings,
  },
];

interface UserManagementViewProps {
  theme?: 'light' | 'dark';
  currentUserProfile?: UserProfileRecord | null;
  isReadOnly?: boolean;
  onUserPermissionsUpdated?: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  theme = 'light',
  currentUserProfile,
  isReadOnly = false,
  onUserPermissionsUpdated,
}) => {
  const [users, setUsers] = useState<UserProfileRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [dataSource, setDataSource] = useState<string>('local');
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  // Edit Permissions Modal State
  const [selectedUser, setSelectedUser] = useState<UserProfileRecord | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('VISUALIZADOR');
  const [editScopes, setEditScopes] = useState<string[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New User Modal State
  const [isNewUserOpen, setIsNewUserOpen] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('VISUALIZADOR');
  const [newUserScopes, setNewUserScopes] = useState<string[]>(['menu_dashboard']);

  // SQL Script Viewer Modal
  const [isSqlModalOpen, setIsSqlModalOpen] = useState<boolean>(false);
  const [sqlScripts, setSqlScripts] = useState<string>('');
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Fetch Users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchUsersList();
      setUsers(res.users);
      setDataSource(res.source);
      if (res.warning) {
        setWarningMsg(res.warning);
      } else {
        setWarningMsg(null);
      }
    } catch (err: any) {
      console.warn('Erro ao carregar usuários:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Open Edit Modal
  const handleOpenEditModal = (user: UserProfileRecord) => {
    setSelectedUser(user);
    setEditRole(user.perfil);
    if (user.perfil === 'ADMINISTRADOR') {
      setEditScopes(SYSTEM_SCOPES.map((s) => s.code));
    } else {
      setEditScopes(user.escopos || ['menu_dashboard']);
    }
    setStatusMessage(null);
  };

  // Handle Role Change in Edit Modal
  const handleRoleChange = (newRole: UserRole) => {
    setEditRole(newRole);
    if (newRole === 'ADMINISTRADOR') {
      // Rule 4: If ADMINISTRADOR is selected, automatically check and disable all scopes
      setEditScopes(SYSTEM_SCOPES.map((s) => s.code));
    } else if (editScopes.length === 0) {
      setEditScopes(['menu_dashboard']);
    }
  };

  // Toggle Scope in Edit Modal
  const handleToggleScope = (code: string) => {
    if (editRole === 'ADMINISTRADOR') return; // Disabled for admin
    if (editScopes.includes(code)) {
      setEditScopes(editScopes.filter((c) => c !== code));
    } else {
      setEditScopes([...editScopes, code]);
    }
  };

  // Save Permission Changes
  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await updateUserPermissions(
        selectedUser.id,
        editRole,
        editRole === 'ADMINISTRADOR' ? SYSTEM_SCOPES.map((s) => s.code) : editScopes,
        selectedUser.email
      );

      setStatusMessage({ type: 'success', text: res.message || 'Permissões atualizadas com sucesso!' });
      
      // Update local list
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                perfil: editRole,
                escopos: editRole === 'ADMINISTRADOR' ? SYSTEM_SCOPES.map((s) => s.code) : editScopes,
                updated_at: new Date().toISOString(),
              }
            : u
        )
      );

      // Trigger global profile refetch
      if (onUserPermissionsUpdated) {
        onUserPermissionsUpdated();
      }

      setTimeout(() => {
        setSelectedUser(null);
        setStatusMessage(null);
      }, 1200);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Erro ao salvar permissões.' });
    } finally {
      setSaving(false);
    }
  };

  // Create New User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    setSaving(true);
    try {
      const res = await createNewUser({
        nome: newUserName,
        email: newUserEmail,
        perfil: newUserRole,
        escopos: newUserRole === 'ADMINISTRADOR' ? SYSTEM_SCOPES.map((s) => s.code) : newUserScopes,
      });

      setUsers((prev) => [...prev, res.user]);
      if (onUserPermissionsUpdated) {
        onUserPermissionsUpdated();
      }
      setIsNewUserOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('VISUALIZADOR');
      setNewUserScopes(['menu_dashboard']);
    } catch (err: any) {
      alert(err.message || 'Erro ao cadastrar usuário');
    } finally {
      setSaving(false);
    }
  };

  // Load and Show SQL Modal
  const handleOpenSqlModal = async () => {
    try {
      const res = await fetchUsersSqlScripts();
      setSqlScripts(res.sql);
      setIsSqlModalOpen(true);
    } catch (err: any) {
      alert('Erro ao carregar os scripts SQL.');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScripts);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.perfil === roleFilter;
    return matchesSearch && matchesRole;
  });

  const effectiveReadOnly = isReadOnly || currentUserProfile?.perfil === 'VISUALIZADOR';

  return (
    <div className="space-y-5">
      {/* Read Only Warning Banner */}
      {effectiveReadOnly && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              <strong>Perfil VISUALIZADOR (Somente Leitura):</strong> Você possui permissão para visualizar a lista de usuários. Apenas Administradores podem alterar escopos ou cadastrar novos usuários.
            </span>
          </div>
        </div>
      )}

      {/* Top Banner / Description */}
      <div className="rounded-lg border border-blue-900/40 bg-blue-950/20 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0 mt-0.5">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-100">
                GESTÃO DE USUÁRIOS E PERMISSIONAMENTO
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                {dataSource === 'supabase' ? 'Supabase DB Conectado' : 'Modo Integrado / Local'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Gerenciamento de Perfis de Acesso (<code className="text-purple-400 font-mono">ADMINISTRADOR</code>, <code className="text-blue-400 font-mono">GESTOR</code>, <code className="text-slate-300 font-mono">VISUALIZADOR</code>) e atribuição granular de Escopos aos Menus do Sistema.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleOpenSqlModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#21262d] hover:bg-[#30363d] text-slate-200 text-xs font-semibold border border-[#30363d] transition-colors cursor-pointer"
          >
            <FileCode className="h-3.5 w-3.5 text-emerald-400" />
            <span>Scripts SQL (Supabase)</span>
          </button>

          <button
            type="button"
            disabled={effectiveReadOnly}
            onClick={() => setIsNewUserOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
            title={effectiveReadOnly ? 'Apenas Administradores podem cadastrar novos usuários' : 'Cadastrar novo usuário'}
          >
            <Plus className="h-4 w-4" />
            <span>Novo Usuário</span>
          </button>
        </div>
      </div>

      {dataSource !== 'supabase' && (
        <div className="rounded-md border border-amber-800/60 bg-amber-950/40 p-3 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block text-amber-300">Atenção: Operando em Modo Local (Contingência)</span>
            <p className="text-[11px] text-amber-200/80 mt-0.5">
              {warningMsg || 'A conexão com a tabela TB.CALENDARIO_USUARIOS do Supabase não pôde ser estabelecida. Os usuários e IDs exibidos abaixo são fictícios de demonstração.'}
            </p>
          </div>
          <button
            type="button"
            onClick={loadUsers}
            className="px-2 py-1 bg-amber-900/50 hover:bg-amber-800/60 text-amber-100 rounded text-[11px] font-medium border border-amber-700/50 cursor-pointer shrink-0"
          >
            Reverificar Conexão
          </button>
        </div>
      )}

      {/* Search & Role Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#161b22] p-3 rounded-lg border border-[#30363d]">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-[#30363d] bg-[#0d1117] pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-[11px] text-slate-400 font-medium shrink-0">Filtrar por Perfil:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Todos os Perfis ({users.length})</option>
            <option value="ADMINISTRADOR">ADMINISTRADOR</option>
            <option value="GESTOR">GESTOR</option>
            <option value="VISUALIZADOR">VISUALIZADOR</option>
          </select>

          <button
            type="button"
            onClick={loadUsers}
            title="Recarregar Lista"
            className="p-1.5 rounded-md border border-[#30363d] bg-[#0d1117] hover:bg-[#21262d] text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-[#30363d] bg-[#161b22] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px] lg:min-w-full">
            <thead>
              <tr className="border-b border-[#30363d] bg-[#0d1117]/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-3.5 py-2.5 w-[22%]">Usuário</th>
                <th className="px-3.5 py-2.5 w-[22%]">E-mail</th>
                <th className="px-3.5 py-2.5 w-[16%]">Perfil Atribuído</th>
                <th className="px-3.5 py-2.5 w-[24%]">Menus / Escopos Ativos</th>
                <th className="px-3.5 py-2.5 w-[8%]">Status</th>
                <th className="px-3.5 py-2.5 w-[8%] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span>Carregando lista de usuários...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Nenhum usuário encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isAdmin = user.perfil === 'ADMINISTRADOR';
                  const isGestor = user.perfil === 'GESTOR';

                  return (
                    <tr key={user.id} className="hover:bg-[#1c2128] transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-3.5 py-2.5 font-semibold text-slate-200">
                        <div className="flex items-center gap-2">
                          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                            isAdmin ? 'bg-purple-600' : isGestor ? 'bg-blue-600' : 'bg-slate-600'
                          }`}>
                            {user.nome.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="block text-xs font-bold text-slate-200 truncate">{user.nome}</span>
                            <span className="text-[10px] text-slate-500 font-mono block truncate max-w-[180px]" title={user.id}>
                              ID: {user.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-3.5 py-2.5 font-mono text-slate-300">
                        <span className="block truncate max-w-[200px]" title={user.email}>
                          {user.email}
                        </span>
                      </td>

                      {/* Role Badge */}
                      <td className="px-3.5 py-2.5">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold bg-purple-950 text-purple-300 border border-purple-800 whitespace-nowrap">
                            <ShieldCheck className="h-3 w-3 text-purple-400 shrink-0" />
                            ADMINISTRADOR
                          </span>
                        ) : isGestor ? (
                          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold bg-blue-950 text-blue-300 border border-blue-800 whitespace-nowrap">
                            <UserCheck className="h-3 w-3 text-blue-400 shrink-0" />
                            GESTOR
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">
                            <Eye className="h-3 w-3 text-slate-400 shrink-0" />
                            VISUALIZADOR
                          </span>
                        )}
                      </td>

                      {/* Scope Badges */}
                      <td className="px-3.5 py-2.5">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800 whitespace-nowrap">
                            <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0" />
                            Acesso Irrestrito (Todos os Escopos)
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {SYSTEM_SCOPES.map((scope) => {
                              const hasScope = user.escopos?.includes(scope.code);
                              if (!hasScope) return null;
                              const ScopeIcon = scope.icon;
                              return (
                                <span
                                  key={scope.code}
                                  title={scope.description}
                                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium bg-[#0d1117] text-slate-300 border border-[#30363d] whitespace-nowrap"
                                >
                                  <ScopeIcon className="h-3 w-3 text-blue-400 shrink-0" />
                                  <span>{scope.label.split(' ')[0]}</span>
                                </span>
                              );
                            })}
                            {(!user.escopos || user.escopos.length === 0) && (
                              <span className="text-[10px] text-amber-400 font-mono">Sem escopos atribuídos</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-3.5 py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 whitespace-nowrap">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                          ATIVO
                        </span>
                      </td>

                      {/* Action Button */}
                      <td className="px-3.5 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(user)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-[#21262d] hover:bg-blue-600 text-slate-200 hover:text-white px-2.5 py-1.5 text-xs font-semibold transition-colors border border-[#30363d] cursor-pointer whitespace-nowrap"
                        >
                          <Key className="h-3.5 w-3.5 shrink-0" />
                          <span>Editar Permissões</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE EDIÇÃO DE PERMISSÕES */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#30363d] bg-[#0d1117] shadow-2xl overflow-hidden animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#21262d] bg-[#161b22] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Editar Permissões do Usuário</h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedUser.nome} • <span className="text-slate-300 font-mono">{selectedUser.email}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#21262d] hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {statusMessage && (
                <div className={`p-3 rounded-md text-xs flex items-center gap-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                }`}>
                  {statusMessage.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* 1. SELEÇÃO DE PERFIL DE ACESSO */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                  1. Seleção do Perfil de Acesso (Role)
                </label>
                <select
                  value={editRole}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full rounded-md border border-[#30363d] bg-[#161b22] px-3 py-2 text-xs text-slate-200 font-semibold focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="ADMINISTRADOR">ADMINISTRADOR — Acesso Total e Irrestrito</option>
                  <option value="GESTOR">GESTOR — Acesso Granular baseado nos Escopos</option>
                  <option value="VISUALIZADOR">VISUALIZADOR — Acesso Somente Leitura nos Escopos</option>
                </select>

                <p className="text-[11px] text-slate-400 leading-relaxed bg-[#161b22] p-2.5 rounded-md border border-[#21262d]">
                  {editRole === 'ADMINISTRADOR' && (
                    <span className="text-purple-300 font-medium">
                      ⚡ <strong>ADMINISTRADOR:</strong> O sistema ignora a checagem de escopos e libera acesso ilimitado a todas as telas, relatórios e menus de configurações.
                    </span>
                  )}
                  {editRole === 'GESTOR' && (
                    <span className="text-blue-300 font-medium">
                      🛠️ <strong>GESTOR:</strong> Permite criar, editar e interagir com as telas selecionadas abaixo.
                    </span>
                  )}
                  {editRole === 'VISUALIZADOR' && (
                    <span className="text-slate-300 font-medium">
                      👁️ <strong>VISUALIZADOR:</strong> Permite apenas consulta e visualização de dados nos menus marcados abaixo.
                    </span>
                  )}
                </p>
              </div>

              {/* 2. CHECKBOXES DE ESCOPOS DOS MENUS DO SISTEMA */}
              <div className="space-y-2.5 pt-2 border-t border-[#21262d]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                    2. Escopos de Acesso (Menus do Sistema)
                  </label>
                  {editRole === 'ADMINISTRADOR' && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      Todos Ativados (Admin)
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {SYSTEM_SCOPES.map((scope) => {
                    const ScopeIcon = scope.icon;
                    const isChecked = editRole === 'ADMINISTRADOR' || editScopes.includes(scope.code);
                    const isDisabled = editRole === 'ADMINISTRADOR';

                    return (
                      <label
                        key={scope.code}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                          isDisabled
                            ? 'bg-[#161b22]/60 border-[#21262d] opacity-80 cursor-not-allowed'
                            : isChecked
                            ? 'bg-blue-950/30 border-blue-800/60'
                            : 'bg-[#161b22] border-[#30363d] hover:border-slate-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => handleToggleScope(scope.code)}
                          className="mt-0.5 h-4 w-4 rounded border-[#30363d] bg-[#0d1117] text-blue-600 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <ScopeIcon className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                            <span className="text-xs font-bold text-slate-200">{scope.label}</span>
                            <span className="text-[10px] text-slate-500 font-mono">({scope.code})</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{scope.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 border-t border-[#21262d] bg-[#161b22] px-6 py-3">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-md bg-[#21262d] hover:bg-[#30363d] text-slate-300 px-4 py-2 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSavePermissions}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 text-xs font-bold transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Salvar Permissões</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO USUÁRIO */}
      {isNewUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateUser}
            className="w-full max-w-md rounded-xl border border-[#30363d] bg-[#0d1117] shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-[#21262d] bg-[#161b22] px-6 py-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                <h3 className="text-sm font-bold text-slate-100">Cadastrar Novo Usuário</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewUserOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#21262d] text-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Roberto Alves"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full rounded-md border border-[#30363d] bg-[#161b22] px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  placeholder="roberto.alves@azi.com.br"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full rounded-md border border-[#30363d] bg-[#161b22] px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Perfil Inicial</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full rounded-md border border-[#30363d] bg-[#161b22] px-3 py-2 text-xs text-slate-200 font-semibold focus:border-blue-500 focus:outline-none"
                >
                  <option value="VISUALIZADOR">VISUALIZADOR</option>
                  <option value="GESTOR">GESTOR</option>
                  <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#21262d] bg-[#161b22] px-6 py-3">
              <button
                type="button"
                onClick={() => setIsNewUserOpen(false)}
                className="rounded-md bg-[#21262d] hover:bg-[#30363d] text-slate-300 px-4 py-2 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 text-xs font-bold shadow-sm"
              >
                Cadastrar Usuário
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: SCRIPTS SQL DO SUPABASE */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-xl border border-[#30363d] bg-[#0d1117] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#21262d] bg-[#161b22] px-6 py-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Scripts SQL de Migração (Supabase DB)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSqlModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#21262d] text-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <p className="text-xs text-slate-300">
                Execute os scripts abaixo no <strong>SQL Editor do Supabase</strong> para criar as tabelas com prefixo <code className="text-emerald-400 font-mono">TB.CALENDARIO_</code>, migrar usuários e configurar o trigger automático:
              </p>

              <div className="relative">
                <pre className="max-h-80 overflow-y-auto rounded-lg border border-[#30363d] bg-[#06080b] p-4 font-mono text-[11px] text-emerald-300 leading-relaxed scrollbar-thin">
                  {sqlScripts}
                </pre>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="absolute top-3 right-3 flex items-center gap-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] px-3 py-1.5 text-xs font-bold text-slate-200 border border-[#30363d] transition-colors cursor-pointer shadow-sm"
                >
                  {copiedSql ? (
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

            <div className="flex items-center justify-end border-t border-[#21262d] bg-[#161b22] px-6 py-3">
              <button
                type="button"
                onClick={() => setIsSqlModalOpen(false)}
                className="rounded-md bg-[#21262d] hover:bg-[#30363d] text-slate-300 px-5 py-2 text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
