-- thescanfood schema
-- Rodar no SQL Editor do Supabase

-- Products (global registry)
CREATE TABLE products (
  barcode TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'food',
  after_open_days INT,
  brand TEXT,
  image_url TEXT,
  quantity TEXT,
  first_scanned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Everyone can read products
CREATE POLICY "products_read_all" ON products FOR SELECT USING (true);
-- Anyone can insert products (even anonymous, identified by barcode)
CREATE POLICY "products_insert_all" ON products FOR INSERT WITH CHECK (true);
-- Only creator can update
CREATE POLICY "products_update_owner" ON products
  FOR UPDATE USING (first_scanned_by = auth.uid());

-- Pantry items (user-specific)
CREATE TABLE pantry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  barcode TEXT NOT NULL REFERENCES products(barcode),
  opened_date DATE,
  expiry_date DATE,
  after_open_days INT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, barcode)
);

ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;

-- Only the owner can see their items
CREATE POLICY "pantry_read_owner" ON pantry_items
  FOR SELECT USING (user_id = auth.uid());
-- Only the owner can insert
CREATE POLICY "pantry_insert_owner" ON pantry_items
  FOR INSERT WITH CHECK (user_id = auth.uid());
-- Only the owner can delete
CREATE POLICY "pantry_delete_owner" ON pantry_items
  FOR DELETE USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_pantry_items_user ON pantry_items(user_id);
CREATE INDEX idx_products_name ON products(name);
