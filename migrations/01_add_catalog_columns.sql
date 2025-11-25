-- Add columns for equipment catalog
ALTER TABLE products ADD COLUMN IF NOT EXISTS article text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory text;

-- Optional: Create an index on article for faster search
CREATE INDEX IF NOT EXISTS idx_products_article ON products(article);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
