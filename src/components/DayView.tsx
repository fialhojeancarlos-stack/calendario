import React from 'react';
import { JiraIssue } from '../types';
import { formatFullDateHeader } from '../utils/dateUtils';
import { IssueCard } from './IssueCard';
import { FolderKanban, CalendarCheck2 } from 'lucide-react';

interface DayViewProps {
  currentDate: Date;
  dateStr: string;
  issues: JiraIssue[];
  onSelectDay: (dateStr: string, issues: JiraIssue[]) => void;
  theme?: 'light' | 'dark';
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  dateStr,
  issues,
  onSelectDay,
  theme = 'light',
}) => {
  const formattedDate = formatFullDateHeader(dateStr);
  const isLight = theme === 'light';

  // Group issues by project_name
  const groupedByProject = React.useMemo(() => {
    const map = new Map<string, JiraIssue[]>();
    issues.forEach((issue) => {
      const name = issue.project_name || issue.project_key;
      if (!map.has(name)) map.set(name, []);
      map.get(name)!.push(issue);
    });
    return map;
  }, [issues]);

  return (
    <div
      className={`flex flex-col h-full w-full rounded-lg border p-6 shadow-xs overflow-hidden transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#0a0c10] border-[#1e293b]'
      }`}
    >
      {/* Day Top Bar Counter */}
      <div
        className={`flex items-center justify-between border-b pb-4 mb-6 ${
          isLight ? 'border-slate-200' : 'border-[#1e293b]'
        }`}
      >
        <div>
          <h2 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            {formattedDate}
          </h2>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Visão detalhada por projeto para o dia selecionado
          </p>
        </div>

        <div
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 border font-semibold text-xs ${
            isLight
              ? 'bg-blue-50 border-blue-200 text-blue-900'
              : 'bg-[#161b22] border-[#30363d] text-slate-200'
          }`}
        >
          <CalendarCheck2 className="h-4 w-4 text-blue-600" />
          <span>
            {issues.length} {issues.length === 1 ? 'Entrega prevista' : 'Entrega(s) prevista(s)'}
          </span>
        </div>
      </div>

      {/* Grouped Issues List */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {issues.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FolderKanban className="mx-auto h-12 w-12 opacity-30 mb-2" />
            <p className="text-sm font-medium">Nenhum chamado previsto para ser entregue nesta data.</p>
          </div>
        ) : (
          Array.from(groupedByProject.entries()).map(([projectName, projectIssues]) => (
            <div key={projectName} className="space-y-3">
              <div
                className={`flex items-center gap-2 pb-1.5 border-b ${
                  isLight ? 'border-slate-200' : 'border-[#1e293b]'
                }`}
              >
                <FolderKanban className="h-4 w-4 text-blue-600" />
                <h3 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {projectName}
                </h3>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded border ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-700'
                      : 'bg-[#161b22] border-[#30363d] text-slate-400'
                  }`}
                >
                  {projectIssues.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projectIssues.map((issue) => (
                  <IssueCard
                    key={issue.issue_key}
                    issue={issue}
                    compact={false}
                    theme={theme}
                    onClick={() => onSelectDay(dateStr, issues)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
