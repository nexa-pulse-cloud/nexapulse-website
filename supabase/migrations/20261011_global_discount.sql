-- Nexapulse global percentage discount settings
CREATE TABLE IF NOT EXISTS public.store_settings (
  id integer PRIMARY KEY CHECK (id = 1),
  global_discount_enabled boolean NOT NULL DEFAULT false,
  global_discount_percent numeric NOT NULL DEFAULT 10 CHECK (global_discount_percent >= 0 AND global_discount_percent <= 90),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.store_settings (id, global_discount_enabled, global_discount_percent)
VALUES (1, false, 10)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read store settings" ON public.store_settings;
CREATE POLICY "Anyone can read store settings"
ON public.store_settings FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage store settings" ON public.store_settings;
CREATE POLICY "Admins can manage store settings"
ON public.store_settings FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
