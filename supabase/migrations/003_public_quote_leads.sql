-- North Eastern Lawn 2027 public customer pipeline.
create table if not exists public.public_quote_leads (
  id uuid primary key default gen_random_uuid(),
  property_address text not null,
  postal_code text not null,
  service_interest text not null,
  full_name text not null,
  phone text not null,
  email text not null,
  source text not null default 'website_2027',
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'scheduled', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists public_quote_leads_created_at_idx on public.public_quote_leads(created_at desc);
alter table public.public_quote_leads enable row level security;
drop policy if exists public_quote_leads_website_insert on public.public_quote_leads;
create policy public_quote_leads_website_insert on public.public_quote_leads
  for insert to anon, authenticated
  with check (
    char_length(trim(property_address)) >= 5
    and char_length(trim(postal_code)) >= 3
    and char_length(trim(service_interest)) >= 3
    and char_length(trim(full_name)) >= 2
    and char_length(trim(phone)) >= 7
    and char_length(trim(email)) >= 5
  );
