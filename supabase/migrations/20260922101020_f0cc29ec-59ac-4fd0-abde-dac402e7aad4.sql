CREATE OR REPLACE FUNCTION public.has_any_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin');
$$;

REVOKE ALL ON FUNCTION public.has_any_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_any_admin() TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN false;
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_first_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated, service_role;

DROP POLICY IF EXISTS "Public can view site images" ON storage.objects;
CREATE POLICY "Public can view site images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'site-images');

DROP POLICY IF EXISTS "Editors can upload site images" ON storage.objects;
CREATE POLICY "Editors can upload site images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Editors can update site images" ON storage.objects;
CREATE POLICY "Editors can update site images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Editors can delete site images" ON storage.objects;
CREATE POLICY "Editors can delete site images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));