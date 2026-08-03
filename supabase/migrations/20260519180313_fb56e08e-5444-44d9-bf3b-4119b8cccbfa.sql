CREATE POLICY "Public can read published team members"
ON public.team_members
FOR SELECT
TO anon, authenticated
USING (published = true);