-- Nexapulse: discount pricing and multi-image product gallery
-- Run once in Supabase Dashboard > SQL Editor before deploying the new UI.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS old_price numeric,
  ADD COLUMN IF NOT EXISTS image_urls jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.products
SET image_urls = jsonb_build_array(image_url)
WHERE image_url IS NOT NULL
  AND btrim(image_url) <> ''
  AND (image_urls IS NULL OR image_urls = '[]'::jsonb);
