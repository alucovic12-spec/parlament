-- PARLAMENT initial production database
-- Run once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null,
  phone text not null,
  email text not null,
  reservation_date date not null,
  reservation_time time not null,
  party_size integer not null check (party_size between 1 and 12),
  occasion text not null check (occasion in ('casual','birthday','business','date','celebration','other')),
  notes text,
  consent boolean not null check (consent = true),
  locale text not null default 'hr' check (locale in ('hr','en')),
  status text not null default 'pending' check (status in ('pending','confirmed','declined','cancelled','completed','no_show')),
  staff_note text,
  idempotency_key uuid unique,
  ip_hash text not null
);

create index if not exists reservations_date_time_idx on public.reservations (reservation_date, reservation_time);
create index if not exists reservations_status_idx on public.reservations (status, created_at desc);
create index if not exists reservations_email_created_idx on public.reservations (email, created_at desc);
create index if not exists reservations_ip_created_idx on public.reservations (ip_hash, created_at desc);
alter table public.reservations enable row level security;

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  application_type text not null check (application_type in ('experienced','learner','student')),
  full_name text not null,
  phone text not null,
  start_availability text not null check (start_availability in ('now','twoWeeks','month','later')),
  motivation text not null,
  consent boolean not null check (consent = true),
  locale text not null default 'hr' check (locale in ('hr','en')),
  status text not null default 'new' check (status in ('new','contacted','interview','hired','rejected','archived')),
  staff_note text,
  idempotency_key uuid unique,
  ip_hash text not null
);

create index if not exists job_applications_status_idx on public.job_applications (status, created_at desc);
create index if not exists job_applications_phone_created_idx on public.job_applications (phone, created_at desc);
create index if not exists job_applications_ip_created_idx on public.job_applications (ip_hash, created_at desc);
alter table public.job_applications enable row level security;

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reservations_set_updated_at on public.reservations;
create trigger reservations_set_updated_at before update on public.reservations
for each row execute function public.set_updated_at();

drop trigger if exists job_applications_set_updated_at on public.job_applications;
create trigger job_applications_set_updated_at before update on public.job_applications
for each row execute function public.set_updated_at();
