-- Создание таблицы версий приложения
CREATE TABLE IF NOT EXISTS app_version (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version TEXT NOT NULL,
    release_notes TEXT,
    force_update BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE app_version ENABLE ROW LEVEL SECURITY;

-- Разрешаем чтение всем (публичная таблица)
DROP POLICY IF EXISTS "Public read access" ON app_version;
CREATE POLICY "Public read access" ON app_version FOR SELECT USING (true);

-- Вставляем текущую версию, если таблица пустая
INSERT INTO app_version (version, release_notes)
SELECT '1.1.5', 'Initial version check'
WHERE NOT EXISTS (SELECT 1 FROM app_version);
