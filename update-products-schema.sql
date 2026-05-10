
-- Add product_code column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_code TEXT UNIQUE;

-- Populate existing products with a default code based on app_name
UPDATE public.products 
SET product_code = LOWER(REPLACE(app_name, ' ', '-'))
WHERE product_code IS NULL;
