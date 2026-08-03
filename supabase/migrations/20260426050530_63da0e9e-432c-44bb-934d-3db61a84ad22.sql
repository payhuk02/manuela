UPDATE auth.users
SET encrypted_password = crypt('TempPass2026!Change', gen_salt('bf')),
    updated_at = now()
WHERE email = 'agenceedigit@gmail.com';