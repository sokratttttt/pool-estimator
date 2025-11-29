-- Чат между сметчиками - ИСПРАВЛЕННАЯ версия 2.0 (Final Fix)

-- Таблицы (если не существуют)
CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('dm', 'group')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS channel_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(channel_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text' CHECK (type IN ('text', 'file', 'image')),
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_edited BOOLEAN DEFAULT false
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel_id, created_at);
CREATE INDEX IF NOT EXISTS idx_channel_participants_user ON channel_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_participants_channel ON channel_participants(channel_id);
CREATE INDEX IF NOT EXISTS idx_channels_updated ON channels(updated_at DESC);

-- RLS
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Удаляем ВСЕ старые политики чтобы избежать конфликтов
DROP POLICY IF EXISTS "Users can view channels they participate in" ON channels;
DROP POLICY IF EXISTS "Users can view their own channels" ON channels;
DROP POLICY IF EXISTS "Users can create channels" ON channels;

DROP POLICY IF EXISTS "Users can view participants of their channels" ON channel_participants;
DROP POLICY IF EXISTS "Users can view their own participant records" ON channel_participants;
DROP POLICY IF EXISTS "Users can add participants when creating channel" ON channel_participants;
DROP POLICY IF EXISTS "Channel creators can add participants" ON channel_participants;

DROP POLICY IF EXISTS "Users can view messages in their channels" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- === НОВЫЕ ПОЛИТИКИ (Non-Recursive) ===

-- 1. CHANNELS
-- Видим канал, если мы его создали ИЛИ если мы в нем участвуем
CREATE POLICY "Users can view channels" 
    ON channels FOR SELECT
    USING (
        created_by = auth.uid() 
        OR 
        id IN (SELECT channel_id FROM channel_participants WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create channels" 
    ON channels FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- 2. CHANNEL_PARTICIPANTS
-- Видим только СВОИ записи участия (этого достаточно для списка чатов)
CREATE POLICY "Users can view own participation" 
    ON channel_participants FOR SELECT
    USING (user_id = auth.uid());

-- Создатель канала может добавлять участников (включая себя)
CREATE POLICY "Channel creators can add participants" 
    ON channel_participants FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT created_by FROM channels WHERE id = channel_id
        )
    );

-- 3. MESSAGES
-- Видим сообщения, если мы участник канала (проверка через channel_participants)
-- Тут важно: мы проверяем channel_participants напрямую, а не через channels, чтобы избежать лишних джойнов
CREATE POLICY "Users can view messages" 
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM channel_participants 
            WHERE channel_id = messages.channel_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages" 
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" 
    ON messages FOR UPDATE
    USING (auth.uid() = user_id);

-- Триггер обновления времени
CREATE OR REPLACE FUNCTION update_channel_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE channels 
    SET updated_at = NOW() 
    WHERE id = NEW.channel_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_channel_on_message ON messages;

CREATE TRIGGER update_channel_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_channel_timestamp();
