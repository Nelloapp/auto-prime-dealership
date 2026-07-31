
CREATE POLICY "public read car photos" ON storage.objects FOR SELECT USING (bucket_id = 'car-photos');
CREATE POLICY "admins upload car photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'car-photos' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update car photos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'car-photos' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete car photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'car-photos' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "anyone upload trade in photos" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'car-photos' AND (storage.foldername(name))[1] = 'permute');
