-- Создание хранилища для файлов чата
-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- Удаляем старые политики, если они есть, чтобы обновить их
DROP POLICY IF EXISTS "Users can upload files to their channels" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files in their channels" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- RLS для хранилища

-- 1. INSERT: Разрешаем загрузку, если вторая папка соответствует ID пользователя
-- Путь: channel_id/user_id/filename
CREATE POLICY "Users can upload files to their channels"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'chat-files' AND
    auth.uid()::text = (storage.foldername(name))[2]
);

-- 2. SELECT: Разрешаем просмотр всем (так как bucket public, это дублирует, но для надежности)
-- Можно ограничить просмотр только участниками канала, но для публичного бакета это не обязательно
CREATE POLICY "Users can view files in their channels" 
ON storage.objects FOR SELECT
USING (
    bucket_id = 'chat-files'
);

-- 3. DELETE: Пользователи могут удалять только свои файлы
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'chat-files' AND
    auth.uid()::text = (storage.foldername(name))[2]
);
