import React from 'react';
import { JiraIssue } from '../types';
import { buildWeekGrid } from '../utils/dateUtils';
import { IssueCard } from './IssueCard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeekViewProps {
  currentDate: Date;
  issuesByDateMap: Map<string, JiraIssue[]>;
  onSelectDay: (dateStr: string, issues: JiraIssue[]) => void;
  theme?: 'light' | 'dark';
}

const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  issuesByDateMap,
  onSelectDay,
  theme = 'light',
}) => {
  const days = buildWeekGrid(currentDate, issuesByDateMap);
  const isLight = theme === 'light';

  return (
    <div
      className={`flex flex-col h-full w-full rounded-lg border overflow-hidden shadow-xs transition-colors ${
        isLight ? 'border-slate-200 bg-white' : 'border-[#1e293b] bg-[#010409]'
      }`}
    >
      {/* 7 Columns Layout */}
      <div
        className={`grid grid-cols-7 flex-1 divide-x h-full overflow-hidden ${
          isLight ? 'divide-slate-200' : 'divide-[#1e293b]'
        }`}
      >
        {days.map((day, idx) => {
          return (
            <div
              key={day.dateString}
              id={`week-col-${day.dateString}`}
              className={`flex flex-col h-full overflow-hidden transition-colors ${
                day.isToday
                  ? isLight
                    ? 'bg-blue-50/60'
                    : 'bg-[#11141b]'
                  : isLight
                  ? 'bg-white'
                  : 'bg-[#0a0c10]'
              }`}
            >
              {/* Day Header */}
              <div
                onClick={() => onSelectDay(day.dateString, day.issues)}
                className={`flex flex-col items-center justify-center py-2.5 border-b cursor-pointer transition-colors ${
                  isLight
                    ? 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    : 'border-[#1e293b] bg-[#0d1117] hover:bg-[#161b22]'
                }`}
              >
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest ${
                    isLight ? 'text-slate-500' : 'text-slate-300'
                  }`}
                >
                  {WEEKDAY_SHORT[idx]}
                </span>
                <span
                  className={`mt-1 text-sm font-extrabold ${
                    day.isToday
                      ? 'text-blue-600 dark:text-blue-400'
                      : isLight
                      ? 'text-slate-800'
                      : 'text-white'
                  }`}
                >
                  {day.dayNumber}
                </span>
                <span className={`text-[10px] capitalize ${isLight ? 'text-slate-500' : 'text-slate-300 font-medium'}`}>
                  {format(day.date, 'MMM', { locale: ptBR })}
                </span>
              </div>

              {/* Column Content Scrollable Area */}
              <div
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    onSelectDay(day.dateString, day.issues);
                  }
                }}
                className="flex-1 overflow-y-auto p-2 space-y-1.5 cursor-pointer"
              >
                {day.issues.length === 0 ? (
                  <div
                    className={`py-8 text-center text-[11px] font-medium select-none ${
                      isLight ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Sem entregas
                  </div>
                ) : (
                  day.issues.map((issue) => (
                    <IssueCard
                      key={issue.issue_key}
                      issue={issue}
                      compact={true}
                      theme={theme}
                      onClick={() => onSelectDay(day.dateString, day.issues)}
                    />
                  ))
                )}
              </div>

              {/* Day Bottom Footer summary */}
              <div
                className={`border-t px-2 py-1.5 text-center ${
                  isLight ? 'border-slate-200 bg-slate-50' : 'border-[#1e293b] bg-[#0d1117]'
                }`}
              >
                <button
                  onClick={() => onSelectDay(day.dateString, day.issues)}
                  className={`text-[10px] font-bold transition-colors cursor-pointer ${
                    isLight ? 'text-slate-600 hover:text-blue-600' : 'text-white hover:text-blue-300'
                  }`}
                >
                  {day.issues.length} {day.issues.length === 1 ? 'chamado' : 'chamados'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
