import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  parseISO,
  isValid,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDay, CalendarWeek, JiraIssue } from '../types';

export const LOCALE_PTBR = ptBR;

// Format date to YYYY-MM-DD
export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

// Format period title based on view mode and current date
export function getPeriodTitle(date: Date, viewMode: 'month' | 'week' | 'day'): string {
  if (viewMode === 'month') {
    // e.g. "Agosto de 2026"
    const monthYear = format(date, "MMMM 'de' yyyy", { locale: ptBR });
    return monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
  }

  if (viewMode === 'week') {
    const start = startOfWeek(date, { weekStartsOn: 0 }); // Sunday
    const end = endOfWeek(date, { weekStartsOn: 0 });     // Saturday

    if (start.getMonth() === end.getMonth()) {
      // e.g., "12 – 18 de agosto"
      return `${format(start, 'd')} – ${format(end, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
    }
    // e.g., "30 de agosto – 5 de setembro"
    return `${format(start, "d 'de' MMMM", { locale: ptBR })} – ${format(end, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
  }

  // Day view e.g. "quinta-feira, 13 de agosto de 2026"
  const dayStr = format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  return dayStr.charAt(0).toUpperCase() + dayStr.slice(1);
}

// Calculate visual start and end dates for a month view (includes padding days from previous/next months)
export function getMonthViewRange(date: Date): { start: Date; end: Date; startStr: string; endStr: string } {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  // Week starts on Sunday (weekStartsOn: 0)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  return {
    start: calendarStart,
    end: calendarEnd,
    startStr: formatDateKey(calendarStart),
    endStr: formatDateKey(calendarEnd),
  };
}

// Calculate range for Week View
export function getWeekViewRange(date: Date): { start: Date; end: Date; startStr: string; endStr: string } {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  const end = endOfWeek(date, { weekStartsOn: 0 });
  return {
    start,
    end,
    startStr: formatDateKey(start),
    endStr: formatDateKey(end),
  };
}

// Generate array of 42 calendar days for 7x6 month grid
export function buildMonthGrid(currentDate: Date, issuesMap: Map<string, JiraIssue[]>): CalendarWeek[] {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  
  // Create 42 days (6 weeks x 7 days)
  const days: CalendarDay[] = [];
  let curr = new Date(calendarStart);

  for (let i = 0; i < 42; i++) {
    const dateStr = formatDateKey(curr);
    const dayIssues = issuesMap.get(dateStr) || [];

    days.push({
      date: new Date(curr),
      dateString: dateStr,
      dayNumber: curr.getDate(),
      isCurrentMonth: isSameMonth(curr, currentDate),
      isToday: isToday(curr),
      issues: dayIssues,
    });

    curr = addDays(curr, 1);
  }

  // Group into weeks
  const weeks: CalendarWeek[] = [];
  for (let w = 0; w < 6; w++) {
    weeks.push({ days: days.slice(w * 7, (w + 1) * 7) });
  }

  return weeks;
}

// Build 7 days for week grid
export function buildWeekGrid(currentDate: Date, issuesMap: Map<string, JiraIssue[]>): CalendarDay[] {
  const start = startOfWeek(currentDate, { weekStartsOn: 0 });
  const days: CalendarDay[] = [];

  for (let i = 0; i < 7; i++) {
    const curr = addDays(start, i);
    const dateStr = formatDateKey(curr);
    const dayIssues = issuesMap.get(dateStr) || [];

    days.push({
      date: new Date(curr),
      dateString: dateStr,
      dayNumber: curr.getDate(),
      isCurrentMonth: isSameMonth(curr, currentDate),
      isToday: isToday(curr),
      issues: dayIssues,
    });
  }

  return days;
}

// Navigation helpers
export function navigateDate(currentDate: Date, viewMode: 'month' | 'week' | 'day', direction: 'prev' | 'next'): Date {
  if (viewMode === 'month') {
    return direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
  }
  if (viewMode === 'week') {
    return direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1);
  }
  return direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1);
}

// Format date string (YYYY-MM-DD or ISO) into DD/MM/AAAA format
export function formatToDDMMAAAA(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const cleaned = dateStr.split('T')[0].trim();
    const parts = cleaned.split('-');
    if (parts.length === 3) {
      const [yyyy, mm, dd] = parts;
      if (yyyy && mm && dd && yyyy.length === 4) {
        return `${dd.padStart(2, '0')}/${mm.padStart(2, '0')}/${yyyy}`;
      }
    }
    const date = parseISO(dateStr);
    if (isValid(date)) {
      return format(date, 'dd/MM/yyyy');
    }
  } catch {
    // fallback
  }
  return dateStr;
}

// Format full date for modal header
export function formatFullDateHeader(dateStr: string): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return dateStr;
  const str = format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  return str.charAt(0).toUpperCase() + str.slice(1);
}
