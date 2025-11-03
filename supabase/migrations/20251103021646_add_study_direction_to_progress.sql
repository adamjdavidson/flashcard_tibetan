-- Migration: Add study_direction to card_progress table
-- Created: 2025-11-03
-- Feature: Bidirectional Cards (003-bidirectional-cards)
-- Description: Adds study_direction column to support separate progress tracking per direction

-- Remove old unique constraint if it exists
ALTER TABLE card_progress 
DROP CONSTRAINT IF EXISTS card_progress_user_id_card_id_key;

-- Add study_direction column
ALTER TABLE card_progress 
ADD COLUMN IF NOT EXISTS study_direction TEXT NULL 
CHECK (study_direction IS NULL OR study_direction IN ('tibetan_to_english', 'english_to_tibetan'));

-- Add new composite unique constraint (user_id, card_id, study_direction)
ALTER TABLE card_progress 
DROP CONSTRAINT IF EXISTS card_progress_user_card_direction_unique;

ALTER TABLE card_progress 
ADD CONSTRAINT card_progress_user_card_direction_unique 
UNIQUE(user_id, card_id, study_direction);

-- Add index for querying by direction
CREATE INDEX IF NOT EXISTS idx_card_progress_direction 
ON card_progress(user_id, card_id, study_direction);

-- Add comment for documentation
COMMENT ON COLUMN card_progress.study_direction IS 'Study direction: tibetan_to_english (Tibetan shown first) or english_to_tibetan (English shown first). NULL for legacy progress (single direction, treated as tibetan_to_english).';

