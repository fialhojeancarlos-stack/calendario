import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

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
        JSON.stringify({ error: "Credenciais do Jira não configuradas." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = `Basic ${btoa(`${jiraEmail}:${jiraToken}`)}`;

    const res = await fetch(`${jiraBaseUrl}/rest/api/3/field`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Erro ao buscar campos do Jira (${res.status}): ${text}`);
    }

    const fields = await res.json();

    let sprintFieldId = "customfield_10020";
    let clientFieldId: string | null = null;
    let dueDateFieldId = "customfield_10224";

    // Discover by name
    if (Array.isArray(fields)) {
      for (const f of fields) {
        const nameLower = (f.name || "").toLowerCase();
        if (nameLower === "sprint" || nameLower.includes("sprint")) {
          sprintFieldId = f.id;
        }
        if (nameLower === "cliente" || nameLower.includes("cliente") || nameLower === "client") {
          clientFieldId = f.id;
        }
        if (nameLower.includes("data prevista") || nameLower.includes("previsão de entrega") || f.id === "customfield_10224") {
          dueDateFieldId = f.id;
        }
      }
    }

    // Save mappings
    const mappingsToUpsert = [
      { logical_name: "due_date", field_id: dueDateFieldId, updated_at: new Date().toISOString() },
      { logical_name: "sprint", field_id: sprintFieldId, updated_at: new Date().toISOString() },
    ];
    if (clientFieldId) {
      mappingsToUpsert.push({
        logical_name: "client",
        field_id: clientFieldId,
        updated_at: new Date().toISOString(),
      });
    }

    await supabase.from("field_mapping").upsert(mappingsToUpsert, { onConflict: "logical_name" });

    return new Response(
      JSON.stringify({
        success: true,
        mappings: {
          due_date: dueDateFieldId,
          sprint: sprintFieldId,
          client: clientFieldId,
        },
        allFieldsCount: Array.isArray(fields) ? fields.length : 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Falha na descoberta de campos do Jira." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
