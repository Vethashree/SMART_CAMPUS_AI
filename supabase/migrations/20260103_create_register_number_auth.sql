-- Create a table for register number authentication
-- This stores registration number and password hashes separately from auth table
CREATE TABLE IF NOT EXISTS register_number_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  register_number TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  profile_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT register_number_not_empty CHECK (char_length(register_number) > 0),
  CONSTRAINT password_hash_not_empty CHECK (char_length(password_hash) > 0)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS register_number_auth_register_number_idx ON register_number_auth(register_number);
CREATE INDEX IF NOT EXISTS register_number_auth_profile_id_idx ON register_number_auth(profile_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_register_number_auth_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER register_number_auth_updated_at_trigger
BEFORE UPDATE ON register_number_auth
FOR EACH ROW
EXECUTE FUNCTION update_register_number_auth_updated_at();

-- Enable RLS for security
ALTER TABLE register_number_auth ENABLE ROW LEVEL SECURITY;

-- Allow users to read only their own auth record
CREATE POLICY "Users can read their own register number auth"
  ON register_number_auth
  FOR SELECT
  USING (profile_id = auth.uid());

-- Prevent direct INSERT/UPDATE/DELETE (use functions instead)
CREATE POLICY "No direct inserts to register_number_auth"
  ON register_number_auth
  FOR INSERT
  WITH CHECK (FALSE);

CREATE POLICY "No direct updates to register_number_auth"
  ON register_number_auth
  FOR UPDATE
  USING (FALSE);

CREATE POLICY "No direct deletes to register_number_auth"
  ON register_number_auth
  FOR DELETE
  USING (FALSE);
