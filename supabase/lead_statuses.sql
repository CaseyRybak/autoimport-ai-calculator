update public.leads
set status = 'closed'
where status = 'completed';

alter table public.leads
  drop constraint if exists leads_status_check;

alter table public.leads
  add constraint leads_status_check
  check (status in ('new', 'in_progress', 'waiting_client', 'closed', 'rejected'));

grant usage on schema public to service_role;
grant select on table public.leads to service_role;
grant insert on table public.leads to service_role;
grant update on table public.leads to service_role;
grant select, insert on table public.lead_comments to service_role;
