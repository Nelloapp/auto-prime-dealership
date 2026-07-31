-- 1) Lock down the SECURITY DEFINER role-check function -------------------
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT auth.uid() IS NOT NULL
     AND auth.uid() = _user_id
     AND EXISTS (
       SELECT 1 FROM public.user_roles
       WHERE user_id = _user_id AND role = _role
     );
$function$;

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;

-- 2) Appointments: validated public inserts, no public reads ---------------
DROP POLICY IF EXISTS "anyone can book" ON public.appointments;
CREATE POLICY "public can book validated appointments"
ON public.appointments
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'in_attesa'::appointment_status
  AND length(btrim(customer_name)) BETWEEN 2 AND 100
  AND length(btrim(phone)) BETWEEN 6 AND 30
  AND phone ~ '^[0-9+()\s.-]{6,30}$'
  AND (email IS NULL OR (length(email) <= 255 AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'))
  AND (notes IS NULL OR length(notes) <= 1000)
  AND length(appointment_time) <= 20
  AND appointment_date >= (CURRENT_DATE - 1)
  AND appointment_date <= (CURRENT_DATE + 365)
);

-- 3) Contact messages: validated public inserts ----------------------------
DROP POLICY IF EXISTS "anyone can send message" ON public.contact_messages;
CREATE POLICY "public can send validated messages"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'nuovo'::lead_status
  AND length(btrim(name)) BETWEEN 2 AND 100
  AND length(btrim(contact)) BETWEEN 5 AND 255
  AND length(btrim(message)) BETWEEN 5 AND 2000
);

-- 4) Trade-in requests: validated public inserts ---------------------------
DROP POLICY IF EXISTS "anyone can request valuation" ON public.trade_in_requests;
CREATE POLICY "public can request validated valuation"
ON public.trade_in_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'nuovo'::lead_status
  AND length(btrim(customer_name)) BETWEEN 2 AND 100
  AND length(btrim(phone)) BETWEEN 6 AND 30
  AND phone ~ '^[0-9+()\s.-]{6,30}$'
  AND (email IS NULL OR (length(email) <= 255 AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'))
  AND length(btrim(brand)) BETWEEN 1 AND 60
  AND length(btrim(model)) BETWEEN 1 AND 80
  AND year BETWEEN 1950 AND (EXTRACT(YEAR FROM now())::int + 1)
  AND km BETWEEN 0 AND 2000000
  AND (conditions IS NULL OR length(conditions) <= 500)
  AND (notes IS NULL OR length(notes) <= 1000)
  AND COALESCE(array_length(photos, 1), 0) <= 8
);

-- 5) Storage: restrict public trade-in photo uploads -----------------------
DROP POLICY IF EXISTS "anyone upload trade in photos" ON storage.objects;
CREATE POLICY "public upload trade in photos"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'car-photos'
  AND (storage.foldername(name))[1] = 'permute'
  AND array_length(storage.foldername(name), 1) = 1
  AND length(name) <= 200
  AND lower(storage.extension(name)) IN ('webp', 'jpg', 'jpeg', 'png')
);