-- Migration: Create user study preferences table
-- Created: 2025-11-03
-- Feature: Bidirectional Cards (003-bidirectional-cards)
-- Description: Creates table to store user study mode preferences

-- Create user study preferences table
CREATE TABLE IF NOT EXISTS user_study_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_direction TEXT NOT NULL DEFAULT 'tibetan_to_english' 
    CHECK (preferred_direction IN ('tibetan_to_english', 'english_to_tibetan')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE user_study_preferences IS 'User preferences for study mode direction (Tibetan-first or English-first).';
COMMENT ON COLUMN user_study_preferences.preferred_direction IS 'Default study direction: tibetan_to_english (Tibetan on front) or english_to_tibetan (English on front).';
COMMENT ON COLUMN user_study_preferences.created_at IS 'Timestamp when preference was first created.';
COMMENT ON COLUMN user_study_preferences.updated_at IS 'Timestamp when preference was last updated.';

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_user_study_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_study_preferences_updated_at_trigger ON user_study_preferences;
CREATE TRIGGER update_user_study_preferences_updated_at_trigger
  BEFORE UPDATE ON user_study_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_study_preferences_updated_at();

