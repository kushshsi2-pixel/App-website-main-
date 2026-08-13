-- North Eastern Lawn visual system: Cut & Collect.
-- Dedicated pre-service quote requests for newly signed-in customers.

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  property_address text not null,
  city text not null,
  state text not null,
  postal_code text not null,
  service_interests text[] not null default '{}',
  property_notes text,
  status text not null default 'submitted' check (status in ('submitted', 'reviewing', 'quoted', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quote_requests_profile_id_idx on public.quote_requests(profile_id);
drop trigger if exists quote_requests_set_updated_at on public.quote_requests;
create trigger quote_requests_set_updated_at before update on public.quote_requests for each row execute function public.set_updated_at();

alter table public.quote_requests enable row level security;
drop policy if exists quote_requests_customer_select on public.quote_requests;
create policy quote_requests_customer_select on public.quote_requests for select using (auth.uid() = profile_id);
drop policy if exists quote_requests_customer_insert on public.quote_requests;
create policy quote_requests_customer_insert on public.quote_requests for insert with check (auth.uid() = profile_id);
