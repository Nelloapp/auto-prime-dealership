
CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TYPE public.fuel_type AS ENUM ('benzina','diesel','gpl','metano','ibrida','elettrica');
CREATE TYPE public.gearbox_type AS ENUM ('manuale','automatico');
CREATE TYPE public.car_status AS ENUM ('disponibile','venduta','riservata','in_arrivo');
CREATE TYPE public.appointment_status AS ENUM ('in_attesa','confermato','rifiutato','riprogrammato');
CREATE TYPE public.lead_status AS ENUM ('nuovo','in_lavorazione','chiuso');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.cars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  brand text NOT NULL,
  model text NOT NULL,
  version text,
  year integer NOT NULL,
  km integer NOT NULL DEFAULT 0,
  price numeric(10,2) NOT NULL,
  previous_price numeric(10,2),
  engine_size integer,
  power_hp integer,
  fuel public.fuel_type NOT NULL DEFAULT 'benzina',
  gearbox public.gearbox_type NOT NULL DEFAULT 'manuale',
  color text,
  owners integer,
  inspection_until text,
  warranty text,
  description text,
  status public.car_status NOT NULL DEFAULT 'disponibile',
  featured boolean NOT NULL DEFAULT false,
  ready_delivery boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cars TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cars TO authenticated;
GRANT ALL ON public.cars TO service_role;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read cars" ON public.cars FOR SELECT USING (true);
CREATE POLICY "admins manage cars" ON public.cars FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER cars_updated BEFORE UPDATE ON public.cars FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.car_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  url text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX car_images_car_id_idx ON public.car_images(car_id);
GRANT SELECT ON public.car_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.car_images TO authenticated;
GRANT ALL ON public.car_images TO service_role;
ALTER TABLE public.car_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read car images" ON public.car_images FOR SELECT USING (true);
CREATE POLICY "admins manage car images" ON public.car_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid REFERENCES public.cars(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  notes text,
  status public.appointment_status NOT NULL DEFAULT 'in_attesa',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.appointments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can book" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "admins manage appointments" ON public.appointments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER appointments_updated BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.trade_in_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  brand text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  km integer NOT NULL,
  fuel public.fuel_type,
  conditions text,
  notes text,
  photos text[] NOT NULL DEFAULT '{}',
  status public.lead_status NOT NULL DEFAULT 'nuovo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.trade_in_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trade_in_requests TO authenticated;
GRANT ALL ON public.trade_in_requests TO service_role;
ALTER TABLE public.trade_in_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can request valuation" ON public.trade_in_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "admins manage trade ins" ON public.trade_in_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trade_in_updated BEFORE UPDATE ON public.trade_in_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid REFERENCES public.cars(id) ON DELETE SET NULL,
  name text NOT NULL,
  contact text NOT NULL,
  message text NOT NULL,
  status public.lead_status NOT NULL DEFAULT 'nuovo',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can send message" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "admins manage messages" ON public.contact_messages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.site_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  company_name text NOT NULL DEFAULT 'Auto Prime',
  owner_name text NOT NULL DEFAULT 'Enrico Auricchio',
  vat_number text NOT NULL DEFAULT '11121961210',
  phone text NOT NULL DEFAULT '329 789 7193',
  whatsapp text NOT NULL DEFAULT '393297897193',
  email text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT 'Traversa Andolfi 11, 80045 Pompei (NA)',
  opening_hours text NOT NULL DEFAULT 'Lun-Sab 9:00-13:00 / 15:00-19:30',
  about_text text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "admins update settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.site_settings (id, about_text) VALUES (true, 'Auto Prime nasce dalla passione di Enrico Auricchio per le automobili e dalla volonta di offrire auto usate di qualita a prezzi onesti. Ogni vettura viene controllata, tagliandata e venduta con la massima trasparenza.');
