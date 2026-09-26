ALTER TABLE public.site_settings
  ADD COLUMN google_maps_url text not null default '',
  ADD COLUMN google_rating numeric not null default 0,
  ADD COLUMN google_reviews_count integer not null default 0;