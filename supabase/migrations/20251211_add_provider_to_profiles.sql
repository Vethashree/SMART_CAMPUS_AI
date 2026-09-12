-- Migration: 20251211_add_provider_to_profiles
-- Add provider column to track which OAuth provider was used

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT NULL;

-- Add index for provider queries
CREATE INDEX IF NOT EXISTS idx_profiles_provider 
ON public.profiles(provider);

-- Update comment for provider column
COMMENT ON COLUMN public.profiles.provider IS 'OAuth provider used for authentication (github, google, facebook, twitter, etc.)';
