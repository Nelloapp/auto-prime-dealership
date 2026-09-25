GRANT INSERT ON public.reviews TO anon, authenticated;
CREATE POLICY "public can submit validated reviews" ON public.reviews FOR INSERT TO anon, authenticated
WITH CHECK (published = false AND position = 0 AND rating BETWEEN 1 AND 5
AND length(btrim(author_name)) BETWEEN 2 AND 80
AND length(btrim(body)) BETWEEN 10 AND 1000
AND (car_label IS NULL OR length(car_label) <= 80)
AND (source IS NULL OR source = 'Sito web'));