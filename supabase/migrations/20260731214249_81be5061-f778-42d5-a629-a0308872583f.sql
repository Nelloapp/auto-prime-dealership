ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS logo_path text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS logo_height integer NOT NULL DEFAULT 128,
  ADD COLUMN IF NOT EXISTS hero_image_path text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS color_primary text NOT NULL DEFAULT '#d62828',
  ADD COLUMN IF NOT EXISTS color_accent text NOT NULL DEFAULT '#d6d6d6',
  ADD COLUMN IF NOT EXISTS color_background text NOT NULL DEFAULT '#0d0f14',
  ADD COLUMN IF NOT EXISTS color_header text NOT NULL DEFAULT '#08090c',
  ADD COLUMN IF NOT EXISTS show_admin_link boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS nav_items jsonb NOT NULL DEFAULT '[{"to":"/","label":"Home","visible":true},{"to":"/catalogo","label":"Catalogo","visible":true},{"to":"/permuta","label":"Valuta la tua auto","visible":true},{"to":"/contatti","label":"Chi siamo","visible":true}]'::jsonb;