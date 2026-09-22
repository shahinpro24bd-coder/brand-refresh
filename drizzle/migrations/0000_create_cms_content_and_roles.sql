-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

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

CREATE POLICY "Users can read own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Text overrides
CREATE TABLE public.site_text (
  lang text NOT NULL CHECK (lang IN ('en','ar','fa')),
  key text NOT NULL,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (lang, key)
);

GRANT SELECT ON public.site_text TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_text TO authenticated;
GRANT ALL ON public.site_text TO service_role;

ALTER TABLE public.site_text ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site text is publicly readable"
ON public.site_text FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can insert site text"
ON public.site_text FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site text"
ON public.site_text FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site text"
ON public.site_text FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Image overrides
CREATE TABLE public.site_image (
  key text PRIMARY KEY,
  url text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_image TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_image TO authenticated;
GRANT ALL ON public.site_image TO service_role;

ALTER TABLE public.site_image ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site images are publicly readable"
ON public.site_image FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can insert site images"
ON public.site_image FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site images"
ON public.site_image FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site images"
ON public.site_image FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));