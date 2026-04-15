-- Create the products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  app_name TEXT NOT NULL,
  category TEXT NOT NULL,
  variants JSONB NOT NULL,
  tags TEXT[]
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow read access for all
CREATE POLICY "Enable read access for all users" ON products
  FOR SELECT USING (true);

-- Allow update for all (for admin)
CREATE POLICY "Enable update for all users" ON products
  FOR UPDATE USING (true);
  
-- Allow insert for all (for admin)
CREATE POLICY "Enable insert for all users" ON products
  FOR INSERT WITH CHECK (true);
