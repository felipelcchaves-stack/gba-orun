
-- Allow authenticated users to read achievements of any user (for community badges)
CREATE POLICY "Authenticated users can read achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to read stats of any user (for community level display)
CREATE POLICY "Authenticated users can read user stats"
  ON public.user_stats FOR SELECT
  USING (auth.uid() IS NOT NULL);
