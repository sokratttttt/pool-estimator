-- AI Recommendations tracking
create table if not exists ai_recommendations (
  id uuid default gen_random_uuid() primary key,
  estimate_id text,
  recommendation_type text not null,
  recommendation_text text not null,
  recommendation_data jsonb,
  user_action text, -- 'accepted', 'rejected', 'ignored'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table ai_recommendations enable row level security;

-- Anyone can read recommendations
create policy "Anyone can view recommendations"
  on ai_recommendations for select
  using (true);

-- Authenticated users can create
create policy "Authenticated users can create recommendations"
  on ai_recommendations for insert
  with check (auth.uid() is not null);

-- Index
create index ai_recommendations_estimate_id_idx on ai_recommendations(estimate_id);
create index ai_recommendations_created_at_idx on ai_recommendations(created_at desc);
