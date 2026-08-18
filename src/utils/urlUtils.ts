import { FilterState, CalendarViewMode } from '../types';

const STORAGE_KEY = 'jira_calendar_filters_v1';

export function getInitialFilterState(): FilterState {
  // 1. Try URL Search Params
  const params = new URLSearchParams(window.location.search);
  const projectsParam = params.get('projects');
  const clientsParam = params.get('clients');
  const sprintsParam = params.get('sprints');
  const viewParam = params.get('view') as CalendarViewMode | null;

  // 2. Try localStorage
  let savedState: Partial<FilterState> = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) savedState = JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse localStorage filter state', e);
  }

  const validViews: CalendarViewMode[] = ['month', 'week', 'day'];

  const initialView = viewParam && validViews.includes(viewParam)
    ? viewParam
    : (savedState.viewMode && validViews.includes(savedState.viewMode) ? savedState.viewMode : 'month');

  return {
    projects: projectsParam ? projectsParam.split(',').filter(Boolean) : (savedState.projects || []),
    clients: clientsParam ? clientsParam.split(',').filter(Boolean) : (savedState.clients || []),
    sprints: sprintsParam ? sprintsParam.split(',').filter(Boolean) : (savedState.sprints || []),
    viewMode: initialView,
    searchQuery: '',
  };
}

export function syncFiltersToUrlAndStorage(state: FilterState) {
  // Save to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      projects: state.projects,
      clients: state.clients,
      sprints: state.sprints,
      viewMode: state.viewMode,
    }));
  } catch (e) {
    console.warn('Failed to save filters to localStorage', e);
  }

  // Save to URL search params
  const url = new URL(window.location.href);
  
  if (state.projects.length > 0) url.searchParams.set('projects', state.projects.join(','));
  else url.searchParams.delete('projects');

  if (state.clients.length > 0) url.searchParams.set('clients', state.clients.join(','));
  else url.searchParams.delete('clients');

  if (state.sprints.length > 0) url.searchParams.set('sprints', state.sprints.join(','));
  else url.searchParams.delete('sprints');

  if (state.viewMode) url.searchParams.set('view', state.viewMode);
  else url.searchParams.delete('view');

  window.history.replaceState({}, '', url.toString());
}
