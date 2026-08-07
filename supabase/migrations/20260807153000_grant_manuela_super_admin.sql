-- Super administrateur : Manuela DIABATE (compte déjà inscrit)
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM auth.users u
WHERE lower(u.email) = lower('manueladiabate.avocat@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- Attribuer un rôle à un utilisateur déjà inscrit via son email (appelé par l'edge function admin-users)
CREATE OR REPLACE FUNCTION public.grant_role_by_email(_email text, _role public.app_role)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
BEGIN
  SELECT id INTO _user_id
  FROM auth.users
  WHERE lower(email) = lower(trim(_email));

  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'USER_NOT_FOUND';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN _user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_role_by_email(text, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.grant_role_by_email(text, public.app_role) TO service_role;
