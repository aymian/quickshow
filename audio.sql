-- Audio messages schema for Supabase
-- Run in Supabase SQL editor

-- Create bucket named 'audio' if it doesn't exist
insert into storage.buckets (id, name, public)
values ('audio', 'audio', true)
on conflict (id) do nothing;

-- 2) Audio messages table
create table if not exists public.audio_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  duration_seconds numeric,
  waveform jsonb,
  transcription text,
  created_at timestamptz not null default now()
);

-- 3) RLS
alter table public.audio_messages enable row level security;

-- A user in the conversation can read
drop policy if exists audio_messages_select on public.audio_messages;
create policy audio_messages_select on public.audio_messages
for select using (
  exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = audio_messages.conversation_id
      and cp.user_id = auth.uid()
  )
);

-- Only participants can insert; sender must be auth.uid
drop policy if exists audio_messages_insert on public.audio_messages;
create policy audio_messages_insert on public.audio_messages
for insert with check (
  sender_id = auth.uid() and exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = audio_messages.conversation_id
      and cp.user_id = auth.uid()
  )
);

-- Only sender can update/delete their audio records
drop policy if exists audio_messages_update on public.audio_messages;
create policy audio_messages_update on public.audio_messages
for update using (sender_id = auth.uid());

drop policy if exists audio_messages_delete on public.audio_messages;
create policy audio_messages_delete on public.audio_messages
for delete using (sender_id = auth.uid());

-- 4) Realtime publication
alter publication supabase_realtime add table public.audio_messages;
