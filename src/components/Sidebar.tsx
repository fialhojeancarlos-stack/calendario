import React, { useState } from 'react';
import {
  Calendar,
  ListFilter,
  RefreshCw,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Layers,
  CheckCircle2,
  Clock,
  Sun,
  Moon,
  ExternalLink,
  LogOut,
  UserCheck,
  FileCode,
  Globe,
  Database,
  Server,
  Users,
} from 'lucide-react';

import { UserProfileRecord } from '../types';
import { SettingsTab } from './AdminSettingsModal';

export type SidebarTab = 'calendar' | 'list' | 'epics' | 'settings';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  totalIssuesCount: number;
  todayIssuesCount: number;
  onSync: () => void;
  isSyncing: boolean;
  onOpenSettings: (tab?: SettingsTab) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  isDemoMode?: boolean;
  userEmail?: string | null;
  userProfile?: UserProfileRecord | null;
  hasScope?: (scopeCode: string) => boolean;
  isReadOnly?: boolean;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  onToggleCollapse,
  onCloseMobile,
  activeTab,
  onSelectTab,
  totalIssuesCount,
  todayIssuesCount,
  onSync,
  isSyncing,
  onOpenSettings,
  theme = 'light',
  onToggleTheme,
  isDemoMode = false,
  userEmail,
  userProfile,
  hasScope,
  isReadOnly = false,
  onLogout,
}) => {
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(true);
  const isLight = theme === 'light';
  const appVersion = import.meta.env.VITE_APP_VERSION || import.meta.env.VITE_SYSTEM_VERSION || '1.0.0';

  const checkScope = (scopeCode: string) => {
    if (!hasScope) return true;
    return hasScope(scopeCode);
  };

  const rawMenuItems = [
    {
      id: 'calendar' as SidebarTab,
      label: 'Calendário',
      icon: Calendar,
      scope: 'menu_dashboard',
      badge: totalIssuesCount > 0 ? totalIssuesCount : undefined,
    },
    {
      id: 'list' as SidebarTab,
      label: 'Entregas em Lista',
      icon: ListFilter,
      scope: 'menu_relatorios',
    },
    {
      id: 'epics' as SidebarTab,
      label: 'Épicos & Melhorias',
      icon: Layers,
      scope: 'menu_eventos',
    },
  ];

  // Filter menu items strictly by active scope
  const menuItems = rawMenuItems.filter((item) => checkScope(item.scope));

  const canAccessSettings = checkScope('menu_configuracoes');

  const settingsSubItems: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'env_status', label: 'Status do .env', icon: FileCode },
    { id: 'jira', label: 'Jira Cloud', icon: Globe },
    { id: 'supabase', label: 'Supabase DB', icon: Database },
    { id: 'users', label: 'Usuários & Permissões', icon: Users },
    { id: 'general', label: 'Geral', icon: Server },
  ];


  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-300 ease-in-out shrink-0 select-none ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0d1117] border-[#1e293b] text-slate-200'
        } ${
          // Mobile visibility
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${
          // Desktop collapsed width vs expanded width
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Header / Brand Section */}
        <div
          className={`flex items-center justify-between px-3.5 py-4 border-b ${
            isLight ? 'border-slate-200' : 'border-[#1e293b]'
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-sm">
              <Calendar className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className={`text-sm font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Jira Entregas
                </span>
                <span className={`text-[10px] font-medium truncate ${isLight ? 'text-slate-500' : 'text-slate-200'}`}>
                  AZ Tecnologia
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Desktop Collapse / Expand Button */}
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
            className={`hidden md:flex h-7 w-7 items-center justify-center rounded-md border text-slate-500 transition-colors cursor-pointer ${
              isLight
                ? 'border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                : 'border-[#30363d] hover:bg-[#21262d] hover:text-slate-200'
            }`}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
          <div className="mb-2">
            {!isCollapsed && (
              <span className={`px-2 text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                Menu Principal
              </span>
            )}
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? isLight
                      ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200/60 font-bold'
                      : 'bg-blue-950/80 text-blue-300 shadow-xs border border-blue-800/60 font-bold'
                    : isLight
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    : 'text-white hover:bg-[#161b22] hover:text-white'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isLight
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-[#21262d] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Configurações Menu Section with Submenu (Only shown if user has menu_configuracoes scope) */}
          {canAccessSettings && (
            <div className="pt-2">
              <button
                onClick={() => {
                  if (isCollapsed) {
                    onOpenSettings('env_status');
                    onCloseMobile();
                  } else {
                    setIsSettingsExpanded(!isSettingsExpanded);
                  }
                }}
                title={isCollapsed ? 'Configurações' : undefined}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? isLight
                      ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200/60 font-bold'
                      : 'bg-blue-950/80 text-blue-300 shadow-xs border border-blue-800/60 font-bold'
                    : isLight
                    ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    : 'text-white hover:bg-[#161b22] hover:text-white'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Settings className="h-4 w-4 shrink-0 text-blue-500" />
                {!isCollapsed && (
                  <>
                    <span className="truncate flex-1 text-left font-bold">Configurações</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                        isSettingsExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </>
                )}
              </button>

              {/* Submenu list under Configurações */}
              {!isCollapsed && isSettingsExpanded && (
                <div className="mt-1 ml-3 pl-2 border-l border-slate-300 dark:border-[#21262d] space-y-0.5">
                  {settingsSubItems.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          onOpenSettings(sub.id);
                          onCloseMobile();
                        }}
                        className={`w-full flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                          isLight
                            ? 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                            : 'text-slate-100 hover:bg-[#161b22] hover:text-white'
                        }`}
                      >
                        <SubIcon className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-300" />
                        <span className="truncate">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Quick Actions Divider */}
          <div className="pt-4 pb-2">
            {!isCollapsed && (
              <span className={`px-2 text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
                Ações
              </span>
            )}
          </div>

          {/* Sync Action */}
          <button
            onClick={() => {
              onSync();
              onCloseMobile();
            }}
            disabled={isSyncing}
            title={isCollapsed ? 'Sincronizar Jira' : undefined}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
              isLight
                ? 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                : 'text-white hover:bg-emerald-950/40 hover:text-emerald-300'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
          >
            <RefreshCw className={`h-4 w-4 shrink-0 text-emerald-500 ${isSyncing ? 'animate-spin' : ''}`} />
            {!isCollapsed && <span className="truncate">Sincronizar Dados</span>}
          </button>

          {/* Theme Toggle in Menu */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              title={isCollapsed ? 'Alternar Tema' : undefined}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                isLight
                  ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-white hover:bg-[#161b22] hover:text-white'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              {isLight ? (
                <>
                  <Moon className="h-4 w-4 shrink-0 text-slate-600" />
                  {!isCollapsed && <span className="truncate">Modo Escuro</span>}
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 shrink-0 text-amber-400" />
                  {!isCollapsed && <span className="truncate">Modo Claro</span>}
                </>
              )}
            </button>
          )}
        </div>

        {/* Sidebar Summary Widget (Expanded mode only) */}
        {!isCollapsed && (
          <div
            className={`m-3 p-3 rounded-xl border text-xs space-y-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#161b22] border-[#30363d]'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>RESUMO DO MÊS</span>
              <Layers className="h-3.5 w-3.5" />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div
                className={`p-2 rounded-lg border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#0d1117] border-[#21262d]'
                }`}
              >
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                  <Clock className="h-3 w-3 text-blue-500" />
                  Entregas
                </div>
                <div className={`text-base font-bold mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {totalIssuesCount}
                </div>
              </div>

              <div
                className={`p-2 rounded-lg border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#0d1117] border-[#21262d]'
                }`}
              >
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  Hoje
                </div>
                <div className={`text-base font-bold mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {todayIssuesCount}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Account / Auth Section */}
        {userEmail && (
          <div
            className={`m-3 p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#161b22] border-[#30363d]'
            }`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center shrink-0 text-xs text-white ${
                userProfile?.perfil === 'ADMINISTRADOR'
                  ? 'bg-purple-600'
                  : userProfile?.perfil === 'GESTOR'
                  ? 'bg-blue-600'
                  : 'bg-slate-600'
              }`}>
                {userEmail.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className={`text-xs font-semibold truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    {userProfile?.nome || userEmail}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`inline-flex items-center text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                      userProfile?.perfil === 'ADMINISTRADOR'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                        : userProfile?.perfil === 'GESTOR'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {userProfile?.perfil || 'VISUALIZADOR'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {onLogout && !isCollapsed && (
              <button
                onClick={onLogout}
                title="Sair da Conta (Logout)"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Sidebar Footer */}

        <div
          className={`p-3 border-t text-[11px] ${
            isLight ? 'border-slate-200 bg-slate-50/50' : 'border-[#1e293b] bg-[#0a0c10]'
          }`}
        >
          {!isCollapsed ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isDemoMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                    }`}
                  />
                  {isDemoMode ? 'Modo Demo' : 'Jira Conectado'}
                </span>
                <a
                  href="https://aztecnologia.atlassian.net"
                  target="_blank"
                  rel="noreferrer"
                  title="Abrir Jira Cloud"
                  className="text-slate-400 hover:text-blue-500 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="text-[10px] text-slate-400 font-medium border-t border-slate-200/40 dark:border-slate-800/60 pt-1 flex items-center justify-between">
                <span>Versão: {appVersion}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isDemoMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                }`}
                title={isDemoMode ? 'Modo Demo' : 'Jira Conectado'}
              />
              <span className="text-[9px] text-slate-500 font-mono" title={`Versão: ${appVersion}`}>
                v{appVersion}
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
