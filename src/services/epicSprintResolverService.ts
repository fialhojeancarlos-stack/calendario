import { SupabaseClient } from '@supabase/supabase-js';

export interface EpicSprintResolutionResult {
  totalEpicsChecked: number;
  epicsUpdatedCount: number;
  updatedEpicKeys: string[];
  details: Array<{ epic_key: string; resolved_sprint: string; source_story_key?: string }>;
}

/**
 * Service to validate and bind Sprint to Epics without Sprint,
 * by checking associated child Story issues ("HISTORIA") for filled Sprints.
 */
export async function resolveEpicSprintsFromStories(
  epics: any[],
  jiraConfig: { baseUrl: string; email: string; apiToken: string; sprintFieldId: string },
  supabaseClient: SupabaseClient | null,
  allKnownIssues: any[] = []
): Promise<EpicSprintResolutionResult> {
  const result: EpicSprintResolutionResult = {
    totalEpicsChecked: 0,
    epicsUpdatedCount: 0,
    updatedEpicKeys: [],
    details: [],
  };

  if (!Array.isArray(epics) || epics.length === 0) {
    return result;
  }

  // Filter Epics (issue_type === 'Épico' || 'Epic') without sprint
  const epicsWithoutSprint = epics.filter((issue) => {
    const typeLower = (issue.issue_type || '').toLowerCase();
    const isEpic = typeLower.includes('épico') || typeLower.includes('epico') || typeLower.includes('epic');
    const hasSprint = Boolean(issue.sprint_name && issue.sprint_name.trim() !== '');
    return isEpic && !hasSprint;
  });

  result.totalEpicsChecked = epicsWithoutSprint.length;
  if (epicsWithoutSprint.length === 0) {
    return result;
  }

  const epicKeys = epicsWithoutSprint.map((e) => e.issue_key);
  const sprintMap = new Map<string, { sprint_id?: string; sprint_name: string; source_story_key?: string }>();

  // 1. Check local/memory/Supabase known issues first
  if (allKnownIssues && allKnownIssues.length > 0) {
    allKnownIssues.forEach((item) => {
      const typeLower = (item.issue_type || '').toLowerCase();
      const isStory = typeLower.includes('história') || typeLower.includes('historia') || typeLower.includes('story');
      const parentEpicKey = item.epic_key || item.parent_key;
      const hasSprint = Boolean(item.sprint_name && item.sprint_name.trim() !== '');

      if (isStory && parentEpicKey && epicKeys.includes(parentEpicKey) && hasSprint) {
        sprintMap.set(parentEpicKey, {
          sprint_id: item.sprint_id,
          sprint_name: item.sprint_name,
          source_story_key: item.issue_key,
        });
      }
    });
  }

  // 2. If Jira API is configured, search Jira for child Stories of these Epics
  const isJiraValid = Boolean(jiraConfig.baseUrl && jiraConfig.email && jiraConfig.apiToken);
  const missingEpicKeys = epicKeys.filter((k) => !sprintMap.has(k));

  if (isJiraValid && missingEpicKeys.length > 0) {
    try {
      const authHeader = `Basic ${Buffer.from(`${jiraConfig.email}:${jiraConfig.apiToken}`).toString('base64')}`;
      const sprintField = jiraConfig.sprintFieldId || 'customfield_10020';

      // Chunk missingEpicKeys in batches of 50 for JQL length limits
      const chunkSize = 50;
      for (let i = 0; i < missingEpicKeys.length; i += chunkSize) {
        const chunkKeys = missingEpicKeys.slice(i, i + chunkSize);
        const formattedKeys = chunkKeys.map((k) => `"${k}"`).join(',');

        const jql = `("Epic Link" in (${formattedKeys}) OR parent in (${formattedKeys})) AND issuetype in ("História", "Historia", "Story", "User Story")`;

        const searchUrl = `${jiraConfig.baseUrl}/rest/api/3/search/jql`;
        let response = await fetch(searchUrl, {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jql,
            maxResults: 100,
            fields: ['summary', 'issuetype', 'parent', 'customfield_10014', sprintField],
          }),
        });

        let stories: any[] = [];

        if (!response.ok && (response.status === 404 || response.status === 405)) {
          const getUrl = `${jiraConfig.baseUrl}/rest/api/3/search?jql=${encodeURIComponent(
            jql
          )}&maxResults=100&fields=summary,issuetype,parent,customfield_10014,${sprintField}`;

          response = await fetch(getUrl, {
            headers: { Authorization: authHeader, Accept: 'application/json' },
          });

          if (response.ok) {
            const data = await response.json();
            stories = data.issues || [];
          }
        } else if (response.ok) {
          const data = await response.json();
          stories = data.issues || [];
        }

        for (const story of stories) {
          const f = story.fields || {};
          const parentKey = f.parent?.key || f.customfield_10014;

          if (!parentKey || !chunkKeys.includes(parentKey)) continue;

          // Extract Sprint from story
          let storySprintName = '';
          let storySprintId = '';
          const sprintRaw = f[sprintField];
          if (Array.isArray(sprintRaw) && sprintRaw.length > 0) {
            const last = sprintRaw[sprintRaw.length - 1];
            if (typeof last === 'object' && last.name) {
              storySprintName = last.name;
              storySprintId = String(last.id || '');
            } else if (typeof last === 'string') {
              const m = last.match(/name=([^,\]]+)/);
              storySprintName = m ? m[1] : last;
            }
          }

          if (storySprintName && storySprintName.trim() !== '') {
            sprintMap.set(parentKey, {
              sprint_id: storySprintId || undefined,
              sprint_name: storySprintName.trim(),
              source_story_key: story.key,
            });
          }
        }
      }
    } catch (err: any) {
      console.warn('[EpicSprintResolver] Erro ao buscar histórias no Jira:', err.message);
    }
  }

  // 3. Apply updates to Epics in memory and Supabase
  for (const epic of epics) {
    const key = epic.issue_key;
    const resolved = sprintMap.get(key);

    if (resolved && resolved.sprint_name) {
      epic.sprint_name = resolved.sprint_name;
      if (resolved.sprint_id) epic.sprint_id = resolved.sprint_id;

      result.epicsUpdatedCount++;
      result.updatedEpicKeys.push(key);
      result.details.push({
        epic_key: key,
        resolved_sprint: resolved.sprint_name,
        source_story_key: resolved.source_story_key,
      });

      // Update Supabase DB if client exists
      if (supabaseClient) {
        try {
          await supabaseClient
            .from('jira_issues')
            .update({
              sprint_name: resolved.sprint_name,
              sprint_id: resolved.sprint_id || null,
              updated_at: new Date().toISOString(),
            })
            .eq('issue_key', key);

          await supabaseClient
            .from('jira_epics_unscheduled')
            .update({
              sprint_name: resolved.sprint_name,
              sprint_id: resolved.sprint_id || null,
              updated_at: new Date().toISOString(),
            })
            .eq('issue_key', key);
        } catch (dbErr: any) {
          console.warn(`[EpicSprintResolver] Erro ao atualizar Supabase para ${key}:`, dbErr.message);
        }
      }
    }
  }

  return result;
}
