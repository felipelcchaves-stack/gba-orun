CREATE POLICY "Admins can view any profile"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

NOTIFY pgrst, 'reload schema';