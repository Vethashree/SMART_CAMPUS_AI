
-- THIS SCRIPT CREATES A NEW ADMIN USER WITH A TEMPORARY EMAIL.
-- THE PASSWORD IS NOT SET. YOU MUST USE THE "FORGOT PASSWORD" FLOW TO SET IT.

-- 1. Create the user in auth.users
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_sent_at, confirmed_at)
VALUES
(
  '00000000-0000-0000-0000-000000000000',
  '8a5d1a47-d343-4189-9d8a-c0b39d1f9f2e', -- Pre-generated UUID for the admin user
  'authenticated',
  'authenticated',
  'admin@example.com',
  '$2a$10$V/fC.c2zCgC.d/fsO.c2z.1iJdE/eP.kT/e.p.jW/gG/jW/gG/jW/g', -- Placeholder invalid hash
  NOW(),
  '',
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin User"}',
  NOW(),
  NOW(),
  '',
  '',
  NULL,
  NOW()
);

-- 2. Create the user's profile
INSERT INTO public.profiles (id, email, full_name)
VALUES
(
  '8a5d1a47-d343-4189-9d8a-c0b39d1f9f2e', -- Must match the UUID above
  'admin@example.com',
  'Admin User'
);

-- 3. Assign the 'admin' role to the new user
INSERT INTO public.user_roles (user_id, role)
VALUES
(
  '8a5d1a47-d343-4189-9d8a-c0b39d1f9f2e', -- Must match the UUID above
  'admin'
);
