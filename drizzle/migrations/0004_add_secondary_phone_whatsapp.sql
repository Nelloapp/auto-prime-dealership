ALTER TABLE public.site_settings
  ADD COLUMN phone_secondary text not null default '',
  ADD COLUMN whatsapp_secondary text not null default '';