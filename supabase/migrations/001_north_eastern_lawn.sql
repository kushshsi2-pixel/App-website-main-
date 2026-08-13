-- North Eastern Lawn visual system: Field Notes & Fine Lines.
-- Customer portal schema: profiles, properties, service plans, visits, invoices, and requests.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'staff', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  nickname text,
  address_line1 text not null,
  city text not null,
  state text not null,
  postal_code text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_plans (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  service_type text not null,
  cadence text not null check (cadence in ('weekly', 'biweekly', 'monthly', 'seasonal', 'one_time')),
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'cancelled')),
  starts_on date,
  ends_on date,
  notes_for_customer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_visits (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  service_plan_id uuid references public.service_plans(id) on delete set null,
  service_type text not null,
  scheduled_start timestamptz,
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'weather_hold', 'cancelled')),
  notes_for_customer text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  invoice_number text not null unique,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'USD' check (currency = 'USD'),
  due_date date,
  status text not null default 'draft' check (status in ('draft', 'open', 'paid', 'void', 'overdue')),
  issued_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  service_type text not null,
  preferred_date date not null,
  notes text,
  status text not null default 'submitted' check (status in ('submitted', 'reviewing', 'scheduled', 'declined', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists properties_profile_id_idx on public.properties(profile_id);
create index if not exists service_plans_profile_id_idx on public.service_plans(profile_id);
create index if not exists service_visits_property_id_idx on public.service_visits(property_id);
create index if not exists invoices_profile_id_idx on public.invoices(profile_id);
create index if not exists service_requests_profile_id_idx on public.service_requests(profile_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'))
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.preserve_customer_role()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() = old.id then
    new.role = old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at before update on public.properties for each row execute function public.set_updated_at();
drop trigger if exists service_plans_set_updated_at on public.service_plans;
create trigger service_plans_set_updated_at before update on public.service_plans for each row execute function public.set_updated_at();
drop trigger if exists service_visits_set_updated_at on public.service_visits;
create trigger service_visits_set_updated_at before update on public.service_visits for each row execute function public.set_updated_at();
drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at before update on public.invoices for each row execute function public.set_updated_at();
drop trigger if exists service_requests_set_updated_at on public.service_requests;
create trigger service_requests_set_updated_at before update on public.service_requests for each row execute function public.set_updated_at();
drop trigger if exists profiles_preserve_customer_role on public.profiles;
create trigger profiles_preserve_customer_role before update on public.profiles for each row execute function public.preserve_customer_role();
drop trigger if exists auth_user_create_profile on auth.users;
create trigger auth_user_create_profile after insert on auth.users for each row execute function public.create_profile_for_new_user();

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.service_plans enable row level security;
alter table public.service_visits enable row level security;
alter table public.invoices enable row level security;
alter table public.service_requests enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = id);

drop policy if exists properties_customer_access on public.properties;
create policy properties_customer_access on public.properties for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
drop policy if exists service_plans_customer_select on public.service_plans;
create policy service_plans_customer_select on public.service_plans for select using (auth.uid() = profile_id);
drop policy if exists visits_customer_select on public.service_visits;
create policy visits_customer_select on public.service_visits for select using (exists (select 1 from public.properties p where p.id = service_visits.property_id and p.profile_id = auth.uid()));
drop policy if exists invoices_customer_select on public.invoices;
create policy invoices_customer_select on public.invoices for select using (auth.uid() = profile_id);
drop policy if exists requests_customer_select on public.service_requests;
create policy requests_customer_select on public.service_requests for select using (auth.uid() = profile_id);
drop policy if exists requests_customer_insert on public.service_requests;
create policy requests_customer_insert on public.service_requests for insert with check (auth.uid() = profile_id and exists (select 1 from public.properties p where p.id = service_requests.property_id and p.profile_id = auth.uid()));
