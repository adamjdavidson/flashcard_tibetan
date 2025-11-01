-- Migration: Add user-owned cards support
-- Adds user_id and is_master columns to cards table
-- Updates RLS policies to allow users to manage their own cards

-- Add columns to cards table
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_master BOOLEAN DEFAULT false;

-- Create index for user_id
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_is_master ON cards(is_master);

-- Set existing cards as master cards (user_id = NULL, is_master = true)
UPDATE cards 
SET user_id = NULL, is_master = true 
WHERE user_id IS NULL AND is_master IS NOT true;

-- Drop old RLS policies
DROP POLICY IF EXISTS "Anyone can read cards" ON cards;
DROP POLICY IF EXISTS "Admins can insert cards" ON cards;
DROP POLICY IF EXISTS "Admins can update cards" ON cards;
DROP POLICY IF EXISTS "Admins can delete cards" ON cards;

-- New RLS policies for user-owned cards

-- Users can read master cards (is_master = true) + their own cards
DROP POLICY IF EXISTS "Users can read master and own cards" ON cards;
CREATE POLICY "Users can read master and own cards"
  ON cards FOR SELECT
  USING (
    is_master = true OR  -- Master library cards
    user_id = auth.uid()  -- Own cards
  );

-- Users can insert their own cards
DROP POLICY IF EXISTS "Users can insert own cards" ON cards;
CREATE POLICY "Users can insert own cards"
  ON cards FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND  -- Must be their own
    is_master = false  -- Cannot create master cards directly
  );

-- Users can update their own cards (but cannot change is_master)
DROP POLICY IF EXISTS "Users can update own cards" ON cards;
CREATE POLICY "Users can update own cards"
  ON cards FOR UPDATE
  USING (user_id = auth.uid() AND is_master = false)
  WITH CHECK (
    user_id = auth.uid() AND 
    is_master = false
    -- Note: Users cannot change is_master because WITH CHECK ensures is_master = false
  );

-- Users can delete their own cards
DROP POLICY IF EXISTS "Users can delete own cards" ON cards;
CREATE POLICY "Users can delete own cards"
  ON cards FOR DELETE
  USING (user_id = auth.uid() AND is_master = false);

-- Admins can read all cards
DROP POLICY IF EXISTS "Admins can read all cards" ON cards;
CREATE POLICY "Admins can read all cards"
  ON cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Admins can insert any card (master or user-owned)
DROP POLICY IF EXISTS "Admins can insert any card" ON cards;
CREATE POLICY "Admins can insert any card"
  ON cards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Admins can update any card
DROP POLICY IF EXISTS "Admins can update any card" ON cards;
CREATE POLICY "Admins can update any card"
  ON cards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Admins can delete any card
DROP POLICY IF EXISTS "Admins can delete any card" ON cards;
CREATE POLICY "Admins can delete any card"
  ON cards FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

