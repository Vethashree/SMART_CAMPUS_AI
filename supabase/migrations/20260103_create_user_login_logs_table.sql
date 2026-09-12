-- Create user_login_logs table to track user login activities
CREATE TABLE IF NOT EXISTS user_login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  login_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  device_agent TEXT,
  session_id TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT user_id_not_empty CHECK (user_id IS NOT NULL)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS user_login_logs_user_id_idx ON user_login_logs(user_id);
CREATE INDEX IF NOT EXISTS user_login_logs_login_timestamp_idx ON user_login_logs(login_timestamp DESC);
CREATE INDEX IF NOT EXISTS user_login_logs_user_timestamp_idx ON user_login_logs(user_id, login_timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_login_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own login logs
CREATE POLICY "Users can view own login logs"
  ON user_login_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- RLS Policy: Only system can insert login logs
CREATE POLICY "System can insert login logs"
  ON user_login_logs
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Prevent updates
CREATE POLICY "Login logs cannot be updated"
  ON user_login_logs
  FOR UPDATE
  USING (FALSE);

-- RLS Policy: Prevent deletes (keep audit trail)
CREATE POLICY "Login logs cannot be deleted"
  ON user_login_logs
  FOR DELETE
  USING (FALSE);

-- Add comments for documentation
COMMENT ON TABLE user_login_logs IS 'Audit log for tracking user login activities and sessions';
COMMENT ON COLUMN user_login_logs.user_id IS 'Reference to the authenticated user';
COMMENT ON COLUMN user_login_logs.login_timestamp IS 'When the user logged in';
COMMENT ON COLUMN user_login_logs.device_agent IS 'User agent string from browser';
COMMENT ON COLUMN user_login_logs.session_id IS 'Unique session identifier';
COMMENT ON COLUMN user_login_logs.ip_address IS 'IP address of the login (if available)';
