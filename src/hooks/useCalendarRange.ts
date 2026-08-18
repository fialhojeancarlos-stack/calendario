import { useState, useMemo, useCallback } from 'react';
import { CalendarViewMode } from '../types';
import {
  getPeriodTitle,
  getMonthViewRange,
  getWeekViewRange,
  formatDateKey,
  navigateDate,
} from '../utils/dateUtils';

export function useCalendarRange(initialView: CalendarViewMode = 'month') {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>(initialView);

  // Compute visual range for JQL & calendar rendering
  const range = useMemo(() => {
    if (viewMode === 'month') {
      return getMonthViewRange(currentDate);
    }
    if (viewMode === 'week') {
      return getWeekViewRange(currentDate);
    }
    // Day view
    const dateStr = formatDateKey(currentDate);
    return {
      start: currentDate,
      end: currentDate,
      startStr: dateStr,
      endStr: dateStr,
    };
  }, [currentDate, viewMode]);

  const periodTitle = useMemo(() => {
    return getPeriodTitle(currentDate, viewMode);
  }, [currentDate, viewMode]);

  const goPrev = useCallback(() => {
    setCurrentDate((prev) => navigateDate(prev, viewMode, 'prev'));
  }, [viewMode]);

  const goNext = useCallback(() => {
    setCurrentDate((prev) => navigateDate(prev, viewMode, 'next'));
  }, [viewMode]);

  const goToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  return {
    currentDate,
    setCurrentDate,
    viewMode,
    setViewMode,
    range,
    periodTitle,
    goPrev,
    goNext,
    goToday,
  };
}
