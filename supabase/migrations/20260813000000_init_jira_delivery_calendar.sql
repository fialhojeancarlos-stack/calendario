-- Migration: 20260813000000_init_jira_delivery_calendar.sql
-- Description: Database schema for Jira Delivery Calendar cache, projects, field mappings, and sync logs.

-- 1. Projects Table
create table if not exists projects (
  key text primary key,              -- ex.: PAT30
  name text not null,                -- ex.: Patrimônio Mobiliário
  active boolean default true
);

-- 2. Issues Cache Table
create table if not exists issues_cache (
  issue_key text primary key,        -- ex.: PAT30-1234
  issue_id text,
  summary text,
  issue_type text,
  status text,
  status_category text,
  assignee_name text,
  assignee_avatar text,
  project_key text references projects(key) on delete cascade,
  client text,
  sprint_id text,
  sprint_name text,
  due_date date not null,            -- customfield_10224
  url text,
  raw jsonb,
  synced_at timestamptz default now()
);

-- Indexes for fast query filtering
create index if not exists idx_issues_cache_due_date on issues_cache (due_date);
create index if not exists idx_issues_cache_project_key on issues_cache (project_key);
create index if not exists idx_issues_cache_sprint_name on issues_cache (sprint_name);
create index if not exists idx_issues_cache_client on issues_cache (client);

-- 3. Field Mapping Table
create table if not exists field_mapping (
  logical_name text primary key,     -- 'sprint', 'client', 'due_date'
  field_id text not null,
  updated_at timestamptz default now()
);

-- 4. Sync Log Table
create table if not exists sync_log (
  id bigserial primary key,
  started_at timestamptz default now(),
  finished_at timestamptz,
  range_start date,
  range_end date,
  pages_fetched int,
  issues_fetched int,
  status text,                       -- success | partial | error
  error_message text
);

-- 5. Enable Row Level Security (RLS)
alter table projects enable row level security;
alter table issues_cache enable row level security;
alter table field_mapping enable row level security;
alter table sync_log enable row level security;

-- Read policies for public/authenticated users
create policy "Allow read access for all on projects" on projects for select using (true);
create policy "Allow read access for all on issues_cache" on issues_cache for select using (true);
create policy "Allow read access for all on field_mapping" on field_mapping for select using (true);
create policy "Allow read access for all on sync_log" on sync_log for select using (true);

-- Insert policies for service role / edge functions
create policy "Allow all for service_role on projects" on projects for all using (auth.role() = 'service_role');
create policy "Allow all for service_role on issues_cache" on issues_cache for all using (auth.role() = 'service_role');
create policy "Allow all for service_role on field_mapping" on field_mapping for all using (auth.role() = 'service_role');
create policy "Allow all for service_role on sync_log" on sync_log for all using (auth.role() = 'service_role');
