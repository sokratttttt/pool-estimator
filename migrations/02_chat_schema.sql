-- 1. Channels Table
create table if not exists channels (
  id uuid default gen_random_uuid() primary key,
  name text, -- Optional for DMs, required for groups
  type text not null check (type in ('dm', 'group')),
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Channel Participants Table
create table if not exists channel_participants (
  channel_id uuid references channels(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  last_read_at timestamp with time zone default timezone('utc'::text, now()) not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (channel_id, user_id)
);

-- 3. Messages Table
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  channel_id uuid references channels(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text,
  type text default 'text' check (type in ('text', 'image', 'file')),
  file_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies

-- Enable RLS
alter table channels enable row level security;
alter table channel_participants enable row level security;
alter table messages enable row level security;

-- Channels Policies
create policy "Users can view channels they are members of"
  on channels for select
  using (
    exists (
      select 1 from channel_participants
      where channel_participants.channel_id = channels.id
      and channel_participants.user_id = auth.uid()
    )
  );

create policy "Users can create channels"
  on channels for insert
  with check (auth.uid() = created_by);

-- Participants Policies
create policy "Users can view participants of their channels"
  on channel_participants for select
  using (
    exists (
      select 1 from channel_participants cp
      where cp.channel_id = channel_participants.channel_id
      and cp.user_id = auth.uid()
    )
  );

create policy "Users can join channels (simplified for now)"
  on channel_participants for insert
  with check (auth.uid() = user_id); 
  -- In a real app, you'd check if the user is allowed to be added by the creator

-- Messages Policies
create policy "Users can view messages in their channels"
  on messages for select
  using (
    exists (
      select 1 from channel_participants
      where channel_participants.channel_id = messages.channel_id
      and channel_participants.user_id = auth.uid()
    )
  );

create policy "Users can insert messages in their channels"
  on messages for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from channel_participants
      where channel_participants.channel_id = messages.channel_id
      and channel_participants.user_id = auth.uid()
    )
  );

-- Indexes for performance
create index messages_channel_id_idx on messages(channel_id);
create index channel_participants_user_id_idx on channel_participants(user_id);
create index channel_participants_channel_id_idx on channel_participants(channel_id);

-- Enable Realtime for these tables (Must be done AFTER creating tables)
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table channels;
alter publication supabase_realtime add table channel_participants;
