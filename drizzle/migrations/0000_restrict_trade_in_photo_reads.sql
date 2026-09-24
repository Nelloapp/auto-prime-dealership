DROP POLICY IF EXISTS "public read car photos" ON storage.objects;
CREATE POLICY "public read car listing photos" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'car-photos' AND coalesce((storage.foldername(name))[1], '') <> 'permute');
CREATE POLICY "admins read all car photos" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'car-photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));