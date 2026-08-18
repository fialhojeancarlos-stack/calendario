import React from 'react';
import { CalendarViewMode } from '../types';
import { ChevronLeft, ChevronRight, RefreshCw, Settings, Sun, Moon, Menu, LogOut, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { UserProfileRecord } from '../types';

interface CalendarHeaderProps {
  periodTitle: string;
  viewMode: CalendarViewMode;
  onChangeViewMode: (mode: CalendarViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onSync: () => void;
  isSyncing: boolean;
  lastSyncTimestamp?: string | null;
  onOpenSettings: () => void;
  isDemoMode?: boolean;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onToggleSidebar?: () => void;
  userEmail?: string | null;
  userProfile?: UserProfileRecord | null;
  canAccessSettings?: boolean;
  canSync?: boolean;
  isReadOnly?: boolean;
  onLogout?: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  periodTitle,
  viewMode,
  onChangeViewMode,
  onPrev,
  onNext,
  onToday,
  onSync,
  isSyncing,
  lastSyncTimestamp,
  onOpenSettings,
  isDemoMode = false,
  theme = 'light',
  onToggleTheme,
  onToggleSidebar,
  userEmail,
  userProfile,
  canAccessSettings = true,
  canSync = true,
  isReadOnly = false,
  onLogout,
}) => {

  const formattedLastSync = lastSyncTimestamp
    ? format(new Date(lastSyncTimestamp), "'às' HH:mm", { locale: ptBR })
    : null;

  const isLight = theme === 'light';

  return (
    <header
      className={`sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b px-6 py-3.5 shadow-xs transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-[#0a0c10] border-[#1e293b] text-slate-100'
      }`}
    >
      {/* Left Column: Navigation & Period Title */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Toggle Sidebar Button */}
        {onToggleSidebar && (
          <button
            id="toggle-sidebar-btn"
            onClick={onToggleSidebar}
            title="Abrir/Fechar Menu Lateral"
            className={`flex items-center justify-center p-2 rounded-md border transition-colors cursor-pointer ${
              isLight
                ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                : 'border-[#30363d] bg-[#161b22] text-slate-300 hover:bg-[#21262d] hover:text-white'
            }`}
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        {/* Navigation Buttons */}
        <div
          className={`inline-flex items-center rounded-md border p-0.5 shadow-2xs ${
            isLight ? 'border-slate-300 bg-slate-50' : 'border-[#30363d] bg-[#161b22]'
          }`}
        >
          <button
            id="nav-prev-btn"
            onClick={onPrev}
            title="Anterior"
            className={`rounded px-3 py-1 transition-colors ${
              isLight
                ? 'text-slate-700 hover:bg-slate-200'
                : 'text-slate-300 hover:bg-[#21262d]'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            id="nav-today-btn"
            onClick={onToday}
            className={`px-4 py-1 text-xs font-semibold border-x transition-colors ${
              isLight
                ? 'text-slate-800 border-slate-300 hover:bg-slate-200'
                : 'text-slate-200 border-[#30363d] hover:bg-[#21262d]'
            }`}
          >
            Hoje
          </button>

          <button
            id="nav-next-btn"
            onClick={onNext}
            title="Próximo"
            className={`rounded px-3 py-1 transition-colors ${
              isLight
                ? 'text-slate-700 hover:bg-slate-200'
                : 'text-slate-300 hover:bg-[#21262d]'
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Period Title */}
        <h1
          className={`text-xl font-bold tracking-tight ${
            isLight ? 'text-slate-900' : 'text-slate-100'
          }`}
        >
          {periodTitle}
        </h1>
      </div>

      {/* Right Column: Theme Toggle, View Switcher, Sync Button, Settings */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Theme Toggle Button */}
        {onToggleTheme && (
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            title={isLight ? 'Alternar para Modo Escuro' : 'Alternar para Modo Claro'}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              isLight
                ? 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
                : 'border-[#30363d] bg-[#161b22] text-amber-300 hover:bg-[#21262d]'
            }`}
          >
            {isLight ? (
              <>
                <Moon className="h-4 w-4 text-slate-700" />
                <span className="hidden sm:inline">Modo Escuro</span>
              </>
            ) : (
              <>
                <Sun className="h-4 w-4 text-amber-400" />
                <span className="hidden sm:inline">Modo Claro</span>
              </>
            )}
          </button>
        )}

        {/* Segmented View Switcher */}
        <div
          className={`inline-flex rounded-lg border p-1 ${
            isLight ? 'border-slate-300 bg-slate-100' : 'border-[#30363d] bg-[#161b22]'
          }`}
        >
          <button
            id="view-mode-day-btn"
            onClick={() => onChangeViewMode('day')}
            className={`rounded-md px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'day'
                ? 'bg-blue-600 text-white shadow-xs'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dia
          </button>

          <button
            id="view-mode-week-btn"
            onClick={() => onChangeViewMode('week')}
            className={`rounded-md px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'week'
                ? 'bg-blue-600 text-white shadow-xs'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semana
          </button>

          <button
            id="view-mode-month-btn"
            onClick={() => onChangeViewMode('month')}
            className={`rounded-md px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'month'
                ? 'bg-blue-600 text-white shadow-xs'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mês
          </button>
        </div>

        {/* Sync Button + Indicator */}
        <div className="flex items-center gap-2">
          <button
            id="sync-jira-btn"
            onClick={onSync}
            disabled={isSyncing || !canSync}
            title={!canSync ? 'Perfil Visualizador (Somente Leitura)' : 'Atualizar Dados do Jira'}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>

          <div className="hidden lg:flex flex-col text-[10px]">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Auto Sync (5m)
            </span>
            {formattedLastSync && (
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                {formattedLastSync}
              </span>
            )}
          </div>
        </div>

        {/* Settings / Config Button (Only shown if user has menu_configuracoes scope) */}
        {canAccessSettings && (
          <button
            id="open-settings-modal-btn"
            onClick={onOpenSettings}
            title="Configurações e Integração Jira"
            className={`relative rounded-md border p-2 transition-all cursor-pointer ${
              isDemoMode
                ? 'border-amber-500/50 bg-amber-100 text-amber-800 animate-pulse'
                : isLight
                ? 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'border-[#30363d] bg-[#161b22] text-slate-300 hover:bg-[#21262d]'
            }`}
          >
            <Settings className="h-4 w-4" />
            {isDemoMode && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            )}
          </button>
        )}

        {/* User Badge & Logout */}
        {userEmail && (
          <div className="flex items-center gap-2 border-l pl-3 ml-1 border-slate-300 dark:border-slate-700">
            <div
              title={`${userProfile?.nome || userEmail} (${userProfile?.perfil || 'VISUALIZADOR'})`}
              className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-[#161b22] border-[#30363d] text-slate-200'
              }`}
            >
              <User className="h-3.5 w-3.5 text-blue-500" />
              <span className="max-w-[120px] truncate">{userEmail}</span>
              <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                userProfile?.perfil === 'ADMINISTRADOR'
                  ? 'bg-purple-950 text-purple-300 border border-purple-800'
                  : userProfile?.perfil === 'GESTOR'
                  ? 'bg-blue-950 text-blue-300 border border-blue-800'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                {userProfile?.perfil || 'VISUALIZADOR'}
              </span>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Sair da Conta (Logout)"
                className="flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Sair</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>

  );
};
