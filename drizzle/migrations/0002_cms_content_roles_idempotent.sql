DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'app_role'
  ) THEN
    CREATE TYPE public.app_role AS ENUM ('admin');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Users can read own roles'
  ) THEN
    CREATE POLICY "Users can read own roles"
    ON public.user_roles FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

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

CREATE TABLE IF NOT EXISTS public.site_text (
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_text' AND policyname = 'Site text is publicly readable'
  ) THEN
    CREATE POLICY "Site text is publicly readable"
    ON public.site_text FOR SELECT TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_text' AND policyname = 'Admins can insert site text'
  ) THEN
    CREATE POLICY "Admins can insert site text"
    ON public.site_text FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_text' AND policyname = 'Admins can update site text'
  ) THEN
    CREATE POLICY "Admins can update site text"
    ON public.site_text FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_text' AND policyname = 'Admins can delete site text'
  ) THEN
    CREATE POLICY "Admins can delete site text"
    ON public.site_text FOR DELETE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.site_image (
  key text PRIMARY KEY,
  url text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_image TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_image TO authenticated;
GRANT ALL ON public.site_image TO service_role;

ALTER TABLE public.site_image ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_image' AND policyname = 'Site images are publicly readable'
  ) THEN
    CREATE POLICY "Site images are publicly readable"
    ON public.site_image FOR SELECT TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_image' AND policyname = 'Admins can insert site images'
  ) THEN
    CREATE POLICY "Admins can insert site images"
    ON public.site_image FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_image' AND policyname = 'Admins can update site images'
  ) THEN
    CREATE POLICY "Admins can update site images"
    ON public.site_image FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_image' AND policyname = 'Admins can delete site images'
  ) THEN
    CREATE POLICY "Admins can delete site images"
    ON public.site_image FOR DELETE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can upload site images'
  ) THEN
    CREATE POLICY "Admins can upload site images"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can update site images'
  ) THEN
    CREATE POLICY "Admins can update site images"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'))
    WITH CHECK (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can read site images'
  ) THEN
    CREATE POLICY "Admins can read site images"
    ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;