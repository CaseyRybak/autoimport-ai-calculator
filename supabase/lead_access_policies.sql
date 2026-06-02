-- Lead table access posture for the current MVP.
-- Keep public reads disabled: anon may insert leads only, while admin reads/writes use
-- the server-side service_role key after the application admin gate.

grant usage on schema public to anon;
revoke select, update, delete on table public.leads from anon, authenticated;
revoke select, insert, update, delete on table public.lead_comments from anon, authenticated;
revoke select, insert, update, delete on table public.calculation_settings from anon, authenticated;
grant insert on table public.leads to anon;

alter table public.leads enable row level security;

drop policy if exists "Allow anonymous lead inserts" on public.leads;
create policy "Allow anonymous lead inserts"
  on public.leads
  for insert
  to anon
  with check (true);

grant usage on schema public to service_role;
grant select on table public.leads to service_role;
grant insert on table public.leads to service_role;
grant select on table public.lead_comments to service_role;
grant select on table public.calculation_settings to service_role;
revoke update on table public.leads from service_role;
grant update (status, updated_at) on table public.leads to service_role;
grant insert on table public.lead_comments to service_role;
