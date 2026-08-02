CREATE OR REPLACE FUNCTION public.attach_trade_in_photos(_id uuid, _photos text[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated int;
BEGIN
  IF _photos IS NULL OR array_length(_photos, 1) IS NULL OR array_length(_photos, 1) > 8 THEN
    RETURN false;
  END IF;
  IF EXISTS (SELECT 1 FROM unnest(_photos) p WHERE length(p) > 300 OR p !~ '^permute/[A-Za-z0-9._/-]+$') THEN
    RETURN false;
  END IF;
  UPDATE public.trade_in_requests t
     SET photos = _photos
   WHERE t.id = _id
     AND coalesce(array_length(t.photos, 1), 0) = 0
     AND t.created_at > now() - interval '1 hour';
  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated > 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.attach_trade_in_photos(uuid, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.attach_trade_in_photos(uuid, text[]) TO anon, authenticated;