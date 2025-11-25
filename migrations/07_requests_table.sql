-- Requests table (аналог Google Sheets заявок)
create table if not exists requests (
  id uuid default gen_random_uuid() primary key,
  date date not null default current_date,
  phone text not null,
  type text, -- Тип
  size text, -- Размеры
  address text, -- Адрес
  work_date date, -- Дата работы
  manager text, -- Менеджер
  status text default 'new', -- new, calculated, sent, in_progress, completed
  notes text, -- Заметки
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table requests enable row level security;

-- Policies
create policy "Anyone can view requests"
  on requests for select
  using (true);

create policy "Authenticated users can manage requests"
  on requests for all
  using (auth.uid() is not null);

-- Indexes
create index requests_date_idx on requests(date desc);
create index requests_status_idx on requests(status);
create index requests_manager_idx on requests(manager);

-- Insert sample data
insert into requests (date, phone, type, size, address, work_date, manager, status, notes) values
  ('2024-11-20', '+7 916 123-4567', 'Вкрш', '6х3', 'Москва, Рублевка', '2024-12-01', 'Тамара', 'calculated', 'Хочет вкл. подогрев'),
  ('2024-11-21', '+7 925 987-6543', 'Капитал', '8х4', 'МО, Одинцово', '2024-12-05', 'Сергей', 'sent', 'VIP клиент'),
  ('2024-11-22', '+7 495 111-2233', 'Эконом', '5х3', 'Москва', '2024-11-30', 'Тамара', 'new', 'Бюджет ограничен'),
  ('2024-11-23', '+7 495 444-5566', 'Бетон', '10х4', 'Химки', '2024-12-10', 'Виктор', 'in_progress', 'Монтаж начат'),
  ('2024-11-24', '+7 499 777-8899', 'ПП', '12х5', 'Москва-Сити', '2024-12-15', 'Сергей', 'calculated', 'Премиум проект');
