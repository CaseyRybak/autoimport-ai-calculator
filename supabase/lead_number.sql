-- Human-readable lead numbers for admin UI.
-- UUID id remains the technical primary key and route identifier.

alter table public.leads
  add column if not exists lead_number bigint;

create sequence if not exists public.leads_lead_number_seq as bigint;

alter sequence public.leads_lead_number_seq
  owned by public.leads.lead_number;

with existing_max as (
  select coalesce(max(lead_number), 0) as max_number
  from public.leads
),
numbered as (
  select
    leads.id,
    row_number() over (order by leads.created_at, leads.id) + existing_max.max_number as next_number
  from public.leads
  cross join existing_max
  where leads.lead_number is null
)
update public.leads
set lead_number = numbered.next_number
from numbered
where public.leads.id = numbered.id;

do $$
declare
  max_number bigint;
begin
  select max(lead_number) into max_number
  from public.leads;

  if max_number is null then
    perform setval('public.leads_lead_number_seq', 1, false);
  else
    perform setval('public.leads_lead_number_seq', max_number, true);
  end if;
end $$;

alter table public.leads
  alter column lead_number set default nextval('public.leads_lead_number_seq');

alter table public.leads
  alter column lead_number set not null;

create unique index if not exists leads_lead_number_key
  on public.leads(lead_number);

grant usage, select on sequence public.leads_lead_number_seq to anon, authenticated, service_role;
