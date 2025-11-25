-- Kanban Deal Board tables
create table if not exists deals (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  client_name text not null,
  client_email text,
  client_phone text,
  stage text not null default 'leads',
  value decimal(12, 2),
  probability integer default 50,
  pool_type text,
  pool_size text,
  estimate_id text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  closed_at timestamp with time zone,
  user_id uuid references auth.users(id)
);

-- Deal activities (audit trail)
create table if not exists deal_activities (
  id uuid default gen_random_uuid() primary key,
  deal_id uuid references deals(id) on delete cascade,
  activity_type text not null, -- 'stage_change', 'note', 'call', 'email', 'meeting'
  old_value text,
  new_value text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id)
);

-- Enable RLS
alter table deals enable row level security;
alter table deal_activities enable row level security;

-- Deals policies
create policy "Anyone can view deals"
  on deals for select
  using (true);

create policy "Authenticated users can create deals"
  on deals for insert
  with check (auth.uid() is not null);

create policy "Authenticated users can update deals"
  on deals for update
  using (auth.uid() is not null);

create policy "Authenticated users can delete deals"
  on deals for delete
  using (auth.uid() is not null);

-- Activities policies
create policy "Anyone can view activities"
  on deal_activities for select
  using (true);

create policy "Authenticated users can create activities"
  on deal_activities for insert
  with check (auth.uid() is not null);

-- Indexes
create index deals_stage_idx on deals(stage);
create index deals_created_at_idx on deals(created_at desc);
create index deals_value_idx on deals(value desc);
create index deal_activities_deal_id_idx on deal_activities(deal_id);
create index deal_activities_created_at_idx on deal_activities(created_at desc);

-- Function to auto-update updated_at
create or replace function update_deals_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger deals_updated_at_trigger
  before update on deals
  for each row
  execute function update_deals_updated_at();

-- Insert sample data
insert into deals (title, client_name, client_email, client_phone, stage, value, probability, pool_type, pool_size, notes) values
  ('Бассейн для семьи Ивановых', 'Иван Иванов', 'ivanov@mail.ru', '+7 916 123-4567', 'estimate_sent', 3200000, 75, 'standard', '8x4м', 'Заинтересованы в подогреве'),
  ('Премиум проект на Рублевке', 'Петр Сидоров', 'petr.s@gmail.com', '+7 925 987-6543', 'negotiation', 8500000, 60, 'premium', '12x6м', 'VIP клиент, требуется быстрый старт'),
  ('Детский бассейн для садика', 'Детский сад №5', 'ds5@edu.ru', '+7 495 111-2233', 'leads', 2100000, 30, 'kids', '6x3м', 'Тендер, ждем одобрения бюджета'),
  ('Спортивный комплекс', 'Фитнес-центр "Атлант"', 'info@atlant.ru', '+7 495 444-5566', 'contract', 5600000, 90, 'sport', '25x10м', 'Договор на согласовании'),
  ('Infinity pool Москва-Сити', 'ООО "Элитстрой"', 'elite@stroy.ru', '+7 499 777-8899', 'installation', 12000000, 95, 'infinity', '15x5м', 'Монтаж начат, срок 3 месяца');
