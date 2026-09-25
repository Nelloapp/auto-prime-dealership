CREATE TABLE public.cars_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid,
  slug text,
  brand text NOT NULL,
  model text NOT NULL,
  version text,
  year integer,
  km integer,
  price numeric,
  status text,
  sold_price numeric,
  notes text,
  snapshot jsonb NOT NULL,
  deleted_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cars_history TO authenticated;
GRANT ALL ON public.cars_history TO service_role;

ALTER TABLE public.cars_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage cars history"
ON public.cars_history
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));