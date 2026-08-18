import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'jira_calendar_supabase_url';
const STORAGE_ANON_KEY = 'jira_calendar_supabase_anon_key';

function getCredentials() {
  const windowEnv = (typeof window !== 'undefined' && (window as any).__ENV) || {};
  const meta = import.meta as any;
  const envUrl = windowEnv.VITE_SUPABASE_URL || meta?.env?.VITE_SUPABASE_URL || (typeof process !== 'undefined' && process.env ? process.env.VITE_SUPABASE_URL : '') || '';
  const envKey = windowEnv.VITE_SUPABASE_ANON_KEY || meta?.env?.VITE_SUPABASE_ANON_KEY || (typeof process !== 'undefined' && process.env ? process.env.VITE_SUPABASE_ANON_KEY : '') || '';

  const storedUrl = localStorage.getItem(STORAGE_URL_KEY) || '';
  const storedKey = localStorage.getItem(STORAGE_ANON_KEY) || '';

  let url = (storedUrl || envUrl || '').trim();
  let key = (storedKey || envKey || '').trim();

  // Strip wrapping quotes if user pasted quotes in .env
  if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
    url = url.slice(1, -1).trim();
  }
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }

  return { url, key };
}

let client: SupabaseClient | null = null;

function initClient(): SupabaseClient | null {
  const { url, key } = getCredentials();
  if (!url || !key) {
    return null;
  }

  try {
    let formattedUrl = url;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    client = createClient(formattedUrl, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return client;
  } catch (err) {
    console.warn('[SupabaseClient] Erro ao instanciar cliente:', err);
    return null;
  }
}

client = initClient();

export function getSupabase(): SupabaseClient | null {
  if (!client) {
    client = initClient();
  }
  return client;
}

export function configureSupabase(url: string, anonKey: string): SupabaseClient | null {
  localStorage.setItem(STORAGE_URL_KEY, url.trim());
  localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
  client = initClient();
  return client;
}

export const supabase = getSupabase();
