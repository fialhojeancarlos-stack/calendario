import React, { useEffect, useRef, useState } from 'react';
import { X, ExternalLink, User, FolderKanban, Calendar, Tag, Building2, ChevronRight, ChevronDown, Layers, Loader2 } from 'lucide-react';
import { JiraIssue } from '../types';
import { formatFullDateHeader } from '../utils/dateUtils';
import { getStatusStyle } from './IssueCard';
import { fetchIssueStoriesAPI } from '../services/apiService';

interface DayModalProps {
  isOpen: boolean;
  dateStr: string | null;
  issues: JiraIssue[];
  onClose: () => void;
  theme?: 'light' | 'dark';
}

interface ChildStoryItem {
  issue_key: string;
  epic_key: string;
  summary: string;
  issue_type: string;
  status: string;
  status_category?: string;
  assignee_name?: string;
  url?: string;
}

interface StoriesCacheState {
  [epicKey: string]: {
    loading: boolean;
    stories: ChildStoryItem[];
    error?: string;
  };
}

export const DayModal: React.FC<DayModalProps> = ({ isOpen, dateStr, issues, onClose, theme = 'light' }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const isLight = theme === 'light';

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [storiesCache, setStoriesCache] = useState<StoriesCacheState>({});

  const toggleExpandStories = async (issueKey: string) => {
    const nextSet = new Set(expandedKeys);
    const isExpanding = !nextSet.has(issueKey);

    if (isExpanding) {
      nextSet.add(issueKey);
      setExpandedKeys(nextSet);

      if (!storiesCache[issueKey]) {
        setStoriesCache((prev) => ({
          ...prev,
          [issueKey]: { loading: true, stories: [] },
        }));

        try {
          const res = await fetchIssueStoriesAPI(issueKey);
          setStoriesCache((prev) => ({
            ...prev,
            [issueKey]: { loading: false, stories: res.stories || [] },
          }));
        } catch (err: any) {
          setStoriesCache((prev) => ({
            ...prev,
            [issueKey]: { loading: false, stories: [], error: err.message || 'Erro ao carregar histórias' },
          }));
        }
      }
    } else {
      nextSet.delete(issueKey);
      setExpandedKeys(nextSet);
    }
  };

  // Store trigger focus element and handle ESC key
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !dateStr) return null;

  const formattedDateTitle = formatFullDateHeader(dateStr);

  return (
    <div
      id="day-modal-backdrop"
      aria-modal="true"
      role="dialog"
      aria-labelledby="day-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative w-full max-w-3xl rounded-xl shadow-2xl border flex flex-col overflow-hidden outline-none ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0d1117] border-[#30363d] text-slate-200'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between border-b px-6 py-4 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0a0c10] border-[#1e293b]'
          }`}
        >
          <div>
            <h2 id="day-modal-title" className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              {formattedDateTitle}
            </h2>
            <p className={`text-xs mt-0.5 font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {issues.length} {issues.length === 1 ? 'chamado previsto' : 'chamados previstos'}
            </p>
          </div>

          <button
            id="close-day-modal-btn"
            onClick={onClose}
            aria-label="Fechar modal"
            className={`rounded-md p-1.5 transition-colors cursor-pointer ${
              isLight ? 'text-slate-500 hover:bg-slate-200 hover:text-slate-900' : 'text-slate-400 hover:bg-[#21262d] hover:text-slate-100'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
          {issues.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Calendar className="mx-auto h-12 w-12 stroke-1 opacity-40 mb-2" />
              <p className="text-sm font-medium">Nenhum chamado previsto para esta data.</p>
            </div>
          ) : (
            issues.map((issue) => {
              const style = getStatusStyle(issue.status_category, issue.status, (theme as 'light' | 'dark') || 'light');
              const isExpanded = expandedKeys.has(issue.issue_key);
              const childState = storiesCache[issue.issue_key];

              return (
                <div
                  key={issue.issue_key}
                  id={`modal-issue-item-${issue.issue_key}`}
                  className={`group relative rounded-lg border p-4 shadow-2xs transition-all ${style.cardBorderBg}`}
                >
                  <div>
                    {/* Top Row: Key, Issue Type, Status, Jira Link */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-sm font-bold tracking-tight ${style.keyText}`}>
                          {issue.issue_key}
                        </span>
                        <span
                          className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold ${
                            isLight ? 'bg-white border-slate-300 text-slate-700' : 'bg-[#0d1117] border-[#30363d] text-slate-300'
                          }`}
                        >
                          <Tag className="mr-1 h-3 w-3 opacity-70" />
                          {issue.issue_type}
                        </span>
                        <span className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-extrabold uppercase ${style.badge}`}>
                          {issue.status}
                        </span>
                      </div>

                      <a
                        href={issue.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        id={`jira-link-${issue.issue_key}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline transition-colors"
                      >
                        <span>Abrir no Jira</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>

                    {/* Issue Summary */}
                    <h3 className={`text-sm font-bold leading-snug mb-3 ${style.summaryText}`}>
                      {issue.summary}
                    </h3>

                    {/* Metadata Footer */}
                    <div
                      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2.5 border-t text-xs ${
                        isLight ? 'border-slate-200 text-slate-600' : 'border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <FolderKanban className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">
                          <strong>Projeto:</strong> {issue.project_name}
                        </span>
                      </div>

                      {issue.client && (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">
                            <strong>Cliente:</strong> {issue.client}
                          </span>
                        </div>
                      )}

                      {issue.assignee && (
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">
                            <strong>Atribuído:</strong> {issue.assignee}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Button to Expand Linked Child Stories */}
                    <button
                      type="button"
                      onClick={() => toggleExpandStories(issue.issue_key)}
                      className="mt-3 w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-bold transition-colors bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Histórias Vinculadas ao Chamado</span>
                        {childState && !childState.loading && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {childState.stories.length}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                        <span>{isExpanded ? 'Ocultar' : 'Expandir'}</span>
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </div>
                    </button>

                    {/* Expanded Stories Panel */}
                    {isExpanded && (
                      <div className={`mt-2 p-3 rounded-md border text-xs animate-fadeIn ${
                        isLight ? 'bg-slate-50/90 border-blue-200' : 'bg-[#121721] border-blue-900/60'
                      }`}>
                        {childState?.loading && (
                          <div className="flex items-center justify-center py-4 gap-2 text-xs text-slate-500 font-medium">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            <span>Buscando histórias vinculadas...</span>
                          </div>
                        )}

                        {childState?.error && (
                          <div className="p-2.5 rounded bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs">
                            {childState.error}
                          </div>
                        )}

                        {childState && !childState.loading && childState.stories.length === 0 && !childState.error && (
                          <div className="py-2 text-center text-xs text-slate-500 italic">
                            Nenhuma história vinculada encontrada para este chamado.
                          </div>
                        )}

                        {childState && !childState.loading && childState.stories.length > 0 && (
                          <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1117]">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead className={`text-[10px] uppercase font-bold tracking-wider border-b ${
                                isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}>
                                <tr>
                                  <th className="px-3 py-2 font-bold w-32">Número do Chamado</th>
                                  <th className="px-3 py-2 font-bold">Summary (Resumo)</th>
                                  <th className="px-3 py-2 font-bold w-32">Status</th>
                                </tr>
                              </thead>
                              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/80'}`}>
                                {childState.stories.map((story) => {
                                  const storyStyle = getStatusStyle(story.status_category || '', story.status, isLight ? 'light' : 'dark');
                                  return (
                                    <tr key={story.issue_key} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}>
                                      <td className="px-3 py-2 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                        {story.url ? (
                                          <a href={story.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
                                            <span>{story.issue_key}</span>
                                            <ExternalLink className="h-3 w-3 opacity-70" />
                                          </a>
                                        ) : (
                                          <span>{story.issue_key}</span>
                                        )}
                                      </td>
                                      <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">
                                        {story.summary}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap">
                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${storyStyle.badge}`}>
                                          {story.status}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

