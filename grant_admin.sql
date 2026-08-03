-- Donne le rôle "admin" à l'utilisateur agenceedigit@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'agenceedigit@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
