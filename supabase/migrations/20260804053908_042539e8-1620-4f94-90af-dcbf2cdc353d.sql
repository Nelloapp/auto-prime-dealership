CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  body text NOT NULL,
  car_label text,
  source text,
  published boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read published reviews" ON public.reviews
  FOR SELECT USING (published = true);

CREATE POLICY "admins manage reviews" ON public.reviews
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.reviews ADD CONSTRAINT reviews_rating_range CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE public.reviews ADD CONSTRAINT reviews_author_len CHECK (length(btrim(author_name)) BETWEEN 2 AND 80);
ALTER TABLE public.reviews ADD CONSTRAINT reviews_body_len CHECK (length(btrim(body)) BETWEEN 5 AND 1000);