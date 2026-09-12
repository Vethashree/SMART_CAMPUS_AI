-- Create student_scores table to track user game results
CREATE TABLE IF NOT EXISTS student_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stress_score INTEGER NOT NULL DEFAULT 0,
  anxiety_score INTEGER NOT NULL DEFAULT 0,
  depression_score INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER GENERATED ALWAYS AS (stress_score + anxiety_score + depression_score) STORED,
  game_completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT stress_score_range CHECK (stress_score >= 0 AND stress_score <= 200),
  CONSTRAINT anxiety_score_range CHECK (anxiety_score >= 0 AND anxiety_score <= 200),
  CONSTRAINT depression_score_range CHECK (depression_score >= 0 AND depression_score <= 200)
);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS student_scores_user_id_idx ON student_scores(user_id);
CREATE INDEX IF NOT EXISTS student_scores_created_at_idx ON student_scores(created_at DESC);
CREATE INDEX IF NOT EXISTS student_scores_user_date_idx ON student_scores(user_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE student_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own scores
CREATE POLICY "Users can view own scores"
  ON student_scores
  FOR SELECT
  USING (user_id = auth.uid());

-- RLS Policy: Only authenticated users can insert their own scores
CREATE POLICY "Users can insert own scores"
  ON student_scores
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: Prevent direct updates (use function instead)
CREATE POLICY "Users cannot update scores directly"
  ON student_scores
  FOR UPDATE
  USING (FALSE);

-- RLS Policy: Prevent direct deletes
CREATE POLICY "Users cannot delete scores"
  ON student_scores
  FOR DELETE
  USING (FALSE);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_student_scores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER student_scores_updated_at_trigger
BEFORE UPDATE ON student_scores
FOR EACH ROW
EXECUTE FUNCTION update_student_scores_updated_at();

-- Add comment to table
COMMENT ON TABLE student_scores IS 'Stores mental health assessment scores from the game for each user completion';
COMMENT ON COLUMN student_scores.user_id IS 'Reference to the authenticated user';
COMMENT ON COLUMN student_scores.stress_score IS 'Stress assessment score (0-200)';
COMMENT ON COLUMN student_scores.anxiety_score IS 'Anxiety assessment score (0-200)';
COMMENT ON COLUMN student_scores.depression_score IS 'Depression assessment score (0-200)';
COMMENT ON COLUMN student_scores.total_score IS 'Sum of all three scores';
COMMENT ON COLUMN student_scores.game_completed_at IS 'When the game was completed';
