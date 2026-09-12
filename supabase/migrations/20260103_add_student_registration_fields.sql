-- Migration: 20260103_add_student_registration_fields
-- Add student registration fields to profiles table

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS register_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS class VARCHAR(100),
ADD COLUMN IF NOT EXISTS section VARCHAR(100),
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT false;

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_profiles_register_number 
ON public.profiles(register_number);

CREATE INDEX IF NOT EXISTS idx_profiles_registration_completed 
ON public.profiles(registration_completed);

-- Add comments for the new columns
COMMENT ON COLUMN public.profiles.register_number IS 'Student registration number';
COMMENT ON COLUMN public.profiles.class IS 'Student class (e.g., B.Tech Year 2)';
COMMENT ON COLUMN public.profiles.section IS 'Student section (e.g., A, B, C)';
COMMENT ON COLUMN public.profiles.department IS 'Student department (e.g., Computer Science)';
COMMENT ON COLUMN public.profiles.registration_completed IS 'Whether student has completed the registration form';
