import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

interface SyncRequestBody {
  rangeStart: string; // YYYY-MM-DD
  rangeEnd: string;   // YYYY-MM-DD
  projectKeys?: string[];
  forceRefresh?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const jiraBaseUrl = (Deno.env.get("JIRA_BASE_URL") || "https://aztecnologia.atlassian.net").replace(/\/$/, "");
    const jiraEmail = Deno.env.get("JIRA_EMAIL") || "";
    const jiraToken = Deno.env.get("JIRA_API_TOKEN") || "";

    if (!jiraEmail || !jiraToken) {
      return new Response(
        JSON.stringify({
          error: "Credenciais do Jira não configuradas no servidor (JIRA_EMAIL e JIRA_API_TOKEN).",
          code: "MISSING_JIRA_CREDENTIALS",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: SyncRequestBody = await req.json().catch(() => ({ rangeStart: "", rangeEnd: "" }));
    const { rangeStart, rangeEnd, projectKeys = [] } = body;

    if (!rangeStart || !rangeEnd) {
      return new Response(
        JSON.stringify({ error: "Parâmetros rangeStart e rangeEnd são obrigatórios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = `Basic ${btoa(`${jiraEmail}:${jiraToken}`)}`;

    // 1. Discover or fetch field mappings
    let dueDateField = "customfield_10224";
    let sprintField = "customfield_10020";
    let clientField: string | null = null;

    const { data: mappings } = await supabase.from("field_mapping").select("*");
    if (mappings && mappings.length > 0) {
      mappings.forEach((m: { logical_name: string; field_id: string }) => {
        if (m.logical_name === "due_date") dueDateField = m.field_id;
        if (m.logical_name === "sprint") sprintField = m.field_id;
        if (m.logical_name === "client") clientField = m.field_id;
      });
    }

    // 2. Build JQL query
    // Types filter: História, Solicitação de Melhoria, Story
    let jql = `issuetype in ("História", "Solicitação de Melhoria", "Story") AND cf[10224] >= "${rangeStart}" AND cf[10224] <= "${rangeEnd}"`;
    if (projectKeys && projectKeys.length > 0) {
      const projectsFormatted = projectKeys.map((p) => `"${p}"`).join(",");
      jql += ` AND project in (${projectsFormatted})`;
    }
    jql += ` ORDER BY cf[10224] ASC`;

    // Fields to request
    const requestedFields = [
      "summary",
      "status",
      "assignee",
      "issuetype",
      "project",
      dueDateField,
      sprintField,
    ];
    if (clientField) {
      requestedFields.push(clientField);
    }

    // Start sync logging
    const startedAt = new Date().toISOString();
    let pagesFetched = 0;
    let issuesFetched = 0;
    let syncStatus: "success" | "partial" | "error" = "success";
    let syncErrorMessage: string | undefined = undefined;

    const allIssues: any[] = [];
    const projectsMap = new Map<string, string>();

    // Pagination loop
    let nextPageToken: string | null = null;
    let isLast = false;

    // Helper for fetch with backoff
    const fetchWithBackoff = async (url: string, options: RequestInit, retryCount = 0): Promise<Response> => {
      const res = await fetch(url, options);
      if ((res.status === 429 || res.status === 503) && retryCount < 5) {
        const retryAfter = res.headers.get("Retry-After");
        let delayMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : Math.pow(2, retryCount) * 1000;
        if (isNaN(delayMs)) delayMs = 1000;
        // add jitter
        delayMs += Math.random() * 500;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return fetchWithBackoff(url, options, retryCount + 1);
      }
      return res;
    };

    while (!isLast && pagesFetched < 200) {
      // 150ms delay between pages to avoid rate limiting
      if (pagesFetched > 0) {
        await new Promise((r) => setTimeout(r, 150));
      }

      pagesFetched++;

      // Attempt POST /rest/api/3/search/jql
      const postUrl = `${jiraBaseUrl}/rest/api/3/search/jql`;
      const postPayload: Record<string, any> = {
        jql,
        maxResults: 100,
        fields: requestedFields,
      };
      if (nextPageToken) {
        postPayload.nextPageToken = nextPageToken;
      }

      let res = await fetchWithBackoff(postUrl, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postPayload),
      });

      // Fallback to GET /rest/api/3/search if POST endpoint returns 404 or 405
      let pageIssues: any[] = [];
      if (!res.ok && (res.status === 404 || res.status === 405)) {
        const startAt = (pagesFetched - 1) * 100;
        const getUrl = `${jiraBaseUrl}/rest/api/3/search?jql=${encodeURIComponent(
          jql
        )}&startAt=${startAt}&maxResults=100&fields=${requestedFields.join(",")}`;

        res = await fetchWithBackoff(getUrl, {
          method: "GET",
          headers: {
            Authorization: authHeader,
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Erro na API do Jira (${res.status}): ${errText}`);
        }

        const data = await res.json();
        pageIssues = data.issues || [];
        issuesFetched += pageIssues.length;
        allIssues.push(...pageIssues);

        if (startAt + pageIssues.length >= (data.total || 0) || pageIssues.length === 0) {
          isLast = true;
        }
      } else {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Erro na API do Jira (${res.status}): ${errText}`);
        }

        const data = await res.json();
        pageIssues = data.issues || [];
        issuesFetched += pageIssues.length;
        allIssues.push(...pageIssues);

        nextPageToken = data.nextPageToken || null;
        isLast = data.isLast === true || !nextPageToken || pageIssues.length === 0;
      }
    }

    if (pagesFetched >= 200 && !isLast) {
      syncStatus = "partial";
      syncErrorMessage = "Limite de 200 páginas atingido durante a sincronização.";
    }

    // Process and upsert projects & issues into Postgres cache
    const formattedIssues = allIssues.map((issue) => {
      const fields = issue.fields || {};
      const proj = fields.project || {};
      if (proj.key && proj.name) {
        projectsMap.set(proj.key, proj.name);
      }

      // Extract Sprint
      let sprintName = "";
      let sprintId = "";
      const sprintRaw = fields[sprintField];
      if (Array.isArray(sprintRaw) && sprintRaw.length > 0) {
        const lastSprint = sprintRaw[sprintRaw.length - 1];
        if (typeof lastSprint === "object" && lastSprint.name) {
          sprintName = lastSprint.name;
          sprintId = String(lastSprint.id || "");
        } else if (typeof lastSprint === "string") {
          const match = lastSprint.match(/name=([^,\]]+)/);
          sprintName = match ? match[1] : lastSprint;
        }
      }

      // Extract Client
      let clientVal = "";
      if (clientField && fields[clientField]) {
        const rawClient = fields[clientField];
        if (typeof rawClient === "string") clientVal = rawClient;
        else if (typeof rawClient === "object" && rawClient.value) clientVal = rawClient.value;
        else if (Array.isArray(rawClient) && rawClient.length > 0) {
          clientVal = typeof rawClient[0] === "string" ? rawClient[0] : rawClient[0].value || "";
        }
      }

      // Extract Assignee
      const assignee = fields.assignee;

      // Extract Due Date (customfield_10224)
      const dueDateVal = fields[dueDateField] || fields.duedate || "";

      return {
        issue_key: issue.key,
        issue_id: issue.id,
        summary: fields.summary || "",
        issue_type: fields.issuetype?.name || "História",
        status: fields.status?.name || "A Fazer",
        status_category: fields.status?.statusCategory?.name || "To Do",
        assignee_name: assignee ? assignee.displayName : null,
        assignee_avatar: assignee?.avatarUrls ? assignee.avatarUrls["32x32"] : null,
        project_key: proj.key || "PAT30",
        client: clientVal || null,
        sprint_id: sprintId || null,
        sprint_name: sprintName || null,
        due_date: dueDateVal,
        url: `${jiraBaseUrl}/browse/${issue.key}`,
        raw: issue,
        synced_at: new Date().toISOString(),
      };
    }).filter((i) => Boolean(i.due_date));

    // Upsert projects
    if (projectsMap.size > 0) {
      const projectsToUpsert = Array.from(projectsMap.entries()).map(([key, name]) => ({
        key,
        name,
        active: true,
      }));
      await supabase.from("projects").upsert(projectsToUpsert, { onConflict: "key" });
    }

    // Upsert issues
    if (formattedIssues.length > 0) {
      await supabase.from("issues_cache").upsert(formattedIssues, { onConflict: "issue_key" });
    }

    // Log sync
    await supabase.from("sync_log").insert({
      started_at: startedAt,
      finished_at: new Date().toISOString(),
      range_start: rangeStart,
      range_end: rangeEnd,
      pages_fetched: pagesFetched,
      issues_fetched: issuesFetched,
      status: syncStatus,
      error_message: syncErrorMessage,
    });

    return new Response(
      JSON.stringify({
        success: true,
        issuesFetched,
        pagesFetched,
        status: syncStatus,
        warning: syncErrorMessage,
        data: formattedIssues,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Erro interno ao sincronizar com o Jira." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
