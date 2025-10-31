-- Add learning phase support to card_progress table
-- This migration adds the learning_step_index field for Anki SM-2 Learning Phase

-- Add learning_step_index column to card_progress table
ALTER TABLE card_progress 
ADD COLUMN IF NOT EXISTS learning_step_index INTEGER DEFAULT NULL;

-- Add index for faster queries on learning phase cards
CREATE INDEX IF NOT EXISTS idx_card_progress_learning_phase 
ON card_progress(user_id, learning_step_index) 
WHERE learning_step_index IS NOT NULL;

