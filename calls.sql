-- Calls and WebRTC signaling schema for Supabase
-- Run in Supabase SQL editor

-- 1) Core call tables
create table if not exists public.calls (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('audio','video')),
  status text not null default 'ringing' check (status in ('ringing','accepted','rejected','ended','missed')),
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.call_participants (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.calls(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'callee' check (role in ('caller','callee')),
  joined_at timestamptz,
  left_at timestamptz,
  accepted boolean,
  unique(call_id, user_id)
);

-- Signaling payloads for WebRTC offer/answer/ICE
create table if not exists public.call_signals (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.calls(id) on delete cascade,
  from_user_id uuid not null references auth.users(id) on delete cascade,
  to_user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('offer','answer','candidate','renegotiate','hangup')),
  payload jsonb not null,
  created_at timestamptz not null default now()
);

-- Optional: event log for analytics/debugging
create table if not exists public.call_events (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.calls(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  event text not null,
  meta jsonb,
  created_at timestamptz not null default now()
);

-- 2) Row Level Security
alter table public.calls enable row level security;
alter table public.call_participants enable row level security;
alter table public.call_signals enable row level security;
alter table public.call_events enable row level security;

-- Helpers: a user participates in a conversation
create or replace view public.v_user_conversations as
select cp.user_id, cp.conversation_id
from public.conversation_participants cp;

-- Calls policies
drop policy if exists calls_select on public.calls;
create policy calls_select on public.calls
for select using (
  exists (
    select 1 from public.call_participants p
    where p.call_id = calls.id and p.user_id = auth.uid()
  )
);

drop policy if exists calls_insert on public.calls;
create policy calls_insert on public.calls
for insert with check (
  created_by = auth.uid() and
  exists (
    select 1 from public.v_user_conversations v
    where v.conversation_id = calls.conversation_id and v.user_id = auth.uid()
  )
);

drop policy if exists calls_update on public.calls;
create policy calls_update on public.calls
for update using (
  exists (
    select 1 from public.call_participants p
    where p.call_id = calls.id and p.user_id = auth.uid()
  )
);

-- call_participants policies
drop policy if exists call_participants_select on public.call_participants;
create policy call_participants_select on public.call_participants
for select using (user_id = auth.uid() or
  exists (
    select 1 from public.calls c
    join public.call_participants p2 on p2.call_id = c.id
    where p2.user_id = auth.uid() and p2.call_id = call_participants.call_id
  )
);

drop policy if exists call_participants_insert on public.call_participants;
create policy call_participants_insert on public.call_participants
for insert with check (
  -- creator can insert rows for participants of their call
  exists (
    select 1 from public.calls c
    where c.id = call_participants.call_id and c.created_by = auth.uid()
  )
);

drop policy if exists call_participants_update on public.call_participants;
create policy call_participants_update on public.call_participants
for update using (
  user_id = auth.uid() or exists (
    select 1 from public.calls c where c.id = call_participants.call_id and c.created_by = auth.uid()
  )
);

-- call_signals policies
drop policy if exists call_signals_select on public.call_signals;
create policy call_signals_select on public.call_signals
for select using (
  to_user_id = auth.uid() or from_user_id = auth.uid()
);

drop policy if exists call_signals_insert on public.call_signals;
create policy call_signals_insert on public.call_signals
for insert with check (
  from_user_id = auth.uid() and exists (
    select 1 from public.call_participants p
    where p.call_id = call_signals.call_id and p.user_id = auth.uid()
  )
);

-- call_events policies (read/write if participant)
drop policy if exists call_events_select on public.call_events;
create policy call_events_select on public.call_events
for select using (
  exists (
    select 1 from public.call_participants p
    where p.call_id = call_events.call_id and p.user_id = auth.uid()
  )
);

drop policy if exists call_events_insert on public.call_events;
create policy call_events_insert on public.call_events
for insert with check (
  exists (
    select 1 from public.call_participants p
    where p.call_id = call_events.call_id and p.user_id = auth.uid()
  )
);

-- 3) Realtime publications
alter publication supabase_realtime add table public.calls;
alter publication supabase_realtime add table public.call_participants;
alter publication supabase_realtime add table public.call_signals;
-- call_events can be optional for realtime
