-- Create student_scores table to store quiz results
CREATE TABLE IF NOT EXISTS public.student_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stress_score INTEGER NOT NULL DEFAULT 0,
  anxiety_score INTEGER NOT NULL DEFAULT 0,
  depression_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.student_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for student_scores
CREATE POLICY "Users can view their own scores" 
ON public.student_scores 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scores" 
ON public.student_scores 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy allowing anyone to view all scores (for institute dashboard)
CREATE POLICY "Allow institute to view all scores" 
ON public.student_scores 
FOR SELECT 
USING (true);

-- Create index for better query performance
CREATE INDEX idx_student_scores_user_id ON public.student_scores(user_id);
CREATE INDEX idx_student_scores_created_at ON public.student_scores(created_at DESC);