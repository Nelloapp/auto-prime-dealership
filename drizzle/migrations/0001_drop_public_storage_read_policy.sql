-- Le foto pubbliche (annunci, logo, hero) sono ora firmate lato server dalla
-- funzione getPublicSignedPhotoUrls; non serve piu una lettura pubblica diretta.
DROP POLICY IF EXISTS "public read car listing photos" ON storage.objects;