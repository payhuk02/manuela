-- Allow public visitors to read the safe team_members_public view.
-- The view intentionally omits PII columns (email, phone, office_address).
-- With security_invoker=on, anon users hit team_members RLS and get nothing,
-- so we switch the view to definer-style (security_invoker=off) which runs
-- with the view owner's privileges and bypasses the underlying table RLS.

ALTER VIEW public.team_members_public SET (security_invoker = off);

-- Ensure public read access on the view itself.
GRANT SELECT ON public.team_members_public TO anon, authenticated;