create table if not exists public.portfolio_content (
  id text primary key check (id = 'main'),
  content jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_content enable row level security;

revoke all on public.portfolio_content from anon, authenticated;
grant select on public.portfolio_content to anon;
grant all on public.portfolio_content to service_role;

create policy "Visitors can read published portfolio content"
  on public.portfolio_content for select to anon
  using (id = 'main');
