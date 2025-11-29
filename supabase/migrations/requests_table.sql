-- Migration: Create requests table for managing client requests/leads
-- This table stores all incoming requests from clients with their status tracking

-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Client information
  client_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  
  -- Request details
  request_type TEXT NOT NULL, -- 'calculator', 'equipment', 'kit', 'visualization', 'consultation'
  dimensions TEXT, -- Pool dimensions (e.g., "8x4x1.5")
  location TEXT, -- Client location/address
  
  -- Assignment and status
  manager TEXT, -- Assigned manager name
  forecast_status TEXT DEFAULT 'neutral', -- 'hot', 'warm', 'cold', 'neutral'
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'in_progress', 'contacted', 'estimate_sent', 'completed', 'cancelled'
  
  -- Additional information
  notes TEXT, -- Manager notes
  source TEXT, -- 'website', 'phone', 'email', 'referral'
  
  -- Relations
  estimate_id UUID, -- Link to generated estimate
  client_id UUID, -- Link to clients table if exists
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, -- User who created the request
  metadata JSONB DEFAULT '{}'::jsonb -- Additional flexible data
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_requests_client_name ON requests(client_name);
CREATE INDEX IF NOT EXISTS idx_requests_phone ON requests(phone);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_manager ON requests(manager);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_forecast ON requests(forecast_status);
CREATE INDEX IF NOT EXISTS idx_requests_type ON requests(request_type);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS requests_updated_at_trigger ON requests;
CREATE TRIGGER requests_updated_at_trigger
  BEFORE UPDATE ON requests
  FOR EACH ROW
  EXECUTE FUNCTION update_requests_updated_at();

-- Enable Row Level Security
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users"
  ON requests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow read access for anon users (optional, for public forms)
CREATE POLICY "Allow anon users to create requests"
  ON requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Insert some sample data for testing (optional)
INSERT INTO requests (client_name, phone, request_type, dimensions, location, manager, forecast_status, status, notes)
VALUES
  ('Иван Петров', '79001234567', 'calculator', '8x4x1.5', 'Москва, Южное Бутово', 'Платон', 'hot', 'in_progress', 'Клиент очень заинтересован, готов заказать'),
  ('Анна Сидорова', '79009876543', 'visualization', '10x5x1.8', 'Санкт-Петербург', 'Платон', 'warm', 'contacted', 'Отправлена визуализация'),
  ('Петр Иванов', '79005551234', 'kit', '6x3x1.2', 'Краснодар', null, 'cold', 'new', 'Запрос комплекта оборудования')
ON CONFLICT DO NOTHING;

-- Create view for request statistics
CREATE OR REPLACE VIEW requests_stats AS
SELECT
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE status = 'new') as new_requests,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_requests,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_requests,
  COUNT(*) FILTER (WHERE forecast_status = 'hot') as hot_leads,
  COUNT(*) FILTER (WHERE forecast_status = 'warm') as warm_leads,
  COUNT(*) FILTER (WHERE estimate_id IS NOT NULL) as converted_to_estimates,
  ROUND(
    COUNT(*) FILTER (WHERE estimate_id IS NOT NULL)::numeric / 
    NULLIF(COUNT(*)::numeric, 0) * 100, 
    2
  ) as conversion_rate
FROM requests;
