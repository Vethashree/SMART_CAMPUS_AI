-- Update handle_new_user function to include register_number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    avatar_url,
    register_number,
    registration_completed
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'register_number',
    CASE 
      WHEN new.raw_user_meta_data->>'register_number' IS NOT NULL THEN true 
      ELSE false 
    END
  );
  
  -- Insert into user_roles if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'student');
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
