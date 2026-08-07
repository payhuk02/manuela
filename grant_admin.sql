-- Donne le rôle "admin" (super administrateur) aux comptes autorisés
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email IN ('agenceedigit@gmail.com', 'manueladiabate.avocat@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;
