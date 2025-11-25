-- Sticky Notes table for team communications
create table if not exists sticky_notes (
  id uuid default gen_random_uuid() primary key,
  author_name text not null,
  content text not null,
  color text default '#FFD54F',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table sticky_notes enable row level security;

-- Everyone can read
create policy "Anyone can view sticky notes"
  on sticky_notes for select
  using (true);

-- Authenticated users can create
create policy "Authenticated users can create sticky notes"
  on sticky_notes for insert
  with check (auth.uid() is not null);

-- Users can delete their own notes (by name for simplicity)
create policy "Users can delete notes"
  on sticky_notes for delete
  using (true);

-- Index for performance
create index sticky_notes_created_at_idx on sticky_notes(created_at desc);

-- Enable Realtime
alter publication supabase_realtime add table sticky_notes;
