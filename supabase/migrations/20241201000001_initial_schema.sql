-- Supabase Database Schema for Tibetan Flashcard App
-- This migration sets up the initial database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles table (for admin access control)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cards table (SHARED/GLOBAL - no user_id)
-- All users can read, only admins can write
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('number', 'word', 'phrase')),
  front TEXT NOT NULL,
  back_arabic TEXT,
  back_english TEXT,
  back_tibetan_script TEXT,
  back_tibetan_numeral TEXT,
  back_tibetan_spelling TEXT,
  tags TEXT[] DEFAULT '{}',
  subcategory TEXT,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Card progress table (per-user)
CREATE TABLE IF NOT EXISTS card_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  interval INTEGER DEFAULT 1,
  ease_factor REAL DEFAULT 2.5,
  repetitions INTEGER DEFAULT 0,
  quality INTEGER,
  last_review_date BIGINT,
  next_review_date BIGINT,
  review_count INTEGER DEFAULT 0,
  UNIQUE(user_id, card_id),
  CONSTRAINT check_quality CHECK (quality IS NULL OR quality IN (0, 1, 3, 5))
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_card_progress_user_id ON card_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_card_progress_card_id ON card_progress(card_id);
CREATE INDEX IF NOT EXISTS idx_card_progress_next_review ON card_progress(next_review_date);
CREATE INDEX IF NOT EXISTS idx_cards_type ON cards(type);
CREATE INDEX IF NOT EXISTS idx_cards_tags ON cards USING GIN(tags);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_cards_updated_at ON cards;
CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_progress ENABLE ROW LEVEL SECURITY;

-- User roles policies
-- Users can read their own role
DROP POLICY IF EXISTS "Users can read their own role" ON user_roles;
CREATE POLICY "Users can read their own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Cards policies
-- Everyone can read cards (public)
DROP POLICY IF EXISTS "Anyone can read cards" ON cards;
CREATE POLICY "Anyone can read cards"
  ON cards FOR SELECT
  USING (true);

-- Only admins can insert/update/delete cards
DROP POLICY IF EXISTS "Admins can insert cards" ON cards;
CREATE POLICY "Admins can insert cards"
  ON cards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update cards" ON cards;
CREATE POLICY "Admins can update cards"
  ON cards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete cards" ON cards;
CREATE POLICY "Admins can delete cards"
  ON cards FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Card progress policies
-- Users can read their own progress
DROP POLICY IF EXISTS "Users can read their own progress" ON card_progress;
CREATE POLICY "Users can read their own progress"
  ON card_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own progress
DROP POLICY IF EXISTS "Users can insert their own progress" ON card_progress;
CREATE POLICY "Users can insert their own progress"
  ON card_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
DROP POLICY IF EXISTS "Users can update their own progress" ON card_progress;
CREATE POLICY "Users can update their own progress"
  ON card_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own progress
DROP POLICY IF EXISTS "Users can delete their own progress" ON card_progress;
CREATE POLICY "Users can delete their own progress"
  ON card_progress FOR DELETE
  USING (auth.uid() = user_id);

