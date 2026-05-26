create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new', 'in_progress', 'completed', 'rejected')),
  customer_name text not null,
  phone text not null,
  telegram text,
  comment text,
  country text not null check (country in ('korea', 'china', 'europe')),
  brand text not null,
  model text not null,
  year int not null,
  engine_type text not null,
  engine_volume_liters numeric,
  car_price numeric not null,
  currency text not null,
  budget_rub int not null,
  destination_city text not null,
  calculation_input jsonb not null,
  calculation_breakdown jsonb not null,
  total_rub int not null,
  budget_status text not null
);

create table if not exists public.calculation_settings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null unique,
  is_active boolean not null default false,
  settings jsonb not null,
  note text
);

create table if not exists public.lead_comments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  author_name text not null,
  body text not null,
  is_internal boolean not null default true
);

create index if not exists leads_status_created_at_idx on public.leads(status, created_at desc);
create index if not exists lead_comments_lead_id_created_at_idx on public.lead_comments(lead_id, created_at desc);
