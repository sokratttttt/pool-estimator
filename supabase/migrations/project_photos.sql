-- Создание хранилища для фотографий проектов
-- Create storage bucket for project photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-photos', 'project-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Создание таблицы для метаданных фотографий
CREATE TABLE IF NOT EXISTS project_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estimate_id TEXT NOT NULL,
    file_path TEXT NOT NULL,
    caption TEXT,
    stage TEXT CHECK (stage IN ('excavation', 'foundation', 'installation', 'plumbing', 'electrical', 'finishing', 'completion', 'other')),
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_file_path UNIQUE (file_path)
);

-- Включаем RLS для таблицы
ALTER TABLE project_photos ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы project_photos

-- 1. SELECT: Все могут читать фотографии
CREATE POLICY "Anyone can view project photos"
ON project_photos FOR SELECT
USING (true);

-- 2. INSERT: Аутентифицированные пользователи могут загружать фото
CREATE POLICY "Authenticated users can upload photos"
ON project_photos FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 3. DELETE: Пользователи могут удалять только свои фото
CREATE POLICY "Users can delete own photos"
ON project_photos FOR DELETE
USING (auth.uid() = uploaded_by);

-- 4. UPDATE: Пользователи могут редактировать только свои фото
CREATE POLICY "Users can update own photos"
ON project_photos FOR UPDATE
USING (auth.uid() = uploaded_by);

-- Удаляем старые политики Storage, если они есть
DROP POLICY IF EXISTS "Users can upload project photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view project photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own project photos" ON storage.objects;

-- Политики для Storage bucket

-- 1. INSERT: Аутентифицированные пользователи могут загружать файлы
CREATE POLICY "Users can upload project photos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'project-photos' AND
    auth.role() = 'authenticated'
);

-- 2. SELECT: Все могут просматривать фото (публичный bucket)
CREATE POLICY "Anyone can view project photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-photos');

-- 3. DELETE: Пользователи могут удалять только свои файлы
-- Путь: estimate_id/user_id/filename
CREATE POLICY "Users can delete own project photos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'project-photos' AND
    auth.uid()::text = (storage.foldername(name))[2]
);

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_project_photos_estimate_id ON project_photos(estimate_id);
CREATE INDEX IF NOT EXISTS idx_project_photos_stage ON project_photos(stage);
CREATE INDEX IF NOT EXISTS idx_project_photos_uploaded_by ON project_photos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_project_photos_uploaded_at ON project_photos(uploaded_at DESC);
