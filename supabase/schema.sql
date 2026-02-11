-- Run in Supabase SQL editor
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  pantry jsonb not null default '[]'::jsonb,
  meal_plan jsonb not null default '{}'::jsonb,
  nutrition jsonb not null default '{"goal":2200,"consumed":0}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can upsert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id);
