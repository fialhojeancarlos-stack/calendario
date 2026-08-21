import React, { useState, useRef, useEffect } from 'react';
import { FilterState, CalendarViewMode } from '../types';
import { Search, X, ChevronDown, Check } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  filterOptions: {
    projectOptions: { key: string; name: string }[];
    clientOptions: string[];
    sprintOptions: string[];
  };
  onToggleProject: (key: string) => void;
  onToggleClient: (name: string) => void;
  onToggleSprint: (name: string) => void;
  onChangeViewMode: (mode: CalendarViewMode) => void;
  onSearchChange: (q: string) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
  theme?: 'light' | 'dark';
}

interface DropdownProps {
  label: string;
  selectedCount: number;
  options: { id: string; label: string }[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  theme?: 'light' | 'dark';
}

const FilterDropdown: React.FC<DropdownProps> = ({
  label,
  selectedCount,
  options,
  selectedIds,
  onToggle,
  theme = 'light',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
          selectedCount > 0
            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700'
            : isLight
            ? 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
            : 'border-[#30363d] bg-[#161b22] text-white hover:border-[#8b949e]'
        }`}
      >
        <span className={isLight ? 'text-slate-500' : 'text-slate-300 font-medium'}>{label}:</span>
        <span className={isLight ? 'font-bold text-slate-900' : 'font-bold text-white'}>
          {selectedCount > 0 ? `${selectedCount} sel.` : 'Todos'}
        </span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 mt-1 z-40 w-64 rounded-lg border p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-100 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#161b22] border-[#30363d]'
          }`}
        >
          {/* Internal search */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-300" />
            <input
              type="text"
              placeholder={`Buscar ${label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full rounded-md border pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-[#0d1117] border-[#30363d] text-white placeholder-slate-400'
              }`}
            />
          </div>

          <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500 dark:text-slate-400">Nenhum item encontrado</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedIds.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => onToggle(opt.id)}
                    className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                      isSelected
                        ? isLight
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'bg-[#21262d] text-blue-300 font-bold'
                        : isLight
                        ? 'text-slate-700 hover:bg-slate-100'
                        : 'text-slate-100 hover:bg-[#21262d] hover:text-white'
                    }`}
                  >
                    <span className="truncate pr-2">{opt.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  filterOptions,
  onToggleProject,
  onToggleClient,
  onToggleSprint,
  onSearchChange,
  onClearAll,
  hasActiveFilters,
  theme = 'light',
}) => {
  const projectItems = filterOptions.projectOptions.map((p) => ({ id: p.key, label: p.name }));
  const clientItems = filterOptions.clientOptions.map((c) => ({ id: c, label: c }));
  const sprintItems = filterOptions.sprintOptions.map((s) => ({ id: s, label: s }));

  const isLight = theme === 'light';

  return (
    <div
      className={`flex flex-col gap-2.5 border-b px-6 py-2.5 transition-colors ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0d1117] border-[#1e293b]'
      }`}
    >
      {/* Top Filter Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Multiselect Dropdowns Group */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Projeto"
            selectedCount={filters.projects.length}
            options={projectItems}
            selectedIds={filters.projects}
            onToggle={onToggleProject}
            theme={theme}
          />

          <FilterDropdown
            label="Cliente"
            selectedCount={filters.clients.length}
            options={clientItems}
            selectedIds={filters.clients}
            onToggle={onToggleClient}
            theme={theme}
          />

          <FilterDropdown
            label="Sprint"
            selectedCount={filters.sprints.length}
            options={sprintItems}
            selectedIds={filters.sprints}
            onToggle={onToggleSprint}
            theme={theme}
          />

          {hasActiveFilters && (
            <>
              <div className={`h-4 w-px mx-1 ${isLight ? 'bg-slate-300' : 'bg-slate-800'}`}></div>
              <button
                id="clear-all-filters-btn"
                onClick={onClearAll}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Limpar filtros
              </button>
            </>
          )}
        </div>

        {/* Text Search Input */}
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código, resumo..."
            value={filters.searchQuery || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full rounded-md border pl-8 pr-8 py-1.5 text-xs focus:outline-none focus:border-blue-500 ${
              isLight
                ? 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                : 'bg-[#161b22] border-[#30363d] text-slate-200 placeholder-slate-500'
            }`}
          />
          {filters.searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Active Selected Chips Row */}
      {hasActiveFilters && (
        <div className={`flex flex-wrap items-center gap-1.5 pt-1.5 border-t ${isLight ? 'border-slate-200' : 'border-[#1e293b]'}`}>
          {filters.projects.map((key) => {
            const name = projectItems.find((p) => p.id === key)?.label || key;
            return (
              <span
                key={key}
                className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] border font-medium ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#161b22] border-[#30363d] text-slate-300'
                }`}
              >
                <strong className="text-blue-600">Proj:</strong> {name}
                <button onClick={() => onToggleProject(key)} className="hover:text-rose-500 text-slate-400 cursor-pointer">
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}

          {filters.clients.map((c) => (
            <span
              key={c}
              className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] border font-medium ${
                isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#161b22] border-[#30363d] text-slate-300'
              }`}
            >
              <strong className="text-blue-600">Cli:</strong> {c}
              <button onClick={() => onToggleClient(c)} className="hover:text-rose-500 text-slate-400 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {filters.sprints.map((s) => (
            <span
              key={s}
              className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] border font-medium ${
                isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#161b22] border-[#30363d] text-slate-300'
              }`}
            >
              <strong className="text-blue-600">Sprint:</strong> {s}
              <button onClick={() => onToggleSprint(s)} className="hover:text-rose-500 text-slate-400 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
