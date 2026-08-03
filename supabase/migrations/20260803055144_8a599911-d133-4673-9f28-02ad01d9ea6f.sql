REVOKE EXECUTE ON FUNCTION public.attach_trade_in_photos(uuid, text[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.attach_trade_in_photos(uuid, text[]) TO service_role;