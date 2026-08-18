import { useState, useEffect, useCallback } from 'react';
import { FilterState, CalendarViewMode } from '../types';
import { getInitialFilterState, syncFiltersToUrlAndStorage } from '../utils/urlUtils';

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>(() => getInitialFilterState());

  // Sync with URL and localStorage whenever filters state changes
  useEffect(() => {
    syncFiltersToUrlAndStorage(filters);
  }, [filters]);

  const toggleProject = useCallback((projectKey: string) => {
    setFilters((prev) => {
      const exists = prev.projects.includes(projectKey);
      return {
        ...prev,
        projects: exists
          ? prev.projects.filter((p) => p !== projectKey)
          : [...prev.projects, projectKey],
      };
    });
  }, []);

  const toggleClient = useCallback((clientName: string) => {
    setFilters((prev) => {
      const exists = prev.clients.includes(clientName);
      return {
        ...prev,
        clients: exists
          ? prev.clients.filter((c) => c !== clientName)
          : [...prev.clients, clientName],
      };
    });
  }, []);

  const toggleSprint = useCallback((sprintName: string) => {
    setFilters((prev) => {
      const exists = prev.sprints.includes(sprintName);
      return {
        ...prev,
        sprints: exists
          ? prev.sprints.filter((s) => s !== sprintName)
          : [...prev.sprints, sprintName],
      };
    });
  }, []);

  const setViewMode = useCallback((viewMode: CalendarViewMode) => {
    setFilters((prev) => ({ ...prev, viewMode }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      projects: [],
      clients: [],
      sprints: [],
      searchQuery: '',
    }));
  }, []);

  const hasActiveFilters = filters.projects.length > 0 || filters.clients.length > 0 || filters.sprints.length > 0 || Boolean(filters.searchQuery);

  return {
    filters,
    setFilters,
    toggleProject,
    toggleClient,
    toggleSprint,
    setViewMode,
    setSearchQuery,
    clearAllFilters,
    hasActiveFilters,
  };
}
