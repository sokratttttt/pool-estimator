-- Project Locations table for interactive map
create table if not exists project_locations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text not null,
  latitude decimal(10, 8) not null,
  longitude decimal(11, 8) not null,
  description text,
  pool_type text default 'standard',
  completion_date date,
  image_url text,
  budget decimal(12, 2),
  estimate_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table project_locations enable row level security;

-- Everyone can read project locations
create policy "Anyone can view project locations"
  on project_locations for select
  using (true);

-- Authenticated users can create/update
create policy "Authenticated users can manage locations"
  on project_locations for all
  using (auth.uid() is not null);

-- Indexes
create index project_locations_lat_lng_idx on project_locations(latitude, longitude);
create index project_locations_completion_date_idx on project_locations(completion_date desc);
create index project_locations_pool_type_idx on project_locations(pool_type);

-- Insert sample data (Moscow area)
insert into project_locations (name, address, latitude, longitude, pool_type, completion_date, budget, description) values
  ('Бассейн на Рублевке', 'Рублево-Успенское шоссе, 45', 55.7558, 37.2173, 'premium', '2024-06-15', 8500000, 'Премиум бассейн с подогревом и гидромассажем'),
  ('Семейный бассейн Одинцово', 'г. Одинцово, ул. Садовая, 12', 55.6773, 37.2792, 'standard', '2024-08-20', 3200000, 'Классический семейный бассейн 8x4м'),
  ('Спортивный бассейн Химки', 'г. Химки, Ленинградское шоссе, 25', 55.8897, 37.4434, 'sport', '2024-05-10', 5600000, 'Спортивный бассейн 25м с дорожками'),
  ('Детский бассейн в Подмосковье', 'Истринский район, пос. Глазково', 55.9167, 36.8586, 'kids', '2024-07-30', 2100000, 'Безопасный детский бассейн с горкой'),
  ('Infinity Pool Москва-Сити', 'Пресненская наб., 12', 55.7497, 37.5389, 'infinity', '2023-12-01', 12000000, 'Панорамный infinity pool с видом на город');
